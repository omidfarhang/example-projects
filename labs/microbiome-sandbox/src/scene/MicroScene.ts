import * as THREE from 'three';
import type { MicrobeNode } from '../sim/types';

const TYPE_COLORS: Record<string, number> = {
  probiotic: 0x4ade80,
  commensal: 0x60a5fa,
  pathogen: 0xf87171,
  allergen: 0xfbbf24,
  yeast: 0xc084fc,
  prebiotic: 0xa3e635,
  postbiotic: 0x2dd4bf,
};

export class MicroScene {
  readonly group = new THREE.Group();
  private epithelium: THREE.Mesh;
  private inflammationZone: THREE.Mesh;
  private instances: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private maxInstances = 500;
  private geometry: 'sinus' | 'skin' | 'gut' = 'sinus';

  constructor() {
    const shellGeo = this.buildEpithelium('sinus');
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x312e81,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
      roughness: 0.7,
    });
    this.epithelium = new THREE.Mesh(shellGeo, shellMat);
    this.group.add(this.epithelium);

    const inflameGeo = new THREE.SphereGeometry(0.35, 16, 12);
    const inflameMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
    });
    this.inflammationZone = new THREE.Mesh(inflameGeo, inflameMat);
    this.inflammationZone.position.set(0, 0.1, 0.2);
    this.group.add(this.inflammationZone);

    const proto = new THREE.CapsuleGeometry(0.03, 0.06, 4, 6);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: false });
    this.instances = new THREE.InstancedMesh(proto, mat, this.maxInstances);
    this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.instances);

    this.group.visible = false;
  }

  private buildEpithelium(kind: 'sinus' | 'skin' | 'gut'): THREE.BufferGeometry {
    if (kind === 'skin') {
      return new THREE.PlaneGeometry(4, 2, 24, 12);
    }
    if (kind === 'gut') {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-0.5, 0.3, 0.2),
        new THREE.Vector3(0.5, -0.2, 0.1),
        new THREE.Vector3(2, 0, 0),
      ]);
      return new THREE.TubeGeometry(curve, 32, 0.5, 12, false);
    }
    // sinus cavity — lathe
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = 0.3 + Math.sin(t * Math.PI) * 0.5;
      const y = (t - 0.5) * 2.2;
      points.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(points, 24);
  }

  setGeometry(kind: 'sinus' | 'skin' | 'gut') {
    if (kind === this.geometry) return;
    this.geometry = kind;
    this.epithelium.geometry.dispose();
    this.epithelium.geometry = this.buildEpithelium(kind);
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(nodes: MicrobeNode[], inflammation: number, ph: number) {
    const count = Math.min(nodes.length, this.maxInstances);
    this.instances.count = count;

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      this.dummy.position.set(n.x * 0.5, n.y * 0.5, n.z * 0.3);
      const scale = 0.5 + n.vitality * 0.8;
      if (n.type === 'allergen') {
        this.dummy.scale.setScalar(scale * 0.6);
      } else if (n.type === 'pathogen' || n.type === 'yeast') {
        this.dummy.scale.set(scale * 0.5, scale * 1.2, scale * 0.5);
      } else {
        this.dummy.scale.setScalar(scale);
      }
      this.dummy.updateMatrix();
      this.instances.setMatrixAt(i, this.dummy.matrix);

      const color = new THREE.Color(TYPE_COLORS[n.type] ?? 0xffffff);
      this.instances.setColorAt(i, color);
    }

    this.instances.instanceMatrix.needsUpdate = true;
    if (this.instances.instanceColor) {
      this.instances.instanceColor.needsUpdate = true;
    }

    const inflameMat = this.inflammationZone.material as THREE.MeshBasicMaterial;
    inflameMat.opacity = inflammation * 0.55;

    const shellMat = this.epithelium.material as THREE.MeshStandardMaterial;
    const phTint = ph > 7 ? new THREE.Color(0x9333ea) : new THREE.Color(0x1d4ed8);
    shellMat.emissive.lerp(phTint, 0.05);
  }
}
