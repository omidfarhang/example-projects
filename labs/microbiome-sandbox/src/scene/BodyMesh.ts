import * as THREE from 'three';
import type { RegionDef } from '../data/regions';

/** Anatomically proportioned clinical hologram body (~8-head figure). */
export function createBodyMesh(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a3a5c,
    emissive: 0x0d2840,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.55,
    transparent: true,
    opacity: 0.55,
  });

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });

  const addPart = (
    geo: THREE.BufferGeometry,
    pos: THREE.Vector3,
    rot?: THREE.Euler,
    scale?: THREE.Vector3,
  ) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(pos);
    if (rot) mesh.rotation.copy(rot);
    if (scale) mesh.scale.copy(scale);
    group.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(edges, edgeMat);
    lines.position.copy(pos);
    if (rot) lines.rotation.copy(rot);
    if (scale) lines.scale.copy(scale);
    group.add(lines);
  };

  // Head (~1/8 of total height)
  addPart(new THREE.SphereGeometry(0.22, 20, 16), new THREE.Vector3(0, 1.72, 0));

  // Nose protrusion
  addPart(
    new THREE.SphereGeometry(0.04, 10, 8),
    new THREE.Vector3(0, 1.66, 0.2),
    undefined,
    new THREE.Vector3(0.7, 0.9, 1.2),
  );

  // Neck
  addPart(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 12), new THREE.Vector3(0, 1.48, 0));

  // Torso — upper chest + lower abdomen
  addPart(
    new THREE.CapsuleGeometry(0.22, 0.32, 8, 16),
    new THREE.Vector3(0, 1.22, 0),
    undefined,
    new THREE.Vector3(1.15, 1, 0.75),
  );
  addPart(
    new THREE.CapsuleGeometry(0.2, 0.28, 8, 16),
    new THREE.Vector3(0, 0.88, 0),
    undefined,
    new THREE.Vector3(1.05, 1, 0.72),
  );

  // Pelvis
  addPart(
    new THREE.SphereGeometry(0.22, 14, 12),
    new THREE.Vector3(0, 0.62, 0),
    undefined,
    new THREE.Vector3(1.15, 0.75, 0.8),
  );

  // Shoulders
  for (const side of [-1, 1] as const) {
    addPart(new THREE.SphereGeometry(0.07, 10, 8), new THREE.Vector3(side * 0.28, 1.38, 0));
  }

  // Arms — upper, forearm, hand
  for (const side of [-1, 1] as const) {
    const upperRot = new THREE.Euler(0, 0, side * 0.15);
    addPart(
      new THREE.CapsuleGeometry(0.06, 0.28, 6, 10),
      new THREE.Vector3(side * 0.38, 1.18, 0),
      upperRot,
    );
    addPart(
      new THREE.CapsuleGeometry(0.05, 0.24, 6, 10),
      new THREE.Vector3(side * 0.48, 0.88, 0.02),
      new THREE.Euler(0, 0, side * 0.25),
    );
    addPart(
      new THREE.BoxGeometry(0.07, 0.1, 0.04),
      new THREE.Vector3(side * 0.52, 0.72, 0.02),
    );
  }

  // Legs — thigh, calf, foot
  for (const side of [-1, 1] as const) {
    addPart(new THREE.CapsuleGeometry(0.09, 0.32, 6, 10), new THREE.Vector3(side * 0.14, 0.28, 0));
    addPart(new THREE.CapsuleGeometry(0.07, 0.3, 6, 10), new THREE.Vector3(side * 0.14, -0.08, 0));
    addPart(
      new THREE.BoxGeometry(0.1, 0.05, 0.18),
      new THREE.Vector3(side * 0.14, -0.28, 0.04),
    );
  }

  group.position.y = -0.15;
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
