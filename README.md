# Welcome
This is a repo for the various small TypeScript based web3 tools I create.

If you like and/or use any of the code in here, please let me know on [Twitter](https://twitter.com/0xtygra)!

All the code in here is MIT licensed, go wild.

# Contents
## [NFT Snapshot Tool](./src/snapshot/README.md)
A tool to take a snapshot of an NFT collection at a given block number.

# Getting Started
Before running the code, you'll need to sign up for a free Alchemy (or any other RPC provider) API key, which you can do [here](https://www.alchemy.com/pricing).

Add this key to a `.env` file in the *root* of this repo, like so:

```
ALCHEMY_MAINNET_KEY=<your key>
```

After that, just run `yarn` or `npm install` to install the packages, and then `yarn <folder-name>` or `npm run <folder-name>`, eg `yarn snapshot`!


