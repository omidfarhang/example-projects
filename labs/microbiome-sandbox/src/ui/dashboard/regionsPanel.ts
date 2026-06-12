export function regionsPanelPartial(): string {
  return `
        <aside class="bd-panel bd-regions">
          <h2>BODY-MAP REGION SELECTOR</h2>
          <ul class="bd-region-list" data-region-list></ul>
          <button type="button" class="bd-btn bd-btn--ghost bd-back" data-back hidden>← Back to body</button>
        </aside>`;
}
