import fs from 'fs';
const saveNewAssetOrder = () => {
    const assets: {
        token_id: string;
        token_metadata: string;
    }[] = JSON.parse(fs.readFileSync(`./good-minds-nft.json`, { encoding: 'utf8' }));

    const out: number[] = [];
    assets.sort((a, b) => +a.token_id - +b.token_id);
    assets.forEach(asset => {
        const slashSplit = asset.token_metadata.split('/');
        out.push(+slashSplit[slashSplit.length - 1]);
    });

    fs.writeFileSync('./good-minds-meta-out.json', JSON.stringify(out));
};

saveNewAssetOrder();