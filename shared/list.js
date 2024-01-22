import { readFileSync, writeFileSync, statSync } from 'fs';

export async function getList(type) {
    if(cacheIsValid(type)) {
        console.log('Getting cached list');
        return JSON.parse(readFileSync(cachePath(type)))
    } else {
        console.log('Getting latest list from RUV');
        const url = urlFromType(type);
        const res = await fetch(url);
        const json = await res.json();
        const programs = combinePanels(json.panels);
        const data = programs.reduce((acc, curr) => {
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
    }
}

function urlFromType(type) {
    if(type === 'tv') {
        return 'https://api.ruv.is/api/programs/featured/tv';
    } else if(type === 'kids') {
        return 'https://api.ruv.is/api/programs/featured/krakkaruv';
    } else {
        console.error('Usage: npm run list tv|kids');
        process.exit(1);
    }
}

function combinePanels(panels) {
    const allPrograms = new Map();
    panels.map(p => {
        p.programs.map(prog => {
            allPrograms.set(prog.id, prog);
        });
    });
    return Array.from(allPrograms.values());
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