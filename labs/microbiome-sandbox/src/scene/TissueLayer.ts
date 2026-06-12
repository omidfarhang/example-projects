import * as THREE from 'three';
import type { BiomeState, MicrobeNode } from '../sim/types';
import { Epithelium3D, createLumenChamber, type EpitheliumKind } from './epithelium';
import { LUMEN_BOUNDS, RECEPTOR_SITES, type LumenBounds } from './epithelium/tissueModels';
import { bucketForType, createMicrobeMeshSet } from './microbes/MicrobeMeshes';

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

export class TissueLayer {
  readonly group = new THREE.Group();
  private epithelium = new Epithelium3D();
  private chamber = createLumenChamber('sinus');
  private lumenGroup = new THREE.Group();
  private meshes = createMicrobeMeshSet(120);
  private dummy = new THREE.Object3D();
  private geometry: EpitheliumKind = 'sinus';

  constructor() {
    this.epithelium.setKind('sinus');
    this.group.add(this.chamber);
    this.group.add(this.epithelium.group);
    for (const mesh of Object.values(this.meshes)) {
      this.lumenGroup.add(mesh);
    }
    this.group.add(this.lumenGroup);
    this.group.visible = false;
  }

  setGeometry(kind: EpitheliumKind) {
    if (kind === this.geometry) return;
    this.geometry = kind;
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
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  playBurst(kind: 'allergen' | 'probiotic' | 'alkaline' | 'stress' | 'default') {
    if (kind === 'allergen') {
      const b = LUMEN_BOUNDS[this.geometry];
      this.lumenGroup.position.y = (b.allergenBase - b.mucusY) * 0.35;
    }
  }

  update(nodes: MicrobeNode[], biome: BiomeState, dt: number) {
    this.lumenGroup.position.y = THREE.MathUtils.lerp(this.lumenGroup.position.y, 0, dt * 4);
    this.epithelium.update({
      inflammation: biome.inflammation,
      integrity: biome.integrity,
      biofilm: biome.biofilm,
      postbioticLevel: biome.postbioticLevel,
      ph: biome.ph,
      moisture: biome.moisture,
      sebum: biome.sebum,
      cerumen: biome.cerumen,
      sweatRate: biome.sweatRate,
    });

    const bounds = LUMEN_BOUNDS[this.geometry];
    const receptors = RECEPTOR_SITES[this.geometry];
    const time = performance.now();
    const buckets: Record<string, number> = {
      probiotic: 0,
      commensal: 0,
      pathogen: 0,
      allergen: 0,
      prebiotic: 0,
      other: 0,
    };

    for (const n of nodes) {
      const bucket = bucketForType(n.type);
      const idx = buckets[bucket]++;
      const mesh = this.meshes[bucket];
      if (idx >= mesh.instanceMatrix.count) continue;

      const { x, y, z } = placeMicrobe(n, bounds, receptors, time);
      this.dummy.position.set(x, y, z);
      const vitality = n.vitality;
      const pulse = n.type === 'allergen' ? 1 + Math.sin(performance.now() * 0.008 + n.id) * 0.2 : 1;
      const scale = (0.5 + vitality * 0.75) * pulse;
      this.dummy.rotation.set(0, 0, 0);

      if (bucket === 'pathogen') {
        this.dummy.scale.setScalar(scale);
      } else if (bucket === 'allergen') {
        this.dummy.scale.setScalar(scale * 0.65);
      } else if (bucket === 'prebiotic') {
        this.dummy.scale.set(0.4, scale * 1.2, 0.4);
        this.dummy.rotation.z = n.id * 0.4;
      } else if (bucket === 'probiotic') {
        this.dummy.scale.set(scale * 0.5, scale * 0.85, scale * 0.5);
        this.dummy.rotation.z = Math.PI / 2;
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
  }
}
