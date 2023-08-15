import { getEpisodeInfoSimple, getEpisodeStreamUrl, downloadEpisode } from './downloader.js';
import { getEpisodeInventory } from './inventory.js';
import { blueyTitleToEpisodeNr } from './bluey-title.js';

const basePath = '/mnt/Storage/kids/tv';
const invalidNamesPath = '/mnt/Storage/kids/invalid_named'

const smurfs          = { id: '33816', name: 'The Smurfs (2021)', invalid_names: true };    // Strumparnir
const pawPatrol       = { id: '31660', name: 'Paw Patrol', invalid_names: true };           // Hvolpasveitin
const smastund        = { id: '33098', name: 'Smástund' };                                  // Smástund

const programs = [
    numberblocks
];

for(const p of programs) {
    console.log('##### Starting to check and download ' + p.name);
    await downloadEpisodes(p);
    console.log();

    // Add polite wait
    await delay(1000);
}

async function downloadEpisodes(program) {
    const path = `${program.invalid_names ? invalidNamesPath : basePath}/${program.name}`;
    const inventory = await getEpisodeInventory(path, program.invalid_names);
    // console.log(inventory);
    
    const episodesInfo = await getEpisodeInfoSimple(program.id);
    // console.log(episodesInfo)
    
    for(const {id, title} of episodesInfo) {
        // Only download episodes we don't have already
        const fixedTitle = fixTitle(program.name, title);
        if(!inventory.includes(fixedTitle)) {
            try {
                const streamUrl = await getEpisodeStreamUrl(program.id, id);
                console.log('Downloading ' + fixedTitle);
                await downloadEpisode(streamUrl, `${path}/${fixedTitle}`);
            } catch (error) {
                console.error(`Downloading ${fixedTitle} failed; Skipping. Error was:`);
                console.error(error);
                continue;
            }

            // Add polite wait
            await delay(1000);
        } else {
            console.log('Skipping ' + fixedTitle);

            // Add polite wait
            await delay(250);
        }
    }

}

function fixTitle(programName, episodeTitle) {
    if(programName === pawPatrol.name) {
        const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        return `${programName} - ${episodeNumber}.mp4`;
    } else {
        return `${programName} - ${episodeTitle}.mp4`;
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
