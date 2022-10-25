import fs from 'fs';
import Web3 from 'web3';
import { sleep } from '../utils';

require('dotenv').config({ path: require('find-config')('.env') });

const snapshotOwners = async (addr: string, blockNum: number, filePrefix: string, rpcProviderUrl: string, fallbackTotalSupply?: number) => {
    // Instantiate contract
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

    let owners: Record<string, string> = {};
    const outDirPath = __dirname + "/out";
    const filePath = `${outDirPath}/${filePrefix}-snapshot.json`;
    let start = 0;
    if (fs.existsSync(filePath)) {
        owners = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
        start = Object.keys(owners).length
        console.log(`Found ${start} already saved, skipping`)
    }
    for (let i = start; i < totalSupply; i++) {
        // Add a 100ms buffer in between calls, in order to not run over Alchemy's free tier
        // max compute usage per second
        owners[i] = `${(await contract.methods.ownerOf(i).call({}, blockNum))}`;
        process.stdout.write(`⛳️ Found owner for tokenID:${i}\r`);

        // If this is the last call, write
        if (Object.values(owners).length % 500 === 0 || Object.values(owners).length === totalSupply) {
            if (!fs.existsSync(outDirPath)) fs.mkdirSync(outDirPath);
            fs.writeFileSync(filePath, JSON.stringify(owners));
            console.log(`\n🏄‍♂️ Successfully saved the file to "${filePath}"`);
        }
        await sleep(100)
    }
};

snapshotOwners('0xda64C62254E6ffE6783Dd00472559A1744512846', 15826796, 'good-minds', 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_MAINNET_KEY);
