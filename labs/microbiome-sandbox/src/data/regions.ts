export type RegionId = 'ear' | 'scalp' | 'nose' | 'skin' | 'gut';

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
  microGeometry: 'sinus' | 'skin' | 'gut';
  zoomTitle: string;
  scaleLabel: string;
  defaultStrains: { probiotics: string[]; pathogens: string[]; allergens: string[] };
  env: { ph: number; moisture: number };
  baseline: RegionBaseline;
  triggers: RegionAction[];
  inoculations: RegionInoculation[];
}

export const REGIONS: RegionDef[] = [
  {
    id: 'ear',
    label: 'Ear Canal',
    active: false,
    hotspot: [-0.52, 1.62, 0.08],
    microGeometry: 'sinus',
    zoomTitle: 'EAR CANAL EPITHELIUM',
    scaleLabel: '80× magnification',
    defaultStrains: { probiotics: ['L. rhamnosus'], pathogens: ['S. aureus'], allergens: ['Dust'] },
    env: { ph: 6.8, moisture: 0.72 },
    baseline: { commensals: 40, probiotics: [{ strain: 'L. rhamnosus', count: 8 }] },
    triggers: [],
    inoculations: [],
  },
  {
    id: 'scalp',
    label: 'Scalp',
    active: false,
    hotspot: [0, 1.92, 0.12],
    microGeometry: 'skin',
    zoomTitle: 'SCALP BARRIER CROSS-SECTION',
    scaleLabel: '200× magnification',
    defaultStrains: { probiotics: ['L. rhamnosus'], pathogens: ['S. aureus'], allergens: ['Dust'] },
    env: { ph: 7.0, moisture: 0.5 },
    baseline: { commensals: 30, probiotics: [{ strain: 'L. rhamnosus', count: 6 }] },
    triggers: [],
    inoculations: [],
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
    env: { ph: 6.8, moisture: 0.72 },
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
    env: { ph: 7.4, moisture: 0.55 },
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
    env: { ph: 6.2, moisture: 0.65 },
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
