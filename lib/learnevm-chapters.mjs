export const outline = [
  {
    emoji: '🗺',
    title: 'Introduction to the EVM',
    headers: [
      { id: 'intro/overview',  href: '/chapters/intro/overview', title: 'Why Learn the EVM?', subtitle: 'What the EVM is and why you should learn it.' },
      { id: 'intro/about',     href: '/chapters/intro/about', title: 'About This Course', subtitle: 'What to expect out of this course and how to navigate it.' },
      { id: 'intro/demystify', href: '/chapters/intro/demystifying-evm-opcodes', title: 'Demystifying EVM Opcodes', subtitle: 'A primer for what you will learn in this course.' },
    ]
  },
  {
    emoji: '🤖',
    title: 'The VM in EVM',
    headers: [
      { id: 'vm/overview', href: '/chapters/vm/overview', title: 'The Ethereum Virtual Machine', subtitle: 'What a virtual machine is and how it differs from an actual machine.' },
      { id: 'vm/why',      href: '', title: 'Why the EVM is important to Web3', subtitle: 'All the ways the industry is using, adopting, and extending the EVM.' },
    ]
  },
  {
    emoji: '🧱',
    title: 'EVM Fundamentals',
    headers: [
      { id: 'evm/overview', href: '/chapters/evm/overview', title: 'The Execution Environment', subtitle: 'How and why context matters.' },
      { id: 'evm/binary',   href: '/chapters/evm/binary', title: 'Binary and Types', subtitle: 'How the EVM sees and works with real data.' },
      { id: 'evm/stack',    href: '/chapters/evm/stack', title: 'Working with the Stack', subtitle: 'The central structure of all operations.' },
      { id: 'evm/memory',   href: '/chapters/evm/memory', title: 'Working with Memory', subtitle: 'When your data is too large to fit onto the stack.' },
      { id: 'evm/storage',  href: '/chapters/evm/storage', title: 'Working with Contract Storage', subtitle: 'The method and costs to contract data persistence.' },
    ]
  },
  {
    emoji: '☎️',
    title: 'EVM Function Calls',
    headers: [
      { id: 'fn/contexts',  href: '', title: 'How EVM Function Calls Work', subtitle: 'The entire process at a high level.' },
      { id: 'fn/calldata',  href: '/chapters/fn/calldata', title: 'EVM Calldata', subtitle: 'Details on the format of function call inputs.' },
      { id: 'fn/call',      href: '', title: 'The CALL opcode', subtitle: 'The foundation of contract-to-contract communication.' },
      { id: 'fn/opcodes',   href: '', title: 'CALL vs STATICCALL vs DELEGATECALL', subtitle: 'Similar functionality, more secure.' },
      { id: 'fn/built-ins', href: '', title: 'Built-in EVM Functions', subtitle: 'Contract functions that were baked into the chain.' },
    ]
  },
  {
    emoji: '🚀',
    title: 'Contract Deployment',
    headers: [
      { id: 'deploy/overview', href: '', title: 'How Contract Deployment Works', subtitle: 'The somewhat unintuitive way the EVM handles contract deployments.' },
      { id: 'deploy/eoa',      href: '', title: 'Deploying via an EOA Transaction', subtitle: 'How the ecosystem of smart contracts began.' },
      { id: 'deploy/create',   href: '', title: 'Deploying via the CREATE Opcode', subtitle: 'Contracts deploying contracts.' },
      { id: 'deploy/create2',  href: '', title: 'CREATE vs CREATE2', subtitle: 'The advantages and security implications of the newer EVM opcode.' },
      { id: 'deploy/multisig', href: '', title: 'Deployment Through a Multisig', subtitle: 'An advanced way to deploy contracts, with some Solidity-specific details.' },
    ]
  },
  {
    emoji: '🔩',
    title: 'ABI Encoding',
    headers: [
      { id: 'abi/overview', href: '/chapters/abi-encoding/why-learn', title: 'Why Learn ABI Encoding?', subtitle: 'The standardizing data encoding that is used everywhere.' },
      { id: 'abi/anatomy',  href: '/chapters/abi-encoding/anatomy', title: 'The Anatomy of an ABI-Encoded Function Call', subtitle: 'Understand how contracts talk to each other.' },
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
      { id: 'solidity/storage-slots', href: '', title: 'How Solidity Storage Slots Work', subtitle: 'Learn how Solidity chooses storage keys and compacts storage data.' },
      { id: 'solidity/mappings',      href: '', title: 'How Solidity Implements Mappings', subtitle: 'Why you can\'t iterate a mapping\'s keys.' },
      { id: 'solidity/strings',       href: '', title: 'How Solidity Implements Strings and Bytes', subtitle: 'How strings vary in number of words required.' },
      { id: 'solidity/arrays',        href: '', title: 'How Solidity Implements Arrays', subtitle: 'How dynamic arrays can exist in storage.' },
      { id: 'solidity/memory',        href: '', title: 'How Solidity Manages Memory', subtitle: 'Interesting facts about Solidity\'s memory management.' },
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
