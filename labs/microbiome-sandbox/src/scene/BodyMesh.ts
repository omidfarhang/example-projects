import * as THREE from 'three';
import type { RegionDef, RegionId } from '../data/regions';

export const BODY_HOTSPOTS: Record<RegionId, THREE.Vector3> = {
  scalp: new THREE.Vector3(0, 1.96, 0.04),
  ear: new THREE.Vector3(-0.24, 1.69, 0.0),
  nose: new THREE.Vector3(0, 1.66, 0.25),
  oral: new THREE.Vector3(0, 1.54, 0.19),
  skin: new THREE.Vector3(0.32, 1.04, 0.1),
  vaginal: new THREE.Vector3(0, 0.57, 0.13),
  gut: new THREE.Vector3(0, 0.84, 0.17),
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const tt = t * t;
  const ttt = tt * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * tt +
    (-p0 + 3 * p1 - 3 * p2 + p3) * ttt
  );
}

interface CrossSection {
  y: number;
  radii: number[];
  zOff?: number;
  xOff?: number;
}

function sampleCrossSection(
  sections: CrossSection[],
  y: number,
  numAngles: number,
): { radii: number[]; xOff: number; zOff: number } {
  let idx = 0;
  for (let i = 0; i < sections.length - 1; i++) {
    if (y <= sections[i].y && y >= sections[i + 1].y) { idx = i; break; }
  }
  if (y > sections[0].y) idx = 0;
  if (y < sections[sections.length - 1].y) idx = sections.length - 2;

  const i0 = Math.max(idx - 1, 0);
  const i1 = idx;
  const i2 = Math.min(idx + 1, sections.length - 1);
  const i3 = Math.min(idx + 2, sections.length - 1);

  const span = sections[i1].y - sections[i2].y;
  const t = span > 0.001 ? (sections[i1].y - y) / span : 0;

  const radii: number[] = [];
  for (let a = 0; a < numAngles; a++) {
    const aIdx = Math.min(a, sections[i0].radii.length - 1);
    radii.push(catmullRom(
      sections[i0].radii[aIdx],
      sections[i1].radii[aIdx],
      sections[i2].radii[aIdx],
      sections[i3].radii[aIdx],
      t,
    ));
  }

  const xOff = catmullRom(
    sections[i0].xOff ?? 0, sections[i1].xOff ?? 0,
    sections[i2].xOff ?? 0, sections[i3].xOff ?? 0, t,
  );
  const zOff = catmullRom(
    sections[i0].zOff ?? 0, sections[i1].zOff ?? 0,
    sections[i2].zOff ?? 0, sections[i3].zOff ?? 0, t,
  );

  return { radii, xOff, zOff };
}

function buildOrganicMesh(
  sections: CrossSection[],
  numAngles: number,
  ySteps: number,
): THREE.BufferGeometry {
  const verts: number[] = [];
  const idx: number[] = [];

  const yTop = sections[0].y;
  const yBot = sections[sections.length - 1].y;

  for (let s = 0; s <= ySteps; s++) {
    const y = yTop - (s / ySteps) * (yTop - yBot);
    const cs = sampleCrossSection(sections, y, numAngles);

    for (let a = 0; a < numAngles; a++) {
      const angle = (a / numAngles) * Math.PI * 2;
      const r = cs.radii[a];
      const x = Math.sin(angle) * r + cs.xOff;
      const z = Math.cos(angle) * r + cs.zOff;
      verts.push(x, y, z);
    }
  }

  for (let s = 0; s < ySteps; s++) {
    for (let a = 0; a < numAngles; a++) {
      const na = (a + 1) % numAngles;
      const c = s * numAngles;
      const n = (s + 1) * numAngles;
      idx.push(c + a, n + a, c + na);
      idx.push(c + na, n + a, n + na);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function expandRadii(compact: [number, number, number, number], n: number): number[] {
  const radii: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let val: number;
    if (t < 0.25) {
      val = THREE.MathUtils.lerp(compact[0], compact[1], t / 0.25);
    } else if (t < 0.50) {
      val = THREE.MathUtils.lerp(compact[1], compact[2], (t - 0.25) / 0.25);
    } else if (t < 0.75) {
      val = THREE.MathUtils.lerp(compact[2], compact[3], (t - 0.50) / 0.25);
    } else {
      val = THREE.MathUtils.lerp(compact[3], compact[0], (t - 0.75) / 0.25);
    }
    radii.push(val);
  }
  return radii;
}

/**
 * Build a limb as a tube that follows a 3D spine path.
 * Each ring has a centre point on the spine and a radius,
 * producing a single continuous mesh from root to tip.
 */
interface LimbRing {
  cx: number; cy: number; cz: number;
  rx: number; rz: number; // elliptical radii for cross-section
}

function buildLimbTube(rings: LimbRing[], radialN: number, refRight?: THREE.Vector3): THREE.BufferGeometry {
  const verts: number[] = [];
  const idx: number[] = [];

  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r];
    // Compute local frame: approximate tangent from neighbours
    let tangent: THREE.Vector3;
    if (r === 0) {
      tangent = new THREE.Vector3(
        rings[1].cx - ring.cx, rings[1].cy - ring.cy, rings[1].cz - ring.cz,
      ).normalize();
    } else if (r === rings.length - 1) {
      tangent = new THREE.Vector3(
        ring.cx - rings[r - 1].cx, ring.cy - rings[r - 1].cy, ring.cz - rings[r - 1].cz,
      ).normalize();
    } else {
      tangent = new THREE.Vector3(
        rings[r + 1].cx - rings[r - 1].cx,
        rings[r + 1].cy - rings[r - 1].cy,
        rings[r + 1].cz - rings[r - 1].cz,
      ).normalize();
    }

    // Build orthonormal basis perpendicular to tangent
    // Use consistent reference direction for symmetry
    let normal: THREE.Vector3;
    if (refRight) {
      // Use provided reference for consistent orientation
      normal = new THREE.Vector3().crossVectors(tangent, refRight).normalize();
    } else {
      const up = Math.abs(tangent.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    }
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    for (let a = 0; a < radialN; a++) {
      const angle = (a / radialN) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const px = ring.cx + normal.x * cos * ring.rx + binormal.x * sin * ring.rz;
      const py = ring.cy + normal.y * cos * ring.rx + binormal.y * sin * ring.rz;
      const pz = ring.cz + normal.z * cos * ring.rx + binormal.z * sin * ring.rz;
      verts.push(px, py, pz);
    }
  }

  for (let r = 0; r < rings.length - 1; r++) {
    for (let a = 0; a < radialN; a++) {
      const na = (a + 1) % radialN;
      const c = r * radialN;
      const n = (r + 1) * radialN;
      idx.push(c + a, n + a, c + na);
      idx.push(c + na, n + a, n + na);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/*  Main body                                                          */
/* ------------------------------------------------------------------ */

const N = 24;

export function createBodyMesh(): THREE.Group {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd5ba,
    emissive: 0xe09575,
    emissiveIntensity: 0.18,
    metalness: 0.0,
    roughness: 0.70,
    clearcoat: 0.15,
    clearcoatRoughness: 0.40,
    sheen: 0.35,
    sheenRoughness: 0.30,
    sheenColor: new THREE.Color(0xffbfa5),
  });

  const addGeo = (geo: THREE.BufferGeometry, pos?: THREE.Vector3, rot?: THREE.Euler) => {
    const mesh = new THREE.Mesh(geo, skinMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (pos) mesh.position.copy(pos);
    if (rot) mesh.rotation.copy(rot);
    group.add(mesh);
  };

  /* ---- TORSO + HEAD (one continuous mesh) ---- */
  const torsoCross: CrossSection[] = [
    { y: 2.02, radii: expandRadii([0.01, 0.01, 0.01, 0.01], N) },
    { y: 1.92, radii: expandRadii([0.16, 0.17, 0.18, 0.17], N) },
    { y: 1.78, radii: expandRadii([0.19, 0.22, 0.21, 0.22], N) },
    { y: 1.68, radii: expandRadii([0.20, 0.21, 0.19, 0.21], N) },
    { y: 1.60, radii: expandRadii([0.18, 0.18, 0.16, 0.18], N), zOff: 0.04 },
    { y: 1.52, radii: expandRadii([0.14, 0.14, 0.12, 0.14], N), zOff: 0.05 },
    { y: 1.47, radii: expandRadii([0.08, 0.08, 0.08, 0.08], N), zOff: 0.02 },
    { y: 1.42, radii: expandRadii([0.07, 0.075, 0.07, 0.075], N) },
    { y: 1.38, radii: expandRadii([0.08, 0.09, 0.08, 0.09], N) },
    { y: 1.33, radii: expandRadii([0.14, 0.24, 0.12, 0.24], N) },
    { y: 1.26, radii: expandRadii([0.20, 0.26, 0.15, 0.26], N), zOff: 0.03 },
    { y: 1.18, radii: expandRadii([0.22, 0.27, 0.16, 0.27], N), zOff: 0.04 },
    { y: 1.10, radii: expandRadii([0.20, 0.25, 0.15, 0.25], N), zOff: 0.03 },
    { y: 1.02, radii: expandRadii([0.19, 0.23, 0.15, 0.23], N), zOff: 0.02 },
    { y: 0.94, radii: expandRadii([0.18, 0.21, 0.15, 0.21], N), zOff: 0.02 },
    { y: 0.86, radii: expandRadii([0.17, 0.19, 0.15, 0.19], N), zOff: 0.01 },
    { y: 0.78, radii: expandRadii([0.18, 0.21, 0.17, 0.21], N) },
    { y: 0.70, radii: expandRadii([0.19, 0.24, 0.18, 0.24], N) },
    { y: 0.62, radii: expandRadii([0.18, 0.24, 0.20, 0.24], N) },
    { y: 0.54, radii: expandRadii([0.15, 0.20, 0.18, 0.20], N) },
    { y: 0.48, radii: expandRadii([0.10, 0.14, 0.13, 0.14], N) },
  ];
  addGeo(buildOrganicMesh(torsoCross, N, 80));

  // Nose
  const noseGeo = new THREE.CapsuleGeometry(0.030, 0.075, 10, 16);
  noseGeo.computeVertexNormals();
  addGeo(noseGeo, new THREE.Vector3(0, 1.65, 0.22), new THREE.Euler(0.4, 0, 0));

  // Ears
  for (const side of [-1, 1]) {
    const earGeo = new THREE.SphereGeometry(0.048, 20, 16);
    earGeo.computeVertexNormals();
    const earMesh = new THREE.Mesh(earGeo, skinMat);
    earMesh.castShadow = true;
    earMesh.receiveShadow = true;
    earMesh.position.set(side * 0.24, 1.68, -0.01);
    earMesh.scale.set(0.45, 1.0, 0.60);
    group.add(earMesh);
  }

  /* ---- ARMS ----
     Each arm is ONE continuous tube: shoulder→upper arm→elbow→forearm→wrist→hand.
     The first ring starts *inside* the torso at the shoulder surface so there's
     no visible gap. */
  const armRadial = 16;
  for (const side of [-1, 1]) {
    const sx = side * 0.18;  // shoulder root inside torso (closer to center)
    const armRings: LimbRing[] = [
      // Shoulder root (buried inside torso at shoulder height)
      { cx: sx,              cy: 1.26,  cz: 0.00,  rx: 0.11,  rz: 0.11  },
      // Deltoid bulge outward
      { cx: side * 0.26,     cy: 1.24,  cz: 0.00,  rx: 0.094, rz: 0.090 },
      { cx: side * 0.30,     cy: 1.20,  cz: 0.00,  rx: 0.082, rz: 0.080 },
      // Shoulder-arm transition
      { cx: side * 0.33,     cy: 1.16,  cz: 0.00,  rx: 0.070, rz: 0.068 },
      // Upper arm top
      { cx: side * 0.36,     cy: 1.10,  cz: 0.01,  rx: 0.064, rz: 0.062 },
      // Bicep peak
      { cx: side * 0.38,     cy: 1.04,  cz: 0.015, rx: 0.070, rz: 0.066 },
      // Mid upper arm
      { cx: side * 0.40,     cy: 0.98,  cz: 0.015, rx: 0.063, rz: 0.061 },
      // Above elbow
      { cx: side * 0.42,     cy: 0.92,  cz: 0.02,  rx: 0.057, rz: 0.055 },
      // Elbow
      { cx: side * 0.43,     cy: 0.88,  cz: 0.02,  rx: 0.051, rz: 0.049 },
      // Below elbow
      { cx: side * 0.44,     cy: 0.84,  cz: 0.02,  rx: 0.052, rz: 0.050 },
      // Forearm bulge
      { cx: side * 0.45,     cy: 0.78,  cz: 0.025, rx: 0.050, rz: 0.047 },
      // Mid forearm
      { cx: side * 0.46,     cy: 0.72,  cz: 0.03,  rx: 0.045, rz: 0.041 },
      // Lower forearm
      { cx: side * 0.47,     cy: 0.66,  cz: 0.03,  rx: 0.039, rz: 0.036 },
      // Wrist
      { cx: side * 0.48,     cy: 0.62,  cz: 0.035, rx: 0.036, rz: 0.029 },
      // Palm base (wider, flatter)
      { cx: side * 0.49,     cy: 0.58,  cz: 0.04,  rx: 0.042, rz: 0.021 },
      // Mid palm
      { cx: side * 0.50,     cy: 0.54,  cz: 0.045, rx: 0.040, rz: 0.019 },
      // Upper palm
      { cx: side * 0.51,     cy: 0.50,  cz: 0.05,  rx: 0.038, rz: 0.017 },
      // Finger base
      { cx: side * 0.515,    cy: 0.46,  cz: 0.055, rx: 0.032, rz: 0.015 },
      // Mid fingers
      { cx: side * 0.52,     cy: 0.42,  cz: 0.06,  rx: 0.024, rz: 0.012 },
      // Finger taper
      { cx: side * 0.525,    cy: 0.39,  cz: 0.065, rx: 0.016, rz: 0.009 },
      // Finger tip
      { cx: side * 0.53,     cy: 0.37,  cz: 0.07,  rx: 0.008, rz: 0.005 },
    ];
    // Use Z-axis as consistent reference for arm orientation
    const armRef = new THREE.Vector3(0, 0, 1);
    addGeo(buildLimbTube(armRings, armRadial, armRef));
  }

  /* ---- LEGS ----
     Each leg is ONE continuous tube: hip root→thigh→knee→calf→ankle→foot→toes.
     First ring starts inside pelvis for seamless connection. */
  const legRadial = 20;
  for (const side of [-1, 1]) {
    const lx = side * 0.12;
    const legRings: LimbRing[] = [
      // Hip root (buried deeper inside pelvis)
      { cx: side * 0.05,  cy: 0.56,  cz: 0.00,  rx: 0.13,  rz: 0.13  },
      // Hip socket
      { cx: side * 0.09,  cy: 0.52,  cz: 0.00,  rx: 0.11,  rz: 0.11  },
      // Upper thigh
      { cx: lx,           cy: 0.44,  cz: 0.005, rx: 0.095, rz: 0.092 },
      // Thigh peak (quads)
      { cx: lx,           cy: 0.36,  cz: 0.01,  rx: 0.095, rz: 0.092 },
      // Mid thigh
      { cx: lx,           cy: 0.28,  cz: 0.008, rx: 0.088, rz: 0.085 },
      // Lower thigh
      { cx: lx,           cy: 0.20,  cz: 0.005, rx: 0.080, rz: 0.077 },
      // Above knee
      { cx: lx,           cy: 0.14,  cz: 0.01,  rx: 0.074, rz: 0.070 },
      // Knee cap
      { cx: lx,           cy: 0.09,  cz: 0.02,  rx: 0.068, rz: 0.064 },
      // Below knee
      { cx: lx,           cy: 0.04,  cz: 0.015, rx: 0.065, rz: 0.062 },
      // Calf bulge
      { cx: lx,           cy: -0.02, cz: 0.005, rx: 0.070, rz: 0.066 },
      // Mid calf
      { cx: lx,           cy: -0.10, cz: 0.008, rx: 0.062, rz: 0.058 },
      // Lower calf
      { cx: lx,           cy: -0.16, cz: 0.008, rx: 0.052, rz: 0.048 },
      // Above ankle
      { cx: lx,           cy: -0.22, cz: 0.01,  rx: 0.046, rz: 0.042 },
      // Ankle
      { cx: lx,           cy: -0.27, cz: 0.015, rx: 0.042, rz: 0.038 },
      // Heel top
      { cx: lx,           cy: -0.30, cz: 0.005, rx: 0.044, rz: 0.042 },
      // Heel bottom / foot start
      { cx: lx,           cy: -0.32, cz: 0.00,  rx: 0.046, rz: 0.048 },
      // Mid foot (arch)
      { cx: lx,           cy: -0.33, cz: 0.04,  rx: 0.046, rz: 0.042 },
      // Forefoot
      { cx: lx,           cy: -0.335, cz: 0.08, rx: 0.048, rz: 0.038 },
      // Ball of foot (wider)
      { cx: lx,           cy: -0.34, cz: 0.12,  rx: 0.050, rz: 0.032 },
      // Ball of foot
      { cx: lx,           cy: -0.345, cz: 0.16, rx: 0.048, rz: 0.028 },
      // Toes
      { cx: lx,           cy: -0.35, cz: 0.19,  rx: 0.042, rz: 0.024 },
      // Toe tips
      { cx: lx,           cy: -0.352, cz: 0.22, rx: 0.028, rz: 0.018 },
      // Toe point
      { cx: lx,           cy: -0.353, cz: 0.24, rx: 0.015, rz: 0.010 },
      // Toe end
      { cx: lx,           cy: -0.354, cz: 0.25, rx: 0.005, rz: 0.005 },
    ];
    // Use X-axis as consistent reference for leg orientation
    const legRef = new THREE.Vector3(1, 0, 0);
    addGeo(buildLimbTube(legRings, legRadial, legRef));
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
