import { Component, input } from '@angular/core';

import { Passenger, SeatMap, Trip } from './trip-data';

@Component({
  selector: 'app-waterfall-detail',
  template: `
    <section class="panel" style="--page-accent: #b45309">
      <p class="eyebrow">Waterfall resolvers</p>
      <h2>Trip desk detail</h2>
      <p class="page__lede">
        Three nested <code>ResolveFn</code>s ran one after another (~1s each). The route only
        activated once the leaf finished — expect ~3s on the timing readout.
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
export class WaterfallDetail {
  readonly trip = input.required<Trip>();
  readonly passenger = input.required<Passenger>();
  readonly seats = input.required<SeatMap>();
}
