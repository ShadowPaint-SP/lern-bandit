const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const context = vm.createContext({});
vm.runInContext(script.slice(0, script.indexOf('const byId=')) + `
this.api={MATH_RANGES,MATH_OPERATIONS,isJackpot,
task:(ranges,operations,random,allowOverflow=false)=>createMathTask(new Set(ranges),new Set(operations),allowOverflow,random)};
`, context);
const {api} = context;
assert.deepEqual(Array.from(api.MATH_RANGES, range => [range.id, range.min, range.max]), [
 ['zehner', 0, 10], ['hunderter', 10, 100], ['tausender', 100, 1000], ['millionen', 1000, 1000000]
]);
assert.ok(api.task(['zehner'], ['plus']));
assert.equal(api.task([], ['plus']), null);
assert.equal(api.task(['zehner'], []), null);
assert.equal(api.task(['invalid'], ['plus']), null);
assert.equal(api.task(['tausender'], ['mal']), null, 'Even 100 × 100 exceeds the thousands limit.');
for (const random of [()=>0, ()=>1-Number.EPSILON, Math.random]) {
 for (let i=0;i<30;i++) {
  const millions=api.task(['millionen'], ['mal'], random);
  assert.equal(millions.left, 1000);
  assert.equal(millions.right, 1000);
  assert.equal(millions.result, 1000000, 'Only 1000 × 1000 fits in the millions range alone.');
  const hundreds=api.task(['hunderter'], ['mal'], random);
  assert.equal(hundreds.left, 10);
  assert.equal(hundreds.right, 10);
  assert.equal(hundreds.result, 100);
 }
}
const operationIds=api.MATH_OPERATIONS.map(operation=>operation.id);
let count=0;
for (let mask=1;mask<16;mask++) {
 const selectedRanges=api.MATH_RANGES.filter((range,index)=>mask & (1<<index));
 const ranges=selectedRanges.map(range=>range.id);
 const limit=Math.max(...selectedRanges.map(range=>range.max));
 for (let opMask=1;opMask<8;opMask++) {
  const operations=operationIds.filter((id,index)=>opMask & (1<<index));
  for (let i=0;i<102;i++) {
   const random=i===0?()=>0:i===1?()=>1-Number.EPSILON:Math.random;
   const task=api.task(ranges, operations, random);
   if (!task) {
    assert.deepEqual(Array.from(ranges), ['tausender']);
    assert.deepEqual(Array.from(operations), ['mal']);
    continue;
   }
   count++;
   for (const operand of [task.left, task.right]) {
    assert.ok(selectedRanges.some(range=>operand>=range.min && operand<=range.max), `${operand} outside selected ranges`);
   }
   assert.ok(operations.includes(task.operation));
   assert.ok(Number.isSafeInteger(task.result) && task.result>=0 && task.result<=limit, `${task.symbols.join(' ')} = ${task.result} exceeds ${limit}`);
   assert.equal(task.result,task.operation==='plus'?task.left+task.right:task.operation==='minus'?task.left-task.right:task.left*task.right);
   assert.ok(!task.symbols.includes('★'));
  }
 }
}
const relaxed=api.task(['millionen'],['mal'],()=>1-Number.EPSILON,true);
assert.equal(relaxed.left,1000000);
assert.equal(relaxed.right,1000000);
assert.equal(relaxed.result,1000000000000);
const relaxedThousands=api.task(['tausender'],['mal'],()=>1-Number.EPSILON,true);
assert.equal(relaxedThousands.result,1000000,'Relaxing the bound enables otherwise impossible operations.');
let relaxedDraws=[0,0,0,1-Number.EPSILON];
const relaxedMinus=api.task(['zehner'],['minus'],()=>relaxedDraws.shift(),true);
assert.equal(relaxedMinus.result,10,'Relaxing the upper bound keeps subtraction nonnegative.');
const mixedPairs=new Set();
for (let i=0;i<1000;i++) {
 const task=api.task(['zehner','millionen'], ['mal']);
 assert.ok(task.result<=1000000);
 mixedPairs.add((task.left<=10?'small':'large')+'-'+(task.right<=10?'small':'large'));
}
assert.deepEqual([...mixedPairs].sort(), ['large-large','large-small','small-large','small-small']);
const upperSum=api.task(['zehner'], ['plus'],()=>1-Number.EPSILON);
assert.equal(upperSum.result,10,'Addition may reach the limit exactly.');
let draws=[0,0,0,1-Number.EPSILON];
const subtraction=api.task(['zehner'],['minus'],()=>draws.shift());
assert.equal(subtraction.left,10);
assert.equal(subtraction.right,0);
assert.equal(subtraction.result,10);
assert.equal(api.isJackpot(1,true,0),true);
assert.equal(api.isJackpot(1,true,.059999),true);
assert.equal(api.isJackpot(1,true,.06),false);
assert.equal(api.isJackpot(9,true,.99),false);
assert.equal(api.isJackpot(10,true,.99),true);
assert.equal(api.isJackpot(10,false,0),false);
console.log(`PASS: ${count} bounded tasks across all range/operation selections; endpoint draws; millions-only multiplication; mixed ranges; impossible tasks; nonnegative subtraction and jackpot threshold.`);
