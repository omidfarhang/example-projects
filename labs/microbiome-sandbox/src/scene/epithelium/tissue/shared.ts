import * as THREE from 'three';
import { P } from '../tissuePalette';
import type { EpitheliumKind } from '../types';

export interface TissueBuildResult {
  group: THREE.Group;
  inflamedMeshes: THREE.Mesh[];
  overlays: THREE.Mesh[];
  kind: EpitheliumKind;
}

/** Cross-section thickness — enough Z depth to read as 3D tissue, not a flat card. */
export const DEPTH = 0.38;

export function mat(color: number, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.03, ...opts });
}

export function outline(mesh: THREE.Mesh, color = 0x38bdf8, opacity = 0.42) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  return edges;
}

export function mucusSheet(w: number, h: number, y: number, z: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    mat(P.mucus, { transparent: true, opacity: 0.2, depthWrite: false }),
  );
  m.position.set(0, y, z);
  m.userData.isMucus = true;
  return m;
}
