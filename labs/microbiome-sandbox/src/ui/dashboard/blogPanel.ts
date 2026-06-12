export function blogPanelPartial(): string {
  return `
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
            <div class="bd-meter bd-meter--advanced" data-immune-row hidden>
              <label>Immune activity <span data-immune-val title="Simplified cytokine / macrophage proxy — lags inflammation">8%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--immune" data-immune-meter></div></div>
            </div>
            <div class="bd-stat bd-stat--advanced" data-sugar-row hidden>
              <span>Sugar load</span><strong data-sugar-load title="Dietary substrate — decays over time; meals add load in day simulation">0%</strong>
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
        </aside>`;
}
