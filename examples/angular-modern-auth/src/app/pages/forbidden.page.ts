import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink],
  template: `
    <section class="panel">
      <h2>Forbidden</h2>
      <p class="lede">
        Your session is valid, but this route requires a role you do not have.
        That decision was made in a functional guard — and the admin API would
        still return 403 even if you bypassed the guard.
      </p>
      <div class="btn-row">
        <a class="btn" routerLink="/dashboard">Back to dashboard</a>
        <a class="btn btn--ghost" routerLink="/login">Switch account</a>
      </div>
    </section>
  `,
})
export class ForbiddenPageComponent {}
