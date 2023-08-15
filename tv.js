import { getEpisodeInfoSimple, getEpisodeStreamUrl, downloadEpisode } from './downloader.js';
import { getEpisodeInventory } from './inventory.js';

const tvPath = '/mnt/Storage/tv';

const exit      = { id: '34079', name: 'Exit (2019)', season: 3 };

const programs = [
    exit
];

for(const p of programs) {
    console.log('##### Starting to check and download ' + p.name);
    await downloadEpisodes(p);
    console.log();

    // Add polite wait
    await delay(1000);
}

async function downloadEpisodes(program) {
    const path = `${tvPath}/${program.name}/Season ${program.season}`;
    const inventory = await getEpisodeInventory(path);
    
    const episodesInfo = await getEpisodeInfoSimple(program.id);
    
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
        } else {
            console.log('Skipping ' + fixedTitle);
        }
    }

}

function fixTitle(programName, episodeTitle) {
    if(programName === exit.name) {
        const [episodeNumber, title] = episodeTitle.split('. ');
        return `${programName} - S${exit.season.toString().padStart(2, '0')}E${episodeNumber.padStart(2, '0')} - ${title}.mp4`
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 
