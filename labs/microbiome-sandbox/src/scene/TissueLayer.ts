import * as THREE from 'three';
import type { BiomeState, MicrobeNode } from '../sim/types';
import { Epithelium3D, createLumenChamber, type EpitheliumKind } from './epithelium';
import { LUMEN_BOUNDS } from './epithelium/tissueModels';
import { bucketForType, createMicrobeMeshSet } from './microbes/MicrobeMeshes';

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
    if (kind === 'allergen') this.lumenGroup.position.y = 0.08;
  }

  update(nodes: MicrobeNode[], biome: BiomeState, dt: number) {
    this.lumenGroup.position.y = THREE.MathUtils.lerp(this.lumenGroup.position.y, 0, dt * 4);
    this.epithelium.update({
      inflammation: biome.inflammation,
      integrity: biome.integrity,
      biofilm: biome.biofilm,
      postbioticLevel: biome.postbioticLevel,
    });

    const bounds = LUMEN_BOUNDS[this.geometry];
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

      const x = n.x * 0.48;
      const normY = (n.y + 1) * 0.5;
      let y = bounds.yMin + normY * (bounds.yMax - bounds.yMin);
      const z = 0.14 + n.z * 0.08;

      if (n.type === 'allergen') {
        y = bounds.allergenBase + normY * 0.35;
      }

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
