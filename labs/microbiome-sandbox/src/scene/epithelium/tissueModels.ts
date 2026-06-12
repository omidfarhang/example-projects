import * as THREE from 'three';
import { P } from './tissuePalette';
import type { EpitheliumKind } from './types';

export interface TissueBuildResult {
  group: THREE.Group;
  inflamedMeshes: THREE.Mesh[];
  overlays: THREE.Mesh[];
  kind: EpitheliumKind;
}

const DEPTH = 0.16;

function mat(color: number, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.03, ...opts });
}

function outline(mesh: THREE.Mesh, color = 0x38bdf8, opacity = 0.42) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  return edges;
}

function mucusSheet(w: number, h: number, y: number, z: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    mat(P.mucus, { transparent: true, opacity: 0.2, depthWrite: false }),
  );
  m.position.set(0, y, z);
  m.userData.isMucus = true;
  return m;
}

/**
 * GUT — textbook longitudinal small-intestine mucosa (matches skin layer clarity):
 * muscularis → submucosa → muscularis mucosae → lamina propria → villi & crypts → lumen.
 */
export function buildGutTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 5.2;

  const layers: { name: string; h: number; color: number }[] = [
    { name: 'muscularis', h: 0.18, color: P.muscularis },
    { name: 'submucosa', h: 0.1, color: P.laminaDeep },
    { name: 'muscularisMucosae', h: 0.022, color: 0x6a3848 },
    { name: 'laminaPropria', h: 0.08, color: P.villusCore },
  ];

  let y = 0;
  for (const layer of layers) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, layer.h, DEPTH), mat(layer.color, { roughness: layer.name === 'muscularis' ? 0.78 : 0.55 }));
    slab.position.set(0, y + layer.h / 2, 0);
    group.add(slab, outline(slab, layer.name === 'muscularis' ? 0x8a5868 : 0xa07068, 0.35));

    if (layer.name === 'muscularis') {
      for (let i = 0; i < 7; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.012, 0.003, 4, 8),
          mat(0x5a3040, { roughness: 0.9 }),
        );
        ring.rotation.y = Math.PI / 2;
        ring.position.set(-W / 2 + 0.35 + i * ((W - 0.7) / 6), y + layer.h / 2, (i % 2) * 0.04 - 0.02);
        group.add(ring);
      }
    }

    if (layer.name === 'submucosa') {
      for (let i = 0; i < 5; i++) {
        const vessel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, layer.h * 0.7, 6),
          mat(P.capillary, { roughness: 0.35 }),
        );
        vessel.rotation.z = Math.PI / 2;
        vessel.position.set(-W / 2 + 0.6 + i * 0.95, y + layer.h / 2, 0.04);
        group.add(vessel);
      }
    }

    y += layer.h;
  }

  const mucosalSurfaceY = y;
  const villusCount = 11;
  const margin = 0.32;
  const pitch = (W - margin * 2) / (villusCount - 1);
  let maxVillusTop = mucosalSurfaceY;

  for (let i = 0; i < villusCount; i++) {
    const vx = -W / 2 + margin + i * pitch;
    const inflamed = i >= 3 && i <= 7;
    const villusH = 0.3 + (i % 3) * 0.07;
    const villusR = 0.052;
    const tipY = mucosalSurfaceY + villusR * 2 + villusH;
    maxVillusTop = Math.max(maxVillusTop, tipY);

    const villus = new THREE.Mesh(
      new THREE.CapsuleGeometry(villusR, villusH, 10, 14),
      mat(inflamed ? P.cytoplasmDeep : P.villusEpi),
    );
    villus.position.set(vx, mucosalSurfaceY + villusR + villusH * 0.5, 0.06);
    group.add(villus, outline(villus, 0xe89090, 0.38));
    if (inflamed) {
      villus.userData.baseColor = P.villusEpi;
      inflamedMeshes.push(villus);
    }

    const brushBorder = new THREE.Mesh(
      new THREE.TorusGeometry(villusR * 0.92, 0.006, 6, 16),
      mat(0xfff8f0, { roughness: 0.25 }),
    );
    brushBorder.rotation.x = Math.PI / 2;
    brushBorder.position.set(vx, tipY - 0.01, 0.1);
    group.add(brushBorder);

    const lacteal = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, villusH * 0.72, 6, 8),
      mat(P.lacteal, { roughness: 0.22 }),
    );
    lacteal.position.set(vx, mucosalSurfaceY + villusR + villusH * 0.44, 0.08);
    group.add(lacteal);

    const capillary = new THREE.Mesh(
      new THREE.TorusGeometry(villusR * 0.55, 0.005, 4, 10),
      mat(P.capillary, { roughness: 0.4 }),
    );
    capillary.rotation.x = Math.PI / 2;
    capillary.position.set(vx, mucosalSurfaceY + villusR * 1.6, 0.07);
    group.add(capillary);

    if (i % 2 === 1) {
      const cx = vx - pitch * 0.5;
      const crypt = new THREE.Mesh(
        new THREE.BoxGeometry(pitch * 0.55, 0.055, DEPTH * 0.55),
        mat(P.crypt),
      );
      crypt.position.set(cx, mucosalSurfaceY - 0.028, 0.04);
      group.add(crypt, outline(crypt, 0x6a3848, 0.3));
    }
  }

  const lumenFloor = maxVillusTop + 0.04;
  const lumen = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.96, 0.55),
    mat(0x1a3858, { transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
  );
  lumen.position.set(0, lumenFloor + 0.28, -0.02);
  group.add(lumen);

  const mucus = mucusSheet(W * 0.88, 0.22, lumenFloor + 0.06, 0.1);
  group.add(mucus);
  overlays.push(mucus);

  const scfa = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.82, 0.38),
    mat(0x2dd4bf, { transparent: true, opacity: 0, emissive: 0x2dd4bf, emissiveIntensity: 0 }),
  );
  scfa.position.set(0, lumenFloor + 0.22, 0.11);
  scfa.userData.isScfa = true;
  group.add(scfa);
  overlays.push(scfa);

  return { group, inflamedMeshes, overlays, kind: 'gut' };
}

/**
 * SKIN — unmistakable layer cake with rete ridges + hair follicle.
 */
export function buildSkinTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 5.2;

  const layers: { name: string; h: number; color: number; cells: number }[] = [
    { name: 'corneum', h: 0.08, color: P.corneum, cells: 16 },
    { name: 'granulosum', h: 0.075, color: P.granulosum, cells: 14 },
    { name: 'spinous', h: 0.14, color: P.spinous, cells: 12 },
    { name: 'basale', h: 0.1, color: P.basale, cells: 13 },
    { name: 'dermis', h: 0.24, color: P.dermis, cells: 0 },
  ];

  let y = 0;
  for (const layer of layers) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, layer.h, DEPTH), mat(layer.color));
    slab.position.set(0, y + layer.h / 2, 0);
    group.add(slab, outline(slab, 0x9a6868, 0.35));

    if (layer.cells > 0) {
      const pitch = W / layer.cells;
      for (let i = 0; i < layer.cells; i++) {
        const cx = -W / 2 + pitch * 0.5 + i * pitch;
        const stagger = layer.name === 'corneum' && i % 2 ? pitch * 0.28 : 0;
        const bumpH = layer.h * (layer.name === 'corneum' ? 0.65 : 0.55);
        const bump = new THREE.Mesh(
          new THREE.BoxGeometry(pitch * 0.78, bumpH, DEPTH * 0.42),
          mat(layer.name === 'corneum' ? P.lipid : layer.color, {
            roughness: layer.name === 'corneum' ? 0.32 : 0.55,
          }),
        );
        bump.position.set(cx + stagger, y + layer.h / 2 + (layer.name === 'corneum' ? 0.01 : 0), DEPTH * 0.24);
        group.add(bump);
        if (layer.name === 'spinous' && i >= 4 && i <= 7) {
          bump.userData.baseColor = P.spinous;
          inflamedMeshes.push(bump);
        }
        if (layer.name !== 'corneum' && layer.name !== 'granulosum') {
          const nuc = new THREE.Mesh(
            new THREE.SphereGeometry(layer.h * 0.2, 8, 6),
            mat(P.nucleus),
          );
          nuc.position.set(cx, y + layer.h * 0.48, DEPTH * 0.34);
          group.add(nuc);
        }
      }
    } else {
      for (let i = 0; i < 11; i++) {
        const fib = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.55 + (i % 3) * 0.25, 4),
          mat(P.collagen),
        );
        fib.rotation.z = Math.PI / 2;
        fib.rotation.y = (i % 5) * 0.18 - 0.36;
        fib.position.set(-W / 2 + (i + 0.5) * (W / 11), y + layer.h / 2, (i % 2) * 0.04 - 0.02);
        group.add(fib);
      }
    }
    y += layer.h;
  }

  const junctionY = layers[0].h + layers[1].h + layers[2].h + layers[3].h;
  const pegCount = 9;
  const pegPitch = W / pegCount;
  for (let i = 0; i < pegCount; i++) {
    const px = -W / 2 + pegPitch * 0.5 + i * pegPitch;
    const pegH = i % 2 === 0 ? 0.09 : 0.05;
    const peg = new THREE.Mesh(
      new THREE.BoxGeometry(pegPitch * 0.55, pegH, DEPTH * 0.5),
      mat(i % 2 === 0 ? P.basale : P.dermis),
    );
    peg.position.set(px, junctionY - pegH / 2 + 0.01, DEPTH * 0.12);
    group.add(peg);
  }

  const follicleX = 0.55;
  const follicleTop = layers[0].h + layers[1].h + layers[2].h + layers[3].h + layers[4].h;
  const follicleH = follicleTop + 0.08;
  const follicle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.1, follicleH, 12),
    mat(P.basale),
  );
  follicle.position.set(follicleX, follicleH / 2 - 0.04, 0.02);
  group.add(follicle, outline(follicle, 0xc08070, 0.4));

  const hair = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 0.55, 6),
    mat(0x2a1a10, { roughness: 0.9 }),
  );
  hair.position.set(follicleX, follicleTop + 0.22, DEPTH * 0.35);
  group.add(hair);

  const sebaceous = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 10),
    mat(0xf0e8c8, { roughness: 0.35 }),
  );
  sebaceous.position.set(follicleX + 0.14, follicleH * 0.42, 0.06);
  sebaceous.scale.set(1.1, 0.75, 0.85);
  group.add(sebaceous, outline(sebaceous, 0xd8c878, 0.35));

  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(W, 0.025),
    mat(P.lipid, { transparent: true, opacity: 0.16, metalness: 0.22 }),
  );
  sheen.position.set(0, follicleTop + 0.02, DEPTH * 0.48);
  sheen.userData.isSheen = true;
  group.add(sheen);
  overlays.push(sheen);

  const biofilm = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.9, 0.045),
    mat(0x9333ea, { transparent: true, opacity: 0 }),
  );
  biofilm.position.set(0, follicleTop + 0.04, DEPTH * 0.5);
  biofilm.userData.isBiofilm = true;
  group.add(biofilm);
  overlays.push(biofilm);

  return { group, inflamedMeshes, overlays, kind: 'skin' };
}

/**
 * NOSE/SINUS — layered airway cross-section (like skin clarity):
 * lamina → pseudostratified epithelium → cilia brush → sinus lumen → turbinate bone.
 */
export function buildNasalTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];

  const span = 5;
  const baseY = 0.08;
  const laminaH = 0.14;
  const epiBase = baseY + laminaH + 0.02;

  const lamina = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.2, laminaH, DEPTH),
    mat(P.laminaDeep),
  );
  lamina.position.set(0, baseY + laminaH / 2, 0);
  group.add(lamina, outline(lamina, 0xa07068, 0.35));

  const bm = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.2, 0.016, DEPTH + 0.02),
    mat(P.basement),
  );
  bm.position.set(0, epiBase, 0);
  group.add(bm);

  const cols = 12;
  const pitch = span / (cols - 1);
  let maxApicalY = epiBase;

  for (let i = 0; i < cols; i++) {
    const x = -span / 2 + i * pitch;
    const inflamed = i >= 4 && i <= 7;
    const isGoblet = i === 1 || i === 4 || i === 7 || i === 10;

    if (isGoblet) {
      const stemH = 0.14;
      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, stemH, DEPTH * 0.7),
        mat(P.cytoplasmDeep),
      );
      stem.position.set(x, epiBase + stemH / 2 + 0.01, 0);
      group.add(stem);

      const cup = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 14, 12),
        mat(P.mucusVacuole, { transparent: true, opacity: 0.9, roughness: 0.08 }),
      );
      cup.position.set(x, epiBase + stemH + 0.1, 0);
      cup.scale.set(0.95, 0.78, 0.82);
      group.add(cup, outline(cup, 0xa8d0e8, 0.4));
      maxApicalY = Math.max(maxApicalY, epiBase + stemH + 0.18);
      if (inflamed) {
        cup.userData.baseColor = P.mucusVacuole;
        inflamedMeshes.push(cup);
      }
    } else {
      const colH = 0.34 + (i % 3) * 0.08;
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, colH, DEPTH * 0.78),
        mat(inflamed ? P.cytoplasmDeep : P.cytoplasm),
      );
      col.position.set(x, epiBase + colH / 2 + 0.02, 0);
      group.add(col, outline(col, 0xe0b0a8, 0.35));
      if (inflamed) {
        col.userData.baseColor = P.cytoplasm;
        inflamedMeshes.push(col);
      }

      const nucOffsets = [0.12, 0.24, 0.18, 0.3];
      const nucY = epiBase + nucOffsets[i % nucOffsets.length];
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 8), mat(P.nucleus));
      nuc.position.set(x + (i % 2 ? 0.02 : -0.02), nucY, DEPTH * 0.28);
      group.add(nuc);

      const ciliaBase = epiBase + colH + 0.04;
      for (let c = 0; c < 8; c++) {
        const cil = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0028, 0.0012, 0.09, 3),
          mat(P.cilia),
        );
        cil.position.set(x + (c - 3.5) * 0.014, ciliaBase + 0.045, (c % 2) * 0.006);
        group.add(cil);
      }
      maxApicalY = Math.max(maxApicalY, ciliaBase + 0.1);
    }
  }

  const brushY = maxApicalY + 0.02;
  const ciliaBrush = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.1, 0.05, DEPTH * 0.35),
    mat(P.cilia, { transparent: true, opacity: 0.4 }),
  );
  ciliaBrush.position.set(0, brushY, DEPTH * 0.18);
  group.add(ciliaBrush);

  const mucus = mucusSheet(span, 0.32, brushY + 0.08, 0.08);
  group.add(mucus);
  overlays.push(mucus);

  const airwayY = brushY + 0.28;
  const airway = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.15, 0.55, DEPTH * 1.2),
    mat(0x1a4870, { transparent: true, opacity: 0.38 }),
  );
  airway.position.set(0, airwayY, -0.02);
  group.add(airway);

  const turbinateCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-span / 2 - 0.05, airwayY + 0.12, 0.02),
    new THREE.Vector3(0, airwayY + 0.62, 0),
    new THREE.Vector3(span / 2 + 0.05, airwayY + 0.12, 0.02),
  );
  const turbinate = new THREE.Mesh(
    new THREE.TubeGeometry(turbinateCurve, 32, 0.11, 10, false),
    mat(0x7a98a8, { roughness: 0.78 }),
  );
  group.add(turbinate, outline(turbinate, 0x5890b0, 0.45));

  const lowerFold = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-span / 3, airwayY + 0.05, 0.04),
    new THREE.Vector3(-span / 6, airwayY + 0.28, 0.03),
    new THREE.Vector3(0, airwayY + 0.08, 0.04),
  );
  const fold = new THREE.Mesh(
    new THREE.TubeGeometry(lowerFold, 16, 0.05, 6, false),
    mat(0x8aa0b0, { roughness: 0.8 }),
  );
  group.add(fold);

  return { group, inflamedMeshes, overlays, kind: 'sinus' };
}

/**
 * EAR CANAL — narrow tubular squamous canal (not ciliated sinus):
 * cartilage ring → stratified squamous layers → cerumen film → tympanic membrane.
 */
export function buildEarCanalTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 4.6;
  const canalH = 1.05;

  const cartilage = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.07, 10, 24, Math.PI),
    mat(0x8a98a8, { roughness: 0.82 }),
  );
  cartilage.rotation.z = Math.PI;
  cartilage.position.set(0, 0.1, 0.02);
  group.add(cartilage, outline(cartilage, 0x6890b0, 0.4));

  const layers: { name: string; h: number; color: number; cells: number }[] = [
    { name: 'basale', h: 0.07, color: P.basale, cells: 10 },
    { name: 'spinous', h: 0.09, color: P.spinous, cells: 10 },
    { name: 'granulosum', h: 0.06, color: P.granulosum, cells: 10 },
    { name: 'corneum', h: 0.05, color: P.corneum, cells: 12 },
  ];

  let y = 0.14;
  for (const layer of layers) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, layer.h, DEPTH * 0.9), mat(layer.color));
    slab.position.set(0, y + layer.h / 2, 0);
    group.add(slab, outline(slab, 0xb89080, 0.32));

    const pitch = W / layer.cells;
    for (let i = 0; i < layer.cells; i++) {
      const cx = -W / 2 + pitch * 0.5 + i * pitch;
      const bump = new THREE.Mesh(
        new THREE.BoxGeometry(pitch * 0.72, layer.h * 0.58, DEPTH * 0.38),
        mat(layer.name === 'corneum' ? P.lipid : layer.color, {
          roughness: layer.name === 'corneum' ? 0.28 : 0.55,
        }),
      );
      bump.position.set(cx, y + layer.h / 2 + (layer.name === 'corneum' ? 0.008 : 0), DEPTH * 0.22);
      group.add(bump);
      if (layer.name === 'spinous' && i >= 3 && i <= 6) {
        bump.userData.baseColor = P.spinous;
        inflamedMeshes.push(bump);
      }
    }
    y += layer.h;
  }

  const canalTop = y;
  for (let i = 0; i < 4; i++) {
    const gx = -0.55 + i * 0.38;
    const gland = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      mat(0xe8c878, { roughness: 0.35 }),
    );
    gland.position.set(gx, canalTop - 0.02, DEPTH * 0.32);
    gland.scale.set(1.2, 0.7, 0.9);
    group.add(gland);
  }

  for (let i = 0; i < 7; i++) {
    const hx = -1.4 + i * 0.42;
    const hair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.0015, 0.14, 3),
      mat(0x3a2818, { roughness: 0.92 }),
    );
    hair.position.set(hx, canalTop + 0.1, DEPTH * 0.42);
    hair.rotation.z = (i % 2 ? 0.12 : -0.08);
    group.add(hair);
  }

  const cerumen = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.88, 0.12),
    mat(0xd4a040, { transparent: true, opacity: 0.22, roughness: 0.4 }),
  );
  cerumen.position.set(0, canalTop + 0.06, DEPTH * 0.44);
  cerumen.userData.isCerumen = true;
  group.add(cerumen);
  overlays.push(cerumen);

  const mucus = mucusSheet(W * 0.82, 0.1, canalTop + 0.14, 0.1);
  group.add(mucus);
  overlays.push(mucus);

  const lumen = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.72, canalH, DEPTH * 0.85),
    mat(0x2a1810, { transparent: true, opacity: 0.45 }),
  );
  lumen.position.set(0, canalTop + canalH / 2 + 0.08, -0.01);
  group.add(lumen);

  const tympanum = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 20),
    mat(0xf0e8d8, { roughness: 0.35, side: THREE.DoubleSide }),
  );
  tympanum.position.set(W / 2 - 0.18, canalTop + canalH * 0.42, 0.02);
  tympanum.rotation.y = Math.PI / 2;
  group.add(tympanum, outline(tympanum, 0xd8c8b0, 0.45));

  const biofilm = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.7, 0.035),
    mat(0x9333ea, { transparent: true, opacity: 0 }),
  );
  biofilm.position.set(0, canalTop + 0.08, DEPTH * 0.48);
  biofilm.userData.isBiofilm = true;
  group.add(biofilm);
  overlays.push(biofilm);

  return { group, inflamedMeshes, overlays, kind: 'ear' };
}

/**
 * SCALP — dense follicular field with sebaceous units (distinct from single-follicle skin).
 */
export function buildScalpTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 5.2;

  const layers: { name: string; h: number; color: number }[] = [
    { name: 'corneum', h: 0.06, color: P.corneum },
    { name: 'granulosum', h: 0.06, color: P.granulosum },
    { name: 'spinous', h: 0.11, color: P.spinous },
    { name: 'basale', h: 0.08, color: P.basale },
    { name: 'dermis', h: 0.2, color: P.dermis },
    { name: 'subcutis', h: 0.12, color: 0xc8a878 },
  ];

  let y = 0;
  for (const layer of layers) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, layer.h, DEPTH), mat(layer.color));
    slab.position.set(0, y + layer.h / 2, 0);
    group.add(slab, outline(slab, 0x9a6868, 0.32));

    if (layer.name === 'dermis') {
      for (let i = 0; i < 14; i++) {
        const fib = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, 0.45 + (i % 4) * 0.2, 4),
          mat(P.collagen),
        );
        fib.rotation.z = Math.PI / 2;
        fib.rotation.y = (i % 6) * 0.15 - 0.45;
        fib.position.set(-W / 2 + (i + 0.5) * (W / 14), y + layer.h / 2, (i % 2) * 0.04 - 0.02);
        group.add(fib);
      }
    }
    y += layer.h;
  }

  const surfaceY = layers[0].h + layers[1].h + layers[2].h + layers[3].h + layers[4].h + layers[5].h;
  const follicleXs = [-1.35, 0, 1.35];

  for (let fi = 0; fi < follicleXs.length; fi++) {
    const fx = follicleXs[fi];
    const inflamed = fi === 1;
    const follicleH = 0.38 + fi * 0.04;
    const follicle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.085, follicleH, 12),
      mat(inflamed ? P.cytoplasmDeep : P.basale),
    );
    follicle.position.set(fx, follicleH / 2 - 0.02, 0.02);
    group.add(follicle, outline(follicle, 0xc08070, 0.38));
    if (inflamed) {
      follicle.userData.baseColor = P.basale;
      inflamedMeshes.push(follicle);
    }

    const hair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.72, 8),
      mat(0x1a1008, { roughness: 0.92 }),
    );
    hair.position.set(fx, surfaceY + 0.34, DEPTH * 0.38);
    group.add(hair);

    const sebaceous = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      mat(0xf0e0a8, { roughness: 0.28 }),
    );
    sebaceous.position.set(fx + 0.16, follicleH * 0.48, 0.06);
    sebaceous.scale.set(1.15, 0.8, 0.9);
    group.add(sebaceous, outline(sebaceous, 0xd8c878, 0.35));

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8),
      mat(0x9a5850),
    );
    bulb.position.set(fx, 0.04, 0.04);
    group.add(bulb);
  }

  const sweatCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.1, surfaceY - 0.08, 0.06),
    new THREE.Vector3(-1.2, surfaceY + 0.12, 0.08),
    new THREE.Vector3(-0.4, surfaceY - 0.02, 0.06),
  );
  const sweatDuct = new THREE.Mesh(
    new THREE.TubeGeometry(sweatCurve, 12, 0.018, 6, false),
    mat(0xd8c8b8, { roughness: 0.45 }),
  );
  group.add(sweatDuct);

  const sebumSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(W, 0.03),
    mat(0xf0d878, { transparent: true, opacity: 0.18, metalness: 0.28 }),
  );
  sebumSheen.position.set(0, surfaceY + 0.02, DEPTH * 0.48);
  sebumSheen.userData.isSebum = true;
  group.add(sebumSheen);
  overlays.push(sebumSheen);

  const biofilm = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.92, 0.05),
    mat(0x9333ea, { transparent: true, opacity: 0 }),
  );
  biofilm.position.set(0, surfaceY + 0.05, DEPTH * 0.5);
  biofilm.userData.isBiofilm = true;
  group.add(biofilm);
  overlays.push(biofilm);

  return { group, inflamedMeshes, overlays, kind: 'scalp' };
}

/** 3D volume where microbes swim, aligned to each tissue cross-section. */
export interface LumenBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  /** Epithelial attachment band — commensals & pathogens dock here. */
  epithelialY: number;
  /** Mucus / sebum layer — probiotics colonize here. */
  mucusY: number;
  allergenBase: number;
  allergenHeight: number;
}

export const LUMEN_BOUNDS: Record<EpitheliumKind, LumenBounds> = {
  sinus: {
    xMin: -2.35,
    xMax: 2.35,
    yMin: 0.52,
    yMax: 1.32,
    zMin: 0.04,
    zMax: 0.26,
    epithelialY: 0.56,
    mucusY: 0.72,
    allergenBase: 0.98,
    allergenHeight: 0.42,
  },
  skin: {
    xMin: -2.45,
    xMax: 2.45,
    yMin: 0.5,
    yMax: 0.98,
    zMin: 0.1,
    zMax: 0.46,
    epithelialY: 0.52,
    mucusY: 0.64,
    allergenBase: 0.82,
    allergenHeight: 0.22,
  },
  gut: {
    xMin: -2.4,
    xMax: 2.4,
    yMin: 0.78,
    yMax: 1.05,
    zMin: 0.08,
    zMax: 0.4,
    epithelialY: 0.72,
    mucusY: 0.82,
    allergenBase: 0.92,
    allergenHeight: 0.18,
  },
  ear: {
    xMin: -2.1,
    xMax: 2.1,
    yMin: 0.48,
    yMax: 1.18,
    zMin: 0.06,
    zMax: 0.3,
    epithelialY: 0.5,
    mucusY: 0.62,
    allergenBase: 0.88,
    allergenHeight: 0.35,
  },
  scalp: {
    xMin: -2.45,
    xMax: 2.45,
    yMin: 0.48,
    yMax: 1.05,
    zMin: 0.1,
    zMax: 0.48,
    epithelialY: 0.5,
    mucusY: 0.66,
    allergenBase: 0.88,
    allergenHeight: 0.2,
  },
};

/** Epithelial receptor columns — attachment sites along the tissue surface. */
export const RECEPTOR_SITES: Record<EpitheliumKind, number[]> = {
  sinus: Array.from({ length: 12 }, (_, i) => -2.5 + i * (5 / 11)),
  skin: Array.from({ length: 13 }, (_, i) => -2.5 + i * (5.2 / 12)),
  gut: Array.from({ length: 11 }, (_, i) => -2.6 + 0.32 + i * ((5.2 - 0.64) / 10)),
  ear: Array.from({ length: 10 }, (_, i) => -2.1 + i * (4.2 / 9)),
  scalp: [-1.35, 0, 1.35, -0.68, 0.68, -2.0, 2.0],
};
