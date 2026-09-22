import { Component, input, Resource } from '@angular/core';

import { Passenger, SeatMap, Trip } from './trip-data';

@Component({
  selector: 'app-resources-live-detail',
  template: `
    <section class="panel" style="--page-accent: #7c3aed">
      <p class="eyebrow">Non-blocking router resources</p>
      <h2>Trip desk detail</h2>
      <p class="page__lede">
        The route activated immediately. Each input is a <code>Resource</code> — render loading /
        error / value yourself (same five-booleans mindset as screen state).
      </p>

      <div class="live-grid">
        @let tripRes = trip();
        <article class="live-card">
          <h3>Trip</h3>
          @if (tripRes.isLoading()) {
            <p class="note">Loading trip…</p>
          } @else if (tripRes.error()) {
            <p class="note note--danger">{{ errorText(tripRes.error()) }}</p>
          } @else if (tripRes.value(); as t) {
            <p>
              <strong>{{ t.code }}</strong> · {{ t.origin }} → {{ t.destination }}
            </p>
          }
        </article>

        @let passengerRes = passenger();
        <article class="live-card">
          <h3>Passenger</h3>
          @if (passengerRes.isLoading()) {
            <p class="note">Loading passenger…</p>
          } @else if (passengerRes.error()) {
            <p class="note note--danger">{{ errorText(passengerRes.error()) }}</p>
          } @else if (passengerRes.value(); as p) {
            <p>
              <strong>{{ p.name }}</strong> · {{ p.loyaltyTier }}
            </p>
          }
        </article>

        @let seatsRes = seats();
        <article class="live-card">
          <h3>Seat map</h3>
          @if (seatsRes.isLoading()) {
            <p class="note">Loading seats…</p>
          } @else if (seatsRes.error()) {
            <p class="note note--danger">{{ errorText(seatsRes.error()) }}</p>
          } @else if (seatsRes.value(); as s) {
            <p>
              <strong>{{ s.cabin }}</strong> · {{ s.available.join(', ') }}
            </p>
          }
        </article>
      </div>
    </section>
  `,
  styles: `
    .live-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .live-card {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      display: grid;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
    }

    .live-card h3,
    .live-card p {
      margin: 0;
    }

    .live-card h3 {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .note--danger {
      background: var(--danger-soft);
      border-color: color-mix(in srgb, var(--danger) 25%, var(--border));
      color: var(--danger);
    }
  `,
})
export class ResourcesLiveDetail {
  readonly trip = input.required<Resource<Trip>>();
  readonly passenger = input.required<Resource<Passenger>>();
  readonly seats = input.required<Resource<SeatMap>>();

  protected errorText(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error ?? 'Unknown error');
  }
}
