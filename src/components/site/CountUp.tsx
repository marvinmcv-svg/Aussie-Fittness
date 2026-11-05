'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders the final value on the server (so it's never missing without JS),
 * then counts up from 0 the first time it scrolls into view. Writes straight
 * to the text node each frame — no React re-renders.
 */
export function CountUp({ value, duration = 900, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // visible on load: keep the real number
    el.textContent = '0';
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          el.textContent = String(Math.round(value * (1 - Math.pow(1 - p, 4))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = String(value);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">{value}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
