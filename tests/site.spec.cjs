const { test, expect } = require('@playwright/test');

test('the landing page links to three playable games with a shared navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Was spielen wir heute?');
  await expect(page.getByRole('navigation', { name: 'Spiele' }).getByRole('link')).toHaveCount(3);
  await page.locator('.game-choice').filter({ hasText: 'Silben-Bandit' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Der Silben-Bandit');
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveText('Silben-Bandit');
  await expect(page.locator('.cell')).toHaveCount(3);
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.locator('#jackpot-enabled').uncheck();
  await page.getByRole('button', { name: 'Übernehmen', exact: true }).click();
  await page.getByRole('button', { name: 'START', exact: true }).click();
  await expect(page.getByRole('button', { name: 'START', exact: true })).toBeEnabled();
  await expect(page.locator('#announcement')).toContainText('Lies von links nach rechts:');

  await page.getByRole('navigation', { name: 'Spiele' }).getByRole('link', { name: 'Mathe-Bandit', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Der Mathe-Bandit');
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveText('Mathe-Bandit');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await expect(page.locator('#mathe-settings')).toBeVisible();
  await page.locator('#math-jackpot-enabled').uncheck();
  await page.getByRole('button', { name: 'Übernehmen', exact: true }).click();
  await page.getByRole('button', { name: 'START', exact: true }).click();
  await expect(page.getByRole('button', { name: 'START', exact: true })).toBeEnabled();
  const task = await page.locator('.cell').allTextContents();
  const expected = task[1] === '+' ? Number(task[0]) + Number(task[2]) : task[1] === '−' ? Number(task[0]) - Number(task[2]) : Number(task[0]) * Number(task[2]);
  await page.locator('#math-reveal').click();
  await expect(page.locator('#math-result')).toHaveText('= ' + expected);
  await page.locator('#math-reveal').click();
  await expect(page.locator('#math-result')).toBeHidden();

  await page.getByRole('navigation', { name: 'Spiele' }).getByRole('link', { name: 'Schüttelbox', exact: true }).click();
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveText('Schüttelbox');
  await page.getByRole('button', { name: 'Ergänzen', exact: true }).click();
  await page.getByRole('button', { name: 'Schütteln!', exact: true }).click();
  await expect(page.locator('#right-number')).toHaveText('?');
  await page.getByRole('button', { name: 'Rechtes Fach aufdecken', exact: true }).click();
  const left = Number(await page.locator('#left-number').textContent());
  const right = Number(await page.locator('#right-number').textContent());
  expect(left + right).toBe(10);
  await page.getByRole('link', { name: 'Lernbandit Startseite', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Was spielen wir heute?');
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('shutters close before the box shakes, and reopening keeps the practice answer hidden', async ({ page }) => {
  await page.goto('/schuettelbox.html');
  const shake = page.getByRole('button', { name: 'Schütteln!', exact: true });
  await page.getByRole('button', { name: 'Ergänzen', exact: true }).click();
  await shake.click();
  await expect(page.locator('#cover-left')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#cover-right')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#shake-box')).toHaveClass(/is-shaking/);
  for (const panel of await page.locator('.cover-panel').all()) {
    expect(await panel.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  }
  await expect(shake).toBeEnabled({ timeout: 5000 });
  await expect(page.locator('#cover-left')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#cover-right')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#right-number')).toHaveText('?');
  await expect(page.locator('#announcement')).toContainText('Wie viele sind rechts?');
});

test('all pages fit a narrow phone, and direct game links select the right game', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const url of ['/', '/bandit.html?fach=deutsch', '/bandit.html?fach=mathe', '/schuettelbox.html?n=20']) {
    await page.goto(url);
    await expect(page.getByRole('navigation', { name: 'Spiele' }).getByRole('link')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (url.includes('fach=mathe')) await expect(page.locator('#math-reveal')).toBeVisible();
    if (url.includes('schuettelbox')) await expect(page.locator('#quantity')).toHaveValue('20');
  }
});
