const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const core = script.slice(0, script.indexOf('const byId='));
const selection = script.slice(script.indexOf('function eligible('), script.indexOf('function cell('));
const context = vm.createContext({});
vm.runInContext(core + `
let selected=new Set(ALL_SOUNDS), length='all', current=null, bag=[];
${selection}
this.api={WORDS,WORD_SOURCE,ALL_SOUNDS,FIRST_SOUNDS,soundsFor,eligible,symbolsFor,isJackpot,STAR,
 pool:(sounds,mode)=>eligible(new Set(sounds),mode),
 cycle:(pool,n)=>Array.from({length:n},()=>{current=nextWord(pool);return current.word}),
 reset:()=>{current=null;bag=[]}};
`, context);
const api = context.api;
const all = api.pool(api.ALL_SOUNDS, 'all');
assert.equal(all.length, api.WORD_SOURCE.trim().split(/\s+/).length, 'Every source word must have 2 or 3 syllables.');
assert.equal(new Set(all.map(entry=>entry.word)).size, all.length, 'No duplicate words.');
for (const entry of all) {
 assert.equal(entry.syllables.join(''), entry.word);
 assert.ok(entry.sounds.every(sound=>api.ALL_SOUNDS.includes(sound)), `Unknown sound in ${entry.word}`);
}
assert.equal(api.pool([], 'all').length, 0, 'An empty selection must never fall back to unrestricted words.');
const first = api.pool(api.FIRST_SOUNDS, 'all');
assert.ok(first.some(entry=>entry.word==='Mama'));
assert.ok(first.some(entry=>entry.word==='Tomate'));
assert.ok(!first.some(entry=>entry.word==='Schule'));
const originalLetters = [...'aeimptg'];
assert.deepEqual(Array.from(api.pool(originalLetters, 'all'), entry=>entry.word), ['Mama','Papa','Mittag','Mitte','Mappe']);
assert.equal(api.pool(originalLetters, '3').length, 0, 'A restrictive 3-syllable selection stays empty.');
const two = api.pool(api.ALL_SOUNDS, '2');
const three = api.pool(api.ALL_SOUNDS, '3');
assert.ok(two.length && three.length);
assert.equal(two.length+three.length, all.length);
assert.ok(two.every(entry=>entry.syllables.length===2));
assert.ok(three.every(entry=>entry.syllables.length===3));
assert.deepEqual(Array.from(api.soundsFor(['Kis','te'])), ['k','i','s','t','e']);
assert.deepEqual(Array.from(api.soundsFor(['Stein'])), ['st','ei','n']);
assert.deepEqual(Array.from(api.soundsFor(['Ap','fel'])), ['a','p','f','e','l']);
assert.deepEqual(Array.from(api.soundsFor(['Schau','fel'])), ['sch','au','f','e','l']);
for(const entry of all)for(let position=0;position<3;position++){
 const symbols=Array.from(api.symbolsFor(entry,position));
 assert.equal(symbols.length,3,'Always three reels.');
 assert.equal(symbols.filter(symbol=>symbol===api.STAR).length,entry.syllables.length===2?1:0);
 assert.equal(symbols.filter(symbol=>symbol!==api.STAR).join(''),entry.word,'A star never changes reading order.');
 if(entry.syllables.length===2)assert.equal(symbols[position],api.STAR);
}
assert.equal(api.isJackpot(1,true,0),true,'A jackpot can happen randomly.');
assert.equal(api.isJackpot(9,true,.5),false);
assert.equal(api.isJackpot(10,true,.99),true,'Tenth spin guarantees a jackpot.');
assert.equal(api.isJackpot(100,false,0),false,'Disabled jackpots stay off.');
api.reset();
const draws = api.cycle(all, all.length*3);
for (let round=0;round<3;round++) {
 assert.equal(new Set(draws.slice(round*all.length,(round+1)*all.length)).size,all.length);
}
for(let i=1;i<draws.length;i++)assert.notEqual(draws[i-1],draws[i], 'No immediate repeat at a cycle boundary.');
api.reset();
const singleton=all.filter(entry=>entry.word==='Mama');
assert.deepEqual(Array.from(api.cycle(singleton,3)),['Mama','Mama','Mama']);
console.log(`PASS: ${all.length} words (${two.length} two-syllable, ${three.length} three-syllable); ${first.length} first words; restrictive filters, sound boundaries and 3 full selection cycles.`);
