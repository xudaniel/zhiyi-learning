/* Course-designed practice, separate from the original source text. Developer Daniel Xu. */
const LEARN_UNITS=__CURRICULUM__;
const JOURNEY_STEPS=['理解概念','基础例题','条件变化','辨错练习','独立挑战','复习安排'];
const unitById=id=>LEARN_UNITS.find(u=>u.id===id);
function journeyQuestion(id){for(const u of LEARN_UNITS){const q=u.questions.find(q=>q.id===id);if(q)return {...q,q:q.prompt,skill:u.title}}return null}
function emptyJourneyUnit(){return {step:0,answers:{},note:'',completedAt:0,updatedAt:0}}
function safeJourney(raw){
 const out={lastUnit:LEARN_UNITS[0].id,units:{}};
 if(!raw||typeof raw!=='object')return out;
 if(unitById(raw.lastUnit))out.lastUnit=raw.lastUnit;
 for(const u of LEARN_UNITS){const v=raw.units?.[u.id];if(!v||typeof v!=='object')continue;const s=emptyJourneyUnit();
  s.note=typeof v.note==='string'?v.note.slice(0,600):'';
  for(const [i,q] of u.questions.entries()){const a=v.answers?.[i];if(!a||!Number.isInteger(a.choice)||a.choice<0||a.choice>=q.options.length)continue;s.answers[i]={choice:a.choice,first:Number.isInteger(a.first)&&a.first>=0&&a.first<q.options.length?a.first:null,attempts:Number.isInteger(a.attempts)&&a.attempts>0?Math.min(a.attempts,10000):0,checked:a.checked===true,updatedAt:Number.isFinite(a.updatedAt)?a.updatedAt:0};if(!s.answers[i].attempts)s.answers[i].checked=false;}
  const failed=u.questions.findIndex((q,i)=>!s.answers[i]?.checked||s.answers[i].choice!==q.correct),furthest=failed<0?5:failed+1;
  s.step=Math.min(furthest,Math.max(0,Number.isInteger(v.step)?v.step:0));
  s.completedAt=failed<0&&Number.isFinite(v.completedAt)?Math.max(0,v.completedAt):0;
  s.updatedAt=Number.isFinite(v.updatedAt)?Math.max(0,v.updatedAt):0;out.units[u.id]=s;
 }
 return out;
}
function mergeJourney(current,incoming){const a=safeJourney(current),b=safeJourney(incoming);if(!Object.keys(a.units).length)a.lastUnit=b.lastUnit;for(const [id,v] of Object.entries(b.units))if(!a.units[id]||v.updatedAt>a.units[id].updatedAt)a.units[id]=v;return a}
function journeyStats(u,s=emptyJourneyUnit()){return {firstCorrect:u.questions.filter((q,i)=>s.answers[i]?.first===q.correct).length,correct:u.questions.filter((q,i)=>s.answers[i]?.checked&&s.answers[i].choice===q.correct).length,attempts:Object.values(s.answers).reduce((n,a)=>n+a.attempts,0)}}
