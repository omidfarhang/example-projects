import * as THREE from 'three';
import type { MicrobeType } from '../../sim/types';

export const TYPE_COLORS: Record<MicrobeType, number> = {
  probiotic: 0x4ade80,
  commensal: 0x60a5fa,
  pathogen: 0xf87171,
  allergen: 0x38bdf8,
  yeast: 0xc084fc,
  prebiotic: 0xa3e635,
  postbiotic: 0x2dd4bf,
};

export type InstanceBucket = 'probiotic' | 'commensal' | 'pathogen' | 'allergen' | 'prebiotic' | 'other';

export function bucketForType(type: MicrobeType): InstanceBucket {
  if (type === 'probiotic') return 'probiotic';
  if (type === 'commensal') return 'commensal';
  if (type === 'pathogen' || type === 'yeast') return 'pathogen';
  if (type === 'allergen') return 'allergen';
  if (type === 'prebiotic') return 'prebiotic';
  return 'other';
}

/** Distinct hues within each microbe family so multi-strain products read clearly in tissue view. */
const PROBIOTIC_PALETTE = [
  0x4ade80, 0x34d399, 0x6ee7b7, 0x2dd4bf, 0xa3e635, 0x86efac, 0x5eead4, 0x22c55e,
  0x10b981, 0x14b8a6,
];
const PATHOGEN_PALETTE = [0xf87171, 0xfb7185, 0xf472b6, 0xc084fc, 0xfbbf24];
const PREBIOTIC_PALETTE = [0xa3e635, 0xbef264, 0x84cc16, 0x65a30d];

function hashStrain(strain: string): number {
  let h = 0;
  for (let i = 0; i < strain.length; i++) h = (h * 31 + strain.charCodeAt(i)) >>> 0;
  return h;
}

export function colorForMicrobe(type: MicrobeType, strain: string): number {
  if (type === 'probiotic') return PROBIOTIC_PALETTE[hashStrain(strain) % PROBIOTIC_PALETTE.length];
  if (type === 'prebiotic') return PREBIOTIC_PALETTE[hashStrain(strain) % PREBIOTIC_PALETTE.length];
  if (type === 'pathogen' || type === 'yeast') {
    return PATHOGEN_PALETTE[hashStrain(strain) % PATHOGEN_PALETTE.length];
  }
  return TYPE_COLORS[type];
}

function createSpikyGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.04, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const spike = 1 + (Math.abs(x) + Math.abs(z)) * 2.5;
    pos.setXYZ(i, (x / len) * 0.04 * spike, (y / len) * 0.05, (z / len) * 0.04 * spike);
  }
  geo.computeVertexNormals();
  return geo;
}

export interface MicrobeMeshSet {
  probiotic: THREE.InstancedMesh;
  commensal: THREE.InstancedMesh;
  pathogen: THREE.InstancedMesh;
  allergen: THREE.InstancedMesh;
  prebiotic: THREE.InstancedMesh;
  other: THREE.InstancedMesh;
}

export function createMicrobeMeshSet(maxPerBucket = 120): MicrobeMeshSet {
  const make = (geo: THREE.BufferGeometry, color: number) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      roughness: 0.4,
      metalness: 0.1,
      vertexColors: true,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, maxPerBucket);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    return mesh;
  };

  return {
    probiotic: make(new THREE.CapsuleGeometry(0.025, 0.07, 4, 8), TYPE_COLORS.probiotic),
    commensal: make(new THREE.CapsuleGeometry(0.02, 0.05, 4, 6), TYPE_COLORS.commensal),
    pathogen: make(createSpikyGeometry(), TYPE_COLORS.pathogen),
    allergen: make(new THREE.SphereGeometry(0.02, 8, 6), TYPE_COLORS.allergen),
    prebiotic: make(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), TYPE_COLORS.prebiotic),
    other: make(new THREE.SphereGeometry(0.025, 8, 6), TYPE_COLORS.postbiotic),
  };
}
