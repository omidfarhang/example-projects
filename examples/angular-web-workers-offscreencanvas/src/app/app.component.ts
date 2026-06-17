import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type ComputeWorkerResult = {
  result: number;
  elapsedMs: number;
  iterations: number;
};

type CanvasWorkerMessage =
  | { type: 'status'; running: boolean; frameCount?: number }
  | { type: 'frame'; frameCount: number };

@Component({
  selector: 'app-root',
  imports: [DecimalPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  computationResult: number | null = null;
  computeElapsedMs: number | null = null;
  computeIterations = 1_000_000;
  computeRunning = false;
  workerMessage = '';
  animationRunning = false;
  frameCount = 0;
  mainThreadTicks = 0;

  private computeWorker?: Worker;
  private canvasWorker?: Worker;
  private pulseTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.pulseTimer = setInterval(() => {
      this.mainThreadTicks += 1;
    }, 100);

    if (typeof Worker === 'undefined') {
      this.workerMessage = 'Web Workers are not supported in this environment.';
      return;
    }

    this.startComputation();

    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement | null;
    if (!canvas) {
      this.workerMessage = 'Canvas element not found.';
      return;
    }

    const offscreen = canvas.transferControlToOffscreen();
    this.canvasWorker = new Worker(new URL('./canvas.worker', import.meta.url));
    this.canvasWorker.onmessage = ({ data }: MessageEvent<CanvasWorkerMessage>) => {
      if (data.type === 'status') {
        this.animationRunning = data.running;
        if (data.frameCount !== undefined) {
          this.frameCount = data.frameCount;
        }
      } else if (data.type === 'frame') {
        this.frameCount = data.frameCount;
      }
    };
    this.canvasWorker.postMessage({ canvas: offscreen }, [offscreen]);
  }

  ngOnDestroy(): void {
    clearInterval(this.pulseTimer);
    this.computeWorker?.terminate();
    this.canvasWorker?.terminate();
  }

  startComputation(): void {
    if (typeof Worker === 'undefined') {
      return;
    }

    this.computeWorker?.terminate();
    this.computationResult = null;
    this.computeElapsedMs = null;
    this.computeRunning = true;

    this.computeWorker = new Worker(new URL('./app.worker', import.meta.url));
    this.computeWorker.onmessage = ({ data }: MessageEvent<ComputeWorkerResult>) => {
      this.computationResult = data.result;
      this.computeElapsedMs = data.elapsedMs;
      this.computeIterations = data.iterations;
      this.computeRunning = false;
    };
    this.computeWorker.onerror = () => {
      this.computeRunning = false;
      this.workerMessage = 'Compute worker failed.';
    };
    this.computeWorker.postMessage(this.computeIterations);
  }

  startAnimation(): void {
    this.canvasWorker?.postMessage({ action: 'start' });
  }

  stopAnimation(): void {
    this.canvasWorker?.postMessage({ action: 'stop' });
  }
}
