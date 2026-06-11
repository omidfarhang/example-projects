import * as THREE from 'three';
import type { RegionDef } from '../data/regions';

/** Low-poly clinical hologram body built from primitives (~8k tris). */
export function createBodyMesh(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a3a5c,
    emissive: 0x0d2840,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.55,
    transparent: true,
    opacity: 0.88,
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), material);
  head.position.set(0, 1.55, 0);
  group.add(head);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.7, 8, 16), material);
  torso.position.set(0, 0.95, 0);
  group.add(torso);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), material);
  pelvis.position.set(0, 0.45, 0);
  pelvis.scale.set(1.1, 0.7, 0.85);
  group.add(pelvis);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.45, 6, 8), material);
    arm.position.set(side * 0.48, 1.05, 0);
    arm.rotation.z = side * 0.35;
    group.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 6, 8), material);
    leg.position.set(side * 0.18, -0.05, 0);
    group.add(leg);
  }

  // Nose protrusion
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), material);
  nose.position.set(0, 1.45, 0.28);
  nose.scale.set(0.8, 1, 1.4);
  group.add(nose);

  group.position.y = -0.2;
  return group;
}

export function createHotspots(regions: RegionDef[]): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.06, 12, 8);

  for (const region of regions) {
    const mat = new THREE.MeshBasicMaterial({
      color: region.active ? 0x38bdf8 : 0x475569,
      transparent: true,
      opacity: region.active ? 0.95 : 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...region.hotspot);
    mesh.userData = { regionId: region.id, active: region.active };
    group.add(mesh);
  }

  return group;
}
