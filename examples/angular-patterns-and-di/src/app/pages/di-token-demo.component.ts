import { Component, inject } from '@angular/core';

import { LOGGER } from '../core/logger.token';

@Component({
  selector: 'app-di-token-demo',
  imports: [],
  templateUrl: './di-token-demo.component.html',
  styleUrl: './di-token-demo.component.css',
})
export class DiTokenDemoComponent {
  private readonly logger = inject(LOGGER);

  lastMessage = '';
  activeLogger = this.readLoggerMode();

  log(): void {
    const message = 'Dependency injection token demo';
    this.logger.log(message);
    this.lastMessage = message;
  }

  setLoggerMode(mode: 'console' | 'audit'): void {
    localStorage.setItem('loggerMode', mode);
    this.activeLogger = mode;
  }

  reloadApp(): void {
    window.location.reload();
  }

  private readLoggerMode(): string {
    return localStorage.getItem('loggerMode') === 'audit' ? 'AuditLogger' : 'ConsoleLogger';
  }
}
