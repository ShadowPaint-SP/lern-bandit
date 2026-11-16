const assert = require('node:assert/strict');
const { alphabet, emptyPlan, nameLetters, nameProgress, readPlan, validDate } = require('../assets/buchstabengeburtstag-model.js');

const dates = { E: '2026-09-14', M: '2026-09-02', A: '2026-09-07' };
assert.deepEqual(nameLetters('eMma'), ['E', 'M', 'A']);
assert.equal(nameProgress('Emma', dates).birthday, '2026-09-14');
assert.equal(nameProgress('Emma', { ...dates, M: '2027-01-04' }).birthday, '2027-01-04');
assert.equal(nameProgress('Emma', { ...dates, E: '2026-08-01' }).birthday, '2026-09-07');
assert.deepEqual(nameProgress('Mia', dates).missing, ['I']);
assert.equal(nameProgress('Mia', dates).birthday, null);
assert.equal(nameProgress('', dates).birthday, null);
assert.deepEqual(nameLetters('A\u0308nne-Öz Üß ẞ Éléa'), ['Ä', 'N', 'E', 'Ö', 'Z', 'Ü', 'ß', 'L', 'A']);
assert.deepEqual(nameProgress('Jørn', { J: '2026-10-01', R: '2026-10-02', N: '2026-10-03' }).missing, ['Ø']);
assert.equal(nameProgress('Änne', { A: '2026-01-01', N: '2026-01-02', E: '2026-01-03' }).birthday, null);
assert.equal(nameProgress('Anna-Mia', { A: '2026-11-02', N: '2026-11-02', M: '2026-11-02', I: '2026-11-02' }).birthday, '2026-11-02');
assert.equal(alphabet.length, 30);
assert.equal(validDate('2028-02-29'), true);
for (const invalid of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-01-00', '2026-1-1', 'today', 42, null]) {
  assert.equal(validDate(invalid), false, String(invalid));
}
assert.deepEqual(readPlan(null), emptyPlan());
const saved = { version: 1, names: ['Emma', 'Mia'], introductions: dates };
assert.deepEqual(readPlan(JSON.stringify(saved)), saved);
for (const bad of [null, {}, { ...saved, version: 2 }, { ...saved, names: [null] }, { ...saved, names: ['123'] },
  { ...saved, introductions: { A: '2026-02-30' } }, { ...saved, introductions: { UNKNOWN: '2026-01-01' } }]) {
  assert.throws(() => readPlan(JSON.stringify(bad)));
}
assert.throws(() => readPlan('{broken'));
console.log('Buchstabengeburtstage: Berechnung, Namensnormalisierung und gespeicherte Daten geprüft.');
