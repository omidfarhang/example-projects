import { t } from '../../i18n';

export function labControlsPartial(): string {
  return `
      <div class="bd-controls bd-controls--lab">
        <div class="bd-panel bd-env">
          <div class="bd-env-header">
            <h2>${t('env.title')}</h2>
            <label class="bd-advanced-toggle" title="${t('env.advancedTitle')}">
              <input type="checkbox" data-advanced-mode /> ${t('env.advanced')}
            </label>
          </div>
          <p class="bd-env-hint" data-env-hint>${t('env.regionHint', { region: '…' })}</p>
          <p class="bd-advanced-disclaimer" data-advanced-disclaimer hidden></p>
          <div class="bd-env-grid" data-env-panel></div>
          <div class="bd-advanced-day" data-day-sim-panel hidden>
            <h3 class="bd-subheading">${t('env.daySim')}</h3>
            <p class="bd-section-hint" data-day-sim-hint>${t('env.daySimHintGut')}</p>
            <p class="bd-day-status" data-day-status></p>
            <div class="bd-btn-row bd-btn-row--meals" data-meals role="group" aria-label="${t('env.daySim')}"></div>
          </div>
        </div>
        <div class="bd-panel bd-stressors">
          <h2>${t('stressors.title')}</h2>
          <p class="bd-section-hint">${t('stressors.hint')}</p>
          <div class="bd-btn-row bd-btn-row--stressors" data-triggers role="group" aria-label="${t('stressors.title')}"></div>
        </div>
        <div class="bd-panel bd-regional">
          <h2>${t('regional.title')}</h2>
          <p class="bd-section-hint" data-suggested-hint>${t('regional.suggestedHint', { region: '…' })}</p>
          <div class="bd-btn-row bd-btn-row--suggested" data-suggested role="group" aria-label="${t('regional.title')}"></div>
          <div class="bd-regional-care" data-regional-care-section>
            <h3 class="bd-subheading">${t('regional.tissueTreatments')}</h3>
            <div class="bd-btn-row" data-regional-care role="group" aria-label="${t('regional.tissueTreatments')}"></div>
          </div>
        </div>
        <div class="bd-catalog-row">
          <div class="bd-panel bd-catalog">
            <h2>${t('catalog.title')}</h2>
            <p class="bd-section-hint">${t('catalog.hint')}</p>
            <div class="bd-catalog-tabs" role="tablist">
              <button type="button" class="bd-catalog-tab bd-catalog-tab--active" role="tab" data-catalog-tab="products" aria-selected="true">${t('catalog.products')}</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="strains" aria-selected="false">${t('catalog.strains')}</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="prebiotics" aria-selected="false">${t('catalog.prebiotics')}</button>
              <button type="button" class="bd-catalog-tab" role="tab" data-catalog-tab="postbiotics" aria-selected="false">${t('catalog.postbiotics')}</button>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="products">
              <div class="bd-btn-row bd-btn-row--products" data-products role="group" aria-label="${t('catalog.products')}"></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="strains" hidden>
              <div class="bd-btn-row bd-btn-row--dense bd-btn-row--strains" data-strains role="group" aria-label="${t('catalog.strains')}"></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="prebiotics" hidden>
              <div class="bd-btn-row bd-btn-row--prebiotics" data-prebiotics role="group" aria-label="${t('catalog.prebiotics')}"></div>
            </div>
            <div class="bd-catalog-pane" data-catalog-pane="postbiotics" hidden>
              <div class="bd-btn-row bd-btn-row--postbiotics" data-postbiotics role="group" aria-label="${t('catalog.postbiotics')}"></div>
            </div>
          </div>
          <div class="bd-panel bd-impact bd-impact--inline bd-impact--empty" data-impact-panel>
            <div class="bd-impact-toolbar">
              <h3>${t('catalog.impactTitle')}</h3>
              <button type="button" class="bd-impact-close" data-impact-close aria-label="${t('catalog.closePreview')}" hidden>×</button>
            </div>
            <p class="bd-impact-placeholder" data-impact-placeholder>
              ${t('catalog.impactPlaceholder')}
            </p>
            <div class="bd-impact-body" data-impact-body hidden></div>
          </div>
        </div>
      </div>`;
}
