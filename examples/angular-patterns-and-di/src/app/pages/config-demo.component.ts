import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { APP_CONFIG } from '../core/app-config.token';

@Component({
  selector: 'app-config-demo',
  imports: [JsonPipe],
  templateUrl: './config-demo.component.html',
  styleUrl: './config-demo.component.css',
})
export class ConfigDemoComponent {
  readonly config = inject(APP_CONFIG);
}
