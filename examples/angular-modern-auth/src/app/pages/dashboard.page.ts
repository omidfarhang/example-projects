import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe],
  template: `
    <section class="panel">
      <h2>Protected dashboard</h2>
      <p class="lede">
        Guarded by <code>authGuard</code>. Data comes from <code>/api/profile</code>
        with credentials — no Bearer token in application code.
      </p>

      @if (auth.user(); as user) {
        <dl class="stat-grid">
          <div>
            <dt>User</dt>
            <dd>{{ user.email }}</dd>
          </div>
          <div>
            <dt>Roles</dt>
            <dd>{{ user.roles.join(', ') }}</dd>
          </div>
          <div>
            <dt>Access expires</dt>
            <dd>{{ user.accessExpiresAt | date: 'mediumTime' }}</dd>
          </div>
        </dl>
      }

      <div class="btn-row">
        <button type="button" class="btn" (click)="loadProfile()">Load profile API</button>
        <button type="button" class="btn btn--ghost" (click)="waitForExpiry()">
          Wait for access expiry + retry
        </button>
      </div>

      @if (status()) {
        <p class="note">{{ status() }}</p>
      }

      @if (payload()) {
        <pre class="pre">{{ payload() }}</pre>
      }

      <p class="note">
        <strong>Storage check:</strong> open DevTools → Application. You should see
        <code>sid</code> (HttpOnly) and <code>csrf</code> cookies — and an empty
        Local Storage for tokens.
      </p>
    </section>
  `,
})
export class DashboardPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly payload = signal<string | null>(null);
  readonly status = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.status.set('Requesting /api/profile…');
    this.http.get('/api/profile', { withCredentials: true }).subscribe({
      next: (body) => {
        this.payload.set(JSON.stringify(body, null, 2));
        this.status.set('OK — session cookie authenticated the request.');
        this.auth.refreshSession().subscribe();
      },
      error: (err) => {
        this.payload.set(JSON.stringify(err?.error ?? err, null, 2));
        this.status.set(`Failed with status ${err.status}`);
      },
    });
  }

  waitForExpiry(): void {
    const user = this.auth.user();
    if (!user) {
      this.status.set('Not signed in.');
      return;
    }
    const waitMs = Math.max(0, user.accessExpiresAt - Date.now()) + 1500;
    this.status.set(`Waiting ${Math.ceil(waitMs / 1000)}s for access window to expire…`);
    window.setTimeout(() => this.loadProfile(), waitMs);
  }
}
