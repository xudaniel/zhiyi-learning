/* 2.0 learning model. Scores check explicit course rules, not free-text semantics. */
const DEVELOPER='Daniel Xu';
const LEVELS=[{id:'demo',name:'完整示范',short:'跟着看',description:'看一遍观察、判断和依据，再逐步复述。'},{id:'guided',name:'渐退提示',short:'带着练',description:'一次完成一步；提示按需展开，反馈跟随作答。'},{id:'independent',name:'独立分析',short:'自己做',description:'完成整张分析单后统一核对，保留你的原始思路。'}];
const SKILLS=[
 {id:'language',title:'认字与基本语言',source:'language',lesson:2,requires:[],intro:'认清干支字形，再用物象和读音记住它们。'},
 {id:'day',title:'定位四柱与日元',source:'day',lesson:6,requires:['language'],intro:'先找栏目，再分清天干和地支。'},
 {id:'count',title:'逐字清点五行',source:'count',lesson:7,requires:['day'],intro:'逐字分类；数量不直接等于取用结论。'},
 {id:'seasons',title:'检查月份与条件',source:'seasons',lesson:7,requires:['count'],intro:'把月份和情境放回分析中，先问还缺什么条件。'},
 {id:'clashes',title:'标出关系与层次',source:'clashes',lesson:8,requires:['day'],intro:'说明是哪两个位置之间的关系，不直接推出事件。'},
 {id:'wenchang',title:'分清口诀起点与落点',source:'wenchang',lesson:11,requires:['day','clashes'],intro:'按已核讲义起查，再分别记录目标与命中位置。'}
];
const DIAGNOSTIC=[
 {skill:'language',q:'读作 wù、在十天干中的字是哪一个？',options:['戌','戊','戍'],correct:1,why:'戊读 wù，属天干；戌读 xū，属地支；戍读 shù，不属于干支。',source:'language'},
 {skill:'day',q:'日柱为壬午，日元是哪一个字？',options:['午','壬','两个字都是'],correct:1,why:'先找到日柱，取天干壬为日元；午是日支。',source:'day'},
 {skill:'count',q:'表面八字没有土，能直接决定补土吗？',options:['可以，缺什么补什么','不可以，还要看日元、月份与具体条件','只看五行总数就够了'],correct:1,why:'清点是分类步骤，不能把缺失或数量最少直接当作所需。',source:'count'},
 {skill:'seasons',q:'月份对照中的二月与五六月，首先提示什么？',options:['所有壬水使用同一种补法','只看生肖','冷暖与水量条件不同，讨论所需也会变化'],correct:2,why:'保留课程中的月份与情境，不能把局部结论套到所有情况。',source:'seasons'},
 {skill:'clashes',q:'标出子午六冲后，下一步应怎样表述？',options:['注明比较的柱位，不直接断具体事件','只看生肖就能断事','见冲一定有灾'],correct:0,why:'六冲是关系名称，还需要分清位置、时间层次和具体条件。',source:'clashes'},
 {skill:'wenchang',q:'按第77页，日元壬起查文昌，目标是什么？',options:['午','巳','寅'],correct:2,why:'壬逢虎，虎对应寅。目标地支和它命中的柱位应分别记录。',source:'wenchang'}
];
const KNOWLEDGE=[
 {id:'language',group:'基础语言',before:[],next:['imagery','day'],rule:'先熟记十天干、十二地支，再进入读图与分析。',condition:'用于基本语言与字形记忆。',mistake:'把己、巳、已，或戊、戌、戍混在一起。',practice:'sound',lesson:2},
 {id:'imagery',group:'基础语言',before:['language'],next:['elements'],rule:'用大树、花草、江海、细雨等物象辅助记忆天干。',condition:'物象是助记与理解方式。',mistake:'直接把助记画面当作个人性格或事件的定论。',practice:'practice',lesson:2},
 {id:'elements',group:'基础语言',before:['language'],next:['count','directions'],rule:'相生与相克是两条不同的关系循环。',condition:'先明确比较对象和关系，再放回具体情境。',mistake:'一见到克，就直接判断吉凶。',practice:'practice',lesson:4},
 {id:'roots',group:'读图分析',before:['language'],next:['day'],rule:'年为根、月为枝、日为花、时为果，帮助记住四柱栏目。',condition:'这是栏目记忆法。',mistake:'跳过定位，直接把栏目含义当作个人结论。',practice:'method',lesson:5},
 {id:'day',group:'读图分析',before:['roots'],next:['count','wenchang'],rule:'先定位日柱，再取日柱天干作为日元。',condition:'日元是一个天干，日柱包含天干与地支。',mistake:'把日支或整个日柱当成日元。',practice:'studio',lesson:6},
 {id:'count',group:'读图分析',before:['day','elements'],next:['seasons'],rule:'先按表面八个干支的基本五行逐字清点。',condition:'本练习不展开藏干、不计算强弱；分类完成后继续检查条件。',mistake:'缺什么就补什么，或把最多的一行直接当作最强。',practice:'studio',lesson:7},
 {id:'seasons',group:'读图分析',before:['count'],next:['spring','timeline'],rule:'讨论所需时保留月份、冷暖、水量与日元条件。',condition:'本版沿用已有课程情境；实际命盘仍需核对出生时间和月份口径。',mistake:'把某个月份的说法变成所有日元的固定补法。',practice:'compare',lesson:7},
 {id:'spring',group:'读图分析',before:['seasons'],next:['seasons'],rule:'二月壬水的讲解，应和课程的春寒、水量等条件一起理解。',condition:'原课情境不等于完整十二月规则表。',mistake:'摘取一项所需，省略它成立的条件。',practice:'compare',lesson:7},
 {id:'clashes',group:'读图分析',before:['language','day'],next:['timeline','wenchang'],rule:'两排对应记六冲，并标清实际比较的柱位。',condition:'先确认关系对象和时间层次。',mistake:'用生肖或单个六冲关系直接推断事件。',practice:'studio',lesson:8},
 {id:'timeline',group:'读图分析',before:['day'],next:['clashes'],rule:'分清命局、大运、流年的时间层次。',condition:'本版不自动计算起运年龄或排运方向。',mistake:'把不同时间层次混写为同一条关系。',practice:'method',lesson:9},
 {id:'directions',group:'方位与口诀',before:['elements'],next:['wenchang'],rule:'木东、火南、金西、水北、土中央，先辨清基本方向。',condition:'这里只学习基本方位对应，不据此给住宅布局结论。',mistake:'没有测向和完整课程条件，就指定住宅吉凶位置。',practice:'practice',lesson:10},
 {id:'wenchang',group:'方位与口诀',before:['day','directions'],next:['limits'],rule:'第77页文昌诀以日元为主、年干为辅；先起查，再找目标与命中位置。',condition:'日元起查和年干辅助分别记录；未见目标时记录未命中。',mistake:'把起查柱当成命中柱，或把年干结果当作日元结果。',practice:'studio',lesson:11},
 {id:'limits',group:'方位与口诀',before:['wenchang'],next:[],rule:'天乙等尚未明确口径的条目保留待核，不合并成确定算法。',condition:'需要补充并核对原课程依据后才能完善。',mistake:'用其他来源的规则填空，再标作施老师的确定说法。',practice:'ask',lesson:11,pending:true}
];
const STEP_SKILLS=['day','count','seasons','clashes','wenchang'];
const BOUNDARIES=[
 ['仍需其他柱位、月份与具体问题，不能由日元单字定结论','日元一个字足以判断所有事情','已经可以确定一生事件'],
 ['表面数量不能直接定强弱或用神，还要检查月份与条件','少的一行就是应该补的一行','最多的一行一定最强'],
 ['需核对实际时间与月份口径，教学组合不能直接用于取用','教学月支可直接给出所有取用结论','无需再确认时间'],
 ['关系名称不能直接推断事件，还需位置、时间层次与条件','见到冲就可断具体灾祸','只看生肖已经足够'],
 ['目标与命中位置分开记录，具体应用仍需完整情境','起查柱就是命中柱','年干辅助结果可以替代日元结果']
];
function emptyStudio(){return {lastCase:'a',lastLevel:'demo',sessions:{},diagnostic:{answers:{},completedAt:0,skippedAt:0,updatedAt:0},plans:{}}}
function emptySession(){return {step:0,draft:{},hints:[],checked:[],demoSeen:[],submittedAt:0,history:[],updatedAt:0}}
const finiteTime=v=>Number.isFinite(v)&&v>=0?v:0;
function safeDraft(raw){const clean={};for(let i=0;i<5;i++){const a=raw?.[i];if(!a||typeof a!=='object')continue;clean[i]={choice:[0,1,2].includes(a.choice)?a.choice:-1,source:Object.hasOwn(EVIDENCE,a.source)?a.source:'',boundary:[0,1,2].includes(a.boundary)?a.boundary:-1,...Object.fromEntries(['observation','reason','uncertain'].map(k=>[k,typeof a[k]==='string'?a[k].slice(0,2000):'']))}}return clean}
function safeStudio(raw){const out=emptyStudio();if(!raw||typeof raw!=='object')return out;
 if(CASES.some(c=>c.id===raw.lastCase))out.lastCase=raw.lastCase;if(LEVELS.some(l=>l.id===raw.lastLevel))out.lastLevel=raw.lastLevel;
 for(const c of CASES)for(const l of LEVELS){const k=c.id+'-'+l.id,s=raw.sessions?.[k];if(!s||typeof s!=='object')continue;out.sessions[k]={step:Math.min(4,Math.max(0,Number.isInteger(s.step)?s.step:0)),draft:safeDraft(s.draft),checked:Array.isArray(s.checked)?s.checked.filter(i=>Number.isInteger(i)&&i>=0&&i<5):[],hints:Array.isArray(s.hints)?[...new Set(s.hints.filter(i=>Number.isInteger(i)&&i>=0&&i<5))]:[],demoSeen:Array.isArray(s.demoSeen)?[...new Set(s.demoSeen.filter(i=>Number.isInteger(i)&&i>=0&&i<5))]:[],submittedAt:finiteTime(s.submittedAt),updatedAt:finiteTime(s.updatedAt),history:Array.isArray(s.history)?s.history.filter(r=>r&&finiteTime(r.submittedAt)).slice(-5).map(r=>({draft:safeDraft(r.draft),submittedAt:r.submittedAt,hints:Array.isArray(r.hints)?r.hints.filter(i=>Number.isInteger(i)&&i>=0&&i<5):[]})):[]}}
 const d=raw.diagnostic;if(d&&typeof d==='object'){for(const q of DIAGNOSTIC)if([0,1,2].includes(d.answers?.[q.skill]))out.diagnostic.answers[q.skill]=d.answers[q.skill];out.diagnostic.updatedAt=finiteTime(d.updatedAt);out.diagnostic.skippedAt=finiteTime(d.skippedAt);out.diagnostic.completedAt=Object.keys(out.diagnostic.answers).length===6?finiteTime(d.completedAt):0}
 if(raw.plans&&typeof raw.plans==='object')for(const [day,p] of Object.entries(raw.plans).filter(([k])=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-60)){if(!p||!SKILLS.some(s=>s.id===p.skill)||!CASES.some(c=>c.id===p.caseId)||!LEVELS.some(l=>l.id===p.level))continue;out.plans[day]={skill:p.skill,caseId:p.caseId,level:p.level,createdAt:finiteTime(p.createdAt),conceptDoneAt:finiteTime(p.conceptDoneAt)}}
 return out;
}
function mergeStudio(a,b){a=safeStudio(a);b=safeStudio(b);if(!Object.keys(a.sessions).length){a.lastCase=b.lastCase;a.lastLevel=b.lastLevel}for(const [k,s] of Object.entries(b.sessions)){if(!a.sessions[k]||s.updatedAt>a.sessions[k].updatedAt)a.sessions[k]=s}if(b.diagnostic.updatedAt>a.diagnostic.updatedAt)a.diagnostic=b.diagnostic;for(const [day,p] of Object.entries(b.plans)){if(!a.plans[day])a.plans[day]=p;else if(a.plans[day].skill===p.skill)a.plans[day].conceptDoneAt=Math.max(a.plans[day].conceptDoneAt,p.conceptDoneAt)}return safeStudio(a)}
function analyzeDraft(c,draft){return caseQuestions(c).map((q,i)=>{const a=draft[i]||{},missing=['observation','reason','uncertain'].filter(k=>!String(a[k]||'').trim());return {skill:STEP_SKILLS[i],fact:a.choice===q.correct,source:a.source===q.source,boundary:a.boundary===0,missing,complete:!missing.length,correct:a.choice===q.correct&&a.source===q.source&&a.boundary===0}})}
function reportSummary(c,s){const rows=analyzeDraft(c,s.draft);return {rows,correct:rows.filter(r=>r.correct).length,complete:rows.filter(r=>r.complete).length,ready:rows.every(r=>r.correct&&r.complete)&&s.hints.length===0}}
function skillLevels(studio,academy,answers={}){return SKILLS.map(skill=>{const events=[];const d=studio.diagnostic,q=DIAGNOSTIC.find(q=>q.skill===skill.id);if(d.completedAt&&q)events.push({time:d.completedAt,ok:d.answers[skill.id]===q.correct,origin:'入门诊断'});
 for(const [id,r] of Object.entries(academy.reviews||{})){const question=questionById(id);if(question?.source===skill.source)events.push({time:r.updatedAt,ok:r.stage>0,origin:'基础练习'})}
 for(const [key,s] of Object.entries(studio.sessions)){if(key.endsWith('-demo')||!s.submittedAt)continue;const c=CASES.find(c=>key.startsWith(c.id+'-'));analyzeDraft(c,s.draft).forEach(r=>{if(r.skill===skill.id)events.push({time:s.submittedAt,ok:r.correct,origin:key.endsWith('independent')?'独立训练':'渐退练习'})})}
 if(!events.length){const qs=LESSONS[skill.lesson]?.qs||[];if(qs.length&&qs.every((q,i)=>answers[skill.lesson+'-'+i]===q.a))events.push({time:0,ok:true,origin:'已完成短课'})}
 events.sort((a,b)=>a.time-b.time);const latest=events.at(-1),origins=new Set(events.filter(e=>e.ok).map(e=>e.origin));const stable=latest?.ok&&(latest.origin==='独立训练'||origins.size>=2);return {...skill,status:!latest?'待练习':!latest.ok?'需要巩固':stable?'练习稳定':'初步理解',rank:!latest?0:!latest.ok?0:stable?2:1,reason:!latest?'尚无有效作答记录':latest.origin+(latest.ok?'已通过规则核对':'发现了需要回练的地方')};
})}
function recommendLearning(studio,academy,answers){const skills=skillLevels(studio,academy,answers),skill=skills.find(s=>s.rank<2&&s.requires.every(id=>skills.find(x=>x.id===id).rank>=1))||skills.find(s=>s.rank<2)||skills[0];const caseId=studio.lastCase;const demo=studio.sessions[caseId+'-demo'],guided=studio.sessions[caseId+'-guided'];return {skill,skills,caseId,level:!demo?.submittedAt?'demo':!guided?.submittedAt?'guided':'independent'}}
function searchKnowledge(query,group='全部'){const term=query.trim().toLowerCase();return KNOWLEDGE.filter(n=>(group==='全部'||n.group===group)&&(!term||[EVIDENCE[n.id].title,n.rule,n.condition,n.mistake,n.pending?'待核':''].join(' ').toLowerCase().includes(term)))}
