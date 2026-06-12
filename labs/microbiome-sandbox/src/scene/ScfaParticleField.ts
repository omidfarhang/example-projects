import * as THREE from 'three';
import type { LumenBounds } from './epithelium/tissueModels';

const MAX_PARTICLES = 48;
const SCFA_COLOR = 0x2dd4bf;
const SHOW_THRESHOLD = 0.1;

interface ParticleSeed {
  nx: number;
  ny: number;
  nz: number;
  phase: number;
}

/**
 * Lumen SCFA particle field — count and brightness track postbioticLevel;
 * a brief surge pulse links rising metabolites to the epithelial SCFA glow.
 */
export class ScfaParticleField {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private color = new THREE.Color();
  private seeds: ParticleSeed[];
  private prevLevel = 0;
  private surge = 0;
  private time = 0;

  constructor() {
    const geo = new THREE.SphereGeometry(0.011, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: SCFA_COLOR,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    this.seeds = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
      nx: (i * 17.31) % 1,
      ny: (i * 23.47) % 1,
      nz: (i * 11.19) % 1,
      phase: i * 1.73,
    }));
  }

  /** Extra emissive boost passed to epithelial SCFA overlay when level rises. */
  getGlowBoost(): number {
    return this.surge;
  }

  update(bounds: LumenBounds, postbioticLevel: number, dt: number) {
    this.time += dt;
    const delta = postbioticLevel - this.prevLevel;
    if (delta > 0.0015) {
      this.surge = Math.min(1, this.surge + delta * 4);
    }
    this.prevLevel = postbioticLevel;
    this.surge = Math.max(0, this.surge - dt * 1.8);

    const visible = postbioticLevel >= SHOW_THRESHOLD;
    this.group.visible = visible;
    if (!visible) {
      this.mesh.count = 0;
      return;
    }

    const activeCount = Math.max(1, Math.round(postbioticLevel * MAX_PARTICLES));
    const mat = this.mesh.material as THREE.MeshBasicMaterial;
    const baseOpacity = THREE.MathUtils.clamp(postbioticLevel * 0.55 + this.surge * 0.35, 0.12, 0.85);
    mat.opacity = baseOpacity;

    const settle = THREE.MathUtils.smoothstep(postbioticLevel, SHOW_THRESHOLD, 0.55);
    const upperY = bounds.yMin + (bounds.yMax - bounds.yMin) * 0.72;
    const glowY = bounds.mucusY + (bounds.epithelialY - bounds.mucusY) * 0.35;
    const bandY = THREE.MathUtils.lerp(upperY, glowY, settle);

    for (let i = 0; i < activeCount; i++) {
      const seed = this.seeds[i];
      const drift = this.time * (0.35 + seed.ny * 0.25) + seed.phase;
      const xSpan = bounds.xMax - bounds.xMin;
      const zSpan = bounds.zMax - bounds.zMin;

      const x =
        bounds.xMin +
        seed.nx * xSpan +
        Math.sin(drift * 1.4) * xSpan * 0.04 +
        Math.cos(drift * 0.7 + seed.phase) * xSpan * 0.02;
      const y =
        bandY +
        Math.sin(drift * 0.9 + seed.nx * 2) * (bounds.yMax - bounds.yMin) * 0.06 -
        settle * Math.sin(drift * 0.5) * 0.015;
      const z =
        bounds.zMin +
        seed.nz * zSpan +
        Math.cos(drift * 1.1) * zSpan * 0.05;

      this.dummy.position.set(x, y, z);
      const pulse = 1 + Math.sin(drift * 2.2) * 0.12 + this.surge * 0.2;
      const scale = (0.55 + postbioticLevel * 0.45) * pulse;
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      const brightness = 0.65 + postbioticLevel * 0.35 + this.surge * 0.25;
      this.color.setRGB(0.18 * brightness, 0.83 * brightness, 0.75 * brightness);
      this.mesh.setColorAt(i, this.color);
    }

    this.mesh.count = activeCount;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  reset() {
    this.prevLevel = 0;
    this.surge = 0;
    this.time = 0;
    this.mesh.count = 0;
    this.group.visible = false;
  }
}
