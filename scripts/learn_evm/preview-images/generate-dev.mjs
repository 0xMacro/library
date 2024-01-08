import { generateCss, generateHtml } from './lib.mjs'

generateCss().then(
  css => {
    console.log(generateHtml({ css, title: 'A Title For Local Development', subtitle: '🔩 ABI Encoding – ⚙️ localhost' }))
  },
  () => process.exit(1),
)
