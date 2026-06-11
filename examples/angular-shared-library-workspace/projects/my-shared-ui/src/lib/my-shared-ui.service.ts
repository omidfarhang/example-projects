import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MySharedUiService {
  getMessage(): string {
    return 'Hello from MySharedUiService';
  }
}
