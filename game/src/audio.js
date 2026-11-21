// Harbour Lights — tiny sounds, made with the Web Audio API.
//
// No sound files: every effect is a few oscillator notes, so the game stays
// a handful of static files and plays with the network off. The context is
// created lazily on the first user gesture, which is what browsers require.

let context = null;
let muted = false;

/** True when the player has silenced the game. */
export function isMuted() {
  return muted;
}

/** Flip the mute state; returns the new state. */
export function toggleMute() {
  muted = !muted;
  return muted;
}

function audio() {
  if (context === null) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (AudioContext === undefined) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** One short note: frequency in Hz, starting now, lasting `seconds`. */
function note(frequency, seconds, type, volume, delay = 0) {
  if (muted) return;
  const ctx = audio();
  if (ctx === null) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

/** A soft click for buttons and panels. */
export function playClick() {
  note(660, 0.07, 'triangle', 0.12);
}

/** A bright two-note chime when a difference is found. */
export function playFound() {
  note(784, 0.14, 'sine', 0.22);
  note(1175, 0.22, 'sine', 0.2, 0.09);
}

/** A low buzz for a wrong click. */
export function playWrong() {
  note(180, 0.18, 'sawtooth', 0.1);
  note(140, 0.22, 'sawtooth', 0.08, 0.08);
}

/** A rising hint shimmer. */
export function playHint() {
  note(523, 0.12, 'sine', 0.14);
  note(659, 0.12, 'sine', 0.14, 0.07);
  note(784, 0.18, 'sine', 0.14, 0.14);
}

/** A little fanfare when a level is finished. */
export function playWin() {
  const tune = [523, 659, 784, 1047, 784, 1047];
  tune.forEach((frequency, index) => note(frequency, 0.22, 'triangle', 0.2, index * 0.11));
}
