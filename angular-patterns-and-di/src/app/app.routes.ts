import { Routes } from '@angular/router';

import { ConfigDemoComponent } from './pages/config-demo.component';
import { DiTokenDemoComponent } from './pages/di-token-demo.component';
import { FacadeDemoComponent } from './pages/facade-demo.component';
import { ObserverDemoComponent } from './pages/observer-demo.component';

export const routes: Routes = [
  { path: '', redirectTo: 'observer', pathMatch: 'full' },
  { path: 'observer', component: ObserverDemoComponent },
  { path: 'facade', component: FacadeDemoComponent },
  { path: 'tokens', component: DiTokenDemoComponent },
  { path: 'config', component: ConfigDemoComponent },
];
