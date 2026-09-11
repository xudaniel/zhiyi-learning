import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {compileCourse} from '../scripts/course.mjs';
import {seal} from '../scripts/seal.mjs';
import {renderGate} from '../scripts/build.mjs';
import {createTutorHandler} from '../server/tutor-handler.mjs';
import {unlockApp} from './access-helpers.mjs';
const password=process.env.ZHIYI_COURSE_PASSWORD;if(!password)throw Error('Course password required');
const endpoint='https://tutor.test/api/tutor',original=await compileCourse(),compiled=original.replace(/const TUTOR_CONFIG=\{[^\n]*\};/,'const TUTOR_CONFIG='+JSON.stringify({endpoint})+';');assert.notEqual(compiled,original);
const payload=await seal(compiled,password),html=await renderGate(payload),server=createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
let mode='success',calls=0,release;
const quote='讲稿特别强调以**日柱天干**作为分析出发点，这个字通常称为“日元”或“日主”。',valid={status:'feedback',items:[{kind:'revise',text:'壬是日元，午是日支。<img src=x onerror=alert(1)>',citations:[{id:'day',quote}]}],followUp:'你能重新指出日柱上面的字吗？'};
const handler=createTutorHandler({env:{ZHIYI_ALLOWED_ORIGINS:origin,AI_GATEWAY_API_KEY:'test-only-provider',ZHIYI_TUTOR_MODEL:'test/model',ZHIYI_COURSE_PASSWORD:password},payload,fetchImpl:async()=>{calls++;if(mode==='rate')return new Response('',{status:429});if(mode==='delayed')await new Promise(r=>release=r);if(mode==='invalid')return Response.json({choices:[{message:{content:JSON.stringify({...valid,items:[{...valid.items[0],citations:[{id:'fake',quote}]}]})}}]});return Response.json({choices:[{message:{content:JSON.stringify(valid)}}]});}});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const clean=selector=>page.locator(selector).first().evaluate(el=>{const n=el.cloneNode(true);n.querySelectorAll('rt').forEach(e=>e.remove());return n.textContent});
try{
 // The published/default course must never claim a connected AI service.
 await page.goto((process.env.APP_URL||new URL('../docs/index.html',import.meta.url).href)+'#tutor');await unlockApp(page);assert.ok(await page.locator('#tutorSubmit').isDisabled());assert.match(await clean('#view'),/真实 AI 服务尚未连接/);await page.locator('#tutorText').fill('我的日元理解');await page.reload();await unlockApp(page);assert.equal(await page.locator('#tutorText').inputValue(),'我的日元理解');
 await page.route(endpoint,async route=>{const req=route.request(),response=await handler(new Request(endpoint,{method:req.method(),headers:await req.allHeaders(),...(['GET','HEAD'].includes(req.method())?{}:{body:req.postData()})}));await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});});
 await page.goto(origin+'#tutor');await unlockApp(page);assert.equal(await page.locator('#tutorSubmit').isDisabled(),false);await page.locator('#tutorText').fill('');await page.locator('#tutorSubmit').click();assert.match(await clean('#tutorResult'),/至少两个字/);
 await page.locator('#tutorText').fill('我认为壬午的日元是午。');await page.locator('#tutorSubmit').click();await page.waitForFunction(()=>!tutorBusy);assert.equal(calls,1);assert.match(await clean('#tutorResult'),/AI 生成的教学反馈/);assert.equal(await page.locator('#tutorResult img').count(),0);await page.locator('#tutorResult summary').click();assert.equal(await clean('#tutorResult blockquote'),quote);assert.ok(await page.locator('#tutorResult ruby').count()>0);
 mode='invalid';await page.locator('#tutorText').fill('换一种日元解释');await page.locator('#tutorSubmit').click();await page.waitForFunction(()=>!tutorBusy);assert.match(await clean('#tutorResult'),/待核/);assert.equal(await page.locator('.tutor-feedback').count(),0);
 mode='rate';await page.locator('#tutorText').fill('请再讲一次日元');await page.locator('#tutorSubmit').click();await page.waitForFunction(()=>!tutorBusy);assert.match(await clean('#tutorResult'),/稍等一分钟/);
 mode='delayed';await page.locator('#tutorSubmit').click();await page.waitForFunction(()=>tutorBusy);await page.evaluate(()=>go('home'));assert.equal(await page.evaluate(()=>tutorBusy),false);release?.();await page.evaluate(()=>go('tutor'));assert.equal(await page.locator('#tutorResult .tutor-feedback').count(),0);
 await page.evaluate(()=>{startJourney('day');journeySession().note='日元是日柱天干';journeySave();openTutorFromJourney()});assert.equal(await page.locator('#tutorText').inputValue(),'日元是日柱天干');assert.equal(await page.evaluate(()=>state.tutor.questionId),'day-4');await page.reload();await unlockApp(page);assert.equal(await page.locator('#tutorText').inputValue(),'日元是日柱天干');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:950});await page.evaluate(()=>refreshPinyin());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok((await clean('footer')).includes('Daniel Xu'));}
 assert.deepEqual(errors,[]);console.log('PASS: disconnected status and drafts; real frontend/handler integration with a simulated provider, credentials, citations, XSS, pending output, rate limits, cancellation and layouts. Live model validation remains a separate deployment step.');
}finally{release?.();await browser.close();await new Promise(r=>server.close(r));}
