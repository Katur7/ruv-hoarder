import { readFileSync } from 'fs';
import { downloadEpisodes,
         listAvailableEpisodes,
         listDownloadedEpisodes,
         listMissingEpisodes } from './shared/tv-utils.js';

const showsConfig = JSON.parse(readFileSync('./config/kids-shows.json'));

for(const showConfig of showsConfig.filter(s => s.download)) {
    console.log('##### Starting to check and download ' + showConfig.title);
    const availableEpisodes = await listAvailableEpisodes(showConfig);
    const downloadedEpisodes = listDownloadedEpisodes(showConfig);
    const missingEpisodes = listMissingEpisodes(availableEpisodes, downloadedEpisodes);

    await downloadEpisodes(missingEpisodes, showConfig);
    await delay(300);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
