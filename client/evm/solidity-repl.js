require('./_lib/shims')
const solc = require('./solc-wrapper')(window.Module)
const { ethers } = require('ethers')
const { BetterVM } = require('./_lib/evm')

window.ethers = ethers

let latestBytecode = ''

function updateSource() {
  const result = compileSolidity(input.value)
  console.log("result",result)

  const out = []
  for (let error of (result.errors || [])) {
    out.push(error.message + '\n')
  }

  // TODO: Support more than one contract, maybe
  latestBytecode = ''

  if (result.contracts) {
    for (let file in result.contracts) {
      for (let contractName in result.contracts[file]) {
        const contract = result.contracts[file][contractName]

        const bytecode = contract.evm.bytecode.object
        out.push(`${contractName} (${bytecode.length / 2} bytes)` + '\n')

        for (let fn of new ethers.utils.Interface(contract.abi).format(ethers.utils.FormatTypes.full)) {
          out.push(`  ${fn}\n`)
        }
        out.push('\n')
        out.push(bytecode.replace('f3fe', 'f3fe\n'))

        if (!latestBytecode) {
          latestBytecode = bytecode
        }
      }
    }
  }

  output.innerText = out.join('')

  updateRepl()
}
window.updateSource = debounce(800, updateSource)
updateSource()



async function updateRepl() {
  if (1+1) return // Skip this for now
  if (!latestBytecode) return
  const vm = new BetterVM()
  await vm.setup()

  // Deploy written contract
  const {createdAddress: writtenAddress, results: results1} = await vm.runTx(0, {
    nonce: '0x00',
    gasPrice: "0x09184e72a000",
    gasLimit: "0x90710",
    data: '0x' + latestBytecode,
  })
  console.log("Create", results1)

  // TODO: Support more than bytes32
  const replCode = `contract Repl {
    address target;
    constructor(address _target) {
      target = _target;
    }
    function go() external returns (bytes32) {
      ${replInput.value}
    }
  }`

  // Deploy repl contract
  const compileResult = compileSolidity(replCode)
  for (let error of (compileResult.errors || [])) {
    console.log(error.formattedMessage || error.message)
  }
  console.log("GOGOG", compileResult)
  const {createdAddress: replAddress, results: results2} = await vm.runTx(0, {
    nonce: '0x01',
    gasPrice: "0x09184e72a000",
    gasLimit: "0x90710",
    data: '0x'
      + compileSolidity(replCode).contracts['repl.sol'].Repl.evm.bytecode.object
      + ethers.utils.defaultAbiCoder.encode(['address'], [writtenAddress.toString()]).replace(/^0x/, '')
    ,
  })
  console.log("Create", results2)

  // Run the function
  const iface = new ethers.utils.Interface([`function go() returns (bytes32)`])
  const {results: results3} = await vm.runTx(0, {
    to: replAddress,
    nonce: '0x02',
    gasPrice: "0x09184e72a000",
    gasLimit: "0x90710",
    data: iface.encodeFunctionData('go', [])
  })
  console.log("Create", results3)
  console.log("Yeh", results3.execResult.returnValue.toString('hex'))
  replOutput.innerText = results3.execResult.returnValue.toString('hex')
}
window.updateRepl = debounce(800, updateRepl)

//
// Helpers
//
function debounce(wait, func) {
  var timeout
  return function() {
    var context = this, args = arguments
    var later = function() {
      timeout = null
      func.apply(context, args)
    }
    // var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    // if (callNow) func.apply(context, args);
  };
};

function compileSolidity(source) {
  return JSON.parse(solc.compile(JSON.stringify({
    language: 'Solidity',
    sources: {
      'repl.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  })))
}
