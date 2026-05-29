/// <reference lib="webworker" />

addEventListener('message', ({ data }: MessageEvent<number>) => {
  const result = performHeavyComputation(data);
  postMessage(result);
});

function performHeavyComputation(data: number): number {
  let result = 0;
  for (let i = 0; i < data; i++) {
    result += Math.sqrt(i);
  }
  return result;
}
