import init, { sum_squares } from './pkg/rust_wasm_performance_demo.js';

const TIE_ABSOLUTE_MS = 0.08;
const TIE_RELATIVE = 0.04;
/** Rust takes u32 — hard ceiling for iteration count (~4.29 billion). */
const MAX_ITERATIONS = 4_294_967_295;

const runButton = document.getElementById('run');
const moduleStatus = document.getElementById('moduleStatus');
const resultsPanel = document.getElementById('resultsPanel');
const runStatus = document.getElementById('runStatus');
const speedupCard = document.getElementById('speedupCard');
const speedupValue = document.getElementById('speedupValue');
const speedupDetail = document.getElementById('speedupDetail');
const compareChart = document.getElementById('compareChart');
const jsBar = document.getElementById('jsBar');
const wasmBar = document.getElementById('wasmBar');
const jsTime = document.getElementById('jsTime');
const wasmTime = document.getElementById('wasmTime');
const resultDetails = document.getElementById('resultDetails');
const iterationCount = document.getElementById('iterationCount');
const jsResult = document.getElementById('jsResult');
const wasmResult = document.getElementById('wasmResult');
const resultsMatch = document.getElementById('resultsMatch');
const jsSamples = document.getElementById('jsSamples');
const wasmSamples = document.getElementById('wasmSamples');
const timingMethod = document.getElementById('timingMethod');
const timeDifference = document.getElementById('timeDifference');
const workloadOptions = document.querySelectorAll('.workload-option');

let iterations = 5_000_000;
let wasmReady = false;
let benchmarkRunning = false;

function jsSumSquares(n) {
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    total += i * i;
  }
  return total;
}

function getBenchmarkConfig(n) {
  if (n >= 1_000_000_000) {
    return {
      sampleCount: 1,
      mode: 'blocked',
      description:
        '1 timed run per runtime (WASM first, then JS) after warmup — extreme workload; expect the tab to freeze for a long time.',
    };
  }

  if (n >= 50_000_000) {
    return {
      sampleCount: 3,
      mode: 'blocked',
      description:
        '3 timed runs per runtime (WASM block first, then JS block) after warmup — avoids thermal bias from back-to-back heavy loops.',
    };
  }

  if (n >= 10_000_000) {
    return {
      sampleCount: 3,
      mode: 'alternating',
      description:
        '3 alternating JS/WASM rounds after warmup; fastest run per runtime wins.',
    };
  }

  return {
    mode: 'classic',
    description:
      'Single timed run per runtime (JavaScript, then WASM) — same method as the original blog demo. No warmup, so this shows the typical first-run gap before V8 fully optimizes the JS loop.',
  };
}

function yieldToBrowser() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function formatMs(ms) {
  return `${ms.toFixed(3)} ms`;
}

function formatSampleRange(times) {
  const min = Math.min(...times);
  const max = Math.max(...times);
  return `${formatMs(min)} – ${formatMs(max)} (${times.length} runs)`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return String(value);
}

function resultsAreEqual(a, b) {
  if (a === b) {
    return true;
  }

  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) <= scale * 1e-9;
}

function isEffectivelyTied(jsMs, wasmMs) {
  const diff = Math.abs(jsMs - wasmMs);
  const avg = (jsMs + wasmMs) / 2;
  return diff <= TIE_ABSOLUTE_MS || diff / avg <= TIE_RELATIVE;
}

function compareTimings(jsMs, wasmMs) {
  const diffMs = jsMs - wasmMs;
  const avg = (jsMs + wasmMs) / 2;
  const diffPct = avg > 0 ? (Math.abs(diffMs) / avg) * 100 : 0;

  if (isEffectivelyTied(jsMs, wasmMs)) {
    return {
      kind: 'tied',
      diffMs,
      diffPct,
    };
  }

  if (wasmMs < jsMs) {
    return {
      kind: 'wasm',
      speedup: jsMs / wasmMs,
      diffMs,
      diffPct,
    };
  }

  return {
    kind: 'js',
    speedup: wasmMs / jsMs,
    diffMs,
    diffPct,
  };
}

function setRunStatus(message, running = false) {
  runStatus.textContent = message;
  runStatus.classList.toggle('run-status--running', running);
}

function setModuleStatus(message, state = 'loading') {
  moduleStatus.textContent = message;
  moduleStatus.classList.remove('module-status--ready', 'module-status--error');

  if (state === 'ready') {
    moduleStatus.classList.add('module-status--ready');
  } else if (state === 'error') {
    moduleStatus.classList.add('module-status--error');
  }
}

function updateRunButtonState() {
  runButton.disabled = !wasmReady || benchmarkRunning;
}

function selectWorkload(option) {
  workloadOptions.forEach((button) => {
    const isActive = button === option;
    button.classList.toggle('workload-option--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  iterations = Number(option.dataset.iterations);

  if (iterations > MAX_ITERATIONS) {
    iterations = MAX_ITERATIONS;
  }
}

workloadOptions.forEach((option) => {
  option.addEventListener('click', () => {
    if (!benchmarkRunning) {
      selectWorkload(option);
    }
  });
});

async function loadWasm() {
  try {
    await init();
    wasmReady = true;
    setModuleStatus('Rust WASM module loaded and ready.', 'ready');
  } catch (error) {
    setModuleStatus(
      'Could not load WASM. Run `wasm-pack build --target web --out-dir web/pkg` first.',
      'error',
    );
    console.error(error);
  } finally {
    updateRunButtonState();
  }
}

async function timeRuns(fn, sampleCount) {
  const times = [];
  let value = 0;

  for (let i = 0; i < sampleCount; i += 1) {
    const start = performance.now();
    value = fn();
    times.push(performance.now() - start);

    if (i < sampleCount - 1) {
      await yieldToBrowser();
    }
  }

  return {
    bestMs: Math.min(...times),
    times,
    value,
  };
}

function benchmarkClassic() {
  let start = performance.now();
  const jsValue = jsSumSquares(iterations);
  const jsMs = performance.now() - start;

  start = performance.now();
  const wasmValue = sum_squares(iterations);
  const wasmMs = performance.now() - start;

  return {
    jsMs,
    wasmMs,
    jsValue,
    wasmValue,
    jsTimeSamples: [jsMs],
    wasmTimeSamples: [wasmMs],
  };
}

async function benchmarkAlternating(sampleCount) {
  const jsTimes = [];
  const wasmTimes = [];
  let jsValue = 0;
  let wasmValue = 0;

  for (let i = 0; i < sampleCount; i += 1) {
    if (i % 2 === 0) {
      let start = performance.now();
      jsValue = jsSumSquares(iterations);
      jsTimes.push(performance.now() - start);

      start = performance.now();
      wasmValue = sum_squares(iterations);
      wasmTimes.push(performance.now() - start);
    } else {
      let start = performance.now();
      wasmValue = sum_squares(iterations);
      wasmTimes.push(performance.now() - start);

      start = performance.now();
      jsValue = jsSumSquares(iterations);
      jsTimes.push(performance.now() - start);
    }

    if (i < sampleCount - 1) {
      await yieldToBrowser();
    }
  }

  return {
    jsMs: Math.min(...jsTimes),
    wasmMs: Math.min(...wasmTimes),
    jsTimeSamples: jsTimes,
    wasmTimeSamples: wasmTimes,
    jsValue,
    wasmValue,
  };
}

async function benchmarkBlocked(sampleCount) {
  setRunStatus('Measuring Rust WASM…', true);
  const wasm = await timeRuns(() => sum_squares(iterations), sampleCount);

  await yieldToBrowser();

  setRunStatus('Measuring JavaScript…', true);
  const js = await timeRuns(() => jsSumSquares(iterations), sampleCount);

  return {
    jsMs: js.bestMs,
    wasmMs: wasm.bestMs,
    jsTimeSamples: js.times,
    wasmTimeSamples: wasm.times,
    jsValue: js.value,
    wasmValue: wasm.value,
  };
}

async function benchmarkBoth() {
  const config = getBenchmarkConfig(iterations);

  if (config.mode === 'classic') {
    return benchmarkClassic();
  }

  jsSumSquares(iterations);
  sum_squares(iterations);
  await yieldToBrowser();

  if (config.mode === 'blocked') {
    return benchmarkBlocked(config.sampleCount);
  }

  return benchmarkAlternating(config.sampleCount);
}

function renderResults({ jsMs, wasmMs, jsValue, wasmValue, jsTimeSamples, wasmTimeSamples }) {
  const config = getBenchmarkConfig(iterations);
  const comparison = compareTimings(jsMs, wasmMs);
  const maxMs = Math.max(jsMs, wasmMs, 1);
  const match = resultsAreEqual(jsValue, wasmValue);

  jsTime.textContent = formatMs(jsMs);
  wasmTime.textContent = formatMs(wasmMs);
  jsBar.style.width = `${(jsMs / maxMs) * 100}%`;
  wasmBar.style.width = `${(wasmMs / maxMs) * 100}%`;

  if (comparison.kind === 'wasm') {
    speedupValue.textContent = `${comparison.speedup.toFixed(2)}×`;
    speedupDetail.textContent = `Rust WASM was ${formatMs(Math.abs(comparison.diffMs))} faster (${comparison.diffPct.toFixed(1)}% less time).`;
  } else if (comparison.kind === 'js') {
    speedupValue.textContent = `${comparison.speedup.toFixed(2)}×`;
    speedupDetail.textContent =
      `JavaScript was ${formatMs(Math.abs(comparison.diffMs))} faster (${comparison.diffPct.toFixed(1)}% less time). ` +
      'V8 can auto-vectorize simple loops like this; WASM still wins on many heavier workloads.';
  } else {
    speedupValue.textContent = '~1×';
    speedupDetail.textContent =
      `Effectively tied — only ${formatMs(Math.abs(comparison.diffMs))} apart (${comparison.diffPct.toFixed(1)}%). ` +
      'On modern browsers, a tight numeric loop can be similarly fast in JS and WASM.';
  }

  iterationCount.textContent = iterations.toLocaleString();
  jsResult.textContent = formatNumber(jsValue);
  wasmResult.textContent = formatNumber(wasmValue);
  jsSamples.textContent = formatSampleRange(jsTimeSamples);
  wasmSamples.textContent = formatSampleRange(wasmTimeSamples);
  timingMethod.textContent = config.description;
  timeDifference.textContent =
    comparison.kind === 'tied'
      ? `${formatMs(Math.abs(comparison.diffMs))} (${comparison.diffPct.toFixed(1)}% — within noise)`
      : `${formatMs(Math.abs(comparison.diffMs))} (${comparison.diffPct.toFixed(1)}%)`;

  const matchRow = resultsMatch.closest('.result-details__item');
  matchRow.classList.remove('result-details__item--match', 'result-details__item--mismatch');
  if (match) {
    resultsMatch.textContent = 'Yes — both implementations agree';
    matchRow.classList.add('result-details__item--match');
  } else {
    resultsMatch.textContent = 'No — results differ (unexpected)';
    matchRow.classList.add('result-details__item--mismatch');
  }

  speedupCard.hidden = false;
  compareChart.hidden = false;
  resultDetails.hidden = false;

  if (comparison.kind === 'tied') {
    setRunStatus(
      `Benchmark complete. Effectively tied for ${iterations.toLocaleString()} iterations.`,
    );
  } else {
    const winner = comparison.kind === 'wasm' ? 'Rust WASM' : 'JavaScript';
    setRunStatus(`Benchmark complete. ${winner} was faster for ${iterations.toLocaleString()} iterations.`);
  }
}

runButton.addEventListener('click', async () => {
  if (!wasmReady || benchmarkRunning) {
    return;
  }

  benchmarkRunning = true;
  updateRunButtonState();
  resultsPanel.hidden = false;
  speedupCard.hidden = true;
  compareChart.hidden = true;
  resultDetails.hidden = true;
  jsBar.style.width = '0%';
  wasmBar.style.width = '0%';

  setRunStatus('Preparing benchmark…', true);
  await init();

  setRunStatus('Running benchmark…', true);
  const results = await benchmarkBoth();
  renderResults(results);

  benchmarkRunning = false;
  updateRunButtonState();
});

loadWasm();
