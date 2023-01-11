import marked from 'marked'

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
  const id = this.options.headerPrefix + slugger.slug(raw)
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
    .replace(/<chapter>(.*?)<\/chapter>/g, (_, body) => renderChapterLink(body.trim()))
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

function renderChapterLink(id) {
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
    }</span>&nbsp;<a href="${header.href}" class="title">${
      header.title
    }</a></span>`
  }
}

function renderTocLink(title) {
  // Create a new slugger each time
  // (slugging mutates state; seeing a title more than once will cause it to append unwanted numerals)
  const id = new marked.Slugger().slug(title)
  return `<a href="#${id}">${title}</a>`
}

export const outline = [
  {
    emoji: '🗺',
    title: 'Introduction to the EVM',
    headers: [
      { id: 'intro/overview', href: '/chapters/intro/overview', title: 'Overview', subtitle: 'What the EVM is and why you should learn it.' },
      { id: 'intro/about',    href: '/chapters/intro/about', title: 'About This Course', subtitle: 'What to expect out of this course and how to navigate it.' },
    ]
  },
  {
    emoji: '🤖',
    title: 'The VM in EVM',
    headers: [
      { id: 'vm',     href: '/chapters/vm/overview', title: 'The Virtual Machine', subtitle: 'What a virtual machine is and how it differs from an actual machine.' },
      { id: 'vm/why', href: '', title: 'Why the EVM is important to Web3', subtitle: 'All the ways the industry is using, adopting, and extending the EVM.' },
    ]
  },
  {
    emoji: '🧱',
    title: 'EVM Fundamentals',
    headers: [
      { id: 'evm/overview', href: '/chapters/evm/overview', title: 'The Execution Environment', subtitle: 'How and why context matters.' },
      { id: 'evm/binary',   href: '/chapters/evm/binary', title: 'Binary and Types', subtitle: 'How the EVM sees and works with real data.' },
      { id: 'evm/stack',    href: '', title: 'Working with the Stack', subtitle: 'The central structure of all operations.' },
      { id: 'evm/memory',   href: '', title: 'Working with Memory', subtitle: 'When your data is too large to fit onto the stack.' },
      { id: 'evm/storage',  href: '', title: 'Working with Contract Storage', subtitle: 'The method and costs to contract data persistence.' },
    ]
  },
  {
    emoji: '🚀',
    title: 'Contract Deployment',
    headers: [
      { id: 'deploy/overview', href: '', title: 'The Two-Step Process', subtitle: 'The somewhat unintuitive way the EVM handles contract deployments.' },
      { id: 'deploy/eoa',      href: '', title: 'Deploying via an EOA Transaction', subtitle: 'How the ecosystem of smart contracts began.' },
      { id: 'deploy/create',   href: '', title: 'Deploying via the CREATE Opcode', subtitle: 'Contracts deploying contracts.' },
      { id: 'deploy/create2',  href: '', title: 'CREATE vs CREATE2', subtitle: 'The advantages and security implications of the newer EVM opcode.' },
      { id: 'deploy/multisig', href: '', title: 'Deployment Through a Multisig', subtitle: 'An advanced way to deploy contracts, with some Solidity-specific details.' },
    ]
  },
  {
    emoji: '☎️',
    title: 'EVM Function Calls',
    headers: [
      { id: 'fn/actor',     href: '', title: 'How EVM Function Calls Work', subtitle: 'The entire process at a high level.' },
      { id: 'fn/call',      href: '', title: 'The CALL opcode', subtitle: 'The foundation of contract-to-contract communication.' },
      { id: 'fn/opcodes',   href: '', title: 'CALL vs STATICCALL vs DELEGATECALL', subtitle: 'Similar functionality, more secure.' },
      { id: 'fn/built-ins', href: '', title: 'Built-in EVM Functions', subtitle: 'Contract functions that were baked into the chain.' },
    ]
  },
  {
    emoji: '🔩',
    title: 'ABI Encoding',
    headers: [
      { id: 'abi/overview', href: '/chapters/abi-encoding/why-learn', title: 'Why Learn ABI Encoding?', subtitle: 'The standardizing data encoding that is used everywhere.' },
      { id: 'abi/anatomy',  href: '', title: 'The Anatomy of an ABI-Encoded Function Call', subtitle: 'Understand how contracts talk to each other.' },
      { id: 'abi/encoding', href: '', title: 'ABI Encoding for Common Types', subtitle: 'Learn to see the Matrix.' },
      { id: 'abi/solidity', href: '', title: 'ABI Encoding in Solidity', subtitle: 'How the popular language uses ABIs behind the scenes.' },
      { id: 'abi/decoding', href: '', title: 'Decoding Function Calls in Opcodes', subtitle: 'Demystify them at the lowest level.' },
    ]
  },
  {
    emoji: '⚙️',
    title: 'Writing Smart Contracts in Opcodes',
    headers: [
      { id: 'raw/simplest', href: '', title: 'The Simplest Smart Contract', subtitle: 'Look ma, no solidity!' },
      { id: 'raw/greeter',  href: '', title: 'The Greeter Contract', subtitle: 'A reimplementation of the classic generated contract.' },
      { id: 'raw/internal', href: '', title: 'Internal Function Calls', subtitle: 'How internal function calls are implemented in Solidity.' },
    ]
  },
  {
    emoji: '💠',
    title: 'Solidity EVM Internals',
    headers: [
      { id: 'solidity/storage-solts', href: '', title: 'How Storage Slots Work', subtitle: 'Learn how Solidity chooses storage keys.' },
      { id: 'solidity/mappings',      href: '', title: 'How Solidity Implements Mappings', subtitle: 'Why you can\'t iterate a mapping\'s keys.' },
      { id: 'solidity/arrays',        href: '', title: 'How Solidity Implements Arrays', subtitle: 'How dynamic arrays can exist in storage.' },
    ]
  },
]

export const headers = outline.flatMap(topic => topic.headers)
export const lastHeader = headers[headers.length-1]

//
// Populate convenience fields
//
{
  let prev = null
  for (let header of headers) {
    if (!header.href) continue

    if (prev) {
      header.prev = prev
      prev.next = header
    }
    prev = header
  }
}

//
// Populate and export
//
export const topicById = {}
export const headerById = {}
export const topicByHref = {}
export const headerByHref = {}

for (let topic of outline) {

  for (let header of topic.headers) {
    topicById[header.id] = topic
    headerById[header.id] = header

    if (!header.href) continue

    topicByHref[header.href] = topic
    headerByHref[header.href] = header
  }
}
