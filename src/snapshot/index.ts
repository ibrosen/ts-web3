import fs from 'fs';
import Web3 from 'web3';

require('dotenv').config({ path: require('find-config')('.env') });

const snapshotOwners = async (addr: string, blockNum: number, filePrefix: string, rpcProviderUrl: string, fallbackTotalSupply?: number) => {
    // set provider for all later instances to use
    const provider = new Web3.providers.HttpProvider(rpcProviderUrl);
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract([
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },], addr, {});

    let totalSupply: number;

    try {
        totalSupply = +(await contract.methods.totalSupply().call({}, blockNum));

    } catch (e) {
        console.log(e);
        console.log(`❌ Couldn't get totalSupply for ${addr}`);
        if (fallbackTotalSupply) {
            totalSupply = fallbackTotalSupply;
        } else {
            console.log('Please provide a fallback totalSupply.');
            throw new Error("No fallback totalSupply provided");
        }
    }

    const owners: Record<string, string> = {};
    const filePath = `${__dirname}/out/${filePrefix}-snapshot.json`;
    const outDirPath = __dirname + "/out";
    for (let i = 0; i < totalSupply; i++) {
        // Add a 100ms buffer in between calls, in order to not run over Alchemy's free tier
        // max compute usage per second
        setTimeout(async () => {
            owners[i] = `${(await contract.methods.ownerOf(i).call({}, blockNum))}`;
            process.stdout.write(`⛳️ Found owner for tokenID:${i}\r`);

            // If this is the last call, write
            if (Object.values(owners).length === totalSupply) {
                if (!fs.existsSync(outDirPath)) fs.mkdirSync(outDirPath);
                fs.writeFileSync(filePath, JSON.stringify(owners));
                console.log(`\n🏄‍♂️ Successfully saved the file to "${filePath}"`);
            }
        }, i * 100);
    }
};

snapshotOwners('0x8E3CD80a9D54a564ad12773406E5e0150a73cf4e', 15415224, 'test-collection', 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_MAINNET_KEY);
