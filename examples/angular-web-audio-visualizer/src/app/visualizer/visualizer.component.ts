import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { AudioService } from '../audio.service';

export type VisualizationStyle = 'Bar' | 'Circular' | 'Waveform';

@Component({
  selector: 'app-visualizer',
  standalone: true,
  templateUrl: './visualizer.component.html',
  styleUrl: './visualizer.component.css',
})
export class VisualizerComponent implements OnDestroy, OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() style: VisualizationStyle = 'Bar';

  private canvasContext!: CanvasRenderingContext2D;
  private resizeObserver?: ResizeObserver;
  private animationFrameId = 0;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    const context = this.canvasRef.nativeElement.getContext('2d');
    if (!context) {
      throw new Error('Unable to acquire 2D canvas context');
    }
    this.canvasContext = context;
    this.syncCanvasSize();
    this.resizeObserver = new ResizeObserver(() => this.syncCanvasSize());
    this.resizeObserver.observe(this.canvasRef.nativeElement.parentElement!);
    this.animate();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.animationFrameId);
  }

  private syncCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    const frame = canvas.parentElement;
    if (!frame) {
      return;
    }

    const width = Math.max(Math.floor(frame.clientWidth), 1);
    const height = Math.max(Math.floor(frame.clientHeight), 1);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const dataArray = this.audioService.getFrequencyData();
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.canvasContext.clearRect(0, 0, width, height);
    this.canvasContext.fillStyle = 'rgba(8, 10, 16, 0.18)';
    this.canvasContext.fillRect(0, 0, width, height);

    switch (this.style) {
      case 'Bar':
        this.drawBarVisualization(dataArray, width, height);
        break;
      case 'Circular':
        this.drawCircularVisualization(dataArray, width, height);
        break;
      case 'Waveform':
        this.drawWaveformVisualization(dataArray, width, height);
        break;
    }
  }

  private drawBarVisualization(dataArray: Uint8Array, width: number, height: number): void {
    const barWidth = Math.max((width / dataArray.length) * 2.5, 2);
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.72;
      const hue = 250 + (i / dataArray.length) * 70;
      const lightness = 42 + dataArray[i] / 8;
      this.canvasContext.fillStyle = `hsl(${hue}, 85%, ${lightness}%)`;
      this.canvasContext.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  private drawCircularVisualization(dataArray: Uint8Array, width: number, height: number): void {
    const radius = Math.min(width, height) * 0.22;
    const centerX = width / 2;
    const centerY = height / 2;

    this.canvasContext.beginPath();
    this.canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.canvasContext.strokeStyle = 'rgba(196, 181, 253, 0.25)';
    this.canvasContext.lineWidth = 1.5;
    this.canvasContext.stroke();

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * 2 * Math.PI - Math.PI / 2;
      const magnitude = dataArray[i] / 255;
      const x = centerX + Math.cos(angle) * (radius + magnitude * radius * 1.4);
      const y = centerY + Math.sin(angle) * (radius + magnitude * radius * 1.4);

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(centerX, centerY);
      this.canvasContext.lineTo(x, y);
      this.canvasContext.strokeStyle = `hsla(${250 + (i / dataArray.length) * 80}, 90%, 68%, ${0.35 + magnitude * 0.65})`;
      this.canvasContext.lineWidth = 1.5;
      this.canvasContext.stroke();
    }
  }

  private drawWaveformVisualization(dataArray: Uint8Array, width: number, height: number): void {
    const gradient = this.canvasContext.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(0.5, '#c084fc');
    gradient.addColorStop(1, '#38bdf8');

    this.canvasContext.lineWidth = 2.5;
    this.canvasContext.strokeStyle = gradient;
    this.canvasContext.shadowBlur = 8;
    this.canvasContext.shadowColor = 'rgba(139, 92, 246, 0.45)';

    this.canvasContext.beginPath();
    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const y = height - (dataArray[i] / 255) * height;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.canvasContext.stroke();
    this.canvasContext.shadowBlur = 0;
  }
}
