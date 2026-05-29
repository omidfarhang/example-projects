import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_CONFIG, appConfigValue } from './core/app-config.token';
import { LOGGER, loggerFactory } from './core/logger.token';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: APP_CONFIG, useValue: appConfigValue },
    { provide: LOGGER, useFactory: loggerFactory },
  ],
};
