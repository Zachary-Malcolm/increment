// Sound effects synthesised with the Web Audio API: no audio files, nothing to license.
// Soft sine and triangle tones, short and bright, so rewards feel good without being loud.

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled || typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.14) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// Note frequencies (Hz)
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5, G4 = 392, D5 = 587.33;

export const sounds = {
  /** A correct answer: two quick rising notes. */
  correct() {
    tone(E5, 0, 0.12, 'triangle');
    tone(A5, 0.08, 0.22, 'triangle');
  },
  /** A wrong answer: a soft low double blip, never harsh. */
  wrong() {
    tone(G4, 0, 0.12, 'sine', 0.1);
    tone(G4 * 0.94, 0.12, 0.18, 'sine', 0.1);
  },
  /** Lesson or puzzle complete: a rising arpeggio with a sparkle on top. */
  complete() {
    [C5, E5, G5, C6].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.13));
    tone(E6, 0.42, 0.5, 'sine', 0.08);
  },
  /** Level up: a fuller fanfare. */
  levelUp() {
    [G4, C5, E5, G5].forEach((f, i) => tone(f, i * 0.07, 0.25, 'triangle', 0.12));
    [C6, E6].forEach((f) => tone(f, 0.32, 0.7, 'sine', 0.08));
    tone(G5, 0.32, 0.7, 'triangle', 0.1);
  },
  /** Streak extended. */
  streak() {
    tone(D5, 0, 0.1, 'triangle', 0.1);
    tone(G5, 0.07, 0.1, 'triangle', 0.1);
    tone(C6, 0.14, 0.35, 'sine', 0.1);
  },
  /** A small tick for selecting an option. */
  tick() {
    tone(C6, 0, 0.04, 'sine', 0.05);
  },
};
