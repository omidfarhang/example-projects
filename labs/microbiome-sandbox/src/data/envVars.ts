import type { RegionId } from './regions';

export type EnvVarId =
  | 'ph'
  | 'moisture'
  | 'temperature'
  | 'sebum'
  | 'cerumen'
  | 'salinity'
  | 'oxygenation'
  | 'sweatRate'
  | 'oxygenTension';

export interface EnvVarDef {
  id: EnvVarId;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  format: (value: number) => string;
}

export type RegionEnv = Record<EnvVarId, number>;

export const ENV_VAR_DEFS: Record<EnvVarId, EnvVarDef> = {
  ph: {
    id: 'ph',
    label: 'pH',
    min: 4,
    max: 8,
    step: 0.1,
    default: 6.8,
    format: (v) => {
      if (v < 6.5) return `${v.toFixed(1)} (Acidic)`;
      if (v > 7.2) return `${v.toFixed(1)} (Alkaline)`;
      return `${v.toFixed(1)} (Neutral)`;
    },
  },
  moisture: {
    id: 'moisture',
    label: 'Moisture / Humidity',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.65,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  temperature: {
    id: 'temperature',
    label: 'Local Temperature',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.55,
    format: (v) => `${(34 + v * 4).toFixed(1)}°C`,
  },
  sebum: {
    id: 'sebum',
    label: 'Sebum / Lipid Film',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.35,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  cerumen: {
    id: 'cerumen',
    label: 'Cerumen (Ear Wax)',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.3,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  salinity: {
    id: 'salinity',
    label: 'Salinity / Electrolytes',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.4,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  oxygenation: {
    id: 'oxygenation',
    label: 'Airway Oxygenation',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.75,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  sweatRate: {
    id: 'sweatRate',
    label: 'Sweat / TEWL',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.25,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  oxygenTension: {
    id: 'oxygenTension',
    label: 'Lumen O₂ Tension',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.15,
    format: (v) => `${Math.round(v * 100)}%`,
  },
};

/** Which sliders appear per tissue region. */
export const REGION_ENV_CONTROLS: Record<RegionId, EnvVarId[]> = {
  ear: ['ph', 'moisture', 'temperature', 'cerumen', 'salinity', 'oxygenation'],
  scalp: ['ph', 'moisture', 'temperature', 'sebum', 'sweatRate'],
  nose: ['ph', 'moisture', 'temperature', 'oxygenation'],
  skin: ['ph', 'moisture', 'temperature', 'sebum'],
  gut: ['ph', 'moisture', 'temperature', 'oxygenTension'],
};

export function defaultRegionEnv(): RegionEnv {
  return Object.fromEntries(
    (Object.keys(ENV_VAR_DEFS) as EnvVarId[]).map((id) => [id, ENV_VAR_DEFS[id].default]),
  ) as RegionEnv;
}

export function buildRegionEnv(overrides: Partial<RegionEnv>): RegionEnv {
  return { ...defaultRegionEnv(), ...overrides };
}
