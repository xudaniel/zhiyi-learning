import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const c=vm.createContext({Date,LESSONS:JSON.parse(read('src/lessons.json')),SOURCES:JSON.parse(read('src/sources.json')),stems:[...'甲乙丙丁戊己庚辛壬癸'],els:[...'木火土金水'],branches:[...'子丑寅卯辰巳午未申酉戌亥'],branchEls:[...'水土木木土火火土金金土水']});
vm.runInContext(read('src/pinyin.js')+'\n'+read('src/academy-core.js')+'\nthis.api={EVIDENCE,CASES,FAQ,SOUND_CHARS,countElements,caseQuestions,evidenceText,soundQuestion,nextReview,dayString,safeAcademy,mergeAcademy,questionById,findFAQ};',c);
const a=c.api,plain=x=>JSON.parse(JSON.stringify(x));
test('two synthetic cases have independently calculated counts and different Wenchang locations',()=>{
 assert.deepEqual(plain(a.countElements(a.CASES[0].pillars)),{木:2,火:2,土:0,金:1,水:3});
 assert.deepEqual(plain(a.countElements(a.CASES[1].pillars)),{木:1,火:3,土:0,金:1,水:3});
 assert.match(a.caseQuestions(a.CASES[0])[4].options[0],/命中月柱/);
 assert.match(a.caseQuestions(a.CASES[1])[4].options[0],/未见寅/);
 for(const cs of a.CASES)assert.equal(a.caseQuestions(cs).length,5);
});
test('every explanation has an actual course passage; Wenchang uses checked page 77',()=>{
 for(const [id,e] of Object.entries(a.EVIDENCE)){
  const text=a.evidenceText(id);assert.ok(text.length>50,id);assert.ok(!text.includes('暂未找到'),id);
  if(e.source>=0)assert.ok(c.SOURCES[e.source].includes(e.needle),id);
 }
 assert.match(a.evidenceText('wenchang'),/以日元为主，年干为辅/);
 assert.match(a.evidenceText('spring'),/丙火/);
 for(const q of a.FAQ)assert.ok(a.EVIDENCE[q.source]);
});
test('24 sound cards have one selectable correct character and all confusing forms',()=>{
 assert.equal(new Set(a.SOUND_CHARS).size,24);
 for(const char of a.SOUND_CHARS){const q=a.soundQuestion(char);assert.equal(q.options[q.correct],char);assert.equal(new Set(q.options).size,3);assert.ok(!q.q.includes('undefined'))}
 assert.deepEqual(plain(a.soundQuestion('巳').options),['己','巳','已']);
 assert.deepEqual(plain(a.soundQuestion('戊').options),['戊','戌','戍']);
});
test('review schedules wrong today then 1, 3, 7 days; repeating on same day cannot promote stage',()=>{
 const at=d=>new Date('2026-09-'+d+'T12:00:00');
 let r=a.nextReview(null,false,at('11'));assert.equal(r.due,'2026-09-11');assert.equal(r.stage,0);
 r=a.nextReview(r,true,at('11'));assert.equal(r.due,'2026-09-12');assert.equal(r.stage,1);
 r=a.nextReview(r,true,at('11'));assert.equal(r.stage,1);assert.equal(r.due,'2026-09-12');
 r=a.nextReview(r,true,at('12'));assert.equal(r.stage,2);assert.equal(r.due,'2026-09-15');
 r=a.nextReview(r,true,at('15'));assert.equal(r.stage,3);assert.equal(r.due,'2026-09-22');
 r=a.nextReview(r,false,at('22'));assert.equal(r.stage,0);assert.equal(r.due,'2026-09-22');assert.equal(r.attempts,6);assert.equal(r.correct,4);
});
test('backup preserves notes, bookmarks and schedules, rejects malformed entries, and merges newer records',()=>{
 const record={lastCase:'b',cases:{a:{step:5,answers:{0:{choice:1,attempts:2}},note:'甲乙 <script>',updatedAt:10}},compare:{choice:1,note:'条件不同',updatedAt:3},reviews:{'sound:戊':a.nextReview(null,false,new Date('2026-09-11T12:00:00'))},bookmarks:['wen','not-real'],pending:['原录音待核']};
 const cleaned=a.safeAcademy(record);assert.equal(cleaned.cases.a.note,'甲乙 <script>');assert.deepEqual(plain(cleaned.bookmarks),['wen']);assert.deepEqual(plain(a.safeAcademy(cleaned)),plain(cleaned));
 const merged=a.mergeAcademy(cleaned,{...record,cases:{a:{...record.cases.a,note:'new',updatedAt:11}}});assert.equal(merged.cases.a.note,'new');assert.equal(a.mergeAcademy(merged,record).cases.a.note,'new');
 assert.deepEqual(plain(a.safeAcademy({reviews:{'bad':{attempts:1},'sound:戊':{attempts:-1}}}).reviews),{});
 assert.deepEqual(plain(a.mergeAcademy(cleaned,undefined)),plain(cleaned));
});
test('13 curated answers distinguish unsupported questions and Tianyi uncertainty',()=>{
 assert.equal(a.FAQ.length,13);assert.equal(a.findFAQ('日元怎么找')[0].id,'day');
 assert.equal(a.findFAQ('壬水今年能发财吗').length,0);assert.equal(a.findFAQ('紫微斗数').length,0);
 assert.equal(a.findFAQ('天乙')[0].status,'待核口径');
 for(let i=0;i<12;i++)for(let j=0;j<2;j++)assert.ok(a.EVIDENCE[a.questionById(`lesson:${i}-${j}`).source]);
});
