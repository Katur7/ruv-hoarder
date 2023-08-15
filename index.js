// import { program } from 'commander';

import { getEpisodeInfoSimple, getEpisodeStreamUrl, downloadEpisode } from './downloader.js';
import { getEpisodeInventory } from './inventory.js';
import { blueyTitleToEpisodeNr } from './bluey-title.js';

const basePath = '/mnt/Storage/kids/tv';
const invalidNamesPath = '/mnt/Storage/kids/invalid_named'

const bluey           = { id: '34551', name: 'Bluey' };                                     // Blæja, S1: 31684, S2: 34551
const smurfs          = { id: '33816', name: 'The Smurfs (2021)', invalid_names: true };    // Strumparnir
const heyDuggee       = { id: '30699', name: 'Hey Duggee' };                                // Hæ Sámur
const bubbleGuppies   = { id: '30227', name: 'Bubble Guppies', invalid_names: true };       // Kúlugúbbarnir, old: 33516, S3: 30227
const numberblocks    = { id: '34994', name: 'Numberblocks' };                              // Tölukubbar, old: 30277, new: 34994
const pawPatrol       = { id: '31660', name: 'Paw Patrol', invalid_names: true };           // Hvolpasveitin
const smastund        = { id: '33098', name: 'Smástund' };                                  // Smástund

const programs = [
    // bluey
    // numberblocks
    bluey, heyDuggee, numberblocks, bubbleGuppies
    // bluey, smurfs, heyDuggee, bubbleGuppies, numberblocks,
    // pawPatrol,
    // smastund
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
    if(programName === bluey.name) {
        const season = 2;
        const episodeNumber = blueyTitleToEpisodeNr(season, episodeTitle);
        // const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        return `${programName} - S0${season}E${episodeNumber.padStart(2, '0')}.mp4`;
    } else if(programName === heyDuggee.name) {
        const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        return `${programName} - S01E${episodeNumber.padStart(2, '0')}.mp4`;
    } else if(programName === bubbleGuppies.name) {
        // const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        return `${programName} - ${episodeTitle}.mp4`;
    } else if(programName === numberblocks.name) {
        const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        const parsedEpNumber = parseInt(episodeNumber);
        if(parsedEpNumber <= 15) {
            return `${programName} - S01E${episodeNumber.padStart(2, '0')}.mp4`;
        } else {
            return `${programName} - S02E${parsedEpNumber - 15}.mp4`;
        }
    } else if(programName === pawPatrol.name) {
        const [episodeNumber, _totalEpisodes] = episodeTitle.match(/\d+/g);
        return `${programName} - ${episodeNumber}.mp4`;
    } else {
        return `${programName} - ${episodeTitle}.mp4`;
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
