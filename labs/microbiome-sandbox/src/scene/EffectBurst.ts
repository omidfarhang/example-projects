import * as THREE from 'three';
import type { EpitheliumKind } from './epithelium/types';
import { LUMEN_BOUNDS } from './epithelium/tissueModels';
import type { StressorBurst } from '../data/stressors';

type BurstVisualCategory = StressorBurst | 'probiotic';

export class EffectBurst {
  private ring: THREE.Mesh;
  private life = 0;
  private color = 0xffffff;
  private kind: EpitheliumKind = 'sinus';
  private burstCategory: BurstVisualCategory = 'default';

  constructor(parent: THREE.Group) {
    const geo = new THREE.RingGeometry(0.08, 0.12, 32);
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

  setBurstCategory(category: BurstVisualCategory) {
    this.burstCategory = category;
    this.reposition();
  }

  private reposition() {
    const b = LUMEN_BOUNDS[this.kind];
    let x = (b.xMin + b.xMax) * 0.5;
    let y = (b.mucusY + b.yMax) * 0.5;
    let z = (b.zMin + b.zMax) * 0.5;

    if (this.burstCategory === 'allergen') {
      y = b.allergenBase + b.allergenHeight * 0.35;
      z = b.zMax * 0.85;
    } else if (this.burstCategory === 'probiotic') {
      y = (b.mucusY + b.yMax) * 0.5;
      z = b.zMin + (b.zMax - b.zMin) * 0.72;
    } else if (this.burstCategory === 'alkaline') {
      y = b.epithelialY + (b.mucusY - b.epithelialY) * 0.55;
      x = b.xMin + (b.xMax - b.xMin) * 0.72;
    } else if (this.burstCategory === 'stress') {
      y = b.epithelialY + 0.04;
      x = b.xMin + (b.xMax - b.xMin) * 0.38;
      z = b.zMin + (b.zMax - b.zMin) * 0.35;
    }

    this.ring.position.set(x, y, z);
    this.ring.rotation.set(
      this.burstCategory === 'allergen' ? -0.35 : 0,
      0,
      this.burstCategory === 'stress' ? 0.15 : 0,
    );
  }

  play(kind: string) {
    this.life = 1;
    const colors: Record<string, number> = {
      allergen: 0xfbbf24,
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
      butyrate: 0x14b8a6,
      propionate: 0x5eead4,
      acetate: 0x2dd4bf,
      scfa_mix: 0x2dd4bf,
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
      synbiotic_supplement: 0xa78bfa,
      oral_probiotic_lozenge: 0x38bdf8,
      vaginal_probiotic_capsule: 0xe879f9,
      probiotic_topical_cream: 0x34d399,
      kefir_drink: 0xfbbf24,
      probiotic_yogurt: 0xfcd34d,
      kimchi: 0xf97316,
      sauerkraut: 0xd9f99d,
      kombucha: 0xfb923c,
      miso: 0xca8a04,
    };
    this.color = colors[kind] ?? 0x38bdf8;
    const mat = this.ring.material as THREE.MeshBasicMaterial;
    mat.color.setHex(this.color);
    mat.opacity = 0.85;
    this.reposition();
  }

  update(dt: number) {
    if (this.life <= 0) {
      (this.ring.material as THREE.MeshBasicMaterial).opacity = 0;
      return;
    }
    this.life = Math.max(0, this.life - dt * 2.5);
    const mat = this.ring.material as THREE.MeshBasicMaterial;
    mat.opacity = this.life * 0.75;
    const scale = 1 + (1 - this.life) * (this.burstCategory === 'allergen' ? 5 : 3.5);
    this.ring.scale.setScalar(scale);
  }
}
