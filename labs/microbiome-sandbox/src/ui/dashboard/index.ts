import { blogPanelPartial } from './blogPanel';
import { labControlsPartial } from './controls';
import { dashboardFooterPartial } from './footer';
import { dashboardHeaderPartial } from './header';
import { regionsPanelPartial } from './regionsPanel';
import { viewportPartial } from './viewport';

/** Composed dashboard shell — partials keep markup maintainable (ENG-02). */
export function renderDashboardShell(): string {
  return [
    dashboardHeaderPartial(),
    `<div class="bd-grid">`,
    regionsPanelPartial(),
    viewportPartial(),
    blogPanelPartial(),
    `</div>`,
    labControlsPartial(),
    dashboardFooterPartial(),
  ].join('\n');
}
