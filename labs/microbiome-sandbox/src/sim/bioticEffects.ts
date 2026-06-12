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
  immuneActivity: number;
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
  if (effects.immuneActivity !== undefined) {
    b.immuneActivity = clamp(b.immuneActivity + effects.immuneActivity, 0, 1);
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

/** Scale biome effect magnitudes by dose × region multiplier (bounds unchanged). */
export function scaleBiomeEffect(effects: BiomeEffect, multiplier: number): BiomeEffect {
  const scaled: BiomeEffect = {};
  if (effects.ph !== undefined) scaled.ph = effects.ph * multiplier;
  if (effects.phMin !== undefined) scaled.phMin = effects.phMin;
  if (effects.phMax !== undefined) scaled.phMax = effects.phMax;
  if (effects.immuneActivity !== undefined) {
    scaled.immuneActivity = effects.immuneActivity * multiplier;
  }
  if (effects.integrity !== undefined) scaled.integrity = effects.integrity * multiplier;
  if (effects.biofilm !== undefined) scaled.biofilm = effects.biofilm * multiplier;
  if (effects.postbioticLevel !== undefined) scaled.postbioticLevel = effects.postbioticLevel * multiplier;
  if (effects.moisture !== undefined) scaled.moisture = effects.moisture * multiplier;
  if (effects.commensalVitality !== undefined) {
    scaled.commensalVitality = effects.commensalVitality * multiplier;
  }
  if (effects.yeastVitality !== undefined) scaled.yeastVitality = effects.yeastVitality * multiplier;
  return scaled;
}

/** Sum multiple biome effects for impact preview aggregation. */
export function mergeBiomeEffects(...effects: (BiomeEffect | undefined)[]): BiomeEffect {
  const out: BiomeEffect = {};
  for (const e of effects) {
    if (!e) continue;
    if (e.ph !== undefined) out.ph = (out.ph ?? 0) + e.ph;
    if (e.phMin !== undefined) out.phMin = e.phMin;
    if (e.phMax !== undefined) out.phMax = e.phMax;
    if (e.immuneActivity !== undefined) {
      out.immuneActivity = (out.immuneActivity ?? 0) + e.immuneActivity;
    }
    if (e.integrity !== undefined) out.integrity = (out.integrity ?? 0) + e.integrity;
    if (e.biofilm !== undefined) out.biofilm = (out.biofilm ?? 0) + e.biofilm;
    if (e.postbioticLevel !== undefined) {
      out.postbioticLevel = (out.postbioticLevel ?? 0) + e.postbioticLevel;
    }
    if (e.moisture !== undefined) out.moisture = (out.moisture ?? 0) + e.moisture;
    if (e.commensalVitality !== undefined) {
      out.commensalVitality = (out.commensalVitality ?? 0) + e.commensalVitality;
    }
    if (e.yeastVitality !== undefined) {
      out.yeastVitality = (out.yeastVitality ?? 0) + e.yeastVitality;
    }
  }
  return out;
}

export function isGutOrOral(region: RegionId): boolean {
  return region === 'gut' || region === 'oral';
}
