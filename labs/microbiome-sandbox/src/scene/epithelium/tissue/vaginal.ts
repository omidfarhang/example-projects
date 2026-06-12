import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, type TissueBuildResult } from './shared';

/**
 * VAGINAL — stratified squamous wall with rugae, glycogen-rich mucus, acidic niche.
 */
export function buildVaginalTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 4.8;

  const lamina = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.11, DEPTH),
    mat(P.laminaDeep),
  );
  lamina.position.set(0, 0.08, 0);
  group.add(lamina, outline(lamina, 0xa07068, 0.32));

  const epiH = 0.22;
  const epi = new THREE.Mesh(
    new THREE.BoxGeometry(W, epiH, DEPTH * 0.85),
    mat(P.cytoplasm),
  );
  epi.position.set(0, 0.08 + epiH / 2 + 0.02, 0);
  group.add(epi, outline(epi, 0xe0b0a8, 0.35));

  const cols = 10;
  const pitch = W / cols;
  const epiBase = 0.08 + 0.02;
  for (let i = 0; i < cols; i++) {
    const x = -W / 2 + pitch * 0.5 + i * pitch;
    const inflamed = i >= 3 && i <= 6;
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(pitch * 0.72, epiH * 0.82, DEPTH * 0.55),
      mat(inflamed ? P.cytoplasmDeep : P.cytoplasm),
    );
    col.position.set(x, epiBase + epiH * 0.5, DEPTH * 0.18);
    group.add(col);
    if (inflamed) {
      col.userData.baseColor = P.cytoplasm;
      inflamedMeshes.push(col);
    }
  }

  const rugaeCount = 5;
  const surfaceY = epiBase + epiH;
  for (let i = 0; i < rugaeCount; i++) {
    const rx = -W / 2 + 0.4 + i * ((W - 0.8) / (rugaeCount - 1));
    const fold = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.04, DEPTH * 0.45),
      mat(0xd8a0a0, { roughness: 0.45 }),
    );
    fold.position.set(rx, surfaceY + 0.02 + (i % 2) * 0.02, DEPTH * 0.22);
    group.add(fold);
  }

  const glycogenMucus = mucusSheet(W * 0.9, 0.16, surfaceY + 0.1, 0.1);
  group.add(glycogenMucus);
  overlays.push(glycogenMucus);

  const acidSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(W, 0.025),
    mat(0xf0e8f8, { transparent: true, opacity: 0.14, metalness: 0.18 }),
  );
  acidSheen.position.set(0, surfaceY + 0.04, DEPTH * 0.44);
  acidSheen.userData.isSheen = true;
  group.add(acidSheen);
  overlays.push(acidSheen);

  const lumen = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.78, 0.48, DEPTH * 0.8),
    mat(0x2a1828, { transparent: true, opacity: 0.42 }),
  );
  lumen.position.set(0, surfaceY + 0.32, -0.01);
  group.add(lumen);

  const biofilm = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.82, 0.04),
    mat(0x9333ea, { transparent: true, opacity: 0 }),
  );
  biofilm.position.set(0, surfaceY + 0.07, DEPTH * 0.48);
  biofilm.userData.isBiofilm = true;
  group.add(biofilm);
  overlays.push(biofilm);

  return { group, inflamedMeshes, overlays, kind: 'vaginal' };
}
