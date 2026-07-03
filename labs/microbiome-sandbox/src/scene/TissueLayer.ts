import * as THREE from 'three';
import type { BiomeState, MicrobeNode } from '../sim/types';
import { Epithelium3D, createLumenChamber, type EpitheliumKind } from './epithelium';
import { LUMEN_BOUNDS, RECEPTOR_SITES, type LumenBounds } from './epithelium/tissueModels';
import { bucketForType, createMicrobeMeshSet } from './microbes/MicrobeMeshes';
import { ScfaParticleField } from './ScfaParticleField';
import { ImmuneHaze } from './ImmuneHaze';

const SIM_X = 1.8;
const SIM_Y = 0.9;
const SIM_Z = 0.8;

function normSim(v: number, half: number): number {
  return THREE.MathUtils.clamp((v + half) / (half * 2), 0, 1);
}

function snapToReceptor(x: number, receptors: number[], nodeId: number): number {
  let nearest = receptors[0];
  let best = Infinity;
  for (const rx of receptors) {
    const d = Math.abs(x - rx);
    if (d < best) {
      best = d;
      nearest = rx;
    }
  }
  const jitter = (((nodeId * 7.13) % 1) - 0.5) * 0.07;
  return nearest + jitter;
}

function placeMicrobe(n: MicrobeNode, bounds: LumenBounds, receptors: number[], time: number) {
  const nx = normSim(n.x, SIM_X);
  const ny = normSim(n.y, SIM_Y);
  const nz = normSim(n.z, SIM_Z);

  let x = bounds.xMin + nx * (bounds.xMax - bounds.xMin);
  let y = bounds.yMin + ny * (bounds.yMax - bounds.yMin);
  let z = bounds.zMin + nz * (bounds.zMax - bounds.zMin);

  if (n.type === 'commensal' || n.type === 'pathogen' || n.type === 'yeast') {
    x = snapToReceptor(x, receptors, n.id);
    y = THREE.MathUtils.lerp(bounds.epithelialY, bounds.mucusY, ny * 0.45);
    z = bounds.zMin + nz * (bounds.zMax - bounds.zMin) * 0.55 + 0.015;
  } else if (n.type === 'probiotic') {
    x = snapToReceptor(x, receptors, n.id + 17);
    y = THREE.MathUtils.lerp(bounds.mucusY, bounds.yMax, ny * 0.55 + 0.2);
    z = bounds.zMin + nz * (bounds.zMax - bounds.zMin) * 0.75 + 0.02;
  } else if (n.type === 'allergen') {
    y = bounds.allergenBase + ny * bounds.allergenHeight;
    z = bounds.zMin + nz * 0.45 * (bounds.zMax - bounds.zMin);
    y += Math.sin(time * 0.002 + n.id) * 0.015;
    x += Math.cos(time * 0.0015 + n.id * 0.7) * 0.02;
  } else if (n.type === 'prebiotic') {
    y = THREE.MathUtils.lerp(bounds.mucusY, bounds.yMax, ny);
    y += Math.sin(time * 0.0018 + n.id * 1.3) * 0.012;
    x += Math.cos(time * 0.0012 + n.id) * 0.018;
  }

  return { x, y, z };
}

function surfaceAdhesionPosition(n: MicrobeNode, bounds: LumenBounds, receptors: number[], time: number) {
  const receptor = receptors[Math.abs((n.id * 7) % receptors.length)];
  const phase = time * 0.00012 + n.id * 1.37;
  const slowCrawl = Math.sin(phase) * 0.045 + Math.sin(phase * 0.37) * 0.025;
  const jitter = (((n.id * 7.13) % 1) - 0.5) * 0.06;
  const yBand = n.type === 'probiotic' ? 0.54 : n.type === 'pathogen' ? 0.24 : 0.18;
  const yWobble = Math.sin(time * 0.00035 + n.id) * 0.008;
  const zWobble = Math.cos(time * 0.00028 + n.id * 0.8) * 0.012;
  return {
    x: receptor + jitter + slowCrawl,
    y: THREE.MathUtils.lerp(bounds.epithelialY, bounds.mucusY, yBand + (n.vitality - 0.5) * 0.08) + yWobble,
    z: bounds.zMin + (((n.id * 0.271) % 1) * (bounds.zMax - bounds.zMin) * 0.55) + 0.025 + zWobble,
  };
}

export class TissueLayer {
  readonly group = new THREE.Group();
  private epithelium = new Epithelium3D();
  private chamber = createLumenChamber('sinus');
  private lumenGroup = new THREE.Group();
  private meshes = createMicrobeMeshSet(120);
  private dummy = new THREE.Object3D();
  private geometry: EpitheliumKind = 'sinus';
  private burstKind: 'allergen' | 'probiotic' | 'alkaline' | 'stress' | 'default' | null = null;
  private burstTime = 0;
  private scfaParticles = new ScfaParticleField();
  private immuneHaze = new ImmuneHaze();
  private visualPositions = new Map<number, THREE.Vector3>();

  constructor() {
    this.epithelium.setKind('sinus');
    this.group.add(this.chamber);
    this.group.add(this.epithelium.group);
    for (const mesh of Object.values(this.meshes)) {
      this.lumenGroup.add(mesh);
    }
    this.group.add(this.lumenGroup);
    this.group.add(this.scfaParticles.group);
    this.group.add(this.immuneHaze.group);
    this.configureMeshLighting();
    this.group.visible = false;
  }

  private configureMeshLighting() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.userData.noShadow) {
          obj.castShadow = false;
          obj.receiveShadow = false;
          return;
        }
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  setGeometry(kind: EpitheliumKind) {
    if (kind === this.geometry) return;
    this.geometry = kind;
    this.scfaParticles.reset();
    this.epithelium.setKind(kind);
    this.group.remove(this.chamber);
    this.chamber.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    this.chamber = createLumenChamber(kind);
    this.group.add(this.chamber);
    this.group.children.unshift(this.group.children.pop()!);
    this.configureMeshLighting();
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  playBurst(kind: 'allergen' | 'probiotic' | 'alkaline' | 'stress' | 'default') {
    this.burstKind = kind;
    this.burstTime = 1;
    const b = LUMEN_BOUNDS[this.geometry];
    if (kind === 'allergen') {
      this.lumenGroup.position.y = (b.allergenBase - b.mucusY) * 0.35;
    } else if (kind === 'probiotic') {
      this.lumenGroup.position.y = -(b.mucusY - b.epithelialY) * 0.2;
    } else if (kind === 'alkaline') {
      this.lumenGroup.position.y = -(b.mucusY - b.epithelialY) * 0.15;
    }
  }

  update(nodes: MicrobeNode[], biome: BiomeState, dt: number) {
    if (this.burstTime > 0) {
      this.burstTime = Math.max(0, this.burstTime - dt * 2.2);
      const t = this.burstTime;
      if (this.burstKind === 'stress') {
        this.group.position.x = Math.sin(t * 18) * 0.025 * t;
      } else if (this.burstKind === 'default') {
        const pulse = 1 + (1 - t) * 0.08;
        this.lumenGroup.scale.setScalar(pulse);
      }
      if (this.burstTime <= 0) {
        this.burstKind = null;
        this.lumenGroup.scale.setScalar(1);
      }
    }

    this.lumenGroup.position.y = THREE.MathUtils.lerp(this.lumenGroup.position.y, 0, dt * 4);
    this.lumenGroup.position.x = THREE.MathUtils.lerp(this.lumenGroup.position.x, 0, dt * 6);
    this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, 0, dt * 6);

    const bounds = LUMEN_BOUNDS[this.geometry];
    const time = performance.now();
    this.scfaParticles.update(bounds, biome.postbioticLevel, dt);
    this.immuneHaze.update(bounds, biome.immuneActivity ?? 0, time);

    this.epithelium.update({
      inflammation: biome.inflammation,
      integrity: biome.integrity,
      biofilm: biome.biofilm,
      postbioticLevel: biome.postbioticLevel,
      scfaGlowBoost: this.scfaParticles.getGlowBoost(),
      immuneActivity: biome.immuneActivity,
      ph: biome.ph,
      moisture: biome.moisture,
      sebum: biome.sebum,
      cerumen: biome.cerumen,
      sweatRate: biome.sweatRate,
    });

    const receptors = RECEPTOR_SITES[this.geometry];
    const liveIds = new Set<number>();
    const buckets: Record<string, number> = {
      probiotic: 0,
      commensal: 0,
      pathogen: 0,
      yeast: 0,
      allergen: 0,
      prebiotic: 0,
      other: 0,
    };

    for (const n of nodes) {
      const bucket = bucketForType(n.type);
      const idx = buckets[bucket]++;
      const mesh = this.meshes[bucket];
      if (idx >= mesh.instanceMatrix.count) continue;
      liveIds.add(n.id);

      const target = (n.type === 'commensal' || n.type === 'pathogen' || n.type === 'yeast' || n.type === 'probiotic')
        ? surfaceAdhesionPosition(n, bounds, receptors, time)
        : placeMicrobe(n, bounds, receptors, time);
      let visual = this.visualPositions.get(n.id);
      if (!visual) {
        visual = new THREE.Vector3(target.x, target.y, target.z);
        this.visualPositions.set(n.id, visual);
      } else {
        visual.lerp(new THREE.Vector3(target.x, target.y, target.z), THREE.MathUtils.clamp(dt * 3.2, 0, 1));
      }
      this.dummy.position.copy(visual);
      const vitality = n.vitality;
      const pulse = n.type === 'allergen' ? 1 + Math.sin(performance.now() * 0.004 + n.id) * 0.08 : 1;
      const microFlex = n.type === 'probiotic' || n.type === 'commensal'
        ? 1 + Math.sin(time * 0.001 + n.id * 0.9) * 0.035
        : 1;
      const scale = (0.62 + vitality * 0.62) * pulse * microFlex;
      this.dummy.rotation.set(0, 0, 0);

      if (bucket === 'pathogen') {
        this.dummy.scale.setScalar(scale);
      } else if (bucket === 'yeast') {
        this.dummy.scale.set(scale * 1.08, scale * 0.88, scale * 1.02);
      } else if (bucket === 'allergen') {
        this.dummy.scale.setScalar(scale * 0.72);
      } else if (bucket === 'prebiotic') {
        this.dummy.scale.set(0.4, scale * 1.2, 0.4);
        this.dummy.rotation.z = n.id * 0.4;
      } else if (bucket === 'commensal') {
        this.dummy.scale.set(scale * 0.45, scale * 0.75, scale * 0.45);
        this.dummy.rotation.z = Math.PI / 2 + Math.sin(time * 0.00042 + n.id) * 0.22;
      } else if (bucket === 'probiotic') {
        this.dummy.scale.set(scale * 0.5, scale * 0.85, scale * 0.5);
        this.dummy.rotation.z = Math.PI / 2 + Math.sin(time * 0.00038 + n.id * 1.4) * 0.2;
      } else {
        this.dummy.scale.setScalar(scale * 0.8);
      }

      this.dummy.updateMatrix();
      mesh.setMatrixAt(idx, this.dummy.matrix);
    }

    for (const [key, mesh] of Object.entries(this.meshes)) {
      mesh.count = buckets[key] ?? 0;
      mesh.instanceMatrix.needsUpdate = true;
    }

    for (const id of this.visualPositions.keys()) {
      if (!liveIds.has(id)) this.visualPositions.delete(id);
    }
  }
}
