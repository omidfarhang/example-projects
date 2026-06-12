import * as THREE from 'three';
import { buildGutTissue, buildNasalTissue, buildSkinTissue } from './tissueModels';
import type { EpitheliumKind, EpitheliumState } from './types';

export class Epithelium3D {
  readonly group = new THREE.Group();
  private kind: EpitheliumKind = 'sinus';
  private overlays: THREE.Mesh[] = [];
  private inflamedMeshes: THREE.Mesh[] = [];

  setKind(kind: EpitheliumKind) {
    if (kind === this.kind && this.group.children.length > 0) return;
    this.clear();
    this.kind = kind;

    const result =
      kind === 'sinus' ? buildNasalTissue() : kind === 'skin' ? buildSkinTissue() : buildGutTissue();

    this.group.add(result.group);
    this.overlays = result.overlays;
    this.inflamedMeshes = result.inflamedMeshes;
  }

  getKind(): EpitheliumKind {
    return this.kind;
  }

  private clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      this.group.remove(child);
    }
    this.overlays = [];
    this.inflamedMeshes = [];
  }

  update(state: EpitheliumState) {
    const t = Math.min(1, Math.max(0, state.inflammation));

    for (const mesh of this.inflamedMeshes) {
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (t > 0.28) {
        m.emissive.setRGB(0.6 * t, 0.18 * t, 0.1 * t);
        m.emissiveIntensity = t * 0.7;
        m.color.lerp(new THREE.Color(0xf0a090), t * 0.35);
      } else if (mesh.userData.baseColor) {
        m.color.setHex(mesh.userData.baseColor as number);
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      } else {
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      }
    }

    for (const overlay of this.overlays) {
      if (overlay.userData.isBiofilm) {
        (overlay.material as THREE.MeshStandardMaterial).opacity = state.biofilm * 0.45;
      }
      if (overlay.userData.isMucus) {
        const m = overlay.material as THREE.MeshStandardMaterial;
        const moistureBoost = (state.moisture - 0.4) * 0.15;
        m.opacity = 0.08 + moistureBoost + state.postbioticLevel * 0.08 + t * 0.04;
      }
      if (overlay.userData.isScfa) {
        const m = overlay.material as THREE.MeshStandardMaterial;
        m.opacity = state.postbioticLevel * 0.2;
        m.emissiveIntensity = state.postbioticLevel * 0.4;
      }
      if (overlay.userData.isSheen) {
        const dryPenalty = state.moisture < 0.35 ? (0.35 - state.moisture) * 0.3 : 0;
        const phSheen = state.ph >= 5.5 && state.ph <= 7 ? 0.04 : 0;
        (overlay.material as THREE.MeshStandardMaterial).opacity =
          0.04 + state.integrity * 0.12 + phSheen - dryPenalty;
      }
    }
  }
}
