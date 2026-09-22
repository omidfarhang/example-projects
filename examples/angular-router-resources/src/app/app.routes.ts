import { nonBlocking, Routes } from '@angular/router';

import { ResourcesDetail } from './trip/resources-detail';
import { ResourcesLiveDetail } from './trip/resources-live-detail';
import {
  createPassengerResource,
  createSeatMapResource,
  createTripResource,
} from './trip/trip.resources';
import { passengerResolver, seatsResolver, tripResolver } from './trip/trip.resolvers';
import { WaterfallDetail } from './trip/waterfall-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'resources/demo' },
  {
    path: 'waterfall/:id',
    resolve: { trip: tripResolver },
    children: [
      {
        path: '',
        resolve: { passenger: passengerResolver },
        children: [
          {
            path: '',
            resolve: { seats: seatsResolver },
            component: WaterfallDetail,
          },
        ],
      },
    ],
  },
  {
    path: 'resources/:id',
    component: ResourcesDetail,
    resources: (ctx) => ({
      trip: createTripResource(ctx.params, ctx.queryParams),
      passenger: createPassengerResource(ctx.params, ctx.queryParams),
      seats: createSeatMapResource(ctx.params, ctx.queryParams),
    }),
  },
  {
    path: 'resources-live/:id',
    component: ResourcesLiveDetail,
    resources: (ctx) => ({
      trip: nonBlocking(createTripResource(ctx.params, ctx.queryParams)),
      passenger: nonBlocking(createPassengerResource(ctx.params, ctx.queryParams)),
      seats: nonBlocking(createSeatMapResource(ctx.params, ctx.queryParams)),
    }),
  },
  { path: '**', redirectTo: 'resources/demo' },
];
