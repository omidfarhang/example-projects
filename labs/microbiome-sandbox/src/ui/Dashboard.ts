import { ARTICLES } from '../data/articles';
import { PRESETS, type PresetId } from '../data/presets';
import { REGIONS, type RegionId } from '../data/regions';
import type { SimEngine } from '../sim/engine';

function trendArrow(n: number): string {
  if (n > 0) return '↑';
  if (n < 0) return '↓';
  return '→';
}

export interface DashboardCallbacks {
  onRegionSelect: (id: RegionId) => void;
  onPresetChange: (id: PresetId) => void;
  onBackToBody: () => void;
  onTrigger: (id: string) => void;
  onInoculate: (strain: string) => void;
  onEnvChange: (ph: number, moisture: number) => void;
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
  private phSlider!: HTMLInputElement;
  private moistureSlider!: HTMLInputElement;
  private phReadout!: HTMLElement;
  private moistureReadout!: HTMLElement;
  private inoculationRow!: HTMLElement;
  private triggerRow!: HTMLElement;
  private engineBadge!: HTMLElement;
  private fpsBadge!: HTMLElement;
  private callout!: HTMLElement;
  private backBtn!: HTMLButtonElement;
  private presetSelect!: HTMLSelectElement;

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
          <h2>REGION SELECTOR</h2>
          <ul class="bd-region-list" data-region-list></ul>
          <button type="button" class="bd-btn bd-btn--ghost bd-back" data-back hidden>← Back to body</button>
        </aside>
        <section class="bd-viewport-wrap">
          <div class="bd-viewport" data-viewport>
            <canvas data-canvas></canvas>
            <div class="bd-legend">
              <span class="bd-legend__pill probiotic">● Probiotic</span>
              <span class="bd-legend__pill commensal">● Commensal</span>
              <span class="bd-legend__pill pathogen">● Pathogen</span>
              <span class="bd-legend__pill allergen">● Allergen</span>
            </div>
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
            <div class="bd-stat"><span>Probiotic count</span><strong data-probiotic>0 →</strong></div>
            <div class="bd-stat"><span>Pathogen count</span><strong data-pathogen>0 →</strong></div>
            <div class="bd-stat"><span>Allergen count</span><strong data-allergen>0 →</strong></div>
          </div>
        </aside>
      </div>
      <div class="bd-controls">
        <div class="bd-panel bd-env">
          <h2>ENVIRONMENTAL VARIABLES</h2>
          <div class="bd-slider-row">
            <label>pH <output data-ph-readout>6.8</output></label>
            <input type="range" min="4" max="8" step="0.1" value="6.8" data-ph />
          </div>
          <div class="bd-slider-row">
            <label>Moisture <output data-moisture-readout>0.70</output></label>
            <input type="range" min="0" max="1" step="0.01" value="0.70" data-moisture />
          </div>
        </div>
        <div class="bd-panel bd-inoc">
          <h2>BIOTIC INOCULATIONS</h2>
          <div class="bd-btn-row" data-triggers></div>
          <div class="bd-btn-row" data-inoculations></div>
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
    this.phSlider = this.root.querySelector('[data-ph]')!;
    this.moistureSlider = this.root.querySelector('[data-moisture]')!;
    this.phReadout = this.root.querySelector('[data-ph-readout]')!;
    this.moistureReadout = this.root.querySelector('[data-moisture-readout]')!;
    this.inoculationRow = this.root.querySelector('[data-inoculations]')!;
    this.triggerRow = this.root.querySelector('[data-triggers]')!;
    this.engineBadge = this.root.querySelector('[data-engine]')!;
    this.fpsBadge = this.root.querySelector('[data-fps]')!;
    this.callout = this.root.querySelector('[data-callout]')!;
    this.backBtn = this.root.querySelector('[data-back]')!;
    this.presetSelect = this.root.querySelector('[data-preset]')!;

    this.renderRegions();
    this.backBtn.addEventListener('click', () => this.callbacks.onBackToBody());
    this.presetSelect.addEventListener('change', () => {
      this.callbacks.onPresetChange(this.presetSelect.value as PresetId);
    });
    this.phSlider.addEventListener('input', () => this.emitEnv());
    this.moistureSlider.addEventListener('input', () => this.emitEnv());
  }

  getCanvas(): HTMLCanvasElement {
    return this.root.querySelector('[data-canvas]')!;
  }

  private emitEnv() {
    const ph = parseFloat(this.phSlider.value);
    const moisture = parseFloat(this.moistureSlider.value);
    this.phReadout.textContent = ph.toFixed(1);
    this.moistureReadout.textContent = moisture.toFixed(2);
    this.callbacks.onEnvChange(ph, moisture);
  }

  private renderRegions() {
    this.regionList.innerHTML = REGIONS.map(
      (r) => `
      <li>
        <button type="button" class="bd-region ${r.active ? '' : 'bd-region--soon'}"
          data-region="${r.id}" ${r.active ? '' : 'disabled'}>
          ${r.label}${r.active ? '' : ' <em>(coming soon)</em>'}
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
    const preset = PRESETS[presetId];
    this.presetSelect.value = presetId;
    this.presetTitle.textContent = preset.title;

    const scenario =
      presetId === 'allergy' && this.context === 'lifestage' && preset.scenarioLifestage
        ? preset.scenarioLifestage
        : preset.scenario;
    this.scenarioText.textContent = scenario;

    const article =
      presetId === 'allergy' && this.context === 'lifestage'
        ? ARTICLES.lifestage
        : ARTICLES[preset.articleKey];
    this.blogCta.href = article.url;
    this.blogCta.textContent = `Read: ${article.title} →`;

    this.phSlider.value = String(preset.env.ph);
    this.moistureSlider.value = String(preset.env.moisture);
    this.phReadout.textContent = preset.env.ph.toFixed(1);
    this.moistureReadout.textContent = preset.env.moisture.toFixed(2);

    this.triggerRow.innerHTML = preset.triggers
      .map((t) => `<button type="button" class="bd-btn bd-btn--warn" data-trigger="${t.id}">${t.label}</button>`)
      .join('');
    this.inoculationRow.innerHTML = preset.inoculations
      .map((i) => `<button type="button" class="bd-btn bd-btn--action" data-inoc="${i.strain}">${i.label}</button>`)
      .join('');

    this.triggerRow.querySelectorAll('[data-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => this.callbacks.onTrigger((btn as HTMLElement).dataset.trigger!));
    });
    this.inoculationRow.querySelectorAll('[data-inoc]').forEach((btn) => {
      btn.addEventListener('click', () => this.callbacks.onInoculate((btn as HTMLElement).dataset.inoc!));
    });

    this.highlightRegion(regionId);
  }

  highlightRegion(id: RegionId) {
    this.regionList.querySelectorAll('.bd-region').forEach((btn) => {
      btn.classList.toggle('bd-region--active', (btn as HTMLElement).dataset.region === id);
    });
  }

  setMicroView(active: boolean) {
    this.backBtn.hidden = !active;
    this.callout.hidden = !active;
  }

  update(engine: SimEngine, fps: number) {
    const snap = engine.snapshot();
    const trends = engine.getTrends();
    const b = snap.biome;

    this.probioticStat.textContent = `${b.probioticCount} ${trendArrow(trends.probiotic)}`;
    this.pathogenStat.textContent = `${b.pathogenCount} ${trendArrow(trends.pathogen)}`;
    this.allergenStat.textContent = `${b.allergenCount} ${trendArrow(trends.allergen)}`;

    this.callout.hidden = b.inflammation < 0.35;
    this.fpsBadge.textContent = `${fps} FPS`;
    this.engineBadge.textContent = `ENGINE: DETERMINISTIC · ${fps >= 55 ? '60' : fps} FPS TARGET`;
  }
}
