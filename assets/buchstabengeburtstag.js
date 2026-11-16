(() => {
  const { alphabet, storageKey, emptyPlan, validName, validDate, nameProgress, readPlan } = window.LernbanditBirthday;
  const byId = id => document.getElementById(id);
  const bank = byId('letter-bank');
  const days = byId('calendar-days');
  const namesList = byId('names-list');
  const namesInput = byId('names-input');
  const warning = byId('storage-warning');
  const settings = byId('planner-settings');
  const today = new Date();
  const monthFormat = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
  const dateFormat = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  let plan = emptyPlan();
  let selected = null;
  let draggedLetter = null;

  function showWarning(message) {
    warning.textContent = message;
    warning.hidden = !message;
  }

  try {
    plan = readPlan(localStorage.getItem(storageKey));
  } catch {
    showWarning('Die gespeicherten Planerdaten konnten nicht geladen werden. Prüfe, ob dein Browser lokale Speicherung erlaubt. Neue Änderungen ersetzen die bisherigen Planerdaten.');
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(plan));
      showWarning('');
    } catch {
      showWarning('Deine Änderungen sind nur für diesen Seitenaufruf vorhanden. Der Browser konnte sie nicht speichern. Erlaube lokale Speicherung und versuche die Änderung erneut, bevor du die Seite schließt.');
    }
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function formatDate(date) {
    return dateFormat.format(new Date(date + 'T12:00:00'));
  }

  function announce(message) {
    byId('planner-announcement').textContent = message;
  }

  function makeLetter(letter, inCalendar = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'letter-tile';
    button.textContent = letter;
    button.dataset.letter = letter;
    button.draggable = true;
    if (inCalendar) button.setAttribute('aria-label', `${letter}, geplant am ${formatDate(plan.introductions[letter])}, verschieben`);
    return button;
  }

  function updateSelection() {
    document.querySelectorAll('[data-letter]').forEach(button => {
      const letter = button.dataset.letter;
      const date = plan.introductions[letter];
      button.setAttribute('aria-pressed', String(letter === selected));
      if (bank.contains(button)) {
        button.classList.toggle('is-planned', Boolean(date));
        const label = date ? `${letter}, geplant am ${formatDate(date)}` : `${letter}, noch nicht geplant`;
        button.setAttribute('aria-label', label);
        button.title = label;
      }
    });
    byId('planned-count').textContent = `${Object.keys(plan.introductions).length} von ${alphabet.length} geplant`;
    byId('selection-hint').textContent = selected
      ? `${selected} ausgewählt${plan.introductions[selected] ? ', geplant am ' + formatDate(plan.introductions[selected]) : ''}. Klicke auf den gewünschten Tag.`
      : 'Ziehe einen Buchstaben auf einen Tag. Oder klicke erst den Buchstaben, dann den Tag an.';
    byId('cancel-letter').hidden = !selected;
    byId('remove-letter').hidden = !selected || !plan.introductions[selected];
  }

  function selectLetter(letter) {
    selected = selected === letter ? null : letter;
    updateSelection();
  }

  function renderCalendar() {
    byId('month-title').textContent = monthFormat.format(month);
    byId('previous-month').disabled = month.getFullYear() === 1000 && month.getMonth() === 0;
    byId('next-month').disabled = month.getFullYear() === 9999 && month.getMonth() === 11;
    const offset = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((offset + count) / 7) * 7;
    const birthdays = new Map();
    for (const name of plan.names) {
      const { birthday } = nameProgress(name, plan.introductions);
      if (!birthday) continue;
      if (!birthdays.has(birthday)) birthdays.set(birthday, []);
      birthdays.get(birthday).push(name);
    }
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < cells; index++) {
      const day = index - offset + 1;
      const cell = document.createElement('div');
      if (day < 1 || day > count) {
        cell.className = 'calendar-blank';
        cell.setAttribute('aria-hidden', 'true');
      } else {
        const date = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const letters = alphabet.filter(letter => plan.introductions[letter] === date);
        const names = birthdays.get(date) || [];
        cell.className = 'calendar-day';
        cell.dataset.date = date;
        cell.classList.toggle('is-weekend', index % 7 >= 5);
        cell.classList.toggle('is-today', date === dateKey(today));
        cell.classList.toggle('has-birthday', names.length > 0);
        const target = document.createElement('button');
        target.type = 'button';
        target.className = 'day-target';
        target.setAttribute('aria-label', formatDate(date)
          + (letters.length ? `. Buchstaben: ${letters.join(', ')}` : '')
          + (names.length ? `. Buchstabengeburtstag: ${names.join(', ')}` : ''));
        if (date === dateKey(today)) target.setAttribute('aria-current', 'date');
        const number = document.createElement('span');
        number.className = 'day-number';
        number.textContent = day;
        number.setAttribute('aria-hidden', 'true');
        const tileGroup = document.createElement('div');
        tileGroup.className = 'day-letters';
        letters.forEach(letter => tileGroup.append(makeLetter(letter, true)));
        const birthdayList = document.createElement('ul');
        birthdayList.className = 'day-birthdays';
        birthdayList.setAttribute('aria-label', 'Buchstabengeburtstage');
        for (const name of names) {
          const item = document.createElement('li');
          const star = document.createElement('span');
          star.className = 'birthday-star';
          star.setAttribute('aria-hidden', 'true');
          star.textContent = '✦';
          item.append(star, document.createTextNode(name));
          birthdayList.append(item);
        }
        target.append(number);
        cell.append(target, tileGroup, birthdayList);
      }
      fragment.append(cell);
    }
    days.replaceChildren(fragment);
  }

  function renderNames() {
    byId('empty-names').hidden = plan.names.length > 0;
    namesList.replaceChildren();
    plan.names.forEach((name, index) => {
      const { missing, birthday } = nameProgress(name, plan.introductions);
      const row = document.createElement('li');
      row.className = 'name-row';
      const title = document.createElement('p');
      title.className = 'name-text';
      title.textContent = name;
      const status = document.createElement('p');
      status.className = 'name-status';
      if (birthday) {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'name-date';
        link.textContent = '✦ ' + formatDate(birthday);
        link.setAttribute('aria-label', `Buchstabengeburtstag von ${name}, ${formatDate(birthday)}, im Kalender anzeigen`);
        link.addEventListener('click', () => {
          month = new Date(birthday.slice(0, 7) + '-01T12:00:00');
          renderCalendar();
          updateSelection();
          days.querySelector(`[data-date="${birthday}"] .day-target`).focus();
        });
        status.append(link);
      } else {
        status.textContent = 'Noch offen: ' + missing.join(', ');
        const unavailable = missing.filter(letter => !alphabet.includes(letter));
        if (unavailable.length) status.textContent += '. Nicht als Plättchen verfügbar: ' + unavailable.join(', ');
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-name';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `${name} entfernen`);
      remove.addEventListener('click', () => {
        plan.names.splice(index, 1);
        save();
        render();
        const buttons = namesList.querySelectorAll('.remove-name');
        (buttons[Math.min(index, buttons.length - 1)] || namesInput).focus();
        announce(`${name} entfernt.`);
      });
      row.append(title, status, remove);
      namesList.append(row);
    });
  }

  function render() {
    renderCalendar();
    renderNames();
    updateSelection();
  }

  function schedule(letter, date, focusDay = false) {
    if (!alphabet.includes(letter) || !validDate(date)) return;
    plan.introductions[letter] = date;
    selected = null;
    save();
    render();
    if (focusDay) days.querySelector(`[data-date="${date}"] .day-target`).focus({ preventScroll: true });
    const names = plan.names.filter(name => nameProgress(name, plan.introductions).birthday === date);
    announce(`${letter} am ${formatDate(date)} geplant.${names.length ? ' Buchstabengeburtstag: ' + names.join(', ') + '.' : ''}`);
  }

  function removeIntroduction(letter) {
    selected = null;
    if (!plan.introductions[letter]) {
      updateSelection();
      return;
    }
    delete plan.introductions[letter];
    save();
    render();
    announce(`Termin für ${letter} entfernt.`);
  }

  alphabet.forEach(letter => bank.append(makeLetter(letter)));
  document.addEventListener('click', event => {
    const tile = event.target.closest('[data-letter]');
    if (tile) selectLetter(tile.dataset.letter);
  });
  document.addEventListener('dragstart', event => {
    const tile = event.target.closest('[data-letter]');
    if (!tile) return;
    draggedLetter = tile.dataset.letter;
    selected = draggedLetter;
    updateSelection();
    event.dataTransfer.setData('text/plain', selected);
    event.dataTransfer.effectAllowed = 'move';
  });
  function clearDropTargets() {
    days.querySelectorAll('.is-drop-target').forEach(cell => cell.classList.remove('is-drop-target'));
  }
  days.addEventListener('dragover', event => {
    const cell = event.target.closest('[data-date]');
    if (!cell || !draggedLetter) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearDropTargets();
    cell.classList.add('is-drop-target');
  });
  days.addEventListener('dragleave', event => {
    const cell = event.target.closest('[data-date]');
    if (cell && !cell.contains(event.relatedTarget)) cell.classList.remove('is-drop-target');
  });
  days.addEventListener('drop', event => {
    const cell = event.target.closest('[data-date]');
    if (!cell || !draggedLetter) return;
    event.preventDefault();
    const letter = draggedLetter;
    draggedLetter = null;
    schedule(letter, cell.dataset.date);
  });
  // Accept real drops outside the calendar; cancelling a drag keeps its date.
  document.addEventListener('dragover', event => {
    if (!draggedLetter || event.target.closest('.calendar')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearDropTargets();
  });
  document.addEventListener('drop', event => {
    if (!draggedLetter || event.target.closest('.calendar')) return;
    event.preventDefault();
    const letter = draggedLetter;
    draggedLetter = null;
    clearDropTargets();
    removeIntroduction(letter);
  });
  document.addEventListener('dragend', () => {
    draggedLetter = null;
    selected = null;
    clearDropTargets();
    updateSelection();
  });
  days.addEventListener('click', event => {
    const cell = event.target.closest('[data-date]');
    if (!cell || event.target.closest('[data-letter]')) return;
    if (selected) schedule(selected, cell.dataset.date, true);
    else announce('Wähle zuerst einen Buchstaben oder ziehe ihn auf den gewünschten Tag.');
  });
  byId('cancel-letter').addEventListener('click', () => {
    const previous = selected;
    selected = null;
    updateSelection();
    bank.querySelector(`[data-letter="${previous}"]`)?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected && !settings.open) {
      selected = null;
      updateSelection();
    }
  });
  byId('remove-letter').addEventListener('click', () => {
    const letter = selected;
    removeIntroduction(letter);
    bank.querySelector(`[data-letter="${letter}"]`).focus();
  });
  for (const [id, direction] of [['previous-month', -1], ['next-month', 1]]) {
    byId(id).addEventListener('click', () => {
      month = new Date(month.getFullYear(), month.getMonth() + direction, 1);
      renderCalendar();
      updateSelection();
    });
  }
  byId('today-month').addEventListener('click', () => {
    month = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
    updateSelection();
  });
  byId('names-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = namesInput.value.trim().normalize('NFC');
    const error = byId('names-error');
    if (!name) {
      namesInput.value = '';
      error.hidden = true;
      return;
    }
    if (!validName(name)) {
      error.textContent = 'Trage einen Namen mit mindestens einem Buchstaben und höchstens 80 Zeichen ein.';
      error.hidden = false;
      namesInput.focus();
      return;
    }
    const known = plan.names.some(existing => existing.normalize('NFC').toLocaleLowerCase('de-DE') === name.toLocaleLowerCase('de-DE'));
    if (!known) {
      plan.names.push(name);
      save();
      render();
    }
    namesInput.value = '';
    error.hidden = true;
    namesInput.focus();
    announce(known ? 'Dieser Name steht bereits in der Liste.' : `${name} hinzugefügt.`);
  });

  function resetConfirmation() {
    byId('delete-confirmation').hidden = true;
    byId('delete-data').hidden = false;
  }
  byId('settings-open').addEventListener('click', () => {
    resetConfirmation();
    byId('delete-status').textContent = '';
    settings.showModal();
  });
  byId('settings-close').addEventListener('click', () => settings.close());
  byId('delete-data').addEventListener('click', () => {
    byId('delete-data').hidden = true;
    byId('delete-confirmation').hidden = false;
    byId('delete-cancel').focus();
  });
  byId('delete-cancel').addEventListener('click', () => {
    resetConfirmation();
    byId('delete-data').focus();
  });
  byId('delete-confirm').addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      byId('delete-status').textContent = 'Die Daten konnten nicht gelöscht werden. Prüfe die Browser-Einstellungen zur lokalen Speicherung und versuche es erneut.';
      return;
    }
    plan = emptyPlan();
    selected = null;
    namesInput.value = '';
    byId('names-error').hidden = true;
    showWarning('');
    render();
    resetConfirmation();
    byId('delete-status').textContent = 'Alle Namen und Buchstabentermine wurden gelöscht.';
    byId('delete-data').focus();
  });
  // Keep open tabs from overwriting a deletion or an updated plan from another tab.
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    try {
      plan = readPlan(event.newValue);
      selected = null;
      render();
      showWarning('');
      announce('Der Plan wurde in einem anderen Tab aktualisiert.');
    } catch {
      showWarning('Ein anderer Tab hat ungültige Planerdaten gespeichert. Lade die Seite neu oder lösche die Planerdaten in den Einstellungen.');
    }
  });
  render();
})();
