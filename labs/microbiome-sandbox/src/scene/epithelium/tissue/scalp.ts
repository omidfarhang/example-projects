import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, type TissueBuildResult } from './shared';

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
