# NFT Holder Snapshot tool
Recently for a [Good Minds](https://twitter.com/goodmindsnft) art drop, I needed to get a snapshot of all NFT holders at a specific block.

I did some research, and all I came across were some old holder count Dune dashboards, and a web app that gave incorrect results.

I wrote a Dune query that accomplishes this initially, but upon seeing that the pro tier (needed to save an output as .csv) was $390/mo, I wrote this code. For anyone interested, [here's the query](https://dune.com/queries/1208587).

# Getting started
The code is fairly simple. It uses the `web3` package as this allows you to specify a block number when calling a contract's methods.

For collections that have a `totalSupply` exposed, it'll use that to find the size of the collection, otherwise you'll need to provide it yourself.

Before running the code, you'll need to sign up for a free Alchemy (or any other RPC provider) API key, which you can do [here](https://www.alchemy.com/pricing).

Add this key to a `.env` file in the *root* of this repo, like so:

```
ALCHEMY_MAINNET_KEY=<your key>
```

After that, just run `yarn` or `npm install` to install the packages, and then `yarn snapshot` or `npm run snapshot`!

