import { describe, expect, it } from 'vitest';
import { INOCULATIONS } from './inoculations';
import { REGIONS } from './regions';
import { getStressor } from './stressors';

/**
 * ENG-05 — region action IDs must resolve in data catalogs consumed by SimEngine.
 */
describe('region action IDs (ENG-05)', () => {
  const triggerMismatches: string[] = [];
  const inoculationMismatches: string[] = [];
  const regionTriggerDrift: string[] = [];

  for (const region of REGIONS) {
    for (const action of region.triggers) {
      const stressor = getStressor(action.id);
      if (!stressor) {
        triggerMismatches.push(`${region.id}: trigger "${action.id}" missing from stressors.ts`);
        continue;
      }
      if (!stressor.regions.includes(region.id)) {
        regionTriggerDrift.push(
          `${region.id}: trigger "${action.id}" listed in regions.ts but stressor.regions omits "${region.id}"`,
        );
      }
    }

    for (const action of region.regionalCare) {
      if (!INOCULATIONS[action.id]) {
        inoculationMismatches.push(
          `${region.id}: regionalCare "${action.id}" missing from inoculations.ts`,
        );
      }
    }
  }

  it('every region trigger ID exists in stressors catalog', () => {
    expect(triggerMismatches, triggerMismatches.join('\n')).toEqual([]);
  });

  it('every regionalCare ID exists in inoculations catalog', () => {
    expect(inoculationMismatches, inoculationMismatches.join('\n')).toEqual([]);
  });

  it('stressors referenced by a region include that region', () => {
    expect(regionTriggerDrift, regionTriggerDrift.join('\n')).toEqual([]);
  });

  it('every inoculation catalog entry has a matching id key', () => {
    const keyDrift = Object.values(INOCULATIONS)
      .filter((def) => def.id !== Object.keys(INOCULATIONS).find((k) => INOCULATIONS[k] === def))
      .map((def) => `INOCULATIONS key/id mismatch for "${def.id}"`);
    expect(keyDrift).toEqual([]);
  });
});
