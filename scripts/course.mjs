import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const read=p=>readFile(path.join(root,p),'utf8');
const jsData=s=>JSON.stringify(JSON.parse(s)).replaceAll('<','\\u003c');
export async function compileCourse(){
 const {version}=JSON.parse(await read('package.json'));
 const app=(await read('src/app.js')).replace('__LESSONS__',jsData(await read('src/lessons.json'))).replace('__SOURCES__',jsData(await read('src/sources.json')));
 const image='data:image/jpeg;base64,'+(await readFile(path.join(root,'assets/wenchang-77.jpg'))).toString('base64');
 const method=(await read('src/method.js')).replaceAll('__WEN_IMAGE__',image);
 const script=app+'\n'+method+'\n'+await read('src/pinyin.js')+'\n'+await read('src/academy-core.js')+'\n'+(await read('src/academy.js')).replaceAll('__WEN_IMAGE__',image)+'\n'+await read('src/lock.js')+'\nrender();installPinyin();startAcademy();\n';
 if(script.toLowerCase().includes('</script>'))throw Error('Unexpected inline script terminator');
 return (await read('src/index.html')).replace('__STYLES__',await read('src/style.css')).replace('__APP__',script).replaceAll('__VERSION__',version)
 .replace('<title>知易 · 跟施老师从零学起</title>',`<title>知易 ${version} · 案例教学 · 拼音入门</title><meta name="description" content="按施老师课程方法，从零学习干支、五行、四柱。每次出现都带拼音，提供8步互动练习与12节短课。">`);
}
