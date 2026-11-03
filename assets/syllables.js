// Approved reading syllables take precedence over the automatic German patterns.
window.LernbanditSyllables = (() => {
  const known = new Map(WORD_SOURCE.trim().split(/\s+/).map(entry => {
    const parts = entry.split('-');
    return [parts.join('').toLocaleLowerCase('de'), parts];
  }));
  const cache = new Map();
  let engine = null;
  const ready = Promise.resolve().then(async () => {
    const bytes = Uint8Array.from(atob(DE_SYLLABLE_WASM), char => char.charCodeAt(0));
    const { instance } = await WebAssembly.instantiate(bytes);
    engine = instance.exports;
  });

  // Keep the exact typed text, including capitalization and decomposed umlauts.
  function restoreSpelling(word, parts) {
    const boundaries = new Map([[0, 0]]);
    let originalOffset = 0, normalizedOffset = 0;
    for (const match of word.matchAll(/\P{M}\p{M}*/gu)) {
      originalOffset += match[0].length;
      normalizedOffset += match[0].normalize('NFC').length;
      boundaries.set(normalizedOffset, originalOffset);
    }
    const result = [];
    let start = 0, normalizedEnd = 0;
    for (const part of parts) {
      normalizedEnd += part.length;
      const end = boundaries.get(normalizedEnd);
      if (end === undefined) return [word];
      result.push(word.slice(start, end));
      start = end;
    }
    return start === word.length ? result : [word];
  }

  function splitWord(word) {
    const normalized = word.normalize('NFC');
    const approved = known.get(normalized.toLocaleLowerCase('de'));
    if (approved) return restoreSpelling(word, approved);
    if (cache.has(word)) return [...cache.get(word)];
    // The Wasm interface accepts up to 61 UTF-16 units. Leave unsupported text intact.
    if (!engine || normalized.length > 61 || !/^\p{L}+$/u.test(normalized)) return [word];
    const memory = new Uint16Array(engine.mem.buffer);
    for (let i = 0; i < normalized.length; i++) memory[i] = normalized.charCodeAt(i);
    memory[normalized.length] = 0;
    const length = engine.hyphenate(engine.lmi.value, engine.rmi.value, 45);
    const separated = length > 0 ? String.fromCharCode(...memory.subarray(0, length)) : normalized;
    const parts = restoreSpelling(word, separated.split('-'));
    if (cache.size >= 2048) cache.delete(cache.keys().next().value);
    cache.set(word, parts);
    return [...parts];
  }

  return { ready, splitWord };
})();
