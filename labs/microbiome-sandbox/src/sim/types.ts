export type MicrobeType = 'probiotic' | 'commensal' | 'pathogen' | 'allergen' | 'yeast' | 'prebiotic' | 'postbiotic';

export interface MicrobeNode {
  id: number;
  type: MicrobeType;
  strain: string;
  vitality: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
}

export interface BiomeState {
  ph: number;
  moisture: number;
  temperature: number;
  sebum: number;
  cerumen: number;
  salinity: number;
  oxygenation: number;
  sweatRate: number;
  oxygenTension: number;
  integrity: number;
  inflammation: number;
  biofilm: number;
  sugarLoad: number;
  probioticCount: number;
  pathogenCount: number;
  allergenCount: number;
  commensalCount: number;
  prebioticCount: number;
  /** Mean vitality of live prebiotic nodes (0–1); drops as probiotics convert substrate. */
  prebioticSubstrateLevel: number;
  postbioticLevel: number;
}

export interface SimSnapshot {
  tick: number;
  biome: BiomeState;
  nodes: MicrobeNode[];
  events: string[];
}
