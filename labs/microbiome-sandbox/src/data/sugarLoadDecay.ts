import type { RegionId } from './regions';

/**
 * Per-tick sugarLoad decay by tissue (SIM-06).
 * Oral clears fastest (saliva); gut slowest (lumen buffering / fermentation).
 */
export const SUGAR_LOAD_DECAY: Record<RegionId, number> = {
  oral: 0.0015,
  gut: 0.0006,
  nose: 0.0012,
  ear: 0.0012,
  skin: 0.0018,
  scalp: 0.0018,
  vaginal: 0.001,
};

export function sugarLoadDecayForRegion(region: RegionId): number {
  return SUGAR_LOAD_DECAY[region];
}
