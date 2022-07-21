const Issues = require('./lib/issues')
const AuditMarkdown = require('./lib/audit-markdown')

module.exports = {
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
    'file-hashes': require('./lib/file-hashes')
  },
}
