# The 0xMacro Library

Here you will find [Macro](https://0xMacro.com)'s growing collection of public resources.

[Visit the library here](https://0xMacro.com/library/).

## Development Setup

After cloning this project:

```bash
git submodule init
git submodule update

npm install
npm run init

## Then run ONE of the following:
npm run dev
npm run dev-evm
```

This is a Lancer project. Read more at [lancer.studio](https://lancer.studio)

### Preview Images

Note that preview generation is non-deterministic, you may have to try a few times :(

```
npm run evm:gen-previews intro/about
```

## Notes

PUT EVERYTHING UNDER THE `client/library/library/` FOLDER. This is necessary due to our url routing setup.

`solc-wrapper.js` was generated via:

    $ browserify node_modules/solc/wrapper.js -o solc-wrapper.js -s SolcWrapper

We're storing assets in git history for convenience. If repo history becomes too large, use [BFG](https://rtyley.github.io/bfg-repo-cleaner/) to clean it.
