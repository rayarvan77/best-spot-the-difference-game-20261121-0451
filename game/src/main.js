// Harbour Lights — spot the difference.
//
// A complete game in one canvas: three hand-drawn scenes, each painted twice
// side by side with seven differences between the pictures. Click a
// difference (on either picture) to ring it; find all seven to finish the
// level. Keyboard: H for a hint, R to restart the level, M to mute, 1-3 to
// jump to a level, Enter to start or continue, Esc for the title screen.
//
// The game reads ?shot=start|play|end to stage a screenshot scene; without
// it, it opens on the title screen. Everything runs offline from static
// files — no network request, no storage, no libraries.

import { LEVELS, PANEL, DIFFERENCES_PER_LEVEL } from './levels.js';
import { paintPanel } from './scene.js';
import { shotSetup } from './shots.js';
import { isMuted, toggleMute, playClick, playFound, playWrong, playHint, playWin } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// whatever the window is, so clicks and art never depend on screen size.
const FIELD = { width: 1280, height: 720 };
const PANELS = [
  { x: 20, y: 90 },
  { x: 660, y: 90 },
];
const HUD_HEIGHT = 78;
const FOOTER_Y = 664;

canvas.width = FIELD.width;
canvas.height = FIELD.height;

const COLOURS = {
  ink: '#f5efdd',
  dim: '#cfc4a8',
  gold: '#ffd76a',
  red: '#e85a5a',
  green: '#7ec87e',
  panel: 'rgba(20, 16, 32, 0.55)',
  card: 'rgba(24, 20, 40, 0.92)',
  button: '#3a2b4d',
  buttonEdge: '#6b5a8a',
};

// ------------------------------------------------------------ state

const state = {
  screen: 'title', // 'title' | 'play' | 'win' | 'done'
  levelIndex: 0,
  found: new Set(),
  misses: 0,
  hintsUsed: 0,
  score: 0,
  totalScore: 0,
  totalSeconds: 0,
  elapsedSeconds: 0,
  levelStartedAt: 0,
  message: 'Find 7 differences between the two pictures.',
  hint: null, // { index, until }
  wrong: null, // { panel, x, y, until }
  lastFoundAt: 0,
  shot: false, // a staged screenshot scene: the clock stays put
};

/** The level currently being played. */
function level() {
  return LEVELS[state.levelIndex];
}

/** Seconds on the clock right now (frozen for a staged shot). */
function clockSeconds() {
  if (state.shot) return state.elapsedSeconds;
  if (state.screen !== 'play') return state.elapsedSeconds;
  return state.elapsedSeconds + (performance.now() - state.levelStartedAt) / 1000;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function remaining() {
  return DIFFERENCES_PER_LEVEL - state.found.size;
}

/** Stars for a finished level: fast, accurate and hint-free earns three. */
function starsFor(seconds, misses, hints) {
  if (seconds <= 120 && misses === 0 && hints === 0) return 3;
  if (seconds <= 240 && misses <= 3 && hints <= 1) return 2;
  return 1;
}

// ------------------------------------------------------------ panel cache

let panelCache = null; // [offscreen canvas, offscreen canvas] for the level

/** Paint both pictures once into offscreen canvases; the frame loop copies them. */
function renderPanels() {
  panelCache = [0, 1].map((side) => {
    const off = document.createElement('canvas');
    off.width = PANEL.width;
    off.height = PANEL.height;
    paintPanel(off.getContext('2d'), level().scene, side === 1);
    return off;
  });
}

// ------------------------------------------------------------ drawing helpers

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(str, x, y, size, colour, align = 'left', weight = '600') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** A button in the HUD; returns its box so clicks can find it. */
function button(label, x, y, w, h, active) {
  ctx.fillStyle = active ? '#5a4a7a' : COLOURS.button;
  roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = COLOURS.buttonEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(label, x + w / 2, y + h / 2 + 1, 16, COLOURS.ink, 'center');
  return { x, y, w, h };
}

const buttons = {}; // filled each frame: { hint, sound, restart, next, again, menu, start }

/** The gold ring (and tick) marking a found difference, on both pictures. */
function drawMarker(panel, diff, pulse) {
  const px = panel.x + diff.x;
  const py = panel.y + diff.y;
  const radius = diff.r + (pulse ? Math.sin(performance.now() / 180) * 3 : 0);
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 215, 106, 0.45)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(px, py, radius + 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px - 9, py);
  ctx.lineTo(px - 2, py + 7);
  ctx.lineTo(px + 10, py - 7);
  ctx.stroke();
}

/** A red cross where a wrong click landed, fading out. */
function drawWrongMark() {
  const wrong = state.wrong;
  if (wrong === null || performance.now() > wrong.until) return;
  const panel = PANELS[wrong.panel];
  const px = panel.x + wrong.x;
  const py = panel.y + wrong.y;
  ctx.strokeStyle = COLOURS.red;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px - 10, py - 10);
  ctx.lineTo(px + 10, py + 10);
  ctx.moveTo(px + 10, py - 10);
  ctx.lineTo(px - 10, py + 10);
  ctx.stroke();
}

// ------------------------------------------------------------ drawing the screens

function drawHud() {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, 0, FIELD.width, HUD_HEIGHT);
  ctx.fillStyle = '#2c2350';
  ctx.fillRect(0, HUD_HEIGHT - 2, FIELD.width, 2);

  text('HARBOUR LIGHTS', 24, 26, 26, COLOURS.gold, 'left', '700');
  text(level().name, 24, 56, 15, COLOURS.dim);
  text(`Level ${state.levelIndex + 1} of ${LEVELS.length}`, 300, 56, 15, COLOURS.dim);

  const foundCount = state.found.size;
  text(`${foundCount} / ${DIFFERENCES_PER_LEVEL} found`, 640, 30, 24, COLOURS.ink, 'center', '700');
  const left = remaining();
  text(
    left === 0 ? 'All found!' : `${left} difference${left === 1 ? '' : 's'} remaining`,
    640, 58, 15, left === 0 ? COLOURS.green : COLOURS.gold, 'center',
  );

  text(`Time ${formatTime(clockSeconds())}`, 1000, 28, 18, COLOURS.ink, 'center');
  text(`Score ${state.score}`, 1000, 56, 15, COLOURS.dim, 'center');

  buttons.hint = button('Hint (H)', 1080, 16, 86, 34, false);
  buttons.sound = button(isMuted() ? 'Sound off' : 'Sound on', 1080, 54, 86, 18, false);
  buttons.restart = button('Restart (R)', 1178, 16, 86, 34, false);
  buttons.menu = button('Menu', 1178, 54, 86, 18, false);
}

function drawPanels() {
  if (panelCache === null) renderPanels();
  for (let side = 0; side < 2; side++) {
    const panel = PANELS[side];
    ctx.drawImage(panelCache[side], panel.x, panel.y);
    ctx.strokeStyle = 'rgba(245, 239, 221, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x, panel.y, PANEL.width, PANEL.height);
    ctx.fillStyle = 'rgba(20, 16, 32, 0.7)';
    roundRect(panel.x + 10, panel.y + 10, side === 0 ? 92 : 150, 26, 6);
    ctx.fill();
    text(side === 0 ? 'ORIGINAL' : 'FIND 7 CHANGES', panel.x + 22, panel.y + 24, 13, COLOURS.ink, 'left', '700');
  }
  for (const index of state.found) {
    const diff = level().differences[index];
    drawMarker(PANELS[0], diff, false);
    drawMarker(PANELS[1], diff, false);
  }
  if (state.hint !== null && performance.now() < state.hint.until) {
    const diff = level().differences[state.hint.index];
    drawMarker(PANELS[1], diff, true);
  }
  drawWrongMark();
}

function drawFooter() {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, FOOTER_Y, FIELD.width, FIELD.height - FOOTER_Y);
  text(state.message, 24, FOOTER_Y + 28, 16, COLOURS.ink);
  text('Click a difference · H hint · R restart · M sound · 1-3 levels', 1256, FOOTER_Y + 28, 14, COLOURS.dim, 'right');
}

function drawTitle() {
  drawPanels();
  ctx.fillStyle = 'rgba(16, 12, 28, 0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const cardX = 340;
  const cardY = 120;
  const cardW = 600;
  const cardH = 460;
  ctx.fillStyle = COLOURS.card;
  roundRect(cardX, cardY, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  text('HARBOUR LIGHTS', 640, cardY + 64, 44, COLOURS.gold, 'center', '700');
  text('a spot-the-difference game', 640, cardY + 108, 18, COLOURS.dim, 'center');
  text('Two pictures hang side by side. Seven small things', 640, cardY + 168, 18, COLOURS.ink, 'center');
  text('changed between them. Click every change — on', 640, cardY + 196, 18, COLOURS.ink, 'center');
  text('either picture — to ring it before the clock runs on.', 640, cardY + 224, 18, COLOURS.ink, 'center');
  text('A wrong click costs 10 points. A hint costs 25.', 640, cardY + 262, 16, COLOURS.dim, 'center');

  text('Choose a scene:', 640, cardY + 300, 16, COLOURS.gold, 'center', '700');
  LEVELS.forEach((entry, index) => {
    text(`${index + 1} · ${entry.name} — ${entry.tagline}`, 640, cardY + 330 + index * 26, 16, COLOURS.ink, 'center');
  });
  buttons.start = button('Start playing  (Enter)', 490, cardY + 398, 300, 44, true);
  drawFooter();
}

function drawWin() {
  drawHud();
  drawPanels();
  const seconds = state.elapsedSeconds;
  const stars = starsFor(seconds, state.misses, state.hintsUsed);
  ctx.fillStyle = 'rgba(16, 12, 28, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const cardX = 390;
  const cardY = 150;
  const cardW = 500;
  const cardH = 380;
  ctx.fillStyle = COLOURS.card;
  roundRect(cardX, cardY, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  text('LEVEL COMPLETE!', 640, cardY + 56, 36, COLOURS.gold, 'center', '700');
  text(`${level().name} — all 7 differences found`, 640, cardY + 100, 17, COLOURS.ink, 'center');
  const starRow = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  text(starRow, 640, cardY + 150, 34, COLOURS.gold, 'center');
  text(`Time  ${formatTime(seconds)}`, 640, cardY + 200, 19, COLOURS.ink, 'center');
  text(`Wrong clicks  ${state.misses}   ·   Hints used  ${state.hintsUsed}`, 640, cardY + 232, 17, COLOURS.dim, 'center');
  text(`Level score  ${state.score}`, 640, cardY + 264, 19, COLOURS.gold, 'center', '700');
  const last = state.levelIndex === LEVELS.length - 1;
  buttons.next = button(last ? 'See your results  (Enter)' : 'Next level  (Enter)', 490, cardY + 300, 300, 44, true);
  buttons.again = button('Play again  (R)', 490, cardY + 354, 140, 36, false);
  buttons.menu = button('Menu  (Esc)', 650, cardY + 354, 140, 36, false);
  drawFooter();
}

function drawDone() {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  drawPanels();
  ctx.fillStyle = 'rgba(16, 12, 28, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const cardX = 390;
  const cardY = 150;
  const cardW = 500;
  const cardH = 360;
  ctx.fillStyle = COLOURS.card;
  roundRect(cardX, cardY, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  text('ALL SCENES SOLVED!', 640, cardY + 60, 34, COLOURS.gold, 'center', '700');
  text('You found every difference in all three pictures.', 640, cardY + 106, 17, COLOURS.ink, 'center');
  text(`Total time  ${formatTime(state.totalSeconds)}`, 640, cardY + 162, 19, COLOURS.ink, 'center');
  text(`Total score  ${state.totalScore}`, 640, cardY + 196, 20, COLOURS.gold, 'center', '700');
  text('Thank you for playing Harbour Lights.', 640, cardY + 240, 16, COLOURS.dim, 'center');
  buttons.again = button('Play again  (R)', 490, cardY + 284, 300, 44, true);
  drawFooter();
}

function draw() {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  if (state.screen === 'title') drawTitle();
  else if (state.screen === 'play') {
    drawHud();
    drawPanels();
    drawFooter();
  } else if (state.screen === 'win') drawWin();
  else drawDone();
  requestAnimationFrame(draw);
}

// ------------------------------------------------------------ playing

function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.misses = 0;
  state.hintsUsed = 0;
  state.score = 0;
  state.elapsedSeconds = 0;
  state.levelStartedAt = performance.now();
  state.hint = null;
  state.wrong = null;
  state.message = `Find 7 differences in ${LEVELS[index].name}.`;
  state.screen = 'play';
  panelCache = null;
  renderPanels();
  announce();
}

function restartLevel() {
  playClick();
  startLevel(state.levelIndex);
}

function finishLevel() {
  state.elapsedSeconds = clockSeconds();
  state.totalSeconds += state.elapsedSeconds;
  state.totalScore += state.score;
  state.screen = 'win';
  state.message = `${level().name} complete — all 7 differences found!`;
  playWin();
  announce();
}

function nextLevel() {
  if (state.levelIndex + 1 >= LEVELS.length) {
    state.screen = 'done';
    state.message = 'All three scenes solved. Thank you for playing!';
    announce();
    return;
  }
  startLevel(state.levelIndex + 1);
}

function giveHint() {
  if (state.screen !== 'play') return;
  const unfound = level().differences.map((diff, index) => index).filter((index) => !state.found.has(index));
  if (unfound.length === 0) return;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  state.hint = { index: pick, until: performance.now() + 4000 };
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - 25);
  state.message = 'Hint: look inside the golden ring on the right picture (−25 points).';
  playHint();
  announce();
}

/** A click on a panel: a difference found, or a miss. */
function clickPanel(panelIndex, x, y) {
  if (state.screen !== 'play') return;
  const diffs = level().differences;
  for (let index = 0; index < diffs.length; index++) {
    if (state.found.has(index)) continue;
    const diff = diffs[index];
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(index);
      state.score += 100;
      state.lastFoundAt = performance.now();
      state.message = `Found it — ${diff.label}! ${remaining()} remaining.`;
      playFound();
      announce();
      if (state.found.size === DIFFERENCES_PER_LEVEL) finishLevel();
      return;
    }
  }
  state.misses += 1;
  state.score = Math.max(0, state.score - 10);
  state.wrong = { panel: panelIndex, x, y, until: performance.now() + 700 };
  state.message = 'Not a difference — look closer (−10 points).';
  playWrong();
  announce();
}

function announce() {
  statusLine.textContent = `${level().name}: ${state.found.size} of ${DIFFERENCES_PER_LEVEL} differences found, ${remaining()} remaining. ${state.message}`;
}

// ------------------------------------------------------------ input

function inside(box, x, y) {
  return box !== undefined && x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function logicalPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
    y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
  };
}

canvas.addEventListener('click', (event) => {
  const { x, y } = logicalPoint(event);
  if (state.screen === 'title') {
    if (inside(buttons.start, x, y)) {
      playClick();
      startLevel(0);
      return;
    }
    for (let index = 0; index < LEVELS.length; index++) {
      // Clicking a scene line on the title card jumps straight to it.
      const lineY = 120 + 330 + index * 26;
      if (y > lineY - 13 && y < lineY + 13 && x > 340 && x < 940) {
        playClick();
        startLevel(index);
        return;
      }
    }
    return;
  }
  if (state.screen === 'win') {
    if (inside(buttons.next, x, y)) {
      playClick();
      nextLevel();
      return;
    }
    if (inside(buttons.again, x, y)) {
      restartLevel();
      return;
    }
    if (inside(buttons.menu, x, y)) {
      playClick();
      state.screen = 'title';
      return;
    }
    return;
  }
  if (state.screen === 'done') {
    if (inside(buttons.again, x, y)) {
      playClick();
      state.totalScore = 0;
      state.totalSeconds = 0;
      startLevel(0);
    }
    return;
  }
  // Playing: HUD buttons first, then the two pictures.
  if (inside(buttons.hint, x, y)) {
    giveHint();
    return;
  }
  if (inside(buttons.sound, x, y)) {
    toggleMute();
    playClick();
    return;
  }
  if (inside(buttons.restart, x, y)) {
    restartLevel();
    return;
  }
  if (inside(buttons.menu, x, y)) {
    playClick();
    state.screen = 'title';
    return;
  }
  for (let side = 0; side < 2; side++) {
    const panel = PANELS[side];
    if (x >= panel.x && x <= panel.x + PANEL.width && y >= panel.y && y <= panel.y + PANEL.height) {
      clickPanel(side, x - panel.x, y - panel.y);
      return;
    }
  }
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'enter' || key === ' ') {
    if (state.screen === 'title') {
      playClick();
      startLevel(0);
    } else if (state.screen === 'win') {
      playClick();
      nextLevel();
    }
    event.preventDefault();
    return;
  }
  if (key === 'h') {
    giveHint();
    return;
  }
  if (key === 'r') {
    if (state.screen === 'play' || state.screen === 'win' || state.screen === 'done') restartLevel();
    return;
  }
  if (key === 'm') {
    toggleMute();
    return;
  }
  if (key === 'escape') {
    state.screen = 'title';
    return;
  }
  if (key === '1' || key === '2' || key === '3') {
    const index = Number(key) - 1;
    if (index < LEVELS.length) {
      playClick();
      startLevel(index);
    }
  }
});

// ------------------------------------------------------------ start up

function init() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot !== null) {
    const setup = shotSetup(shot);
    state.shot = true;
    state.levelIndex = setup.levelIndex;
    state.found = new Set(setup.found);
    state.elapsedSeconds = setup.elapsedSeconds;
    state.score = setup.found.length * 100;
    state.screen = setup.screen;
    if (setup.screen === 'win') {
      state.message = `${level().name} complete — all 7 differences found!`;
    } else {
      state.message = `Found ${setup.found.length} of 7 — ${remaining()} remaining.`;
    }
    renderPanels();
  } else {
    renderPanels();
  }
  announce();
  requestAnimationFrame(draw);
}

init();
