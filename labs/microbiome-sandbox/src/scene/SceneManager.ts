import * as THREE from 'three';
import type { RegionDef, RegionId } from '../data/regions';
import type { SimSnapshot } from '../sim/types';
import { createBodyMesh, createHotspots } from './BodyMesh';
import { CameraRig } from './CameraRig';
import type { EpitheliumKind } from './epithelium/types';
import { EffectBurst } from './EffectBurst';
import { getTissueCallouts } from './tissueCallouts';
import { TissueLayer } from './TissueLayer';

export interface HotspotProjection {
  id: RegionId;
  x: number;
  y: number;
  active: boolean;
  selected: boolean;
}

export interface TissueCalloutProjection {
  label: string;
  x: number;
  y: number;
}

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraRig: CameraRig;
  private scene = new THREE.Scene();
  private body: THREE.Group;
  private hotspots: THREE.Group;
  private tissue: TissueLayer;
  private burst: EffectBurst;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private selectedRegion: RegionId | null = null;
  private microGeometry: EpitheliumKind = 'sinus';
  private hoveredRegion: RegionId | null = null;
  private clock = new THREE.Clock();
  private inflameLight: THREE.PointLight;
  fps = 60;

  constructor(
    private canvas: HTMLCanvasElement,
    private regions: RegionDef[],
    onRegionSelect: (id: RegionId) => void,
  ) {
    this.scene.background = new THREE.Color(0x050b14);
    this.scene.fog = new THREE.FogExp2(0x050b14, 0.08);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.cameraRig = new CameraRig(canvas, this.renderer);

    const ambient = new THREE.AmbientLight(0x406080, 0.75);
    const key = new THREE.DirectionalLight(0x7dd3fc, 1.15);
    key.position.set(0, 3, 4);
    const fill = new THREE.DirectionalLight(0x94a3b8, 0.45);
    fill.position.set(0, 0, 3);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rim.position.set(-2, 2, -1);
    this.inflameLight = new THREE.PointLight(0xef4444, 0, 3);
    this.inflameLight.position.set(0, 0.6, 0.4);
    this.scene.add(ambient, key, fill, rim, this.inflameLight);

    this.body = createBodyMesh();
    this.hotspots = createHotspots(regions);
    this.body.add(this.hotspots);
    this.scene.add(this.body);

    this.tissue = new TissueLayer();
    this.scene.add(this.tissue.group);
    this.burst = new EffectBurst(this.tissue.group);

    const onPointer = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.cameraRig.camera);
      const hits = this.raycaster.intersectObjects(this.hotspots.children, false);

      if (e.type === 'mousemove') {
        this.hoveredRegion = null;
        for (const child of this.hotspots.children) {
          const mesh = child as THREE.Mesh;
          if (!mesh.userData.regionId) continue;
          mesh.scale.setScalar(1);
        }
        if (hits.length > 0 && this.cameraRig.getMode() === 'macro') {
          const hit = hits[0].object as THREE.Mesh;
          if (hit.userData.active) {
            this.hoveredRegion = hit.userData.regionId as RegionId;
            hit.scale.setScalar(1.4);
            canvas.style.cursor = 'pointer';
            return;
          }
        }
        canvas.style.cursor = 'default';
      }

      if (e.type === 'click' && hits.length > 0 && this.cameraRig.getMode() === 'macro') {
        const id = hits[0].object.userData.regionId as RegionId;
        const active = hits[0].object.userData.active as boolean;
        if (active) onRegionSelect(id);
      }
    };
    canvas.addEventListener('click', onPointer);
    canvas.addEventListener('mousemove', onPointer);

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.renderer.setSize(w, h, false);
    this.cameraRig.resize(w, h);
  }

  selectRegion(id: RegionId) {
    this.selectedRegion = id;
    const region = this.regions.find((r) => r.id === id);
    if (!region) return;

    for (const child of this.hotspots.children) {
      const mesh = child as THREE.Mesh;
      if (!mesh.userData.regionId) continue;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const isSelected = mesh.userData.regionId === id;
      mat.color.setHex(isSelected ? 0x38bdf8 : region.active ? 0x22d3ee : 0x475569);
      mat.opacity = isSelected ? 1 : region.active ? 0.85 : 0.35;
    }

    this.microGeometry = region.microGeometry;
    this.tissue.setGeometry(region.microGeometry);
    this.burst.setTissueKind(region.microGeometry);
    this.tissue.show();
    this.cameraRig.flyToMicro(region.microGeometry);
  }

  backToBody() {
    this.selectedRegion = null;
    this.tissue.hide();
    this.cameraRig.flyToMacro();
    for (const child of this.hotspots.children) {
      const mesh = child as THREE.Mesh;
      if (!mesh.userData.regionId) continue;
      const region = this.regions.find((r) => r.id === mesh.userData.regionId);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(region?.active ? 0x38bdf8 : 0x475569);
      mat.opacity = region?.active ? 0.95 : 0.4;
      mesh.scale.setScalar(1);
    }
  }

  getSelectedRegion(): RegionId | null {
    return this.selectedRegion;
  }

  playBurst(kind: string) {
    const probioticIds = new Set([
      'lrham', 'binf', 'lacid', 'lplant', 's_epidermidis', 'prebiotic', 'scfa',
      'saline_mist', 'ph_serum', 'lsaliv', 'sboul',
    ]);
    const burstKind =
      kind === 'allergen' || kind === 'histamine' || kind === 'friction_irritant'
        ? 'allergen'
        : kind === 'alkaline'
          ? 'alkaline'
          : kind === 'stress' || kind === 'enteropathogen_bloom' || kind === 'antibiotic_disruption'
            ? 'stress'
            : probioticIds.has(kind)
              ? 'probiotic'
              : 'default';
    this.tissue.playBurst(burstKind);
    this.burst.play(kind);
  }

  getTissueCalloutProjections(): TissueCalloutProjection[] {
    if (this.cameraRig.getMode() !== 'micro') return [];

    const rect = this.canvas.getBoundingClientRect();
    const vec = new THREE.Vector3();
    const result: TissueCalloutProjection[] = [];

    for (const callout of getTissueCallouts(this.microGeometry)) {
      vec.copy(callout.position);
      vec.project(this.cameraRig.camera);
      if (vec.z >= 1) continue;
      result.push({
        label: callout.label,
        x: ((vec.x + 1) / 2) * rect.width,
        y: ((-vec.y + 1) / 2) * rect.height,
      });
    }
    return result;
  }

  getHotspotProjections(): HotspotProjection[] {
    const rect = this.canvas.getBoundingClientRect();
    const result: HotspotProjection[] = [];
    const vec = new THREE.Vector3();

    for (const child of this.hotspots.children) {
      const mesh = child as THREE.Mesh;
      if (!mesh.userData.regionId) continue;
      const id = mesh.userData.regionId as RegionId;
      const active = mesh.userData.active as boolean;
      mesh.getWorldPosition(vec);
      vec.project(this.cameraRig.camera);
      const x = ((vec.x + 1) / 2) * rect.width;
      const y = ((-vec.y + 1) / 2) * rect.height;
      if (vec.z < 1) {
        result.push({ id, x, y, active, selected: id === this.selectedRegion });
      }
    }
    return result;
  }

  render(snapshot: SimSnapshot) {
    const dt = this.clock.getDelta();
    this.fps = Math.round(1 / Math.max(dt, 0.001));
    this.cameraRig.update(dt);
    this.burst.update(dt);

    if (this.cameraRig.getMode() === 'micro') {
      this.tissue.update(snapshot.nodes, snapshot.biome, dt);
      this.body.visible = false;
      this.hotspots.visible = false;
      this.inflameLight.intensity = snapshot.biome.inflammation * 2.5;
    } else {
      this.body.visible = true;
      this.hotspots.visible = true;
      this.body.rotation.y += dt * 0.15;
      this.inflameLight.intensity = 0;
    }

    this.scene.fog!.density = 0.06 + snapshot.biome.inflammation * 0.04;
    this.renderer.render(this.scene, this.cameraRig.getActiveCamera());
  }
}
