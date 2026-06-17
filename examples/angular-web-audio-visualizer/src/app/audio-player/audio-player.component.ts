import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPause, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

import { AudioService } from '../audio.service';

@Component({
    selector: 'app-audio-player',
    imports: [FaIconComponent],
    templateUrl: './audio-player.component.html',
    styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnDestroy, OnInit {
  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  faPlay = faPlay;
  faPause = faPause;
  faStop = faStop;
  isPlaying = false;
  hasAudioSource = false;
  trackName = '';
  currentTime = 0;
  duration = 0;
  private isSeeking = false;
  private objectUrl?: string;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.audioService.init(this.audioRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  async play(): Promise<void> {
    if (!this.hasAudioSource) {
      return;
    }

    await this.audioService.resume();
    await this.audioRef.nativeElement.play();
    this.isPlaying = true;
  }

  pause(): void {
    this.audioRef.nativeElement.pause();
    this.isPlaying = false;
  }

  stop(): void {
    const audioElement = this.audioRef.nativeElement;
    audioElement.pause();
    audioElement.currentTime = 0;
    this.currentTime = 0;
    this.isPlaying = false;
  }

  onTimeUpdate(): void {
    if (!this.isSeeking) {
      this.currentTime = this.audioRef.nativeElement.currentTime;
    }
  }

  onMetadataLoaded(): void {
    this.duration = this.audioRef.nativeElement.duration || 0;
  }

  onEnded(): void {
    this.isPlaying = false;
    this.currentTime = this.duration;
  }

  onSeek(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.audioRef.nativeElement.currentTime = value;
    this.currentTime = value;
  }

  onSeekStart(): void {
    this.isSeeking = true;
  }

  onSeekEnd(): void {
    this.isSeeking = false;
    this.currentTime = this.audioRef.nativeElement.currentTime;
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const audioElement = this.audioRef.nativeElement;
      this.revokeObjectUrl();
      this.objectUrl = URL.createObjectURL(file);
      audioElement.src = this.objectUrl;
      this.hasAudioSource = true;
      this.trackName = file.name;
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
    }
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }
}
