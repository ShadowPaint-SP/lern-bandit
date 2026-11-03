(() => {
  const input = document.getElementById('writing-input');
  const highlight = document.getElementById('writing-highlight');
  const coloredText = document.getElementById('colored-text');
  const tool = document.querySelector('.writing-tool');
  const clearButton = document.getElementById('clear-text');
  const announcement = document.getElementById('editor-announcement');
  const dialog = document.getElementById('editor-settings');
  const form = document.getElementById('settings-form');
  const settingsButton = document.getElementById('settings-open');
  const colors = { teal: '#247c79', red: '#c23e32', blue: '#315baa' };
  const example = 'Die kleine Katze spielt im Garten.\nHeute scheint die Sonne. Eine Familie macht einen Ausflug.';
  let settings = { size: 32, color: 'red', bows: false };
  let composing = false;

  function syncScroll() {
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
  }

  function syncGeometry() {
    // The mirror must exclude the native scrollbar just like the textarea's text.
    highlight.style.width = input.clientWidth + 'px';
    highlight.style.height = input.clientHeight + 'px';
    syncScroll();
  }

  function render() {
    const text = input.value;
    const fragment = document.createDocumentFragment();
    let end = 0;
    for (const match of text.matchAll(/\p{L}[\p{L}\p{M}]*/gu)) {
      fragment.append(document.createTextNode(text.slice(end, match.index)));
      end = match.index + match[0].length;
      if (composing) {
        fragment.append(document.createTextNode(match[0]));
        continue;
      }
      window.LernbanditSyllables.splitWord(match[0]).forEach((part, index) => {
        const span = document.createElement('span');
        span.className = 'syllable' + (index % 2 ? ' is-colored' : '');
        span.textContent = part;
        fragment.append(span);
      });
    }
    fragment.append(document.createTextNode(text.slice(end)));
    // Preserve the last empty line, which the native textarea also lays out.
    fragment.append(document.createTextNode('\u200b'));
    coloredText.replaceChildren(fragment);
    clearButton.disabled = text.length === 0;
    syncGeometry();
  }

  function setText(text) {
    input.value = text;
    input.scrollTop = 0;
    render();
    input.focus();
    input.setSelectionRange(text.length, text.length);
  }

  input.addEventListener('input', render);
  input.addEventListener('scroll', syncScroll, { passive: true });
  input.addEventListener('compositionstart', () => { composing = true; render(); });
  input.addEventListener('compositionend', () => { composing = false; render(); });
  document.getElementById('load-example').addEventListener('click', () => {
    setText(example);
    announcement.textContent = 'Beispieltext geladen.';
  });
  clearButton.addEventListener('click', () => {
    setText('');
    announcement.textContent = 'Text geleert.';
  });

  settingsButton.addEventListener('click', () => {
    form.querySelector(`input[name="size"][value="${settings.size}"]`).checked = true;
    form.querySelector(`input[name="color"][value="${settings.color}"]`).checked = true;
    form.elements.bows.checked = settings.bows;
    dialog.showModal();
  });
  for (const id of ['settings-close', 'settings-cancel']) {
    document.getElementById(id).addEventListener('click', () => dialog.close());
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    settings = {
      size: Number(form.querySelector('input[name="size"]:checked').value),
      color: form.querySelector('input[name="color"]:checked').value,
      bows: form.elements.bows.checked,
    };
    tool.style.setProperty('--editor-size', settings.size + 'px');
    tool.style.setProperty('--syllable-color', colors[settings.color]);
    coloredText.classList.toggle('show-bows', settings.bows);
    render();
    dialog.close();
    announcement.textContent = 'Einstellungen übernommen.';
  });
  dialog.addEventListener('close', () => settingsButton.focus());

  new ResizeObserver(syncGeometry).observe(input);
  document.fonts.ready.then(syncGeometry);
  window.LernbanditSyllables.ready.then(render, () => {
    document.getElementById('engine-warning').hidden = false;
    render();
  });
  render();
})();
