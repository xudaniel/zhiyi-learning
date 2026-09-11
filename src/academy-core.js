/* Pure course logic and reference registry. No automatic fortune-telling. */
const EVIDENCE = {
 language:{title:'先熟记基本语言',source:1,location:'第二节课 · 一',kind:'课程原文摘录',needle:'天干必须要记住',length:215},
 imagery:{title:'十天干的物象',source:1,location:'第二节课 · 二',kind:'课程原文摘录',needle:'（一）甲木与乙木',length:460},
 day:{title:'四柱与日元',source:0,location:'讲稿总结 · 三',kind:'既有讲稿总结',needle:'讲稿特别强调以**日柱天干**',length:115},
 roots:{title:'根、枝、花、果',source:0,location:'讲稿总结 · 十三 · 4',kind:'既有讲稿总结',needle:'### 4. 四柱的“根、枝、花、果”记忆',length:270},
 count:{title:'先清点五行',source:1,location:'第二节课 · 八（四）',kind:'课程原文摘录',needle:'（四）从八个字清点五行',length:300},
 elements:{title:'五行生克',source:0,location:'讲稿总结 · 四',kind:'既有讲稿总结',needle:'相生：木 → 火 → 土 → 金 → 水 → 木',length:135},
 seasons:{title:'月份改变，所需不同',source:1,location:'第二节课 · 八（五）',kind:'课程原文摘录',needle:'（五）不同月份的壬水需要不同五行',length:680},
 spring:{title:'二月壬水的课程情境',source:2,location:'第二节课 · 八（二）',kind:'课程原文摘录',needle:'你想象现在农历二月份的水',length:760},
 timeline:{title:'大运与流年',source:0,location:'讲稿总结 · 六',kind:'既有讲稿总结',needle:'## 六、大运与流年',length:365},
 clashes:{title:'两排记六冲',source:1,location:'第二节课 · 七',kind:'课程原文摘录',needle:'七、十二地支与六冲',length:770},
 wenchang:{title:'文昌诀：以日元为主，年干为辅',source:-1,location:'施老师讲义 · 第77页',kind:'已核对讲义原页',needle:'',length:0},
 directions:{title:'五行与方位',source:0,location:'讲稿总结 · 四 · 2',kind:'既有讲稿总结',needle:'### 2. 五行与方位、季节',length:480},
 limits:{title:'保留存疑，明确查法',source:0,location:'讲稿总结 · 八 · 2',kind:'既有讲稿总结',needle:'### 2. 口诀的查法',length:650}
};
const WENCHANG = {甲:'巳',乙:'午',丙:'申',戊:'申',丁:'酉',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
const WEN_TEXT='金口诀：文昌诀\n孩子书桌、当官办公桌的重要位置！\n甲乙巳午报君知\n丙戊申宫丁己鸡\n庚猪辛鼠壬逢虎\n癸见卯来文昌齐\n释：甲在巳位，乙在午位；丙戊在申位，丁己在鸡位；庚在亥位，辛在鼠位；壬在虎位，癸在卯位。\n此诀：以日元为主，年干为辅。';
function evidenceText(id){const e=EVIDENCE[id];if(!e)return '';if(e.source===-1)return WEN_TEXT;const text=SOURCES[e.source],start=text.indexOf(e.needle);return start<0?'该摘录暂未找到，请回看完整学习资料。':text.slice(start,start+e.length)}
const CASES = [
 {id:'a',title:'案例一 · 先读懂一张四柱',pillars:['甲子','丙寅','壬午','庚子'],intro:'先把读图、分类、关系和口诀串成一条完整路径。'},
 {id:'b',title:'案例二 · 换一个月支，再检查',pillars:['甲子','丙午','壬午','庚子'],intro:'只更换教学组合的月支，观察计数与口诀命中位置怎样改变。'}
];
function basicElement(c){const i=stems.indexOf(c);return i>=0?els[Math.floor(i/2)]:branchEls[branches.indexOf(c)]}
function countElements(pillars){const result={木:0,火:0,土:0,金:0,水:0};for(const c of pillars.join('')){const e=basicElement(c);if(e)result[e]++}return result}
function countLabel(pillars){const counts=countElements(pillars);return els.map(e=>e+counts[e]).join('、')}
function caseQuestions(c){const target=WENCHANG[c.pillars[2][0]],hits=c.pillars.flatMap((p,i)=>p[1]===target?[['年柱','月柱','日柱','时柱'][i]]:[]);return [
 {q:'先找日元：本教学组合的日元是什么？',options:['甲','壬','午'],correct:1,why:'先定位日柱壬午，再取上面的天干壬。壬是日元；午是日支。',source:'day',skill:'日元定位'},
 {q:'把表面八字逐字归类，哪组数量正确？',options:[countLabel(c.pillars),'木1、火1、土3、金1、水2','木3、火0、土0、金3、水2'],correct:0,why:`本练习按每个表面干支的基本五行归类，不展开藏干：${countLabel(c.pillars)}。数量只完成分类，不能直接定用神。`,source:'count',skill:'五行清点'},
 {q:'清点后准备看月份，应先定位哪一个位置？',options:['年干'+c.pillars[0][0],'日干'+c.pillars[2][0],'月支'+c.pillars[1][1]],correct:2,why:`本组合月支是${c.pillars[1][1]}。识别位置后还要核对实际出生时间与月份口径。本例不是完整历法命盘，不能据此自动判断冷暖或用神。`,source:'seasons',skill:'月份与条件'},
 {q:'年支子与日支午属于哪组关系？',options:['子午六冲','子午同一地支','只看生肖就能判断具体事件'],correct:0,why:'按老师的两排记法，子对应午，构成六冲。这里标出的是年支与日支的关系；关系名称不等于具体事件。',source:'clashes',skill:'地支关系'},
 {q:'按日元为主查文昌，目标与位置是什么？',options:[`壬查寅，${hits.length?'命中'+hits.join('、'):'本组合地支未见寅'}`,'壬查午，放在起查的日柱','甲查巳，因此日元文昌为巳'],correct:0,why:`第77页：壬逢虎，虎对应寅。以日元壬起查，目标为寅；${hits.length?'命中位置是'+hits.join('、'):'本例四个地支没有寅，记录目标寅但不填写命中位置'}。年干为辅需另行记录。`,source:'wenchang',skill:'口诀查法'}
]}
const COMPARE_QUESTION={q:'同样是壬水，为什么两段课程讲解对“土”的讨论不同？',options:['壬水永远必须补土','月份、冷暖和水量条件不同','只要八字没有土就补土'],correct:1,why:'老师按具体月份与自然情境讨论所需。春寒、水多时的“挡水”与夏季水少时的“补水”条件不同，不能抽成同一个固定补法。',source:'seasons',skill:'月份与条件'};
const SOUND_CHARS=[...stems,...branches,'已','戍'];
function soundQuestion(c){const others=c==='己'||c==='巳'||c==='已'?['己','巳','已']:c==='戊'||c==='戌'||c==='戍'?['戊','戌','戍']:SOUND_CHARS.filter(x=>x!==c).slice((SOUND_CHARS.indexOf(c)*3)%18,(SOUND_CHARS.indexOf(c)*3)%18+2).concat(c);const options=[...new Set(others)];const type=stems.includes(c)?'天干':branches.includes(c)?'地支':'辨形补充';return {q:`请选择读作 ${PINYIN_CHARS[c]} 的字`,options,correct:options.indexOf(c),why:`${c}读${PINYIN_CHARS[c]}，${type}${basicElement(c)?'，基本五行为'+basicElement(c):'，不属于十天干或十二地支'}。戊wù、戌xū、戍shù；己jǐ、巳sì、已yǐ，要看清字形。`,source:'language',skill:'干支读音'}}
function dayString(now=new Date()){return now.toLocaleDateString('sv-SE')}
function addDays(day,n){const date=new Date(day+'T12:00:00');date.setDate(date.getDate()+n);return dayString(date)}
function nextReview(old,correct,now=new Date()){const day=dayString(now),p=old||{attempts:0,correct:0,stage:0};const stage=correct?(p.lastSuccessDay===day?Math.max(1,p.stage):Math.min(3,p.stage+1)):0;return {attempts:p.attempts+1,correct:p.correct+(correct?1:0),stage,due:correct?addDays(day,[0,1,3,7][stage]):day,lastSuccessDay:correct?day:(p.lastSuccessDay||''),updatedAt:now.getTime()}}
function questionById(id){if(id.startsWith('journey:'))return typeof journeyQuestion==='function'?journeyQuestion(id.slice(8)):null;if(id.startsWith('foundation:')){const q=DIAGNOSTIC.find(q=>q.skill===id.slice(11));return q?{...q,skill:SKILLS.find(s=>s.id===q.skill).title}:null}if(id.startsWith('case:')){const [c,n]=id.slice(5).split('-');const item=CASES.find(x=>x.id===c);return item&&caseQuestions(item)[Number(n)]}if(id==='compare:seasons')return COMPARE_QUESTION;if(id.startsWith('sound:'))return SOUND_CHARS.includes(id.slice(6))?soundQuestion(id.slice(6)):null;if(id.startsWith('lesson:')){const [i,j]=id.slice(7).split('-').map(Number);const q=LESSONS[i]?.qs[j];if(q)return {q:q.q,options:q.opts,correct:q.a,why:q.why,source:['language','imagery','imagery','language','elements','roots','day','count','clashes','timeline','directions','wenchang'][i],skill:LESSONS[i].tag}}return null}
function emptyAcademy(){return {lastCase:'a',cases:{},compare:{},reviews:{},bookmarks:[],pending:[]}}
function safeAcademy(raw){const clean=emptyAcademy();if(!raw||typeof raw!=='object')return clean;clean.lastCase=CASES.some(c=>c.id===raw.lastCase)?raw.lastCase:'a';for(const c of CASES){const old=raw.cases?.[c.id];if(!old||typeof old!=='object')continue;const answers={};for(let j=0;j<5;j++){const a=old.answers?.[j];if(a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3)answers[j]={choice:a.choice,history:Array.isArray(a.history)?a.history.filter(n=>Number.isInteger(n)&&n>=0&&n<3).slice(-50):[a.choice],attempts:Number.isInteger(a.attempts)&&a.attempts>0?a.attempts:1}}clean.cases[c.id]={step:Math.max(0,Math.min(5,Number.isInteger(old.step)?old.step:0)),answers,note:typeof old.note==='string'?old.note:'',updatedAt:Number.isFinite(old.updatedAt)?old.updatedAt:0}}
 if(raw.compare&&typeof raw.compare==='object')clean.compare={choice:[0,1,2].includes(raw.compare.choice)?raw.compare.choice:null,note:typeof raw.compare.note==='string'?raw.compare.note:'',updatedAt:Number.isFinite(raw.compare.updatedAt)?raw.compare.updatedAt:0};
 for(const [id,p] of Object.entries(raw.reviews||{})){if(!questionById(id)||!p||typeof p!=='object'||!Number.isInteger(p.attempts)||p.attempts<1||!Number.isInteger(p.correct)||p.correct<0||p.correct>p.attempts||![0,1,2,3].includes(p.stage)||!/^\d{4}-\d{2}-\d{2}$/.test(p.due))continue;clean.reviews[id]={attempts:p.attempts,correct:p.correct,stage:p.stage,due:p.due,lastSuccessDay:typeof p.lastSuccessDay==='string'?p.lastSuccessDay:'',updatedAt:Number.isFinite(p.updatedAt)?p.updatedAt:0}}
 clean.bookmarks=Array.isArray(raw.bookmarks)?raw.bookmarks.filter(x=>FAQ.some(q=>q.id===x)):[];clean.pending=Array.isArray(raw.pending)?raw.pending.filter(x=>typeof x==='string'&&x.trim()).slice(0,100):[];return clean;
}
function mergeAcademy(current,incoming){const a=safeAcademy(current),b=safeAcademy(incoming);if(!Object.keys(a.cases).length)a.lastCase=b.lastCase;for(const group of ['cases','reviews'])for(const [id,v] of Object.entries(b[group]))if(!a[group][id]||v.updatedAt>a[group][id].updatedAt)a[group][id]=v;if((b.compare.updatedAt||0)>(a.compare.updatedAt||0))a.compare=b.compare;a.bookmarks=[...new Set([...a.bookmarks,...b.bookmarks])];a.pending=[...new Set([...a.pending,...b.pending])].slice(0,100);return a}
const FAQ=[
 {id:'day',q:'日元、日主怎么找？',keys:['日元','日主','日干'],answer:'先找到日柱，再取上面的天干。日柱壬午中，日元是壬；午是日支。',source:'day'},
 {id:'roots',q:'根、枝、花、果分别对应什么？',keys:['根','枝','花','果','四柱'],answer:'老师用树来记四柱：年为根、月为枝、日为花、时为果。先把栏目记准确，再学传统的关系解释。',source:'roots'},
 {id:'start',q:'从零开始先背什么？',keys:['先背','零基础','从零','天干','地支'],answer:'先熟记十天干与十二地支，天干按甲乙木、丙丁火、戊己土、庚辛金、壬癸水分组，结合阴阳和物象记忆。',source:'language'},
 {id:'image',q:'甲乙、庚辛、壬癸怎样形象记忆？',keys:['甲乙','庚辛','壬癸','物象','大树'],answer:'按课程记忆法：甲大树、乙花草；庚毛坯金、辛精细金属；壬江海、癸细雨。这些是助记画面。',source:'imagery'},
 {id:'count',q:'五行缺什么就补什么吗？',keys:['缺什么','计数','数量','五行清点','用神'],answer:'清点只是先把八个字分类。老师接着看日元和月份，再讨论具体条件下的所需，不能把最少或缺失的一行直接等同用神。',source:'count'},
 {id:'season',q:'同是壬水，为什么月份不同说法不同？',keys:['壬水','月份','季节','二月','五六月'],answer:'老师通过冷暖与水量说明条件变化。同一日元也要放回具体月份和情境，不能固定套一套补法。对照实验室保留了这些条件。',source:'seasons'},
 {id:'flow',q:'五行相生和相克怎么记？',keys:['相生','相克','木生火','金生水'],answer:'相生顺序：木火土金水。相克顺序：木土水火金。两条循环分别记，不见到克就直接判断吉凶。',source:'elements'},
 {id:'time',q:'命局、大运、流年有什么区别？',keys:['命局','大运','流年','起运'],answer:'命局是出生四柱；大运通常约十年一段；流年是具体一年。起运年龄和排运方向还需历法计算，本版不自动计算。',source:'timeline'},
 {id:'clash',q:'六冲怎样记，能说明什么？',keys:['六冲','子午','卯酉','相冲'],answer:'上排子丑寅卯辰巳，下排午未申酉戌亥，上下对应。还要说明比较的柱位与时间层次，不能只看生肖或直接推断事件。',source:'clashes'},
 {id:'wen',q:'文昌从哪里起查，结果放在哪一柱？',keys:['文昌','起查','命中'],answer:'第77页以日元为主、年干为辅。壬查寅，查到哪个目标地支就记录它所在的柱；起查柱和命中柱要分清。',source:'wenchang'},
 {id:'direction',q:'风水里的五行方位怎样对应？',keys:['风水','方位','东方','北方'],answer:'木东、火南、金西、水北、土中央。先辨清方向，再学习老师讲的应用；本版不直接给住宅布局结论。',source:'directions'},
 {id:'tianyi',q:'天乙口诀有不同说法时怎么办？',keys:['天乙','庚日','不同口诀'],answer:'待核：已有资料中天乙口诀存在需要明确口径的地方。不能把不同起点或不同版本合并成一套确定算法。本版只实现已对照原页的文昌教学查法。',source:'limits',status:'待核口径'},
 {id:'uncertain',q:'尚未核实的内容可以直接套用吗？',keys:['待核','存疑','原话','课程资料'],answer:'先保留疑问，回看讲义并核对课程资料。存疑句子不作为确定规则；页面会分清课程摘录、已有总结与教学整理。',source:'limits'}
];
function findFAQ(query){const t=query.trim();if(!t)return FAQ;if(/发财|赚多少钱|寿命|诊断|一定离婚|一定.*好运|预测.*运/.test(t))return [];return FAQ.map(q=>({item:q,score:q.keys.reduce((n,k)=>n+(t.includes(k)?k.length:0),0)+(q.q===t?30:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.item)}
