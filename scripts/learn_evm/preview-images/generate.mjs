import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { generatePreviewImage } from './lib.mjs'
import { outline, topicById } from '../../../lib/learnevm-chapters.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const target = process.argv[2]

async function generate() {
  let generatedAtLeastOne = false

  for (let section of outline) {
    for (let chapter of section.headers) {

      if (!chapter.href && target === 'all') {
        console.log("Skipping", chapter.id)
        continue
      }

      const shouldGenerate = chapter.id === target || target === 'all'
      if (!shouldGenerate) {
        continue
      }
      generatedAtLeastOne = true

      const outputPath = path.join(__dirname, `../../../public/learn_evm/previews/${chapter.id}.png`)
      console.log("Generating", chapter.id, '->', outputPath)

      const dir = path.dirname(outputPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir) // Shouldn't be more than one folder, so no recursive: true
      }

      const topic = topicById[chapter.id]

      await generatePreviewImage({
        title: chapter.title,
        subtitle: `${topic.emoji} ${topic.title} – ⚙️ LearnEVM.com`,
        outputPath,
      })
    }
  }

  if (target === 'all' && !generatedAtLeastOne) {
    throw new Error(`No such chapter id: ${target}`)
  }
}

generate().then(
  () => { console.log('Done.'); process.exit(0) },
  err => { console.error(err); process.exit(1) },
)
