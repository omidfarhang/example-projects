//! System snapshot collection from /proc and /sys.

use std::fs;
use std::path::Path;

use thiserror::Error;

use crate::psi::{PsiError, PsiMetrics};

const PSI_CPU: &str = "/proc/pressure/cpu";
const PSI_IO: &str = "/proc/pressure/io";
const PSI_MEMORY: &str = "/proc/pressure/memory";
const LOADAVG: &str = "/proc/loadavg";
const UPTIME: &str = "/proc/uptime";
const CGROUP_ROOT: &str = "/sys/fs/cgroup";

#[derive(Debug, Clone, PartialEq)]
pub struct LoadAverage {
    pub load_1: f64,
    pub load_5: f64,
    pub load_15: f64,
    pub runnable: u32,
    pub total: u32,
    pub last_pid: u32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct CgroupInfo {
    pub version: CgroupVersion,
    pub unified_hierarchy: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CgroupVersion {
    V1,
    V2,
    Unknown,
}

#[derive(Debug, Clone, PartialEq)]
pub struct SystemSnapshot {
    pub cpu: Option<PsiMetrics>,
    pub io: Option<PsiMetrics>,
    pub memory: Option<PsiMetrics>,
    pub load: Option<LoadAverage>,
    pub uptime_secs: Option<f64>,
    pub cgroup: CgroupInfo,
    pub psi_missing: Vec<String>,
}

#[derive(Debug, Error)]
pub enum SampleError {
    #[error("{0}")]
    Psi(#[from] PsiError),
    #[error("failed to read load average: {0}")]
    LoadAvg(#[from] std::io::Error),
}

/// Collects kernel pressure and system context without root privileges.
pub trait PressureSampler: Send + Sync {
    fn sample(&self) -> Result<SystemSnapshot, SampleError>;
}

#[derive(Debug, Default, Clone, Copy)]
pub struct ProcSampler;

impl PressureSampler for ProcSampler {
    fn sample(&self) -> Result<SystemSnapshot, SampleError> {
        collect_snapshot()
    }
}

pub fn collect_snapshot() -> Result<SystemSnapshot, SampleError> {
    let mut psi_missing = Vec::new();

    let cpu = read_psi(PSI_CPU, &mut psi_missing);
    let io = read_psi(PSI_IO, &mut psi_missing);
    let memory = read_psi(PSI_MEMORY, &mut psi_missing);

    let load = read_loadavg().ok();
    let uptime_secs = read_uptime().ok();
    let cgroup = detect_cgroup();

    Ok(SystemSnapshot {
        cpu,
        io,
        memory,
        load,
        uptime_secs,
        cgroup,
        psi_missing,
    })
}

fn read_psi(path: &str, missing: &mut Vec<String>) -> Option<PsiMetrics> {
    match PsiMetrics::from_path(path) {
        Ok(metrics) => Some(metrics),
        Err(PsiError::NotAvailable { path }) => {
            missing.push(path);
            None
        }
        Err(PsiError::Read { path, .. }) => {
            missing.push(path);
            None
        }
        Err(err) => {
            missing.push(format!("{path}: {err}"));
            None
        }
    }
}

pub fn read_loadavg() -> Result<LoadAverage, std::io::Error> {
    let contents = fs::read_to_string(LOADAVG)?;
    parse_loadavg(&contents).ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::InvalidData, "invalid loadavg format")
    })
}

pub fn parse_loadavg(contents: &str) -> Option<LoadAverage> {
    let mut parts = contents.split_whitespace();
    let load_1 = parts.next()?.parse().ok()?;
    let load_5 = parts.next()?.parse().ok()?;
    let load_15 = parts.next()?.parse().ok()?;

    let tasks = parts.next()?;
    let (runnable, total) = tasks.split_once('/')?;
    let runnable = runnable.parse().ok()?;
    let total = total.parse().ok()?;
    let last_pid = parts.next()?.parse().ok()?;

    Some(LoadAverage {
        load_1,
        load_5,
        load_15,
        runnable,
        total,
        last_pid,
    })
}

pub fn read_uptime() -> Result<f64, std::io::Error> {
    let contents = fs::read_to_string(UPTIME)?;
    parse_uptime(&contents).ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::InvalidData, "invalid uptime format")
    })
}

pub fn parse_uptime(contents: &str) -> Option<f64> {
    contents.split_whitespace().next()?.parse().ok()
}

pub fn detect_cgroup() -> CgroupInfo {
    let cgroup2_events = Path::new(CGROUP_ROOT).join("cgroup.controllers");
    let unified = cgroup2_events.exists();

    let version = if unified {
        CgroupVersion::V2
    } else if Path::new("/sys/fs/cgroup/memory").exists()
        || Path::new("/sys/fs/cgroup/cpu").exists()
    {
        CgroupVersion::V1
    } else {
        CgroupVersion::Unknown
    };

    CgroupInfo {
        version,
        unified_hierarchy: unified,
    }
}

/// Placeholder for a future eBPF-backed sampler (scheduler wakeup/runtime latency).
#[derive(Debug, Default, Clone, Copy)]
pub struct EbpfSampler;

impl EbpfSampler {
    pub fn try_sample(&self) -> Result<(), EbpfUnavailable> {
        Err(EbpfUnavailable)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EbpfUnavailable;

impl std::fmt::Display for EbpfUnavailable {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "eBPF mode is not implemented yet. \
             Future versions may attach scheduler tracepoints for wakeup/runtime latency."
        )
    }
}

impl std::error::Error for EbpfUnavailable {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_loadavg() {
        let load = parse_loadavg("2.50 1.80 1.20 3/512 12345\n").unwrap();
        assert!((load.load_1 - 2.50).abs() < f64::EPSILON);
        assert!((load.load_5 - 1.80).abs() < f64::EPSILON);
        assert_eq!(load.runnable, 3);
        assert_eq!(load.total, 512);
        assert_eq!(load.last_pid, 12345);
    }

    #[test]
    fn parses_uptime() {
        let uptime = parse_uptime("123456.78 987654.32\n").unwrap();
        assert!((uptime - 123456.78).abs() < f64::EPSILON);
    }

    #[test]
    fn live_snapshot_collects_on_linux() {
        if !Path::new("/proc/loadavg").exists() {
            return;
        }

        let snapshot = collect_snapshot().expect("snapshot should succeed on Linux");
        assert!(snapshot.load.is_some());
        assert!(snapshot.uptime_secs.is_some());
    }
}
