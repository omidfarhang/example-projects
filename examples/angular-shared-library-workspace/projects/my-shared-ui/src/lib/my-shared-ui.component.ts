import { Component } from '@angular/core';

@Component({
  selector: 'lib-my-shared-ui',
  standalone: true,
  template: `<p class="shared-banner">Hello from MySharedUiComponent</p>`,
  styles: [
    `
      .shared-banner {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: #eef6ff;
      }
    `,
  ],
})
export class MySharedUiComponent {}
