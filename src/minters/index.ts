import fs from 'fs';
import Web3 from 'web3';
import { NULL_ADDRESS } from '../constants';

require('dotenv').config({ path: require('find-config')('.env') });

const getAllMintoooors = async (addr: string, jsonRpcUrl: string) => {
    const provider = new Web3.providers.HttpProvider(jsonRpcUrl);
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract([
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },], addr, {});

    const events = await contract.getPastEvents('Transfer', {
        // A transfer from the null address = a mint
        filter: { from: NULL_ADDRESS },
        fromBlock: 0,
        toBlock: 'latest'
    }, function (error, events) { if (error) console.log(error); });

    const mintMap: Record<string, number> = {};
    events.forEach(e => {
        const mintoooor: string = e.returnValues['1'];
        if (!mintMap[mintoooor]) mintMap[mintoooor] = 0;

        mintMap[mintoooor]++;
    });

    const mintAmounts = Object.values(mintMap).sort((a, b) => b - a);

    console.log(`There were ${Object.keys(mintMap).length} unique mintoors`);
    console.log(`Median mint amount: ${mintAmounts[mintAmounts.length / 2]}`);
    console.log("Top 10 mintooors minted:");
    console.dir(mintAmounts.slice(0, 10));

    fs.writeFileSync(`${__dirname}/out/mintooors-snapshot.json`, JSON.stringify(mintMap));
};

getAllMintoooors('0xda64c62254e6ffe6783dd00472559a1744512846', 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_MAINNET_KEY);