import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { EpitheliumKind } from './epithelium/types';

export type ViewMode = 'macro' | 'micro';

/** Per-region default orbit — slight azimuth shows depth; user can rotate freely after fly-in. */
const MICRO_FRAMES: Record<EpitheliumKind, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  gut: { pos: new THREE.Vector3(0.42, 0.58, 2.15), target: new THREE.Vector3(0.05, 0.5, 0.08) },
  skin: { pos: new THREE.Vector3(-0.28, 0.38, 2.05), target: new THREE.Vector3(0, 0.32, 0.06) },
  sinus: { pos: new THREE.Vector3(0.35, 0.72, 2.35), target: new THREE.Vector3(0, 0.55, 0.1) },
  ear: { pos: new THREE.Vector3(-0.55, 0.56, 2.25), target: new THREE.Vector3(0.15, 0.48, 0.08) },
  scalp: { pos: new THREE.Vector3(0.3, 0.42, 2.1), target: new THREE.Vector3(0, 0.36, 0.08) },
  oral: { pos: new THREE.Vector3(0.25, 0.46, 2.0), target: new THREE.Vector3(0, 0.4, 0.07) },
  vaginal: { pos: new THREE.Vector3(-0.32, 0.48, 2.15), target: new THREE.Vector3(0, 0.42, 0.08) },
};

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private mode: ViewMode = 'macro';
  private tween = { active: false, t: 0, duration: 1.2, from: new THREE.Vector3(), to: new THREE.Vector3(), lookFrom: new THREE.Vector3(), lookTo: new THREE.Vector3() };

  private macroPos = new THREE.Vector3(0, 1.1, 3.2);
  private macroTarget = new THREE.Vector3(0, 0.9, 0);

  constructor(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    this.camera.position.copy(this.macroPos);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.target.copy(this.macroTarget);
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 8;
    this.controls.update();

    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getActiveCamera(): THREE.Camera {
    return this.camera;
  }

  getMode(): ViewMode {
    return this.mode;
  }

  flyToMacro() {
    this.startTween(this.camera.position.clone(), this.macroPos, this.controls.target.clone(), this.macroTarget);
    this.mode = 'macro';
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 6;
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
  }

  flyToMicro(kind: EpitheliumKind = 'sinus') {
    const frame = MICRO_FRAMES[kind];
    this.startTween(this.camera.position.clone(), frame.pos.clone(), this.controls.target.clone(), frame.target.clone());
    this.mode = 'micro';
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 5.5;
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI - 0.12;
  }

  private startTween(fromPos: THREE.Vector3, toPos: THREE.Vector3, fromLook: THREE.Vector3, toLook: THREE.Vector3) {
    this.tween = {
      active: true,
      t: 0,
      duration: 1.2,
      from: fromPos,
      to: toPos,
      lookFrom: fromLook,
      lookTo: toLook,
    };
    this.controls.enabled = false;
  }

  update(dt: number) {
    if (!this.tween.active) {
      this.controls.update();
      return;
    }

    this.tween.t += dt / this.tween.duration;
    const ease = 1 - Math.pow(1 - Math.min(this.tween.t, 1), 3);

    this.camera.position.lerpVectors(this.tween.from, this.tween.to, ease);
    const look = new THREE.Vector3().lerpVectors(this.tween.lookFrom, this.tween.lookTo, ease);
    this.camera.lookAt(look);
    this.controls.target.copy(look);

    if (this.tween.t >= 1) {
      this.tween.active = false;
      this.controls.enabled = true;
    }
  }
}
