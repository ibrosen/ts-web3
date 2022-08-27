import axios from 'axios';
import { ethers } from 'ethers';
// import abi from "./abi.json";

import fs from 'fs';
import https from 'https';
import path from 'path';
import sharp from 'sharp';
import abiNouns from "../abis/abi2.json";

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
};

const write = async () => {
    console.log("calling");

    const res = await contract.safeMint(walletAddr);
    console.log(res);
};

interface UploadTraitType { value: string, url: string; }

type UploadCollectionTraits = {
    rootHash: string;
    collectionName: string;
    traits: Record<string, UploadTraitType[]>;
};


export const saveAllLayers = async () => {
    const collectionTraits: UploadCollectionTraits = { rootHash: '', collectionName: 'nouns', traits: {} };
    const relativeLayersFolder = '../layers/nouns/';
    let ipfsImageArray: { path: string, content: string; }[] = [];
    var files = fs.readdirSync(__dirname + '/' + relativeLayersFolder);
    for (let i = 0; i < files.length; i++) {
        const currFile = files[i];
        if (currFile.includes('copy')) continue;
        console.log(currFile);
        const img = fs.readFileSync("layers/nouns/" + currFile, { encoding: 'base64' });


        ipfsImageArray.push(
            {
                path: currFile,
                content: img,
            },
        );

    }

    try {
        const r = await axios.post<{ path: string; }[]>('https://deep-index.moralis.io/api/v2/ipfs/uploadFolder',
            ipfsImageArray,
            {
                headers: {
                    'X-API-KEY': process.env.MORALIS_API_KEY!,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            },
        );
        const aPath = r.data[0].path;
        collectionTraits.rootHash = aPath.substring(aPath.indexOf('/Qm')).split('/')[1];

        r.data.forEach(d => {


            const pathComponents = d.path.replace('.png', '').split('/');
            const fileCleaned = pathComponents[pathComponents.length - 1];
            const traitType = fileCleaned.split('-')[0];
            const traitValue = fileCleaned.replace(traitType + '-', '');

            if (!collectionTraits.traits[traitType]) collectionTraits.traits[traitType] = [];

            collectionTraits.traits[traitType].push({ value: traitValue, url: fileCleaned + '.png' });

        });
        console.log(r.data);

    } catch (e) {
        console.log(e);
    }

    const r = await axios.post<{ path: string; }[]>('https://deep-index.moralis.io/api/v2/ipfs/uploadFolder',
        [{ path: 'layers.json', content: collectionTraits }],
        {
            headers: {
                'X-API-KEY': process.env.MORALIS_API_KEY!,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
        },
    );
    console.log(r.data);

    console.log(collectionTraits);
    return collectionTraits;
};

interface LoadTraitType { value: string, url: string; data: Buffer; }
type LoadCollectionTraits = {
    layerHash: string;
    collectionName: string;
    traits: Record<string, LoadTraitType[]>;
};

const ipfsGatewayUrl = 'https://ipfs.moralis.io:2053/ipfs/';

const loadAllLayers = async () => {

    const layers: LoadCollectionTraits = {
        // layerHash: 'QmZ6mcScDMKiYt49fddbMzFwmfmc6os2a7QsbeJ7ocZP2M'
        layerHash: 'QmaJejnUuxHgT7dyUTKusDGnTfgnwBnQBRk4nReUrNAT4U'
        , collectionName: 'nouns', traits: {}
    };
    const r = await axios.get<UploadCollectionTraits>(`${ipfsGatewayUrl}${layers.layerHash}/layers.json`);
    const httpsAgent = new https.Agent({ keepAlive: true });
    console.log(r.data);
    const promises: Promise<void>[] = [];
    Object.entries(r.data.traits).forEach(([traitType, traits]) => {
        traits.forEach((trait, i) => {
            const get = async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, i * 20);
                });
                const buffer = Buffer.from(await sharp((await axios.get(
                    `${ipfsGatewayUrl}${r.data.rootHash}/${trait.url}`,
                    { responseType: 'arraybuffer', httpsAgent },
                )).data)
                    .toBuffer());

                if (!layers.traits[traitType]) layers.traits[traitType] = [];
                layers.traits[traitType].push({ data: buffer, ...trait });
                console.log(`Successfully downloaded ${trait.url}!`);
                await sharp(buffer).toFormat('png').toFile(__dirname + '/../test/nouns/' + trait.url);
            };
            promises.push(get());

        });
    });

    await Promise.all(promises);

    console.log(layers);
    return layers;
};

// loadAllLayers();

// const attemptMergeImages = async () => {


//     // // const image64 = await mergeImages(
//     // [ '../layers/nouns/bg.png', '../layers/nouns/accessory-aardvark.png','../layers/nouns/head-bell.png']
//     // );



//     const width = 2880;
//     const height = 2880;
//     var canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');


//     const image64 = await mergeImages(['../layers/nouns/bg.png', '../layers/nouns/accessory-aardvark.png', '../layers/nouns/head-bell.png'], {
//         Canvas: Canvas,
//         Image: Image
//     });
//     console.log(image64);
//     const img = sharp(image64).toFormat('png').toFile('./test.png');

// };

const attempt2 = async () => {
    const background = path.resolve(__dirname, `../layers/nouns/bg-warm.png`);
    const accessory = path.resolve(__dirname, `../layers/nouns/accessory-aardvark.png`);
    // const head = path.resolve(__dirname, `../layers/nouns/head-bell.png`);
    const body = path.resolve(__dirname, `../layers/nouns/body-rust.png`);

    const layers = await loadAllLayers();
    layers.traits['head'][1].data;

    const start = Date.now();
    await sharp(background)
        .composite([
            { input: body, },
            { input: layers.traits['head'][0].data, },
            { input: accessory },
        ])
        .toFile('combined.png');

    console.log(Date.now() - start);
};
attempt2();

