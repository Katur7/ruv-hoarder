import { readFileSync, writeFileSync, statSync } from 'fs';

const type = process.argv[2];

const list = await getList(type);
console.table(list);

async function getList(type) {
    if(cacheIsValid(type)) {
        console.log('Getting cached list');
        return JSON.parse(readFileSync(cachePath(type)))
    } else {
        console.log('Getting latest list from RUV');
        if(type === 'tv') {
            const url = 'https://api.ruv.is/api/programs/tv/all'
            const res = await fetch(url);
            const json = await res.json();
            const data = json.map(j => {
                return {
                    title: j.title,
                    id: j.id,
                    // image: j.image
                }
            });
            writeFileSync(cachePath(type), JSON.stringify(data));
            return data;
        } else if(type === 'kids') {
            const url = 'https://api.ruv.is/api/programs/krakkaruv/all';
            const res = await fetch(url);
            const json = await res.json();
            const data = json.reduce((acc, curr) => {
                if(curr.format === 'tv') {
                    acc.push({
                        title: curr.title,
                        id: curr.id,
                        // image: curr.image
                    });
                    return acc;
                } else {
                    return acc;
                }
            }, []);
            writeFileSync(cachePath(type), JSON.stringify(data));
            return data;
        } else {
            console.error('Usage: npm run list tv|kids');
            process.exit(1);
        }
    }
}

function cacheIsValid(type) {
    try {
        const today = new Date();
        const {mtime} = statSync(cachePath(type));
        return today.getFullYear() === mtime.getFullYear()
            && today.getMonth() == mtime.getMonth()
            && today.getDate() == mtime.getDate();
    } catch (error) {
        return false;
    }
}

function cachePath(type) {
    return `./cache/.${type}_list.cache`;
}