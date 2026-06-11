import * as THREE from 'three';
import type { RegionDef, RegionId } from '../data/regions';
import type { SimSnapshot } from '../sim/types';
import { createBodyMesh, createHotspots } from './BodyMesh';
import { CameraRig } from './CameraRig';
import { MicroScene } from './MicroScene';

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraRig: CameraRig;
  private scene = new THREE.Scene();
  private body: THREE.Group;
  private hotspots: THREE.Group;
  private micro: MicroScene;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private selectedRegion: RegionId | null = null;
  private clock = new THREE.Clock();
  fps = 60;

  constructor(
    private canvas: HTMLCanvasElement,
    private regions: RegionDef[],
    onRegionSelect: (id: RegionId) => void,
  ) {
    this.scene.background = new THREE.Color(0x050b14);
    this.scene.fog = new THREE.FogExp2(0x050b14, 0.12);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.cameraRig = new CameraRig(canvas, this.renderer);

    const ambient = new THREE.AmbientLight(0x406080, 0.6);
    const key = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    key.position.set(2, 4, 3);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rim.position.set(-3, 2, -2);
    this.scene.add(ambient, key, rim);

    this.body = createBodyMesh();
    this.scene.add(this.body);

    this.hotspots = createHotspots(regions);
    this.scene.add(this.hotspots);

    this.micro = new MicroScene();
    this.scene.add(this.micro.group);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.cameraRig.camera);
      const hits = this.raycaster.intersectObjects(this.hotspots.children, false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.regionId as RegionId;
        const active = hits[0].object.userData.active as boolean;
        if (active) {
          onRegionSelect(id);
        }
      }
    };
    canvas.addEventListener('click', onClick);

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
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const isSelected = mesh.userData.regionId === id;
      mat.color.setHex(isSelected ? 0x38bdf8 : region.active ? 0x22d3ee : 0x475569);
      mat.opacity = isSelected ? 1 : region.active ? 0.85 : 0.35;
    }

    this.micro.setGeometry(region.microGeometry);
    this.micro.show();
    const hotspot = new THREE.Vector3(...region.hotspot);
    this.cameraRig.flyToMicro(hotspot);
  }

  backToBody() {
    this.selectedRegion = null;
    this.micro.hide();
    this.cameraRig.flyToMacro();
    for (const child of this.hotspots.children) {
      const mesh = child as THREE.Mesh;
      const region = this.regions.find((r) => r.id === mesh.userData.regionId);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(region?.active ? 0x38bdf8 : 0x475569);
      mat.opacity = region?.active ? 0.95 : 0.4;
    }
  }

  getSelectedRegion(): RegionId | null {
    return this.selectedRegion;
  }

  render(snapshot: SimSnapshot) {
    const dt = this.clock.getDelta();
    this.fps = Math.round(1 / Math.max(dt, 0.001));
    this.cameraRig.update(dt);

    if (this.cameraRig.getMode() === 'micro') {
      this.micro.update(snapshot.nodes, snapshot.biome.inflammation, snapshot.biome.ph);
      this.body.visible = false;
      this.hotspots.visible = false;
    } else {
      this.body.visible = true;
      this.hotspots.visible = true;
      this.body.rotation.y += dt * 0.15;
    }

    this.scene.fog!.density = 0.08 + snapshot.biome.inflammation * 0.06;
    this.renderer.render(this.scene, this.cameraRig.camera);
  }
}
