(()=>{
const WIDTH = 800;
const HEIGHT = 300;
const RADIUS = 19;

                                       

function clampQuantity(value        )         {
  return Number.isFinite(value) ? Math.max(2, Math.min(20, Math.round(value))) : 10;
}

/** Five-dot rows make the settled quantities easy to count, even on a phone. */
function positions(count        , side                  )         {
  const center = side === 'left' ? WIDTH / 4 : WIDTH * 3 / 4;
  const columns = Math.min(5, count);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / 5);
    const inRow = Math.min(5, count - row * 5);
    return {
      x: center + (index % columns - (inRow - 1) / 2) * 49,
      y: HEIGHT - 78 - row * 48,
    };
  });
}

function createBalls(quantity        , left        )         {
  const count = clampQuantity(quantity);
  const split = Math.max(0, Math.min(count, Math.round(left)));
  return [...positions(split, 'left'), ...positions(count - split, 'right')];
}

function countLeft(balls        )         {
  return balls.filter(ball => ball.x < WIDTH / 2).length;
}


function element                       (id        )    {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Element fehlt: ${id}`);
  return found     ;
}

const canvas = element                   ('balls');
const context = canvas.getContext('2d');
if (!context) throw new Error('Die Schüttelbox benötigt Canvas-Unterstützung.');
const ctx = context;
const quantityInput = element                  ('quantity');
const shakeButton = element                   ('shake');
const shakeLabel = element('shake-label');
const box = element('shake-box');
const leftNumber = element('left-number');
const rightNumber = element('right-number');
const equation = element('equation');
const hideEquation = element('hide-equation');
const revealEquation = element('reveal-equation');
const announcement = element('announcement');
const help = element                   ('help');
const covers = [element                   ('cover-left'), element                   ('cover-right')]         ;
const discoverButton = element                   ('discover');
const practiceButton = element                   ('practice');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const presets = [...document.querySelectorAll                   ('[data-quantity]')];
const controls = [quantityInput, element                   ('decrease'), element                   ('increase'), discoverButton, practiceButton, hideEquation, ...presets];
let quantity = clampQuantity(Number(new URLSearchParams(location.search).get('n') ?? 10));
let balls         = createBalls(quantity, Math.floor(quantity * .4));
let covered                     = [false, false];
let practice = false;
let equationCovered = false;
let busy = false;
let shakeAnimation                   = null;
let shakeRun = 0;
let canvasWidth = 800;
let canvasHeight = 300;

function draw()       {
  const sx = canvasWidth / WIDTH, sy = canvasHeight / HEIGHT;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(sx, sy);
  const ry = RADIUS * sx / sy;
  for (const ball of balls) {
    const isLeft = ball.x < WIDTH / 2;
    const color = isLeft ? '#247c79' : '#df4537';
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + 4 * sx / sy, RADIUS + .4, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = isLeft ? '#174f4d' : '#a8362d';
    ctx.fill();
    const fill = ctx.createRadialGradient(ball.x - 6, ball.y - ry * .38, 1, ball.x, ball.y, RADIUS * 1.35);
    fill.addColorStop(0, isLeft ? '#449e95' : '#ef7563');
    fill.addColorStop(.65, color);
    fill.addColorStop(1, isLeft ? '#206a67' : '#c13e32');
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y, RADIUS, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ball.x - 5, ball.y - ry * .33, 4.5, ry * .18, -.25, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff38';
    ctx.fill();
  }
  ctx.restore();
}

function resizeCanvas()       {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvasWidth = Math.max(1, Math.round(rect.width * dpr));
  canvasHeight = Math.max(1, Math.round(rect.height * dpr));
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  draw();
}

function describeResult()         {
  if (equationCovered) return `Die Plusaufgabe ist verdeckt. Zähle die Kugeln in den offenen Fächern. Insgesamt sind es ${quantity} Kugeln.`;
  const left = countLeft(balls), right = quantity - left;
  if (covered[0] && covered[1]) return `Beide Fächer sind verdeckt. Insgesamt sind es ${quantity} Kugeln.`;
  if (covered[0]) return `Rechts sind ${right} Kugeln. Wie viele sind links? Zusammen sind es ${quantity}.`;
  if (covered[1]) return `Links sind ${left} Kugeln. Wie viele sind rechts? Zusammen sind es ${quantity}.`;
  return `${left} plus ${right} ist gleich ${quantity}.`;
}

function renderResult(speak = true)       {
  equation.classList.toggle('is-covered', equationCovered);
  equation.setAttribute('aria-hidden', String(equationCovered));
  revealEquation.hidden = !equationCovered;
  revealEquation.disabled = busy;
  revealEquation.setAttribute('aria-expanded', String(!equationCovered));
  const left = countLeft(balls);
  leftNumber.textContent = busy || covered[0] ? '?' : String(left);
  rightNumber.textContent = busy || covered[1] ? '?' : String(quantity - left);
  leftNumber.classList.toggle('is-hidden', busy || covered[0]);
  rightNumber.classList.toggle('is-hidden', busy || covered[1]);
  element('total-number').textContent = String(quantity);
  covers.forEach((cover, index) => {
    const side = index === 0 ? 'Linkes' : 'Rechtes';
    const isCovered = busy || covered[index];
    cover.setAttribute('aria-expanded', String(!isCovered));
    cover.setAttribute('aria-label', `${side} Fach ${isCovered ? 'aufdecken' : 'verdecken'}`);
    cover.querySelector('.cover-label') .textContent = isCovered ? 'Aufdecken' : 'Verdecken';
  });
  element('box-instruction').textContent = practice ? 'Wie viele Kugeln sind versteckt?' : 'Wie teilen sich die Kugeln auf?';
  if (speak && !busy) announcement.textContent = describeResult();
}

function updateControls()       {
  quantityInput.value = String(quantity);
  presets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.quantity) === quantity)));
  element                   ('decrease').disabled = busy || quantity <= 2;
  element                   ('increase').disabled = busy || quantity >= 20;
  discoverButton.setAttribute('aria-pressed', String(!practice));
  practiceButton.setAttribute('aria-pressed', String(practice));
}

function setQuantity(value        )       {
  if (busy) return;
  quantity = clampQuantity(value);
  balls = createBalls(quantity, Math.floor(quantity * .4));
  covered = practice ? [false, true] : [false, false];
  equationCovered = hideEquation.checked;
  updateControls();
  renderResult();
  draw();
}

function setMode(next         )       {
  if (busy) return;
  practice = next;
  covered = practice ? [false, true] : [false, false];
  equationCovered = hideEquation.checked;
  updateControls();
  renderResult();
}

function setBusy(next         )       {
  busy = next;
  if (!next) box.classList.remove('is-shaking');
  shakeButton.disabled = next;
  shakeLabel.textContent = next ? 'Schüttelt …' : 'Schütteln!';
  controls.forEach(control => { control.disabled = next; });
  covers.forEach(cover => { cover.disabled = next; });
  equation.setAttribute('aria-busy', String(next));
  updateControls();
}

function finishShake()       {
  if (!busy) return;
  shakeRun++;
  const animation = shakeAnimation;
  shakeAnimation = null;
  animation?.cancel();
  balls = createBalls(quantity, Math.floor(Math.random() * (quantity + 1)));
  draw();
  setBusy(false);
  renderResult();
}

async function shake()                {
  if (busy || help.open) return;
  const run = ++shakeRun;
  if (practice) covered = [false, true];
  equationCovered = hideEquation.checked;
  setBusy(true);
  renderResult(false);
  if (reduceMotion.matches) {
    finishShake();
    return;
  }
  announcement.textContent = 'Die Box wird geschüttelt. Beide Fächer sind verdeckt.';
  // Wait for both shutters, including one that was already moving when clicked.
  const closing = covers.flatMap(cover => cover.getAnimations({ subtree: true }));
  await Promise.all(closing.map(animation => animation.finished.catch(() => undefined)));
  if (!busy || run !== shakeRun) return;
  box.classList.add('is-shaking');
  const animation = box.animate([
    { offset: 0, transform: 'translate(0, 0) rotate(0)' },
    { offset: .08, transform: 'translate(0, 0) rotate(0)' },
    { offset: .17, transform: 'translate(-.8%, -4px) rotate(-1.5deg)' },
    { offset: .29, transform: 'translate(1.5%, -11px) rotate(2.8deg)' },
    { offset: .41, transform: 'translate(-1.5%, -12px) rotate(-2.8deg)' },
    { offset: .53, transform: 'translate(1.2%, -10px) rotate(2.3deg)' },
    { offset: .65, transform: 'translate(-.9%, -7px) rotate(-1.8deg)' },
    { offset: .77, transform: 'translate(.5%, -4px) rotate(1deg)' },
    { offset: .88, transform: 'translate(0, 1px) rotate(0) scale(1.005, .985)' },
    { offset: .95, transform: 'translate(0, -1px) rotate(0) scale(.998, 1.005)' },
    { offset: 1, transform: 'translate(0, 0) rotate(0) scale(1)' },
  ], { duration: 1060, easing: 'ease-in-out' });
  shakeAnimation = animation;
  void animation.finished.then(() => {
    if (shakeAnimation === animation) finishShake();
  }, () => { /* Cancellation is handled by finishShake. */ });
}

quantityInput.addEventListener('change', () => setQuantity(quantityInput.valueAsNumber));
quantityInput.addEventListener('keydown', event => { if (event.key === 'Enter') { setQuantity(quantityInput.valueAsNumber); quantityInput.blur(); } });
element('decrease').addEventListener('click', () => setQuantity(quantity - 1));
element('increase').addEventListener('click', () => setQuantity(quantity + 1));
presets.forEach(button => button.addEventListener('click', () => setQuantity(Number(button.dataset.quantity))));
discoverButton.addEventListener('click', () => setMode(false));
practiceButton.addEventListener('click', () => setMode(true));
hideEquation.addEventListener('change', () => {
  equationCovered = hideEquation.checked;
  renderResult();
});
revealEquation.addEventListener('click', () => {
  if (busy) return;
  equationCovered = false;
  renderResult();
  shakeButton.focus();
});
covers.forEach((cover, index) => cover.addEventListener('click', () => {
  if (busy) return;
  covered[index] = !covered[index];
  renderResult();
}));
shakeButton.addEventListener('click', shake);

document.addEventListener('keydown', event => {
  const target = event.target;
  if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || event.repeat || help.open) return;
  if (target instanceof HTMLElement && (target.closest('button, input, select, textarea, a') || target.isContentEditable)) return;
  event.preventDefault();
  shake();
});

element('help-open').addEventListener('click', () => help.showModal());
for (const id of ['help-close', 'help-done']) element(id).addEventListener('click', () => help.close());
help.addEventListener('click', event => {
  if (event.target !== help) return;
  const rect = help.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) help.close();
});
reduceMotion.addEventListener('change', () => { if (busy && reduceMotion.matches) finishShake(); });
// Finish cleanly when leaving the tab, rather than resuming an old shake later.
document.addEventListener('visibilitychange', () => { if (document.hidden && busy) finishShake(); });

new ResizeObserver(resizeCanvas).observe(canvas);
updateControls();
renderResult(false);
resizeCanvas();

})();
