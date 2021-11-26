import m from 'mithril'
import Stream from 'mithril/stream'
import { cc, uniques } from 'mithril-cc'

import { pad, decompileBytecode } from '../trim/repl'

const bytecodeInput = document.getElementById('import') as HTMLInputElement

const initBytecode = '0x60046000601c376000518063cfae32171461001657fd5b6c48656c6c6f2c20776f726c642160005260206000f3'

const App = cc(function() {
  this.addEventListener(bytecodeInput, 'change', (e: any) => {
    parsed = parseBytecode(e.target.value)
    digStack = []
    e.target.value = ''
  })

  let parsed = parseBytecode(initBytecode)
  let digStack = [] as { line: number }[]

  let onNav = (level: number, line: number) => {
    digStack = digStack.slice(0, level)
    digStack.push({ line })
  }

  return () => {
    return <div class="pt-3 flex-1 flex overflow-x-scroll">
      {m(StackedView, { parsed, activeLine: -1, viewingLine: digStack[0]?.line || -1, level: 0, onNav })}
      {digStack.map((dig, i) =>
        m(StackedView, { parsed, activeLine: dig.line, viewingLine: digStack[i+1]?.line || -1, level: i+1, onNav })
      )}
    </div>
  }
})


type StackedViewAttrs = {
  viewingLine: number
  activeLine: number
  level: number
  onNav: (level: number, line: number) => void
  parsed: ReturnType<typeof parseBytecode>
}
const StackedView = cc<StackedViewAttrs>(function($attrs) {

  const {level, onNav} = $attrs()

  this.oncreate(vnode => {
    // Scroll down to active line on change
    $attrs.map(attrs => attrs.activeLine).map(uniques()).map(activeLine => {
      if (activeLine < 0) return
      const i = $attrs().parsed.lineNums.findIndex(lnum => lnum.dec === activeLine)
      const linesDiv = vnode.dom.querySelector('.OutputLines')!
      linesDiv.children[i*2]?.scrollIntoView()

      const parentScroller = linesDiv.parentElement!
      parentScroller.scrollTop = parentScroller.scrollTop - 8
    })
  })

  return ({ activeLine, viewingLine, parsed: {lines, lineNums, pc, jumpdestLines} }) => (
    <div class="flex flex-shrink-0 items-start overflow-y-scroll">
      <div class="OutputLines p-5 font-mono text-right dark:bg-cool-gray-800 dark:text-cool-gray-200">
        {lineNums.map(lnum => <>
          <span class={lnum.dec === activeLine ? '-active' : undefined}>{lnum.hex}</span>
          <br />
        </>)}
      </div>
      <div class="OutputCode p-5 w-[20em] flex-1 flex-shrink-0 overflow-x-scroll whitespace-nowrap bg-output font-mono dark:text-cool-gray-200">
        {lines.map((line, i) => <>
          <span class={lineNums[i].dec === activeLine ? '-active' : ''}>{line[0]}</span>
          {line[1] && ' '}
          {line[1] && (() => {
            const hex = line[1]
            const dec = hex.length < 8 && parseInt(hex, 16)
            return dec && jumpdestLines[dec]
            ? <span
                class={`${viewingLine === dec ? '-active' : 'cursor-pointer hover:text-blue-500 underline'}`}
                onclick={(e: any) => {
                  e.preventDefault()
                  onNav(level, dec)
                }}
              >{hex}</span>
            : hex
          })()}
          <br />
        </>)}
      </div>
    </div>
  )
})



function parseBytecode(bytecode: string) {
  let lines = decompileBytecode(bytecode)

  let pc = 0
  let lineNums = [] as { hex: string, dec: number }[]

  // First pass: line numbers
  let jumpdestLines = {} as Record<number, boolean>
  for (let line of lines) {
    let hex = pad(pc.toString(16), 2)
    lineNums.push({ hex, dec: pc })
    if (line[0] === 'JUMPDEST') {
      jumpdestLines[pc] = true
    }
    else {
    }
    pc += line.length === 2
      ? 1 + (line[1].length - 2) / 2  // ASSUMPTION: Hex values are always properly padded
      : 1
  }
  return { lines, lineNums, pc, jumpdestLines }
}


m.mount(document.getElementById('explorer')!, App)
