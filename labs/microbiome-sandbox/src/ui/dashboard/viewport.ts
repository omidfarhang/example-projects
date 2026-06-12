import { touchHintsPartial } from './touchHints';

export function viewportPartial(): string {
  return `
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
            ${touchHintsPartial()}
            <div class="bd-legend-box" data-legend-box hidden></div>
            <div class="bd-callout" data-callout hidden>INFLAMMATION SPIKE</div>
          </div>
        </section>`;
}
