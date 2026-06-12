import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioContext: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private sourceElement?: HTMLAudioElement;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  init(audioElement: HTMLAudioElement): void {
    if (this.sourceElement === audioElement && this.source && this.analyser && this.dataArray) {
      return;
    }

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.sourceElement = audioElement;
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
    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);
    return this.dataArray;
  }

  resume(): Promise<void> {
    if (this.audioContext.state === 'running') {
      return Promise.resolve();
    }

    return this.audioContext.resume();
  }
}
