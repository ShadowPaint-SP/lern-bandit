const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

async function main() {
  const context = vm.createContext({ window: {}, WebAssembly, atob });
  const assets = path.join(__dirname, '..', 'assets');
  for (const file of ['words.js', 'vendor/de-syllable.js', 'syllables.js']) {
    vm.runInContext(fs.readFileSync(path.join(assets, file), 'utf8'), context);
  }
  const api = context.window.LernbanditSyllables;
  await api.ready;
  const entries = vm.runInContext('WORD_SOURCE.trim().split(/\\s+/)', context);
  for (const entry of entries) {
    const expected = entry.split('-');
    assert.deepEqual(Array.from(api.splitWord(expected.join(''))), expected);
  }
  for (const [word, expected] of [
    ['Familie', ['Fa', 'mi', 'lie']],
    ['fAMILIE', ['fA', 'MI', 'LIE']],
    ['Bu\u0308cher', ['Bu\u0308', 'cher']],
    ['Lernbandit', ['Lern', 'ban', 'dit']],
    ['Lieblingsgeschichte', ['Lieb', 'lings', 'ge', 'schich', 'te']],
    ['a'.repeat(70), ['a'.repeat(70)]],
    ['123', ['123']],
    ['', ['']],
  ]) {
    const result = Array.from(api.splitWord(word));
    assert.deepEqual(result, expected, word);
    assert.equal(result.join(''), word, 'The typed spelling must remain unchanged.');
  }
  const cached = api.splitWord('Lernbandit');
  cached[0] = 'changed';
  assert.deepEqual(Array.from(api.splitWord('Lernbandit')), ['Lern', 'ban', 'dit']);
  console.log(`PASS: ${entries.length} approved readings; automatic fallback; capitalization; decomposed umlauts; long words and cache isolation.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
