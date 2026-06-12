import * as THREE from 'three';
import type { RegionDef, RegionId } from '../data/regions';

/** Anatomical hotspot anchors in local body space — kept in sync with mesh geometry. */
export const BODY_HOTSPOTS: Record<RegionId, THREE.Vector3> = {
  scalp: new THREE.Vector3(0, 1.96, 0.04),
  ear: new THREE.Vector3(-0.24, 1.69, 0.0),
  nose: new THREE.Vector3(0, 1.66, 0.25),
  oral: new THREE.Vector3(0, 1.54, 0.19),
  skin: new THREE.Vector3(0.32, 1.04, 0.1),
  vaginal: new THREE.Vector3(0, 0.57, 0.13),
  gut: new THREE.Vector3(0, 0.84, 0.17),
};

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

  // Head — slightly elongated ellipsoid
  addPart(
    new THREE.SphereGeometry(0.21, 24, 20),
    new THREE.Vector3(0, 1.72, 0),
    undefined,
    new THREE.Vector3(1.0, 1.08, 0.92),
  );

  // Ears (left/right)
  for (const side of [-1, 1] as const) {
    addPart(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.Vector3(side * 0.24, 1.69, -0.01),
      undefined,
      new THREE.Vector3(0.55, 1.0, 0.75),
    );
  }

  // Nose bridge + tip
  addPart(
    new THREE.CapsuleGeometry(0.025, 0.06, 4, 8),
    new THREE.Vector3(0, 1.67, 0.17),
    new THREE.Euler(0.35, 0, 0),
  );

  // Neck
  addPart(
    new THREE.CylinderGeometry(0.07, 0.085, 0.12, 14),
    new THREE.Vector3(0, 1.52, 0),
  );

  // Torso — lathe profile from hips to shoulders
  const torsoProfile = [
    new THREE.Vector2(0.19, 0.58),
    new THREE.Vector2(0.24, 0.68),
    new THREE.Vector2(0.21, 0.82),
    new THREE.Vector2(0.19, 0.96),
    new THREE.Vector2(0.22, 1.1),
    new THREE.Vector2(0.25, 1.24),
    new THREE.Vector2(0.27, 1.36),
    new THREE.Vector2(0.1, 1.46),
  ];
  addPart(new THREE.LatheGeometry(torsoProfile, 32), new THREE.Vector3(0, 0, 0));

  // Shoulder caps
  for (const side of [-1, 1] as const) {
    addPart(
      new THREE.SphereGeometry(0.075, 14, 12),
      new THREE.Vector3(side * 0.3, 1.34, 0),
      undefined,
      new THREE.Vector3(1.1, 0.85, 0.9),
    );
  }

  // Arms — upper, forearm, hand (natural slight hang)
  for (const side of [-1, 1] as const) {
    const upperRot = new THREE.Euler(0.08, 0, side * 0.22);
    addPart(
      new THREE.CapsuleGeometry(0.055, 0.26, 8, 12),
      new THREE.Vector3(side * 0.36, 1.16, 0.01),
      upperRot,
    );

    const foreRot = new THREE.Euler(0.05, 0, side * 0.35);
    addPart(
      new THREE.CapsuleGeometry(0.045, 0.22, 8, 12),
      new THREE.Vector3(side * 0.44, 0.9, 0.03),
      foreRot,
    );

    addPart(
      new THREE.SphereGeometry(0.05, 10, 8),
      new THREE.Vector3(side * 0.48, 0.72, 0.04),
      undefined,
      new THREE.Vector3(0.8, 1.1, 0.55),
    );
  }

  // Pelvis / hip block (subtle)
  addPart(
    new THREE.SphereGeometry(0.2, 16, 14),
    new THREE.Vector3(0, 0.62, 0),
    undefined,
    new THREE.Vector3(1.1, 0.7, 0.85),
  );

  // Legs — thigh, calf, foot
  for (const side of [-1, 1] as const) {
    addPart(
      new THREE.CapsuleGeometry(0.085, 0.3, 8, 12),
      new THREE.Vector3(side * 0.12, 0.3, 0),
    );
    addPart(
      new THREE.CapsuleGeometry(0.065, 0.28, 8, 12),
      new THREE.Vector3(side * 0.12, -0.02, 0.01),
    );
    addPart(
      new THREE.BoxGeometry(0.09, 0.05, 0.2),
      new THREE.Vector3(side * 0.12, -0.26, 0.05),
      new THREE.Euler(0.05, 0, 0),
    );
  }

  group.position.y = -0.15;
  return group;
}

export function createHotspots(regions: RegionDef[]): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.038, 14, 10);

  for (const region of regions) {
    const anchor = BODY_HOTSPOTS[region.id];
    const mat = new THREE.MeshBasicMaterial({
      color: region.active ? 0x38bdf8 : 0x475569,
      transparent: true,
      opacity: region.active ? 0.95 : 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(anchor);
    mesh.userData = { regionId: region.id, active: region.active };
    group.add(mesh);

    // Surface ring marker — sits flush on the body
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.042, 0.058, 20),
      new THREE.MeshBasicMaterial({
        color: region.active ? 0x38bdf8 : 0x475569,
        transparent: true,
        opacity: region.active ? 0.55 : 0.25,
        side: THREE.DoubleSide,
      }),
    );
    ring.position.copy(anchor);
    const outward = anchor.clone().normalize();
    if (outward.lengthSq() < 0.001) outward.set(0, 1, 0);
    ring.lookAt(anchor.clone().add(outward));
    ring.raycast = () => {};
    group.add(ring);
  }

  return group;
}
