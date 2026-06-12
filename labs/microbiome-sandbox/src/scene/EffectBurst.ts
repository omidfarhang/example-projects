import * as THREE from 'three';

export class EffectBurst {
  private ring: THREE.Mesh;
  private life = 0;
  private color = 0xffffff;

  constructor(parent: THREE.Group) {
    const geo = new THREE.RingGeometry(0.1, 0.15, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.ring = new THREE.Mesh(geo, mat);
    this.ring.position.set(0, 0.3, 0.2);
    parent.add(this.ring);
  }

  play(kind: string) {
    this.life = 1;
    const colors: Record<string, number> = {
      allergen: 0x38bdf8,
      alkaline: 0xc084fc,
      stress: 0xf97316,
      probiotic: 0x4ade80,
      'L. acidophilus': 0x4ade80,
      prebiotic: 0xa3e635,
      postbiotic: 0x2dd4bf,
    };
    this.color = colors[kind] ?? 0x38bdf8;
    const mat = this.ring.material as THREE.MeshBasicMaterial;
    mat.color.setHex(this.color);
    mat.opacity = 0.8;
  }

  update(dt: number) {
    if (this.life <= 0) {
      (this.ring.material as THREE.MeshBasicMaterial).opacity = 0;
      return;
    }
    this.life = Math.max(0, this.life - dt * 2.5);
    const mat = this.ring.material as THREE.MeshBasicMaterial;
    mat.opacity = this.life * 0.7;
    const scale = 1 + (1 - this.life) * 4;
    this.ring.scale.setScalar(scale);
  }
}
