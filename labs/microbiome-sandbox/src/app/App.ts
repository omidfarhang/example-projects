import type { MealId } from '../data/dayMeals';
import { parseUrlState, PRESETS, type PresetId } from '../data/presets';
import { getRegion, REGIONS, type RegionId } from '../data/regions';
import type { ProductId } from '../data/products';
import type { PostbioticId } from '../data/postbiotics';
import type { PrebioticId, StrainId } from '../data/strains';
import { SceneManager } from '../scene/SceneManager';
import { SimEngine } from '../sim/engine';
import {
  buildLabState,
  buildShareUrl,
  clearStoredLabState,
  dismissResumePrompt,
  hasLabCheckpoint,
  loadStoredLabState,
  parseLabFromUrl,
  saveLabStateToStorage,
  shouldOfferResume,
  stripLegacyLabQuery,
  syncBrowseParams,
  type LabStateV1,
} from '../state/labState';
import { Dashboard } from '../ui/Dashboard';

const AUTOSAVE_INTERVAL_MS = 12_000;

export class App {
  private engine: SimEngine;
  private scene!: SceneManager;
  private dashboard!: Dashboard;
  private preset: PresetId;
  private region: RegionId;
  private context?: string;
  private lastTime = performance.now();
  private lastAutosaveAt = 0;
  private running = true;
  private restoredFromShare = false;

  constructor(mount: HTMLElement) {
    stripLegacyLabQuery();
    const url = parseUrlState();
    const urlLab = parseLabFromUrl();
    const stored = loadStoredLabState();

    this.preset = urlLab?.preset ?? url.preset;
    this.region = urlLab?.region ?? url.region;
    this.context = urlLab?.context ?? url.context;

    this.engine = new SimEngine(this.preset, this.region);

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
        onApplyMeal: (id) => this.handleApplyMeal(id),
        onCopyLabState: () => this.copyLabStateLink(),
        onResumeSession: () => this.resumeStoredSession(),
        onDismissResume: () => this.dismissResumeBanner(),
      },
      url.context,
    );

    if (urlLab) {
      this.applyLabState(urlLab);
      this.restoredFromShare = true;
    } else {
      const presetDef = PRESETS[this.preset];
      this.engine.setPreset(this.preset, presetDef.env);
      if (stored && shouldOfferResume(stored, hasLabCheckpoint())) {
        this.dashboard.showResumePrompt(stored);
      }
    }

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
      requestAnimationFrame(() => {
        this.selectRegion(this.region, { auto: !this.restoredFromShare && this.engine.getTick() === 0 });
      });
    }

    this.loop();
  }

  private applyLabState(state: LabStateV1) {
    this.preset = state.preset;
    this.region = state.region;
    this.context = state.context;
    this.engine.preset = state.preset;
    this.engine.restoreCheckpoint(state);
    this.dashboard.setPreset(state.preset, state.region);
    this.dashboard.applyContext(state.context);
    this.dashboard.setRegionActions(state.region);
    this.dashboard.syncEnvSliders(this.engine.biome, state.region);
    syncBrowseParams(state.preset, state.region, state.context);
  }

  private resumeStoredSession() {
    const stored = loadStoredLabState();
    if (!stored) return;
    this.applyLabState(stored);
    this.dashboard.hideResumePrompt();
    if (getRegion(this.region).active) {
      this.scene.selectRegion(this.region);
      this.dashboard.setMicroView(true, getRegion(this.region));
    }
    this.persistLabState();
  }

  private dismissResumeBanner() {
    dismissResumePrompt();
    this.dashboard.hideResumePrompt();
  }

  private persistLabState() {
    saveLabStateToStorage(buildLabState(this.engine, this.preset, this.context));
    this.lastAutosaveAt = performance.now();
  }

  private maybeAutosave() {
    const now = performance.now();
    if (now - this.lastAutosaveAt < AUTOSAVE_INTERVAL_MS) return;
    if (this.engine.getTick() < 60) return;
    this.persistLabState();
  }

  private afterUserAction() {
    this.persistLabState();
  }

  private async copyLabStateLink() {
    const state = buildLabState(this.engine, this.preset, this.context);
    const url = buildShareUrl(state);
    try {
      await navigator.clipboard.writeText(url);
      this.dashboard.showShareFeedback('copied');
    } catch {
      this.dashboard.showShareFeedback('manual');
      window.prompt('Copy lab link:', url);
    }
    window.history.replaceState(null, '', url);
    saveLabStateToStorage(state);
  }

  private ensureMicroView() {
    if (this.scene.getSelectedRegion() === null) {
      const target = getRegion(this.region).active ? this.region : PRESETS[this.preset].defaultRegion;
      this.selectRegion(target, { auto: true });
    }
  }

  private handleTrigger(id: string) {
    this.ensureMicroView();
    this.engine.trigger(id);
    this.dashboard.flashAction('warn');
    this.scene.playBurst(id);
    this.afterUserAction();
  }

  private handleInoculate(id: string) {
    this.ensureMicroView();
    this.engine.inoculate(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
    this.afterUserAction();
  }

  private handleApplyStrain(id: StrainId) {
    this.ensureMicroView();
    this.engine.inoculateStrain(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
    this.afterUserAction();
  }

  private handleApplyPrebiotic(id: PrebioticId) {
    this.ensureMicroView();
    this.engine.inoculatePrebiotic(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst('prebiotic');
    this.afterUserAction();
  }

  private handleApplyPostbiotic(id: PostbioticId) {
    this.ensureMicroView();
    this.engine.applyPostbiotic(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
    this.afterUserAction();
  }

  private handleApplyProduct(id: ProductId) {
    this.ensureMicroView();
    this.engine.applyProduct(id);
    this.dashboard.flashAction('action');
    this.scene.playBurst(id);
    this.afterUserAction();
  }

  private handleApplyMeal(id: MealId) {
    this.ensureMicroView();
    this.engine.applyMeal(id);
    this.dashboard.flashAction('warn');
    this.afterUserAction();
  }

  private selectRegion(id: RegionId, options?: { auto?: boolean }) {
    const region = getRegion(id);
    if (!region.active) return;
    this.region = id;
    this.engine.setRegion(id);
    this.dashboard.highlightRegion(id);
    this.dashboard.setRegionActions(id);
    this.dashboard.syncEnvSliders(this.engine.biome, this.region);
    this.syncUrlParams();
    this.scene.selectRegion(id);
    this.dashboard.setMicroView(true, region, options);
    this.afterUserAction();
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
    clearStoredLabState();
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
    this.afterUserAction();
  }

  private syncUrlParams() {
    syncBrowseParams(this.preset, this.region, this.context);
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
    this.maybeAutosave();

    requestAnimationFrame(() => this.loop());
  }
}
