import { Component, signal } from '@angular/core';

import { DynamicFormComponent } from './dynamic-form.component';

@Component({
  selector: 'app-root',
  imports: [DynamicFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly buggy = signal(false);

  setBuggy(value: boolean): void {
    this.buggy.set(value);
  }
}
