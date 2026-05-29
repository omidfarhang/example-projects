import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  featureFlags: {
    betaDashboard: boolean;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const appConfigValue: AppConfig = {
  apiBaseUrl: '/api',
  featureFlags: {
    betaDashboard: true,
  },
};
