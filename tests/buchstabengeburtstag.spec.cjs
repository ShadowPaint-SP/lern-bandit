const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const { storageKey } = require('../assets/buchstabengeburtstag-model.js');

const tile = (page, letter) => page.locator(`#letter-bank [data-letter="${letter}"]`);
const day = (page, date) => page.locator(`[data-date="${date}"] .day-target`);
const birthdays = (page, date) => page.locator(`[data-date="${date}"] .day-birthdays`);
async function schedule(page, letter, date) {
  await tile(page, letter).click();
  await day(page, date).click();
}
async function addNames(page, names) {
  for (const name of names.split('\n')) {
    await page.getByLabel('Name eintragen', { exact: true }).fill(name);
    await page.getByRole('button', { name: 'Name hinzufügen', exact: true }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-15T12:00:00+01:00'));
});

test('Enter adds one name, clears the single-line field and keeps it ready for the next name', async ({ page }) => {
  await page.goto('/buchstabengeburtstag.html');
  const input = page.getByRole('textbox', { name: 'Name eintragen', exact: true });
  expect(await input.evaluate(element => element.tagName)).toBe('INPUT');
  await input.fill('  Emma  ');
  await input.press('Enter');
  await expect(page.locator('.name-text')).toHaveText(['Emma']);
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await input.fill('Mia');
  await input.press('Enter');
  await expect(page.locator('.name-text')).toHaveText(['Emma', 'Mia']);
  await expect(input).toHaveValue('');
  await input.press('Enter');
  await input.fill('   ');
  await input.press('Enter');
  await expect(page.locator('.name-text')).toHaveText(['Emma', 'Mia']);
  await expect(page.locator('#names-error')).toBeHidden();
});

test('dropping outside the calendar removes the date and birthday, but an invalid drop inside keeps it', async ({ page }) => {
  await page.goto('/buchstabengeburtstag.html');
  await addNames(page, 'A');
  await schedule(page, 'A', '2026-11-01');
  const planned = page.locator('[data-date="2026-11-01"] [data-letter="A"]');
  await planned.dragTo(page.locator('#month-title'));
  await expect(planned).toHaveCount(1);
  await expect(tile(page, 'A')).toHaveAttribute('aria-pressed', 'false');
  await planned.dragTo(page.locator('#names-title'));
  await expect(planned).toHaveCount(0);
  await expect(birthdays(page, '2026-11-01').locator('li')).toHaveCount(0);
  await expect(page.locator('.name-status')).toHaveText('Noch offen: A');
  await expect(tile(page, 'A')).not.toHaveClass(/is-planned/);
  await schedule(page, 'A', '2026-11-02');
  await tile(page, 'A').dragTo(page.locator('#names-title'));
  await expect(page.locator('#planned-count')).toHaveText('0 von 30 geplant');
  await page.reload();
  await expect(page.locator('.day-letters button')).toHaveCount(0);
  await expect(page.locator('.name-status')).toHaveText('Noch offen: A');
});

test('names celebrate on their last introduction, and dragging, moving and removal recalculate dates', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/');
  await page.locator('.planner-home-link').click();
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveText('Buchstabengeburtstag');
  await expect(page.locator('#month-title')).toHaveText('November 2026');
  await addNames(page, 'Emma\nMia\nemma');
  await expect(page.locator('.name-row')).toHaveCount(2);
  await schedule(page, 'E', '2026-11-02');
  await schedule(page, 'M', '2026-11-04');
  await expect(page.locator('.name-date')).toHaveCount(0);
  await tile(page, 'A').dragTo(day(page, '2026-11-03'));
  await expect(birthdays(page, '2026-11-04')).toContainText('Emma');
  await expect(page.locator('.name-row').filter({ hasText: 'Mia' })).toContainText('Noch offen: I');
  await schedule(page, 'I', '2026-11-04');
  await expect(birthdays(page, '2026-11-04').locator('li')).toHaveText(['✦Emma', '✦Mia']);
  await page.screenshot({ path: testInfo.outputPath('planner-desktop.png'), fullPage: true });
  await page.locator('[data-date="2026-11-04"] [data-letter="M"]').dragTo(day(page, '2026-11-09'));
  await expect(birthdays(page, '2026-11-04').locator('li')).toHaveCount(0);
  await expect(birthdays(page, '2026-11-09').locator('li')).toHaveText(['✦Emma', '✦Mia']);
  await schedule(page, 'M', '2026-11-01');
  await expect(birthdays(page, '2026-11-03')).toContainText('Emma');
  await expect(birthdays(page, '2026-11-04')).toContainText('Mia');
  await tile(page, 'A').click();
  await page.getByRole('button', { name: 'Aus Planung nehmen', exact: true }).click();
  await expect(page.locator('.day-birthdays li')).toHaveCount(0);
  await expect(page.locator('.name-status')).toHaveText(['Noch offen: A', 'Noch offen: A']);
  await schedule(page, 'A', '2026-11-02');
  await page.reload();
  await expect(birthdays(page, '2026-11-02')).toContainText('Emma');
  await expect(birthdays(page, '2026-11-04')).toContainText('Mia');
  await page.getByRole('button', { name: 'Emma entfernen', exact: true }).click();
  await expect(page.locator('.name-row')).toHaveCount(1);
  await expect(birthdays(page, '2026-11-02').locator('li')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('settings delete only planner data, confirmation can be cancelled, and other open tabs update', async ({ page, context }) => {
  await page.goto('/buchstabengeburtstag.html');
  await addNames(page, 'Anna');
  await schedule(page, 'A', '2026-11-03');
  await page.evaluate(() => localStorage.setItem('other-tool', 'keep'));
  const second = await context.newPage();
  await second.goto('/buchstabengeburtstag.html');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('button', { name: 'Daten löschen', exact: true }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).names, storageKey)).toEqual(['Anna']);
  await page.getByRole('button', { name: 'Daten löschen', exact: true }).click();
  await page.getByRole('button', { name: 'Alles endgültig löschen', exact: true }).click();
  await expect(page.locator('#delete-status')).toContainText('wurden gelöscht');
  await expect(second.locator('.name-row')).toHaveCount(0);
  await expect(second.locator('#planned-count')).toHaveText('0 von 30 geplant');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('other-tool'))).toBe('keep');
  await page.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click();
  await page.reload();
  await expect(page.locator('#empty-names')).toBeVisible();
  await expect(page.locator('.day-letters button')).toHaveCount(0);
});

test('keyboard and touch-friendly selection works on a narrow screen across month and year boundaries', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/buchstabengeburtstag.html');
  await addNames(page, 'Änne');
  await tile(page, 'Ä').focus();
  await page.keyboard.press('Space');
  await day(page, '2026-11-02').focus();
  await page.keyboard.press('Enter');
  await expect(day(page, '2026-11-02')).toBeFocused();
  await schedule(page, 'N', '2026-11-02');
  await tile(page, 'E').click();
  await page.getByRole('button', { name: 'Nächster Monat', exact: true }).click();
  await expect(page.locator('#month-title')).toHaveText('Dezember 2026');
  await page.getByRole('button', { name: 'Nächster Monat', exact: true }).click();
  await day(page, '2027-01-04').click();
  await expect(birthdays(page, '2027-01-04')).toContainText('Änne');
  await page.getByRole('button', { name: 'Heute', exact: true }).click();
  await expect(page.locator('#month-title')).toHaveText('November 2026');
  await page.locator('.name-date').click();
  await expect(day(page, '2027-01-04')).toBeFocused();
  await expect(page.locator('#month-title')).toHaveText('Januar 2027');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('planner-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('invalid names and damaged storage give useful errors, and names render as text', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '{broken'), storageKey);
  await page.goto('/buchstabengeburtstag.html');
  await expect(page.locator('#storage-warning')).toBeVisible();
  await addNames(page, '123');
  await expect(page.locator('#names-error')).toBeVisible();
  await expect(page.locator('.name-row')).toHaveCount(0);
  await addNames(page, '<img src=x onerror="window.injected=true">');
  await expect(page.locator('.name-text')).toHaveText('<img src=x onerror="window.injected=true">');
  await expect(page.locator('#names-list img')).toHaveCount(0);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await expect(page.locator('#storage-warning')).toBeHidden();
});

test('storage failure stays visible while planning remains usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError'); };
  });
  await page.goto('/buchstabengeburtstag.html');
  await addNames(page, 'A');
  await schedule(page, 'A', '2026-11-03');
  await expect(page.locator('#storage-warning')).toContainText('nur für diesen Seitenaufruf');
  await expect(birthdays(page, '2026-11-03')).toContainText('A');
});

test('the planner works offline as a local file and persists after reopening', async ({ page, context }) => {
  await context.setOffline(true);
  const requests = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'buchstabengeburtstag.html')).href);
  await addNames(page, 'Ada');
  await schedule(page, 'A', '2026-11-05');
  await schedule(page, 'D', '2026-11-04');
  await page.reload();
  await expect(birthdays(page, '2026-11-05')).toContainText('Ada');
  await expect(page.locator('#storage-warning')).toBeHidden();
  expect(requests).toEqual([]);
});
