import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  template: `
    <section class="panel">
      <h2>Log in (mock IdP)</h2>
      <p class="lede">
        In production this button would redirect to your IdP. Here the BFF
        creates a server session and sets cookies — Angular never sees tokens.
      </p>

      @if (reason()) {
        <p class="note"><strong>Redirect reason:</strong> {{ reason() }}</p>
      }

      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" [(ngModel)]="email" autocomplete="username" />
      </div>

      <div class="field">
        <label for="role">Role</label>
        <select id="role" name="role" [(ngModel)]="role">
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </div>

      @if (error()) {
        <p class="note"><span class="badge badge--danger">Error</span> {{ error() }}</p>
      }

      <div class="btn-row">
        <button type="button" class="btn" [disabled]="busy()" (click)="submit()">
          {{ busy() ? 'Signing in…' : 'Sign in via BFF' }}
        </button>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = 'alex@example.com';
  role: 'member' | 'admin' = 'member';
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly reason = signal<string | null>(
    this.route.snapshot.queryParamMap.get('reason')
  );

  submit(): void {
    this.busy.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.role).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.error?.error ?? 'Login failed');
      },
    });
  }
}
