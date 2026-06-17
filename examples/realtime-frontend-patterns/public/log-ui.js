export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function setStatus(el, state, label) {
  el.textContent = label;
  el.className = `status-badge status-badge--${state}`;
}

function formatLogBody(data) {
  const { type, ...rest } = data;
  if (Object.keys(rest).length === 0) {
    return '';
  }
  return escapeHtml(JSON.stringify(rest));
}

export function appendLog(list, text) {
  const item = document.createElement('li');

  try {
    const data = JSON.parse(text);
    const type = data.type ?? 'message';
    const body = formatLogBody(data);

    item.innerHTML = body
      ? `<span class="log-entry__type">${escapeHtml(type)}</span><span class="log-entry__body">${body}</span>`
      : `<span class="log-entry__type">${escapeHtml(type)}</span>`;
  } catch {
    item.textContent = text;
  }

  list.prepend(item);
}
