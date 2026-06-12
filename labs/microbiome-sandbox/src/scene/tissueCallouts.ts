import * as THREE from 'three';
import type { EpitheliumKind } from './epithelium/types';

export interface TissueCallout {
  label: string;
  position: THREE.Vector3;
}

const CALLOUTS: Record<EpitheliumKind, TissueCallout[]> = {
  gut: [
    { label: 'LUMEN', position: new THREE.Vector3(0, 0.96, 0) },
    { label: 'VILLUS TIP', position: new THREE.Vector3(-1.15, 0.68, 0.1) },
    { label: 'CRYPT', position: new THREE.Vector3(0.55, 0.35, 0.08) },
    { label: 'MUSCULARIS', position: new THREE.Vector3(1.85, 0.09, 0.06) },
    { label: 'LACTEAL', position: new THREE.Vector3(-0.4, 0.52, 0.12) },
  ],
  skin: [
    { label: 'STRATUM CORNEUM', position: new THREE.Vector3(-1.8, 0.52, 0.1) },
    { label: 'HAIR FOLLICLE', position: new THREE.Vector3(0.55, 0.22, 0.12) },
    { label: 'RETE RIDGES', position: new THREE.Vector3(-1.2, 0.33, 0.1) },
    { label: 'DERMIS', position: new THREE.Vector3(1.5, 0.12, 0.08) },
  ],
  sinus: [
    { label: 'SINUS CAVITY', position: new THREE.Vector3(0, 0.92, 0) },
    { label: 'TURBINATE', position: new THREE.Vector3(-1.5, 1.08, 0.04) },
    { label: 'CILIA BRUSH', position: new THREE.Vector3(1.2, 0.58, 0.1) },
    { label: 'GOBLET CELL', position: new THREE.Vector3(-1.1, 0.36, 0.08) },
  ],
};

export function getTissueCallouts(kind: EpitheliumKind): TissueCallout[] {
  return CALLOUTS[kind];
}

export const TISSUE_PICTOGRAMS: Record<EpitheliumKind, string> = {
  gut: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="34" width="40" height="8" fill="#7a4858"/><rect x="4" y="28" width="40" height="6" fill="#a86860"/><rect x="4" y="26" width="40" height="2" fill="#6a3848"/><rect x="4" y="22" width="40" height="4" fill="#f8ece8"/><rect x="8" y="12" width="3" height="10" fill="#e8a8a0" rx="1"/><rect x="14" y="10" width="3" height="12" fill="#e8a8a0" rx="1"/><rect x="20" y="11" width="3" height="11" fill="#d09088" rx="1"/><rect x="26" y="10" width="3" height="12" fill="#e8a8a0" rx="1"/><rect x="32" y="12" width="3" height="10" fill="#e8a8a0" rx="1"/><rect x="11" y="22" width="4" height="3" fill="#8a5058" rx="1"/><rect x="23" y="22" width="4" height="3" fill="#8a5058" rx="1"/><rect x="6" y="2" width="36" height="7" fill="#1a3858" opacity="0.6" rx="2"/><line x1="8" y1="8" x2="40" y2="8" stroke="#d8eef8" stroke-width="1.5" opacity="0.7"/></svg>`,
  skin: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="8" width="40" height="6" fill="#f8ead8"/><rect x="4" y="14" width="40" height="5" fill="#d8a890"/><rect x="4" y="19" width="40" height="8" fill="#c08878"/><rect x="4" y="27" width="40" height="6" fill="#9a5850"/><rect x="4" y="33" width="40" height="10" fill="#b87870"/><rect x="22" y="8" width="5" height="28" fill="#8a5048" opacity="0.8"/><circle cx="30" cy="24" r="4" fill="#f0e8c8"/></svg>`,
  sinus: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="30" width="40" height="6" fill="#a86860"/><rect x="4" y="22" width="40" height="8" fill="#1a4870" opacity="0.5"/><path d="M4 22 Q24 6 44 22" fill="none" stroke="#7a98a8" stroke-width="4"/><rect x="10" y="26" width="3" height="12" fill="#e8b0a8"/><circle cx="18" cy="30" r="4" fill="#f4fafc"/><rect x="24" y="24" width="3" height="14" fill="#e8b0a8"/><rect x="32" y="27" width="3" height="11" fill="#e8b0a8"/><line x1="8" y1="22" x2="40" y2="22" stroke="#b8a090" stroke-width="2"/></svg>`,
};
