import { REGION_ENV_CONTROLS, type EnvVarId } from '../data/envVars';
import { PRESETS, type PresetId } from '../data/presets';
import type { RegionId } from '../data/regions';
import type { SimEngine } from '../sim/engine';
import type { BiomeState, MicrobeNode, MicrobeType } from '../sim/types';

export const LAB_STATE_VERSION = 1 as const;
export const STORAGE_KEY = 'bd-lab-session';
export const RESUME_DISMISS_KEY = 'bd-resume-dismissed';
export const MAX_STORED_EVENTS = 60;
export const RESUME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const HASH_LAB_PREFIX = 'lab=';

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

/** Compact node tuple for smaller share payloads. */
type CompactNode = [number, MicrobeType, string, number, number, number, number, number, number];

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function compactNodes(nodes: MicrobeNode[]): CompactNode[] {
  return nodes.map((n) => [
    n.id,
    n.type,
    n.strain,
    round3(n.vitality),
    round3(n.x),
    round3(n.y),
    round3(n.z),
    round3(n.vx),
    round3(n.vy),
  ]);
}

function expandNodes(raw: unknown): MicrobeNode[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    if (Array.isArray(entry) && entry.length >= 9) {
      const [id, type, strain, vitality, x, y, z, vx, vy] = entry;
      return {
        id: Number(id),
        type: type as MicrobeType,
        strain: String(strain),
        vitality: Number(vitality),
        x: Number(x),
        y: Number(y),
        z: Number(z),
        vx: Number(vx),
        vy: Number(vy),
      };
    }
    return entry as MicrobeNode;
  });
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
    nodes: expandNodes(o.nodes),
    events: Array.isArray(o.events) ? (o.events as string[]).slice(-MAX_STORED_EVENTS) : [],
  };
}

/** JSON payload for encode — compact node tuples, trimmed events. */
function serializeForWire(state: LabStateV1): string {
  return JSON.stringify({
    v: state.v,
    savedAt: state.savedAt,
    preset: state.preset,
    region: state.region,
    context: state.context,
    tick: state.tick,
    nextId: state.nextId,
    allergenAdhesion: round3(state.allergenAdhesion),
    dayNumber: state.dayNumber,
    nextMealIndex: state.nextMealIndex,
    env: state.env,
    biome: {
      integrity: round3(state.biome.integrity),
      inflammation: round3(state.biome.inflammation),
      immuneActivity: round3(state.biome.immuneActivity),
      biofilm: round3(state.biome.biofilm),
      sugarLoad: round3(state.biome.sugarLoad),
      postbioticLevel: round3(state.biome.postbioticLevel),
    },
    nodes: compactNodes(state.nodes),
    events: state.events.slice(-30),
  });
}

export function encodeLabState(state: LabStateV1): string {
  return encodeBase64Url(serializeForWire(state));
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

function readLabPayload(url: URL): string | null {
  if (url.hash.startsWith(`#${HASH_LAB_PREFIX}`)) {
    return url.hash.slice(HASH_LAB_PREFIX.length + 1);
  }
  return url.searchParams.get('lab');
}

function applyBrowseParams(state: LabStateV1, url: URL): void {
  const preset = url.searchParams.get('preset');
  const region = url.searchParams.get('region');
  if (preset && isPresetId(preset)) state.preset = preset;
  if (region && isRegionId(region)) state.region = region;
  const context = url.searchParams.get('context');
  state.context = context ?? undefined;
}

/** Strip oversized legacy query params (fixes HTTP 431 on reload). */
export function stripLegacyLabQuery(): void {
  const url = new URL(window.location.href);
  if (
    !url.searchParams.has('lab') &&
    !url.searchParams.has('tick') &&
    !url.searchParams.has('integrity') &&
    !url.searchParams.has('inflammation')
  ) {
    return;
  }
  url.searchParams.delete('lab');
  url.searchParams.delete('tick');
  url.searchParams.delete('integrity');
  url.searchParams.delete('inflammation');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Share URL: preset/region/context in query; full checkpoint in `#lab=` hash.
 * Hash is not sent to the server — avoids HTTP 431 from oversized request lines.
 */
export function buildShareUrl(state: LabStateV1, baseUrl = window.location.href): string {
  const url = new URL(baseUrl);
  url.searchParams.set('preset', state.preset);
  url.searchParams.set('region', state.region);
  if (state.context) url.searchParams.set('context', state.context);
  else url.searchParams.delete('context');
  url.searchParams.delete('lab');
  url.searchParams.delete('tick');
  url.searchParams.delete('integrity');
  url.searchParams.delete('inflammation');
  url.hash = `${HASH_LAB_PREFIX}${encodeLabState(state)}`;
  return url.toString();
}

export function parseLabFromUrl(href = window.location.href): LabStateV1 | null {
  const url = new URL(href);
  const encoded = readLabPayload(url);
  if (!encoded) return null;
  const state = decodeLabState(encoded);
  if (!state) return null;
  applyBrowseParams(state, url);
  return state;
}

export function hasLabCheckpoint(href = window.location.href): boolean {
  const url = new URL(href);
  return Boolean(readLabPayload(url));
}

/** Sync only lightweight browse params — never put checkpoint blob in query string. */
export function syncBrowseParams(preset: PresetId, region: RegionId, context?: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('preset', preset);
  url.searchParams.set('region', region);
  if (context) url.searchParams.set('context', context);
  else url.searchParams.delete('context');
  url.searchParams.delete('lab');
  url.searchParams.delete('tick');
  url.searchParams.delete('integrity');
  url.searchParams.delete('inflammation');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export function saveLabStateToStorage(state: LabStateV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeForWire(state));
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

export function shouldOfferResume(stored: LabStateV1, hasUrlLab: boolean): boolean {
  if (hasUrlLab || isResumeDismissed()) return false;
  if (Date.now() - stored.savedAt > RESUME_MAX_AGE_MS) return false;
  if (stored.tick < 180 && stored.events.length < 2) return false;
  return true;
}
