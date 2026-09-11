import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {compileCourse,root,read} from './course.mjs';
import {seal,unseal,hash,parsePayload} from './seal.mjs';
export async function renderGate(payload){
 const {version}=JSON.parse(await read('package.json'));
 return (await read('src/gate.html')).replace('__GATE_STYLE__',await read('src/gate.css')).replace('__GATE_SCRIPT__',await read('src/gate.js')).replace('__PAYLOAD__',JSON.stringify(payload)).replaceAll('__VERSION__',version);
}
async function main(){
 const html=await compileCourse(),password=process.env.ZHIYI_COURSE_PASSWORD;
 if(process.argv.includes('--check')){
  const saved=await read('docs/index.html'),payload=parsePayload(saved);
  if(payload.format!==1||payload.kdf!=='PBKDF2-SHA256'||payload.cipher!=='AES-256-GCM'||payload.iterations!==210000||Buffer.from(payload.salt,'base64').length!==16||Buffer.from(payload.iv,'base64').length!==12||Buffer.from(payload.ciphertext,'base64').length!==Buffer.byteLength(html)+16)throw Error('Invalid encrypted payload');
  if(payload.sourceHash!==hash(html)||await renderGate(payload)!==saved)throw Error('Generated page is stale; rebuild with the course password.');
  if(password&&await unseal(payload,password)!==html)throw Error('Course content mismatch');
  console.log('PASS: committed gate matches current source'+(password?' and decrypts to the complete course.':'. Decryption is checked separately with a supplied password.'));
  return;
 }
 const payload=await seal(html,password);
 await mkdir(path.join(root,'docs'),{recursive:true});
 await writeFile(path.join(root,'docs/.nojekyll'),'');
 await writeFile(path.join(root,'docs/index.html'),await renderGate(payload));
 console.log('Built encrypted docs/index.html (self-contained, offline-capable)');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(root,'scripts/build.mjs'))await main();
