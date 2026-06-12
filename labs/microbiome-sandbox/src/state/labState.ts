import { REGION_ENV_CONTROLS, type EnvVarId } from '../data/envVars';
import { PRESETS, type PresetId } from '../data/presets';
import type { RegionId } from '../data/regions';
import type { SimEngine } from '../sim/engine';
import type { BiomeState, MicrobeNode } from '../sim/types';

export const LAB_STATE_VERSION = 1 as const;
export const STORAGE_KEY = 'bd-lab-session';
export const RESUME_DISMISS_KEY = 'bd-resume-dismissed';
export const MAX_STORED_EVENTS = 60;
export const RESUME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Serializable mid-simulation checkpoint (STATE-01 / STATE-02). */
export interface LabStateV1 {
  v: typeof LAB_STATE_VERSION;
  savedAt: number;
  preset: PresetId;
  region: RegionId;
  context?: string;
  tick: number;
  nextId: number;
  allergenAdhesion: number;
  dayNumber: number;
  nextMealIndex: number;
  env: Partial<Record<EnvVarId, number>>;
  biome: Pick<
    BiomeState,
    'integrity' | 'inflammation' | 'immuneActivity' | 'biofilm' | 'sugarLoad' | 'postbioticLevel'
  >;
  nodes: MicrobeNode[];
  events: string[];
}

export interface LabStateMeta {
  preset: PresetId;
  region: RegionId;
  tick: number;
  integrity: number;
  inflammation: number;
  savedAt: number;
}

const BIOME_CHECKPOINT_KEYS = [
  'integrity',
  'inflammation',
  'immuneActivity',
  'biofilm',
  'sugarLoad',
  'postbioticLevel',
] as const;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function extractEnv(biome: BiomeState, region: RegionId): Partial<Record<EnvVarId, number>> {
  const env: Partial<Record<EnvVarId, number>> = {};
  for (const id of REGION_ENV_CONTROLS[region]) {
    env[id] = round4(biome[id] as number);
  }
  return env;
}

export function buildLabState(
  engine: SimEngine,
  preset: PresetId,
  context?: string,
): LabStateV1 {
  const checkpoint = engine.exportCheckpoint();
  return {
    v: LAB_STATE_VERSION,
    savedAt: Date.now(),
    preset,
    context,
    ...checkpoint,
  };
}

export function labStateMeta(state: LabStateV1): LabStateMeta {
  return {
    preset: state.preset,
    region: state.region,
    tick: state.tick,
    integrity: state.biome.integrity,
    inflammation: state.biome.inflammation,
    savedAt: state.savedAt,
  };
}

function encodeBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(encoded: string): string | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const binary = atob(padded + '='.repeat(padLen));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function isPresetId(v: unknown): v is PresetId {
  return typeof v === 'string' && v in PRESETS;
}

function isRegionId(v: unknown): v is RegionId {
  return typeof v === 'string' && ['ear', 'scalp', 'nose', 'oral', 'skin', 'vaginal', 'gut'].includes(v);
}

function parseLabState(raw: unknown): LabStateV1 | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== LAB_STATE_VERSION) return null;
  if (!isPresetId(o.preset) || !isRegionId(o.region)) return null;
  if (typeof o.tick !== 'number' || typeof o.nextId !== 'number') return null;
  if (!Array.isArray(o.nodes)) return null;

  const biomeRaw = o.biome as Record<string, unknown>;
  const biome: LabStateV1['biome'] = {
    integrity: Number(biomeRaw.integrity ?? 0.85),
    inflammation: Number(biomeRaw.inflammation ?? 0.1),
    immuneActivity: Number(biomeRaw.immuneActivity ?? 0.08),
    biofilm: Number(biomeRaw.biofilm ?? 0.05),
    sugarLoad: Number(biomeRaw.sugarLoad ?? 0),
    postbioticLevel: Number(biomeRaw.postbioticLevel ?? 0),
  };

  return {
    v: LAB_STATE_VERSION,
    savedAt: typeof o.savedAt === 'number' ? o.savedAt : Date.now(),
    preset: o.preset,
    region: o.region,
    context: typeof o.context === 'string' ? o.context : undefined,
    tick: o.tick,
    nextId: o.nextId,
    allergenAdhesion: Number(o.allergenAdhesion ?? 0),
    dayNumber: Number(o.dayNumber ?? 1),
    nextMealIndex: Number(o.nextMealIndex ?? 0),
    env: (o.env as Partial<Record<EnvVarId, number>>) ?? {},
    biome,
    nodes: o.nodes as MicrobeNode[],
    events: Array.isArray(o.events) ? (o.events as string[]) : [],
  };
}

export function encodeLabState(state: LabStateV1): string {
  return encodeBase64Url(JSON.stringify(state));
}

export function decodeLabState(encoded: string): LabStateV1 | null {
  const json = decodeBase64Url(encoded.trim());
  if (!json) return null;
  try {
    return parseLabState(JSON.parse(json));
  } catch {
    return null;
  }
}

/** Build share URL with preset/region/context + compact `lab` blob (STATE-01 / STATE-02). */
export function buildShareUrl(state: LabStateV1, baseUrl = window.location.href): string {
  const url = new URL(baseUrl);
  url.searchParams.set('preset', state.preset);
  url.searchParams.set('region', state.region);
  if (state.context) url.searchParams.set('context', state.context);
  else url.searchParams.delete('context');

  url.searchParams.set('tick', String(Math.round(state.tick)));
  url.searchParams.set('integrity', round4(state.biome.integrity).toString());
  url.searchParams.set('inflammation', round4(state.biome.inflammation).toString());
  url.searchParams.set('lab', encodeLabState(state));

  return url.toString();
}

export function parseLabFromUrl(search = window.location.search): LabStateV1 | null {
  const params = new URLSearchParams(search);
  const encoded = params.get('lab');
  if (!encoded) return null;
  const state = decodeLabState(encoded);
  if (!state) return null;

  const preset = params.get('preset');
  const region = params.get('region');
  if (preset && isPresetId(preset)) state.preset = preset;
  if (region && isRegionId(region)) state.region = region;
  const context = params.get('context');
  state.context = context ?? undefined;

  return state;
}

export function saveLabStateToStorage(state: LabStateV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function loadStoredLabState(): LabStateV1 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseLabState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearStoredLabState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isResumeDismissed(): boolean {
  try {
    return sessionStorage.getItem(RESUME_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissResumePrompt(): void {
  try {
    sessionStorage.setItem(RESUME_DISMISS_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Offer resume when local snapshot is meaningfully ahead of a fresh URL load (STATE-03). */
export function shouldOfferResume(stored: LabStateV1, hasUrlLab: boolean): boolean {
  if (hasUrlLab || isResumeDismissed()) return false;
  if (Date.now() - stored.savedAt > RESUME_MAX_AGE_MS) return false;
  if (stored.tick < 180 && stored.events.length < 2) return false;
  return true;
}

export function syncUrlFromLabState(state: LabStateV1): void {
  const url = new URL(window.location.href);
  url.searchParams.set('preset', state.preset);
  url.searchParams.set('region', state.region);
  if (state.context) url.searchParams.set('context', state.context);
  else url.searchParams.delete('context');
  url.searchParams.set('tick', String(Math.round(state.tick)));
  url.searchParams.set('integrity', round4(state.biome.integrity).toString());
  url.searchParams.set('inflammation', round4(state.biome.inflammation).toString());
  url.searchParams.set('lab', encodeLabState(state));
  window.history.replaceState(null, '', url.toString());
}
