import { downloadEpisode } from './downloader.js';

async function downloadMovie(url, name) {
    try {      
        console.log('Downloading ' + name);
        await downloadEpisode(url, `./${name}.mp4`);
    } catch (error) {
        console.error(`Downloading ${name} failed; Skipping. Error was:`);
        console.error(error);
    }
}

downloadMovie('https://ruv-vod.akamaized.net/opid/5315394T0/5315394T0.m3u8', 'Með allt á hreinu (1982)')
