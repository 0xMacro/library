const solc = require('./solc-wrapper')(window.Module)
const { ethers } = require('ethers')
window.ethers = ethers


function update() {
  const result = JSON.parse(solc.compile(JSON.stringify({
    language: 'Solidity',
    sources: {
      'repl.sol': {
        // content: 'contract C { function f() public { } }'
        content: input.value
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
  console.log("result",result)

  const out = []
  for (let error of (result.errors || [])) {
    out.push(error.message + '\n')
  }

  if (result.contracts) {
    for (let file in result.contracts) {
      for (let contractName in result.contracts[file]) {
        const contract = result.contracts[file][contractName]

        const bytecode = contract.evm.bytecode.object
        out.push(`${contractName} (${bytecode.length / 2} bytes)` + '\n')

        console.log("ABI", )
        for (let fn of new ethers.utils.Interface(contract.abi).format(ethers.utils.FormatTypes.full)) {
          out.push(`  ${fn}\n`)
        }
        out.push('\n')
        out.push(bytecode.replace('f3fe', 'f3fe\n'))
      }
    }
  }

  output.innerText = out.join('')
}
window.update = debounce(800, update)
update()


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
