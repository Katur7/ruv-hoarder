import { getList } from './shared/list.js';

const type = process.argv[2];

const list = await getList(type);
console.table(list);
