import { ARTICLES, type ArticleKey } from './articles';
import type { RegionId } from './regions';

/** Canonical strain IDs used by inoculations, products, and the strain library. */
export type StrainId =
  | 'lrham'
  | 'lacid'
  | 'lcasei'
  | 'lparacasei'
  | 'lsaliv'
  | 'lreuteri'
  | 'lgasseri'
  | 'lferment'
  | 'blactis'
  | 'blongum'
  | 'bbifidum'
  | 'bbreve'
  | 'binf'
  | 'lplant'
  | 'lbulgaricus'
  | 'sthermo'
  | 'sboul'
  | 'ssaliv_k12'
  | 'ssaliv_m18'
  | 'sepidermidis';

export type PrebioticId = 'inulin' | 'fos' | 'gos' | 'resistant_starch' | 'pectin' | 'beta_glucan';

export type StrainKind = 'probiotic' | 'commensal';

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
  /** Probiotic (beneficial) or commensal (neutral resident). Default: probiotic. */
  kind?: StrainKind;
  spawnCount: number;
  effects?: BiomeEffect;
  /** Regions where this strain is commonly used (UI hint only). */
  commonRegions?: RegionId[];
  /** Plain-language causal explanation for impact preview. */
  why: string;
  /** Optional blog article backing this strain (CONTENT-02). */
  articleKey?: ArticleKey;
  articleClaim?: string;
}

export interface PrebioticDef {
  id: PrebioticId;
  name: string;
  spawnCount: number;
  /** Regions where this substrate is commonly used (UI hint only). */
  commonRegions?: RegionId[];
  why: string;
}

export const STRAINS: Record<StrainId, StrainDef> = {
  lrham: {
    id: 'lrham',
    name: 'L. rhamnosus',
    spawnCount: 16,
    effects: { inflammation: -0.18, integrity: 0.1 },
    commonRegions: ['ear', 'scalp', 'nose', 'vaginal'],
    why: 'Barrier-supporting strain that calms mucosal inflammation and strengthens epithelial integrity.',
    articleKey: 'allergies',
    articleClaim: 'Featured for calming allergen-driven inflammation and restoring mucosal barrier integrity',
  },
  lacid: {
    id: 'lacid',
    name: 'L. acidophilus',
    spawnCount: 18,
    effects: { ph: -0.5, phMin: 3.8, phMax: 7, biofilm: -0.2 },
    commonRegions: ['oral', 'skin', 'vaginal', 'gut'],
    why: 'Acidifies local pH and disrupts pathogen biofilm — unfavorable environment for yeast and alkaliphiles.',
    articleKey: 'candidiasis',
    articleClaim: 'Acidifying lactobacillus cited for countering Candida-favoring alkaline niches',
  },
  lcasei: {
    id: 'lcasei',
    name: 'L. casei',
    spawnCount: 14,
    effects: { inflammation: -0.12, integrity: 0.08 },
    commonRegions: ['gut', 'oral'],
    why: 'Reduces inflammatory signaling while supporting tight junction repair.',
  },
  lparacasei: {
    id: 'lparacasei',
    name: 'L. paracasei',
    spawnCount: 14,
    effects: { inflammation: -0.14, integrity: 0.09, postbioticLevel: 0.03 },
    commonRegions: ['gut', 'oral', 'nose'],
    why: 'Immune-modulatory strain with mild SCFA contribution — common in fermented dairy and supplements.',
    articleKey: 'allergies',
    articleClaim: 'Immune-modulatory strain discussed for balancing hypersensitive mucosal responses',
  },
  lsaliv: {
    id: 'lsaliv',
    name: 'L. salivarius',
    spawnCount: 18,
    effects: { ph: -0.2, phMin: 5.5, biofilm: -0.15 },
    commonRegions: ['oral'],
    why: 'Oral lactic acid producer — lowers pH and clears biofilm in saliva film.',
    articleKey: 'candidiasis',
    articleClaim: 'Oral lactobacillus cited for thrush recovery via saliva-film acidification',
  },
  lreuteri: {
    id: 'lreuteri',
    name: 'L. reuteri',
    spawnCount: 12,
    effects: { inflammation: -0.14, integrity: 0.09, ph: -0.15, phMin: 4.0 },
    commonRegions: ['gut', 'oral', 'vaginal'],
    why: 'Anti-inflammatory reuterin producer that acidifies niche and supports barrier recovery.',
  },
  lgasseri: {
    id: 'lgasseri',
    name: 'L. gasseri',
    spawnCount: 14,
    effects: { inflammation: -0.16, integrity: 0.1, ph: -0.12, phMin: 4.2 },
    commonRegions: ['vaginal', 'oral', 'gut'],
    why: 'Vaginal and oral Lactobacillus — acidifies mucosa and calms inflammatory signaling.',
  },
  lferment: {
    id: 'lferment',
    name: 'L. fermentum',
    spawnCount: 12,
    effects: { ph: -0.18, phMin: 5.0, postbioticLevel: 0.05, inflammation: -0.1 },
    commonRegions: ['gut', 'oral'],
    why: 'Fermentation specialist — acidifies lumen and raises SCFA from dietary substrates.',
  },
  blactis: {
    id: 'blactis',
    name: 'B. lactis',
    spawnCount: 14,
    effects: { commensalVitality: 0.15, integrity: 0.07, postbioticLevel: 0.04 },
    commonRegions: ['gut'],
    why: 'Gut bifidobacterium that boosts commensal neighbors and contributes SCFA metabolites.',
    articleKey: 'lifecycle',
    articleClaim: 'Bifidobacterium strain that converts prebiotic fiber into postbiotic SCFA',
  },
  blongum: {
    id: 'blongum',
    name: 'B. longum',
    spawnCount: 12,
    effects: { commensalVitality: 0.12, integrity: 0.08, postbioticLevel: 0.05 },
    commonRegions: ['gut'],
    why: 'Colonizes gut lumen, supports commensal ecology, and raises postbiotic SCFA levels.',
  },
  bbifidum: {
    id: 'bbifidum',
    name: 'B. bifidum',
    spawnCount: 12,
    effects: { commensalVitality: 0.14, integrity: 0.06, postbioticLevel: 0.04 },
    commonRegions: ['gut'],
    why: 'Infant-associated bifidobacterium that nourishes commensals and produces SCFA.',
  },
  bbreve: {
    id: 'bbreve',
    name: 'B. breve',
    spawnCount: 13,
    effects: { commensalVitality: 0.16, integrity: 0.07, postbioticLevel: 0.05 },
    commonRegions: ['gut'],
    why: 'Early-life bifidobacterium — supports commensal ecology and SCFA output in infant-style niches.',
    articleKey: 'lifestage',
    articleClaim: 'Early-life bifidobacterium discussed for age-specific commensal support',
  },
  binf: {
    id: 'binf',
    name: 'B. infantis',
    spawnCount: 14,
    effects: { commensalVitality: 0.2, integrity: 0.08 },
    commonRegions: ['nose', 'gut'],
    why: 'Early-life commensal booster — strengthens resident flora and barrier in airway niches.',
    articleKey: 'lifestage',
    articleClaim: 'Infant-associated bifidobacterium highlighted in early-life microbiome training',
  },
  lplant: {
    id: 'lplant',
    name: 'L. plantarum',
    spawnCount: 16,
    effects: { inflammation: -0.18, integrity: 0.1 },
    commonRegions: ['gut'],
    why: 'Fermentation workhorse — anti-inflammatory and barrier-supporting in gut lumen.',
    articleKey: 'lifecycle',
    articleClaim: 'Core probiotic in the prebiotic → probiotic → postbiotic lifecycle chain',
  },
  lbulgaricus: {
    id: 'lbulgaricus',
    name: 'L. bulgaricus',
    spawnCount: 10,
    effects: { ph: -0.25, phMin: 5.0, biofilm: -0.1 },
    commonRegions: ['oral', 'gut'],
    why: 'Yogurt culture strain that acidifies and reduces biofilm in dairy-fermented niches.',
  },
  sthermo: {
    id: 'sthermo',
    name: 'S. thermophilus',
    spawnCount: 10,
    effects: { ph: -0.15, phMin: 5.2 },
    commonRegions: ['oral', 'gut'],
    why: 'Thermophilic starter culture — mild acidification typical of fermented dairy.',
  },
  sboul: {
    id: 'sboul',
    name: 'S. boulardii',
    spawnCount: 14,
    effects: { yeastVitality: -0.25, inflammation: -0.12 },
    commonRegions: ['oral', 'gut'],
    why: 'Probiotic yeast competitor — suppresses Candida overgrowth and lowers inflammation.',
    articleKey: 'candidiasis',
    articleClaim: 'Probiotic yeast competitor cited for oral and gut Candida overgrowth',
  },
  ssaliv_k12: {
    id: 'ssaliv_k12',
    name: 'S. salivarius K12',
    spawnCount: 16,
    effects: { biofilm: -0.18, ph: -0.12, phMin: 5.5, inflammation: -0.1, moisture: 0.08 },
    commonRegions: ['oral', 'nose', 'ear'],
    why: 'BLIS K12 colonizes saliva film — clears biofilm, restores moisture, and calms irritated mucosa.',
    articleKey: 'allergies',
    articleClaim: 'BLIS K12 discussed for airway and oral mucosa barrier support',
  },
  ssaliv_m18: {
    id: 'ssaliv_m18',
    name: 'S. salivarius M18',
    spawnCount: 16,
    effects: { biofilm: -0.22, ph: -0.1, phMin: 5.5, integrity: 0.06 },
    commonRegions: ['oral', 'nose', 'ear'],
    why: 'BLIS M18 targets dental plaque biofilm and supports gum-line barrier integrity.',
  },
  sepidermidis: {
    id: 'sepidermidis',
    name: 'S. epidermidis',
    kind: 'commensal',
    spawnCount: 20,
    effects: { biofilm: -0.15 },
    commonRegions: ['skin', 'scalp'],
    why: 'Skin commensal — competes for biofilm attachment sites and supports acid mantle balance.',
  },
};

export const PREBIOTICS: Record<PrebioticId, PrebioticDef> = {
  inulin: {
    id: 'inulin',
    name: 'inulin',
    spawnCount: 20,
    commonRegions: ['gut'],
    why: 'Soluble chicory-root fiber — probiotics convert nearby inulin into postbiotic SCFA over time.',
  },
  fos: {
    id: 'fos',
    name: 'FOS',
    spawnCount: 18,
    commonRegions: ['gut'],
    why: 'Fructooligosaccharide prebiotic that feeds bifidobacteria; converts to SCFA near probiotics.',
  },
  gos: {
    id: 'gos',
    name: 'GOS',
    spawnCount: 16,
    commonRegions: ['gut'],
    why: 'Galactooligosaccharides mimic human milk oligosaccharides — selective fuel for bifidobacteria.',
  },
  resistant_starch: {
    id: 'resistant_starch',
    name: 'resistant starch',
    spawnCount: 22,
    commonRegions: ['gut'],
    why: 'RS3 starch escapes small-intestine digestion — fermented in colon to butyrate-rich SCFA.',
  },
  pectin: {
    id: 'pectin',
    name: 'pectin',
    spawnCount: 18,
    commonRegions: ['gut', 'oral'],
    why: 'Soluble fruit fiber — slow fermentation supports gradual SCFA rise and moisture retention.',
  },
  beta_glucan: {
    id: 'beta_glucan',
    name: 'beta-glucan',
    spawnCount: 16,
    commonRegions: ['gut'],
    why: 'Oat/barley soluble fiber — feeds lactobacilli and bifidobacteria with immune-modulatory substrate.',
  },
};

export const STRAIN_LIST = Object.values(STRAINS);

export const PREBIOTIC_LIST = Object.values(PREBIOTICS);

export function getStrain(id: StrainId): StrainDef {
  return STRAINS[id];
}

/** Native title tooltip — article title appended when a claim is linked (CONTENT-02). */
export function formatStrainTooltip(strain: StrainDef): string {
  const parts = [strain.why];
  if (strain.articleClaim && strain.articleKey) {
    parts.push(`${strain.articleClaim} (${ARTICLES[strain.articleKey].title})`);
  }
  return parts.join(' · ');
}
