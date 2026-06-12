import { t } from '../../i18n';

export function dashboardHeaderPartial(): string {
  return `
      <header class="bd-header">
        <h1>${t('header.title')}</h1>
        <label class="bd-lang-select">
          <span class="bd-sr-only">${t('lang.label')}</span>
          <select data-lang aria-label="${t('lang.label')}">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fa">فارسی</option>
          </select>
        </label>
      </header>`;
}
