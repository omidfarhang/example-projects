export function labControlsPartial(): string {
  return `
      <div class="bd-controls bd-controls--lab">
        <div class="bd-panel bd-env">
          <div class="bd-env-header">
            <h2>ENVIRONMENTAL VARIABLES</h2>
            <label class="bd-advanced-toggle" title="Show cited pH bands, immune proxy, and diet timeline">
              <input type="checkbox" data-advanced-mode /> Advanced
            </label>
          </div>
          <p class="bd-env-hint" data-env-hint>Region-specific tissue conditions</p>
          <p class="bd-advanced-disclaimer" data-advanced-disclaimer hidden></p>
          <div class="bd-env-grid" data-env-panel></div>
          <div class="bd-advanced-day" data-day-sim-panel hidden>
            <h3 class="bd-subheading">Day simulation</h3>
            <p class="bd-section-hint" data-day-sim-hint>Step through meals — each adds sugar load on gut/oral tissues</p>
            <p class="bd-day-status" data-day-status></p>
            <div class="bd-btn-row bd-btn-row--meals" data-meals></div>
          </div>
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
      </div>`;
}
