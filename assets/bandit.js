
'use strict';
// Der gemeinsame Wortschatz mit festgelegten Lesesilben wird aus words.js geladen.

const VOWELS = ['a','e','i','o','u','ä','ö','ü'];
const CONSONANTS = [...'bcdfghjklmnpqrstvwxyz','ß'];
const CONNECTIONS = ['sch','ch','ck','ei','au','eu','äu','ie','ai','qu','pf','st','sp'];
const ALL_SOUNDS = [...VOWELS,...CONSONANTS,...CONNECTIONS];
const FIRST_SOUNDS = [...'aeioumnlstrp'];

// Verbindungen werden innerhalb einer Silbe erkannt, st/sp nur am Silbenanfang.
// So braucht Kis-te die Buchstaben s und t, Stein hingegen die Verbindung st.
function soundsFor(syllables) {
 const sounds = [];
 for (const syllable of syllables) {
  const lower = syllable.toLocaleLowerCase('de');
  for (let i=0; i<lower.length;) {
   const connection = CONNECTIONS.find(sound => lower.startsWith(sound,i) && (!['st','sp'].includes(sound) || i===0));
   const sound = connection || lower[i];
   sounds.push(sound); i += sound.length;
  }
 }
 return [...new Set(sounds)];
}
const WORDS = WORD_SOURCE.trim().split(/\s+/).map(source => {
 const syllables=source.split('-');
 return {word:syllables.join(''),syllables,sounds:soundsFor(syllables)};
}).filter(entry => entry.syllables.length===2 || entry.syllables.length===3);
// Tätigkeits- und Eigenschaftswörter werden im Spiel kleingeschrieben.
const LOWER_WORDS = new Set('rechnen lesen malen lernen schreiben singen spielen lachen rennen tanzen turnen baden suchen hören sehen sagen fragen tragen rufen bauen kaufen helfen teilen leise laute rote grüne blaue gelbe bunte kleine große'.split(' '));
for (const entry of WORDS) if (LOWER_WORDS.has(entry.word.toLocaleLowerCase('de'))) {
 entry.word=entry.word.toLocaleLowerCase('de'); entry.syllables[0]=entry.syllables[0].toLocaleLowerCase('de');
}
const STAR='★';
const JACKPOT_CHANCE=.06;
const JACKPOT_LIMIT=10;
// Die Silben behalten ihre Lesereihenfolge, egal wo die freie Walze steht.
function symbolsFor(entry,starPosition=randomIndex(3)){
 const symbols=[...entry.syllables];
 if(symbols.length===2)symbols.splice(starPosition,0,STAR);
 return symbols;
}
function isJackpot(round,enabled,randomValue=Math.random()){
 return enabled && (round>=JACKPOT_LIMIT || randomValue<JACKPOT_CHANCE);
}
const MATH_RANGES=[
 {id:'zehner',label:'Zehner',min:0,max:10},
 {id:'hunderter',label:'Hunderter',min:10,max:100},
 {id:'tausender',label:'Tausender',min:100,max:1000},
 {id:'millionen',label:'Millionen',min:1000,max:1000000}
];
const MATH_OPERATIONS=[{id:'plus',label:'Plus',symbol:'+'},{id:'minus',label:'Minus',symbol:'−'},{id:'mal',label:'Mal',symbol:'×'}];
// Nur Bereichspaare verwenden, die mindestens eine Aufgabe unter der Obergrenze erlauben.
function mathTaskOptions(rangeIds,operationIds,allowOverflow=false){
 const ranges=MATH_RANGES.filter(range=>rangeIds.has(range.id));
 const limit=ranges.length?Math.max(...ranges.map(range=>range.max)):0;
 const pairs=ranges.flatMap(left=>ranges.map(right=>({left,right})));
 const operations=MATH_OPERATIONS.filter(operation=>operationIds.has(operation.id)).map(operation=>({
  ...operation,pairs:pairs.filter(({left,right})=>allowOverflow || (operation.id==='plus'?left.min+right.min<=limit:operation.id==='mal'?left.min*right.min<=limit:true))
 })).filter(operation=>operation.pairs.length);
 return {limit,operations};
}
// Erst gültige Grenzen bestimmen, dann daraus ziehen. Auch seltene Aufgaben brauchen keine Suchschleife.
function createMathTask(rangeIds,operationIds,allowOverflow=false,random=Math.random){
 const {limit,operations}=mathTaskOptions(rangeIds,operationIds,allowOverflow);
 if(!operations.length)return null;
 const cap=allowOverflow?Infinity:limit;
 const pick=items=>items[Math.floor(random()*items.length)];
 const number=(min,max)=>min+Math.floor(random()*(max-min+1));
 const operation=pick(operations);
 const pair=pick(operation.pairs);
 const leftMax=operation.id==='plus'?Math.min(pair.left.max,cap-pair.right.min):operation.id==='mal' && pair.right.min>0?Math.min(pair.left.max,Math.floor(cap/pair.right.min)):pair.left.max;
 let left=number(pair.left.min,leftMax);
 const rightMax=operation.id==='plus'?Math.min(pair.right.max,cap-left):operation.id==='mal' && left>0?Math.min(pair.right.max,Math.floor(cap/left)):pair.right.max;
 let right=number(pair.right.min,rightMax);
 if(operation.id==='minus' && left<right)[left,right]=[right,left];
 const result=operation.id==='plus'?left+right:operation.id==='minus'?left-right:left*right;
 return {left,right,operation:operation.id,result,symbols:[String(left),operation.symbol,String(right)]};
}
const byId=id=>document.getElementById(id);
const ui={machine:byId('machine'),reels:byId('reels'),spin:byId('spin'),spinLabel:byId('spin-label'),announcement:byId('announcement'),settings:byId('settings'),open:byId('settings-open')};
let selected=new Set(ALL_SOUNDS);
let length='all';
let draftLength=length;
let current=null;
let spinning=false;
let bag=[];
let displayed=[STAR,STAR,STAR];
let jackpotEnabled=true;
let roundsSinceJackpot=0;
let partyTimer=null;
let subject='deutsch';
let mathRanges=new Set(['zehner']);
let mathOperations=new Set(MATH_OPERATIONS.map(operation=>operation.id));
let mathAllowOverflow=false;
let mathJackpotEnabled=true;
let mathRoundsSinceJackpot=0;
let mathTask=null;
const rangeChoices=[],operationChoices=[];
const lengthButtons=[...document.querySelectorAll('[data-length]')];
const choices=[];
function eligible(sounds=selected,mode=length) {
 return WORDS.filter(entry => (mode==='all' || entry.syllables.length===Number(mode)) && entry.sounds.every(sound=>sounds.has(sound)));
}
function randomIndex(n){return Math.floor(Math.random()*n)}
// Ein gemischter Vorrat verhindert Wiederholungen, bevor alle Wörter dran waren.
function refill(pool){
 bag=[...pool];
 for(let i=bag.length-1;i>0;i--){const j=randomIndex(i+1);[bag[i],bag[j]]=[bag[j],bag[i]]}
 if(bag.length>1 && bag.at(-1).word===current?.word){[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]]}
}
function nextWord(pool){if(!bag.length)refill(pool);return bag.pop()}
function cell(symbol){
 const node=document.createElement('div');node.className='cell'+(symbol===STAR?' is-star':/^\d+$/.test(symbol)?' is-number digits-'+symbol.length:symbol.length>6?' extra-long':symbol.length>4?' long':'');node.textContent=symbol;return node;
}
const reels=Array.from({length:3},()=>{const reel=document.createElement('div');reel.className='reel';const strip=document.createElement('div');strip.className='strip';reel.append(strip);ui.reels.append(reel);return {reel,strip}});
function render(symbols){displayed=[...symbols];reels.forEach(({strip},index)=>strip.replaceChildren(cell(symbols[index])))}
function stopParty(){clearTimeout(partyTimer);byId('party').hidden=true;byId('party').replaceChildren();ui.machine.classList.remove('jackpot')}
function celebrate(){
 stopParty();ui.machine.classList.add('jackpot');
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const party=byId('party');party.hidden=false;
  const colors=['#e84d46','#f3b523','#239c95','#9c79c4','#e689b7'];
  for(let i=0;i<65;i++){
   const piece=document.createElement('span');piece.className='confetti';
   for(const [key,value] of Object.entries({x:Math.random()*100+'vw',color:colors[i%colors.length],delay:Math.random()*.4+'s',drift:(Math.random()-.5)*260+'px',turn:(Math.random()-.5)*1200+'deg'}))piece.style.setProperty('--'+key,value);
   party.append(piece);
  }
 }
 partyTimer=setTimeout(stopParty,3300);
}
function announce(){
 if(subject==='mathe')ui.announcement.textContent=mathTask?'Rechne: '+mathTask.left+' '+MATH_OPERATIONS.find(operation=>operation.id===mathTask.operation).label+' '+mathTask.right+'. Das Ergebnis ist verdeckt.':'Drei Sterne! Hurra!';
 else ui.announcement.textContent=current?'Lies von links nach rechts: '+displayed.map(symbol=>symbol===STAR?'Stern':symbol).join(', ')+'.'+(displayed.includes(STAR)?' Überspringe den Stern.':''):'Drei Sterne! Hurra!';
}
function resetResult(){
 byId('math-reveal').hidden=subject!=='mathe' || !mathTask;
 byId('math-reveal').disabled=spinning;
 byId('math-reveal').setAttribute('aria-expanded','false');
 byId('result-label').textContent='Ergebnis aufdecken';
 byId('math-result').hidden=true;byId('math-result').textContent='';
}
function setInstructions(){
 byId('instruction').textContent=subject==='mathe'?'Wie lautet das Ergebnis?':'Lies das Wort Silbe für Silbe.';
 byId('subinstruction').textContent=subject==='mathe'?'Rechne zuerst, dann decke die Lösung auf.':displayed.includes(STAR)?'Überspringe den Stern beim Lesen.':'Drei Silben ergeben ein Wort.';
}
function refresh(){
 stopParty();
 byId('filter-summary').hidden=subject==='mathe';
 if(subject==='mathe'){
  mathTask=createMathTask(mathRanges,mathOperations,mathAllowOverflow);const empty=!mathTask;
  byId('empty').hidden=!empty;ui.spin.disabled=empty;
  render(mathTask?mathTask.symbols:['?','?','?']);resetResult();
  if(empty){
   byId('empty').textContent=mathRanges.size && mathOperations.size?'Für diese Auswahl gibt es keine Aufgabe innerhalb der Obergrenze. Wähle einen weiteren Zahlenbereich oder ein anderes Rechenzeichen.':'Wähle in den Einstellungen mindestens einen Zahlenbereich und ein Rechenzeichen.';
   byId('instruction').textContent='Wähle deine Rechenaufgaben.';byId('subinstruction').textContent='Die Maschine wartet auf deine Auswahl.';ui.announcement.textContent=byId('empty').textContent;
  }else{setInstructions();announce()}
  return;
 }
 bag=[];const pool=eligible();
 byId('filter-summary').textContent=selected.size===ALL_SOUNDS.length?'Alle Buchstaben und Lautverbindungen ausgewählt.':selected.size?'Bekannt: '+ALL_SOUNDS.filter(sound=>selected.has(sound)).join(' · '):'Noch keine Buchstaben ausgewählt.';
 const empty=pool.length===0;byId('empty').hidden=!empty;ui.spin.disabled=empty;
 if(empty){
  current=null;render(['?','?','?']);byId('empty').textContent='Für diese Auswahl gibt es noch kein Wort im Wortschatz. Wähle weitere Buchstaben oder eine andere Silbenanzahl.';
  byId('instruction').textContent='Erweitere die Auswahl.';byId('subinstruction').textContent='Die Maschine wartet auf passende Wörter.';ui.announcement.textContent=byId('empty').textContent;
 }else{
  const preferred=pool.find(entry=>entry.word==='Mama');current=preferred||nextWord(pool);if(preferred){refill(pool);bag=bag.filter(entry=>entry!==preferred)}
  render(symbolsFor(current));setInstructions();announce();
 }
 resetResult();
}
function setBusy(busy){spinning=busy;ui.machine.classList.toggle('spinning',busy);ui.spin.disabled=busy;ui.open.disabled=busy;byId('math-reveal').disabled=busy;ui.spinLabel.textContent=busy?'DREHT …':'START'}
async function spin(){
 if(spinning)return;const math=subject==='mathe';const pool=math?[]:eligible();
 const mathOptions=math?mathTaskOptions(mathRanges,mathOperations,mathAllowOverflow):null;
 if(math?!mathOptions.operations.length:!pool.length)return;
 stopParty();if(math)mathRoundsSinceJackpot++;else roundsSinceJackpot++;
 const jackpot=math?isJackpot(mathRoundsSinceJackpot,mathJackpotEnabled):isJackpot(roundsSinceJackpot,jackpotEnabled);
 const target=jackpot?null:math?createMathTask(mathRanges,mathOperations,mathAllowOverflow):nextWord(pool);
 const symbols=target?(math?target.symbols:symbolsFor(target)):[STAR,STAR,STAR];
 setBusy(true);resetResult();ui.announcement.textContent='';byId('instruction').textContent='Die Walzen drehen sich …';byId('subinstruction').textContent=math?'Gleich kommt deine nächste Aufgabe.':'Gleich kannst du das Wort lesen.';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const syllablePool=math?[]:[...new Set(pool.flatMap(entry=>entry.syllables)),STAR];
 const mathNumberPool=math?Array.from({length:45},()=>createMathTask(mathRanges,mathOperations,mathAllowOverflow).symbols[0]):[];
 const animationPools=math?[mathNumberPool,mathOptions.operations.map(operation=>operation.symbol),mathNumberPool]:[syllablePool,syllablePool,syllablePool];
 // Lange Streifen rollen flüssig durch jede Walze und bremsen zeitversetzt ab.
 await Promise.all(reels.map(async({reel,strip},index)=>{
  const steps=reduced?0:22+index*7;
  const animationPool=animationPools[index];
  const cells=[cell(displayed[index]),...Array.from({length:steps},(_,step)=>cell(math && step%7===3?STAR:animationPool[randomIndex(animationPool.length)])),cell(symbols[index])];
  strip.replaceChildren(...cells);reel.classList.add('rolling');
  const animation=strip.animate([{transform:'translateY(0)'},{transform:'translateY(calc(-100% + var(--cell-h)))'}],{duration:reduced?80:1450+index*480,easing:'cubic-bezier(.16,.58,.18,1)',fill:'forwards'});
  await animation.finished;
  strip.replaceChildren(cell(symbols[index]));animation.cancel();reel.classList.remove('rolling');
 }));
 if(math)mathTask=target;else current=target;displayed=symbols;setBusy(false);resetResult();
 if(jackpot){
  if(math)mathRoundsSinceJackpot=0;else roundsSinceJackpot=0;byId('instruction').textContent='Drei Sterne! Hurra!';byId('subinstruction').textContent='Drücke START für die nächste Runde.';celebrate();
 }else{
  setInstructions();
 }
 announce();
}
ui.spin.addEventListener('click',spin);
function configureSubject(){
 subject=new URLSearchParams(location.search).get('fach')==='mathe'?'mathe':'deutsch';
 const math=subject==='mathe';
 document.title=(math?'Mathe-Bandit':'Silben-Bandit')+' · Lernbandit';
 byId('game-title').textContent=math?'Der Mathe-Bandit':'Der Silben-Bandit';
 byId('eyebrow').textContent=math?'Drehe die Walzen. Wie lautet das Ergebnis?':'Drehe die Walzen. Welches Wort entsteht?';
 ui.machine.setAttribute('aria-label',math?'Rechenmaschine':'Silbenmaschine');
 byId('about-title').textContent=math?'Wie werden die Aufgaben ausgewählt?':'Wie werden die Wörter ausgewählt?';
 byId('about-deutsch').hidden=math;byId('about-mathe').hidden=!math;
 byId('bank-note').textContent=math?'Rechenaufgaben mit ganzen Zahlen':WORDS.length+' Wörter mit hinterlegten Silben';
}
byId('math-reveal').addEventListener('click',()=>{
 if(spinning || !mathTask)return;
 const reveal=byId('math-reveal').getAttribute('aria-expanded')!=='true';
 byId('math-reveal').setAttribute('aria-expanded',String(reveal));
 byId('result-label').textContent=reveal?'Ergebnis · zum Verdecken tippen':'Ergebnis aufdecken';
 byId('math-result').textContent=reveal?'= '+mathTask.result:'';
 byId('math-result').hidden=!reveal;
 if(reveal)ui.announcement.textContent='Das Ergebnis ist '+mathTask.result+'.';else announce();
});
function syncLengthButtons(){lengthButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.length===draftLength)))}
for(const button of lengthButtons)button.addEventListener('click',()=>{draftLength=button.dataset.length;syncLengthButtons();preview()});
for(const [container,sounds] of [['vowels',VOWELS],['consonants',CONSONANTS],['connections',CONNECTIONS]]){
 for(const sound of sounds){
  const label=document.createElement('label');label.className='choice';const input=document.createElement('input');input.type='checkbox';input.name='sound';input.value=sound;input.setAttribute('aria-label',sound);const span=document.createElement('span');span.textContent=sound;label.append(input,span);byId(container).append(label);choices.push(input);input.addEventListener('change',preview);
 }
}
function draft(){return new Set(choices.filter(input=>input.checked).map(input=>input.value))}
function mathDraft(inputs){return new Set(inputs.filter(input=>input.checked).map(input=>input.value))}
function previewMath(){
 const rangeIds=mathDraft(rangeChoices),operationIds=mathDraft(operationChoices);
 const allowOverflow=byId('math-allow-overflow').checked;
 const {limit,operations}=mathTaskOptions(rangeIds,operationIds,allowOverflow);
 const unavailable=MATH_OPERATIONS.filter(operation=>operationIds.has(operation.id) && !operations.some(valid=>valid.id===operation.id));
 byId('math-settings-error').hidden=true;
 byId('math-preview').textContent=!rangeIds.size || !operationIds.size?'Wähle mindestens einen Zahlenbereich und ein Rechenzeichen.':!operations.length?'Keine passende Aufgabe innerhalb der Obergrenze. Wähle einen weiteren Bereich oder ein anderes Rechenzeichen.':(allowOverflow?'Ergebnisse dürfen größer als '+limit+' sein.':'Ergebnisse von 0 bis '+limit+'.')+(unavailable.length?' Für '+unavailable.map(operation=>operation.label).join(' und ')+' gibt es in dieser Auswahl keine passende Aufgabe.':'');
}
byId('math-allow-overflow').addEventListener('change',previewMath);
for(const [container,items,inputs,name] of [['math-ranges',MATH_RANGES,rangeChoices,'range'],['math-operations',MATH_OPERATIONS,operationChoices,'operation']]){
 for(const item of items){
  const label=document.createElement('label');label.className='choice';
  const input=document.createElement('input');input.type='checkbox';input.name=name;input.value=item.id;input.setAttribute('aria-label',item.label);
  const span=document.createElement('span');span.textContent=item.label;
  if(name==='range'){const detail=document.createElement('small');detail.textContent=item.min+'–'+item.max;span.append(detail)}
  label.append(input,span);byId(container).append(label);inputs.push(input);input.addEventListener('change',previewMath);
 }
}
function preview(){const pool=eligible(draft(),draftLength);byId('preview-count').textContent=pool.length?pool.length+(pool.length===1?' passendes Wort':' passende Wörter')+' für die gewählte Silbenanzahl.':'Keine passenden Wörter. Wähle weitere Laute oder eine andere Silbenanzahl.'}
function selectPreset(sounds){choices.forEach(input=>input.checked=sounds.includes(input.value));preview()}
ui.open.addEventListener('click',()=>{
 if(spinning)return;const math=subject==='mathe';
 byId('deutsch-settings').hidden=math;byId('mathe-settings').hidden=!math;
 byId('settings-title').textContent='Einstellungen · '+(math?'Mathe':'Deutsch');
 byId('settings-description').textContent=math?'Wähle die Zahlenbereiche und Rechenzeichen für deine Aufgaben. Mehrere können gleichzeitig aktiv sein.':'Wähle die Silbenanzahl und die bekannten Buchstaben und Lautverbindungen. Die Maschine zeigt nur passende Wörter.';
 if(math){rangeChoices.forEach(input=>input.checked=mathRanges.has(input.value));operationChoices.forEach(input=>input.checked=mathOperations.has(input.value));byId('math-allow-overflow').checked=mathAllowOverflow;byId('math-jackpot-enabled').checked=mathJackpotEnabled;previewMath()}
 else{draftLength=length;syncLengthButtons();choices.forEach(input=>input.checked=selected.has(input.value));byId('jackpot-enabled').checked=jackpotEnabled;preview()}
 ui.settings.showModal();
});
for(const id of ['settings-close','cancel'])byId(id).addEventListener('click',()=>ui.settings.close());
byId('preset-all').addEventListener('click',()=>selectPreset(ALL_SOUNDS));byId('preset-first').addEventListener('click',()=>selectPreset(FIRST_SOUNDS));byId('preset-none').addEventListener('click',()=>selectPreset([]));
byId('settings-form').addEventListener('submit',event=>{
 event.preventDefault();
 if(subject==='mathe'){
  const ranges=mathDraft(rangeChoices),operations=mathDraft(operationChoices),allowOverflow=byId('math-allow-overflow').checked;
  const options=mathTaskOptions(ranges,operations,allowOverflow);
  const unavailable=MATH_OPERATIONS.filter(operation=>operations.has(operation.id) && !options.operations.some(valid=>valid.id===operation.id));
  if(!ranges.size || !operations.size || unavailable.length){
   const error=byId('math-settings-error');
   error.textContent=!ranges.size || !operations.size?'Wähle mindestens einen Zahlenbereich und ein Rechenzeichen.':unavailable.map(operation=>operation.label).join(' und ')+' ist mit diesen Bereichen innerhalb der Obergrenze '+options.limit+' nicht möglich. Ändere die Bereiche oder Rechenzeichen, oder erlaube Ergebnisse außerhalb des Zahlenbereichs.';
   error.hidden=false;error.focus();return;
  }
  mathRanges=ranges;mathOperations=operations;mathAllowOverflow=allowOverflow;mathJackpotEnabled=byId('math-jackpot-enabled').checked;
 }
 else{selected=draft();length=draftLength;jackpotEnabled=byId('jackpot-enabled').checked}
 refresh();ui.settings.close();
});
ui.settings.addEventListener('close',()=>ui.open.focus());
configureSubject();
refresh();
