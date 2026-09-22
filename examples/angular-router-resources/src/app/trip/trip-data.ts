/** Fake Trip Desk payloads with artificial latency (no HttpClient). */

export const LATENCY_MS = 1000;

export interface Trip {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departsAt: string;
}

export interface Passenger {
  id: string;
  name: string;
  loyaltyTier: string;
}

export interface SeatMap {
  cabin: string;
  rows: number;
  available: string[];
}

export type FailTarget = 'trip' | 'passenger' | 'seat' | null;

export function parseFail(query: Record<string, string> | null | undefined): FailTarget {
  const value = query?.['fail'];
  if (value === 'trip' || value === 'passenger' || value === 'seat') {
    return value;
  }
  return null;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function maybeFail(target: FailTarget, expected: FailTarget): Promise<void> {
  await delay(LATENCY_MS);
  if (target === expected) {
    throw new Error(`Simulated ${expected} load failure`);
  }
}

export async function loadTrip(id: string, fail: FailTarget = null): Promise<Trip> {
  await maybeFail(fail, 'trip');
  return {
    id,
    code: `TD-${id.toUpperCase()}`,
    origin: 'TXL',
    destination: 'LIS',
    departsAt: '2026-10-12T09:40:00+02:00',
  };
}

export async function loadPassenger(id: string, fail: FailTarget = null): Promise<Passenger> {
  await maybeFail(fail, 'passenger');
  return {
    id: `p-${id}`,
    name: 'Nora Keene',
    loyaltyTier: 'Gold',
  };
}

export async function loadSeatMap(id: string, fail: FailTarget = null): Promise<SeatMap> {
  await maybeFail(fail, 'seat');
  return {
    cabin: 'Economy Plus',
    rows: 28,
    available: ['12A', '12C', '14F', '21B'],
  };
}
