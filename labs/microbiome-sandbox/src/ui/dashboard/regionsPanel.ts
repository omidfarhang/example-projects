import { t } from '../../i18n';

export function regionsPanelPartial(): string {
  return `
        <aside class="bd-panel bd-regions" aria-label="${t('regions.title')}">
          <h2>${t('regions.title')}</h2>
          <p class="bd-keyboard-hint" data-keyboard-hint>${t('regions.keyboardHint')}</p>
          <ul class="bd-region-list" data-region-list role="listbox" aria-label="${t('regions.title')}"></ul>
          <button type="button" class="bd-btn bd-btn--ghost bd-back" data-back hidden>${t('regions.back')}</button>
        </aside>`;
}
