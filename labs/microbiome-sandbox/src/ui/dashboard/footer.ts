import { t } from '../../i18n';

export function dashboardFooterPartial(): string {
  return `
      <footer class="bd-footer">
        <span class="bd-badge" data-engine>${t('footer.engine', { fps: '60' })}</span>
        <span class="bd-badge" data-fps>— FPS</span>
        <a href="https://omid.dev/posts/" target="_blank" rel="noopener">${t('footer.techBlog')}</a>
        <a href="https://github.com/omidfarhang/example-projects/tree/master/labs/microbiome-sandbox" target="_blank" rel="noopener">${t('footer.sourceCode')}</a>
        <span class="bd-disclaimer">${t('footer.disclaimer')}</span>
        <span class="bd-disclaimer bd-disclaimer--advanced" data-advanced-footer-note hidden>${t('footer.advancedNote')}</span>
      </footer>`;
}
