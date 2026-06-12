import { parseUrlState, PRESETS, type PresetId } from '../data/presets';
import { getRegion, REGIONS, type RegionId } from '../data/regions';
import type { ProductId } from '../data/products';
import type { PostbioticId } from '../data/postbiotics';
import type { PrebioticId, StrainId } from '../data/strains';
import { SceneManager } from '../scene/SceneManager';
import { SimEngine } from '../sim/engine';
import { Dashboard } from '../ui/Dashboard';

export class App {
  private engine: SimEngine;
  private scene!: SceneManager;
  private dashboard!: Dashboard;
  private preset: PresetId;
  private region: RegionId;
  private context?: string;
  private lastTime = performance.now();
  private running = true;

  constructor(mount: HTMLElement) {
    const url = parseUrlState();
    this.preset = url.preset;
    this.region = url.region;
    this.context = url.context;

    this.engine = new SimEngine(this.preset, this.region);
    const presetDef = PRESETS[this.preset];
    this.engine.setPreset(this.preset, presetDef.env);

    this.dashboard = new Dashboard(
      mount,
      {
        onRegionSelect: (id) => this.selectRegion(id),
        onPresetChange: (id) => this.changePreset(id),
        onContextChange: (context) => this.changeContext(context),
        onBackToBody: () => this.backToBody(),
        onTrigger: (id) => this.handleTrigger(id),
        onInoculate: (id) => this.handleInoculate(id),
        onApplyStrain: (id) => this.handleApplyStrain(id),
        onApplyPrebiotic: (id) => this.handleApplyPrebiotic(id),
        onApplyPostbiotic: (id) => this.handleApplyPostbiotic(id),
        onApplyProduct: (id) => this.handleApplyProduct(id),
        onEnvChange: (env) => this.engine.setEnv(env),
      },
      url.context,
    );

    this.dashboard.applyContext(this.context);

    this.dashboard.setPreset(this.preset, this.region);
    this.dashboard.setRegionActions(this.region);
    this.dashboard.syncEnvSliders(this.engine.biome, this.region);

    this.scene = new SceneManager(
      this.dashboard.getCanvas(),
      REGIONS,
      (id) => this.selectRegion(id),
    );

    if (getRegion(this.region).active) {
      requestAnimationFrame(() => this.selectRegion(this.region));
    }

    this.loop();
  }

  private ensureMicroView() {
    if (this.scene.getSelectedRegion() === null) {
      const target = getRegion(this.region).active ? this.region : PRESETS[this.preset].defaultRegion;
      this.selectRegion(target);
    }
  }

  private handleTrigger(id: string) {
    this.ensureMicroView();
    this.engine.trigger(id);
    this.dashboard.flashAction('warn');
    this.scene.playBurst(id);
  }

  private handleInoculate(id: string) {
    this.ensureMicroView();
    this.engine.inoculate(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
  }

  private handleApplyStrain(id: StrainId) {
    this.ensureMicroView();
    this.engine.inoculateStrain(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
  }

  private handleApplyPrebiotic(id: PrebioticId) {
    this.ensureMicroView();
    this.engine.inoculatePrebiotic(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst('prebiotic');
  }

  private handleApplyPostbiotic(id: PostbioticId) {
    this.ensureMicroView();
    this.engine.applyPostbiotic(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
  }

  private handleApplyProduct(id: ProductId) {
    this.ensureMicroView();
    this.engine.applyProduct(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
  }

  private selectRegion(id: RegionId) {
    const region = getRegion(id);
    if (!region.active) return;
    this.region = id;
    this.engine.setRegion(id);
    this.dashboard.highlightRegion(id);
    this.dashboard.setRegionActions(id);
    this.dashboard.syncEnvSliders(this.engine.biome, this.region);
    this.syncUrlParams();
    this.scene.selectRegion(id);
    this.dashboard.setMicroView(true, region);
  }

  private backToBody() {
    this.scene.backToBody();
    this.dashboard.setMicroView(false);
  }

  private changePreset(id: PresetId) {
    this.preset = id;
    if (id !== 'allergy') this.context = undefined;
    const def = PRESETS[id];
    this.engine.setPreset(id, def.env);
    this.region = def.defaultRegion;
    this.engine.setRegion(this.region, true);
    this.engine.setEnv(def.env);
    this.dashboard.setPreset(id, this.region);
    this.dashboard.setRegionActions(this.region);
    this.dashboard.syncEnvSliders(this.engine.biome, this.region);
    this.syncUrlParams();
    this.backToBody();
    if (getRegion(this.region).active) {
      requestAnimationFrame(() => this.selectRegion(this.region));
    }
  }

  private changeContext(context?: string) {
    this.context = context;
    this.dashboard.applyContext(context);
    this.syncUrlParams();
  }

  private syncUrlParams() {
    const params = new URLSearchParams();
    params.set('preset', this.preset);
    params.set('region', this.region);
    if (this.context) params.set('context', this.context);
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', next);
  }

  private loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const snap = this.engine.step(dt);
    this.scene.render(snap);
    this.dashboard.updateHotspotLabels(this.scene.getHotspotProjections());
    this.dashboard.updateTissueCallouts(this.scene.getTissueCalloutProjections());
    this.dashboard.update(this.engine, this.scene.fps);

    requestAnimationFrame(() => this.loop());
  }
}
