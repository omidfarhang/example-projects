//! Turn kernel pressure readings into desktop-oriented explanations.

use crate::sampler::{CgroupVersion, SystemSnapshot};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum PressureLevel {
    Minimal,
    Moderate,
    Elevated,
    Severe,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PressureDomain {
    Cpu,
    Io,
    Memory,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DomainReading {
    pub domain: PressureDomain,
    pub avg10: f64,
    pub avg60: f64,
    pub level: PressureLevel,
    pub available: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Diagnosis {
    pub headline: String,
    pub detail: String,
    pub domains: Vec<DomainReading>,
    pub load_note: Option<String>,
    pub cgroup_note: String,
    pub psi_note: Option<String>,
}

impl Diagnosis {
    pub fn from_snapshot(snapshot: &SystemSnapshot) -> Self {
        let mut domains = vec![
            domain_reading(
                PressureDomain::Cpu,
                snapshot.cpu.as_ref().map(|m| m.pressure_avg10()).unwrap_or(0.0),
                snapshot.cpu.as_ref().map(|m| m.pressure_avg60()).unwrap_or(0.0),
                snapshot.cpu.is_some(),
            ),
            domain_reading(
                PressureDomain::Io,
                snapshot.io.as_ref().map(|m| m.pressure_avg10()).unwrap_or(0.0),
                snapshot.io.as_ref().map(|m| m.pressure_avg60()).unwrap_or(0.0),
                snapshot.io.is_some(),
            ),
            domain_reading(
                PressureDomain::Memory,
                snapshot
                    .memory
                    .as_ref()
                    .map(|m| m.pressure_avg10())
                    .unwrap_or(0.0),
                snapshot
                    .memory
                    .as_ref()
                    .map(|m| m.pressure_avg60())
                    .unwrap_or(0.0),
                snapshot.memory.is_some(),
            ),
        ];

        domains.sort_by(|a, b| {
            b.avg10
                .partial_cmp(&a.avg10)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        let (headline, detail) = build_message(&domains, snapshot);
        let load_note = snapshot.load.as_ref().map(|load| {
            format!(
                "Load average: {:.2} (1m) / {:.2} (5m) / {:.2} (15m), {} runnable of {} tasks",
                load.load_1, load.load_5, load.load_15, load.runnable, load.total
            )
        });

        let cgroup_note = match snapshot.cgroup.version {
            CgroupVersion::V2 => {
                "cgroup v2 unified hierarchy detected (systemd slices use this for resource control)."
                    .to_string()
            }
            CgroupVersion::V1 => {
                "cgroup v1 detected; PSI still applies, but resource limits may be split across controllers."
                    .to_string()
            }
            CgroupVersion::Unknown => {
                "cgroup version could not be determined from /sys/fs/cgroup.".to_string()
            }
        };

        let psi_note = if snapshot.psi_missing.is_empty() {
            None
        } else {
            Some(format!(
                "Missing PSI sources: {}",
                snapshot.psi_missing.join(", ")
            ))
        };

        Self {
            headline,
            detail,
            domains,
            load_note,
            cgroup_note,
            psi_note,
        }
    }
}

fn domain_reading(
    domain: PressureDomain,
    avg10: f64,
    avg60: f64,
    available: bool,
) -> DomainReading {
    DomainReading {
        domain,
        avg10,
        avg60,
        level: classify_pressure(avg10),
        available,
    }
}

pub fn classify_pressure(avg10: f64) -> PressureLevel {
    if avg10 < 1.0 {
        PressureLevel::Minimal
    } else if avg10 < 10.0 {
        PressureLevel::Moderate
    } else if avg10 < 25.0 {
        PressureLevel::Elevated
    } else {
        PressureLevel::Severe
    }
}

fn build_message(domains: &[DomainReading], snapshot: &SystemSnapshot) -> (String, String) {
    let available: Vec<_> = domains.iter().filter(|d| d.available).collect();

    if available.is_empty() {
        return (
            "PSI is unavailable on this kernel.".to_string(),
            "Enable CONFIG_PSI or use a kernel that exposes /proc/pressure/{cpu,io,memory}.".to_string(),
        );
    }

    let top = available[0];
    let second = available.get(1).copied();

    if top.level == PressureLevel::Minimal
        && second.map(|d| d.level == PressureLevel::Minimal).unwrap_or(true)
    {
        let load_hint = snapshot.load.as_ref().and_then(|load| {
            if load.load_1 > 4.0 {
                Some(format!(
                    " Load is {:.2} on the 1-minute average, so CPU contention may still appear even with low PSI.",
                    load.load_1
                ))
            } else {
                None
            }
        });

        return (
            "No significant kernel-reported pressure right now.".to_string(),
            format!(
                "CPU, I/O, and memory PSI averages are all below 1% over the last 10 seconds.{}",
                load_hint.unwrap_or_default()
            ),
        );
    }

    let headline = match top.domain {
        PressureDomain::Cpu => format!(
            "Likely cause: CPU pressure is {} ({:.1}% avg10).",
            level_label(top.level),
            top.avg10
        ),
        PressureDomain::Io => format!(
            "Likely cause: I/O pressure is {} ({:.1}% avg10).",
            level_label(top.level),
            top.avg10
        ),
        PressureDomain::Memory => format!(
            "Likely cause: memory pressure is {} ({:.1}% avg10).",
            level_label(top.level),
            top.avg10
        ),
    };

    let detail = match top.domain {
        PressureDomain::Cpu => cpu_detail(top, second),
        PressureDomain::Io => io_detail(top, second),
        PressureDomain::Memory => memory_detail(top, second),
    };

    (headline, detail)
}

fn level_label(level: PressureLevel) -> &'static str {
    match level {
        PressureLevel::Minimal => "minimal",
        PressureLevel::Moderate => "moderate",
        PressureLevel::Elevated => "elevated",
        PressureLevel::Severe => "severe",
    }
}

fn cpu_detail(top: &DomainReading, second: Option<&DomainReading>) -> String {
    let mut detail = String::from(
        "Runnable tasks are waiting for CPU time. Compositors, games, and build tools compete for the same cores; tail latency shows up as mouse lag or frame drops even when average CPU usage looks fine.",
    );

    if let Some(other) = second {
        if other.level >= PressureLevel::Moderate && other.avg10 >= top.avg10 * 0.5 {
            detail.push_str(&format!(
                " {} pressure is also notable at {:.1}%.",
                domain_name(other.domain),
                other.avg10
            ));
        }
    }

    detail
}

fn io_detail(_top: &DomainReading, second: Option<&DomainReading>) -> String {
    let mut detail = String::from(
        "Tasks are stalling on storage. Package updates, indexing, backups, or btrfs maintenance can make the desktop feel slow while CPU meters stay low.",
    );

    if let Some(other) = second {
        if other.domain == PressureDomain::Memory && other.level >= PressureLevel::Moderate {
            detail.push_str(
                " Memory pressure may be forcing reclaim and pushing more I/O to disk.",
            );
        }
    }

    detail
}

fn memory_detail(_top: &DomainReading, second: Option<&DomainReading>) -> String {
    let mut detail = String::from(
        "The kernel is spending time reclaiming or waiting on memory. Swap, zram, or large browser tabs can create stutter that looks like random desktop freezes.",
    );

    if let Some(other) = second {
        if other.domain == PressureDomain::Io && other.level >= PressureLevel::Moderate {
            detail.push_str(" Elevated I/O pressure often follows memory reclaim.");
        }
    }

    detail
}

fn domain_name(domain: PressureDomain) -> &'static str {
    match domain {
        PressureDomain::Cpu => "CPU",
        PressureDomain::Io => "I/O",
        PressureDomain::Memory => "Memory",
    }
}

pub fn level_color(level: PressureLevel) -> ratatui::style::Color {
    use ratatui::style::Color;
    match level {
        PressureLevel::Minimal => Color::Green,
        PressureLevel::Moderate => Color::Yellow,
        PressureLevel::Elevated => Color::LightRed,
        PressureLevel::Severe => Color::Red,
    }
}

pub fn domain_label(domain: PressureDomain) -> &'static str {
    match domain {
        PressureDomain::Cpu => "CPU",
        PressureDomain::Io => "I/O",
        PressureDomain::Memory => "Memory",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::psi::{PsiKind, PsiLine, PsiMetrics};
    use crate::sampler::{CgroupInfo, LoadAverage, SystemSnapshot};

    fn psi(avg10: f64) -> PsiMetrics {
        PsiMetrics {
            some: Some(PsiLine {
                kind: PsiKind::Some,
                avg10,
                avg60: avg10 * 0.8,
                avg300: avg10 * 0.5,
                total_us: 1,
            }),
            full: None,
        }
    }

    fn snapshot(cpu: f64, io: f64, mem: f64) -> SystemSnapshot {
        SystemSnapshot {
            cpu: Some(psi(cpu)),
            io: Some(psi(io)),
            memory: Some(psi(mem)),
            load: Some(LoadAverage {
                load_1: 1.0,
                load_5: 1.0,
                load_15: 1.0,
                runnable: 1,
                total: 100,
                last_pid: 1,
            }),
            uptime_secs: Some(1000.0),
            cgroup: CgroupInfo {
                version: CgroupVersion::V2,
                unified_hierarchy: true,
            },
            psi_missing: vec![],
        }
    }

    #[test]
    fn classifies_pressure_levels() {
        assert_eq!(classify_pressure(0.5), PressureLevel::Minimal);
        assert_eq!(classify_pressure(5.0), PressureLevel::Moderate);
        assert_eq!(classify_pressure(15.0), PressureLevel::Elevated);
        assert_eq!(classify_pressure(30.0), PressureLevel::Severe);
    }

    #[test]
    fn picks_io_as_primary_cause() {
        let diagnosis = Diagnosis::from_snapshot(&snapshot(0.5, 18.0, 1.0));
        assert!(diagnosis.headline.contains("I/O pressure"));
        assert!(diagnosis.headline.contains("elevated"));
    }

    #[test]
    fn reports_calm_system() {
        let diagnosis = Diagnosis::from_snapshot(&snapshot(0.2, 0.1, 0.0));
        assert!(diagnosis.headline.contains("No significant"));
    }
}
