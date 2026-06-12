import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, trackInflamed, type TissueBuildResult } from './shared';

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
      trackInflamed(cup, P.mucusVacuole, inflamedMeshes);
    } else {
      const colH = 0.34 + (i % 3) * 0.08;
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, colH, DEPTH * 0.78),
        mat(P.cytoplasm),
      );
      col.position.set(x, epiBase + colH / 2 + 0.02, 0);
      group.add(col, outline(col, 0xe0b0a8, 0.35));
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
