import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from './assets/stencil-my-button/loader.js';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

defineCustomElements();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
