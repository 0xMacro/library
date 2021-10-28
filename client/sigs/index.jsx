import m from 'mithril'
import { cc } from 'mithril-cc'
import { ethers } from "ethers"

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

window.signer = signer
window.ethers = ethers
window.provider = provider

const App = cc(function() {
  let chainId = null
  let message = m.parseQueryString(window.location.search.slice(1)).m
  let messageSig = null
  let messageSigSigner = null

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
      messageSigSigner = await signer.getAddress()
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
    if (!message || !verifySig) {
      verifyStatus = null
    }
    else {
      try {
        verifyStatus = ethers.utils.verifyMessage(message, verifySig)
      }
      catch(err) {
        verifyStatus = 'invalid'
      }
    }
    m.redraw()
  }

  let recentlyCopied = false

  return () => (
    <div class="p-4">
      <div>
        <h2 class="dark:text-gray-200">Create Signature</h2>
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
            <h3 class="dark:text-gray-200">Message signature:</h3>
            <textarea id="messageSigOutput" class="input w-full">{messageSig}</textarea>
            <button
              class="btn"
              onclick={() => {
                messageSigOutput.focus()
                messageSigOutput.select()
                document.execCommand("copy")
                recentlyCopied = true
                setTimeout(() => { recentlyCopied = false; m.redraw() }, 2600)
              }}
            >
              {recentlyCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        }
      </div>

      <hr class="mt-8" />

      <div class="mt-8">
        <h2 class="dark:text-gray-200">Verify Signature</h2>
        <textarea
          class="mt-1 input flex-1 flex-shrink-0 w-full"
          placeholder="Message to verify"
          oninput={e => {
            message = e.target.value
            verifyMessage()
          }}
        >{message}</textarea>
        <input
          type="text"
          class="input"
          placeholder="Message signature"
          oninput={e => {
            verifySig = e.target.value
            verifyMessage()
          }}
        />
        <div class="mt-2 text-sm dark:text-gray-200">
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
