import path from 'path'
import { bundleStyle } from '@lancer/studio/dist/server/bundle.js'
import nodeHtmlToImage from 'node-html-to-image'
import font2base64 from 'node-font2base64'


export async function generatePreviewImage({ outputPath, title, subtitle }) {
  await nodeHtmlToImage({
    output: outputPath,
    html: await generateHtml({ css: await generateCss(), title, subtitle })
  })
}

let cssCache = null
export async function generateCss() {
  if (cssCache) return cssCache;

  let css = (await bundleStyle(process.cwd(), path.join(process.cwd(), 'client/learn_evm/styles/global.css')))
  let fontDir = `${process.cwd()}/public/library/fonts`

  for (let weight of ['Bold', 'Italic', 'Medium', 'Regular', 'Semibold']) {
    let woff = await font2base64.encodeToDataUrl(`${fontDir}/Informative-${weight}.woff`)
    css = css.replace(`url("/library/fonts/Informative-${weight}.woff")`, `url(${woff})`)

    let woff2 = await font2base64.encodeToDataUrl(`${fontDir}/Informative-${weight}.woff2`)
    css = css.replace(`url("/library/fonts/Informative-${weight}.woff2")`, `url(${woff2})`)
  }

  cssCache = css
  return css
}

export function generateHtml({ css, title, subtitle }) {
  const seed = title.length
  return `
    <!DOCTYPE html>
    <meta charset="UTF-8">
    <head>
      <style>
        .header-gradient {
          background: linear-gradient(180deg, #35373F 0%, #121315 100%);
          border-radius: 10px 10px 0px 0px;
        }
        ${css}
      </style>
    </head>
    <body class="bg-zinc-600 text-zinc-100">
      <div class="header-gradient relative flex flex-col justify-center" style="width: 800px; height: 418px; overflow: hidden">

        <div class="relative flex-center mx-auto bg-zinc-800 border border-gray-500" style="width: 756px; height: 322px">
          <div class="absolute inset-3 break-all leading-snug text-gray-400 overflow-hidden font-mono text-3xl text-center">
            <script>
              var seed = ${seed}
              function random() {
                  var x = Math.sin(seed++) * 10000;
                  return x - Math.floor(x);
              }
              for(let i=0; i < 10000; i++) {
                document.write(Math.round(random()))
              }
            </script>
          </div>

          <div class="px-12 z-10">
            <div style="padding: 28px 52px;" class="bg-black text-whitez-10 text-6xl font-semibold text-center leading-tight">
              ${title}
            </div>
          </div>
        </div>

        <div class="relative pt-5 text-3xl text-center" style="top: 2px">${subtitle}</div>

      </div>
    </body>
  `
}
