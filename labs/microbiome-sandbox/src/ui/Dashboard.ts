import { ARTICLES } from '../data/articles';
import {
  ENV_VAR_DEFS,
  REGION_ENV_CONTROLS,
  type EnvVarId,
} from '../data/envVars';
import { PRESETS, type PresetId } from '../data/presets';
import type { ProductId } from '../data/products';
import { PRODUCT_LIST } from '../data/products';
import { getRegion, REGIONS, type RegionDef, type RegionId } from '../data/regions';
import { PREBIOTICS, STRAIN_LIST, type PrebioticId, type StrainId } from '../data/strains';
import type { HotspotProjection, TissueCalloutProjection } from '../scene/SceneManager';
import { TISSUE_PICTOGRAMS } from '../scene/tissueCallouts';
import { POPULATION_SCALE, type SimEngine } from '../sim/engine';
import type { BiomeState } from '../sim/types';

function trendLabel(n: number): string {
  if (n > 0) return '↑ Increasing';
  if (n < 0) return '↓ Decreasing';
  return '→ Stable';
}

function formatPopulation(count: number): string {
  const scaled = count * POPULATION_SCALE;
  if (scaled >= 1000) return `${Math.round(scaled / 1000)}k`;
  return String(scaled);
}

export interface DashboardCallbacks {
  onRegionSelect: (id: RegionId) => void;
  onPresetChange: (id: PresetId) => void;
  onBackToBody: () => void;
  onTrigger: (id: string) => void;
  onInoculate: (id: string) => void;
  onApplyStrain: (id: StrainId) => void;
  onApplyPrebiotic: (id: PrebioticId) => void;
  onApplyProduct: (id: ProductId) => void;
  onEnvChange: (env: Partial<Record<EnvVarId, number>>) => void;
}

export class Dashboard {
  readonly root: HTMLElement;
  private regionList!: HTMLElement;
  private presetTitle!: HTMLElement;
  private scenarioText!: HTMLElement;
  private blogCta!: HTMLAnchorElement;
  private probioticStat!: HTMLElement;
  private pathogenStat!: HTMLElement;
  private allergenStat!: HTMLElement;
  private commensalStat!: HTMLElement;
  private biofilmStat!: HTMLElement;
  private postbioticStat!: HTMLElement;
  private integrityMeter!: HTMLElement;
  private inflammationMeter!: HTMLElement;
  private envPanel!: HTMLElement;
  private envSliders = new Map<EnvVarId, HTMLInputElement>();
  private envReadouts = new Map<EnvVarId, HTMLElement>();
  private inoculationRow!: HTMLElement;
  private triggerRow!: HTMLElement;
  private strainRow!: HTMLElement;
  private prebioticRow!: HTMLElement;
  private productRow!: HTMLElement;
  private engineBadge!: HTMLElement;
  private fpsBadge!: HTMLElement;
  private callout!: HTMLElement;
  private backBtn!: HTMLButtonElement;
  private presetSelect!: HTMLSelectElement;
  private viewport!: HTMLElement;
  private zoomTitle!: HTMLElement;
  private modeBadge!: HTMLElement;
  private scaleLabel!: HTMLElement;
  private hint!: HTMLElement;
  private legendBox!: HTMLElement;
  private eventLog!: HTMLElement;
  private hotspotLayer!: HTMLElement;
  private tissueCalloutLayer!: HTMLElement;
  private tissuePictogram!: HTMLElement;
  private commensalRow!: HTMLElement;
  private biofilmRow!: HTMLElement;
  private postbioticRow!: HTMLElement;
  private envDragging = false;

  private currentPreset: PresetId = 'allergy';
  private currentRegion: RegionId = 'nose';
  private microActive = false;
  private hintDismissed = false;
  private staticScenario = '';

  constructor(
    mount: HTMLElement,
    private callbacks: DashboardCallbacks,
    private context?: string,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'bd-dashboard';
    this.root.innerHTML = this.template();
    mount.appendChild(this.root);
    this.bind();
  }

  private template(): string {
    return `
      <header class="bd-header">
        <h1>BIO-DYNAMICS: FULL-BODY MICROBIOME SANDBOX</h1>
      </header>
      <div class="bd-grid">
        <aside class="bd-panel bd-regions">
          <h2>BODY-MAP REGION SELECTOR</h2>
          <ul class="bd-region-list" data-region-list></ul>
          <button type="button" class="bd-btn bd-btn--ghost bd-back" data-back hidden>← Back to body</button>
        </aside>
        <section class="bd-viewport-wrap">
          <div class="bd-viewport" data-viewport>
            <canvas data-canvas></canvas>
            <div class="bd-hotspot-layer" data-hotspot-layer></div>
            <div class="bd-tissue-callout-layer" data-tissue-callouts hidden></div>
            <div class="bd-zoom-hud" data-zoom-hud>
              <span class="bd-mode-badge" data-mode-badge>BODY MAP</span>
              <div class="bd-tissue-pictogram" data-tissue-pictogram hidden></div>
              <h2 class="bd-zoom-title" data-zoom-title>ZOOM LAYER</h2>
              <span class="bd-scale-label" data-scale-label></span>
            </div>
            <p class="bd-hint" data-hint>Select a tissue region on the body map, then run a scenario trigger.</p>
            <div class="bd-legend-box" data-legend-box hidden></div>
            <div class="bd-callout" data-callout hidden>INFLAMMATION SPIKE</div>
          </div>
        </section>
        <aside class="bd-panel bd-blog">
          <label class="bd-label">PRESET</label>
          <select class="bd-select" data-preset>
            <option value="allergy">Allergy & Barrier Defense</option>
            <option value="candida">Candida & pH Balance</option>
            <option value="lifecycle">Biotic Lifecycle Sandbox</option>
          </select>
          <h2 data-preset-title>Preset</h2>
          <p class="bd-scenario" data-scenario></p>
          <a class="bd-cta" data-blog-cta href="#" target="_blank" rel="noopener">Read full breakdown →</a>
          <div class="bd-stats">
            <h3>REAL-TIME STATS</h3>
            <div class="bd-meter">
              <label>Barrier integrity <span data-integrity-val>85%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--integrity" data-integrity-meter></div></div>
            </div>
            <div class="bd-meter">
              <label>Inflammation <span data-inflammation-val>10%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--inflammation" data-inflammation-meter></div></div>
            </div>
            <div class="bd-stat"><span>Probiotic strains</span><strong data-probiotic>0 →</strong></div>
            <div class="bd-stat"><span>Pathogen strains</span><strong data-pathogen>0 →</strong></div>
            <div class="bd-stat"><span>Allergen particles</span><strong data-allergen>0 →</strong></div>
            <div class="bd-stat" data-commensal-row hidden><span>Commensal count</span><strong data-commensal>0 →</strong></div>
            <div class="bd-stat" data-biofilm-row hidden><span>Biofilm level</span><strong data-biofilm>0%</strong></div>
            <div class="bd-stat" data-postbiotic-row hidden><span>Postbiotic SCFA</span><strong data-postbiotic>0%</strong></div>
          </div>
          <div class="bd-event-log">
            <h3>EVENT LOG</h3>
            <ul data-event-log></ul>
          </div>
        </aside>
      </div>
      <div class="bd-controls">
        <div class="bd-panel bd-env">
          <h2>ENVIRONMENTAL VARIABLES</h2>
          <p class="bd-env-hint" data-env-hint>Region-specific tissue conditions</p>
          <div class="bd-env-grid" data-env-panel></div>
        </div>
        <div class="bd-panel bd-inoc">
          <h2>STRESSORS &amp; REGION ACTIONS</h2>
          <p class="bd-section-hint">Region-specific triggers and quick inoculations</p>
          <div class="bd-btn-row" data-triggers></div>
          <div class="bd-btn-row" data-inoculations></div>
        </div>
        <div class="bd-panel bd-strains">
          <h2>INDIVIDUAL STRAINS</h2>
          <p class="bd-section-hint">Apply a single probiotic strain to the selected tissue</p>
          <div class="bd-btn-row bd-btn-row--dense" data-strains></div>
          <h3 class="bd-subheading">Prebiotics</h3>
          <div class="bd-btn-row" data-prebiotics></div>
        </div>
        <div class="bd-panel bd-products">
          <h2>PRODUCTS &amp; FERMENTED FOODS</h2>
          <p class="bd-section-hint">Whole supplements and foods deliver multiple strains at once</p>
          <div class="bd-btn-row bd-btn-row--products" data-products></div>
        </div>
      </div>
      <footer class="bd-footer">
        <span class="bd-badge" data-engine>ENGINE: DETERMINISTIC · 60 FPS</span>
        <span class="bd-badge" data-fps>— FPS</span>
        <a href="https://omid.dev/posts/" target="_blank" rel="noopener">Tech Blog</a>
        <a href="https://github.com/omidfarhang/example-projects/tree/master/labs/microbiome-sandbox" target="_blank" rel="noopener">Source Code</a>
        <span class="bd-disclaimer">Educational model — not medical advice</span>
      </footer>
    `;
  }

  private bind() {
    this.regionList = this.root.querySelector('[data-region-list]')!;
    this.presetTitle = this.root.querySelector('[data-preset-title]')!;
    this.scenarioText = this.root.querySelector('[data-scenario]')!;
    this.blogCta = this.root.querySelector('[data-blog-cta]')!;
    this.probioticStat = this.root.querySelector('[data-probiotic]')!;
    this.pathogenStat = this.root.querySelector('[data-pathogen]')!;
    this.allergenStat = this.root.querySelector('[data-allergen]')!;
    this.commensalStat = this.root.querySelector('[data-commensal]')!;
    this.biofilmStat = this.root.querySelector('[data-biofilm]')!;
    this.postbioticStat = this.root.querySelector('[data-postbiotic]')!;
    this.integrityMeter = this.root.querySelector('[data-integrity-meter]')!;
    this.inflammationMeter = this.root.querySelector('[data-inflammation-meter]')!;
    this.envPanel = this.root.querySelector('[data-env-panel]')!;
    this.inoculationRow = this.root.querySelector('[data-inoculations]')!;
    this.triggerRow = this.root.querySelector('[data-triggers]')!;
    this.strainRow = this.root.querySelector('[data-strains]')!;
    this.prebioticRow = this.root.querySelector('[data-prebiotics]')!;
    this.productRow = this.root.querySelector('[data-products]')!;
    this.engineBadge = this.root.querySelector('[data-engine]')!;
    this.fpsBadge = this.root.querySelector('[data-fps]')!;
    this.callout = this.root.querySelector('[data-callout]')!;
    this.backBtn = this.root.querySelector('[data-back]')!;
    this.presetSelect = this.root.querySelector('[data-preset]')!;
    this.viewport = this.root.querySelector('[data-viewport]')!;
    this.zoomTitle = this.root.querySelector('[data-zoom-title]')!;
    this.modeBadge = this.root.querySelector('[data-mode-badge]')!;
    this.scaleLabel = this.root.querySelector('[data-scale-label]')!;
    this.hint = this.root.querySelector('[data-hint]')!;
    this.legendBox = this.root.querySelector('[data-legend-box]')!;
    this.eventLog = this.root.querySelector('[data-event-log]')!;
    this.hotspotLayer = this.root.querySelector('[data-hotspot-layer]')!;
    this.tissueCalloutLayer = this.root.querySelector('[data-tissue-callouts]')!;
    this.tissuePictogram = this.root.querySelector('[data-tissue-pictogram]')!;
    this.commensalRow = this.root.querySelector('[data-commensal-row]')!;
    this.biofilmRow = this.root.querySelector('[data-biofilm-row]')!;
    this.postbioticRow = this.root.querySelector('[data-postbiotic-row]')!;

    this.renderRegions();
    this.backBtn.addEventListener('click', () => this.callbacks.onBackToBody());
    this.presetSelect.addEventListener('change', () => {
      this.callbacks.onPresetChange(this.presetSelect.value as PresetId);
    });
    this.renderEnvControls(this.currentRegion);
    this.renderStrainAndProductPanels();
    this.setMicroView(false);
  }

  private renderStrainAndProductPanels() {
    this.strainRow.innerHTML = STRAIN_LIST.map(
      (s) =>
        `<button type="button" class="bd-btn bd-btn--strain" data-strain="${s.id}" title="${s.commonRegions ? 'Common: ' + s.commonRegions.join(', ') : ''}">${s.name}</button>`,
    ).join('');

    this.prebioticRow.innerHTML = Object.values(PREBIOTICS)
      .map(
        (p) =>
          `<button type="button" class="bd-btn bd-btn--action bd-btn--compact" data-prebiotic="${p.id}">+ ${p.name.toUpperCase()}</button>`,
      )
      .join('');

    this.productRow.innerHTML = PRODUCT_LIST.map(
      (p) =>
        `<button type="button" class="bd-btn bd-btn--product bd-btn--${p.category}" data-product="${p.id}" title="${p.description}">${p.label}<span class="bd-product-form">${p.form} · ${p.category}</span></button>`,
    ).join('');

    this.strainRow.querySelectorAll('[data-strain]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        this.flashButton(el);
        this.callbacks.onApplyStrain(el.dataset.strain as StrainId);
      });
    });

    this.prebioticRow.querySelectorAll('[data-prebiotic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        this.flashButton(el);
        this.callbacks.onApplyPrebiotic(el.dataset.prebiotic as PrebioticId);
      });
    });

    this.productRow.querySelectorAll('[data-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        this.flashButton(el);
        this.callbacks.onApplyProduct(el.dataset.product as ProductId);
      });
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.root.querySelector('[data-canvas]')!;
  }

  private emitEnv() {
    const env: Partial<Record<EnvVarId, number>> = {};
    for (const [id, slider] of this.envSliders) {
      env[id] = parseFloat(slider.value);
      const readout = this.envReadouts.get(id);
      if (readout) readout.textContent = ENV_VAR_DEFS[id].format(env[id]!);
    }
    this.callbacks.onEnvChange(env);
  }

  private renderEnvControls(regionId: RegionId) {
    const controls = REGION_ENV_CONTROLS[regionId];
    const region = getRegion(regionId);
    this.envSliders.clear();
    this.envReadouts.clear();
    this.envPanel.innerHTML = controls
      .map((id) => {
        const def = ENV_VAR_DEFS[id];
        const value = region.env[id];
        return `
        <div class="bd-slider-row">
          <label>${def.label} <output data-env-readout="${id}">${def.format(value)}</output></label>
          <input type="range" min="${def.min}" max="${def.max}" step="${def.step}"
            value="${value}" data-env="${id}" />
        </div>`;
      })
      .join('');

    const hint = this.root.querySelector('[data-env-hint]') as HTMLElement;
    hint.textContent = `${region.label} — adjust local tissue conditions`;

    for (const id of controls) {
      const slider = this.envPanel.querySelector(`[data-env="${id}"]`) as HTMLInputElement;
      const readout = this.envPanel.querySelector(`[data-env-readout="${id}"]`) as HTMLElement;
      this.envSliders.set(id, slider);
      this.envReadouts.set(id, readout);
      slider.addEventListener('input', () => {
        this.envDragging = true;
        this.emitEnv();
      });
      slider.addEventListener('change', () => {
        this.envDragging = false;
      });
    }
  }

  private renderRegions() {
    this.regionList.innerHTML = REGIONS.map(
      (r) => `
      <li>
        <button type="button" class="bd-region ${r.active ? '' : 'bd-region--soon'}"
          data-region="${r.id}" ${r.active ? '' : 'disabled'}>
          ${r.label}${r.active ? '' : ' <em>(inactive)</em>'}
        </button>
      </li>`,
    ).join('');

    this.regionList.querySelectorAll('[data-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.region as RegionId;
        this.callbacks.onRegionSelect(id);
      });
    });
  }

  setPreset(presetId: PresetId, regionId: RegionId) {
    this.currentPreset = presetId;
    const preset = PRESETS[presetId];
    this.presetSelect.value = presetId;
    this.presetTitle.textContent = preset.title;

    const scenario =
      presetId === 'allergy' && this.context === 'lifestage' && preset.scenarioLifestage
        ? preset.scenarioLifestage
        : preset.scenario;
    this.staticScenario = scenario;
    this.scenarioText.textContent = scenario;

    const article =
      presetId === 'allergy' && this.context === 'lifestage'
        ? ARTICLES.lifestage
        : ARTICLES[preset.articleKey];
    this.blogCta.href = article.url;
    this.blogCta.textContent = `Read: ${article.title} →`;

    this.commensalRow.hidden = presetId !== 'allergy';
    this.biofilmRow.hidden = presetId !== 'candida';
    this.postbioticRow.hidden = presetId !== 'lifecycle';

    this.highlightRegion(regionId);
    this.updateLegend(getRegion(regionId));
  }

  setRegionActions(regionId: RegionId) {
    const region = getRegion(regionId);
    this.triggerRow.innerHTML = region.triggers
      .map((t) => `<button type="button" class="bd-btn bd-btn--warn" data-trigger="${t.id}">${t.label}</button>`)
      .join('');
    this.inoculationRow.innerHTML = region.inoculations
      .map((i) => `<button type="button" class="bd-btn bd-btn--action" data-inoc="${i.id}">${i.label}</button>`)
      .join('');
    this.bindActionButtons();
  }

  syncEnvSliders(biome: BiomeState, regionId: RegionId) {
    if (regionId !== this.currentRegion) {
      this.renderEnvControls(regionId);
    }
    for (const id of REGION_ENV_CONTROLS[regionId]) {
      const slider = this.envSliders.get(id);
      const readout = this.envReadouts.get(id);
      const value = biome[id];
      if (!slider || value === undefined) continue;
      const str = id === 'moisture' || id === 'sebum' || id === 'cerumen' || id === 'salinity' ||
        id === 'oxygenation' || id === 'sweatRate' || id === 'oxygenTension' || id === 'temperature'
        ? value.toFixed(2)
        : value.toFixed(1);
      if (slider.value !== str) {
        slider.value = str;
        if (readout) readout.textContent = ENV_VAR_DEFS[id].format(value);
      }
    }
  }

  private bindActionButtons() {
    this.triggerRow.querySelectorAll('[data-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.trigger!;
        this.flashButton(el);
        this.callbacks.onTrigger(id);
      });
    });
    this.inoculationRow.querySelectorAll('[data-inoc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.inoc!;
        this.flashButton(el);
        this.callbacks.onInoculate(id);
      });
    });
  }

  private flashButton(btn: HTMLButtonElement) {
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'ACTIVE…';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = orig;
    }, 400);
  }

  flashAction(kind: 'warn' | 'action') {
    this.viewport.classList.remove('bd-viewport--pulse-warn', 'bd-viewport--pulse-action');
    void this.viewport.offsetWidth;
    this.viewport.classList.add(kind === 'warn' ? 'bd-viewport--pulse-warn' : 'bd-viewport--pulse-action');
    setTimeout(() => {
      this.viewport.classList.remove('bd-viewport--pulse-warn', 'bd-viewport--pulse-action');
    }, 600);
  }

  highlightRegion(id: RegionId) {
    this.currentRegion = id;
    this.regionList.querySelectorAll('.bd-region').forEach((btn) => {
      btn.classList.toggle('bd-region--active', (btn as HTMLElement).dataset.region === id);
    });
    const region = getRegion(id);
    this.renderEnvControls(id);
    this.updateLegend(region);
  }

  private updateLegend(region: RegionDef) {
    const s = region.defaultStrains;
    this.legendBox.innerHTML = `
      <div class="bd-legend__row probiotic">● Good Bacteria (${s.probiotics.join(', ')})</div>
      <div class="bd-legend__row pathogen">● Pathogens (${s.pathogens.join(', ')})</div>
      <div class="bd-legend__row allergen">● Allergens (${s.allergens.join(', ')})</div>
      <div class="bd-legend__note">Pathogens compete for tight junction attachment sites.</div>
    `;
  }

  setMicroView(active: boolean, region?: RegionDef) {
    this.microActive = active;
    this.backBtn.hidden = !active;
    const zoomHud = this.root.querySelector('[data-zoom-hud]') as HTMLElement;
    this.legendBox.hidden = !active;
    this.hotspotLayer.hidden = active;
    this.tissueCalloutLayer.hidden = !active;
    this.tissuePictogram.hidden = !active;

    if (active && region) {
      this.modeBadge.textContent = 'TISSUE VIEW';
      this.zoomTitle.textContent = `ZOOM LAYER: ${region.zoomTitle}`;
      this.scaleLabel.textContent = region.scaleLabel;
      this.tissuePictogram.innerHTML = TISSUE_PICTOGRAMS[region.microGeometry];
      if (!this.hintDismissed) {
        this.hintDismissed = true;
        this.hint.hidden = true;
      }
    } else {
      this.modeBadge.textContent = 'BODY MAP';
      this.zoomTitle.textContent = 'FULL-BODY MICROBIOME MAP';
      this.scaleLabel.textContent = 'Click a highlighted region to zoom in';
      this.hint.hidden = this.hintDismissed;
      this.callout.hidden = true;
      this.tissueCalloutLayer.innerHTML = '';
      this.tissuePictogram.innerHTML = '';
    }
  }

  updateTissueCallouts(projections: TissueCalloutProjection[]) {
    if (!this.microActive) return;
    this.tissueCalloutLayer.innerHTML = projections
      .map(
        (p) =>
          `<div class="bd-tissue-callout" style="left:${p.x}px;top:${p.y}px"><span>${p.label}</span></div>`,
      )
      .join('');
  }

  updateHotspotLabels(projections: HotspotProjection[]) {
    if (this.microActive) return;
    this.hotspotLayer.innerHTML = projections
      .map((p) => {
        const region = getRegion(p.id);
        const state = !p.active ? 'inactive' : p.selected ? 'selected' : 'active';
        const label = region.label.toUpperCase().replace(' / ', '/');
        return `<div class="bd-hotspot-label bd-hotspot-label--${state}" style="left:${p.x}px;top:${p.y}px">${label}${!p.active ? '<span>Inactive</span>' : p.selected ? '<span>Selected</span>' : ''}</div>`;
      })
      .join('');
  }

  update(engine: SimEngine, fps: number) {
    const snap = engine.snapshot();
    const trends = engine.getTrends();
    const b = snap.biome;

    this.probioticStat.textContent = `${formatPopulation(b.probioticCount)} ${trendLabel(trends.probiotic)}`;
    this.pathogenStat.textContent = `${formatPopulation(b.pathogenCount)} ${trendLabel(trends.pathogen)}`;
    this.allergenStat.textContent = `${formatPopulation(b.allergenCount)} ${trendLabel(trends.allergen)}`;
    this.commensalStat.textContent = `${formatPopulation(b.commensalCount)} ${trendLabel(trends.commensal)}`;
    this.biofilmStat.textContent = `${Math.round(b.biofilm * 100)}%`;
    this.postbioticStat.textContent = `${Math.round(b.postbioticLevel * 100)}%`;

    const integrityPct = Math.round(b.integrity * 100);
    const inflamePct = Math.round(b.inflammation * 100);
    this.integrityMeter.style.width = `${integrityPct}%`;
    this.inflammationMeter.style.width = `${inflamePct}%`;
    this.root.querySelector('[data-integrity-val]')!.textContent = `${integrityPct}%`;
    this.root.querySelector('[data-inflammation-val]')!.textContent = `${inflamePct}%`;

    const dynamic = engine.getDynamicScenario();
    if (dynamic) this.scenarioText.textContent = dynamic;
    else this.scenarioText.textContent = this.staticScenario;

    this.callout.hidden = !this.microActive || b.inflammation < 0.35;

    if (!this.envDragging) {
      this.syncEnvSliders(b, this.currentRegion);
    }

    this.eventLog.innerHTML = snap.events
      .slice()
      .reverse()
      .map((e, i) => {
        const t = ((snap.tick - i * 10) / 30).toFixed(1);
        return `<li class="${i === 0 ? 'bd-event--new' : ''}"><time>${t}s</time> ${e}</li>`;
      })
      .join('');

    this.fpsBadge.textContent = `${fps} FPS`;
    this.engineBadge.textContent = `ENGINE: DETERMINISTIC · ${fps >= 55 ? '60' : fps} FPS TARGET`;
  }
}
