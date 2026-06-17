import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardFacade } from '../core/dashboard.facade';

@Component({
  selector: 'app-facade-demo',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './facade-demo.component.html',
  styleUrl: './facade-demo.component.css',
})
export class FacadeDemoComponent {
  readonly facade = inject(DashboardFacade);
  value = 'facade update';

  update(): void {
    this.facade.update(this.value);
  }
}
