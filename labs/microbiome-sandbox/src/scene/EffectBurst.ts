import * as THREE from 'three';
import type { EpitheliumKind } from './epithelium/types';
import { LUMEN_BOUNDS } from './epithelium/tissueModels';

export class EffectBurst {
  private ring: THREE.Mesh;
  private life = 0;
  private color = 0xffffff;
  private kind: EpitheliumKind = 'sinus';

  constructor(parent: THREE.Group) {
    const geo = new THREE.RingGeometry(0.1, 0.15, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.ring = new THREE.Mesh(geo, mat);
    this.reposition();
    parent.add(this.ring);
  }

  setTissueKind(kind: EpitheliumKind) {
    this.kind = kind;
    this.reposition();
  }

  private reposition() {
    const b = LUMEN_BOUNDS[this.kind];
    const cx = (b.xMin + b.xMax) * 0.5;
    const cy = (b.mucusY + b.yMax) * 0.5;
    const cz = (b.zMin + b.zMax) * 0.5;
    this.ring.position.set(cx, cy, cz);
  }

  play(kind: string) {
    this.life = 1;
    const colors: Record<string, number> = {
      allergen: 0x38bdf8,
      histamine: 0xf472b6,
      dry_air: 0x94a3b8,
      alkaline: 0xc084fc,
      topical_antibiotic: 0xfbbf24,
      friction_irritant: 0xfb923c,
      stress: 0xf97316,
      enteropathogen_bloom: 0xef4444,
      antibiotic_disruption: 0xa855f7,
      probiotic: 0x4ade80,
      lrham: 0x4ade80,
      binf: 0x4ade80,
      lacid: 0x4ade80,
      lplant: 0x4ade80,
      s_epidermidis: 0x4ade80,
      prebiotic: 0xa3e635,
      scfa: 0x2dd4bf,
      saline_mist: 0x7dd3fc,
      ph_serum: 0x34d399,
      cerumen_impaction: 0xd4a040,
      swim_exposure: 0x38bdf8,
      sebum_surge: 0xf0d878,
      harsh_shampoo: 0xc084fc,
      thrush_bloom: 0xf8f4f0,
      dry_mouth: 0x94a3b8,
      sugar_exposure: 0xfbbf24,
      alkaline_flush: 0xc084fc,
      antibiotic_course: 0xa855f7,
      glycogen_spike: 0xf0abfc,
      lsaliv: 0x4ade80,
      sboul: 0xa3e635,
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
