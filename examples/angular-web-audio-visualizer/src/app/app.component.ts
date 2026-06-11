import { Component } from '@angular/core';

import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { SettingsComponent } from './settings/settings.component';
import { VisualizerComponent, VisualizationStyle } from './visualizer/visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AudioPlayerComponent, SettingsComponent, VisualizerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  selectedStyle: VisualizationStyle = 'Bar';

  onStyleChange(style: VisualizationStyle): void {
    this.selectedStyle = style;
  }
}
