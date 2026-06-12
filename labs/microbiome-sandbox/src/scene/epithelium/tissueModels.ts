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
 * GUT — U-shaped wall with vertical finger villi rooted on the inner mucosa.
 * Villi extend straight up (+Y); no lookAt tilting.
 */
export function buildGutTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];

  const baseY = 0.18;
  const tubeR = 1.42;
  const innerR = tubeR - 0.3;

  const muscle = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR, 0.22, 14, 56, Math.PI),
    mat(P.muscularis, { roughness: 0.82 }),
  );
  muscle.position.set(0, baseY, 0);
  group.add(muscle, outline(muscle, 0x8a5868, 0.45));

  const submucosa = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR - 0.17, 0.075, 10, 48, Math.PI),
    mat(P.laminaDeep),
  );
  submucosa.position.set(0, baseY + 0.02, 0.03);
  group.add(submucosa);

  const mucosa = new THREE.Mesh(
    new THREE.TorusGeometry(innerR, 0.04, 8, 48, Math.PI),
    mat(P.villusEpi),
  );
  mucosa.position.set(0, baseY + 0.03, 0.05);
  group.add(mucosa);

  const villusCount = 13;
  const villusLen = 0.36;
  const villusR = 0.068;
  let maxVillusTop = 0;

  for (let i = 0; i < villusCount; i++) {
    const t = i / (villusCount - 1);
    const angle = Math.PI * (1 - t);
    const bx = Math.cos(angle) * innerR;
    const by = baseY + Math.sin(angle) * innerR;
    const inflamed = i >= 4 && i <= 8;
    const tipY = by + villusR * 2 + villusLen;
    maxVillusTop = Math.max(maxVillusTop, tipY);

    const villus = new THREE.Mesh(
      new THREE.CapsuleGeometry(villusR, villusLen, 10, 14),
      mat(inflamed ? P.cytoplasmDeep : P.villusEpi),
    );
    villus.position.set(bx, by + villusR + villusLen * 0.5, 0.07);
    group.add(villus, outline(villus, 0xe89090, 0.38));
    if (inflamed) {
      villus.userData.baseColor = P.villusEpi;
      inflamedMeshes.push(villus);
    }

    const core = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.028, villusLen * 0.65, 6, 8),
      mat(P.lacteal, { roughness: 0.28 }),
    );
    core.position.set(bx, by + villusR + villusLen * 0.42, 0.09);
    group.add(core);

    if (i % 2 === 1) {
      const t2 = (i - 0.5) / (villusCount - 1);
      const a2 = Math.PI * (1 - t2);
      const cx = Math.cos(a2) * (innerR - 0.04);
      const cy = baseY + Math.sin(a2) * (innerR - 0.04);
      const crypt = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.05, DEPTH * 0.45),
        mat(P.crypt),
      );
      crypt.position.set(cx, cy - 0.02, 0.05);
      group.add(crypt);
    }
  }

  const lumenY = maxVillusTop + 0.12;
  const lumen = new THREE.Mesh(
    new THREE.PlaneGeometry(tubeR * 1.35, tubeR * 0.75),
    mat(0x0c2848, { transparent: true, opacity: 0.48, side: THREE.DoubleSide }),
  );
  lumen.position.set(0, lumenY, -0.02);
  group.add(lumen);

  const mucus = mucusSheet(2.5, 0.95, lumenY + 0.35, 0.06);
  group.add(mucus);
  overlays.push(mucus);

  const scfa = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.75),
    mat(0x2dd4bf, { transparent: true, opacity: 0, emissive: 0x2dd4bf, emissiveIntensity: 0 }),
  );
  scfa.position.set(0, lumenY + 0.55, 0.07);
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

export const LUMEN_BOUNDS: Record<EpitheliumKind, { yMin: number; yMax: number; allergenBase: number }> = {
  gut: { yMin: 0.95, yMax: 1.85, allergenBase: 1.7 },
  skin: { yMin: 0.48, yMax: 1.35, allergenBase: 1.25 },
  sinus: { yMin: 0.55, yMax: 1.45, allergenBase: 1.35 },
};
