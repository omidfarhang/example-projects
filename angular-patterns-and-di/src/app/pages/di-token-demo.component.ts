import { Component, inject } from '@angular/core';

import { LOGGER } from '../core/logger.token';

@Component({
  selector: 'app-di-token-demo',
  standalone: true,
  template: `
    <h2>Injection tokens</h2>
    <p>Switch logger strategy with localStorage key <code>loggerMode=audit</code>.</p>
    <button type="button" (click)="log()">Log message</button>
  `,
})
export class DiTokenDemoComponent {
  private readonly logger = inject(LOGGER);

  log(): void {
    this.logger.log('Dependency injection token demo');
  }
}
