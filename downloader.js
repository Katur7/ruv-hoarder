import { download } from 'node-hls-downloader';

export async function getEpisodeInfo(programTitle, id) {
    const url = `https://www.ruv.is/gql/?operationName=getEpisode&variables=%7B%22programID%22%3A${id}%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22f3f957a3a577be001eccf93a76cf2ae1b6d10c95e67305c56e4273279115bb93%22%7D%7D`;
    const programInfo = await fetch(url).then(r => r.json());
    return programInfo.data.Program.episodes.map(e => {
        return {
            id: e.id,
            title: getTitle(programTitle, e.title)
        }
    });
}

export async function getEpisodeInfoSimple(id) {
    const url = `https://www.ruv.is/gql/?operationName=getEpisode&variables=%7B%22programID%22%3A${id}%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22f3f957a3a577be001eccf93a76cf2ae1b6d10c95e67305c56e4273279115bb93%22%7D%7D`;
    const programInfo = await fetch(url).then(r => r.json());
    return programInfo.data.Program.episodes.map(e => {
        return {
            id: e.id,
            title: e.title
        }
    });
}

export async function getEpisodeStreamUrl(programId, episodeId) {
    const episode = await fetch("https://www.ruv.is/gql/", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: `{"operationName":"getProgram","variables":{"id":${programId}},"query":"query getProgram($id: Int!) { Program(id: $id) {\\n    title\\n    episodes(limit: 1, id: {value: \\"${episodeId}\\"}) {\\n      title\\n      file\\n    }\\n  }\\n}\\n\"}`
    }).then(r => r.json())
      .then(json => json.data.Program.episodes[0]);

    return episode.file
}

// https://www.ruv.is/gql/?operationName=getProgram&variables=%7B%22id%22%3A29670%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%225c164567e45fa0b0ae9ff7048c593f53e647365edf6446f8d3cb21edcc7abb00%22%7D%7D
// https://www.ruv.is/gql/?operationName=getProgram&variables=%7B%22id%22%3A29670%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%225c164567e45fa0b0ae9ff7048c593f53e647365edf6446f8d3cb21edcc7abb00%22%7D%7D

export async function getMovieStreamUrl(programId, episodeId) {
    const data = {
        "operationName": "getProgram",
        "variables": {
            "id": programId
        },
        "query": `query getProgram($id: Int!) {\n  Program(id: $id) {\n    format\n    title\n    episodes(limit: 1, id: {value: \"${episodeId}\"}) {\n      title\n      file\n      scope\n      image\n      rating\n      clips {\n        time\n        text\n        slug\n        __typename\n      }\n      subtitles {\n        name\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n`
    }
    const episode = await fetch("https://www.ruv.is/gql/", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify(data)
    }).then(r => r.json())
      .then(json => json.data.Program.episodes[0]);

    return episode
}

function getTitle(programTitle, episodeTitle) {
    const titleArr = episodeTitle.split(' ');
    if(titleArr[0] == 'Þáttur') {
        if(programTitle === 'The Smurfs (2021)') {
            return `${programTitle} - S01E${titleArr[1].padStart(2, '0')}.mp4`;
        } else {
            return `${programTitle} - ${titleArr[1]}.mp4`;
        }
    } else {
        return `${programTitle} - S01E${episodeTitle.padStart(2, '0')}.mp4`
    }
}

export async function downloadEpisode(url, outputName) {
    return download({
        quality: 3999999,  // 720p, Þarf að sortera streams eftir stærð í download kóða
        concurrency: 10,
        outputFile: outputName,
        streamUrl: url,
    })
}
