import './shims'
import { ethers } from 'ethers'
import { RunTxResult } from '@ethereumjs/vm/dist/runTx'

import { compileBasm, compileTrim, getOpcodesForTrim } from '@hackerdao/trim'
import { BetterVM } from '../evm/_lib/evm'


window.ethers = ethers

let vm = new BetterVM()
const opcodes = getOpcodesForTrim(vm.opcodes)

async function runContract(code: string) {
  const vm = new BetterVM()
  await vm.setup()

  // The first transaction deploys a contract
  const {createdAddress, results: results1} = await vm.runTx(0, {
    nonce: '0x00',
    gasPrice: "0x09184e72a000",
    gasLimit: "0x90710",
    data: code,
  })

  outputPanel.scrollTop = 0 // Reset position before editing content
  report(outputCreate, results1)

  // The second transaction calls that contract
  // console.log("DATA", ethers.utils.defaultAbiCoder.encode([calldataABI.value], JSON.parse(calldataInput.value)))
  let nonce = 1
  for (let {abi, input, output} of callElems) {
    const iface = new ethers.utils.Interface([`function ${abi.value}`])

    const { results } = await vm.runTx(0, {
      nonce: nonce++,
      gasPrice: '0x09184e72a000',
      gasLimit: '0x20710',
      value: '0x10',
      to: createdAddress!.toString(),
      data: iface.encodeFunctionData(abi.value.split('(')[0], JSON.parse(input.value))
      // data: calldataInput.value
      //   ? '0x' + calldataInput.value.split(',').map(v => pad(v, 64)).join('')
      //   : ''
    })
    report(output, results)
  }

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
    const code = languageSelect.value === 'trim'
      ? compileTrim(input.value, { opcodes })
      : compileBasm(input.value, { opcodes })
    console.log("CODE", code)
    await runContract(code)
  }
  catch (err) {
    reportError(err)
  }
}



function report(elem: HTMLElement, results: RunTxResult) {
  console.log("RESULTS", results, vm.txCache)
  elem.innerText = ''
  if (results.execResult.runState?.callData?.length) {
    elem.innerText += `Call data: 0x${results.execResult.runState.callData.toString('hex')}\n\n`
  }
  elem.innerText += `Storage: ${vm.txCache.reads.length} reads, ${vm.txCache.writes.length} writes\n`

  const ret = results.execResult.returnValue.toString('hex')
  elem.innerText += `Return value: ${ret ? `0x${ret}` : '<<empty>>'}\n`
  elem.innerText += `Gas used: ${results.gasUsed.toString()}\n`

  if (results.execResult.runState) {
    let memCount = results.execResult.runState.memoryWordCount.toNumber() * 2
    if (memCount > 0) {
      elem.innerText += `\nMemory Usage:\n`
      let pointer = 0x0
      for (let i=0; i < memCount; i++) {
        elem.innerText += `  0x${pad(pointer.toString(16), 2)}: ${results.execResult.runState.memory.read(pointer, 16).toString('hex')}\n`
        pointer += 0x10
      }
    }

    const stack = results.execResult.runState.stack
    if (stack.length) {
      elem.innerText += `\nLeftover Stack:\n`
      for (let i = 0; i < stack.length; i++) {
        elem.innerText += `  0x${pad(i.toString(16), 2)}: 0x${stack._store[i].toString('hex')}\n`
      }
    }
  }
  else {
    elem.innerText += `<<none>>`
  }
}


const opcodesByCode = [...vm.opcodes.values()].reduce((all, op) => {
  all[op.code] = op
  return all
}, {})

const scratchInput = document.getElementById('scratchInput') as HTMLTextAreaElement
const scratchOutput = document.getElementById('scratchOutput')
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
const fnsOutput = document.getElementById('fnsOutput')

function updateFns() {
  fnsOutput.innerText = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fnsInput.value)).slice(0,10)
}

//
// Hex tools
//
const hexInput = document.getElementById('hexInput') as HTMLTextAreaElement
const hexPadInput = document.getElementById('hexPadInput') as HTMLInputElement
const hexOutput = document.getElementById('hexOutput')

function updateHex() {
  hexOutput.innerText = '0x' + pad(Buffer.from(hexInput.value.replace('0x', ''), 'hex').toString('hex'), parseInt(hexPadInput.value, 10) * 2)
}
;(window as any).updateHex = updateHex



function initRepl() {
  update(); ;(window as any).update = update
  updateScratch(); (window as any).updateScratch = updateScratch
  updateFns(); (window as any).updateFns = updateFns
}
;(window as any).initRepl = initRepl

//
// Util
//
export function pad(str, len, char='0') {
  for (let i=str.length; i < len; i++) {
    str = char + str
  }
  return str
}
function reportError(err) {
  console.error('Runtime error', err)
  errorOutput.innerText = err.message
}
