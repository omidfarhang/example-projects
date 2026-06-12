import { t } from '../../i18n';
import { touchHintsPartial } from './touchHints';

export function viewportPartial(): string {
  return `
        <section class="bd-viewport-wrap">
          <div class="bd-viewport" data-viewport role="img" aria-label="${t('viewport.fullBodyTitle')}">
            <canvas data-canvas aria-hidden="true"></canvas>
            <div class="bd-hotspot-layer" data-hotspot-layer aria-hidden="true"></div>
            <div class="bd-tissue-callout-layer" data-tissue-callouts hidden aria-hidden="true"></div>
            <div class="bd-zoom-hud" data-zoom-hud>
              <span class="bd-mode-badge" data-mode-badge>${t('viewport.bodyMap')}</span>
              <span class="bd-action-badge" data-action-badge hidden></span>
              <div class="bd-micro-banner" data-micro-banner hidden role="status"></div>
              <div class="bd-tissue-pictogram" data-tissue-pictogram hidden aria-hidden="true"></div>
              <h2 class="bd-zoom-title" data-zoom-title>${t('viewport.fullBodyTitle')}</h2>
              <span class="bd-scale-label" data-scale-label></span>
            </div>
            <div class="bd-preset-tip" data-preset-tip role="note">
              <p class="bd-preset-tip__text" data-preset-tip-text></p>
              <button type="button" class="bd-preset-tip__dismiss" data-preset-tip-dismiss aria-label="${t('tips.dismiss')}">×</button>
            </div>
            ${touchHintsPartial()}
            <div class="bd-legend-box" data-legend-box hidden></div>
            <div class="bd-callout" data-callout hidden role="alert">${t('viewport.inflammationSpike')}</div>
          </div>
          <div class="bd-sr-only" aria-live="polite" aria-atomic="true" data-live-announcer></div>
        </section>`;
}
