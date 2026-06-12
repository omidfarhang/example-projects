import { ARTICLES } from '../data/articles';
import {
  ENV_VAR_DEFS,
  REGION_ENV_CONTROLS,
  type EnvVarId,
} from '../data/envVars';
import { PRESETS, type PresetId } from '../data/presets';
import { regionExplorationBlurb } from '../data/presetRegionNarratives';
import type { PostbioticId } from '../data/postbiotics';
import { POSTBIOTIC_LIST, POSTBIOTICS } from '../data/postbiotics';
import type { ProductId } from '../data/products';
import { PRODUCT_LIST, PRODUCTS } from '../data/products';
import { REGION_SUGGESTIONS } from '../data/regionSuggestions';
import { getRegion, REGIONS, type RegionDef, type RegionId } from '../data/regions';
import { PREBIOTIC_LIST, PREBIOTICS, STRAINS, STRAIN_LIST, formatStrainTooltip, type PrebioticId, type StrainId } from '../data/strains';

type CatalogTab = 'products' | 'strains' | 'prebiotics' | 'postbiotics';
import {
  buildImpactForSource,
  deltasForMeters,
  formatImpactDelta,
  type ActionImpact,
  type ImpactSourceKind,
} from './actionImpact';
import type { HotspotProjection, TissueCalloutProjection } from '../scene/SceneManager';
import { TISSUE_PICTOGRAMS } from '../scene/tissueCallouts';
import { POPULATION_SCALE, type SimEngine } from '../sim/engine';
import { formatStrainList, summarizeLiveStrains, totalCells } from '../sim/strainSummary';
import type { BiomeState, MicrobeNode } from '../sim/types';
import { initTouchGestureHints } from './touchGestureHints';

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
  onContextChange: (context?: string) => void;
  onBackToBody: () => void;
  onTrigger: (id: string) => void;
  onInoculate: (id: string) => void;
  onApplyStrain: (id: StrainId) => void;
  onApplyPrebiotic: (id: PrebioticId) => void;
  onApplyPostbiotic: (id: PostbioticId) => void;
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
  private prebioticStat!: HTMLElement;
  private postbioticStat!: HTMLElement;
  private integrityMeter!: HTMLElement;
  private inflammationMeter!: HTMLElement;
  private envPanel!: HTMLElement;
  private envSliders = new Map<EnvVarId, HTMLInputElement>();
  private envReadouts = new Map<EnvVarId, HTMLElement>();
  private triggerRow!: HTMLElement;
  private suggestedRow!: HTMLElement;
  private regionalCareRow!: HTMLElement;
  private regionalCareSection!: HTMLElement;
  private suggestedHint!: HTMLElement;
  private strainRow!: HTMLElement;
  private prebioticRow!: HTMLElement;
  private postbioticCatalogRow!: HTMLElement;
  private productRow!: HTMLElement;
  private catalogPanes = new Map<CatalogTab, HTMLElement>();
  private activeCatalogTab: CatalogTab = 'products';
  private engineBadge!: HTMLElement;
  private fpsBadge!: HTMLElement;
  private callout!: HTMLElement;
  private backBtn!: HTMLButtonElement;
  private presetSelect!: HTMLSelectElement;
  private contextSelect!: HTMLSelectElement;
  private contextField!: HTMLElement;
  private viewport!: HTMLElement;
  private zoomTitle!: HTMLElement;
  private modeBadge!: HTMLElement;
  private scaleLabel!: HTMLElement;
  private hint!: HTMLElement;
  private legendBox!: HTMLElement;
  private eventLog!: HTMLElement;
  private eventLogList!: HTMLElement;
  private eventLogExpandBtn!: HTMLButtonElement;
  private eventLogExportBtn!: HTMLButtonElement;
  private eventLogCount!: HTMLElement;
  private hotspotLayer!: HTMLElement;
  private tissueCalloutLayer!: HTMLElement;
  private tissuePictogram!: HTMLElement;
  private commensalRow!: HTMLElement;
  private biofilmRow!: HTMLElement;
  private prebioticStatRow!: HTMLElement;
  private postbioticRow!: HTMLElement;
  private impactPanel!: HTMLElement;
  private impactCloseBtn!: HTMLButtonElement;
  private actionBadge!: HTMLElement;
  private envDragging = false;
  private impactSource: { kind: ImpactSourceKind; id: string } | null = null;
  private boundImpactKeyDown = (e: KeyboardEvent) => this.onImpactKeyDown(e);

  private currentPreset: PresetId = 'allergy';
  private currentRegion: RegionId = 'nose';
  private microActive = false;
  private hintDismissed = false;
  private staticScenario = '';
  private eventLogExpanded = false;
  private lastEventCount = 0;
  private cachedEvents: string[] = [];

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
              <span class="bd-action-badge" data-action-badge hidden></span>
              <div class="bd-tissue-pictogram" data-tissue-pictogram hidden></div>
              <h2 class="bd-zoom-title" data-zoom-title>ZOOM LAYER</h2>
              <span class="bd-scale-label" data-scale-label></span>
            </div>
            <p class="bd-hint" data-hint>Select a tissue region on the body map, then run a scenario trigger.</p>
            <div class="bd-touch-hints" data-touch-hints hidden>
              <button type="button" class="bd-touch-hints__dismiss" data-touch-hints-dismiss aria-label="Dismiss touch controls">×</button>
              <p class="bd-touch-hints__title">Touch controls</p>
              <ul class="bd-touch-hints__list">
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
                    <path d="M16 7 A9 9 0 0 1 23 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="16" cy="7" r="2" fill="currentColor"/>
                  </svg>
                  <span>One finger — orbit</span>
                </li>
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="11" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="21" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 16 H5 M27 16 H25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 12 L5 16 L8 20 M24 12 L27 16 L24 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Pinch — zoom</span>
                </li>
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="10" cy="20" r="3" fill="currentColor" opacity="0.85"/>
                    <circle cx="22" cy="12" r="3" fill="currentColor" opacity="0.85"/>
                    <path d="M14 18 L20 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/>
                    <path d="M6 20 H26 M22 20 L18 16 M22 20 L18 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Two fingers — pan</span>
                </li>
              </ul>
            </div>
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
          <div class="bd-context-field" data-context-field hidden>
            <label class="bd-label">SCENARIO VARIANT</label>
            <select class="bd-select" data-context>
              <option value="">Standard scenario</option>
              <option value="lifestage">Life-stage context</option>
            </select>
          </div>
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
            <div class="bd-stat bd-stat--prebiotic" data-prebiotic-stat-row hidden><span>Prebiotic substrate</span><strong data-prebiotic-stat title="Fiber particles in the lumen; % remaining drops as probiotics convert substrate to SCFA">0 →</strong></div>
            <div class="bd-stat" data-postbiotic-row hidden><span>Postbiotic SCFA</span><strong data-postbiotic>0%</strong></div>
          </div>
          <div class="bd-event-log">
            <div class="bd-event-log__header">
              <h3>EVENT LOG</h3>
              <div class="bd-event-log__actions">
                <span class="bd-event-log__count" data-event-log-count></span>
                <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-event-log-expand hidden>Show all</button>
                <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-event-log-export title="Download full log for classroom use">Export</button>
              </div>
            </div>
            <ul data-event-log></ul>
          </div>
        </aside>
      </div>
      <div class="bd-controls bd-controls--lab">
        <div class="bd-panel bd-env">
          <h2>ENVIRONMENTAL VARIABLES</h2>
          <p class="bd-env-hint" data-env-hint>Region-specific tissue conditions</p>
          <div class="bd-env-grid" data-env-panel></div>
        </div>
        <div class="bd-panel bd-stressors">
          <h2>STRESSORS</h2>
          <p class="bd-section-hint">Click to preview and apply — tissue view updates immediately</p>
          <div class="bd-btn-row bd-btn-row--stressors" data-triggers></div>
        </div>
        <div class="bd-panel bd-regional">
          <h2>REGIONAL CARE</h2>
          <p class="bd-section-hint" data-suggested-hint>Suggested for this tissue — click to preview and apply</p>
          <div class="bd-btn-row bd-btn-row--suggested" data-suggested></div>
          <div class="bd-regional-care" data-regional-care-section>
            <h3 class="bd-subheading">Tissue-specific treatments</h3>
            <div class="bd-btn-row" data-regional-care></div>
          </div>
        </div>
        <div class="bd-catalog-row">
          <div class="bd-panel bd-catalog">
            <h2>INTERVENTIONS</h2>
            <p class="bd-section-hint">Full catalog — click to preview and apply</p>
            <div class="bd-catalog-tabs" role="tablist">
              <button type="button" class="bd-catalog-tab bd-catalog-tab--active" role="tab" data-catalog-tab="products" aria-selected="true">Products &amp; foods</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="strains" aria-selected="false">Strain library</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="prebiotics" aria-selected="false">Prebiotics</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="postbiotics" aria-selected="false">Postbiotics</button>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="products">
              <div class="bd-btn-row bd-btn-row--products" data-products></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="strains" hidden>
              <div class="bd-btn-row bd-btn-row--dense bd-btn-row--strains" data-strains></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="prebiotics" hidden>
              <div class="bd-btn-row bd-btn-row--prebiotics" data-prebiotics></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="postbiotics" hidden>
              <div class="bd-btn-row bd-btn-row--postbiotics" data-postbiotics></div>
            </div>
          </div>
          <div class="bd-panel bd-impact bd-impact--inline bd-impact--empty" data-impact-panel>
            <div class="bd-impact-toolbar">
              <h3>ACTION PREVIEW</h3>
              <button type="button" class="bd-impact-close" data-impact-close aria-label="Close preview" hidden>×</button>
            </div>
            <p class="bd-impact-placeholder" data-impact-placeholder>
              Click any stressor, regional treatment, or catalog item to preview its effect on this tissue.
            </p>
            <div class="bd-impact-body" data-impact-body hidden></div>
          </div>
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
    this.prebioticStat = this.root.querySelector('[data-prebiotic-stat]')!;
    this.postbioticStat = this.root.querySelector('[data-postbiotic]')!;
    this.integrityMeter = this.root.querySelector('[data-integrity-meter]')!;
    this.inflammationMeter = this.root.querySelector('[data-inflammation-meter]')!;
    this.envPanel = this.root.querySelector('[data-env-panel]')!;
    this.triggerRow = this.root.querySelector('[data-triggers]')!;
    this.suggestedRow = this.root.querySelector('[data-suggested]')!;
    this.regionalCareRow = this.root.querySelector('[data-regional-care]')!;
    this.regionalCareSection = this.root.querySelector('[data-regional-care-section]')!;
    this.suggestedHint = this.root.querySelector('[data-suggested-hint]')!;
    this.strainRow = this.root.querySelector('[data-strains]')!;
    this.prebioticRow = this.root.querySelector('[data-prebiotics]')!;
    this.postbioticCatalogRow = this.root.querySelector('[data-postbiotics]')!;
    this.productRow = this.root.querySelector('[data-products]')!;
    for (const tab of ['products', 'strains', 'prebiotics', 'postbiotics'] as CatalogTab[]) {
      const pane = this.root.querySelector(`[data-catalog-pane="${tab}"]`) as HTMLElement;
      this.catalogPanes.set(tab, pane);
    }
    this.root.querySelectorAll('[data-catalog-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setCatalogTab((btn as HTMLElement).dataset.catalogTab as CatalogTab);
      });
    });
    this.engineBadge = this.root.querySelector('[data-engine]')!;
    this.fpsBadge = this.root.querySelector('[data-fps]')!;
    this.callout = this.root.querySelector('[data-callout]')!;
    this.backBtn = this.root.querySelector('[data-back]')!;
    this.presetSelect = this.root.querySelector('[data-preset]')!;
    this.contextSelect = this.root.querySelector('[data-context]')!;
    this.contextField = this.root.querySelector('[data-context-field]')!;
    this.viewport = this.root.querySelector('[data-viewport]')!;
    this.zoomTitle = this.root.querySelector('[data-zoom-title]')!;
    this.modeBadge = this.root.querySelector('[data-mode-badge]')!;
    this.scaleLabel = this.root.querySelector('[data-scale-label]')!;
    this.hint = this.root.querySelector('[data-hint]')!;
    this.legendBox = this.root.querySelector('[data-legend-box]')!;
    this.eventLog = this.root.querySelector('.bd-event-log')!;
    this.eventLogList = this.root.querySelector('[data-event-log]')!;
    this.eventLogExpandBtn = this.root.querySelector('[data-event-log-expand]')!;
    this.eventLogExportBtn = this.root.querySelector('[data-event-log-export]')!;
    this.eventLogCount = this.root.querySelector('[data-event-log-count]')!;
    this.hotspotLayer = this.root.querySelector('[data-hotspot-layer]')!;
    this.tissueCalloutLayer = this.root.querySelector('[data-tissue-callouts]')!;
    this.tissuePictogram = this.root.querySelector('[data-tissue-pictogram]')!;
    this.commensalRow = this.root.querySelector('[data-commensal-row]')!;
    this.biofilmRow = this.root.querySelector('[data-biofilm-row]')!;
    this.prebioticStatRow = this.root.querySelector('[data-prebiotic-stat-row]')!;
    this.postbioticRow = this.root.querySelector('[data-postbiotic-row]')!;
    this.impactPanel = this.root.querySelector('[data-impact-panel]')!;
    this.impactCloseBtn = this.root.querySelector('[data-impact-close]')!;
    this.actionBadge = this.root.querySelector('[data-action-badge]')!;

    this.impactCloseBtn.addEventListener('click', () => this.dismissImpactPreview());
    document.addEventListener('keydown', this.boundImpactKeyDown);

    this.renderRegions();
    this.backBtn.addEventListener('click', () => this.callbacks.onBackToBody());
    this.presetSelect.addEventListener('change', () => {
      this.callbacks.onPresetChange(this.presetSelect.value as PresetId);
    });
    this.contextSelect.addEventListener('change', () => {
      const value = this.contextSelect.value || undefined;
      this.context = value;
      this.callbacks.onContextChange(value);
      this.refreshPresetNarrative(this.currentRegion);
    });
    this.eventLogExpandBtn.addEventListener('click', () => {
      this.eventLogExpanded = !this.eventLogExpanded;
      this.eventLog.classList.toggle('bd-event-log--expanded', this.eventLogExpanded);
      this.eventLogExpandBtn.textContent = this.eventLogExpanded ? 'Show recent' : 'Show all';
    });
    this.eventLogExportBtn.addEventListener('click', () => this.exportEventLog());
    this.renderEnvControls(this.currentRegion);
    this.renderCatalog();
    this.setMicroView(false);
    initTouchGestureHints(this.viewport, this.getCanvas());
  }

  private setCatalogTab(tab: CatalogTab) {
    this.activeCatalogTab = tab;
    this.root.querySelectorAll('[data-catalog-tab]').forEach((btn) => {
      const el = btn as HTMLElement;
      const active = el.dataset.catalogTab === tab;
      el.classList.toggle('bd-catalog-tab--active', active);
      el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    for (const [id, pane] of this.catalogPanes) {
      pane.hidden = id !== tab;
    }
  }

  private renderCatalog() {
    this.strainRow.innerHTML = STRAIN_LIST.map((s) => {
      const kind = s.kind === 'commensal' ? 'commensal' : 'probiotic';
      const regions = s.commonRegions?.length ? s.commonRegions.join(', ') : 'all regions';
      const tooltip = formatStrainTooltip(s).replace(/"/g, '&quot;');
      return `<button type="button" class="bd-btn bd-btn--strain bd-btn--${kind}" data-strain="${s.id}" title="${tooltip}">${s.name}<span class="bd-product-form">${kind} · ${regions}</span></button>`;
    }).join('');

    this.prebioticRow.innerHTML = PREBIOTIC_LIST.map((p) => {
      const regions = p.commonRegions?.length ? p.commonRegions.join(', ') : 'all regions';
      return `<button type="button" class="bd-btn bd-btn--prebiotic" data-prebiotic="${p.id}" title="${p.why}">+ ${p.name.toUpperCase()}<span class="bd-product-form">fiber · ${regions}</span></button>`;
    }).join('');

    this.postbioticCatalogRow.innerHTML = POSTBIOTIC_LIST.map(
      (p) =>
        `<button type="button" class="bd-btn bd-btn--postbiotic" data-postbiotic="${p.id}" title="${p.description}">${p.label}<span class="bd-product-form">metabolite · ${p.preferredRegions.join(', ')}</span></button>`,
    ).join('');

    this.productRow.innerHTML = PRODUCT_LIST.map(
      (p) =>
        `<button type="button" class="bd-btn bd-btn--product bd-btn--${p.category}" data-product="${p.id}" title="${p.description}">${p.label}<span class="bd-product-form">${p.form} · ${p.category}</span></button>`,
    ).join('');

    this.strainRow.querySelectorAll('[data-strain]').forEach((btn) => {
      const el = btn as HTMLButtonElement;
      const id = el.dataset.strain as StrainId;
      this.bindPreviewButton(el, 'strain', id, () => {
        this.flashButton(el);
        this.openImpactPreview('strain', id, true);
        this.callbacks.onApplyStrain(id);
      });
    });

    this.prebioticRow.querySelectorAll('[data-prebiotic]').forEach((btn) => {
      const el = btn as HTMLButtonElement;
      const id = el.dataset.prebiotic as PrebioticId;
      this.bindPreviewButton(el, 'prebiotic', id, () => {
        this.flashButton(el);
        this.openImpactPreview('prebiotic', id, true);
        this.callbacks.onApplyPrebiotic(id);
      });
    });

    this.postbioticCatalogRow.querySelectorAll('[data-postbiotic]').forEach((btn) => {
      const el = btn as HTMLButtonElement;
      const id = el.dataset.postbiotic as PostbioticId;
      this.bindPreviewButton(el, 'postbiotic', id, () => {
        this.flashButton(el);
        this.openImpactPreview('postbiotic', id, true);
        this.callbacks.onApplyPostbiotic(id);
      });
    });

    this.productRow.querySelectorAll('[data-product]').forEach((btn) => {
      const el = btn as HTMLButtonElement;
      const id = el.dataset.product as ProductId;
      this.bindPreviewButton(el, 'product', id, () => {
        this.flashButton(el);
        this.openImpactPreview('product', id, true);
        this.callbacks.onApplyProduct(id);
      });
    });
  }

  private bindPreviewButton(
    el: HTMLButtonElement,
    kind: 'strain' | 'prebiotic' | 'postbiotic' | 'product',
    id: string,
    onApply: () => void,
  ) {
    el.addEventListener('click', onApply);
  }

  private buildImpact(kind: ImpactSourceKind, id: string): ActionImpact {
    return buildImpactForSource(kind, id, this.currentRegion);
  }

  private renderImpactPanel(impact: ActionImpact) {
    const body = this.impactPanel.querySelector('[data-impact-body]')!;
    const isInstant = impact.category === 'stressor' || impact.category === 'regional';
    const efficacyClass = isInstant
      ? 'bd-impact-efficacy--full'
      : impact.efficacyPct >= 100
        ? 'bd-impact-efficacy--full'
        : impact.efficacyPct >= 65
          ? 'bd-impact-efficacy--reduced'
          : 'bd-impact-efficacy--low';
    const efficacyLabel = isInstant ? 'Instant' : `${impact.efficacyPct}% efficacy`;
    const addsHeading =
      impact.category === 'stressor'
        ? 'Introduces'
        : impact.category === 'regional'
          ? 'Applies'
          : impact.form === 'metabolite'
            ? 'Metabolite shift'
            : 'Adds';

    const addsHtml = impact.adds.length
      ? impact.adds
          .map(
            (a) =>
              `<li class="bd-impact-add bd-impact-add--${a.type}"><span class="bd-impact-add__count">${a.count}×</span> ${a.label}</li>`,
          )
          .join('')
      : impact.form === 'metabolite'
        ? `<li class="bd-impact-add bd-impact-add--neutral">Direct SCFA metabolite — raises postbiotic level, no new microbes</li>`
        : `<li class="bd-impact-add bd-impact-add--neutral">Environmental shift only — no new microbes</li>`;

    const deltasHtml = impact.deltas.length
      ? impact.deltas
          .map(
            (d) =>
              `<span class="bd-impact-delta bd-impact-delta--${d.direction} bd-impact-delta--${d.source}">${formatImpactDelta(d)}</span>`,
          )
          .join('')
      : '<span class="bd-impact-delta bd-impact-delta--neutral">No immediate biome shift — substrate converts over time near probiotics</span>';

    body.innerHTML = `
      <div class="bd-impact-header">
        <strong class="bd-impact-title">${impact.title}</strong>
        ${impact.form ? `<span class="bd-impact-form">${impact.form}</span>` : ''}
        <span class="bd-impact-efficacy ${efficacyClass}">${efficacyLabel}</span>
      </div>
      ${impact.warning ? `<p class="bd-impact-warning">${impact.warning}</p>` : ''}
      <div class="bd-impact-section">
        <h4>${addsHeading}</h4>
        <ul class="bd-impact-adds">${addsHtml}</ul>
      </div>
      <div class="bd-impact-section">
        <h4>Biome shift</h4>
        <div class="bd-impact-deltas">${deltasHtml}</div>
      </div>
      <p class="bd-impact-why"><strong>Why:</strong> ${impact.why}</p>
      ${
        impact.article
          ? `<p class="bd-impact-article"><strong>Article:</strong> ${impact.article.claim} — <a href="${impact.article.url}" target="_blank" rel="noopener">${impact.article.title} →</a></p>`
          : ''
      }
    `;
  }

  private openImpactPreview(
    kind: ImpactSourceKind,
    id: string,
    flashMeters = false,
    actionTone: 'warn' | 'action' = 'action',
  ) {
    this.impactSource = { kind, id };
    const impact = this.buildImpact(kind, id);
    this.renderImpactPanel(impact);
    this.setImpactPanelActive(true);
    this.highlightPreviewButton(kind, id);
    this.setActionBadge(impact.title, actionTone);
    if (flashMeters) this.flashMeterDeltas(impact);
  }

  private setActionBadge(label: string, tone: 'warn' | 'action') {
    if (!this.microActive) return;
    this.actionBadge.hidden = false;
    this.actionBadge.textContent = `ACTIVE: ${label}`;
    this.actionBadge.classList.remove('bd-action-badge--warn', 'bd-action-badge--action');
    this.actionBadge.classList.add(tone === 'warn' ? 'bd-action-badge--warn' : 'bd-action-badge--action');
  }

  private clearActionBadge() {
    this.actionBadge.hidden = true;
    this.actionBadge.textContent = '';
    this.actionBadge.classList.remove('bd-action-badge--warn', 'bd-action-badge--action');
  }

  private closeImpactPreview() {
    this.impactSource = null;
    this.setImpactPanelActive(false);
    this.clearPreviewButtonHighlights();
  }

  private dismissImpactPreview() {
    this.closeImpactPreview();
  }

  private setImpactPanelActive(active: boolean) {
    this.impactPanel.classList.toggle('bd-impact--empty', !active);
    const placeholder = this.impactPanel.querySelector('[data-impact-placeholder]') as HTMLElement;
    const body = this.impactPanel.querySelector('[data-impact-body]') as HTMLElement;
    placeholder.hidden = active;
    body.hidden = !active;
    this.impactCloseBtn.hidden = !active;
  }

  private highlightPreviewButton(kind: ImpactSourceKind, id: string) {
    this.clearPreviewButtonHighlights();
    const selectors: Record<ImpactSourceKind, string> = {
      strain: `[data-strain="${id}"], [data-suggest-strain="${id}"]`,
      prebiotic: `[data-prebiotic="${id}"], [data-suggest-prebiotic="${id}"]`,
      postbiotic: `[data-postbiotic="${id}"], [data-suggest-postbiotic="${id}"]`,
      product: `[data-product="${id}"], [data-suggest-product="${id}"]`,
      stressor: `[data-trigger="${id}"]`,
      regional: `[data-regional-care="${id}"]`,
    };
    this.root.querySelectorAll(selectors[kind]).forEach((el) => {
      el.classList.add('bd-btn--preview-active');
    });
  }

  private clearPreviewButtonHighlights() {
    this.root.querySelectorAll('.bd-btn--preview-active').forEach((el) => {
      el.classList.remove('bd-btn--preview-active');
    });
  }

  private onImpactKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !this.impactSource) return;
    this.dismissImpactPreview();
  }

  private flashMeterDeltas(impact: ActionImpact) {
    const metrics = deltasForMeters(impact.deltas);
    const integrityWrap = this.integrityMeter.parentElement?.parentElement;
    const inflammationWrap = this.inflammationMeter.parentElement?.parentElement;
    integrityWrap?.classList.remove('bd-meter--flash-up', 'bd-meter--flash-down');
    inflammationWrap?.classList.remove('bd-meter--flash-up', 'bd-meter--flash-down');

    for (const m of metrics) {
      const delta = impact.deltas.find((d) => d.metric === m);
      if (!delta) continue;
      const wrap = m === 'integrity' ? integrityWrap : inflammationWrap;
      const cls = delta.direction === 'down' ? 'bd-meter--flash-down' : 'bd-meter--flash-up';
      wrap?.classList.add(cls);
    }

    setTimeout(() => {
      integrityWrap?.classList.remove('bd-meter--flash-up', 'bd-meter--flash-down');
      inflammationWrap?.classList.remove('bd-meter--flash-up', 'bd-meter--flash-down');
    }, 1200);
  }

  private refreshImpactIfVisible() {
    if (!this.impactSource) return;
    if (!this.isImpactSourceAvailable(this.impactSource)) {
      this.closeImpactPreview();
      return;
    }
    const impact = this.buildImpact(this.impactSource.kind, this.impactSource.id);
    this.renderImpactPanel(impact);
  }

  private isImpactSourceAvailable(source: { kind: ImpactSourceKind; id: string }): boolean {
    const region = getRegion(this.currentRegion);
    if (source.kind === 'stressor') {
      return region.triggers.some((t) => t.id === source.id);
    }
    if (source.kind === 'regional') {
      return region.regionalCare.some((a) => a.id === source.id);
    }
    return true;
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

    this.contextField.hidden = presetId !== 'allergy';
    if (presetId !== 'allergy' && this.context === 'lifestage') {
      this.context = undefined;
      this.contextSelect.value = '';
    } else {
      this.contextSelect.value = this.context === 'lifestage' ? 'lifestage' : '';
    }

    this.presetTitle.textContent = preset.title;
    this.refreshPresetNarrative(regionId);

    const article =
      presetId === 'allergy' && this.context === 'lifestage'
        ? ARTICLES.lifestage
        : ARTICLES[preset.articleKey];
    this.blogCta.href = article.url;
    this.blogCta.textContent = `Read: ${article.title} →`;

    this.commensalRow.hidden = presetId !== 'allergy';
    this.biofilmRow.hidden = presetId !== 'candida';
    this.prebioticStatRow.hidden = presetId !== 'lifecycle';
    this.postbioticRow.hidden = presetId !== 'lifecycle';

    this.highlightRegion(regionId);
    this.updateLegend(getRegion(regionId));
  }

  applyContext(context?: string) {
    this.context = context;
    this.contextSelect.value = context === 'lifestage' ? 'lifestage' : '';
    this.refreshPresetNarrative(this.currentRegion);
    const preset = PRESETS[this.currentPreset];
    const article =
      this.currentPreset === 'allergy' && this.context === 'lifestage'
        ? ARTICLES.lifestage
        : ARTICLES[preset.articleKey];
    this.blogCta.href = article.url;
    this.blogCta.textContent = `Read: ${article.title} →`;
  }

  private refreshPresetNarrative(regionId: RegionId) {
    const preset = PRESETS[this.currentPreset];
    const baseScenario =
      this.currentPreset === 'allergy' && this.context === 'lifestage' && preset.scenarioLifestage
        ? preset.scenarioLifestage
        : preset.scenario;
    const regionBlurb = regionExplorationBlurb(this.currentPreset, regionId);
    this.staticScenario = regionBlurb ? `${baseScenario} ${regionBlurb}` : baseScenario;
    this.scenarioText.textContent = this.staticScenario;
  }

  setRegionActions(regionId: RegionId) {
    const region = getRegion(regionId);
    const suggestions = REGION_SUGGESTIONS[regionId];

    this.triggerRow.innerHTML = region.triggers
      .map((t) => `<button type="button" class="bd-btn bd-btn--warn" data-trigger="${t.id}">${t.label}</button>`)
      .join('');

    this.suggestedHint.textContent = `Suggested for ${region.label} — click to preview and apply`;

    const chips: string[] = [];
    for (const id of suggestions.strains ?? []) {
      const strain = STRAINS[id];
      chips.push(
        `<button type="button" class="bd-btn bd-btn--suggested bd-btn--suggested-strain" data-suggest-strain="${id}" title="${formatStrainTooltip(strain).replace(/"/g, '&quot;')}">${strain.name}</button>`,
      );
    }
    for (const id of suggestions.prebiotics ?? []) {
      const pre = PREBIOTICS[id];
      chips.push(
        `<button type="button" class="bd-btn bd-btn--suggested bd-btn--suggested-prebiotic" data-suggest-prebiotic="${id}">+ ${pre.name.toUpperCase()}</button>`,
      );
    }
    for (const id of suggestions.postbiotics ?? []) {
      const post = POSTBIOTICS[id];
      const short = post.name.toUpperCase();
      chips.push(
        `<button type="button" class="bd-btn bd-btn--suggested bd-btn--suggested-postbiotic" data-suggest-postbiotic="${id}" title="${post.label}">${short}</button>`,
      );
    }
    for (const id of suggestions.products ?? []) {
      const short = PRODUCTS[id].label.replace(' (FERMENTED)', '').split(' ').slice(0, 2).join(' ');
      chips.push(
        `<button type="button" class="bd-btn bd-btn--suggested bd-btn--suggested-product" data-suggest-product="${id}" title="${PRODUCTS[id].label}">${short}</button>`,
      );
    }
    this.suggestedRow.innerHTML = chips.join('');

    this.regionalCareRow.innerHTML = region.regionalCare
      .map((a) => `<button type="button" class="bd-btn bd-btn--action" data-regional-care="${a.id}">${a.label}</button>`)
      .join('');
    this.regionalCareSection.hidden = region.regionalCare.length === 0;

    this.bindRegionButtons();
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

  private bindRegionButtons() {
    this.triggerRow.querySelectorAll('[data-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.trigger!;
        this.flashButton(el);
        this.openImpactPreview('stressor', id, true, 'warn');
        this.callbacks.onTrigger(id);
      });
    });

    this.regionalCareRow.querySelectorAll('[data-regional-care]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.regionalCare!;
        this.flashButton(el);
        this.openImpactPreview('regional', id, true, 'action');
        this.callbacks.onInoculate(id);
      });
    });

    this.suggestedRow.querySelectorAll('[data-suggest-strain]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.suggestStrain as StrainId;
        this.flashButton(el);
        this.setCatalogTab('strains');
        this.openImpactPreview('strain', id, true);
        this.callbacks.onApplyStrain(id);
      });
    });

    this.suggestedRow.querySelectorAll('[data-suggest-prebiotic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.suggestPrebiotic as PrebioticId;
        this.flashButton(el);
        this.setCatalogTab('prebiotics');
        this.openImpactPreview('prebiotic', id, true);
        this.callbacks.onApplyPrebiotic(id);
      });
    });

    this.suggestedRow.querySelectorAll('[data-suggest-postbiotic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.suggestPostbiotic as PostbioticId;
        this.flashButton(el);
        this.setCatalogTab('postbiotics');
        this.openImpactPreview('postbiotic', id, true);
        this.callbacks.onApplyPostbiotic(id);
      });
    });

    this.suggestedRow.querySelectorAll('[data-suggest-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn as HTMLButtonElement;
        const id = el.dataset.suggestProduct as ProductId;
        this.flashButton(el);
        this.setCatalogTab('products');
        this.openImpactPreview('product', id, true);
        this.callbacks.onApplyProduct(id);
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
    this.refreshPresetNarrative(id);
    this.renderEnvControls(id);
    this.updateLegend(region);
    this.refreshImpactIfVisible();
  }

  private updateLegend(region: RegionDef) {
    this.renderLegend(region, null);
  }

  private updateLegendFromSimulation(region: RegionDef, nodes: MicrobeNode[]) {
    this.renderLegend(region, summarizeLiveStrains(nodes));
  }

  private renderLegend(region: RegionDef, live: ReturnType<typeof summarizeLiveStrains> | null) {
    const baseline = region.defaultStrains;

    const row = (
      kind: 'probiotic' | 'pathogen' | 'allergen' | 'prebiotic',
      label: string,
      entries: { strain: string; count: number }[],
      fallback: string[],
    ) => {
      if (entries.length > 0) {
        const strainCount = entries.length;
        const cellCount = totalCells(entries);
        const names = formatStrainList(entries);
        const countLabel =
          strainCount > 1 ? `${strainCount} strains · ${cellCount} cells` : `${cellCount} cells`;
        return `
          <div class="bd-legend__row ${kind}">● ${label} <span class="bd-legend__meta">(${countLabel})</span></div>
          <div class="bd-legend__strains bd-legend__strains--${kind}">${names}</div>`;
      }
      return `<div class="bd-legend__row ${kind}">● ${label} <span class="bd-legend__meta">(baseline: ${fallback.join(', ')})</span></div>`;
    };

    const note =
      live && live.probiotics.length > 1
        ? 'Each green shade in the lumen = a different probiotic strain. Legend lists all strains currently present.'
        : live && live.prebiotics.length > 0
          ? 'Green capsules = probiotics · lime rods = prebiotic substrate feeding them.'
          : 'Pathogens compete for tight junction attachment sites.';

    const prebioticBlock =
      this.currentPreset === 'lifecycle'
        ? row('prebiotic', 'Prebiotic substrate', live?.prebiotics ?? [], ['inulin'])
        : live && live.prebiotics.length > 0
          ? `
          <div class="bd-legend__row prebiotic">● Prebiotic substrate <span class="bd-legend__meta">(${live.prebiotics.length} types · ${totalCells(live.prebiotics)} particles)</span></div>
          <div class="bd-legend__strains bd-legend__strains--prebiotic">${formatStrainList(live.prebiotics)}</div>`
          : '';

    this.legendBox.innerHTML = `
      ${row('probiotic', 'Good Bacteria', live?.probiotics ?? [], baseline.probiotics)}
      ${prebioticBlock}
      ${row('pathogen', 'Pathogens', live?.pathogens ?? [], baseline.pathogens)}
      ${row('allergen', 'Allergens', live?.allergens ?? [], baseline.allergens)}
      <div class="bd-legend__note">${note}</div>
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
      this.clearActionBadge();
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
    const live = summarizeLiveStrains(snap.nodes);

    const probioticStrainCount = live.probiotics.length;
    const probioticLabel =
      probioticStrainCount > 1
        ? `${probioticStrainCount} strains · ${formatPopulation(b.probioticCount)}`
        : formatPopulation(b.probioticCount);
    this.probioticStat.textContent = `${probioticLabel} ${trendLabel(trends.probiotic)}`;
    this.pathogenStat.textContent = `${formatPopulation(b.pathogenCount)} ${trendLabel(trends.pathogen)}`;
    this.allergenStat.textContent = `${formatPopulation(b.allergenCount)} ${trendLabel(trends.allergen)}`;
    this.commensalStat.textContent = `${formatPopulation(b.commensalCount)} ${trendLabel(trends.commensal)}`;
    this.biofilmStat.textContent = `${Math.round(b.biofilm * 100)}%`;

    const prebioticStrainCount = live.prebiotics.length;
    const prebioticCountLabel =
      prebioticStrainCount > 1
        ? `${prebioticStrainCount} types · ${formatPopulation(b.prebioticCount)}`
        : formatPopulation(b.prebioticCount);
    const substratePct = Math.round(b.prebioticSubstrateLevel * 100);
    const prebioticValue =
      b.prebioticCount > 0
        ? `${prebioticCountLabel} · ${substratePct}% left ${trendLabel(trends.prebiotic)}`
        : `${prebioticCountLabel} ${trendLabel(trends.prebiotic)}`;
    this.prebioticStat.textContent = prebioticValue;

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

    if (this.microActive) {
      this.updateLegendFromSimulation(getRegion(this.currentRegion), snap.nodes);
    }

    const allEvents = engine.getEvents();
    this.cachedEvents = allEvents;
    const visibleEvents = this.eventLogExpanded ? allEvents : allEvents.slice(-8);
    const hiddenCount = allEvents.length - 8;

    this.eventLogCount.textContent =
      allEvents.length > 0 ? `${allEvents.length} events` : '';
    this.eventLogExpandBtn.hidden = hiddenCount <= 0;
    if (hiddenCount <= 0) {
      this.eventLogExpanded = false;
      this.eventLog.classList.remove('bd-event-log--expanded');
      this.eventLogExpandBtn.textContent = 'Show all';
    }

    this.eventLogList.innerHTML = [...visibleEvents]
      .reverse()
      .map((e, i) => {
        const t = ((snap.tick - i * 10) / 30).toFixed(1);
        const isNew = allEvents.length !== this.lastEventCount && i === 0;
        return `<li class="${isNew ? 'bd-event--new' : ''}"><time>${t}s</time> ${e}</li>`;
      })
      .join('');
    this.lastEventCount = allEvents.length;

    this.fpsBadge.textContent = `${fps} FPS`;
    this.engineBadge.textContent = `ENGINE: DETERMINISTIC · ${fps >= 55 ? '60' : fps} FPS TARGET`;
  }

  private exportEventLog() {
    if (this.cachedEvents.length === 0) return;

    const preset = PRESETS[this.currentPreset];
    const region = getRegion(this.currentRegion);
    const header = [
      'Bio-Dynamics Event Log Export',
      `Preset: ${preset.title}`,
      `Region: ${region.label}`,
      `Context: ${this.context ?? 'standard'}`,
      `Exported: ${new Date().toISOString()}`,
      '',
    ];

    const body = this.cachedEvents.map((text, i) => {
      const t = ((i * 10) / 30).toFixed(1);
      return `[${t}s] ${text}`;
    });

    const blob = new Blob([header.concat(body).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `microbiome-lab-${this.currentPreset}-${this.currentRegion}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
