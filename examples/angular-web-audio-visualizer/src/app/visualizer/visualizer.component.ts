import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { AudioService } from '../audio.service';

export type VisualizationStyle = 'Bar' | 'Circular' | 'Waveform';

@Component({
  selector: 'app-visualizer',
  standalone: true,
  templateUrl: './visualizer.component.html',
  styleUrl: './visualizer.component.css',
})
export class VisualizerComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() style: VisualizationStyle = 'Bar';

  private canvasContext!: CanvasRenderingContext2D;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    const context = this.canvasRef.nativeElement.getContext('2d');
    if (!context) {
      throw new Error('Unable to acquire 2D canvas context');
    }
    this.canvasContext = context;
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const dataArray = this.audioService.getFrequencyData();
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.canvasContext.clearRect(0, 0, width, height);
    this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
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
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2;
      this.canvasContext.fillStyle = `rgb(${barHeight + 100},50,50)`;
      this.canvasContext.fillRect(x, height - barHeight / 2, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  private drawCircularVisualization(dataArray: Uint8Array, width: number, height: number): void {
    const radius = Math.min(width, height) / 3;

    this.canvasContext.beginPath();
    this.canvasContext.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    this.canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.canvasContext.stroke();

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * 2 * Math.PI;
      const x = width / 2 + Math.cos(angle) * (radius + dataArray[i] / 2);
      const y = height / 2 + Math.sin(angle) * (radius + dataArray[i] / 2);

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(width / 2, height / 2);
      this.canvasContext.lineTo(x, y);
      this.canvasContext.strokeStyle = `hsl(${(i / dataArray.length) * 360}, 100%, 50%)`;
      this.canvasContext.stroke();
    }
  }

  private drawWaveformVisualization(dataArray: Uint8Array, width: number, height: number): void {
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'rgb(255, 255, 255)';

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

    this.canvasContext.lineTo(width, height / 2);
    this.canvasContext.stroke();
  }
}
