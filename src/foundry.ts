import { ethers } from 'ethers';
// import abi from "./abi.json";
import abiNouns from "./abi2.json";
require('dotenv').config({ path: require('find-config')('.env') });


export interface NounsTokenMetadata {
    name: string;
    description: string;
    image: string;
}

const providerInstance =
    new ethers.providers.JsonRpcProvider(
        // 'http://127.0.0.1:8545'
        'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_MAINNET_KEY
    );

const walletAddr = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

var wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, providerInstance);

const addr = '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03';
// const addr='0x5FbDB2315678afecb367f032d93F642f64180aa3'

const contract =
    new ethers.Contract(addr, abiNouns, wallet);
const read = async () => {
    console.log("calling");

    const res = await contract.dataURI(0);
    console.log(res);
    const data: NounsTokenMetadata = JSON.parse(
        Buffer.from(res.substring(29), 'base64').toString('ascii'),
    );
    console.log(data);
    // console.log(JSON.parse(atob(res)));
    // console.log(Buffer.from(res, 'base64'));
};

const write = async () => {
    console.log("calling");

    const res = await contract.safeMint(walletAddr);
    console.log(res);
};

read();