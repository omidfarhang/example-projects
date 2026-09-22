import { Injectable, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export type ResolveMark = 'trip' | 'passenger' | 'seats';

@Injectable({ providedIn: 'root' })
export class NavigationTimer {
  readonly elapsedMs = signal<number | null>(null);
  readonly status = signal<'idle' | 'navigating' | 'done' | 'cancelled' | 'error'>('idle');
  readonly message = signal<string | null>(null);
  readonly resolveOrder = signal<ResolveMark[]>([]);

  private startedAt = 0;

  constructor(router: Router) {
    router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.startedAt = performance.now();
          this.elapsedMs.set(null);
          this.status.set('navigating');
          this.message.set(null);
          this.resolveOrder.set([]);
          return;
        }

        const ms = Math.round(performance.now() - this.startedAt);
        this.elapsedMs.set(ms);

        if (event instanceof NavigationEnd) {
          this.status.set('done');
          return;
        }
        if (event instanceof NavigationCancel) {
          this.status.set('cancelled');
          this.message.set('Navigation cancelled (blocking resource / resolve failed).');
          return;
        }
        this.status.set('error');
        this.message.set(event.error?.message ?? 'Navigation error');
      });
  }

  markResolve(mark: ResolveMark): void {
    this.resolveOrder.update((order) => [...order, mark]);
  }
}
