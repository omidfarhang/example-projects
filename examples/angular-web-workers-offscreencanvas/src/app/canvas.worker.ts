/// <reference lib="webworker" />

let animationFrameId = 0;
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let x = 0;
let y = 0;

addEventListener('message', (event: MessageEvent<{ canvas?: OffscreenCanvas; action?: string }>) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    ctx = canvas.getContext('2d');
    x = 0;
    y = 0;
    return;
  }

  if (event.data.action === 'start') {
    draw();
  } else if (event.data.action === 'stop') {
    cancelAnimationFrame(animationFrameId);
  }
});

function draw(): void {
  if (!canvas || !ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'blue';
  ctx.fillRect(x, y, 50, 50);

  x += 2;
  y += 2;

  if (x > canvas.width) {
    x = 0;
  }
  if (y > canvas.height) {
    y = 0;
  }

  animationFrameId = requestAnimationFrame(draw);
}
