import { readFileSync, readdirSync, statSync } from 'fs';
import { rm } from 'fs/promises';
import { hrtime } from 'process';
import cliProgress from 'cli-progress';
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path';

const showsConfig = JSON.parse(readFileSync('./config/shows.json'));
const arg = process.argv[2];

const filteredShows = (arg === 'all')
                        ? showsConfig.filter(s => s.compress)
                        : showsConfig.filter(s => s.title == arg);

for(const showConfig of filteredShows) {
    console.log('##### Starting to check and compress ' + showConfig.title);
    const uncompressedEpisodes = listUncompressedEpisodes(showConfig);
    // compressEpisode(showConfig, uncompressedEpisodes[0])
    for(const episode of uncompressedEpisodes) {
        await compressEpisode(showConfig, episode);
        await deleteUncompressed(showConfig, episode);
    }
}

function listUncompressedEpisodes(showConfig) {
    const list = readdirSync(showConfig.path);
    const uncompressed = list.filter(x => x.endsWith('.mp4'))
                             .filter(x => !x.includes('.hevc'));
    return uncompressed;
}

async function compressEpisode(showConfig, episode) {
    return new Promise((resolve) => {
        try {
            console.log('Compressing', episode);
            const start = hrtime.bigint();
            const barOpt = {
                format: '{bar} {percentage}% | ETA: {eta}s'
            }
            const bar = new cliProgress.SingleBar(barOpt, cliProgress.Presets.shades_classic);
            bar.start(100, 0);
            const path = join(showConfig.path, episode);
            ffmpeg(path)
                .videoCodec('libx265')
                .outputOptions('-crf 20')
                .on('error', function(err, stdout, stderr) {
                    console.error('Cannot process video: ' + err.message);
                    throw new Error(err);
                })
                .on('progress', function(progress) {
                    bar.update(progress.percent);
                })
                .on('end', function(stdout, stderr) {
                    bar.update(100);
                    bar.stop();
                    printStats(path, start)
                    resolve();
                })
                .save(path.replace('.mp4', '.hevc.mp4'));
        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
            console.log(e);
            throw e;
        }
    })
}

async function deleteUncompressed(showConfig, episode) {
    console.log('Deleting uncompressed version of', episode);
    const path = join(showConfig.path, episode);
    return await rm(path); 
}

function printStats(path, startTime) {
    const end = hrtime.bigint();
    const seconds = (end - startTime) / 1000000000n;
    console.log(`Compressing took ${seconds} seconds`);

    const uncompressedSize = (statSync(path).size / (1024*1024)).toFixed(1);
    const compressedSize = (statSync(path.replace('.mp4', '.hevc.mp4')).size / (1024*1024)).toFixed(1);
    const ratio = ((compressedSize / uncompressedSize) * 100);
    const compression = (100 - ratio).toFixed(2);
    console.log(`Reduced size from ${uncompressedSize} to ${compressedSize} => ${compression}% compression`);

    if(compression < 40) {
        throw new Error('No use in compressing; set compress to false');
    }
}
