import { Component, signal } from '@angular/core';

import { DynamicFormComponent } from './dynamic-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicFormComponent],
  template: `
    <main class="layout">
      <h1>Dynamic Form Debugging</h1>
      <p>
        The buggy flow builds the Angular form before the simulated API metadata arrives.
        The fixed flow waits for metadata, then registers matching controls and validators.
      </p>
      <label class="toggle">
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
      .toggle {
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 1rem;
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
