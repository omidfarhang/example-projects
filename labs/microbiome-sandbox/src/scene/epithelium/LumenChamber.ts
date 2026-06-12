import * as THREE from 'three';
import type { EpitheliumKind } from './types';

function diagramLine(points: THREE.Vector3[], color: number, opacity = 0.22) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

export function createLumenChamber(kind: EpitheliumKind = 'sinus'): THREE.Group {
  const group = new THREE.Group();

  if (kind === 'gut') {
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x120818, roughness: 1 }),
    );
    backdrop.position.set(0, 0.52, -0.5);
    group.add(backdrop);

    const chyme = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.72),
      new THREE.MeshBasicMaterial({ color: 0xc87858, transparent: true, opacity: 0.07 }),
    );
    chyme.position.set(0, 0.92, -0.44);
    group.add(chyme);

    for (let i = 0; i < 4; i++) {
      const ly = 0.82 + i * 0.08;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.5, ly, -0.42), new THREE.Vector3(2.5, ly, -0.42)],
          0xd89070,
          0.12,
        ),
      );
    }

    group.add(
      diagramLine(
        [new THREE.Vector3(-2.5, 0.38, -0.42), new THREE.Vector3(2.5, 0.38, -0.42)],
        0xa86860,
        0.22,
      ),
    );
  } else if (kind === 'skin') {
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x141018, roughness: 1 }),
    );
    backdrop.position.set(0, 0.38, -0.5);
    group.add(backdrop);

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 2.2),
      new THREE.MeshBasicMaterial({ color: 0xf0d8c8, transparent: true, opacity: 0.05 }),
    );
    wash.position.set(0, 0.35, -0.44);
    group.add(wash);

    for (let i = 0; i < 6; i++) {
      const y = 0.08 + i * 0.1;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.4, y, -0.42), new THREE.Vector3(2.4, y, -0.42)],
          0xd8b0a0,
          0.14,
        ),
      );
    }
  } else {
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0e2038, roughness: 1 }),
    );
    backdrop.position.set(0, 0.65, -0.52);
    group.add(backdrop);

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.8),
      new THREE.MeshBasicMaterial({ color: 0x60a8d8, transparent: true, opacity: 0.07 }),
    );
    wash.position.set(0, 0.72, -0.46);
    group.add(wash);

    group.add(
      diagramLine(
        [new THREE.Vector3(-2.4, 0.24, -0.42), new THREE.Vector3(2.4, 0.24, -0.42)],
        0xa86860,
        0.18,
      ),
    );

    const vaultPts = [
      new THREE.Vector3(-2.4, 0.88, -0.42),
      new THREE.Vector3(0, 1.28, -0.42),
      new THREE.Vector3(2.4, 0.88, -0.42),
    ];
    group.add(diagramLine(vaultPts, 0x68b8e8, 0.3));
  }

  return group;
}
