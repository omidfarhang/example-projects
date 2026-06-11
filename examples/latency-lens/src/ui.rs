//! Terminal UI for live pressure monitoring.

use std::io::{self, stdout};
use std::time::{Duration, Instant};

use crossterm::event::{self, Event, KeyCode, KeyEventKind};
use crossterm::terminal::{
    disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen,
};
use crossterm::ExecutableCommand;
use ratatui::layout::{Constraint, Direction, Layout, Margin};
use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};
use ratatui::widgets::{Block, Borders, Gauge, Paragraph, Wrap};
use ratatui::Frame;
use ratatui::Terminal;

use crate::diagnosis::{domain_label, level_color, Diagnosis, PressureLevel};
use crate::sampler::{PressureSampler, SystemSnapshot};

pub struct UiOptions {
    pub interval: Duration,
}

pub fn run_once(snapshot: &SystemSnapshot, diagnosis: &Diagnosis) {
    println!("Latency Lens — kernel pressure snapshot\n");

    for reading in &diagnosis.domains {
        let status = if reading.available {
            format!(
                "{:.2}% avg10 | {:.2}% avg60 | {:?}",
                reading.avg10, reading.avg60, reading.level
            )
        } else {
            "unavailable".to_string()
        };
        println!("  {}: {}", domain_label(reading.domain), status);
    }

    if let Some(load) = &diagnosis.load_note {
        println!("\n{load}");
    }

    if let Some(uptime) = snapshot.uptime_secs {
        let hours = (uptime / 3600.0) as u64;
        let minutes = ((uptime % 3600.0) / 60.0) as u64;
        println!("Uptime: {hours}h {minutes}m");
    }

    println!("\n{}\n{}", diagnosis.headline, diagnosis.detail);
    println!("{}", diagnosis.cgroup_note);

    if let Some(note) = &diagnosis.psi_note {
        println!("\n{note}");
    }
}

pub fn run_tui<S: PressureSampler>(
    sampler: &S,
    options: &UiOptions,
) -> io::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;

    let backend = ratatui::backend::CrosstermBackend::new(stdout());
    let mut terminal = Terminal::new(backend)?;
    let mut last_tick = Instant::now();
    let mut snapshot = sampler.sample().map_err(map_sample_err)?;
    let mut diagnosis = Diagnosis::from_snapshot(&snapshot);

    loop {
        terminal.draw(|frame| draw(frame, &snapshot, &diagnosis))?;

        let timeout = options
            .interval
            .checked_sub(last_tick.elapsed())
            .unwrap_or(Duration::ZERO);

        if event::poll(timeout)? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => break,
                        KeyCode::Char('r') => {
                            snapshot = sampler.sample().map_err(map_sample_err)?;
                            diagnosis = Diagnosis::from_snapshot(&snapshot);
                        }
                        _ => {}
                    }
                }
            }
        }

        if last_tick.elapsed() >= options.interval {
            snapshot = sampler.sample().map_err(map_sample_err)?;
            diagnosis = Diagnosis::from_snapshot(&snapshot);
            last_tick = Instant::now();
        }
    }

    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}

fn map_sample_err(err: crate::sampler::SampleError) -> io::Error {
    io::Error::new(io::ErrorKind::Other, err.to_string())
}

fn draw(frame: &mut Frame, snapshot: &SystemSnapshot, diagnosis: &Diagnosis) {
    let area = frame.area();
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Length(10),
            Constraint::Min(6),
            Constraint::Length(3),
        ])
        .split(area);

    let header = Paragraph::new(Line::from(vec![
        Span::styled(
            "Latency Lens",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ),
        Span::raw(" — kernel pressure for desktop stutter"),
    ]))
    .block(Block::default().borders(Borders::ALL).title("Overview"));
    frame.render_widget(header, chunks[0]);

    let gauge_area = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Length(3),
            Constraint::Length(3),
        ])
        .split(chunks[1].inner(Margin {
            vertical: 0,
            horizontal: 1,
        }));

    for (idx, reading) in diagnosis.domains.iter().enumerate() {
        let label = domain_label(reading.domain);
        let ratio = (reading.avg10 / 100.0).clamp(0.0, 1.0) as f64;
        let color = if reading.available {
            level_color(reading.level)
        } else {
            Color::DarkGray
        };

        let gauge = Gauge::default()
            .block(Block::default().title(label).borders(Borders::ALL))
            .gauge_style(Style::default().fg(color))
            .ratio(ratio)
            .label(format!(
                "{} avg10={:.2}% avg60={:.2}%",
                if reading.available {
                    level_text(reading.level)
                } else {
                    "n/a".to_string()
                },
                reading.avg10,
                reading.avg60
            ));

        frame.render_widget(gauge, gauge_area[idx]);
    }

    let meta = build_meta_lines(snapshot, diagnosis);
    let body = Paragraph::new(meta)
        .wrap(Wrap { trim: true })
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title("Diagnosis"),
        );
    frame.render_widget(body, chunks[2]);

    let footer = Paragraph::new("q quit · r refresh · PSI from /proc/pressure/*")
        .style(Style::default().fg(Color::DarkGray))
        .block(Block::default().borders(Borders::ALL));
    frame.render_widget(footer, chunks[3]);
}

fn build_meta_lines(snapshot: &SystemSnapshot, diagnosis: &Diagnosis) -> Vec<Line<'static>> {
    let mut lines = vec![
        Line::from(Span::styled(
            diagnosis.headline.clone(),
            Style::default().add_modifier(Modifier::BOLD),
        )),
        Line::from(diagnosis.detail.clone()),
    ];

    if let Some(load) = &diagnosis.load_note {
        lines.push(Line::from(""));
        lines.push(Line::from(load.clone()));
    }

    if let Some(uptime) = snapshot.uptime_secs {
        let hours = (uptime / 3600.0) as u64;
        let minutes = ((uptime % 3600.0) / 60.0) as u64;
        lines.push(Line::from(format!("Uptime: {hours}h {minutes}m")));
    }

    lines.push(Line::from(diagnosis.cgroup_note.clone()));

    if let Some(note) = &diagnosis.psi_note {
        lines.push(Line::from(Span::styled(
            note.clone(),
            Style::default().fg(Color::Yellow),
        )));
    }

    lines
}

fn level_text(level: PressureLevel) -> String {
    match level {
        PressureLevel::Minimal => "minimal".to_string(),
        PressureLevel::Moderate => "moderate".to_string(),
        PressureLevel::Elevated => "elevated".to_string(),
        PressureLevel::Severe => "severe".to_string(),
    }
}
