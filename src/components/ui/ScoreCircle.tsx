import { useEffect, useRef, useState } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

interface ScoreCircleProps {
  score: number; // 0-100
  size?: number; // px, default 180
  strokeWidth?: number; // default 12
  animated?: boolean; // default true
  style?: React.CSSProperties;
}

function getScoreColor(score: number): string {
  if (score < 50) return '#DB3B3B'; // red
  if (score < 75) return '#E8860A'; // orange
  return '#1FA65C'; // green
}

function getScoreColorVar(score: number): string {
  if (score < 50) return 'var(--accent-error, #DB3B3B)';
  if (score < 75) return 'var(--accent-secondary, #E8860A)';
  return 'var(--accent-success, #1FA65C)';
}

/**
 * ScoreCircle — Animated SVG circular progress indicator
 * - Draws a circular progress arc using stroke-dasharray
 * - Animates from 0 to the score value
 * - Shows score number with counting animation in the center
 * - Color transitions: red < 50% → orange < 75% → green
 */
export function ScoreCircle({
  score,
  size = 180,
  strokeWidth = 12,
  animated = true,
  style,
}: ScoreCircleProps) {
  const [progress, setProgress] = useState(animated ? 0 : score);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const color = getScoreColor(score);
  const colorVar = getScoreColorVar(score);

  // Animate the circle arc
  useEffect(() => {
    if (!animated) {
      setProgress(score);
      return;
    }

    const startTime = performance.now();
    const startProgress = 0;
    const duration = 1000; // slightly longer than number for dramatic effect

    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCircle(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(rawProgress);
      const currentProgress = startProgress + (score - startProgress) * easedProgress;

      setProgress(currentProgress);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animateCircle);
      } else {
        setProgress(score);
      }
    }

    rafRef.current = requestAnimationFrame(animateCircle);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score, animated]);

  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <div
      className="score-circle-wrapper"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Background track */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-light, #EEF0F4)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>

      {/* Progress arc */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 0.3s ease',
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
      </svg>

      {/* Glow overlay for high scores */}
      {score >= 90 && (
        <svg
          width={size + 20}
          height={size + 20}
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
            opacity: 0.3,
            animation: 'pulse 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="scoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={center + 10} cy={center + 10} r={radius + strokeWidth} fill="url(#scoreGlow)" />
        </svg>
      )}

      {/* Score number in center */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <AnimatedNumber
          value={score}
          duration={800}
          suffix="%"
          style={{
            fontSize: size * 0.28,
            fontWeight: 700,
            color: colorVar,
            lineHeight: 1,
          }}
        />
        <span
          style={{
            fontSize: size * 0.09,
            color: 'var(--text-secondary, #515968)',
            marginTop: 2,
          }}
        >
          النتيجة
        </span>
      </div>
    </div>
  );
}
