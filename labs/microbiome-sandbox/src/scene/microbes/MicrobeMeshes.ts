import * as THREE from 'three';
import type { MicrobeType } from '../../sim/types';

export const TYPE_COLORS: Record<MicrobeType, number> = {
  probiotic: 0x22ff66,
  commensal: 0x58ff8a,
  pathogen: 0xff3344,
  allergen: 0xffd21f,
  yeast: 0xff66ff,
  prebiotic: 0xb8ff24,
  postbiotic: 0x2dfff0,
};

export type InstanceBucket =
  | 'probiotic'
  | 'commensal'
  | 'pathogen'
  | 'yeast'
  | 'allergen'
  | 'prebiotic'
  | 'other';

export function bucketForType(type: MicrobeType): InstanceBucket {
  if (type === 'probiotic') return 'probiotic';
  if (type === 'commensal') return 'commensal';
  if (type === 'pathogen') return 'pathogen';
  if (type === 'yeast') return 'yeast';
  if (type === 'allergen') return 'allergen';
  if (type === 'prebiotic') return 'prebiotic';
  return 'other';
}

/** Distinct hues within each microbe family so multi-strain products read clearly in tissue view. */
const PROBIOTIC_PALETTE = [
  0x22ff66, 0x00e676, 0x66ff99, 0x00f5d4, 0xb8ff24, 0x7cff7c, 0x44ffd2, 0x00d85a,
  0x00c853, 0x00e5b0,
];
const PATHOGEN_PALETTE = [0xff3344, 0xff1744, 0xff4081, 0xff6d00, 0xff5252];
const YEAST_PALETTE = [0xff66ff, 0xea80fc, 0xd500f9, 0xff4fd8, 0xf500d8];
const PREBIOTIC_PALETTE = [0xb8ff24, 0xccff33, 0x9cff00, 0x76ff03];

function hashStrain(strain: string): number {
  let h = 0;
  for (let i = 0; i < strain.length; i++) h = (h * 31 + strain.charCodeAt(i)) >>> 0;
  return h;
}

export function colorForMicrobe(type: MicrobeType, strain: string): number {
  if (type === 'probiotic') return PROBIOTIC_PALETTE[hashStrain(strain) % PROBIOTIC_PALETTE.length];
  if (type === 'prebiotic') return PREBIOTIC_PALETTE[hashStrain(strain) % PREBIOTIC_PALETTE.length];
  if (type === 'yeast') return YEAST_PALETTE[hashStrain(strain) % YEAST_PALETTE.length];
  if (type === 'pathogen') return PATHOGEN_PALETTE[hashStrain(strain) % PATHOGEN_PALETTE.length];
  return TYPE_COLORS[type];
}

/** Short rod — commensal residents on epithelial surface. */
function createCommensalGeometry(): THREE.BufferGeometry {
  return new THREE.CapsuleGeometry(0.014, 0.042, 4, 6);
}

/** Rod-shaped bacterium with irregular spikes — pathogens. */
function createBacteriumGeometry(): THREE.BufferGeometry {
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

/** Rounded budding yeast — ellipsoid body with a small bud sphere merged visually via scale. */
function createYeastGeometry(): THREE.BufferGeometry {
  const body = new THREE.SphereGeometry(0.032, 10, 8);
  const pos = body.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    pos.setXYZ(x * 1.05, y * 0.82, z * 1.02);
  }
  body.computeVertexNormals();
  return body;
}

/** Pollen-like allergen — compact spiky grain distinct from bacteria. */
function createAllergenGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.022, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const angle = Math.atan2(z, x) + y * 3;
    const spike = 1 + (Math.sin(angle * 5 + i) * 0.5 + 0.5) * 1.6;
    pos.setXYZ(i, (x / len) * 0.022 * spike, (y / len) * 0.022 * spike, (z / len) * 0.022 * spike);
  }
  geo.computeVertexNormals();
  return geo;
}

export interface MicrobeMeshSet {
  probiotic: THREE.InstancedMesh;
  commensal: THREE.InstancedMesh;
  pathogen: THREE.InstancedMesh;
  yeast: THREE.InstancedMesh;
  allergen: THREE.InstancedMesh;
  prebiotic: THREE.InstancedMesh;
  other: THREE.InstancedMesh;
}

export function createMicrobeMeshSet(maxPerBucket = 120): MicrobeMeshSet {
  const make = (geo: THREE.BufferGeometry, color: number) => {
    const mat = new THREE.MeshBasicMaterial({
      color,
      vertexColors: false,
      toneMapped: false,
      fog: false,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, maxPerBucket);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.noShadow = true;
    return mesh;
  };

  return {
    probiotic: make(new THREE.CapsuleGeometry(0.025, 0.07, 4, 8), TYPE_COLORS.probiotic),
    commensal: make(createCommensalGeometry(), TYPE_COLORS.commensal),
    pathogen: make(createBacteriumGeometry(), TYPE_COLORS.pathogen),
    yeast: make(createYeastGeometry(), TYPE_COLORS.yeast),
    allergen: make(createAllergenGeometry(), TYPE_COLORS.allergen),
    prebiotic: make(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), TYPE_COLORS.prebiotic),
    other: make(new THREE.SphereGeometry(0.025, 8, 6), TYPE_COLORS.postbiotic),
  };
}
