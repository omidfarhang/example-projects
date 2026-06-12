import type { BiomeEffect, PrebioticId, StrainId } from './strains';
import type { RegionId } from './regions';

export type ProductId =
  | 'synbiotic_supplement'
  | 'oral_probiotic_lozenge'
  | 'vaginal_probiotic_capsule'
  | 'probiotic_topical_cream'
  | 'kefir_drink'
  | 'probiotic_yogurt'
  | 'kimchi'
  | 'sauerkraut'
  | 'kombucha'
  | 'miso';

export type ProductCategory = 'supplement' | 'lozenge' | 'fermented' | 'topical';

/** Delivery form — educational label (capsule vs lozenge vs food vs topical). */
export type ProductForm = 'capsule' | 'lozenge' | 'drink' | 'food' | 'topical';

export interface ProductStrainDose {
  id: StrainId;
  /** Multiplier on base spawnCount from strain catalog (1 = full dose). */
  dose: number;
}

export interface ProductPrebioticDose {
  id: PrebioticId;
  dose: number;
}

export interface ProductDef {
  id: ProductId;
  label: string;
  category: ProductCategory;
  form: ProductForm;
  description: string;
  /** Plain-language causal explanation for impact preview. */
  why: string;
  /** Strains delivered by this product (scaled by dose × region multiplier). */
  strains: ProductStrainDose[];
  prebiotics?: ProductPrebioticDose[];
  /** Extra biome shift after all spawns. */
  effects?: BiomeEffect;
  /** Regions where the product is most effective (oral/gut for foods). */
  preferredRegions: RegionId[];
  preferredMultiplier: number;
  otherMultiplier: number;
}

/** Multi-strain synbiotic capsule + FOS prebiotic. */
export const PRODUCTS: Record<ProductId, ProductDef> = {
  synbiotic_supplement: {
    id: 'synbiotic_supplement',
    label: 'MULTI-STRAIN SYNBIOTIC CAPSULE',
    category: 'supplement',
    form: 'capsule',
    description:
      'Eight-strain probiotic capsule with FOS prebiotic. Swallowed — not a lozenge.',
    why: 'Swallowed capsule releases eight gut/oral strains plus FOS — combined anti-inflammatory and barrier support after delivery.',
    strains: [
      { id: 'lacid', dose: 0.55 },
      { id: 'lcasei', dose: 0.5 },
      { id: 'lrham', dose: 0.5 },
      { id: 'lsaliv', dose: 0.45 },
      { id: 'lreuteri', dose: 0.45 },
      { id: 'blactis', dose: 0.5 },
      { id: 'blongum', dose: 0.45 },
      { id: 'bbifidum', dose: 0.45 },
    ],
    prebiotics: [{ id: 'fos', dose: 0.85 }],
    effects: { integrity: 0.06, inflammation: -0.08 },
    preferredRegions: ['gut', 'oral'],
    preferredMultiplier: 1,
    otherMultiplier: 0.65,
  },
  oral_probiotic_lozenge: {
    id: 'oral_probiotic_lozenge',
    label: 'ORAL PROBIOTIC LOZENGE',
    category: 'lozenge',
    form: 'lozenge',
    description:
      'S. salivarius K12 + M18 lozenge. Dissolves slowly in the mouth — targets oral, gum, throat, and ear niches; not swallowed as a capsule.',
    why: 'Dissolving lozenge seeds K12/M18 in saliva film — biofilm clearance and moisture restore calm irritated oral and airway mucosa.',
    strains: [
      { id: 'ssaliv_k12', dose: 1 },
      { id: 'ssaliv_m18', dose: 1 },
    ],
    effects: { biofilm: -0.15, moisture: 0.12, inflammation: -0.12, integrity: 0.08 },
    preferredRegions: ['oral', 'nose', 'ear'],
    preferredMultiplier: 1,
    otherMultiplier: 0.35,
  },
  vaginal_probiotic_capsule: {
    id: 'vaginal_probiotic_capsule',
    label: 'VAGINAL PROBIOTIC CAPSULE',
    category: 'supplement',
    form: 'capsule',
    description:
      'Insertable capsule with L. acidophilus, L. rhamnosus, and L. reuteri — targets vaginal Lactobacillus dominance.',
    why: 'Vaginal capsule seeds acidophilus/rhamnosus/reuteri — acidifies mucosa, calms inflammation, and restores barrier after alkaline stress.',
    strains: [
      { id: 'lacid', dose: 0.85 },
      { id: 'lrham', dose: 0.75 },
      { id: 'lreuteri', dose: 0.7 },
    ],
    effects: { ph: -0.35, phMin: 3.8, inflammation: -0.12, integrity: 0.08 },
    preferredRegions: ['vaginal'],
    preferredMultiplier: 1,
    otherMultiplier: 0.4,
  },
  probiotic_topical_cream: {
    id: 'probiotic_topical_cream',
    label: 'PROBIOTIC TOPICAL CREAM',
    category: 'topical',
    form: 'topical',
    description:
      'Skin/scalp cream with L. acidophilus and L. rhamnosus — supports acid mantle and commensal balance.',
    why: 'Topical lactobacilli restore skin pH and moisture — biofilm clearance and barrier support on epidermis and scalp.',
    strains: [
      { id: 'lacid', dose: 0.8 },
      { id: 'lrham', dose: 0.65 },
    ],
    effects: { ph: -0.2, phMin: 4.5, biofilm: -0.12, moisture: 0.08, inflammation: -0.1 },
    preferredRegions: ['skin', 'scalp'],
    preferredMultiplier: 1,
    otherMultiplier: 0.45,
  },
  kefir_drink: {
    id: 'kefir_drink',
    label: 'KEFIR DRINK',
    category: 'fermented',
    form: 'drink',
    description: 'Fermented milk drink with diverse Lactobacillus and Bifidobacterium species.',
    why: 'Fermented milk delivers diverse lactic acid bacteria — acidifies gut, raises SCFA, and restores moisture.',
    strains: [
      { id: 'lcasei', dose: 0.7 },
      { id: 'lacid', dose: 0.6 },
      { id: 'lreuteri', dose: 0.55 },
      { id: 'blactis', dose: 0.5 },
      { id: 'blongum', dose: 0.45 },
      { id: 'lbulgaricus', dose: 0.4 },
    ],
    effects: { postbioticLevel: 0.08, ph: -0.12, phMin: 5.0, moisture: 0.05 },
    preferredRegions: ['gut', 'oral'],
    preferredMultiplier: 1,
    otherMultiplier: 0.5,
  },
  probiotic_yogurt: {
    id: 'probiotic_yogurt',
    label: 'PROBIOTIC YOGURT',
    category: 'fermented',
    form: 'food',
    description: 'Cultured dairy with acidophilus, bulgaricus, thermophilus, and bifidobacteria.',
    why: 'Cultured dairy acidifies the gut lumen, clears biofilm, and supports barrier integrity via starter cultures.',
    strains: [
      { id: 'lacid', dose: 0.75 },
      { id: 'lbulgaricus', dose: 0.65 },
      { id: 'sthermo', dose: 0.6 },
      { id: 'blactis', dose: 0.5 },
      { id: 'lcasei', dose: 0.4 },
    ],
    effects: { ph: -0.18, phMin: 5.0, biofilm: -0.08, integrity: 0.05 },
    preferredRegions: ['gut', 'oral'],
    preferredMultiplier: 1,
    otherMultiplier: 0.55,
  },
  kimchi: {
    id: 'kimchi',
    label: 'KIMCHI (FERMENTED)',
    category: 'fermented',
    form: 'food',
    description: 'Fermented vegetables rich in L. plantarum, fiber, and lactic acid.',
    why: 'Fermented vegetables deliver L. plantarum plus inulin fiber — acidifies gut, lowers inflammation, and feeds SCFA production.',
    strains: [
      { id: 'lplant', dose: 0.9 },
      { id: 'lcasei', dose: 0.55 },
      { id: 'lsaliv', dose: 0.35 },
      { id: 'lreuteri', dose: 0.4 },
    ],
    prebiotics: [{ id: 'inulin', dose: 0.5 }],
    effects: { ph: -0.22, phMin: 5.2, postbioticLevel: 0.06, inflammation: -0.1 },
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.45,
  },
  sauerkraut: {
    id: 'sauerkraut',
    label: 'SAUERKRAUT (FERMENTED)',
    category: 'fermented',
    form: 'food',
    description: 'Fermented cabbage rich in L. plantarum and vegetable fiber.',
    why: 'Fermented cabbage delivers L. plantarum plus inulin fiber — acidifies gut lumen and feeds SCFA production.',
    strains: [
      { id: 'lplant', dose: 0.85 },
      { id: 'lcasei', dose: 0.5 },
      { id: 'lreuteri', dose: 0.35 },
    ],
    prebiotics: [{ id: 'inulin', dose: 0.35 }],
    effects: { ph: -0.18, phMin: 5.0, postbioticLevel: 0.05, inflammation: -0.08 },
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.5,
  },
  kombucha: {
    id: 'kombucha',
    label: 'KOMBUCHA DRINK',
    category: 'fermented',
    form: 'drink',
    description:
      'Fermented tea with lactic acid bacteria and S. boulardii — mild acidity with yeast competition.',
    why: 'Fermented tea acidifies gut/oral niches and introduces S. boulardii — competes with Candida while supporting lactic flora.',
    strains: [
      { id: 'lcasei', dose: 0.55 },
      { id: 'lacid', dose: 0.5 },
      { id: 'sboul', dose: 0.6 },
    ],
    effects: { ph: -0.1, phMin: 5.2, yeastVitality: -0.15, postbioticLevel: 0.04 },
    preferredRegions: ['gut', 'oral'],
    preferredMultiplier: 1,
    otherMultiplier: 0.48,
  },
  miso: {
    id: 'miso',
    label: 'MISO (FERMENTED)',
    category: 'fermented',
    form: 'food',
    description: 'Fermented soybean paste with diverse Lactobacillus and Bifidobacterium species.',
    why: 'Fermented soy paste delivers mixed lactobacilli and bifidobacteria — supports commensal ecology and SCFA in gut lumen.',
    strains: [
      { id: 'lcasei', dose: 0.6 },
      { id: 'lplant', dose: 0.55 },
      { id: 'bbifidum', dose: 0.45 },
      { id: 'blactis', dose: 0.4 },
    ],
    effects: { ph: -0.12, phMin: 5.4, postbioticLevel: 0.05, integrity: 0.04 },
    preferredRegions: ['gut'],
    preferredMultiplier: 1,
    otherMultiplier: 0.52,
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export function getProduct(id: ProductId): ProductDef {
  return PRODUCTS[id];
}

export function productRegionMultiplier(product: ProductDef, region: RegionId): number {
  return product.preferredRegions.includes(region)
    ? product.preferredMultiplier
    : product.otherMultiplier;
}
