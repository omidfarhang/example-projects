//! Parser for Linux Pressure Stall Information (PSI) files.
//!
//! See: https://docs.kernel.org/accounting/psi.html

use std::fs;
use std::path::Path;

use thiserror::Error;

#[derive(Debug, Clone, PartialEq)]
pub struct PsiLine {
    pub kind: PsiKind,
    pub avg10: f64,
    pub avg60: f64,
    pub avg300: f64,
    pub total_us: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PsiKind {
    Some,
    Full,
}

#[derive(Debug, Clone, PartialEq)]
pub struct PsiMetrics {
    pub some: Option<PsiLine>,
    pub full: Option<PsiLine>,
}

#[derive(Debug, Error)]
pub enum PsiError {
    #[error("failed to read {path}: {source}")]
    Read {
        path: String,
        source: std::io::Error,
    },
    #[error("PSI not available at {path} (kernel may lack CONFIG_PSI)")]
    NotAvailable { path: String },
    #[error("failed to parse PSI line: {line}")]
    ParseLine { line: String },
    #[error("empty PSI file: {path}")]
    Empty { path: String },
}

impl PsiMetrics {
    pub fn from_path(path: impl AsRef<Path>) -> Result<Self, PsiError> {
        let path = path.as_ref();
        let contents = fs::read_to_string(path).map_err(|source| {
            if source.kind() == std::io::ErrorKind::NotFound {
                PsiError::NotAvailable {
                    path: path.display().to_string(),
                }
            } else {
                PsiError::Read {
                    path: path.display().to_string(),
                    source,
                }
            }
        })?;

        parse_psi_contents(&contents).map_err(|_| PsiError::Empty {
            path: path.display().to_string(),
        })
    }

    /// Primary pressure indicator: `some` avg10, falling back to full avg10.
    pub fn pressure_avg10(&self) -> f64 {
        self.some
            .as_ref()
            .map(|l| l.avg10)
            .or_else(|| self.full.as_ref().map(|l| l.avg10))
            .unwrap_or(0.0)
    }

    pub fn pressure_avg60(&self) -> f64 {
        self.some
            .as_ref()
            .map(|l| l.avg60)
            .or_else(|| self.full.as_ref().map(|l| l.avg60))
            .unwrap_or(0.0)
    }
}

pub fn parse_psi_contents(contents: &str) -> Result<PsiMetrics, PsiError> {
    let mut some = None;
    let mut full = None;

    for line in contents.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let parsed = parse_psi_line(trimmed)?;
        match parsed.kind {
            PsiKind::Some => some = Some(parsed),
            PsiKind::Full => full = Some(parsed),
        }
    }

    if some.is_none() && full.is_none() {
        return Err(PsiError::ParseLine {
            line: "(no valid lines)".to_string(),
        });
    }

    Ok(PsiMetrics { some, full })
}

fn parse_psi_line(line: &str) -> Result<PsiLine, PsiError> {
    let mut parts = line.split_whitespace();
    let kind_str = parts
        .next()
        .ok_or_else(|| PsiError::ParseLine {
            line: line.to_string(),
        })?;

    let kind = match kind_str {
        "some" => PsiKind::Some,
        "full" => PsiKind::Full,
        _ => {
            return Err(PsiError::ParseLine {
                line: line.to_string(),
            });
        }
    };

    let mut avg10 = 0.0_f64;
    let mut avg60 = 0.0_f64;
    let mut avg300 = 0.0_f64;
    let mut total_us = 0_u64;

    for token in parts {
        let (key, value) = token.split_once('=').ok_or_else(|| PsiError::ParseLine {
            line: line.to_string(),
        })?;

        match key {
            "avg10" => avg10 = parse_f64(value, line)?,
            "avg60" => avg60 = parse_f64(value, line)?,
            "avg300" => avg300 = parse_f64(value, line)?,
            "total" => total_us = parse_u64(value, line)?,
            _ => {}
        }
    }

    Ok(PsiLine {
        kind,
        avg10,
        avg60,
        avg300,
        total_us,
    })
}

fn parse_f64(value: &str, line: &str) -> Result<f64, PsiError> {
    value
        .parse()
        .map_err(|_| PsiError::ParseLine {
            line: line.to_string(),
        })
}

fn parse_u64(value: &str, line: &str) -> Result<u64, PsiError> {
    value
        .parse()
        .map_err(|_| PsiError::ParseLine {
            line: line.to_string(),
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_CPU: &str = r#"some avg10=2.50 avg60=1.20 avg300=0.80 total=123456789
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
"#;

    const SAMPLE_IO: &str = r#"some avg10=15.30 avg60=8.10 avg300=3.20 total=9876543210
full avg10=12.00 avg60=6.50 avg300=2.10 total=8765432109
"#;

    const SAMPLE_MEMORY: &str = r#"some avg10=0.00 avg60=0.00 avg300=0.00 total=0
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
"#;

    #[test]
    fn parses_cpu_pressure() {
        let metrics = parse_psi_contents(SAMPLE_CPU).unwrap();
        let some = metrics.some.unwrap();
        assert_eq!(some.kind, PsiKind::Some);
        assert!((some.avg10 - 2.50).abs() < f64::EPSILON);
        assert!((some.avg60 - 1.20).abs() < f64::EPSILON);
        assert_eq!(some.total_us, 123456789);
        assert!(metrics.full.is_some());
    }

    #[test]
    fn parses_io_pressure() {
        let metrics = parse_psi_contents(SAMPLE_IO).unwrap();
        let some = metrics.some.unwrap();
        assert!((some.avg10 - 15.30).abs() < f64::EPSILON);
        let full = metrics.full.unwrap();
        assert!((full.avg10 - 12.00).abs() < f64::EPSILON);
    }

    #[test]
    fn pressure_avg10_prefers_some() {
        let metrics = parse_psi_contents(SAMPLE_IO).unwrap();
        assert!((metrics.pressure_avg10() - 15.30).abs() < f64::EPSILON);
    }

    #[test]
    fn parses_zero_memory_pressure() {
        let metrics = parse_psi_contents(SAMPLE_MEMORY).unwrap();
        assert!((metrics.pressure_avg10() - 0.0).abs() < f64::EPSILON);
    }

    #[test]
    fn rejects_invalid_line() {
        let err = parse_psi_contents("invalid line\n").unwrap_err();
        assert!(matches!(err, PsiError::ParseLine { .. }));
    }
}
