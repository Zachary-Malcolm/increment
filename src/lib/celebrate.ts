import confetti from 'canvas-confetti';

const COLOURS = ['#39d353', '#26a641', '#58a6ff', '#bc8cff', '#f0883e', '#e3b341'];

/** A burst of confetti (skipped automatically for people who prefer reduced motion). */
export function celebrate(big = false) {
  const base = { colors: COLOURS, disableForReducedMotion: true, zIndex: 100 };
  confetti({ ...base, particleCount: big ? 140 : 70, spread: big ? 100 : 70, origin: { y: 0.6 }, startVelocity: 40 });
  if (big) {
    setTimeout(() => confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 350);
  }
}
