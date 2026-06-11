# Latency Lens

Companion project for [Building a Tiny Linux App to Explain Desktop Stutter](https://omid.dev/2026/06/04/building-a-tiny-linux-app-to-explain-desktop-stutter/)

A tiny Rust app that reads Linux **Pressure Stall Information (PSI)** and turns kernel signals into a desktop-oriented explanation. No root required.

## What It Shows

- **CPU pressure** — runnable tasks waiting for CPU time
- **I/O pressure** — tasks stalled on storage
- **Memory pressure** — reclaim/swap pressure that can cause freezes
- **Load average** and **uptime** for context
- **cgroup v2 detection** — whether the unified hierarchy is present

The app answers a practical question: when the desktop stutters but CPU meters look fine, which kernel resource is actually under stress?

## Requirements

- Linux with PSI enabled (`CONFIG_PSI`)
- Rust 1.74+ (2021 edition)
- A terminal that supports alternate screen mode (for the live TUI)

PSI files must exist:

```text
/proc/pressure/cpu
/proc/pressure/io
/proc/pressure/memory
```

Most modern desktop kernels (5.x+) expose these. If they are missing, `--once` will report which sources are unavailable.

## Build

```bash
cd latency-lens
cargo build --release
```

## Run

One-shot snapshot (good for scripts and first try):

```bash
cargo run -- --once
```

Live terminal UI (default refresh: 500 ms):

```bash
cargo run
```

Custom refresh interval:

```bash
cargo run -- --interval-ms 1000
```

Release binary:

```bash
./target/release/latency-lens --once
```

### TUI Keys

| Key | Action |
| --- | --- |
| `q` / `Esc` | Quit |
| `r` | Refresh now |

## Kernel Interfaces Used

| Path | Purpose |
| --- | --- |
| `/proc/pressure/cpu` | CPU scheduling pressure |
| `/proc/pressure/io` | Block I/O stall pressure |
| `/proc/pressure/memory` | Memory reclaim pressure |
| `/proc/loadavg` | Runnable tasks and load averages |
| `/proc/uptime` | System uptime |
| `/sys/fs/cgroup` | cgroup v1/v2 detection |

No eBPF, no root, no special capabilities. The app only reads pseudo-files the kernel already exposes to users.

## Architecture

```text
latency-lens/
  src/
    main.rs       CLI entry
    psi.rs        PSI file parser
    sampler.rs    /proc and /sys collection + PressureSampler trait
    diagnosis.rs  Human-readable stutter explanations
    ui.rs         TUI and --once output
```

The `PressureSampler` trait keeps the door open for a future eBPF-backed sampler without changing the UI or diagnosis layers.

## Optional eBPF Direction (Not Implemented)

Version 1 deliberately avoids eBPF so readers can run it immediately.

A future `--experimental-ebpf` mode could attach scheduler tracepoints (wakeup latency, runtime delays) and feed richer tail-latency data into the same diagnosis pipeline. The placeholder fails gracefully today:

```bash
cargo run -- --experimental-ebpf
# error: eBPF mode is not implemented yet...
```

## Tests

```bash
cargo test
```

Parser tests use sample PSI text. One integration test reads live `/proc/loadavg` when running on Linux.

## Related Article

[Building a Tiny Linux App to Explain Desktop Stutter](https://omid.dev/2026/06/04/building-a-tiny-linux-app-to-explain-desktop-stutter/)

## License

MIT — same as the [example-projects](https://github.com/omidfarhang/example-projects) repository.
