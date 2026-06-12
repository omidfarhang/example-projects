import { buildRegionEnv, type RegionEnv } from './envVars';
import type { EpitheliumKind } from '../scene/epithelium/types';

export type RegionId = 'ear' | 'scalp' | 'nose' | 'oral' | 'skin' | 'vaginal' | 'gut';

export interface RegionBaseline {
  commensals: number;
  probiotics: { strain: string; count: number }[];
  pathogens?: { strain: string; count: number; kind: 'pathogen' | 'yeast' }[];
  prebiotics?: { strain: string; count: number }[];
  integrity?: number;
  inflammation?: number;
  biofilm?: number;
}

export interface RegionAction {
  id: string;
  label: string;
}

export interface RegionInoculation extends RegionAction {
  strain: string;
}

export interface RegionDef {
  id: RegionId;
  label: string;
  active: boolean;
  hotspot: [number, number, number];
  microGeometry: EpitheliumKind;
  zoomTitle: string;
  scaleLabel: string;
  defaultStrains: { probiotics: string[]; pathogens: string[]; allergens: string[] };
  env: RegionEnv;
  baseline: RegionBaseline;
  triggers: RegionAction[];
  inoculations: RegionInoculation[];
}

export const REGIONS: RegionDef[] = [
  {
    id: 'ear',
    label: 'Ear Canal',
    active: true,
    hotspot: [-0.52, 1.62, 0.08],
    microGeometry: 'ear',
    zoomTitle: 'EAR CANAL EPITHELIUM',
    scaleLabel: '80× magnification',
    defaultStrains: { probiotics: ['L. rhamnosus'], pathogens: ['S. aureus', 'P. aeruginosa'], allergens: ['Dust'] },
    env: buildRegionEnv({
      ph: 6.5,
      moisture: 0.68,
      temperature: 0.58,
      cerumen: 0.42,
      salinity: 0.55,
      oxygenation: 0.62,
    }),
    baseline: {
      commensals: 40,
      probiotics: [{ strain: 'L. rhamnosus', count: 8 }],
      pathogens: [{ strain: 'S. aureus', count: 5, kind: 'pathogen' }],
      inflammation: 0.06,
      biofilm: 0.08,
    },
    triggers: [
      { id: 'allergen', label: 'TRIGGER ALLERGEN SPIKE' },
      { id: 'dry_air', label: 'DRY AIR EXPOSURE' },
      { id: 'cerumen_impaction', label: 'CERUMEN IMPACTION' },
      { id: 'swim_exposure', label: 'SWIM / WATER EXPOSURE' },
    ],
    inoculations: [
      { id: 'lrham', label: 'SPRAY L. RHAMNOSUS', strain: 'L. rhamnosus' },
      { id: 'saline_mist', label: 'SALINE MIST', strain: 'saline_mist' },
    ],
  },
  {
    id: 'scalp',
    label: 'Scalp',
    active: true,
    hotspot: [0, 1.92, 0.12],
    microGeometry: 'scalp',
    zoomTitle: 'SCALP BARRIER CROSS-SECTION',
    scaleLabel: '200× magnification',
    defaultStrains: {
      probiotics: ['L. rhamnosus'],
      pathogens: ['C. albicans', 'S. aureus', 'Malassezia'],
      allergens: ['Dust'],
    },
    env: buildRegionEnv({
      ph: 5.8,
      moisture: 0.48,
      temperature: 0.56,
      sebum: 0.58,
      sweatRate: 0.32,
    }),
    baseline: {
      commensals: 30,
      probiotics: [{ strain: 'L. rhamnosus', count: 6 }],
      pathogens: [
        { strain: 'C. albicans', count: 8, kind: 'yeast' },
        { strain: 'S. aureus', count: 4, kind: 'pathogen' },
      ],
      biofilm: 0.12,
    },
    triggers: [
      { id: 'sebum_surge', label: 'SEBUM SURGE' },
      { id: 'harsh_shampoo', label: 'HARSH SHAMPOO (ALKALINE)' },
      { id: 'friction_irritant', label: 'FRICTION / IRRITANT' },
    ],
    inoculations: [
      { id: 'lrham', label: 'APPLY L. RHAMNOSUS', strain: 'L. rhamnosus' },
      { id: 's_epidermidis', label: 'APPLY S. EPIDERMIDIS', strain: 'S. epidermidis' },
      { id: 'ph_serum', label: 'pH BALANCING SERUM', strain: 'ph_serum' },
    ],
  },
  {
    id: 'nose',
    label: 'Nose / Sinus',
    active: true,
    hotspot: [0, 1.62, 0.38],
    microGeometry: 'sinus',
    zoomTitle: 'NASAL/RESPIRATORY EPITHELIUM',
    scaleLabel: '400× magnification',
    defaultStrains: {
      probiotics: ['L. rhamnosus', 'B. infantis'],
      pathogens: ['S. aureus', 'H. influenzae'],
      allergens: ['Pollen/Dust'],
    },
    env: buildRegionEnv({ ph: 6.8, moisture: 0.72, temperature: 0.54, oxygenation: 0.82 }),
    baseline: {
      commensals: 50,
      probiotics: [{ strain: 'L. rhamnosus', count: 8 }],
      pathogens: [
        { strain: 'S. aureus', count: 6, kind: 'pathogen' },
        { strain: 'H. influenzae', count: 4, kind: 'pathogen' },
      ],
      inflammation: 0.08,
    },
    triggers: [
      { id: 'allergen', label: 'TRIGGER ALLERGEN SPIKE' },
      { id: 'dry_air', label: 'DRY AIR EXPOSURE' },
      { id: 'histamine', label: 'HISTAMINE SURGE' },
    ],
    inoculations: [
      { id: 'lrham', label: 'SPRAY L. RHAMNOSUS', strain: 'L. rhamnosus' },
      { id: 'binf', label: 'APPLY B. INFANTIS', strain: 'B. infantis' },
      { id: 'saline_mist', label: 'SALINE MIST', strain: 'saline_mist' },
    ],
  },
  {
    id: 'oral',
    label: 'Oral / Mouth',
    active: true,
    hotspot: [0, 1.58, 0.22],
    microGeometry: 'oral',
    zoomTitle: 'ORAL MUCOSA CROSS-SECTION',
    scaleLabel: '350× magnification',
    defaultStrains: {
      probiotics: ['L. salivarius', 'L. acidophilus', 'S. boulardii'],
      pathogens: ['C. albicans', 'S. mutans'],
      allergens: ['Irritant'],
    },
    env: buildRegionEnv({
      ph: 6.8,
      moisture: 0.78,
      temperature: 0.57,
      salinity: 0.45,
      oxygenation: 0.88,
    }),
    baseline: {
      commensals: 45,
      probiotics: [{ strain: 'L. salivarius', count: 10 }],
      pathogens: [{ strain: 'C. albicans', count: 4, kind: 'yeast' }],
      biofilm: 0.06,
    },
    triggers: [
      { id: 'thrush_bloom', label: 'ORAL THRUSH BLOOM' },
      { id: 'dry_mouth', label: 'DRY MOUTH (XEROSTOMIA)' },
      { id: 'sugar_exposure', label: 'SUGAR / CARB EXPOSURE' },
    ],
    inoculations: [
      { id: 'lsaliv', label: 'APPLY L. SALIVARIUS', strain: 'L. salivarius' },
      { id: 'lacid', label: 'INOCULATE L. ACIDOPHILUS', strain: 'L. acidophilus' },
      { id: 'sboul', label: 'SEED S. BOULARDII', strain: 'S. boulardii' },
    ],
  },
  {
    id: 'skin',
    label: 'Skin',
    active: true,
    hotspot: [0.42, 1.05, 0.28],
    microGeometry: 'skin',
    zoomTitle: 'SKIN BARRIER CROSS-SECTION',
    scaleLabel: '300× magnification',
    defaultStrains: {
      probiotics: ['L. acidophilus'],
      pathogens: ['C. albicans', 'S. aureus'],
      allergens: ['Irritant'],
    },
    env: buildRegionEnv({ ph: 7.4, moisture: 0.55, temperature: 0.52, sebum: 0.28 }),
    baseline: {
      commensals: 30,
      probiotics: [{ strain: 'L. acidophilus', count: 6 }],
      pathogens: [
        { strain: 'C. albicans', count: 10, kind: 'yeast' },
        { strain: 'S. aureus', count: 4, kind: 'pathogen' },
      ],
      biofilm: 0.15,
    },
    triggers: [
      { id: 'alkaline', label: 'RAISE pH + SUGAR LOAD' },
      { id: 'topical_antibiotic', label: 'TOPICAL ANTIBIOTIC' },
      { id: 'friction_irritant', label: 'FRICTION / IRRITANT' },
    ],
    inoculations: [
      { id: 'lacid', label: 'INOCULATE L. ACIDOPHILUS', strain: 'L. acidophilus' },
      { id: 's_epidermidis', label: 'APPLY S. EPIDERMIDIS', strain: 'S. epidermidis' },
      { id: 'ph_serum', label: 'pH BALANCING SERUM', strain: 'ph_serum' },
    ],
  },
  {
    id: 'vaginal',
    label: 'Vaginal',
    active: true,
    hotspot: [0, 0.52, 0.18],
    microGeometry: 'vaginal',
    zoomTitle: 'VAGINAL EPITHELIUM / MUCOSA',
    scaleLabel: '280× magnification',
    defaultStrains: {
      probiotics: ['L. acidophilus', 'L. rhamnosus'],
      pathogens: ['C. albicans', 'Gardnerella'],
      allergens: ['Irritant'],
    },
    env: buildRegionEnv({
      ph: 4.2,
      moisture: 0.62,
      temperature: 0.58,
      oxygenTension: 0.08,
    }),
    baseline: {
      commensals: 38,
      probiotics: [
        { strain: 'L. acidophilus', count: 12 },
        { strain: 'L. rhamnosus', count: 6 },
      ],
      pathogens: [{ strain: 'C. albicans', count: 3, kind: 'yeast' }],
      integrity: 0.88,
      biofilm: 0.05,
    },
    triggers: [
      { id: 'alkaline_flush', label: 'ALKALINE FLUSH (pH DISRUPTION)' },
      { id: 'antibiotic_course', label: 'ANTIBIOTIC COURSE' },
      { id: 'glycogen_spike', label: 'GLYCOGEN / SUGAR SPIKE' },
    ],
    inoculations: [
      { id: 'lacid', label: 'APPLY L. ACIDOPHILUS', strain: 'L. acidophilus' },
      { id: 'lrham', label: 'SEED L. RHAMNOSUS', strain: 'L. rhamnosus' },
      { id: 'ph_serum', label: 'pH RESTORING SERUM', strain: 'ph_serum' },
    ],
  },
  {
    id: 'gut',
    label: 'Gut',
    active: true,
    hotspot: [0, 0.55, 0.22],
    microGeometry: 'gut',
    zoomTitle: 'GUT MUCOSA / VILLI',
    scaleLabel: '250× magnification',
    defaultStrains: {
      probiotics: ['L. plantarum', 'B. infantis'],
      pathogens: ['Enteropathogen'],
      allergens: ['Food antigen'],
    },
    env: buildRegionEnv({ ph: 6.2, moisture: 0.65, temperature: 0.6, oxygenTension: 0.12 }),
    baseline: {
      commensals: 35,
      probiotics: [{ strain: 'L. plantarum', count: 10 }],
      prebiotics: [{ strain: 'inulin', count: 8 }],
      integrity: 0.75,
    },
    triggers: [
      { id: 'stress', label: 'SIMULATE MILD STRESS' },
      { id: 'enteropathogen_bloom', label: 'ENTEROPATHOGEN BLOOM' },
      { id: 'antibiotic_disruption', label: 'ANTIBIOTIC DISRUPTION' },
    ],
    inoculations: [
      { id: 'prebiotic', label: 'ADD PREBIOTIC FIBER', strain: 'prebiotic' },
      { id: 'lplant', label: 'SEED L. PLANTARUM', strain: 'L. plantarum' },
      { id: 'scfa', label: 'RELEASE SCFA BOOST', strain: 'postbiotic' },
    ],
  },
];

export function getRegion(id: RegionId): RegionDef {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown region: ${id}`);
  return r;
}
