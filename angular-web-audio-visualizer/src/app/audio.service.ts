import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioContext: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  init(audioElement: HTMLAudioElement): void {
    if (this.source) {
      this.source.disconnect();
    }

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(0);
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}
