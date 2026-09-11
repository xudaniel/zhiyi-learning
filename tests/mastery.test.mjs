import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const c=vm.createContext({Date,LESSONS:JSON.parse(read('src/lessons.json')),SOURCES:JSON.parse(read('src/sources.json')),stems:[...'甲乙丙丁戊己庚辛壬癸'],els:[...'木火土金水'],branches:[...'子丑寅卯辰巳午未申酉戌亥'],branchEls:[...'水土木木土火火土金金土水']});
vm.runInContext(read('src/pinyin.js')+'\n'+read('src/academy-core.js')+'\n'+read('src/mastery-core.js')+'\nthis.api={CASES,EVIDENCE,LEVELS,SKILLS,DIAGNOSTIC,KNOWLEDGE,caseQuestions,emptyStudio,emptySession,safeStudio,mergeStudio,analyzeDraft,reportSummary,skillLevels,recommendLearning,searchKnowledge,questionById,evidenceText};',c);
const a=c.api,plain=x=>JSON.parse(JSON.stringify(x));
const draft=cs=>Object.fromEntries(a.caseQuestions(cs).map((q,i)=>[i,{choice:q.correct,source:q.source,boundary:0,observation:'原始观察',reason:'课程依据',uncertain:'未决条件'}]));
test('two cases have six isolated training sessions and explicit rule feedback',()=>{
 for(const cs of a.CASES){const s={...a.emptySession(),draft:draft(cs)};assert.equal(a.reportSummary(cs,s).correct,5);assert.equal(a.reportSummary(cs,s).complete,5);assert.equal(a.reportSummary(cs,s).ready,true);
  s.draft[0].source='limits';s.draft[1].observation='';s.draft[2].boundary=2;s.draft[3].choice=2;
  const result=a.reportSummary(cs,s);assert.equal(result.correct,2);assert.equal(result.complete,4);assert.equal(result.ready,false);assert.deepEqual(plain(result.rows[1].missing),['observation']);
 }
});
test('empty or partial analysis reports omissions without pretending to grade free text',()=>{
 const rows=a.analyzeDraft(a.CASES[0],{});assert.equal(rows.filter(r=>r.correct).length,0);assert.ok(rows.every(r=>r.missing.length===3));
 const s={...a.emptySession(),draft:draft(a.CASES[0])};s.draft[0].reason='这段话是否有意义需要人工复核';assert.equal(a.reportSummary(a.CASES[0],s).complete,5);
 s.hints=[0];assert.equal(a.reportSummary(a.CASES[0],s).ready,false);
});
test('backup sanitizes choices, imported fields, history length and preserves newer sessions',()=>{
 const original={...a.emptyStudio(),lastCase:'b',sessions:{'a-independent':{...a.emptySession(),draft:draft(a.CASES[0]),submittedAt:10,updatedAt:11,history:Array.from({length:8},()=>({draft:draft(a.CASES[0]),hints:[],submittedAt:1}))},invalid:{draft:{}}},diagnostic:{answers:{language:1},completedAt:12,updatedAt:12}};
 const safe=a.safeStudio(original);assert.equal(Object.keys(safe.sessions).length,1);assert.equal(safe.sessions['a-independent'].history.length,5);assert.equal(safe.diagnostic.completedAt,0);
 assert.deepEqual(plain(a.safeStudio(safe)),plain(safe));const bad={...original,sessions:{'a-independent':{...original.sessions['a-independent'],draft:{0:{choice:999,boundary:8,source:'__proto__',reason:[],uncertain:123,observation:'x'.repeat(3000)}}}}};const v=a.safeStudio(bad).sessions['a-independent'].draft[0];assert.equal(v.choice,-1);assert.equal(v.source,'');assert.equal(v.observation.length,2000);
 const newer=structuredClone(original);newer.sessions['a-independent'].updatedAt=20;newer.sessions['a-independent'].draft[0].reason='new';assert.equal(a.mergeStudio(original,newer).sessions['a-independent'].draft[0].reason,'new');assert.equal(a.mergeStudio(newer,original).sessions['a-independent'].draft[0].reason,'new');assert.equal(a.mergeStudio(original,undefined).sessions['a-independent'].submittedAt,10);assert.equal(a.mergeStudio(undefined,original).lastCase,'b');
});
test('recommendations respect prerequisite order, actual results, and demonstration is not mastery',()=>{
 const s=a.emptyStudio(),academy={reviews:{}};assert.equal(a.recommendLearning(s,academy,{}).skill.id,'language');s.sessions['a-demo']={...a.emptySession(),submittedAt:10,demoSeen:[0,1,2,3,4]};assert.equal(a.recommendLearning(s,academy,{}).level,'guided');assert.ok(a.skillLevels(s,academy,{}).every(k=>k.rank===0));
 s.diagnostic={answers:Object.fromEntries(a.DIAGNOSTIC.map(q=>[q.skill,q.correct])),completedAt:20,updatedAt:20};assert.ok(a.skillLevels(s,academy,{}).every(k=>k.rank===1));
 s.sessions['a-independent']={...a.emptySession(),draft:draft(a.CASES[0]),submittedAt:30};assert.equal(a.skillLevels(s,academy,{}).find(k=>k.id==='day').rank,2);
 s.sessions['a-independent'].draft[0].choice=0;s.sessions['a-independent'].submittedAt=40;assert.equal(a.skillLevels(s,academy,{}).find(k=>k.id==='day').status,'需要巩固');
});
test('every knowledge node has real course evidence, valid connections and bounded applications',()=>{
 assert.equal(a.KNOWLEDGE.length,13);for(const n of a.KNOWLEDGE){assert.ok(a.EVIDENCE[n.id]);assert.ok(a.evidenceText(n.id).length>40);assert.ok(n.condition&&n.mistake);for(const id of [...n.before,...n.next])assert.ok(a.KNOWLEDGE.some(n=>n.id===id),id)}
 assert.equal(a.searchKnowledge('待核')[0].id,'limits');assert.ok(a.searchKnowledge('日元').length>0);assert.equal(a.searchKnowledge('不存在的问题').length,0);assert.ok(a.searchKnowledge('','基础语言').every(n=>n.group==='基础语言'));
});
test('daily practice is compatible with existing review registry and developer credits are explicit',()=>{
 assert.equal(a.DIAGNOSTIC.length,6);for(const q of a.DIAGNOSTIC){const r=a.questionById('foundation:'+q.skill);assert.equal(r.correct,q.correct);assert.ok(r.skill!==q.skill)}
 for(const file of ['src/gate.html','src/index.html','src/mastery.js','package.json'])assert.ok(read(file).includes('Daniel Xu'),file);
});
