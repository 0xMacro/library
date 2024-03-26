import marked from 'marked'
import { topicById, headerById } from './learnevm-chapters.mjs'

export * from './learnevm-chapters.mjs'

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
// Markdown: Add hoverable anchor links to headings
//
const originalHeadingRenderer = renderer.heading
renderer.heading = function (text, level, raw, slugger) {
  const id = this.options.headerPrefix + slugger.slug(
    raw.replace(/^\d+\. */, '') // Strip leading index numbers, e.g. "1. The Subject"
  )
  return `<h${level} id="${id}" class="relative group">
    <span class="HeadingAnchorWrap group-hover:opacity-100">
      <a href="#${id}" class="HeadingAnchor">#</a>
    </span>
    ${text}
  </h${level}>\n`
}


export function renderChapterContent(source) {
  return marked.marked(source, { renderer })
    .replace(/<aside>(.*?)<\/aside>/g, (_, body) => wrapAside(body))
    .replace(/<chapter>(.*?)<\/chapter>/g, (_, body) => renderChapterLink(...body.trim().split('#')))
    .replace(/<chapter href="(.+?)">(.*?)<\/chapter>/g, (_, href, body) => renderCustomChapterLink(href, body.trim()))
    .replace(/<toc>(.*?)<\/toc>/g, (_, body) => renderTocLink(body.trim()))
}

function wrapAside(body) {
  return (
`<aside>
  <div class="AsideContent">
    <!-- Heroicon name: information-circle -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>
    <div>${marked.parseInline(body)}</div>
  </div>
</aside>
`
  )
}

function renderChapterLink(id, hash) {
  const topic = topicById[id]
  const header = headerById[id]
  if (!header.href) {
    return `<span class="ChapterLink -coming-soon"><span class="emoji">${
      topic.emoji
    }</span>&nbsp;<span class="title">${
      header.title
    }</span>
    <span class="coming-soon">(coming soon)</span></span>`
  }
  else {
    return `<span class="ChapterLink" href="${header.href}"><span class="emoji">${
      topic.emoji
    }</span>&nbsp;<a href="${header.href}${hash ? '#'+hash : ''}" class="title">${
      header.title
    }</a></span>`
  }
}

function renderCustomChapterLink(href, text) {
  const [id, hash] = href.split('#')
  const topic = topicById[id]
  const header = headerById[id]

  if (!header.href) {
    throw new Error(`[renderCustomChapterLink] No href set for '${id}'`)
  }

  return `<a href="${header.href}${hash ? '#'+hash : ''}">${text}</a>`
}

function renderTocLink(title) {
  // Create a new slugger each time
  // (slugging mutates state; seeing a title more than once will cause it to append unwanted numerals)
  const id = new marked.Slugger().slug(title)
  return `<a href="#${id}">${title}</a>`
}
