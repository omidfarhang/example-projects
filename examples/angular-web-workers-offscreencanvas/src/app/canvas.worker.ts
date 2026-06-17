/// <reference lib="webworker" />

let animationFrameId = 0;
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let x = 0;
let y = 0;
let frameCount = 0;

addEventListener('message', (event: MessageEvent<{ canvas?: OffscreenCanvas; action?: string }>) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    ctx = canvas.getContext('2d');
    x = 0;
    y = 0;
    frameCount = 0;
    paintBackground();
    return;
  }

  if (event.data.action === 'start') {
    cancelAnimationFrame(animationFrameId);
    draw();
    postMessage({ type: 'status', running: true });
  } else if (event.data.action === 'stop') {
    cancelAnimationFrame(animationFrameId);
    postMessage({ type: 'status', running: false, frameCount });
  }
});

function paintBackground(): void {
  if (!canvas || !ctx) {
    return;
  }

  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(): void {
  if (!canvas || !ctx) {
    return;
  }

  ctx.fillStyle = 'rgba(10, 14, 23, 0.22)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 16;
  ctx.shadowColor = 'rgba(139, 92, 246, 0.65)';
  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(x, y, 48, 48);
  ctx.shadowBlur = 0;

  x += 2.5;
  y += 2.5;
  frameCount += 1;

  if (x > canvas.width) {
    x = 0;
  }
  if (y > canvas.height) {
    y = 0;
  }

  if (frameCount % 30 === 0) {
    postMessage({ type: 'frame', frameCount });
  }

  animationFrameId = requestAnimationFrame(draw);
}
