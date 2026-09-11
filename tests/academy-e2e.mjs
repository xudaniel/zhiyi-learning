import {unlockApp} from './access-helpers.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const url=process.env.APP_URL||new URL('../docs/index.html',import.meta.url).href;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const cleanText=selector=>page.locator(selector).evaluate(el=>{const node=el.cloneNode(true);node.querySelectorAll('rt').forEach(e=>e.remove());return node.textContent});
const go=n=>page.evaluate(n=>go(n),n);
async function audit(label){await page.evaluate(()=>refreshPinyin());const result=await page.evaluate(()=>{const bad=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(n.parentElement?.closest('ruby,script,style,textarea,select,option,input'))continue;if(Object.keys(PINYIN_CHARS).some(c=>n.textContent.includes(c)))bad.push(n.textContent.slice(0,80))}return {bad,nested:document.querySelectorAll('ruby ruby').length,overflow:document.documentElement.scrollWidth>innerWidth}});assert.deepEqual(result,{bad:[],nested:0,overflow:false},label)}
try{
 await page.goto(url+'#cases');await unlockApp(page);assert.equal(await page.evaluate(()=>page),'cases');
 assert.equal(await page.locator('.case-work .feedback').count(),0);assert.equal(await page.locator('#caseNext').isDisabled(),true);
 await page.locator('[data-case-option="0"]').click();assert.equal(await page.evaluate(()=>state.academy.reviews['case:a-0'].attempts),1);
 await page.locator('[data-case-option="0"]').click();assert.equal(await page.evaluate(()=>state.academy.reviews['case:a-0'].attempts),1);
 await audit('wrong case response');
 for(const id of ['a','b']){
  await page.evaluate(id=>selectCase(id),id);
  for(const [step,answer] of [1,0,2,0,0].entries()){
   assert.equal(await page.evaluate(()=>state.academy.cases[activeCase].step),step);
   await page.locator(`[data-case-option="${answer}"]`).click();assert.equal(await page.locator('#caseNext').isDisabled(),false);await audit(id+' step '+step);
   if(step===4){await page.locator('.case-work .source-button').click();assert.equal(await page.locator('#evidenceDialog img').evaluate(e=>e.complete&&e.naturalWidth>0),true);await audit('Wenchang original');await page.keyboard.press('Escape')}
   await page.locator('#caseNext').click();
  }
  await page.locator('#caseNote').fill(id+'：先定位日元壬，再清点。<img src=x onerror=alert(1)>');
  assert.equal(await page.locator('#caseNote + .pinyin-preview img').count(),0);
 }
 await page.reload();await unlockApp(page);assert.equal(await page.evaluate(()=>activeCase),'b');assert.equal(await page.locator('#caseNote').inputValue(),'b：先定位日元壬，再清点。<img src=x onerror=alert(1)>');
 await go('compare');assert.equal(await page.locator('.comparison-table').count(),0);
 await page.locator('[data-compare-option="0"]').click();await page.locator('[data-compare-option="0"]').click();assert.equal(await page.evaluate(()=>state.academy.reviews['compare:seasons'].attempts),1);
 await page.locator('[data-compare-option="1"]').click();assert.equal(await page.locator('.comparison-table').count(),1);await page.locator('#compareNote').fill('月份和水量改变，不能固定补土。');await audit('comparison revealed');
 await go('sound');await page.evaluate(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[],cancel(){},speak(){}}})});await page.locator('#speakChar').click();assert.match(await cleanText('#speechStatus'),/未找到中文语音/);
 await page.evaluate(()=>{window.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};window.speechSynthesis={getVoices:()=>[{lang:'zh-CN',name:'test voice'}],cancel(){},speak(u){window.testUtterance=u;u.onstart()}}});
 await page.locator('#speakChar').click();assert.equal(await page.evaluate(()=>window.testUtterance.text),'天干，戊。');assert.match(await cleanText('#speechStatus'),/正在朗读/);
 await page.getByRole('button',{name:'停止',exact:true}).click();assert.match(await cleanText('#speechStatus'),/已停止/);
 await page.locator('#speakChar').click();await page.evaluate(()=>window.testUtterance.onerror());assert.match(await cleanText('#speechStatus'),/暂时不可用/);
 await page.locator('[data-sound-option="1"]').click();assert.equal(await page.evaluate(()=>state.academy.reviews['sound:戊'].attempts),1);assert.equal(await page.locator('[data-sound-option="0"]').isDisabled(),true);
 await go('today');assert.equal(await page.evaluate(()=>state.academy.reviews['sound:戊'].due===dayString()),true);await page.evaluate(()=>startReview('sound:戊'));await page.locator('[data-review-option="0"]').click();assert.equal(await page.evaluate(()=>state.academy.reviews['sound:戊'].due>dayString()),true);assert.equal(await page.locator('[data-review-option="0"]').isDisabled(),true);await audit('scheduled review');
 await go('ask');assert.equal(await page.locator('.faq-card').count(),13);await page.locator('#askQuery').fill('文昌');assert.equal(await page.locator('.faq-card').count(),1);await page.locator('.faq-card .chip').click();await page.locator('.faq-card .source-button').click();await audit('FAQ evidence');await page.keyboard.press('Escape');
 await page.locator('#askQuery').fill('天乙');assert.match(await cleanText('.faq-card .badge'),/待核口径/);
 await page.locator('#askQuery').fill('紫微斗数 <img src=x onerror=alert(1)>');assert.equal(await page.locator('.faq-card').count(),0);await page.getByRole('button',{name:'保存到待核清单'}).click();assert.equal(await page.locator('#pendingQuestions img').count(),0);await audit('unknown query escaped');
 await go('notes');const waitDownload=page.waitForEvent('download');await page.getByRole('button',{name:'导出学习记录 ↓'}).click();const download=await waitDownload,saved=await download.path(),backup=JSON.parse(await readFile(saved,'utf8'));
 assert.equal(backup.state.academy.cases.b.step,5);assert.equal(backup.state.academy.compare.note,'月份和水量改变，不能固定补土。');assert.deepEqual(backup.state.academy.bookmarks,['wen']);assert.equal(backup.state.academy.pending.length,1);assert.ok(!JSON.stringify(backup).includes('<ruby'));
 await page.evaluate(()=>localStorage.clear());await page.reload();await unlockApp(page);await page.locator('input[type=file]').setInputFiles(saved);await page.waitForFunction(()=>state.academy.cases.b?.step===5);assert.deepEqual(await page.evaluate(()=>state.academy.reviews),backup.state.academy.reviews);await page.reload();await unlockApp(page);await go('cases');assert.equal(await page.evaluate(()=>activeCase),'b');
 const legacy={app:'zhiyi',version:1,state:{done:[0],answers:{},notes:{0:'旧笔记甲乙'},wrong:[],days:[]}};await go('notes');await page.locator('input[type=file]').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await page.waitForFunction(()=>state.notes[0]==='旧笔记甲乙');assert.equal(await page.evaluate(()=>state.academy.cases.b.step),5);
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});for(const route of ['cases','compare','sound','today','ask','notes']){await go(route);await audit(width+' '+route)}await page.evaluate(()=>openEvidence('wenchang'));await audit(width+' dialog');await page.keyboard.press('Escape')}
 for(const route of ['cases','compare','sound','today','ask']){await page.goto(url+'#'+route);await unlockApp(page);assert.equal(await page.evaluate(()=>page),route)}await page.goto(url+'#unknown');await unlockApp(page);assert.equal(await page.evaluate(()=>page),'home');
 await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});await page.evaluate(()=>{activeCase='a';state.academy.cases.a.step=2;go('cases')});await audit('desktop case');await page.screenshot({path:fileURLToPath(new URL('../test-results/academy-desktop.png',import.meta.url)),fullPage:true});
 await page.setViewportSize({width:390,height:844});await go('compare');await audit('mobile comparison');await page.screenshot({path:fileURLToPath(new URL('../test-results/academy-mobile.png',import.meta.url)),fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS: ${url} — both complete case paths, gated answers, independent notes/resume, source modals, comparison, speech success/error/fallback/stop (mocked), review scheduling, 13 FAQs, unknown questions, safe text, complete backup and legacy merge, direct routes, pinyin on every target occurrence and 320/390/1440px layouts.`);
}finally{await browser.close()}
