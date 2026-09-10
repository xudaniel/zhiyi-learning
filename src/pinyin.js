/** Pronunciation is a presentation layer. Never put it in quiz values or saved notes. */
const PINYIN_CHARS = Object.freeze({
  甲:'jiǎ',乙:'yǐ',丙:'bǐng',丁:'dīng',戊:'wù',己:'jǐ',庚:'gēng',辛:'xīn',壬:'rén',癸:'guǐ',
  子:'zǐ',丑:'chǒu',寅:'yín',卯:'mǎo',辰:'chén',巳:'sì',午:'wǔ',未:'wèi',申:'shēn',酉:'yǒu',戌:'xū',亥:'hài',
  已:'yǐ',戍:'shù',爻:'yáo',卦:'guà',乾:'qián',坤:'kūn',彖:'tuàn',筮:'shì',煞:'shà',禄:'lù',驿:'yì',魁:'kuí',罡:'gāng',
  纳:'nà',忌:'jì',衰:'shuāi',旺:'wàng',刑:'xíng',劫:'jié',诀:'jué',羲:'xī',祸:'huò',匮:'kuì',咸:'xián',刃:'rèn',庇:'bì',
  藤:'téng',蔓:'màn',坯:'pī',淅:'xī',沥:'lì',凛:'lǐn',凶:'xiōng',禀:'bǐng',赋:'fù',遁:'dùn',蓍:'shī',晦:'huì',
  巽:'xùn',艮:'gèn',兑:'duì',坎:'kǎn',震:'zhèn',牵:'qiān',耕:'gēng',眷:'juàn',姻:'yīn',袤:'mào',寡:'guǎ',
  禽:'qín',旬:'xún',宰:'zǎi',卜:'bǔ',脾:'pí',肺:'fèi',肾:'shèn',肝:'gān',胆:'dǎn'
});
// Longest phrase wins before single-character lookup. Tone marks denote dictionary tones.
const PINYIN_PHRASES = Object.freeze({
  '天干地支':'tiān gān dì zhī','天干':'tiān gān','地支':'dì zhī','干支':'gān zhī','年干':'nián gān','月干':'yuè gān','日干':'rì gān','时干':'shí gān','阳干':'yáng gān','阴干':'yīn gān','起查干':'qǐ chá gān',
  '水都快干掉了':'shuǐ dōu kuài gān diào le','干掉':'gàn diào','干燥':'gān zào','乾燥':'gān zào','乾坤':'qián kūn','乾造':'qián zào','乾卦':'qián guà',
  '五行':'wǔ xíng','行走':'xíng zǒu','行业':'háng yè','一行':'yì háng','神煞':'shén shà','灾煞':'zāi shà','劫煞':'jié shà','煞车':'shā chē',
  '卜筮':'bǔ shì','占卜':'zhān bǔ','萝卜':'luó bo','系辞':'xì cí','藏干':'cáng gān','藏在':'cáng zài','寡宿':'guǎ sù','星宿':'xīng xiù','将星':'jiàng xīng','将领':'jiàng lǐng',
  '孩子':'hái zi','儿子':'ér zi','日子':'rì zi','桌子':'zhuō zi','房子':'fáng zi','树枝子':'shù zhī zi','枝子':'zhī zi','子女':'zǐ nǚ','甲子':'jiǎ zǐ','自己':'zì jǐ',
  '亥猪':'hài zhū','寅虎':'yín hǔ','卯兔':'mǎo tù','酉鸡':'yǒu jī','戌狗':'xū gǒu','巳蛇':'sì shé',
  '相冲':'xiāng chōng','六冲':'liù chōng','相生':'xiāng shēng','相克':'xiāng kè','日元':'rì yuán','日主':'rì zhǔ','四柱':'sì zhù','用神':'yòng shén','喜神':'xǐ shén','忌神':'jì shén',
  '本命':'běn mìng','纳音':'nà yīn','天乙贵人':'tiān yǐ guì rén','文昌':'wén chāng','亡神':'wáng shén','华盖':'huá gài','长生':'cháng shēng','空亡':'kōng wáng',
  '阴阳':'yīn yáng','阴差阳错':'yīn chā yáng cuò','参天':'cān tiān','毛坯':'máo pī','春寒料峭':'chūn hán liào qiào','彖传':'tuàn zhuàn','易传':'yì zhuàn','传文':'zhuàn wén'
});
const pinyinKeys = Object.keys(PINYIN_PHRASES).sort((a,b)=>b.length-a.length);
function pronunciationTokens(text) {
  const result=[];
  for(let i=0;i<text.length;) {
    const phrase=pinyinKeys.find(key=>text.startsWith(key,i));
    if(phrase){const readings=PINYIN_PHRASES[phrase].split(' ');Array.from(phrase).forEach((c,k)=>result.push({text:c,reading:readings[k]}));i+=phrase.length}
    else{const c=String.fromCodePoint(text.codePointAt(i));result.push({text:c,reading:PINYIN_CHARS[c]||null});i+=c.length}
  }
  return result;
}
function plainPronunciation(text){return pronunciationTokens(text).map(t=>t.reading?`${t.text}（${t.reading}）`:t.text).join('')}
function pinyinFragment(text){const frag=document.createDocumentFragment();for(const t of pronunciationTokens(text)){if(!t.reading){frag.append(document.createTextNode(t.text));continue}const r=document.createElement('ruby');r.className='pinyin';r.dataset.hanzi=t.text;r.append(document.createTextNode(t.text));const rt=document.createElement('rt');rt.textContent=t.reading;rt.setAttribute('aria-hidden','true');r.append(rt);r.title=`${t.text} ${t.reading}`;frag.append(r)}return frag}
const pinyinInputState=new WeakMap(),pinyinOptions=new WeakMap();
function annotateInput(el){
  if(el.type==='file'||el.type==='hidden'||el.type==='password'||el.disabled)return;
  let entry=pinyinInputState.get(el);
  if(!entry||!entry.preview.isConnected){const preview=document.createElement('div');preview.className='pinyin-preview';preview.id=`pronunciation-${++annotateInput.counter}`;preview.setAttribute('aria-live','polite');el.insertAdjacentElement('afterend',preview);entry={preview,last:null};pinyinInputState.set(el,entry);const ids=(el.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&!id.startsWith('pronunciation-'));el.setAttribute('aria-describedby',[...ids,preview.id].join(' '));}
  const content=el.value||el.placeholder||'';
  if(content!==entry.last){entry.last=content;entry.preview.replaceChildren();if(pronunciationTokens(content).some(t=>t.reading)){const label=document.createElement('span');label.className='reading-label';label.textContent=el.value?'读音：':'输入提示读音：';entry.preview.append(label,pinyinFragment(content));entry.preview.hidden=false}else entry.preview.hidden=true}
}
annotateInput.counter=0;
function annotatePinyin(root=document.body){
  // Options cannot contain ruby; explicitly preserve their values before updating labels.
  root.querySelectorAll('select option').forEach(opt=>{let original=pinyinOptions.get(opt);if(!original){original={text:opt.textContent,value:opt.value};pinyinOptions.set(opt,original)}opt.value=original.value;const label=plainPronunciation(original.text);if(opt.textContent!==label)opt.textContent=label});
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const el=node.parentElement;if(!el||el.closest('script,style,ruby,rt,rp,input,textarea,select,option,[contenteditable],.pinyin-preview'))return NodeFilter.FILTER_REJECT;return pronunciationTokens(node.nodeValue).some(t=>t.reading)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes)node.replaceWith(pinyinFragment(node.nodeValue));
  root.querySelectorAll('input:not([type=file]),textarea').forEach(annotateInput);
}
let pinyinObserver;
function refreshPinyin(){pinyinObserver?.disconnect();try{annotatePinyin()}finally{pinyinObserver?.observe(document.body,{childList:true,subtree:true,characterData:true})}}
function installPinyin(){pinyinObserver=new MutationObserver(refreshPinyin);refreshPinyin();document.addEventListener('input',event=>{if(event.target.matches('input,textarea')){pinyinObserver.disconnect();annotateInput(event.target);pinyinObserver.observe(document.body,{childList:true,subtree:true,characterData:true})}})}
