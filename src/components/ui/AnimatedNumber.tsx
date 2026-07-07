import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  formatter?: (n: number) => string;
  style?: React.CSSProperties;
  className?: string;
  suffix?: string;
}

/**
 * AnimatedNumber — counts from 0 → value with ease-out timing
 * Uses requestAnimationFrame for smooth 60fps animation
 */
export function AnimatedNumber({
  value,
  duration = 800,
  formatter,
  style,
  className,
  suffix = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    // If value is 0, just set it immediately
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const startValue = fromRef.current;
    const startTime = performance.now();
    let raf: number;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = startValue + (value - startValue) * easedProgress;

      setDisplay(current);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        fromRef.current = value;
      }
    }

    raf = requestAnimationFrame(animate);
    rafRef.current = raf;

    return () => {
      if (raf) cancelAnimationFrame(raf);
      fromRef.current = display;
    };
  }, [value, duration]);

  const formatted = formatter ? formatter(display) : Math.round(display).toString();

  return (
    <span
      className={className}
      style={{
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {formatted}{suffix}
    </span>
  );
}
