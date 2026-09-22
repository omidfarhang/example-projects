import { resource, Signal } from '@angular/core';
import { Params } from '@angular/router';

import { loadPassenger, loadSeatMap, loadTrip, parseFail } from './trip-data';

function tripId(params: Signal<Params>): string {
  return String(params()['id'] ?? 'demo');
}

function failTarget(queryParams: Signal<Params>) {
  return parseFail(queryParams() as Record<string, string>);
}

/** Ordinary resources — blocking by default when used as Router Resources. */
export function createTripResource(params: Signal<Params>, queryParams: Signal<Params>) {
  return resource({
    params: () => ({ id: tripId(params), fail: failTarget(queryParams) }),
    loader: ({ params: { id, fail } }) => loadTrip(id, fail),
  });
}

export function createPassengerResource(params: Signal<Params>, queryParams: Signal<Params>) {
  return resource({
    params: () => ({ id: tripId(params), fail: failTarget(queryParams) }),
    loader: ({ params: { id, fail } }) => loadPassenger(id, fail),
  });
}

export function createSeatMapResource(params: Signal<Params>, queryParams: Signal<Params>) {
  return resource({
    params: () => ({ id: tripId(params), fail: failTarget(queryParams) }),
    loader: ({ params: { id, fail } }) => loadSeatMap(id, fail),
  });
}
