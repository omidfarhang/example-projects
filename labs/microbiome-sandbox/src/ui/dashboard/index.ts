import { blogPanelPartial } from './blogPanel';
import { labControlsPartial } from './controls';
import { dashboardFooterPartial } from './footer';
import { dashboardHeaderPartial } from './header';
import { presetBarPartial } from './presetPanel';
import { regionsPanelPartial } from './regionsPanel';
import { viewportPartial } from './viewport';

/** Composed dashboard shell — partials keep markup maintainable (ENG-02). */
export function renderDashboardShell(): string {
  return [
    dashboardHeaderPartial(),
    presetBarPartial(),
    `<div class="bd-grid">`,
    regionsPanelPartial(),
    viewportPartial(),
    blogPanelPartial(),
    `</div>`,
    labControlsPartial(),
    dashboardFooterPartial(),
  ].join('\n');
}
