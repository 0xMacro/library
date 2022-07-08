# The 0xMacro Library

Here you will find [Macro](https://0xMacro.com)'s growing collection of public resources.

[Visit the library here](https://0xMacro.com/library/).

## Development

After cloning this project:

```bash
$ npm install
$ npm run init
$ npm run dev
```

This is a Lancer project. Read more at [lancer.studio](https://lancer.studio)

## Notes

PUT EVERYTHING UNDER THE `client/library/` FOLDER. This is necessary due to our url routing setup.

`solc-wrapper.js` was generated via:

    $ browserify node_modules/solc/wrapper.js -o solc-wrapper.js -s SolcWrapper
