import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="panel">
      <h2>Beyond “just add JWT”</h2>
      <p class="lede">
        This companion mirrors the secure 2026 shape: the browser never holds
        access or refresh tokens. A small BFF owns the OIDC/token lifecycle and
        issues an HttpOnly session cookie.
      </p>

      <div class="compare">
        <article>
          <h3><span class="badge badge--danger">Avoid</span> SPA token storage</h3>
          <ul>
            <li>JWT in <code>localStorage</code> / <code>sessionStorage</code></li>
            <li>Bearer header attached from JS</li>
            <li>Long-lived credentials in the browser</li>
            <li>XSS → full account takeover via stolen token</li>
          </ul>
        </article>
        <article>
          <h3><span class="badge badge--ok">Prefer</span> BFF + cookies</h3>
          <ul>
            <li>Authorization code + PKCE at the BFF</li>
            <li>Tokens in a server-side session</li>
            <li>HttpOnly + Secure + SameSite cookie</li>
            <li>CSRF defense for mutating requests</li>
          </ul>
        </article>
      </div>

      <p class="note">
        <strong>Try it:</strong> log in as member or admin, open DevTools →
        Application → Cookies, and confirm there is no access token in storage.
        Then call the dashboard API and watch the interceptor refresh after the
        short access window expires.
      </p>

      <div class="btn-row">
        <a class="btn" routerLink="/login">Start login flow</a>
        <a class="btn btn--ghost" routerLink="/dashboard">Open dashboard</a>
      </div>
    </section>
  `,
})
export class HomePageComponent {}
