import * as THREE from 'three';
import type { LumenBounds } from './epithelium/tissueModels';

/** Pink lumen haze when immuneActivity rises — distinct from epithelial inflammation redness. */
export class ImmuneHaze {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private readonly capacity = 28;

  constructor() {
    const geo = new THREE.SphereGeometry(0.016, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, this.capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.mesh);
  }

  update(bounds: LumenBounds, immuneActivity: number, time: number) {
    const mat = this.mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.12 + immuneActivity * 0.35;
    const visible = Math.min(this.capacity, Math.ceil(immuneActivity * this.capacity * 1.1));
    this.mesh.count = visible;

    for (let i = 0; i < visible; i++) {
      const phase = i * 2.17 + time * 0.0012;
      const nx = (Math.sin(phase * 1.3) + 1) * 0.5;
      const ny = (Math.cos(phase * 0.9 + i) + 1) * 0.5;
      const nz = (Math.sin(phase * 1.7 + i * 0.4) + 1) * 0.5;
      const x = bounds.xMin + nx * (bounds.xMax - bounds.xMin);
      const y = bounds.mucusY + ny * (bounds.yMax - bounds.mucusY) * 0.85;
      const z = bounds.zMin + nz * (bounds.zMax - bounds.zMin);
      const pulse = 1 + Math.sin(time * 0.004 + i) * 0.25;
      this.dummy.position.set(x, y, z);
      this.dummy.scale.setScalar(0.6 * pulse + immuneActivity * 0.4);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
