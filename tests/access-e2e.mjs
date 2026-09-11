import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {unlockApp} from './access-helpers.mjs';
const url=process.env.APP_URL||new URL('../docs/index.html',import.meta.url).href;
const password=process.env.ZHIYI_COURSE_PASSWORD;
if(!password)throw Error('Set ZHIYI_COURSE_PASSWORD for access tests.');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const gateReady=()=>page.locator('#gateForm[data-ready="true"]').waitFor();
const appReady=()=>page.locator('#nav button').first().waitFor();
try{
 // All deep links must land at the gate without rendering course navigation or content.
 for(const route of ['journey/day','curriculum','tutor','studio','path','knowledge/day','about','home','courses','lesson','method','practice','cases','compare','sound','today','ask','review','notes','sources']){
  await page.goto(url+'#'+route);await gateReady();assert.equal(await page.locator('#nav,#view,.source-text,.case-work').count(),0);
 }
 await page.locator('#unlockCourse').click();assert.match(await page.locator('#gateStatus').textContent(),/请输入课程密码/);
 await page.getByLabel('课程密码',{exact:true}).fill('definitely-incorrect');await page.locator('#unlockCourse').click();await gateReady();assert.match(await page.locator('#gateStatus').textContent(),/密码不正确/);assert.equal(await page.locator('#nav').count(),0);
 await page.locator('#togglePassword').click();assert.equal(await page.locator('#coursePassword').getAttribute('type'),'text');await page.locator('#togglePassword').click();assert.equal(await page.locator('#coursePassword').getAttribute('type'),'password');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});await page.setViewportSize({width:390,height:844});await page.locator('#coursePassword').fill('');await page.screenshot({path:fileURLToPath(new URL('../test-results/password-mobile.png',import.meta.url)),fullPage:true});
 // Fake flags or invalid cached material cannot reveal the course; old learning records survive.
 await page.evaluate(()=>{localStorage.setItem('authenticated','true');sessionStorage.setItem('zhiyi-course-unlock-v1',JSON.stringify({salt:JSON.parse(document.getElementById('coursePayload').textContent).salt,key:'invalid'}));localStorage.setItem('zhiyi-learning-v1',JSON.stringify({done:[0],notes:{0:'原有学习笔记'},answers:{'0-0':1},wrong:[],days:[]}))});
 await page.reload();await gateReady();assert.equal(await page.locator('#nav').count(),0);
 await page.getByLabel('课程密码',{exact:true}).fill(password);await page.getByLabel('课程密码',{exact:true}).press('Enter');await appReady();assert.equal(await page.evaluate(()=>page),'sources');assert.equal(await page.evaluate(()=>state.notes[0]),'原有学习笔记');
 assert.equal(await page.evaluate(p=>Object.values(localStorage).some(v=>v===p),password),false);
 assert.equal(await page.evaluate(p=>JSON.stringify(sessionStorage).includes('"password":')||Object.values(sessionStorage).some(v=>v===p),password),false);
 assert.equal(await page.evaluate(()=>new URL(location.href).search),'');
 await page.reload();await appReady();assert.equal(await page.locator('#coursePassword').count(),0);
 // An independently opened tab needs a password even in the same browser context.
 const other=await context.newPage();await other.goto(url+'#cases');await other.locator('#gateForm[data-ready="true"]').waitFor();assert.equal(await other.locator('#nav').count(),0);await other.close();
 await page.getByRole('button',{name:'锁定课程',exact:true}).click();await gateReady();assert.equal(await page.locator('#nav').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('zhiyi-learning-v1')).notes[0]),'原有学习笔记');
 await page.reload();await gateReady();assert.equal(await page.locator('#nav').count(),0);await page.goBack();await gateReady();assert.equal(await page.locator('#nav').count(),0);
 await unlockApp(page);assert.equal(await page.evaluate(()=>state.answers['0-0']),1);
 // Browser storage restrictions still allow an explicit unlock; refresh asks again.
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(...args){if(this===sessionStorage)throw Error('session storage disabled');return original.apply(this,args)}});
 const restricted=await isolated.newPage();await restricted.goto(url);await unlockApp(restricted);await restricted.reload();await restricted.locator('#gateForm[data-ready="true"]').waitFor();await isolated.close();
 assert.deepEqual(errors,[]);console.log(`PASS: ${url} — locked deep links, empty/wrong/correct password, keyboard, visibility toggle, fake flags, corrupt cache, tab-only refresh, new tab, relock/back, old progress, unavailable storage, mobile layouts; no page errors.`);
}finally{await browser.close()}
