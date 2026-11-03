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
  const games = [
    { id: 'silben', name: 'Silben-Bandit', href: 'bandit.html?fach=deutsch' },
    { id: 'mathe', name: 'Mathe-Bandit', href: 'bandit.html?fach=mathe' },
    { id: 'schuettelbox', name: 'Schüttelbox', href: 'schuettelbox.html' },
  ];
  document.querySelector('[data-game-nav]').innerHTML = games.map(game =>
    `<a href="${game.href}"${current === game.id ? ' aria-current="page"' : ''}>${game.name}</a>`
  ).join('');
})();
