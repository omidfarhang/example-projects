export function dashboardFooterPartial(): string {
  return `
      <footer class="bd-footer">
        <span class="bd-badge" data-engine>ENGINE: DETERMINISTIC · 60 FPS</span>
        <span class="bd-badge" data-fps>— FPS</span>
        <a href="https://omid.dev/posts/" target="_blank" rel="noopener">Tech Blog</a>
        <a href="https://github.com/omidfarhang/example-projects/tree/master/labs/microbiome-sandbox" target="_blank" rel="noopener">Source Code</a>
        <span class="bd-disclaimer">Educational model — not medical advice</span>
      </footer>`;
}
