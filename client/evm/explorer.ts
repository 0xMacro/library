import { pad, decompileBytecode } from '../trim/repl'

const bytecodeInput = document.getElementById('import') as HTMLInputElement
const outputCodeDiv = document.getElementById('outputCode')!
const outputLinesDiv = document.getElementById('outputLines')!

bytecodeInput.addEventListener('change', (e: any) => {
  render(e.target.value)
  e.target.value = ''
})

let currentHash = location.hash.slice(1)
window.addEventListener('hashchange', (e: any) => {
  if (currentHash) {
    document.getElementById(currentHash)?.classList.remove('-active')
  }
  currentHash = location.hash.slice(1)
  document.getElementById(currentHash)?.classList.add('-active')
})

function render(bytecode: string) {
  let lines = decompileBytecode(bytecode)

  let pc = 0
  let outputAsm = [] as string[]
  let outputLines = [] as string[]

  // First pass: line numbers
  let jumpdest = {} as Record<number, boolean>
  for (let line of lines) {
    let hex = pad(pc.toString(16), 2)
    if (line[0] === 'JUMPDEST') {
      jumpdest[pc] = true
      outputLines.push(`<span id="L${hex}" class="${currentHash === 'L'+hex ? '-active' : ''}">${hex}</span>`)
    }
    else {
      outputLines.push(hex)
    }
    pc += line.length === 2
      ? 1 + (line[1].length - 2) / 2  // ASSUMPTION: Hex values are always properly padded
      : 1
  }

  // Second pass: Code and hex line links
  for (let line of lines) {
    if (line.length === 1) {
      outputAsm.push(line[0], '<br/>')
    }
    else {
      let hex = line[1]
      let dec = parseInt(hex, 16)
      outputAsm.push(
        line[0] + ' ',
        hex.length < 8 && jumpdest[dec]
          ? `<a class="underline hover:text-blue-500" href="#L${dec.toString(16)}">${hex}</a>`
          : hex,
        '<br/>'
      )
    }
  }
  outputCodeDiv.innerHTML = outputAsm.join('')
  outputLinesDiv.innerHTML = outputLines.join('<br/>')
}

render('0x60046000601c376000518063cfae32171461001657fd5b6c48656c6c6f2c20776f726c642160005260206000f3')
