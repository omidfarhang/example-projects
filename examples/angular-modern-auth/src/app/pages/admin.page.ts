import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  template: `
    <section class="panel">
      <h2>Admin area</h2>
      <p class="lede">
        Reachable only when <code>roleGuard('admin')</code> passes.
        The API still enforces the same check — guards are UX, not security.
      </p>

      @if (status()) {
        <p class="note">{{ status() }}</p>
      }

      @if (payload()) {
        <pre class="pre">{{ payload() }}</pre>
      }
    </section>
  `,
})
export class AdminPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly payload = signal<string | null>(null);
  readonly status = signal<string | null>(null);

  ngOnInit(): void {
    this.status.set('Requesting /api/admin…');
    this.http.get('/api/admin', { withCredentials: true }).subscribe({
      next: (body) => {
        this.payload.set(JSON.stringify(body, null, 2));
        this.status.set('OK — server confirmed admin role.');
      },
      error: (err) => {
        this.payload.set(JSON.stringify(err?.error ?? err, null, 2));
        this.status.set(`Failed with status ${err.status}`);
      },
    });
  }
}
