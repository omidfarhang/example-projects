import { InjectionToken } from '@angular/core';

export interface Logger {
  log(message: string): void;
}

export const LOGGER = new InjectionToken<Logger>('LOGGER');

export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[console] ${message}`);
  }
}

export class AuditLogger implements Logger {
  log(message: string): void {
    console.log(`[audit] ${message}`);
  }
}

export const loggerFactory = (): Logger => {
  const mode = typeof window !== 'undefined' ? window.localStorage.getItem('loggerMode') : null;
  return mode === 'audit' ? new AuditLogger() : new ConsoleLogger();
};
