import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import {
  FailTarget,
  loadPassenger,
  loadSeatMap,
  loadTrip,
  Passenger,
  SeatMap,
  Trip,
} from './trip-data';
import { NavigationTimer } from './navigation-timer';

function failFromRoute(route: { queryParamMap: { get(name: string): string | null } }): FailTarget {
  const value = route.queryParamMap.get('fail');
  if (value === 'trip' || value === 'passenger' || value === 'seat') {
    return value;
  }
  return null;
}

function tripId(route: {
  paramMap: { get(name: string): string | null };
  parent: { paramMap: { get(name: string): string | null } } | null;
}): string {
  return route.paramMap.get('id') ?? route.parent?.paramMap.get('id') ?? 'demo';
}

/** Parent of the waterfall tree — starts first (~1s). */
export const tripResolver: ResolveFn<Trip> = (route) => {
  inject(NavigationTimer).markResolve('trip');
  return loadTrip(tripId(route), failFromRoute(route));
};

/** Mid level — waits for parent resolve, then ~1s more. */
export const passengerResolver: ResolveFn<Passenger> = (route) => {
  inject(NavigationTimer).markResolve('passenger');
  return loadPassenger(tripId(route), failFromRoute(route));
};

/** Leaf — waits for mid resolve, then ~1s more (~3s total). */
export const seatsResolver: ResolveFn<SeatMap> = (route) => {
  inject(NavigationTimer).markResolve('seats');
  return loadSeatMap(tripId(route), failFromRoute(route));
};
