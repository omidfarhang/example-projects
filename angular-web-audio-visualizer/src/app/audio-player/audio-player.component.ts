import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPause, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

import { AudioService } from '../audio.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css',
})
export class AudioPlayerComponent implements OnInit {
  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  faPlay = faPlay;
  faPause = faPause;
  faStop = faStop;
  isPlaying = false;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.audioService.init(this.audioRef.nativeElement);
  }

  play(): void {
    void this.audioRef.nativeElement.play();
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
    this.isPlaying = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const audioElement = this.audioRef.nativeElement;
      audioElement.src = URL.createObjectURL(file);
      this.audioService.init(audioElement);
    }
  }
}
