import { Marked, Renderer } from 'marked';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function safeUrl(value) {
  try {
    const url = new URL(String(value), 'https://cenz.blog');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const renderer = new Renderer();
renderer.html = raw => escapeHtml(raw);
renderer.link = (href, title, text) => {
  if (!safeUrl(href)) return text;
  return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}>${text}</a>`;
};
renderer.image = (href, title, text) => {
  if (!safeUrl(href)) return escapeHtml(text);
  return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''}>`;
};

const marked = new Marked({ gfm: true, renderer });

export function renderMarkdown(source) {
  return marked.parse(String(source ?? ''));
}
