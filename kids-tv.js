import { readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { download } from 'node-hls-downloader';
import { logger } from './logger.js'

const showsConfig = JSON.parse(readFileSync('./config/shows.json'));

for(const showConfig of showsConfig) {
    console.log('##### Starting to check and download ' + showConfig.title);
    const availableEpisodes = await listAvailableEpisodes(showConfig);
    const downloadedEpisodes = listDownloadedEpisodes(showConfig);
    const missingEpisodes = listMissingEpisodes(availableEpisodes, downloadedEpisodes);

    downloadEpisodes(missingEpisodes, showConfig)
}

async function downloadEpisodes(missingEpisodes, showConfig) {
    for(const episode of missingEpisodes) {
        const episodeNumber = showConfig.season !== undefined
            ? `S${pad(showConfig.season)}E${pad(episode.number)}`
            : episode.number;
        const fileName = `${showConfig.name} - ${episodeNumber} - ${episode.title}.mp4`;
        const path = join(showConfig.path, fileName);
    
        console.log('Downloading ' + fileName);
        await download({
            concurrency: 25,
            outputFile: path,
            streamUrl: maybeGet720pUrl(episode),
            logger: logger
        });
        addDownloadedEpisode(showConfig, episode)
    }
}

async function listAvailableEpisodes(showConfig) {
    if(cacheIsValid(showConfig.title)) {
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

function listDownloadedEpisodes(showConfig) {
    try {
        const json = readFileSync(join(showConfig.path, `.${showConfig.title}_downloaded.json`));
        const episodes = JSON.parse(json);
        return episodes.map(e => e.id);
    } catch (error) {
        return [];
    }
}

function addDownloadedEpisode(showConfig, episode) {
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

function listMissingEpisodes(availableEpisodes, downloadedEpisodes) {
    return availableEpisodes.reduce((acc, curr) => {
        if(!downloadedEpisodes.includes(curr.id)) {
            acc.push(curr);
        } else {
            console.log('Skipping', curr.number, `(${curr.title})`)
        }
        return acc;
    }, []);
}

function cacheIsValid(title) {
    try {
        const today = new Date();
        const {mtime} = statSync(cachePath(title));
        return today.getFullYear() === mtime.getFullYear()
            && today.getMonth() == mtime.getMonth()
            && today.getDate() == mtime.getDate();
    } catch (error) {
        return false;
    }
}

function cachePath(title) {
    return `./cache/.${title}.cache`;
}

function maybeGet720pUrl(episode) {
    const { file, event } = episode;
    return file.replace(event.toString() + 'T0.m3u8', '2400/index.m3u8');
}

function pad(number) {
    return number.toString().padStart(2, '0');
}
