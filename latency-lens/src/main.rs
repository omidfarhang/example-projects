mod diagnosis;
mod psi;
mod sampler;
mod ui;

use std::process;
use std::time::Duration;

use clap::Parser;
use diagnosis::Diagnosis;
use sampler::{EbpfSampler, PressureSampler, ProcSampler};
use ui::{run_once, run_tui, UiOptions};

#[derive(Debug, Parser)]
#[command(
    name = "latency-lens",
    about = "Read Linux kernel pressure signals and explain desktop stutter",
    version
)]
struct Cli {
    /// Print one snapshot and exit (no TUI).
    #[arg(long)]
    once: bool,

    /// Refresh interval for the live TUI (milliseconds).
    #[arg(long, default_value_t = 500)]
    interval_ms: u64,

    /// Reserved: future eBPF scheduler tracepoint mode (not implemented).
    #[arg(long, hide = true)]
    experimental_ebpf: bool,
}

fn main() {
    let cli = Cli::parse();

    if cli.experimental_ebpf {
        let err = EbpfSampler.try_sample().expect_err("eBPF should be unavailable");
        eprintln!("error: {err}");
        process::exit(2);
    }

    let sampler = ProcSampler;
    let snapshot = match sampler.sample() {
        Ok(snapshot) => snapshot,
        Err(err) => {
            eprintln!("error: failed to sample system: {err}");
            process::exit(1);
        }
    };

    let diagnosis = Diagnosis::from_snapshot(&snapshot);

    if cli.once {
        run_once(&snapshot, &diagnosis);
        return;
    }

    let options = UiOptions {
        interval: Duration::from_millis(cli.interval_ms),
    };

    if let Err(err) = run_tui(&sampler, &options) {
        eprintln!("error: {err}");
        process::exit(1);
    }
}
