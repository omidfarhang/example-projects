import type { PostbioticId } from './postbiotics';
import type { StressorBiomeDelta } from './stressors';
import { STRAINS, type PrebioticId, type StrainId } from './strains';

/** Shared schema for regional care and legacy inoculation IDs (ENG-01). */
export interface InoculationImpactAdd {
  label: string;
  count: number;
  type: 'probiotic' | 'commensal' | 'prebiotic';
}

export interface InoculationDef {
  id: string;
  /** Apply catalog strain (spawn + biome effects). */
  strain?: StrainId;
  /** Apply catalog prebiotic substrate. */
  prebiotic?: PrebioticId;
  /** Apply catalog postbiotic metabolite. */
  postbiotic?: PostbioticId;
  /** Direct biome mutation when not delegating to catalog. */
  biome?: StressorBiomeDelta;
  /** Extra allergen adhesion delta (saline mist). */
  allergenAdhesionDelta?: number;
  /** Event log line — defaults derived when redirecting to catalog entries. */
  eventLog?: string;
  /** Impact preview causal note. */
  why: string;
  impactAdds?: InoculationImpactAdd[];
}

export const INOCULATIONS: Record<string, InoculationDef> = {
  // ── Regional care (non-strain) ────────────────────────────────────────────
  scfa: {
    id: 'scfa',
    postbiotic: 'scfa_mix',
    why: 'Direct SCFA postbiotic surge — barrier recovery and inflammation easing',
  },
  saline_mist: {
    id: 'saline_mist',
    biome: { moisture: 0.15, moistureMax: 1, inflammation: -0.1 },
    allergenAdhesionDelta: -0.2,
    eventLog: 'Saline mist — moisture restored, inflammation easing',
    why: 'Saline mist — moisture restored, allergen adhesion reduced, inflammation easing',
  },
  ph_serum: {
    id: 'ph_serum',
    biome: { ph: -0.35, phMin: 3.8, phMax: 7, moisture: 0.05, moistureMax: 1 },
    eventLog: 'pH balancing serum — local acidity restored',
    why: 'pH balancing serum — restores local acidity and acid mantle',
  },
  s_epidermidis: {
    id: 's_epidermidis',
    strain: 'sepidermidis',
    why: 'Commensal seeding — competes for biofilm attachment sites on epithelium',
    impactAdds: [{ label: 'S. epidermidis', count: 20, type: 'commensal' }],
  },

  // ── Legacy strain shortcuts (region-gated via regionalCare or deep links) ───
  lrham: {
    id: 'lrham',
    strain: 'lrham',
    eventLog: 'L. rhamnosus inoculated — competing for attachment',
    why: 'Barrier-supporting strain that calms mucosal inflammation and strengthens epithelial integrity.',
  },
  lacid: {
    id: 'lacid',
    strain: 'lacid',
    eventLog: 'L. acidophilus acidifying local pH',
    why: 'Acidifies local pH and disrupts pathogen biofilm — unfavorable environment for yeast and alkaliphiles.',
  },
  binf: {
    id: 'binf',
    strain: 'binf',
    eventLog: 'B. infantis applied — commensal support boosted',
    why: 'Early-life commensal booster — strengthens resident flora and barrier in airway and gut niches.',
  },
  lplant: {
    id: 'lplant',
    strain: 'lplant',
    eventLog: 'L. plantarum seeded — competing for attachment',
    why: 'Fermentation workhorse — anti-inflammatory and barrier-supporting in gut lumen.',
  },
  lsaliv: {
    id: 'lsaliv',
    strain: 'lsaliv',
    eventLog: 'L. salivarius applied — oral commensal niche restored',
    why: 'Oral lactic acid producer — lowers pH and clears biofilm in saliva film.',
  },
  sboul: {
    id: 'sboul',
    strain: 'sboul',
    eventLog: 'S. boulardii seeded — antifungal competition active',
    why: 'Probiotic yeast competitor — suppresses Candida overgrowth and lowers inflammation.',
  },
  lcasei: {
    id: 'lcasei',
    strain: 'lcasei',
    eventLog: 'L. casei inoculated — immune-modulatory strain active',
    why: 'Reduces inflammatory signaling while supporting tight junction repair.',
  },
  lreuteri: {
    id: 'lreuteri',
    strain: 'lreuteri',
    eventLog: 'L. reuteri applied — antimicrobial metabolites rising',
    why: 'Anti-inflammatory reuterin producer that acidifies niche and supports barrier recovery.',
  },
  blactis: {
    id: 'blactis',
    strain: 'blactis',
    eventLog: 'B. lactis seeded — bifidobacterial niche expanding',
    why: 'Gut bifidobacterium that boosts commensal neighbors and contributes SCFA metabolites.',
  },
  blongum: {
    id: 'blongum',
    strain: 'blongum',
    eventLog: 'B. longum applied — fiber fermenting commensals supported',
    why: 'Colonizes gut lumen, supports commensal ecology, and raises postbiotic SCFA levels.',
  },
  bbifidum: {
    id: 'bbifidum',
    strain: 'bbifidum',
    eventLog: 'B. bifidum inoculated — early-life commensal pattern',
    why: 'Infant-associated bifidobacterium that nourishes commensals and produces SCFA.',
  },
  lbulgaricus: {
    id: 'lbulgaricus',
    strain: 'lbulgaricus',
    eventLog: 'L. bulgaricus applied — yogurt culture acidifying',
    why: 'Yogurt culture strain that acidifies and reduces biofilm in dairy-fermented niches.',
  },
  sthermo: {
    id: 'sthermo',
    strain: 'sthermo',
    eventLog: 'S. thermophilus seeded — fermented dairy culture active',
    why: 'Thermophilic starter culture — mild acidification typical of fermented dairy.',
  },

  // ── Prebiotic aliases ───────────────────────────────────────────────────────
  prebiotic: {
    id: 'prebiotic',
    prebiotic: 'inulin',
    why: 'Soluble chicory-root fiber — probiotics convert nearby inulin into postbiotic SCFA over time.',
  },
  prebiotic_fos: {
    id: 'prebiotic_fos',
    prebiotic: 'fos',
    why: 'Fructooligosaccharide prebiotic that feeds bifidobacteria; converts to SCFA near probiotics.',
  },
};

export function getInoculation(id: string): InoculationDef | undefined {
  return INOCULATIONS[id];
}

/** Event log line for strain inoculations — custom per legacy ID or generic fallback. */
const STRAIN_EVENT_OVERRIDES: Partial<Record<StrainId, string>> = {
  ssaliv_k12: 'S. salivarius K12 applied — oral BLIS activity, biofilm competition',
  ssaliv_m18: 'S. salivarius M18 applied — dental plaque & gum niche restoration',
  lparacasei: 'L. paracasei inoculated — immune-modulatory strain active',
  lgasseri: 'L. gasseri applied — vaginal/oral acidification and barrier support',
  lferment: 'L. fermentum seeded — fermentation and SCFA production rising',
  bbreve: 'B. breve inoculated — infant-style bifidobacterial niche expanding',
  sepidermidis: 'S. epidermidis applied — commensal biofilm competition',
};

export function strainInoculationEventLog(strainId: StrainId): string {
  const byId = INOCULATIONS[strainId]?.eventLog;
  if (byId) return byId;
  const override = STRAIN_EVENT_OVERRIDES[strainId];
  if (override) return override;
  const strain = STRAINS[strainId];
  return `${strain.name} inoculated — strain colony forming`;
}
