import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataService } from '../core/data.service';

@Component({
  selector: 'app-observer-demo',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  template: `
    <h2>Observer pattern</h2>
    <p>Current value: {{ dataService.currentData$ | async }}</p>
    <input [(ngModel)]="value" placeholder="Update shared data" />
    <button type="button" (click)="update()">Publish</button>
  `,
})
export class ObserverDemoComponent {
  readonly dataService = inject(DataService);
  value = 'new data';

  update(): void {
    this.dataService.changeData(this.value);
  }
}
