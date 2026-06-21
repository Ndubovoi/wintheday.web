// The app's signature "lava fill" circle. A deep-orange fill rises from the
// bottom as tasks are completed, with an 80%-threshold marker and a tealAccent
// ring + glow. Mirrors lib/widgets/tasks/task_center_circle.dart.
import { useId } from 'react';

const WIN_THRESHOLD = 0.8;

export interface ProgressCircleProps {
  completed: number;
  total: number;
  openWinBreakers: number;
  size?: number;
  /** Hide the centered status text — use for small summary rings. */
  showText?: boolean;
}

export default function ProgressCircle({
  completed,
  total,
  openWinBreakers,
  size = 260,
  showText = true,
}: ProgressCircleProps) {
  const fill = total === 0 ? 0 : completed / total;
  const tasksLeftToWin = Math.max(0, Math.ceil(total * WIN_THRESHOLD) - completed);
  const won = total > 0 && openWinBreakers === 0 && fill >= WIN_THRESHOLD;
  const clipId = useId();

  // Fill rises from the bottom: translate a full-height fill group downward by
  // the empty fraction. y=0 (top) … y=200 (bottom) in the 200x200 viewBox.
  const emptyOffset = (1 - fill) * 200;

  const statusText =
    total === 0
      ? 'No tasks for this day'
      : tasksLeftToWin > 0
        ? `${tasksLeftToWin} left to win the day`
        : openWinBreakers === 0
          ? 'You completed all needed tasks to win the day!'
          : `${openWinBreakers} win-breaker task${openWinBreakers > 1 ? 's' : ''} to complete`;

  return (
    <div
      className={`relative rounded-full transition-shadow duration-500 ${
        won ? 'glow-teal-strong' : 'glow-teal'
      }`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="block">
        <defs>
          <radialGradient id={`${clipId}-bg`} cx="50%" cy="50%" r="85%">
            <stop offset="0%" stopColor="#1e1e1e" />
            <stop offset="100%" stopColor="#2d2d2d" />
          </radialGradient>
          <linearGradient id={`${clipId}-lava`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6e40" />
            <stop offset="100%" stopColor="#ff3d00" />
          </linearGradient>
          <clipPath id={`${clipId}-clip`}>
            <circle cx="100" cy="100" r="98" />
          </clipPath>
        </defs>

        {/* base */}
        <circle cx="100" cy="100" r="98" fill={`url(#${clipId}-bg)`} />

        {/* lava fill + wavy surface, clipped to the circle */}
        <g clipPath={`url(#${clipId}-clip)`}>
          <g
            style={{
              transform: `translateY(${emptyOffset}px)`,
              transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <path
              d="M-200,6 C-150,0 -150,12 -100,6 C-50,0 -50,12 0,6 C50,0 50,12 100,6 C150,0 150,12 200,6 C250,0 250,12 300,6 C350,0 350,12 400,6 L400,210 L-200,210 Z"
              fill={`url(#${clipId}-lava)`}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-200 0"
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>

        {/* ring */}
        <circle
          cx="100"
          cy="100"
          r="98"
          fill="none"
          stroke={won ? '#64ffda' : 'rgba(100,255,218,0.5)'}
          strokeWidth="3"
        />
      </svg>

      {showText && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {total > 0 && (
            <span className="mb-1 text-3xl font-bold text-white drop-shadow">
              {completed}/{total}
            </span>
          )}
          <span className="text-sm font-medium text-white drop-shadow">{statusText}</span>
        </div>
      )}
    </div>
  );
}
