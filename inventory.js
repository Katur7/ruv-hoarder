import fs from 'fs/promises';

export async function getEpisodeInventory(path, invalid_named) {
    try {
        if(invalid_named) {
            return await getInvalidNamedEpisodeInventory(path);
        } else {
            const dir = await fs.readdir(path);
            return dir.filter(f => f.endsWith('.mp4'));
        }
    } catch (error) {
        if(error.code === 'ENOENT') {
            // Folder does not exist; create it
            fs.mkdir(path);
            return [];
        }
    }
}

async function getInvalidNamedEpisodeInventory(path) {
    const dir = await fs.readdir(path);
    const fixedFolder = await fs.readdir(`${path}/fixed`);
    return [].concat(dir, fixedFolder).filter(f => f.endsWith('.mp4'));
}