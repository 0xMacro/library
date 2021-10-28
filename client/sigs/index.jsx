import m from 'mithril'
import { cc } from 'mithril-cc'
import { ethers } from "ethers"

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

window.signer = signer
window.ethers = ethers
window.provider = provider

console.log("WHAT")

// async function connectToMetamask() {
//   try {
//     console.log("Signed in", await signer.getAddress())
//   }
//   catch(err) {
//     console.log("Not signed in")
//     await provider.send("eth_requestAccounts", [])
//   }
// }



const App = cc(function() {
  let chainId = null
  let message = ''
  let messageSig = null

  let verifyMsg = ''
  let verifySig = ''
  let verifyStatus = null

  provider.on("network", (newNetwork, oldNetwork) => {
    chainId = newNetwork.chainId
    if (oldNetwork) {
      // Ethers.js documentation recommends reloading on network change
      window.location.reload()
    }
    m.redraw()
  })

  async function sign() {
    try {
      await signer.getAddress()
    }
    catch (err) {
      try {
        await provider.send("eth_requestAccounts", [])
      }
      catch (err) {
        alert('Please connect your metamask address')
        return
      }
    }
    messageSig = await signer.signMessage(message)
    m.redraw()
  }

  async function verifyMessage() {
    if (!verifyMsg || !verifySig) return
    try {
      verifyStatus = ethers.utils.verifyMessage(verifyMsg, verifySig)
    }
    catch(err) {
      verifyStatus = 'invalid'
    }
  }

  return () => (
    <div class="p-4">
      <div>
        <h3>Create Signature</h3>
        <textarea
          placeholder="Message to sign"
          class="mt-1 input flex-1 flex-shrink-0 w-full"
          oninput={e => message = e.target.value}
        >{message}</textarea>

        <div class="flex justify-end">
          <button
            class="btn"
            disabled={chainId !== 1}
            onclick={sign}
          >
            {chainId === null || chainId === 1 ? `Sign ${message ? message.length + ' chars' : ''}` : 'Please switch to Ethereum Mainnet'}
          </button>
        </div>

        {messageSig &&
          <div>
            <h3>Message signature:</h3>
            <pre>{messageSig}</pre>
          </div>
        }
      </div>

      <hr class="mt-8" />

      <div class="mt-8">
        <h3>Verify Signature</h3>
        <textarea
          class="mt-1 input flex-1 flex-shrink-0 w-full"
          placeholder="Message to verify"
          onkeypress={() => verifyStatus = null}
          onchange={e => {
            verifyMsg = e.target.value
            verifyMessage()
          }}
        ></textarea>
        <input
          type="text"
          class="input"
          placeholder="Message signature"
          onkeypress={() => verifyStatus = null}
        />
        <div class="mt-2 text-sm">
          {
            verifyStatus === null ? 'Please enter message and signature' :
            verifyStatus === 'invalid' ? 'Invalid signature' :
            `Signer: ${verifyStatus}`
          }
        </div>
      </div>
    </div>
  )

})

m.mount(document.getElementById('app'), App)
