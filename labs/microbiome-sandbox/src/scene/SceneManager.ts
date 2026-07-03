import * as THREE from 'three';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import type { RegionDef, RegionId } from '../data/regions';
import { stressorBurstKind } from '../data/stressors';
import type { SimSnapshot } from '../sim/types';
import { createBodyMesh, createHotspots } from './BodyMesh';
import { CameraRig } from './CameraRig';
import type { EpitheliumKind } from './epithelium/types';
import { LUMEN_BOUNDS } from './epithelium/tissueModels';
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
  anchorX: number;
  anchorY: number;
  labelX: number;
  labelY: number;
}

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraRig: CameraRig;
  private scene = new THREE.Scene();
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bokehPass: BokehPass;
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
  private microKeyLight: THREE.PointLight;
  private microFillLight: THREE.PointLight;
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
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.useLegacyLights = false;

    this.cameraRig = new CameraRig(canvas, this.renderer);
    this.renderPass = new RenderPass(this.scene, this.cameraRig.camera);
    this.bokehPass = new BokehPass(this.scene, this.cameraRig.camera, {
      focus: 2.25,
      aperture: 0.000035,
      maxblur: 0.0025,
    });
    this.bokehPass.enabled = false;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bokehPass);

    const ambient = new THREE.HemisphereLight(0xffeee8, 0x30242a, 2.2);
    const key = new THREE.DirectionalLight(0xfff4ee, 3.4);
    key.position.set(0, 3, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 15;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    const fill = new THREE.DirectionalLight(0xdde9ff, 1.7);
    fill.position.set(0, 0, 3);
    const rim = new THREE.DirectionalLight(0xa7d8ff, 0.7);
    rim.position.set(-2, 2, -1);
    this.inflameLight = new THREE.PointLight(0xef4444, 0, 4);
    this.inflameLight.position.set(0, 0.6, 0.4);
    this.microKeyLight = new THREE.PointLight(0xffdfd2, 0, 6);
    this.microKeyLight.position.set(0.5, 1.2, 1.7);
    this.microFillLight = new THREE.PointLight(0xcfeaff, 0, 6);
    this.microFillLight.position.set(-1.3, 0.6, 1.4);
    this.scene.add(ambient, key, fill, rim, this.inflameLight, this.microKeyLight, this.microFillLight);

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
    this.composer.setSize(w, h);
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
      'lrham', 'binf', 'lacid', 'lplant', 'lcasei', 'lreuteri', 'blactis', 'blongum', 'bbifidum',
      'lbulgaricus', 'sthermo', 's_epidermidis', 'prebiotic', 'prebiotic_fos', 'scfa',
      'saline_mist', 'ph_serum', 'lsaliv', 'sboul',
      'synbiotic_supplement', 'oral_probiotic_lozenge', 'vaginal_probiotic_capsule',
      'probiotic_topical_cream', 'kefir_drink', 'probiotic_yogurt', 'kimchi',
      'sauerkraut', 'kombucha', 'miso',
      'butyrate', 'propionate', 'acetate',
      'ssaliv_k12', 'ssaliv_m18',
    ]);
    const burstKind = probioticIds.has(kind) ? 'probiotic' : stressorBurstKind(kind);
    this.tissue.playBurst(burstKind);
    this.burst.setBurstCategory(burstKind);
    this.burst.play(kind);
  }

  getTissueCalloutProjections(): TissueCalloutProjection[] {
    if (this.cameraRig.getMode() !== 'micro') return [];

    const rect = this.canvas.getBoundingClientRect();
    const anchor = new THREE.Vector3();
    const labelPt = new THREE.Vector3();
    const result: TissueCalloutProjection[] = [];

    for (const callout of getTissueCallouts(this.microGeometry)) {
      anchor.copy(callout.position);
      anchor.project(this.cameraRig.camera);
      if (anchor.z >= 1) continue;

      labelPt.copy(callout.position);
      labelPt.y += 0.14;
      labelPt.project(this.cameraRig.camera);
      if (labelPt.z >= 1) continue;

      result.push({
        label: callout.label,
        anchorX: ((anchor.x + 1) / 2) * rect.width,
        anchorY: ((-anchor.y + 1) / 2) * rect.height,
        labelX: ((labelPt.x + 1) / 2) * rect.width,
        labelY: ((-labelPt.y + 1) / 2) * rect.height,
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
      // Inflammation redness comes from uniform epithelial emissive tint — not a center point light,
      // which only lit ~1.8 units and left edges dark on ~5-unit-wide tissue cross-sections.
      this.inflameLight.intensity = 0;
      this.bokehPass.enabled = true;
      this.bokehPass.uniforms.focus.value = 2.25;
      this.bokehPass.uniforms.aperture.value = 0.000025 + snapshot.biome.inflammation * 0.00001;
      this.bokehPass.uniforms.maxblur.value = 0.0018 + snapshot.biome.immuneActivity * 0.0012;
      this.microKeyLight.intensity = 2.6;
      this.microFillLight.intensity = 1.6;
    } else {
      this.body.visible = true;
      this.hotspots.visible = true;
      this.body.rotation.y += dt * 0.15;
      this.inflameLight.intensity = 0;
      this.bokehPass.enabled = false;
      this.microKeyLight.intensity = 0;
      this.microFillLight.intensity = 0;
    }

    this.scene.fog!.density = 0.035 + snapshot.biome.inflammation * 0.01;
    this.scene.background = new THREE.Color(this.cameraRig.getMode() === 'micro' ? 0x171018 : 0x050b14);
    this.composer.render();
  }
}
