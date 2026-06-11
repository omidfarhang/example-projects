import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  computationResult: number | null = null;
  workerMessage = '';

  private computeWorker?: Worker;
  private canvasWorker?: Worker;

  ngOnInit(): void {
    if (typeof Worker === 'undefined') {
      this.workerMessage = 'Web Workers are not supported in this environment.';
      return;
    }

    this.computeWorker = new Worker(new URL('./app.worker', import.meta.url));
    this.computeWorker.onmessage = ({ data }: MessageEvent<number>) => {
      this.computationResult = data;
    };
    this.computeWorker.postMessage(1_000_000);

    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement | null;
    if (canvas) {
      const offscreen = canvas.transferControlToOffscreen();
      this.canvasWorker = new Worker(new URL('./canvas.worker', import.meta.url));
      this.canvasWorker.postMessage({ canvas: offscreen }, [offscreen]);
    }
  }

  ngOnDestroy(): void {
    this.computeWorker?.terminate();
    this.canvasWorker?.terminate();
  }

  startAnimation(): void {
    this.canvasWorker?.postMessage({ action: 'start' });
  }

  stopAnimation(): void {
    this.canvasWorker?.postMessage({ action: 'stop' });
  }
}
