import { parseUrlState, PRESETS, type PresetId } from '../data/presets';
import { getRegion, REGIONS, type RegionId } from '../data/regions';
import { SceneManager } from '../scene/SceneManager';
import { SimEngine } from '../sim/engine';
import { Dashboard } from '../ui/Dashboard';

export class App {
  private engine: SimEngine;
  private scene!: SceneManager;
  private dashboard!: Dashboard;
  private preset: PresetId;
  private region: RegionId;
  private lastTime = performance.now();
  private running = true;

  constructor(mount: HTMLElement) {
    const url = parseUrlState();
    this.preset = url.preset;
    this.region = url.region;

    this.engine = new SimEngine(this.preset);
    const presetDef = PRESETS[this.preset];
    this.engine.setPreset(this.preset, presetDef.env);

    this.dashboard = new Dashboard(
      mount,
      {
        onRegionSelect: (id) => this.selectRegion(id),
        onPresetChange: (id) => this.changePreset(id),
        onBackToBody: () => this.backToBody(),
        onTrigger: (id) => this.engine.trigger(id),
        onInoculate: (strain) => this.engine.inoculate(strain),
        onEnvChange: (ph, moisture) => this.engine.setEnv(ph, moisture),
      },
      url.context,
    );

    this.dashboard.setPreset(this.preset, this.region);

    this.scene = new SceneManager(
      this.dashboard.getCanvas(),
      REGIONS,
      (id) => this.selectRegion(id),
    );

    // Deep link: fly to region on load
    if (getRegion(this.region).active) {
      requestAnimationFrame(() => this.selectRegion(this.region));
    }

    this.loop();
  }

  private selectRegion(id: RegionId) {
    const region = getRegion(id);
    if (!region.active) return;
    this.region = id;
    this.dashboard.highlightRegion(id);
    this.scene.selectRegion(id);
    this.dashboard.setMicroView(true);
  }

  private backToBody() {
    this.scene.backToBody();
    this.dashboard.setMicroView(false);
  }

  private changePreset(id: PresetId) {
    this.preset = id;
    const def = PRESETS[id];
    this.engine.setPreset(id, def.env);
    this.region = def.defaultRegion;
    this.dashboard.setPreset(id, this.region);
    this.backToBody();
    if (getRegion(this.region).active) {
      requestAnimationFrame(() => this.selectRegion(this.region));
    }
  }

  private loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const snap = this.engine.step(dt);
    this.scene.render(snap);
    this.dashboard.update(this.engine, this.scene.fps);

    requestAnimationFrame(() => this.loop());
  }
}
