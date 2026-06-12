import { t } from '../../i18n';

/** Full-width preset strip — lives outside the three-column grid so side panels keep natural height. */
export function presetBarPartial(): string {
  return `
      <section class="bd-preset-bar" aria-label="${t('preset.label')}">
        <div class="bd-preset-bar__row">
          <div class="bd-preset-bar__controls">
            <label class="bd-label">${t('preset.label')}</label>
            <select class="bd-select bd-select--compact" data-preset>
              <option value="allergy">Allergy & Barrier Defense</option>
              <option value="candida">Candida & pH Balance</option>
              <option value="lifecycle">Biotic Lifecycle Sandbox</option>
            </select>
            <div class="bd-context-field bd-context-field--inline" data-context-field hidden>
              <label class="bd-label">${t('preset.variant')}</label>
              <select class="bd-select bd-select--compact" data-context>
                <option value="">${t('preset.standard')}</option>
                <option value="lifestage">${t('preset.lifestage')}</option>
              </select>
            </div>
          </div>
          <div class="bd-preset-bar__copy">
            <p class="bd-preset-bar__title" data-preset-title>Preset</p>
            <p class="bd-scenario bd-scenario--bar" data-scenario></p>
          </div>
          <div class="bd-preset-bar__actions">
            <a class="bd-cta bd-cta--compact" data-blog-cta href="#" target="_blank" rel="noopener">${t('preset.readArticle', { title: '…' })}</a>
            <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-copy-lab-state title="${t('session.copyTitle')}">${t('session.copyLink')}</button>
            <span class="bd-share-feedback" data-share-feedback hidden aria-live="polite"></span>
          </div>
        </div>
        <div class="bd-resume-banner bd-resume-banner--bar" data-resume-banner hidden role="status">
          <p data-resume-text></p>
          <div class="bd-resume-banner__actions">
            <button type="button" class="bd-btn bd-btn--action bd-btn--tiny" data-resume-accept>${t('session.resume')}</button>
            <button type="button" class="bd-btn bd-btn--ghost bd-btn--tiny" data-resume-dismiss>${t('session.dismiss')}</button>
          </div>
        </div>
      </section>`;
}
