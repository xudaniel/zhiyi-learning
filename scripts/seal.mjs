import {webcrypto,createHash} from 'node:crypto';
const {subtle}=webcrypto;
export const hash=text=>createHash('sha256').update(text).digest('hex');
export async function passwordKey(password,salt,iterations){
 const material=await subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(html,password){
 if(!password)throw Error('Set ZHIYI_COURSE_PASSWORD before building; no default password is provided.');
 const salt=webcrypto.getRandomValues(new Uint8Array(16)),iv=webcrypto.getRandomValues(new Uint8Array(12)),iterations=210000;
 const key=await passwordKey(password,salt,iterations);
 const ciphertext=await subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(html));
 return {format:1,kdf:'PBKDF2-SHA256',cipher:'AES-256-GCM',iterations,salt:Buffer.from(salt).toString('base64'),iv:Buffer.from(iv).toString('base64'),ciphertext:Buffer.from(ciphertext).toString('base64'),sourceHash:hash(html)};
}
export async function unseal(payload,password){
 const key=await passwordKey(password,Buffer.from(payload.salt,'base64'),payload.iterations);
 return new TextDecoder().decode(await subtle.decrypt({name:'AES-GCM',iv:Buffer.from(payload.iv,'base64')},key,Buffer.from(payload.ciphertext,'base64')));
}
export function parsePayload(html){
 const match=html.match(/<script id="coursePayload" type="application\/json">([^<]+)<\/script>/);
 if(!match)throw Error('Encrypted course payload missing');
 return JSON.parse(match[1]);
}
