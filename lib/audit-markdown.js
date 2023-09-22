import marked from 'marked'

export function renderIssueContent(source) {
  return marked.marked(source, { renderer })
}

export function renderInlineContent(source) {
  return marked.parseInline(source, { renderer })
}

const renderer = new marked.Renderer({
  gfm: true
})

//
// Markdown: Open external links in new pages
//
const originalLinkRenderer = renderer.link
renderer.link = function (href, title, text) {
  const isLocal = href.match(/^[/#]/) || href.startsWith(`https://learnevm.com`)
  const html = originalLinkRenderer.call(renderer, href, title, text)
  return isLocal ? html : html.replace(/^<a /, `<a target="_blank" rel="noreferrer noopener nofollow" `)
}

//
// Markdown: Render table with class we target in copy.css
//
const originalTableRenderer = renderer.table
renderer.table = function (header, body) {
  return `<div class="audit-md-table"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`
}
