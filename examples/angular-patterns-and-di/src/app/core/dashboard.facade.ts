import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly dataService = inject(DataService);
  readonly data$ = this.dataService.currentData$;

  update(value: string): void {
    this.dataService.changeData(value);
  }
}
