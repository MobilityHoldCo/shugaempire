'use client';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only run on non-touch devices or where smooth scroll is supported
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    let targetSkew = 0;
    let currentSkew = 0;
    let animId: number;

    // Listen to Lenis scroll velocity
    lenis.on('scroll', (e: { velocity: number }) => {
      // Clamp max skew to +/- 2.8deg for ultra-sleek, readable liquid physics
      const rawSkew = e.velocity * 0.055;
      targetSkew = Math.max(-2.8, Math.min(2.8, rawSkew));
    });

    const raf = (time: number) => {
      lenis.raf(time);

      // Liquid spring recovery back to 0 when scrolling slows down
      targetSkew *= 0.88;
      currentSkew += (targetSkew - currentSkew) * 0.12;

      // Update CSS variables on root if skew is noticeable
      if (Math.abs(currentSkew) > 0.01) {
        document.documentElement.style.setProperty('--scroll-skew', `${currentSkew.toFixed(3)}deg`);
      } else if (currentSkew !== 0) {
        currentSkew = 0;
        document.documentElement.style.setProperty('--scroll-skew', '0deg');
      }

      animId = requestAnimationFrame(raf);
    };

    animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
