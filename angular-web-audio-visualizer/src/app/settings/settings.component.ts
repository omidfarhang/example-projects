import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VisualizationStyle } from '../visualizer/visualizer.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  styles: VisualizationStyle[] = ['Bar', 'Circular', 'Waveform'];
  selectedStyle: VisualizationStyle = 'Bar';

  @Output() styleChange = new EventEmitter<VisualizationStyle>();

  onStyleChange(style: VisualizationStyle): void {
    this.selectedStyle = style;
    this.styleChange.emit(style);
  }
}
