import * as THREE from 'three';
import { P } from '../tissuePalette';
import { DEPTH, histologyVeil, livingSlab, mat, mucusSheet, organic, outline, trackInflamed, type TissueBuildResult } from './shared';


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
    const slab = livingSlab(W, layer.h, DEPTH, layer.color, { roughness: layer.name === 'muscularis' ? 0.88 : 0.78 }, y + layer.h);
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
  const villusCount = 13;
  const margin = 0.32;
  const pitch = (W - margin * 2) / (villusCount - 1);
  let maxVillusTop = mucosalSurfaceY;

  for (let i = 0; i < villusCount; i++) {
    const vx = -W / 2 + margin + i * pitch + organic(i + 0.23, 0.055);
    const villusH = 0.28 + (i % 4) * 0.045 + organic(i + 2.1, 0.05);
    const villusR = 0.045 + (i % 3) * 0.004 + organic(i + 3.7, 0.006);
    const tipY = mucosalSurfaceY + villusR * 2 + villusH;
    maxVillusTop = Math.max(maxVillusTop, tipY);

    const villus = new THREE.Mesh(
      new THREE.CapsuleGeometry(villusR, villusH, 12, 16),
      mat(P.villusEpi, { roughness: 0.74 }),
    );
    villus.position.set(vx, mucosalSurfaceY + villusR + villusH * 0.5, 0.06);
    villus.rotation.z = organic(i + 8.4, 0.14);
    villus.scale.x = 0.9 + organic(i + 5.8, 0.14);
    group.add(villus);
    trackInflamed(villus, P.villusEpi, inflamedMeshes);

    const brushBorder = new THREE.Mesh(
      new THREE.TorusGeometry(villusR * 0.92, 0.006, 6, 16),
      mat(0xfff8f0, { roughness: 0.25 }),
    );
    brushBorder.rotation.x = Math.PI / 2;
    brushBorder.position.set(vx, tipY - 0.01, 0.1);
    group.add(brushBorder);

    const lacteal = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, villusH * 0.72, 6, 8),
      mat(P.lacteal, { roughness: 0.32, transparent: true, opacity: 0.86 }),
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
        new THREE.CapsuleGeometry(0.045, pitch * 0.38, 8, 10),
        mat(P.crypt, { roughness: 0.82 }),
      );
      crypt.rotation.z = Math.PI / 2;
      crypt.position.set(cx, mucosalSurfaceY - 0.028, 0.04);
      group.add(crypt);
    }
  }

  for (let i = 0; i < 30; i++) {
    const speck = new THREE.Mesh(
      new THREE.SphereGeometry(0.008 + (i % 3) * 0.002, 6, 4),
      mat(i % 4 === 0 ? P.nucleus : 0xf0c0b8, { roughness: 0.9 }),
    );
    speck.position.set(-W / 2 + 0.2 + (i * 0.173) % (W - 0.4), mucosalSurfaceY + 0.02 + organic(i + 14, 0.12), DEPTH * 0.25 + organic(i + 19, 0.05));
    speck.scale.y = 0.65;
    group.add(speck);
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

  const veil = histologyVeil('gut', W * 0.92, 0.72, mucosalSurfaceY + 0.23, DEPTH * 0.5);
  veil.userData.histologyBaseOpacity = 0.24;
  group.add(veil);
  overlays.push(veil);

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
