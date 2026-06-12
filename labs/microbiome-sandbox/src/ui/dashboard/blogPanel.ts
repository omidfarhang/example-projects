import { POPULATION_SCALE } from '../../sim/engine';
import { t } from '../../i18n';

export function blogPanelPartial(): string {
  return `
        <aside class="bd-panel bd-blog">
          <label class="bd-label">${t('preset.label')}</label>
          <select class="bd-select" data-preset>
            <option value="allergy">Allergy & Barrier Defense</option>
            <option value="candida">Candida & pH Balance</option>
            <option value="lifecycle">Biotic Lifecycle Sandbox</option>
          </select>
          <div class="bd-context-field" data-context-field hidden>
            <label class="bd-label">${t('preset.variant')}</label>
            <select class="bd-select" data-context>
              <option value="">${t('preset.standard')}</option>
              <option value="lifestage">${t('preset.lifestage')}</option>
            </select>
          </div>
          <h2 data-preset-title>Preset</h2>
          <p class="bd-scenario" data-scenario></p>
          <a class="bd-cta" data-blog-cta href="#" target="_blank" rel="noopener">${t('preset.readArticle', { title: '…' })}</a>
          <div class="bd-stats" aria-label="${t('stats.title')}">
            <h3>${t('stats.title')}</h3>
            <div class="bd-meter">
              <label>${t('stats.integrity')} <span data-integrity-val>85%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--integrity" data-integrity-meter></div></div>
            </div>
            <div class="bd-meter">
              <label>${t('stats.inflammation')} <span data-inflammation-val>10%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--inflammation" data-inflammation-meter></div></div>
            </div>
            <div class="bd-meter bd-meter--advanced" data-immune-row hidden>
              <label>${t('stats.immune')} <span data-immune-val title="Simplified cytokine / macrophage proxy — lags inflammation">8%</span></label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--immune" data-immune-meter></div></div>
            </div>
            <div class="bd-stat bd-stat--advanced" data-sugar-row hidden>
              <span>${t('stats.sugarLoad')}</span><strong data-sugar-load title="Dietary substrate — decays over time; meals add load in day simulation">0%</strong>
            </div>
            <div class="bd-stat">
              <span>${t('stats.probiotics')}</span>
              <strong data-probiotic title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</strong>
            </div>
            <div class="bd-stat">
              <span>${t('stats.pathogens')}</span>
              <strong data-pathogen title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</strong>
            </div>
            <div class="bd-stat">
              <span>${t('stats.allergens')}</span>
              <strong data-allergen title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</strong>
            </div>
            <div class="bd-stat" data-commensal-row hidden>
              <span>${t('stats.commensals')}</span>
              <strong data-commensal title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</strong>
            </div>
            <div class="bd-stat" data-biofilm-row hidden><span>${t('stats.biofilm')}</span><strong data-biofilm>0%</strong></div>
            <div class="bd-stat bd-stat--prebiotic" data-prebiotic-stat-row hidden>
              <span>${t('stats.prebiotic')}</span>
              <strong data-prebiotic-stat title="Fiber particles in the lumen; % remaining drops as probiotics convert substrate to SCFA">0 →</strong>
            </div>
            <div class="bd-stat" data-postbiotic-row hidden><span>${t('stats.postbiotic')}</span><strong data-postbiotic>0%</strong></div>
            <p class="bd-scale-footnote" data-population-scale-note title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">
              ${t('stats.populationScaleNote', { scale: POPULATION_SCALE })}
            </p>
          </div>
          <div class="bd-event-log" aria-label="${t('eventLog.title')}">
            <div class="bd-event-log__header">
              <h3>${t('eventLog.title')}</h3>
              <div class="bd-event-log__actions">
                <span class="bd-event-log__count" data-event-log-count aria-live="polite"></span>
                <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-event-log-expand hidden>${t('eventLog.showAll')}</button>
                <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-event-log-export title="${t('eventLog.exportTitle')}">${t('eventLog.export')}</button>
              </div>
            </div>
            <ul data-event-log role="log" aria-live="polite" aria-relevant="additions"></ul>
          </div>
        </aside>`;
}
