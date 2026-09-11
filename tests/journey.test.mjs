import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const c=vm.createContext({Date,LESSONS:JSON.parse(read('src/lessons.json')),SOURCES:JSON.parse(read('src/sources.json')),stems:[...'甲乙丙丁戊己庚辛壬癸'],els:[...'木火土金水'],branches:[...'子丑寅卯辰巳午未申酉戌亥'],branchEls:[...'水土木木土火火土金金土水']});
vm.runInContext(read('src/pinyin.js')+'\n'+read('src/academy-core.js')+'\n'+read('src/mastery-core.js')+'\n'+read('src/journey-core.js').replace('__CURRICULUM__',read('src/curriculum.json'))+'\nthis.api={LEARN_UNITS,EVIDENCE,questionById,evidenceText,safeJourney,mergeJourney,journeyStats,emptyJourneyUnit,safeAcademy,countElements};',c);
const a=c.api,plain=x=>JSON.parse(JSON.stringify(x));
test('ten units contain forty unique, source-backed practice questions with explicit scope',()=>{
 assert.equal(a.LEARN_UNITS.length,10);const ids=new Set();
 for(const u of a.LEARN_UNITS){assert.ok(u.condition&&u.changed&&u.recap);assert.equal(u.questions.length,4);for(const q of u.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(a.EVIDENCE[q.source]);assert.ok(a.evidenceText(q.source).includes(q.quote),q.id+' citation is not exact');assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert.equal(a.questionById('journey:'+q.id).correct,q.correct);}}
 assert.equal(ids.size,40);assert.equal(a.questionById('journey:invented'),null);
});
test('counting variants use the given eight visible characters, not implied birth data',()=>{
 assert.deepEqual(plain(a.countElements(['甲子','丙寅','壬午','庚子'])),{木:2,火:2,土:0,金:1,水:3});
 assert.deepEqual(plain(a.countElements(['甲子','丙午','壬午','庚子'])),{木:1,火:3,土:0,金:1,水:3});
 assert.deepEqual(plain(a.countElements(['乙丑','丁卯','癸未','辛亥'])),{木:2,火:1,土:2,金:1,水:2});
});
test('restore preserves first attempts, corrections and drafts but cannot skip unanswered steps',()=>{
 const unit=a.LEARN_UNITS[0],answers=Object.fromEntries(unit.questions.map((q,i)=>[i,{choice:q.correct,first:(q.correct+1)%3,checked:true,attempts:2,updatedAt:15}]));
 const clean=a.safeJourney({lastUnit:unit.id,units:{[unit.id]:{step:5,answers,note:'日元壬 <img onerror=x>',completedAt:20,updatedAt:21},unknown:{step:5}}});
 assert.deepEqual(plain(a.safeJourney(clean)),plain(clean));assert.equal(Object.keys(clean.units).length,1);assert.deepEqual(plain(a.journeyStats(unit,clean.units[unit.id])),{firstCorrect:0,correct:4,attempts:8});
 delete answers[1];const partial=a.safeJourney({units:{[unit.id]:{step:5,answers,completedAt:20,note:'x'.repeat(900)}}}).units[unit.id];assert.equal(partial.completedAt,0);assert.equal(partial.step,2);assert.equal(partial.note.length,600);
 const draft=a.safeJourney({units:{language:{step:1,answers:{0:{choice:0,first:null,attempts:0,checked:false}}}}}).units.language.answers[0];assert.equal(draft.first,null);assert.equal(draft.checked,false);
});
test('backup merging keeps newer units and the review registry recognizes every practice question',()=>{
 const current={units:{language:{...a.emptyJourneyUnit(),note:'new',updatedAt:20}}},old={lastUnit:'day',units:{language:{...a.emptyJourneyUnit(),note:'old',updatedAt:10},day:{...a.emptyJourneyUnit(),note:'separate',updatedAt:15}}};
 const merged=a.mergeJourney(current,old);assert.equal(merged.units.language.note,'new');assert.equal(merged.units.day.note,'separate');assert.equal(a.mergeJourney(undefined,old).lastUnit,'day');assert.deepEqual(plain(a.mergeJourney(merged,undefined)),plain(merged));
 const reviews=Object.fromEntries(a.LEARN_UNITS.flatMap(u=>u.questions.map(q=>['journey:'+q.id,{attempts:1,correct:0,stage:0,due:'2026-09-12',updatedAt:20}])));assert.equal(Object.keys(a.safeAcademy({reviews}).reviews).length,40);
});
