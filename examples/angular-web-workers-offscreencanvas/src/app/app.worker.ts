/// <reference lib="webworker" />

addEventListener('message', ({ data }: MessageEvent<number>) => {
  const iterations = data;
  const start = performance.now();
  let result = 0;

  for (let i = 0; i < iterations; i += 1) {
    result += Math.sqrt(i);
  }

  postMessage({
    result,
    elapsedMs: performance.now() - start,
    iterations,
  });
});
