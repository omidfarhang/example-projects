import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly data = new BehaviorSubject<string>('default data');
  readonly currentData$ = this.data.asObservable();

  changeData(value: string): void {
    this.data.next(value);
  }
}
