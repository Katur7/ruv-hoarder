import cliProgress from 'cli-progress';

let totalSegments;
let receivedSegments;
const bar = new cliProgress.SingleBar({ stopOnComplete: true }, cliProgress.Presets.shades_classic);

export function logger(...args) {
    if(args[0].startsWith('Queueing')) {
        totalSegments = parseInt(args[0].split(' ')[1]);
        receivedSegments = 0;
        bar.start(totalSegments, 0);
    } else if(args[0].startsWith('Received:')) {
        receivedSegments++;
        bar.increment();
    } else if(args[0].startsWith('Spawning FFMPEG')) {
        console.log('Converting file')
    } else if(args[0].startsWith('All segments received')) {
    } else {
        console.log(...args);
    }
}