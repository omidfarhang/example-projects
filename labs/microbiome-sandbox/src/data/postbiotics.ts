import type { BiomeEffect } from './strains';
import type { RegionId } from './regions';

export type PostbioticId = 'scfa_mix' | 'butyrate' | 'propionate' | 'acetate';

export interface PostbioticDef {
  id: PostbioticId;
  name: string;
  label: string;
  description: string;
  /** Direct biome shift — raises postbioticLevel scalar (not microbe nodes). */
  effects: BiomeEffect;
  /** Plain-language causal explanation for impact preview. */
  why: string;
  preferredRegions: RegionId[];
  preferredMultiplier: number;
  otherMultiplier: number;
}

export const POSTBIOTICS: Record<PostbioticId, PostbioticDef> = {
  scfa_mix: {
    id: 'scfa_mix',
    name: 'SCFA mix',
    label: 'SCFA MIX (BUTYRATE + PROPIONATE + ACETATE)',
    description: 'Broad short-chain fatty acid postbiotic surge — barrier recovery after fiber fermentation.',
    effects: { postbioticLevel: 0.3, integrity: 0.12, inflammation: -0.15 },
    why: 'Mixed SCFA metabolites from fermentation — integrity recovers and inflammation eases across gut mucosa.',
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.55,
  },
  butyrate: {
    id: 'butyrate',
    name: 'butyrate',
    label: 'BUTYRATE',
    description: 'Primary colonocyte fuel — strongest barrier-support postbiotic.',
    effects: { postbioticLevel: 0.25, integrity: 0.18, inflammation: -0.12 },
    why: 'Butyrate feeds colonocytes directly — tight junction repair and anti-inflammatory signaling in gut epithelium.',
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.5,
  },
  propionate: {
    id: 'propionate',
    name: 'propionate',
    label: 'PROPIONATE',
    description: 'Gluconeogenic SCFA — supports commensal ecology and metabolic balance.',
    effects: { postbioticLevel: 0.15, inflammation: -0.08, commensalVitality: 0.1 },
    why: 'Propionate modulates liver metabolism and nourishes commensal neighbors — mild anti-inflammatory effect.',
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.45,
  },
  acetate: {
    id: 'acetate',
    name: 'acetate',
    label: 'ACETATE',
    description: 'Most abundant SCFA — mild acidification and barrier support in gut and oral niches.',
    effects: { postbioticLevel: 0.12, ph: -0.08, phMin: 5.0, integrity: 0.06 },
    why: 'Acetate acidifies local pH and provides mild barrier support — common output of oral and gut fermentation.',
    preferredRegions: ['gut', 'oral'],
    preferredMultiplier: 1,
    otherMultiplier: 0.6,
  },
};

export const POSTBIOTIC_LIST = Object.values(POSTBIOTICS);

export function getPostbiotic(id: PostbioticId): PostbioticDef {
  return POSTBIOTICS[id];
}

export function postbioticRegionMultiplier(def: PostbioticDef, region: RegionId): number {
  return def.preferredRegions.includes(region) ? def.preferredMultiplier : def.otherMultiplier;
}
