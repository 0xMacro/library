import endent from 'endent'
import * as Issues from './lib/issues'
import * as AuditMarkdown from './lib/audit-markdown'
// import * as LearnEVM from './lib/learnevm'

export default {
  name: "The 0xMacro Library",
  locales: ['en'],

  static: true,

  // These are to get @ethereumjs/vm working in the browser
  bundleAliases: {
    'crypto': 'npm:crypto-browserify',
    'fs': 'npm:browserify-fs',
    'path': 'npm:path-browserify',
    'stream': 'npm:stream-browserify',
    'immediate': 'npm:immediate', // No idea why this is needed, probably esbuild related
  },

  jsxFactory: 'm',
  jsxFragment: '"["',

  locals: {
    Issues,
    AuditMarkdown,
  },

  templateTypes: {
    'file-hashes': require('./lib/file-hashes'),
    'audit-markdown'(content) {
      return AuditMarkdown.renderIssueContent(endent(content))
    }
  },
}
