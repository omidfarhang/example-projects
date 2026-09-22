import { Component, input } from '@angular/core';

import { Passenger, SeatMap, Trip } from './trip-data';

@Component({
  selector: 'app-resources-detail',
  template: `
    <section class="panel" style="--page-accent: #15803d">
      <p class="eyebrow">Blocking router resources</p>
      <h2>Trip desk detail</h2>
      <p class="page__lede">
        Three resources started together. Navigation waited for the slowest (~1s), then
        <code>withComponentInputBinding</code> handed over unwrapped values — same shape as resolvers.
      </p>

      <dl class="stat-grid">
        <div class="stat-grid__item">
          <dt>Trip</dt>
          <dd>{{ trip().code }} · {{ trip().origin }} → {{ trip().destination }}</dd>
        </div>
        <div class="stat-grid__item">
          <dt>Passenger</dt>
          <dd>{{ passenger().name }} ({{ passenger().loyaltyTier }})</dd>
        </div>
        <div class="stat-grid__item">
          <dt>Seat map</dt>
          <dd>{{ seats().cabin }} · {{ seats().available.join(', ') }}</dd>
        </div>
      </dl>
    </section>
  `,
})
export class ResourcesDetail {
  readonly trip = input.required<Trip>();
  readonly passenger = input.required<Passenger>();
  readonly seats = input.required<SeatMap>();
}
