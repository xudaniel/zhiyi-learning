import {mkdir,writeFile} from 'node:fs/promises';
import {corpus} from '../server/corpus.mjs';
if(corpus.length!==13)throw Error('Course corpus incomplete');
await mkdir(new URL('../backend-public/',import.meta.url),{recursive:true});
await writeFile(new URL('../backend-public/index.html',import.meta.url),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>知易课程助教服务</title><body><h1>知易课程助教服务</h1><p>开发者 Daniel Xu</p><a href="https://xudaniel.github.io/zhiyi-learning/#tutor">返回课程学习书房</a></body></html>');
console.log('Tutor deployment artifact prepared; course remains on GitHub Pages.');
