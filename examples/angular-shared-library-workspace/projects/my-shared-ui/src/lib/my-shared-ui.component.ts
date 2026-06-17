import { Component } from '@angular/core';

@Component({
  selector: 'lib-my-shared-ui',
  standalone: true,
  template: `
    <p class="shared-banner">
      <span class="shared-banner__badge">lib</span>
      Hello from MySharedUiComponent
    </p>
  `,
  styles: [
    `
      .shared-banner {
        align-items: center;
        background: #e0f2fe;
        border: 1px solid rgb(8 145 178 / 0.2);
        border-radius: 10px;
        color: #0e7490;
        display: flex;
        font-size: 0.9375rem;
        font-weight: 600;
        gap: 0.65rem;
        margin: 0;
        padding: 0.75rem 1rem;
      }

      .shared-banner__badge {
        background: #0891b2;
        border-radius: 0.35rem;
        color: white;
        font-family: ui-monospace, monospace;
        font-size: 0.6875rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        padding: 0.2rem 0.45rem;
        text-transform: uppercase;
      }
    `,
  ],
})
export class MySharedUiComponent {}
