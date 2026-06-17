import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataService } from '../core/data.service';

@Component({
  selector: 'app-observer-demo',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './observer-demo.component.html',
  styleUrl: './observer-demo.component.css',
})
export class ObserverDemoComponent {
  readonly dataService = inject(DataService);
  value = 'new data';

  update(): void {
    this.dataService.changeData(this.value);
  }
}
