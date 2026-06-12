import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, trackInflamed, type TissueBuildResult } from './shared';

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
        if (layer.name === 'spinous') {
          trackInflamed(bump, P.spinous, inflamedMeshes);
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
