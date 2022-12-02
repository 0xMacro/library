import marked from 'marked'

const renderer = new marked.Renderer({
  gfm: true
})

//
// Markdown: Open external links in new pages
//
const originalLinkRenderer = renderer.link
renderer.link = function (href, title, text) {
  const isLocal = href.startsWith(`/`) || href.startsWith(`https://learnevm.com`)
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
      { id: 'vm',     href: '', title: 'The Virtual Machine', subtitle: 'What a virtual machine is and how it differs from an actual machine.' },
      { id: 'vm/why', href: '', title: 'Why the EVM is important to Web3', subtitle: 'All the ways the industry is using, adopting, and extending the EVM.' },
    ]
  },
  {
    emoji: '🧱',
    title: 'EVM Fundamentals',
    headers: [
      { id: 'evm/overview', href: '', title: 'The EVM\'s Execution Environment', subtitle: 'How and why context matters.' },
      { id: 'evm/binary',   href: '', title: 'Binary and Types in the EVM', subtitle: 'How the EVM sees and works with real data.' },
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
      { id: 'fn/static',    href: '', title: 'CALL vs STATICCALL', subtitle: 'Similar functionality, more secure.' },
      { id: 'fn/delegate',  href: '', title: 'CALL vs DELEGATECALL', subtitle: 'Similar functionalities, very different features.' },
      { id: 'fn/built-ins', href: '', title: 'Built-in EVM Functions', subtitle: 'Contract functions that were baked into the chain.' },
    ]
  },
  {
    emoji: '🔩',
    title: 'ABI Encoding',
    headers: [
      { id: 'abi/overview', href: '', title: 'Convention over Configuration', subtitle: 'The benefits of standardizing data encoding.' },
      { id: 'abi/encoding', href: '', title: 'Encoding Function Calls and Arguments', subtitle: 'A tutorial on how function call data gets encoded.' },
      { id: '1.1', href: '', title: 'Decoding Function Calls', subtitle: 'How decoding arguments works at the opcode level.' },
    ]
  },
  {
    emoji: '⚙️',
    title: 'Writing Smart Contracts in Opcodes',
    headers: [
      { id: 'raw/simplest', href: '', title: 'The Simplest Smart Contract', subtitle: 'No solidity required.' },
      { id: 'raw/greeter', href: '', title: 'The Greeter Contract', subtitle: 'A reimplementation of the classic generated contract.' },
      { id: 'raw/internal', href: '', title: 'Internal Function Calls', subtitle: 'How internal function calls are implemented in Solidity.' },
    ]
  },
  {
    emoji: '💠',
    title: 'Solidity EVM Internals',
    headers: [
      { id: 'solidity/storage-solts', href: '', title: 'How Storage Slots Work', subtitle: 'Learn how Solidity chooses storage keys.' },
      { id: 'solidity/mappings', href: '', title: 'How Solidity Implements Mappings', subtitle: 'Why you can\'t iterate a mapping\'s keys.' },
      { id: 'solidity/arrays', href: '', title: 'How Solidity Implements Arrays', subtitle: 'How dynamic arrays can exist in storage.' },
    ]
  },
]

//
// Populate convenience fields
//
{
  let prev = null
  for (let header of outline.flatMap(topic => topic.headers)) {
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
export const headerByHref = {}
export const topicByHref = {}

for (let topic of outline) {

  for (let header of topic.headers) {
    if (!header.href) continue

    topicByHref[header.href] = topic
    headerByHref[header.href] = header
  }
}
