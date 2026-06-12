import { POPULATION_SCALE } from '../../sim/engine';
import { t } from '../../i18n';

export function blogPanelPartial(): string {
  return `
        <aside class="bd-panel bd-blog" aria-label="${t('stats.title')}">
          <div class="bd-stats" aria-label="${t('stats.title')}">
            <h3>${t('stats.title')}</h3>

            <p class="bd-stats__section">${t('stats.sectionBarrier')}</p>
            <div class="bd-meter bd-meter--hero">
              <label>
                <span class="bd-meter__name">${t('stats.integrity')}</span>
                <span class="bd-meter__value" data-integrity-val>85%</span>
              </label>
              <div class="bd-meter__track bd-meter__track--hero"><div class="bd-meter__fill bd-meter__fill--integrity" data-integrity-meter></div></div>
            </div>
            <div class="bd-meter bd-meter--hero">
              <label>
                <span class="bd-meter__name">${t('stats.inflammation')}</span>
                <span class="bd-meter__value" data-inflammation-val>10%</span>
              </label>
              <div class="bd-meter__track bd-meter__track--hero"><div class="bd-meter__fill bd-meter__fill--inflammation" data-inflammation-meter></div></div>
            </div>
            <div class="bd-meter">
              <label>
                <span class="bd-meter__name">${t('stats.biofilm')}</span>
                <span class="bd-meter__value" data-biofilm-val>0%</span>
              </label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--biofilm" data-biofilm-meter></div></div>
            </div>

            <p class="bd-stats__section">${t('stats.sectionMicrobes')}</p>
            <div class="bd-meter">
              <label>
                <span class="bd-meter__name">${t('stats.probiotics')}</span>
                <span class="bd-meter__value" data-probiotic-val>0</span>
              </label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--probiotic" data-probiotic-meter></div></div>
              <span class="bd-meter__detail" data-probiotic title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</span>
            </div>
            <div class="bd-meter">
              <label>
                <span class="bd-meter__name">${t('stats.pathogens')}</span>
                <span class="bd-meter__value" data-pathogen-val>0</span>
              </label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--pathogen" data-pathogen-meter></div></div>
              <span class="bd-meter__detail" data-pathogen title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</span>
            </div>
            <div class="bd-meter">
              <label>
                <span class="bd-meter__name">${t('stats.allergens')}</span>
                <span class="bd-meter__value" data-allergen-val>0</span>
              </label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--allergen" data-allergen-meter></div></div>
              <span class="bd-meter__detail" data-allergen title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</span>
            </div>
            <div class="bd-meter" data-commensal-row hidden>
              <label>
                <span class="bd-meter__name">${t('stats.commensals')}</span>
                <span class="bd-meter__value" data-commensal-val>0</span>
              </label>
              <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--commensal" data-commensal-meter></div></div>
              <span class="bd-meter__detail" data-commensal title="${t('stats.populationScaleTitle', { scale: POPULATION_SCALE })}">0 →</span>
            </div>

            <div data-lifecycle-section hidden>
              <p class="bd-stats__section">${t('stats.sectionLifecycle')}</p>
              <div class="bd-meter" data-prebiotic-stat-row hidden>
                <label>
                  <span class="bd-meter__name">${t('stats.prebiotic')}</span>
                  <span class="bd-meter__value" data-prebiotic-val>0%</span>
                </label>
                <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--prebiotic" data-prebiotic-meter></div></div>
                <span class="bd-meter__detail" data-prebiotic-stat title="Fiber particles in the lumen; % remaining drops as probiotics convert substrate to SCFA">0 →</span>
              </div>
              <div class="bd-meter" data-postbiotic-row hidden>
                <label>
                  <span class="bd-meter__name">${t('stats.postbiotic')}</span>
                  <span class="bd-meter__value" data-postbiotic-val>0%</span>
                </label>
                <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--postbiotic" data-postbiotic-meter></div></div>
                <span class="bd-meter__detail" data-postbiotic>SCFA metabolites in lumen</span>
              </div>
              <div class="bd-meter" data-tryptophan-row hidden title="${t('stats.tryptophanSupportTitle')}">
                <label>
                  <span class="bd-meter__name">${t('stats.tryptophanSupport')}</span>
                  <span class="bd-meter__value" data-tryptophan-val>0%</span>
                </label>
                <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--tryptophan" data-tryptophan-meter></div></div>
                <span class="bd-meter__detail" data-tryptophan>Gut-brain educational proxy</span>
              </div>
            </div>

            <div data-advanced-section hidden>
              <p class="bd-stats__section">${t('stats.sectionAdvanced')}</p>
              <div class="bd-meter bd-meter--advanced" data-immune-row hidden>
                <label>
                  <span class="bd-meter__name">${t('stats.immune')}</span>
                  <span class="bd-meter__value" data-immune-val title="Simplified cytokine / macrophage proxy — lags inflammation">8%</span>
                </label>
                <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--immune" data-immune-meter></div></div>
              </div>
              <div class="bd-meter bd-meter--advanced" data-sugar-row hidden>
                <label>
                  <span class="bd-meter__name">${t('stats.sugarLoad')}</span>
                  <span class="bd-meter__value" data-sugar-val>0%</span>
                </label>
                <div class="bd-meter__track"><div class="bd-meter__fill bd-meter__fill--sugar" data-sugar-meter></div></div>
                <span class="bd-meter__detail" data-sugar-load title="Dietary substrate — decays over time; meals add load in day simulation">0%</span>
              </div>
            </div>

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
