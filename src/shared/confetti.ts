import confetti from 'canvas-confetti';

/** Short celebratory burst when a day flips to "won". */
export function celebrate() {
  const opts = { spread: 70, startVelocity: 38, ticks: 90, scalar: 0.9 } as const;
  confetti({ ...opts, particleCount: 60, origin: { x: 0.5, y: 0.45 } });
  confetti({ ...opts, particleCount: 30, angle: 60, origin: { x: 0, y: 0.6 } });
  confetti({ ...opts, particleCount: 30, angle: 120, origin: { x: 1, y: 0.6 } });
}
