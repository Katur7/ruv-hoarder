import { readFileSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { download } from 'node-hls-downloader';
import { getList } from './shared/list.js';
import { cacheIsValid } from './shared/cache.js';
import { logger } from './logger.js'

const search = process.argv[2];
const index = process.argv[3];

if(search === undefined) {
    console.error('Usage: npm run movie "search_term"');
    process.exit(1);
}

const list = await getList('tv');
const result = list.filter(x => x.title.includes(search));

if(result.length === 0) {
    console.log('Sorry nothing found with that search term');
} else if(result.length === 1) {
    const info = await getProgramInfo(result[0]);
    await downloadMovie(info);
    if(info.subtitles) {
        downloadSubtitles(info);
    }
} else {
    if(index) {
        const info = await getProgramInfo(result[index]);
        await downloadMovie(info);
        if(info.subtitles) {
            downloadSubtitles(info);
        }
    } else {
        console.log('Found multiple result. Please try again with a more specific search term');
        console.log('Found:');
        console.table(result);
    }
}

async function getProgramInfo(program) {
    if(cacheIsValid(cachePath(program.title))) {
        console.log('Getting cached program info for ' + program.title);
        return JSON.parse(readFileSync(cachePath(program.title)))
    } else {
        const url = `https://api.ruv.is/api/programs/program/${program.id}/all`;
        const res = await fetch(url);
        const json = await res.json();
        const title = json.foreign_title || json.title;
        const info = {
            id: json.id,
            title: title,
            file: json.episodes[0].file,
            subtitles: json.episodes[0].subtitles_url,
            path: join('/media/grimur/movies', title)
        }
        writeFileSync(cachePath(program.title), JSON.stringify(info));
        return info;
    }
}

async function downloadMovie(info) {
    console.log('Downloading ' + info.title);
    await mkdir(info.path, { recursive: true });
    await download({
        concurrency: 10,
        outputFile: join(info.path, info.title + '.mp4'),
        streamUrl: info.file,
        logger: logger,
        quality: 'best',
        maxRetries: 10
    });
}

async function downloadSubtitles(info) {
    const res = await fetch(info.subtitles);
    const data = await res.text();
    writeFileSync(join(info.path, info.title + '.is.vtt'), data);
}

function cachePath(title) {
    return `./cache/.${title}.cache`;
}