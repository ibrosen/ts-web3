# Contract minter tool
Sometimes you just really want to know who all the minters of a project were. This tool will work with any ERC721 contract, saving a mapping of `{mintAddress:numberMinted}` to the `out/` directory. Enjoy!

# Getting started
The code is super simple. It gets all of a contract's `Transfer` events that originated from the null address. That's it, pretty straightforward.

Before running the code, check out the root [README Getting Started](../../README.md#Getting-Started)'s