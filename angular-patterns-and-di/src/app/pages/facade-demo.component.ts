import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardFacade } from '../core/dashboard.facade';

@Component({
  selector: 'app-facade-demo',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  template: `
    <h2>Facade pattern</h2>
    <p>Facade value: {{ facade.data$ | async }}</p>
    <input [(ngModel)]="value" placeholder="Update through facade" />
    <button type="button" (click)="update()">Update</button>
  `,
})
export class FacadeDemoComponent {
  readonly facade = inject(DashboardFacade);
  value = 'facade update';

  update(): void {
    this.facade.update(this.value);
  }
}
