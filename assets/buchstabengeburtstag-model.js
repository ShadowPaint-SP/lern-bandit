(() => {
  const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ', 'ß'];
  const storageKey = 'lernbandit.buchstabengeburtstag.v1';
  const emptyPlan = () => ({ version: 1, names: [], introductions: {} });

  function nameLetters(name) {
    const letters = [...name.normalize('NFC')].filter(letter => /\p{L}/u.test(letter));
    return [...new Set(letters.flatMap(letter => {
      if (/[ßẞ]/u.test(letter)) return ['ß'];
      const upper = letter.toLocaleUpperCase('de-DE');
      if (alphabet.includes(upper)) return [upper];
      return [...upper.normalize('NFD').replace(/\p{M}/gu, '')];
    }))];
  }

  function validName(name) {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 80 && nameLetters(name).length > 0;
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00');
    return !Number.isNaN(date.getTime()) && date.getFullYear() >= 1000
      && date.getFullYear() === Number(value.slice(0, 4))
      && date.getMonth() + 1 === Number(value.slice(5, 7))
      && date.getDate() === Number(value.slice(8, 10));
  }

  // ISO calendar dates sort chronologically without timezone conversion.
  function nameProgress(name, introductions) {
    const letters = nameLetters(name);
    const missing = letters.filter(letter => !Object.hasOwn(introductions, letter));
    const birthday = letters.length && !missing.length
      ? letters.map(letter => introductions[letter]).sort().at(-1) : null;
    return { letters, missing, birthday };
  }

  function readPlan(raw) {
    if (raw === null) return emptyPlan();
    const plan = JSON.parse(raw);
    if (!plan || plan.version !== 1 || !Array.isArray(plan.names) || !plan.names.every(validName)
      || !plan.introductions || typeof plan.introductions !== 'object' || Array.isArray(plan.introductions)
      || !Object.entries(plan.introductions).every(([letter, date]) => alphabet.includes(letter) && validDate(date))) {
      throw new Error('Ungültige Planerdaten');
    }
    return { version: 1, names: plan.names.map(name => name.trim()), introductions: { ...plan.introductions } };
  }

  const model = { alphabet, storageKey, emptyPlan, nameLetters, validName, validDate, nameProgress, readPlan };
  if (typeof module === 'object' && module.exports) module.exports = model;
  else window.LernbanditBirthday = model;
})();
