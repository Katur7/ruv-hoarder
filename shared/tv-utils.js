import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { download } from 'node-hls-downloader';
import { logger } from '../logger.js'
import { cacheIsValid, cachePath } from './cache.js';

export async function downloadEpisodes(missingEpisodes, showConfig) {
    if(missingEpisodes.length > 0 && showConfig.thetvdb) {
        console.log('Episodes with wrong numbers; rename according to thetvdb');
        console.log(showConfig.thetvdb);
    }
    for(const episode of missingEpisodes) {
        const episodeNumber = showConfig.season !== undefined
            ? `S${pad(showConfig.season)}E${pad(episode.number)}`
            : episode.number;
        const invalid_named = showConfig.thetvdb ? ' invalid_named' : '';
        const fileName = `${showConfig.name} - ${episodeNumber} - ${episode.title}${invalid_named}.mp4`;
        episode.path = join(showConfig.path, fileName);
        ensurePathExists(showConfig.path);
    
        console.log('Downloading ' + fileName);
        await download({
            concurrency: 10,
            outputFile: episode.path,
            streamUrl: maybeGet720pUrl(episode),
            logger: logger,
            maxRetries: 10
        });
        addDownloadedEpisode(showConfig, episode)
    }
}

export async function listAvailableEpisodes(showConfig) {
    if(cacheIsValid(cachePath(showConfig.title))) {
        console.log('Getting cached episode list for ' + showConfig.title);
        return JSON.parse(readFileSync(cachePath(showConfig.title)))
    } else {
        const url = `https://api.ruv.is/api/programs/program/${showConfig.id}/all`;
        const res = await fetch(url);
        const json = await res.json();
        const episodes = json.episodes;
        writeFileSync(cachePath(showConfig.title), JSON.stringify(episodes));
        return episodes;
    }
}

export function listDownloadedEpisodes(showConfig) {
    try {
        const json = readFileSync(join(showConfig.path, `.${showConfig.title}_downloaded.json`));
        const episodes = JSON.parse(json);
        return episodes.map(e => e.id);
    } catch (error) {
        return [];
    }
}

export function addDownloadedEpisode(showConfig, episode) {
    const entry = { id: episode.id, number: episode.number, title: episode.title };
    const path = join(showConfig.path, `.${showConfig.title}_downloaded.json`);
    try {
        const json = readFileSync(path);
        const episodes = JSON.parse(json);
        episodes.push(entry);
        writeFileSync(path, JSON.stringify(episodes));
    } catch (error) {
        writeFileSync(path, JSON.stringify([entry]));
    }
}

export function listMissingEpisodes(availableEpisodes, downloadedEpisodes) {
    return availableEpisodes.reduce((acc, curr) => {
        if(!downloadedEpisodes.includes(curr.id)) {
            acc.push(curr);
        } else {
            console.log('Skipping', curr.number, `(${curr.title})`)
        }
        return acc;
    }, []);
}

export function maybeGet720pUrl(episode) {
    const { file, event } = episode;
    if(file.endsWith('U0.m3u8')) {
        // Only 3600 (1080p) quality exists
        console.log('Only 1080p quality exists; run command to compress');
        console.log(`$ ffmpeg -i ${episode.path} -vcodec libx265 -crf 28 ${episode.path.replace('.mp4', ' - compressed.mp4')}`);
        const re = new RegExp(event.toString() + 'U0.m3u8');
        return file.replace(re, '3600/index.m3u8');
    } else {
        const re = new RegExp(event.toString() + '[TA]0.m3u8');
        return file.replace(re, '2400/index.m3u8');
    }
}

export function ensurePathExists(dir) {
    if (!existsSync(dir)){
        mkdirSync(dir, { recursive: true });
    }
}

function pad(number) {
    return number.toString().padStart(2, '0');
}
