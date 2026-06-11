import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { APP_CONFIG } from '../core/app-config.token';

@Component({
  selector: 'app-config-demo',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h2>Config token</h2>
    <pre>{{ config | json }}</pre>
  `,
})
export class ConfigDemoComponent {
  readonly config = inject(APP_CONFIG);
}
