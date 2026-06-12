import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, type TissueBuildResult } from './shared';

/**
 * ORAL — non-keratinized mucosa with papillae, saliva film, thrush-prone patches.
 */
export function buildOralTissue(): TissueBuildResult {
  const group = new THREE.Group();
  const overlays: THREE.Mesh[] = [];
  const inflamedMeshes: THREE.Mesh[] = [];
  const W = 5;

  const submucosa = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.12, DEPTH),
    mat(P.laminaDeep),
  );
  submucosa.position.set(0, 0.08, 0);
  group.add(submucosa, outline(submucosa, 0xa07068, 0.32));

  const layers: { name: string; h: number; color: number; cells: number }[] = [
    { name: 'basale', h: 0.06, color: P.basale, cells: 11 },
    { name: 'spinous', h: 0.08, color: P.spinous, cells: 11 },
    { name: 'superficial', h: 0.05, color: 0xf0c8b8, cells: 12 },
  ];

  let y = 0.14;
  for (const layer of layers) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, layer.h, DEPTH * 0.88), mat(layer.color));
    slab.position.set(0, y + layer.h / 2, 0);
    group.add(slab, outline(slab, 0xe0a898, 0.3));

    const pitch = W / layer.cells;
    for (let i = 0; i < layer.cells; i++) {
      const cx = -W / 2 + pitch * 0.5 + i * pitch;
      if (layer.name === 'superficial') {
        const papilla = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.028, 0.05, 6),
          mat(0xf0d0c0, { roughness: 0.35 }),
        );
        papilla.position.set(cx, y + layer.h / 2 + 0.03, DEPTH * 0.3);
        group.add(papilla);
        if (i >= 4 && i <= 7) {
          papilla.userData.baseColor = 0xf0d0c0;
          inflamedMeshes.push(papilla);
        }
      }
    }
    y += layer.h;
  }

  const surfaceY = y;
  for (let i = 0; i < 3; i++) {
    const gx = -0.7 + i * 0.7;
    const gland = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 8),
      mat(0xd8b8a8, { roughness: 0.4 }),
    );
    gland.position.set(gx, 0.1, DEPTH * 0.28);
    gland.scale.set(1.3, 0.65, 0.9);
    group.add(gland);
  }

  const saliva = mucusSheet(W * 0.92, 0.14, surfaceY + 0.05, 0.1);
  group.add(saliva);
  overlays.push(saliva);

  const thrush = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.55, 0.08),
    mat(0xf8f4f0, { transparent: true, opacity: 0.12, roughness: 0.2 }),
  );
  thrush.position.set(-0.4, surfaceY + 0.08, DEPTH * 0.46);
  thrush.userData.isThrush = true;
  group.add(thrush);
  overlays.push(thrush);

  const oralCavity = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.85, 0.42, DEPTH * 0.75),
    mat(0x281820, { transparent: true, opacity: 0.38 }),
  );
  oralCavity.position.set(0, surfaceY + 0.28, -0.01);
  group.add(oralCavity);

  const biofilm = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.88, 0.04),
    mat(0x9333ea, { transparent: true, opacity: 0 }),
  );
  biofilm.position.set(0, surfaceY + 0.06, DEPTH * 0.48);
  biofilm.userData.isBiofilm = true;
  group.add(biofilm);
  overlays.push(biofilm);

  return { group, inflamedMeshes, overlays, kind: 'oral' };
}
