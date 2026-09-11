import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileCourse} from '../scripts/course.mjs';
import {seal,unseal,parsePayload} from '../scripts/seal.mjs';
import {renderGate} from '../scripts/build.mjs';
const fixture='unit-test-only-password';
test('full course encrypts and restores exactly; each build uses fresh salt and nonce',async()=>{
 const html=await compileCourse(),a=await seal(html,fixture),b=await seal(html,fixture);
 assert.equal(await unseal(a,fixture),html);assert.notEqual(a.salt,b.salt);assert.notEqual(a.iv,b.iv);assert.notEqual(a.ciphertext,b.ciphertext);
 const gate=await renderGate(a);assert.deepEqual(parsePayload(gate),a);assert.ok(!gate.includes(fixture));
});
test('wrong password and modified ciphertext fail closed',async()=>{
 const payload=await seal('<main>Test course</main>',fixture);
 await assert.rejects(unseal(payload,'wrong-password'));
 const bytes=Buffer.from(payload.ciphertext,'base64');bytes[0]^=1;
 await assert.rejects(unseal({...payload,ciphertext:bytes.toString('base64')},fixture));
 await assert.rejects(seal('course',''));
});
test('published HTML contains only the gate and encrypted content',async()=>{
 const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
 const payload=parsePayload(html);assert.equal(payload.cipher,'AES-256-GCM');
 for(const text of ['const LESSONS=','const SOURCES=','const KEY=','data:image/jpeg;base64,','id="nav"','id="view"','__PAYLOAD__','__GATE_SCRIPT__'])assert.ok(!html.includes(text),text);
 assert.ok(html.includes('type="password"'));assert.ok(html.includes('crypto.subtle.decrypt'));
});
