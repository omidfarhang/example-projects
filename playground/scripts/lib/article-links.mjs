import { escapeHtml } from './theme.mjs';

export function renderArticleContextLine(articles) {
  if (articles.length === 0) {
    return '';
  }
  if (articles.length === 1) {
    return `From article: ${escapeHtml(articles[0].title)}`;
  }
  const labels = articles.map((entry) => escapeHtml(entry.label)).join(' · ');
  return `Companion for ${labels}`;
}

export function renderCardArticleLine(articles) {
  if (articles.length === 0) {
    return '';
  }
  if (articles.length === 1) {
    return `<p class="card__article">Article: <a href="${escapeHtml(articles[0].url)}">${escapeHtml(articles[0].title)}</a></p>`;
  }
  const links = articles
    .map((entry) => `<a href="${escapeHtml(entry.url)}">${escapeHtml(entry.label)}</a>`)
    .join(' · ');
  return `<p class="card__article">Articles: ${links}</p>`;
}

function renderArticlesDropdown(articles, classes) {
  const items = articles
    .map(
      (entry) =>
        `<a class="${classes.item}" href="${escapeHtml(entry.url)}" role="menuitem">${escapeHtml(entry.title)}</a>`,
    )
    .join('');

  return `
        <details class="${classes.menu}">
          <summary class="${classes.summary}">Articles</summary>
          <div class="${classes.panel}" role="menu">${items}</div>
        </details>`;
}

/** Toolbar or card action: Read article link, or Articles dropdown. */
export function renderArticleActionControl(articles, classes) {
  if (articles.length === 0) {
    return '';
  }
  if (articles.length === 1) {
    return `<a class="${classes.single}" href="${escapeHtml(articles[0].url)}">Read article</a>`;
  }
  return renderArticlesDropdown(articles, classes);
}
