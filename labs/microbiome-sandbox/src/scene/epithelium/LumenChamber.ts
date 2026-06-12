import * as THREE from 'three';
import type { EpitheliumKind } from './types';

function diagramLine(points: THREE.Vector3[], color: number, opacity = 0.22) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

/** Curved lumen shell — replaces flat backdrop with a readable cavity volume. */
function addLumenCavity(
  group: THREE.Group,
  opts: { width: number; height: number; centerY: number; backZ: number; color: number; opacity?: number },
) {
  const { width, height, centerY, backZ, color, opacity = 0.32 } = opts;
  const radius = width * 0.52;
  const arc = Math.PI * 0.78;
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.9, height, 36, 1, true, -arc / 2 + Math.PI / 2, arc),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      side: THREE.BackSide,
      transparent: true,
      opacity,
    }),
  );
  shell.rotation.z = Math.PI / 2;
  shell.position.set(0, centerY, backZ);
  group.add(shell);

  const sideMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    transparent: true,
    opacity: opacity * 0.65,
  });
  for (const sign of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(height * 0.85, 0.28), sideMat);
    wall.rotation.y = sign * (Math.PI / 2 - 0.18);
    wall.rotation.z = sign * 0.08;
    wall.position.set(sign * width * 0.48, centerY, backZ * 0.55);
    group.add(wall);
  }

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, 0.18),
    new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: opacity * 0.45 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, centerY - height / 2 + 0.04, backZ * 0.35);
  group.add(floor);
}

export function createLumenChamber(kind: EpitheliumKind = 'sinus'): THREE.Group {
  const group = new THREE.Group();

  if (kind === 'gut') {
    addLumenCavity(group, { width: 5.4, height: 1.35, centerY: 0.92, backZ: -0.22, color: 0x120818, opacity: 0.38 });

    const chyme = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.72),
      new THREE.MeshBasicMaterial({ color: 0xc87858, transparent: true, opacity: 0.1 }),
    );
    chyme.position.set(0, 0.92, -0.08);
    chyme.rotation.x = -0.08;
    group.add(chyme);

    for (let i = 0; i < 4; i++) {
      const ly = 0.82 + i * 0.08;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.5, ly, -0.12), new THREE.Vector3(2.5, ly, -0.12)],
          0xd89070,
          0.14,
        ),
      );
    }

    group.add(
      diagramLine(
        [new THREE.Vector3(-2.5, 0.38, -0.12), new THREE.Vector3(2.5, 0.38, -0.12)],
        0xa86860,
        0.24,
      ),
    );
  } else if (kind === 'ear') {
    addLumenCavity(group, { width: 4.8, height: 1.5, centerY: 0.72, backZ: -0.2, color: 0x1a1008, opacity: 0.36 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.4),
      new THREE.MeshBasicMaterial({ color: 0xd4a040, transparent: true, opacity: 0.08 }),
    );
    wash.position.set(0, 0.72, -0.06);
    group.add(wash);

    group.add(
      diagramLine(
        [new THREE.Vector3(-2.1, 0.38, -0.1), new THREE.Vector3(2.1, 0.38, -0.1)],
        0xc89858,
        0.22,
      ),
    );
    group.add(
      diagramLine(
        [new THREE.Vector3(2.05, 0.42, -0.1), new THREE.Vector3(2.05, 0.92, -0.1)],
        0xe8d8c0,
        0.3,
      ),
    );
  } else if (kind === 'scalp') {
    addLumenCavity(group, { width: 5.6, height: 1.6, centerY: 0.55, backZ: -0.2, color: 0x181008, opacity: 0.34 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 2.2),
      new THREE.MeshBasicMaterial({ color: 0xf0d878, transparent: true, opacity: 0.08 }),
    );
    wash.position.set(0, 0.55, -0.05);
    group.add(wash);

    for (let i = 0; i < 5; i++) {
      const y = 0.12 + i * 0.1;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.4, y, -0.1), new THREE.Vector3(2.4, y, -0.1)],
          0xd8b878,
          0.14,
        ),
      );
    }
  } else if (kind === 'oral') {
    addLumenCavity(group, { width: 5.2, height: 1.2, centerY: 0.62, backZ: -0.18, color: 0x1a1018, opacity: 0.35 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xd8eef8, transparent: true, opacity: 0.1 }),
    );
    wash.position.set(0, 0.58, -0.06);
    group.add(wash);
  } else if (kind === 'vaginal') {
    addLumenCavity(group, { width: 4.8, height: 1.25, centerY: 0.58, backZ: -0.18, color: 0x180818, opacity: 0.36 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 0.55),
      new THREE.MeshBasicMaterial({ color: 0xf0e0f0, transparent: true, opacity: 0.09 }),
    );
    wash.position.set(0, 0.56, -0.06);
    group.add(wash);

    for (let i = 0; i < 4; i++) {
      const y = 0.36 + i * 0.08;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.2, y, -0.1), new THREE.Vector3(2.2, y, -0.1)],
          0xd8a0c0,
          0.12,
        ),
      );
    }
  } else if (kind === 'skin') {
    addLumenCavity(group, { width: 5.6, height: 1.7, centerY: 0.48, backZ: -0.2, color: 0x141018, opacity: 0.32 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 2.2),
      new THREE.MeshBasicMaterial({ color: 0xf0d8c8, transparent: true, opacity: 0.07 }),
    );
    wash.position.set(0, 0.48, -0.05);
    group.add(wash);

    for (let i = 0; i < 6; i++) {
      const y = 0.08 + i * 0.1;
      group.add(
        diagramLine(
          [new THREE.Vector3(-2.4, y, -0.1), new THREE.Vector3(2.4, y, -0.1)],
          0xd8b0a0,
          0.16,
        ),
      );
    }
  } else {
    addLumenCavity(group, { width: 5.4, height: 1.85, centerY: 0.82, backZ: -0.24, color: 0x0e2038, opacity: 0.4 });

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.8),
      new THREE.MeshBasicMaterial({ color: 0x60a8d8, transparent: true, opacity: 0.09 }),
    );
    wash.position.set(0, 0.82, -0.08);
    group.add(wash);

    group.add(
      diagramLine(
        [new THREE.Vector3(-2.4, 0.24, -0.1), new THREE.Vector3(2.4, 0.24, -0.1)],
        0xa86860,
        0.2,
      ),
    );

    const vaultPts = [
      new THREE.Vector3(-2.4, 0.88, -0.1),
      new THREE.Vector3(0, 1.28, -0.1),
      new THREE.Vector3(2.4, 0.88, -0.1),
    ];
    group.add(diagramLine(vaultPts, 0x68b8e8, 0.32));
  }

  return group;
}
