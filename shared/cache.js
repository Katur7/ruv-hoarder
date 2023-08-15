import { statSync } from 'fs';


export function cacheIsValid(cachePath) {
    try {
        const today = new Date();
        const {mtime} = statSync(cachePath);
        return today.getFullYear() === mtime.getFullYear()
            && today.getMonth() == mtime.getMonth()
            && today.getDate() == mtime.getDate();
    } catch (error) {
        return false;
    }
}