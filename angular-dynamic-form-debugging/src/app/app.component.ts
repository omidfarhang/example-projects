import { Component, signal } from '@angular/core';

import { DynamicFormComponent } from './dynamic-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicFormComponent],
  template: `
    <main class="layout">
      <h1>Dynamic Form Debugging</h1>
      <p>Toggle between buggy and fixed metadata handling.</p>
      <label>
        <input type="checkbox" [checked]="buggy()" (change)="toggleBuggy($event)" />
        Use buggy flow
      </label>
      <app-dynamic-form [useBuggyFlow]="buggy()" />
    </main>
  `,
  styles: [
    `
      .layout {
        max-width: 640px;
        margin: 2rem auto;
        font-family: Arial, sans-serif;
      }
    `,
  ],
})
export class AppComponent {
  readonly buggy = signal(false);

  toggleBuggy(event: Event): void {
    this.buggy.set((event.target as HTMLInputElement).checked);
  }
}
