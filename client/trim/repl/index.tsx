import '../../evm/_lib/shims'

import m from 'mithril'
import { cc } from 'mithril-cc'
import { ethers } from 'ethers'
import { RunTxResult } from '@ethereumjs/vm/dist/runTx'
import { Address } from 'ethereumjs-util';

import { compileBasm, compileTrim, getOpcodesForTrim } from '@0xmacro/trim'
import { BetterVM } from '../../evm/_lib/evm'
import { Opcode } from '@ethereumjs/vm/dist/evm/opcodes'

const ONE_WEI = 1_000_000_000

window.ethers = ethers

let vm = new BetterVM()
const opcodes = getOpcodesForTrim(vm.opcodes)

type CallTx   = { type: 'call', abi: string, args: string, output?: string }
type CreateTx = { type: 'create', source: string, bytecode: string, output?: string }

type Tx =
  | CallTx
  | CreateTx

export const txs: Tx[] = [
  { type: 'create', source: '', bytecode: '' },
  { type: 'call', abi: 'greet()', args: '[]' },
  { type: 'call', abi: 'setGreeting(string)', args: '["Updated!"]' },
]

const TxUi = cc(function() {
  return () => (
    txs.map(tx => {

      if (tx.type === 'create') {
        return <>
          <div class="ml-5 flex items-center bg-white dark:bg-cool-gray-600" style="padding: 1em;">
            Contract Create –&nbsp;<div class="flex-1 overflow-hidden font-mono" style="text-overflow: ellipsis;">
              {tx.bytecode || ''}
            </div>
          </div>
          <pre class="p-5 pre-output">{tx.output || ''}</pre>
        </>
      }

      if (tx.type === 'call') {
        return <>
          <div class="ml-5 bg-white dark:bg-cool-gray-600" style="padding: 1em;">
            <div class="flex items-center space-x-2">
              <div class="pr-2 border-r dark:border-cool-gray-500">Call 1</div>

              <label class="text-sm font-mono">ABI</label>
              <input onchange={(e: any) => { tx.abi = e.target.value; update() }} type="text" value={tx.abi} class="bg-output p-2 font-mono" />

              <label class="text-sm font-mono">Args</label>
              <input onchange={(e: any) => { tx.args = e.target.value; update() }} type="text" value={tx.args} class="bg-output p-2 font-mono" />
            </div>
          </div>
          <pre class="p-5 pre-output">{tx.output || ''}</pre>
        </>
      }
    })
  )
})



async function runTransactions() {
  const vm = new BetterVM()
  await vm.setup()

  let nonce = 0
  let mainContract: Address | undefined
  for (let [i, tx] of txs.entries()) {

    if (tx.type === 'create') {
      tx.bytecode = languageSelect.value === 'trim'
        ? compileTrim(input.value, { opcodes })
        : compileBasm(input.value, { opcodes })
      console.log("BYTECODE", tx.bytecode)

      const {createdAddress, results} = await vm.runTx(0, {
        nonce: '0x' + pad(nonce.toString(16), 2),
        gasPrice: '0x' + pad((50 * ONE_WEI).toString(16), 8),
        gasLimit: '0x' + pad((30_000_000).toString(16), 8),
        data: tx.bytecode,
      })

      tx.output = report(results)

      if (!createdAddress) {
        break
      }

      if (!mainContract) {
        mainContract = createdAddress
      }
    }
    else {

      const iface = new ethers.utils.Interface([`function ${tx.abi}`])

      const { results } = await vm.runTx(0, {
        nonce: '0x' + pad(nonce.toString(16), 2),
        gasPrice: '0x' + pad((50 * ONE_WEI).toString(16), 8),
        gasLimit: '0x' + pad((30_000_000).toString(16), 8),
        value: '0x00', // TODO
        to: mainContract!.toString(),
        data: iface.encodeFunctionData(tx.abi.split('(')[0], JSON.parse(tx.args))
        // data: calldataInput.value
        //   ? '0x' + calldataInput.value.split(',').map(v => pad(v, 64)).join('')
        //   : ''
      })
      tx.output = report(results)
    }

    nonce += 1
  }
  m.redraw()

  // Now let's look at what we created. The transaction
  // should have created a new account for the contract
  // in the state. Let's test to see if it did.

  // const createdAccount = await vm.stateManager.getAccount(createdAddress)

  // console.log('-------results-------')
  // console.log('nonce: ' + createdAccount.nonce.toString())
  // console.log('balance in wei: ', createdAccount.balance.toString())
  // console.log('stateRoot: 0x' + createdAccount.stateRoot.toString('hex'))
  // console.log('codeHash: 0x' + createdAccount.codeHash.toString('hex'))
  // console.log('---------------------')
}



const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement

const input = document.getElementById('input') as HTMLTextAreaElement
const outputPanel = document.getElementById('outputPanel')!
const errorOutput = document.getElementById('errorOutput')!
const outputCreate = document.getElementById('outputCreate')!

const callElems = [
  {
    abi: document.getElementById('calldataABI') as HTMLInputElement,
    input: document.getElementById('calldataInput') as HTMLInputElement,
    output: document.getElementById('outputCall')!,
  },
  {
    abi: document.getElementById('calldataABI2') as HTMLInputElement,
    input: document.getElementById('calldataInput2') as HTMLInputElement,
    output: document.getElementById('outputCall2')!,
  },
]

async function update() {
  errorOutput.innerText = 'No compile errors.'
  try {
    ;(txs[1] as CreateTx).source = input.value
    await runTransactions()
  }
  catch (err) {
    reportError(err)
  }
}



function report(results: RunTxResult) {
  console.log("RESULTS", results, vm.txCache)
  let output = ''
  if (results.execResult.runState?.callData?.length) {
    output += `Call data: 0x${results.execResult.runState.callData.toString('hex')}\n\n`
  }
  output += `Storage: ${vm.txCache.reads.length} reads, ${vm.txCache.writes.length} writes\n`

  const ret = results.execResult.returnValue.toString('hex')
  output += `Return value: ${ret ? `0x${ret}` : '<<empty>>'}\n`
  output += `Gas used: ${results.gasUsed.toString()}\n`

  if (results.execResult.runState) {
    let memCount = results.execResult.runState.memoryWordCount.toNumber() * 2
    if (memCount > 0) {
      output += `\nMemory Usage:\n`
      let pointer = 0x0
      for (let i=0; i < memCount; i++) {
        output += `  0x${pad(pointer.toString(16), 2)}: ${results.execResult.runState.memory.read(pointer, 16).toString('hex')}\n`
        pointer += 0x10
      }
    }

    const stack = results.execResult.runState.stack
    if (stack.length) {
      output += `\nLeftover Stack:\n`
      for (let i = 0; i < stack.length; i++) {
        output += `  0x${pad(i.toString(16), 2)}: 0x${stack._store[i].toString('hex')}\n`
      }
    }
  }
  else {
    output += `<<none>>`
  }
  return output
}


const opcodesByCode = [...vm.opcodes.values()].reduce((all, op) => {
  all[op.code] = op
  return all
}, {} as Record<string, Opcode>)

const scratchInput = document.getElementById('scratchInput') as HTMLTextAreaElement
const scratchOutput = document.getElementById('scratchOutput')!
const decompileFormatSelect = document.getElementById('decompileFormatSelect') as HTMLSelectElement

function updateScratch() {
  const type = decompileFormatSelect.value
  if (type === 'bytecode') {
    const lines = decompileBytecode(scratchInput.value.replace(/^0x/, '').replace(/[^0-9a-f]/g, ''))
    scratchOutput.innerText = lines.map(words => words.join(' ')).join('\n')
  }
  else if (type === 'utf8') {
    hexToUtf8()
  }
  else {
    utf8ToHex()
  }
}

export function decompileBytecode(bytecode: string): string[][] {
  const input = bytecode.replace(/^0x/, '').replace(/[^0-9a-f]/g, '')
  const lines = []

  for (let i=0; i < input.length; i += 2) {
    let byte = input.slice(i, i+2)
    let byteDec = parseInt(byte, 16)
    // console.log("BYTE", byteDec, byte)
    let op = opcodesByCode[byteDec]
    if (op) {
      let words = []
      // console.log("->", op)
      // lines.push((i === 0 ? '' : '\n') + op.fullName)
      words.push(op.fullName)
      if (op?.name === 'PUSH') {
        let pushLen = +op.fullName.replace('PUSH', '')
        words.push('0x' + input.slice(i+2, i+2+pushLen*2))
        i += pushLen*2
      }
      lines.push(words)
    }
    else {
      lines.push([`<<invalid op: ${byte} (decimal: ${byteDec})>>`])
    }
  }
  return lines

  // scratchOutput.innerText = lines.join(' ')
}

function hexToUtf8() {
  const input = scratchInput.value.replace(/^0x/, '').replace(/^0*/, '')
  scratchOutput.innerText = Buffer.from(input, 'hex').toString()
}

function utf8ToHex() {
  const input = scratchInput.value.trim()
  scratchOutput.innerText = '0x' + Buffer.from(input, 'utf8').toString('hex')
}



//
// Function selector tools
//
const fnsInput = document.getElementById('fnsInput') as HTMLTextAreaElement
const fnsOutput = document.getElementById('fnsOutput')!

function updateFns() {
  fnsOutput.innerText = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fnsInput.value)).slice(0,10)
}

//
// Hex tools
//
const hexInput = document.getElementById('hexInput') as HTMLTextAreaElement
const hexPadInput = document.getElementById('hexPadInput') as HTMLInputElement
const hexOutput = document.getElementById('hexOutput')!

function updateHex() {
  hexOutput.innerText = '0x' + pad(Buffer.from(hexInput.value.replace('0x', ''), 'hex').toString('hex'), parseInt(hexPadInput.value, 10) * 2)
}
;(window as any).updateHex = updateHex



function initRepl() {
  update(); ;(window as any).update = update
  updateScratch(); (window as any).updateScratch = updateScratch
  updateFns(); (window as any).updateFns = updateFns
  m.mount(document.getElementById('tx-ui')!, TxUi)
}
;(window as any).initRepl = initRepl

//
// Util
//
export function pad(str: string, len: number, char='0') {
  for (let i=str.length; i < len; i++) {
    str = char + str
  }
  return str
}
function reportError(err: any) {
  console.error('Runtime error', err)
  errorOutput.innerText = err.message
}
