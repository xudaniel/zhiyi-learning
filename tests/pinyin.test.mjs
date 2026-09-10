import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../src/pinyin.js',import.meta.url),'utf8')+'\nthis.tokens=pronunciationTokens;this.plain=plainPronunciation;this.characters=PINYIN_CHARS;this.phrases=PINYIN_PHRASES;',context);
const reading=s=>Array.from(context.tokens(s),t=>t.reading||'_').join(' ');
test('all 22 stems/branches and easily confused characters have independently specified tones',()=>{
 assert.equal(reading('甲乙丙丁戊己庚辛壬癸'),'jiǎ yǐ bǐng dīng wù jǐ gēng xīn rén guǐ');
 assert.equal(reading('子丑寅卯辰巳午未申酉戌亥'),'zǐ chǒu yín mǎo chén sì wǔ wèi shēn yǒu xū hài');
 assert.equal(reading('戊己巳已戌戍'),'wù jǐ sì yǐ xū shù');
});
test('every repeated occurrence is annotated without corrupting Hanzi',()=>{
 const text='甲甲、日元壬；壬午。';const tokens=context.tokens(text);
 assert.equal(Array.from(tokens,t=>t.text).join(''),text);
 assert.equal(Array.from(tokens).filter(t=>t.text==='甲'&&t.reading==='jiǎ').length,2);
 assert.equal(Array.from(tokens).filter(t=>t.text==='壬'&&t.reading==='rén').length,2);
});
test('phrases resolve polyphones and neutral tone in context',()=>{
 assert.equal(reading('天干'),'tiān gān');assert.equal(reading('干掉'),'gàn diào');
 assert.equal(reading('水都快干掉了'),'shuǐ dōu kuài gān diào le');
 assert.equal(reading('乾坤乾燥'),'qián kūn gān zào');
 assert.equal(reading('孩子甲子'),'hái zi jiǎ zǐ');
 assert.equal(reading('神煞卜筮易传将星'),'shén shà bǔ shì yì zhuàn jiàng xīng');
});
test('the difficult terms have tones and phrase syllables align one-to-one',()=>{
 assert.equal(reading('爻彖筮魁罡驿禄'),'yáo tuàn shì kuí gāng yì lù');
 for(const [word,reading] of Object.entries(context.phrases))assert.equal([...word].length,reading.split(' ').length,word);
 assert.equal(context.plain('戊己'),'戊（wù）己（jǐ）');
});
test('built release excludes private cases and is self-contained',()=>{
 const html=readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 for(const forbidden of ['你老婆','你太太','1991年生','辛未年','你这两个小孩','你今年家庭','江苏那个朋友','drive.google.com/file/d/','app.notion.com/p/'])assert.ok(!html.includes(forbidden),forbidden);
 assert.ok(html.includes('data:image/jpeg;base64,'));assert.ok(!html.includes('src="http'));
 assert.ok(html.includes("const KEY='zhiyi-learning-v1'"));
 assert.ok(!html.includes('__WEN_IMAGE__'));assert.ok(!html.includes('__LESSONS__'));
});
