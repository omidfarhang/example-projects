import type { RegionId } from './regions';

/** Canonical probiotic strain IDs used by inoculations and products. */
export type StrainId =
  | 'lrham'
  | 'lacid'
  | 'lcasei'
  | 'lsaliv'
  | 'lreuteri'
  | 'blactis'
  | 'blongum'
  | 'bbifidum'
  | 'binf'
  | 'lplant'
  | 'lbulgaricus'
  | 'sthermo'
  | 'sboul'
  | 'ssaliv_k12'
  | 'ssaliv_m18';

export type PrebioticId = 'inulin' | 'fos';

export interface BiomeEffect {
  ph?: number;
  phMin?: number;
  phMax?: number;
  inflammation?: number;
  integrity?: number;
  biofilm?: number;
  postbioticLevel?: number;
  moisture?: number;
  commensalVitality?: number;
  yeastVitality?: number;
}

export interface StrainDef {
  id: StrainId;
  name: string;
  spawnCount: number;
  effects?: BiomeEffect;
  /** Regions where this strain is commonly used (UI hint only). */
  commonRegions?: RegionId[];
}

export interface PrebioticDef {
  id: PrebioticId;
  name: string;
  spawnCount: number;
}

export const STRAINS: Record<StrainId, StrainDef> = {
  lrham: {
    id: 'lrham',
    name: 'L. rhamnosus',
    spawnCount: 16,
    effects: { inflammation: -0.18, integrity: 0.1 },
    commonRegions: ['ear', 'scalp', 'nose', 'vaginal'],
  },
  lacid: {
    id: 'lacid',
    name: 'L. acidophilus',
    spawnCount: 18,
    effects: { ph: -0.5, phMin: 3.8, phMax: 7, biofilm: -0.2 },
    commonRegions: ['oral', 'skin', 'vaginal', 'gut'],
  },
  lcasei: {
    id: 'lcasei',
    name: 'L. casei',
    spawnCount: 14,
    effects: { inflammation: -0.12, integrity: 0.08 },
    commonRegions: ['gut', 'oral'],
  },
  lsaliv: {
    id: 'lsaliv',
    name: 'L. salivarius',
    spawnCount: 18,
    effects: { ph: -0.2, phMin: 5.5, biofilm: -0.15 },
    commonRegions: ['oral'],
  },
  lreuteri: {
    id: 'lreuteri',
    name: 'L. reuteri',
    spawnCount: 12,
    effects: { inflammation: -0.14, integrity: 0.09, ph: -0.15, phMin: 4.0 },
    commonRegions: ['gut', 'oral', 'vaginal'],
  },
  blactis: {
    id: 'blactis',
    name: 'B. lactis',
    spawnCount: 14,
    effects: { commensalVitality: 0.15, integrity: 0.07, postbioticLevel: 0.04 },
    commonRegions: ['gut'],
  },
  blongum: {
    id: 'blongum',
    name: 'B. longum',
    spawnCount: 12,
    effects: { commensalVitality: 0.12, integrity: 0.08, postbioticLevel: 0.05 },
    commonRegions: ['gut'],
  },
  bbifidum: {
    id: 'bbifidum',
    name: 'B. bifidum',
    spawnCount: 12,
    effects: { commensalVitality: 0.14, integrity: 0.06, postbioticLevel: 0.04 },
    commonRegions: ['gut'],
  },
  binf: {
    id: 'binf',
    name: 'B. infantis',
    spawnCount: 14,
    effects: { commensalVitality: 0.2, integrity: 0.08 },
    commonRegions: ['nose', 'gut'],
  },
  lplant: {
    id: 'lplant',
    name: 'L. plantarum',
    spawnCount: 16,
    effects: { inflammation: -0.18, integrity: 0.1 },
    commonRegions: ['gut'],
  },
  lbulgaricus: {
    id: 'lbulgaricus',
    name: 'L. bulgaricus',
    spawnCount: 10,
    effects: { ph: -0.25, phMin: 5.0, biofilm: -0.1 },
    commonRegions: ['oral', 'gut'],
  },
  sthermo: {
    id: 'sthermo',
    name: 'S. thermophilus',
    spawnCount: 10,
    effects: { ph: -0.15, phMin: 5.2 },
    commonRegions: ['oral', 'gut'],
  },
  sboul: {
    id: 'sboul',
    name: 'S. boulardii',
    spawnCount: 14,
    effects: { yeastVitality: -0.25, inflammation: -0.12 },
    commonRegions: ['oral', 'gut'],
  },
  ssaliv_k12: {
    id: 'ssaliv_k12',
    name: 'S. salivarius K12',
    spawnCount: 16,
    effects: { biofilm: -0.18, ph: -0.12, phMin: 5.5, inflammation: -0.1, moisture: 0.08 },
    commonRegions: ['oral', 'nose', 'ear'],
  },
  ssaliv_m18: {
    id: 'ssaliv_m18',
    name: 'S. salivarius M18',
    spawnCount: 16,
    effects: { biofilm: -0.22, ph: -0.1, phMin: 5.5, integrity: 0.06 },
    commonRegions: ['oral', 'nose', 'ear'],
  },
};

export const PREBIOTICS: Record<PrebioticId, PrebioticDef> = {
  inulin: { id: 'inulin', name: 'inulin', spawnCount: 20 },
  fos: { id: 'fos', name: 'FOS', spawnCount: 18 },
};

export const STRAIN_LIST = Object.values(STRAINS);

export function getStrain(id: StrainId): StrainDef {
  return STRAINS[id];
}
