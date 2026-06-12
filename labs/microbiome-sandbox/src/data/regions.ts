export type RegionId = 'ear' | 'scalp' | 'nose' | 'skin' | 'gut';

export interface RegionDef {
  id: RegionId;
  label: string;
  active: boolean;
  hotspot: [number, number, number];
  microGeometry: 'sinus' | 'skin' | 'gut';
  zoomTitle: string;
  scaleLabel: string;
  defaultStrains: { probiotics: string[]; pathogens: string[]; allergens: string[] };
}

export const REGIONS: RegionDef[] = [
  {
    id: 'ear',
    label: 'Ear Canal',
    active: false,
    hotspot: [-0.55, 1.35, 0.1],
    microGeometry: 'sinus',
    zoomTitle: 'EAR CANAL EPITHELIUM',
    scaleLabel: '80× magnification',
    defaultStrains: { probiotics: ['L. rhamnosus'], pathogens: ['S. aureus'], allergens: ['Dust'] },
  },
  {
    id: 'scalp',
    label: 'Scalp',
    active: false,
    hotspot: [0, 1.85, 0.15],
    microGeometry: 'skin',
    zoomTitle: 'SCALP BARRIER CROSS-SECTION',
    scaleLabel: '200× magnification',
    defaultStrains: { probiotics: ['L. rhamnosus'], pathogens: ['S. aureus'], allergens: ['Dust'] },
  },
  {
    id: 'nose',
    label: 'Nose / Sinus',
    active: true,
    hotspot: [0, 1.45, 0.42],
    microGeometry: 'sinus',
    zoomTitle: 'NASAL/RESPIRATORY EPITHELIUM',
    scaleLabel: '400× magnification',
    defaultStrains: {
      probiotics: ['L. rhamnosus', 'B. infantis'],
      pathogens: ['S. aureus', 'H. influenzae'],
      allergens: ['Pollen/Dust'],
    },
  },
  {
    id: 'skin',
    label: 'Skin',
    active: true,
    hotspot: [0.35, 0.9, 0.38],
    microGeometry: 'skin',
    zoomTitle: 'SKIN BARRIER CROSS-SECTION',
    scaleLabel: '300× magnification',
    defaultStrains: {
      probiotics: ['L. acidophilus'],
      pathogens: ['C. albicans', 'S. aureus'],
      allergens: ['Irritant'],
    },
  },
  {
    id: 'gut',
    label: 'Gut',
    active: true,
    hotspot: [0, 0.35, 0.32],
    microGeometry: 'gut',
    zoomTitle: 'GUT MUCOSA / VILLI',
    scaleLabel: '250× magnification',
    defaultStrains: {
      probiotics: ['L. plantarum', 'B. infantis'],
      pathogens: ['Enteropathogen'],
      allergens: ['Food antigen'],
    },
  },
];

export function getRegion(id: RegionId): RegionDef {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown region: ${id}`);
  return r;
}
