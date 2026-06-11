export type RegionId = 'ear' | 'scalp' | 'nose' | 'skin' | 'gut';

export interface RegionDef {
  id: RegionId;
  label: string;
  active: boolean;
  hotspot: [number, number, number];
  microGeometry: 'sinus' | 'skin' | 'gut';
}

export const REGIONS: RegionDef[] = [
  { id: 'ear', label: 'Ear Canal', active: false, hotspot: [-0.55, 1.35, 0.1], microGeometry: 'sinus' },
  { id: 'scalp', label: 'Scalp', active: false, hotspot: [0, 1.85, 0.15], microGeometry: 'skin' },
  { id: 'nose', label: 'Nose / Sinus', active: true, hotspot: [0, 1.45, 0.42], microGeometry: 'sinus' },
  { id: 'skin', label: 'Skin', active: true, hotspot: [0.35, 0.9, 0.38], microGeometry: 'skin' },
  { id: 'gut', label: 'Gut', active: true, hotspot: [0, 0.35, 0.32], microGeometry: 'gut' },
];

export function getRegion(id: RegionId): RegionDef {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown region: ${id}`);
  return r;
}
