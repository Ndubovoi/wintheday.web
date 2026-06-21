import confetti from 'canvas-confetti';

const COLORS = ['#00ffaa', '#64ffda', '#66ccff', '#ff6e40', '#ffd24a', '#ffffff'];

/** Big celebratory burst — fired only when the user wins the day. */
export function celebrate() {
  // A large central pop…
  confetti({
    particleCount: 240,
    spread: 110,
    startVelocity: 52,
    scalar: 1.2,
    ticks: 140,
    origin: { x: 0.5, y: 0.5 },
    colors: COLORS,
    zIndex: 9999,
  });

  // …plus streaming side cannons for ~1.2s.
  const end = Date.now() + 1200;
  (function frame() {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 65,
      startVelocity: 55,
      scalar: 1.1,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
      zIndex: 9999,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 65,
      startVelocity: 55,
      scalar: 1.1,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
