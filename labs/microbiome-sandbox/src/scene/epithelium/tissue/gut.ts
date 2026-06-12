import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, mat, mucusSheet, outline, type TissueBuildResult } from './shared';


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
