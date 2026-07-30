import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './auth/auth.guards';
import { AdminPageComponent } from './pages/admin.page';
import { DashboardPageComponent } from './pages/dashboard.page';
import { ForbiddenPageComponent } from './pages/forbidden.page';
import { HomePageComponent } from './pages/home.page';
import { LoginPageComponent } from './pages/login.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [authGuard, roleGuard('admin')],
  },
  { path: 'forbidden', component: ForbiddenPageComponent },
  { path: '**', redirectTo: '' },
];
