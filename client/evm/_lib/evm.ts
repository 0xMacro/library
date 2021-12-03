import VM from '@ethereumjs/vm'
import { BN, Address, Account, toBuffer, pubToAddress } from 'ethereumjs-util'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { Transaction, TxData } from '@ethereumjs/tx'
import { getOpcodesForHF } from '@ethereumjs/vm/dist/evm/opcodes'

export class BetterVM {
  vm: VM
  txCache = {
    reads: [] as { loc: BN, pc: number }[],
    writes: [] as { loc: BN, value: BN, pc: number }[],
  }
  accounts = [] as { account: Account, publicKey: Buffer, privateKey: Buffer }[]
  opcodes: ReturnType<typeof getOpcodesForHF>

  constructor() {
    const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Berlin })

    this.vm = new VM({ common })
    this.opcodes = getOpcodesForHF(common)

    this.vm.on('step', (data: any) => {
      // console.log(`Opcode: ${data.opcode.name}\tStack: ${data.stack}`, data.memoryWordCount.toString(), data)
      if (data.opcode.name === 'SLOAD') {
        this.txCache.reads.push({ loc: data.stack[data.stack.length-1], pc: data.pc })
      }
      if (data.opcode.name === 'SSTORE') {
        this.txCache.writes.push({ loc: data.stack[data.stack.length-1], value: data.stack[data.stack.length-2], pc: data.pc })
      }
    })

    const keyPair = {
      "secretKey": "0x3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511",
      "publicKey": "0x0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0"
    }

    //
    // TODO: Support more accounts
    //
    this.accounts.push({
      account: Account.fromAccountData({
        nonce: 0,
        balance: new BN(100).pow(new BN(19)), // 100 eth
      }),
      publicKey: toBuffer(keyPair.publicKey),
      privateKey: toBuffer(keyPair.secretKey),
    })
  }

  async setup() {
    for (let account of this.accounts) {
      const address = new Address(pubToAddress(account.publicKey, true))
      await this.vm.stateManager.putAccount(address, account.account)
    }
  }

  async runTx(accountNo: number, txData: any) {
    this.txCache = { reads: [], writes: [] }

    const account = this.accounts[accountNo]
    console.log("ACCOUNT", account)
    const tx = Transaction.fromTxData(txData).sign(account.privateKey)

    console.log('----running tx-------')
    const results = await this.vm.runTx({ tx })

    console.log('gas used: ' + results.gasUsed.toString())
    console.log('returned: ' + results.execResult.returnValue.toString('hex'))

    const createdAddress = results.createdAddress
    if (createdAddress) {
      console.log('address created: ' + createdAddress.toString())
    }
    return { createdAddress, results }
  }
}
