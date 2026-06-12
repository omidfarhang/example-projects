import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, type TissueBuildResult } from './shared';

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
