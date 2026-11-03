(() => {
  const brand = `<a class="brand" href="index.html" aria-label="Lernbandit Startseite">
    <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M6 17c2-8 26-8 28 0l-2 10c-6 5-9-4-12-4s-6 9-12 4L6 17Z" fill="currentColor"/><ellipse cx="13.5" cy="20" rx="3" ry="3.5" fill="#292b2b"/><ellipse cx="26.5" cy="20" rx="3" ry="3.5" fill="#292b2b"/></svg></span>
    <span>Lernbandit<span class="brand-dot">.</span></span>
  </a>`;
  document.querySelector('[data-site-header]').insertAdjacentHTML('afterbegin', brand);

  const page = document.body.dataset.page;
  const current = page === 'bandit'
    ? new URLSearchParams(location.search).get('fach') === 'mathe' ? 'mathe' : 'silben'
    : page;
  const navigation = document.querySelector('[data-game-nav]');
  const subjects = [
    { id: 'deutsch', name: 'Deutsch', tools: [
      { id: 'silben', name: 'Silben-Bandit', href: 'bandit.html?fach=deutsch' },
      { id: 'silbenfarben', name: 'Silbenfarben', href: 'silbenfarben.html' },
    ] },
    { id: 'mathe', name: 'Mathe', tools: [
      { id: 'mathe', name: 'Mathe-Bandit', href: 'bandit.html?fach=mathe' },
      { id: 'schuettelbox', name: 'Schüttelbox', href: 'schuettelbox.html' },
    ] },
  ];
  navigation.innerHTML = subjects.map(subject => `<div class="nav-group">
    <button class="nav-trigger" type="button" aria-expanded="false" aria-controls="nav-${subject.id}"${subject.tools.some(tool => tool.id === current) ? ' data-current="true"' : ''}>${subject.name}<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="nav-submenu" id="nav-${subject.id}" hidden>${subject.tools.map(tool =>
      `<a href="${tool.href}"${current === tool.id ? ' aria-current="page"' : ''}>${tool.name}</a>`
    ).join('')}</div>
  </div>`).join('');

  const triggers = [...navigation.querySelectorAll('.nav-trigger')];
  function closeMenus(returnFocus = false) {
    const open = triggers.find(trigger => trigger.getAttribute('aria-expanded') === 'true');
    for (const trigger of triggers) {
      trigger.setAttribute('aria-expanded', 'false');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
    }
    if (returnFocus) open?.focus();
  }
  function openMenu(trigger) {
    closeMenus();
    trigger.setAttribute('aria-expanded', 'true');
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
  }
  for (const trigger of triggers) {
    trigger.addEventListener('click', () => {
      if (trigger.getAttribute('aria-expanded') === 'true') closeMenus();
      else openMenu(trigger);
    });
    trigger.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      openMenu(trigger);
      const links = document.getElementById(trigger.getAttribute('aria-controls')).querySelectorAll('a');
      (event.key === 'ArrowDown' ? links[0] : links[links.length - 1]).focus();
    });
  }
  navigation.querySelectorAll('.nav-submenu').forEach(submenu => {
    submenu.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const links = [...submenu.querySelectorAll('a')];
      const index = links.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[next].focus();
    });
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target)) closeMenus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && triggers.some(trigger => trigger.getAttribute('aria-expanded') === 'true')) {
      event.preventDefault();
      closeMenus(true);
    }
  });
  window.addEventListener('pageshow', () => closeMenus());
  navigation.addEventListener('focusout', event => {
    if (!navigation.contains(event.relatedTarget)) closeMenus();
  });
})();
