import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, histologyVeil, livingSlab, mat, mucusSheet, organic, outline, trackInflamed, type TissueBuildResult } from './shared';

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

  const lamina = livingSlab(span + 0.2, laminaH, DEPTH, P.laminaDeep, {}, 1.2);
  lamina.position.set(0, baseY + laminaH / 2, 0);
  group.add(lamina, outline(lamina, 0xa07068, 0.35));

  const bm = livingSlab(span + 0.2, 0.016, DEPTH + 0.02, P.basement, { roughness: 0.85 }, 2.1);
  bm.position.set(0, epiBase, 0);
  group.add(bm);

  const cols = 12;
  const pitch = span / (cols - 1);
  let maxApicalY = epiBase;

  for (let i = 0; i < cols; i++) {
    const x = -span / 2 + i * pitch + organic(i + 0.4, 0.035);
    const isGoblet = i === 1 || i === 4 || i === 7 || i === 10;

    if (isGoblet) {
      const stemH = 0.14;
      const stem = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.034, stemH, 8, 10),
        mat(P.cytoplasmDeep, { roughness: 0.78 }),
      );
      stem.position.set(x, epiBase + stemH / 2 + 0.01, 0.01);
      stem.scale.set(0.92, 1, 0.55);
      stem.rotation.z = organic(i + 1.1, 0.06);
      group.add(stem);

      const cup = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 18, 14),
        mat(P.mucusVacuole, { transparent: true, opacity: 0.68, roughness: 0.22, depthWrite: false }),
      );
      cup.position.set(x, epiBase + stemH + 0.075, 0.02);
      cup.scale.set(0.82, 1.1, 0.58);
      cup.rotation.z = organic(i + 1.8, 0.12);
      group.add(cup);
      const basalNucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 10, 8),
        mat(P.nucleusDark, { roughness: 0.86 }),
      );
      basalNucleus.position.set(x + organic(i + 6, 0.014), epiBase + 0.055, DEPTH * 0.25);
      basalNucleus.scale.set(1.25, 0.75, 0.65);
      group.add(basalNucleus);
      maxApicalY = Math.max(maxApicalY, epiBase + stemH + 0.18);
      trackInflamed(cup, P.mucusVacuole, inflamedMeshes);
    } else {
      const colH = 0.32 + (i % 3) * 0.075 + organic(i + 2.2, 0.04);
      const col = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.038, colH, 8, 12),
        mat(P.cytoplasm, { roughness: 0.7 }),
      );
      col.position.set(x, epiBase + colH / 2 + 0.02, 0);
      col.scale.set(0.82, 1, 0.52);
      col.rotation.z = organic(i + 3.5, 0.05);
      group.add(col);
      trackInflamed(col, P.cytoplasm, inflamedMeshes);

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
        cil.position.set(x + (c - 3.5) * 0.014, ciliaBase + 0.045 + organic(c + i * 2, 0.01), (c % 2) * 0.006);
        cil.rotation.z = organic(c + i, 0.22);
        group.add(cil);
      }
      maxApicalY = Math.max(maxApicalY, ciliaBase + 0.1);
    }
  }

  const brushY = maxApicalY + 0.02;
  const ciliaBrush = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.1, 0.05, DEPTH * 0.35),
    mat(P.cilia, { transparent: true, opacity: 0.28 }),
  );
  ciliaBrush.position.set(0, brushY, DEPTH * 0.18);
  group.add(ciliaBrush);

  const mucus = mucusSheet(span, 0.32, brushY + 0.08, 0.08);
  mucus.rotation.z = -0.015;
  group.add(mucus);
  overlays.push(mucus);

  const veil = histologyVeil('sinus', span * 0.94, 0.78, epiBase + 0.18, DEPTH * 0.49);
  veil.userData.histologyBaseOpacity = 0.2;
  group.add(veil);
  overlays.push(veil);

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
