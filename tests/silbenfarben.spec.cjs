const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test('alternating colors update after each letter without a trailing delimiter', async ({ page }) => {
  await page.goto('/silbenfarben.html');
  await page.evaluate(() => window.LernbanditSyllables.ready);
  const input = page.getByRole('textbox', { name: 'Dein Text', exact: true });
  await input.fill('To');
  await expect(page.locator('#colored-text .is-colored')).toHaveCount(0);
  await input.pressSequentially('ma');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['ma']);
  await input.pressSequentially('te');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['ma']);
  await expect(page.locator('#colored-text .is-colored').first()).toHaveCSS('color', 'rgb(194, 62, 50)');
  await input.fill('Tomate, Esel? Familie! Lernbandit');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['ma', 'sel', 'mi', 'ban']);
  await input.press('Enter');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['ma', 'sel', 'mi', 'ban']);
  await input.fill('Igel');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['gel']);
});

test('editing preserves cursor, native undo, pasted text and safe rendering', async ({ page }) => {
  await page.goto('/silbenfarben.html');
  const input = page.locator('#writing-input');
  await input.focus();
  await input.evaluate(el => {
    el.value = 'Tomate ';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.setSelectionRange(2, 2);
  });
  await page.keyboard.type('m');
  await expect(input).toHaveValue('Tommate ');
  expect(await input.evaluate(el => el.selectionStart)).toBe(3);
  await input.press('ControlOrMeta+z');
  await expect(input).toHaveValue('Tomate ');
  const text = 'Bu\u0308cher  und\nTomate!\n<img src=x onerror="window.injected=true">';
  await input.fill(text);
  expect(await page.locator('#colored-text').textContent()).toBe(text + '\u200b');
  await expect(page.locator('#colored-text img')).toHaveCount(0);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await expect(input).toHaveValue(text);
});

test('settings change the reading view without changing text, and cancel keeps previous settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/silbenfarben.html');
  await page.getByRole('button', { name: 'Beispieltext', exact: true }).click();
  const input = page.locator('#writing-input');
  const text = await input.inputValue();
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('radio', { name: 'Groß', exact: true }).check();
  await page.getByRole('radio', { name: 'Blau', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Silbenbögen anzeigen', exact: true }).check();
  await page.getByRole('button', { name: 'Übernehmen', exact: true }).click();
  await expect(input).toHaveValue(text);
  await expect(input).toHaveCSS('font-size', '40px');
  await expect(page.locator('#colored-text')).toHaveCSS('font-size', '40px');
  await expect(page.locator('#colored-text')).toHaveClass('editor-surface show-bows');
  await expect(page.locator('#colored-text .is-colored').first()).toHaveCSS('color', 'rgb(49, 91, 170)');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('radio', { name: 'Klein', exact: true }).check();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(input).toHaveCSS('font-size', '40px');
  await input.evaluate(el => { el.scrollTop = 130; el.dispatchEvent(new Event('scroll')); });
  const geometry = await page.evaluate(() => {
    const field = document.getElementById('writing-input');
    const mirror = document.getElementById('writing-highlight');
    return { fieldWidth: field.clientWidth, mirrorWidth: mirror.clientWidth, fieldScroll: field.scrollTop, mirrorScroll: mirror.scrollTop };
  });
  expect(geometry.fieldWidth).toBe(geometry.mirrorWidth);
  expect(geometry.fieldScroll).toBe(geometry.mirrorScroll);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('the tool opens as a local file with the network disabled', async ({ page, context }) => {
  await context.setOffline(true);
  const requests = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'silbenfarben.html')).href);
  await page.evaluate(() => window.LernbanditSyllables.ready);
  await page.getByRole('textbox', { name: 'Dein Text', exact: true }).fill('Lernbandit ');
  await expect(page.locator('#colored-text .is-colored')).toHaveText(['ban']);
  await expect(page.locator('#engine-warning')).toBeHidden();
  await expect(page.locator('.game-nav a[aria-current="page"]')).toHaveText('Silbenfarben');
  expect(requests).toEqual([]);
});
