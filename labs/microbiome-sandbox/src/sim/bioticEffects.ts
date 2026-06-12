import type { BiomeEffect } from '../data/strains';
import type { RegionId } from '../data/regions';

/** Apply scalar biome mutations with clamping consistent with SimEngine. */
export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export interface BiomeMutable {
  ph: number;
  moisture: number;
  integrity: number;
  inflammation: number;
  biofilm: number;
  postbioticLevel: number;
}

export function applyBiomeEffects(b: BiomeMutable, effects: BiomeEffect) {
  if (effects.ph !== undefined) {
    const min = effects.phMin ?? 3.8;
    const max = effects.phMax ?? 8;
    b.ph = clamp(b.ph + effects.ph, min, max);
  }
  if (effects.moisture !== undefined) {
    b.moisture = clamp(b.moisture + effects.moisture, 0, 1);
  }
  if (effects.integrity !== undefined) {
    b.integrity = clamp(b.integrity + effects.integrity, 0, 1);
  }
  if (effects.inflammation !== undefined) {
    b.inflammation = clamp(b.inflammation + effects.inflammation, 0, 1);
  }
  if (effects.biofilm !== undefined) {
    b.biofilm = clamp(b.biofilm + effects.biofilm, 0, 1);
  }
  if (effects.postbioticLevel !== undefined) {
    b.postbioticLevel = clamp(b.postbioticLevel + effects.postbioticLevel, 0, 1);
  }
}

export function scaleCount(base: number, multiplier: number): number {
  return Math.max(1, Math.round(base * multiplier));
}

export function isGutOrOral(region: RegionId): boolean {
  return region === 'gut' || region === 'oral';
}
