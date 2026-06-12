import type { RegionId } from './regions';
import type { StressorBiomeDelta, StressorDef } from './stressors';

/** Route / delivery class — each has a distinct microbial hit profile (SIM-02). */
export type AntibioticRoute = 'otic' | 'topical' | 'gut_broad' | 'vaginal_systemic';

export interface AntibioticSpectrum {
  route: AntibioticRoute;
  label: string;
  /** Educational note shown in impact preview. */
  why: string;
  vitality: Pick<
    StressorBiomeDelta,
    'commensalVitality' | 'probioticVitality' | 'pathogenVitality' | 'yeastVitality'
  >;
  /** Typical biome side-effects for this route. */
  biome: StressorBiomeDelta;
  /** Optional per-region tuning when the same route is reused. */
  regionTuning?: Partial<Record<RegionId, StressorBiomeDelta>>;
}

export const ANTIBIOTIC_SPECTRA: Record<AntibioticRoute, AntibioticSpectrum> = {
  otic: {
    route: 'otic',
    label: 'Otic (canal drops)',
    why: 'Local aminoglycoside-style drops — strong commensal wipe in the canal, moderate pathogen hit.',
    vitality: {
      commensalVitality: -0.38,
      probioticVitality: -0.28,
      pathogenVitality: -0.14,
      yeastVitality: -0.1,
    },
    biome: { oxygenation: -0.06, oxygenationMin: 0.12, integrity: -0.08, integrityMin: 0.2 },
    regionTuning: {
      ear: { cerumen: 0.08, cerumenMax: 1 },
    },
  },
  topical: {
    route: 'topical',
    label: 'Topical (skin)',
    why: 'Surface antibiotic — commensals and biofilm hit hardest; pathogens and yeast partially spared.',
    vitality: {
      commensalVitality: -0.44,
      probioticVitality: -0.22,
      pathogenVitality: -0.08,
      yeastVitality: -0.12,
    },
    biome: { biofilm: -0.08, integrity: -0.06, integrityMin: 0.2 },
  },
  gut_broad: {
    route: 'gut_broad',
    label: 'Broad-spectrum (gut)',
    why: 'Systemic gut course — anaerobe-rich commensals and probiotics collapse; postbiotics fall; pathogens relatively spared.',
    vitality: {
      commensalVitality: -0.48,
      probioticVitality: -0.4,
      pathogenVitality: -0.06,
      yeastVitality: -0.12,
    },
    biome: {
      postbioticLevel: -0.28,
      postbioticMin: 0,
      integrity: -0.1,
      integrityMin: 0.2,
      inflammation: 0.12,
    },
  },
  vaginal_systemic: {
    route: 'vaginal_systemic',
    label: 'Systemic (vaginal mucosa)',
    why: 'Systemic course reaching vaginal mucosa — lactobacilli depleted, pH rises, yeast niche opens.',
    vitality: {
      commensalVitality: -0.42,
      probioticVitality: -0.46,
      pathogenVitality: -0.18,
      yeastVitality: -0.1,
    },
    biome: { ph: 0.45, phMax: 6.5, integrity: -0.14, integrityMin: 0.2, inflammation: 0.15 },
  },
};

function mergeStressorBiome(...parts: (StressorBiomeDelta | undefined)[]): StressorBiomeDelta {
  const out: StressorBiomeDelta = {};
  for (const p of parts) {
    if (!p) continue;
    for (const [key, value] of Object.entries(p) as [keyof StressorBiomeDelta, number | undefined][]) {
      if (value === undefined) continue;
      const prev = out[key];
      out[key] = prev === undefined ? value : (prev as number) + value;
    }
  }
  return out;
}

/** Resolve full biome delta for an antibiotic stressor (spectrum + region tuning + per-trigger extras). */
export function resolveAntibioticStressorBiome(
  route: AntibioticRoute,
  region: RegionId,
  extra?: StressorBiomeDelta,
): StressorBiomeDelta {
  const spectrum = ANTIBIOTIC_SPECTRA[route];
  const tuned = spectrum.regionTuning?.[region];
  return mergeStressorBiome(spectrum.vitality, spectrum.biome, tuned, extra);
}

/** Resolve biome for any stressor — uses antibiotic route when set, otherwise static biome. */
export function resolveStressorBiome(def: StressorDef, region: RegionId): StressorBiomeDelta | undefined {
  if (def.antibioticRoute) {
    return resolveAntibioticStressorBiome(def.antibioticRoute, region, def.biome);
  }
  return def.biome;
}

export function antibioticSpectrumWhy(route: AntibioticRoute): string {
  return ANTIBIOTIC_SPECTRA[route].why;
}
