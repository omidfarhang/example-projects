import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ViewMode = 'macro' | 'micro';

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private mode: ViewMode = 'macro';
  private tween = { active: false, t: 0, duration: 1.2, from: new THREE.Vector3(), to: new THREE.Vector3(), lookFrom: new THREE.Vector3(), lookTo: new THREE.Vector3() };

  private macroPos = new THREE.Vector3(0, 1.1, 3.2);
  private macroTarget = new THREE.Vector3(0, 0.9, 0);
  private microPos = new THREE.Vector3(0, 0.2, 1.8);
  private microTarget = new THREE.Vector3(0, 0, 0);

  constructor(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    this.camera.position.copy(this.macroPos);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.macroTarget);
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 6;
    this.controls.update();

    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getMode(): ViewMode {
    return this.mode;
  }

  flyToMacro() {
    this.startTween(this.camera.position.clone(), this.macroPos, this.controls.target.clone(), this.macroTarget);
    this.mode = 'macro';
  }

  flyToMicro(hotspot?: THREE.Vector3) {
    const offset = hotspot ? hotspot.clone().multiplyScalar(0.3) : new THREE.Vector3();
    const to = this.microPos.clone().add(offset);
    const look = offset;
    this.startTween(this.camera.position.clone(), to, this.controls.target.clone(), look);
    this.mode = 'micro';
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
