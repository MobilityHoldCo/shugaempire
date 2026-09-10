'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './CursorFollower.module.css';

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  useEffect(() => {
    // Disable custom cursor on touch/mobile devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;
    let lastCheckTime = 0;
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Throttle DOM inspection to every 100ms
      const now = performance.now();
      if (now - lastCheckTime > 100) {
        lastCheckTime = now;
        const target = e.target as HTMLElement | null;

        // Check for text context
        const textElem = target?.closest?.('[data-cursor-text]') as HTMLElement | null;
        const newText = textElem ? textElem.getAttribute('data-cursor-text') : null;
        setCursorText((prev) => (prev !== newText ? newText : prev));

        // Check for link or button hover
        const isClickable = Boolean(target?.closest?.('a, button, [data-cursor], input, select, textarea'));
        setIsHoveringLink((prev) => (prev !== isClickable ? isClickable : prev));
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (badgeRef.current) badgeRef.current.style.opacity = '0';
      setCursorText(null);
    };

    const animate = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.22;
        ringY += (mouseY - ringY) * 0.22;

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
        if (badgeRef.current) {
          badgeRef.current.style.transform = `translate3d(${ringX}px, ${ringY + 30}px, 0)`;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Precision Core Dot */}
      <div
        ref={dotRef}
        className={`${styles.dot} ${cursorText ? styles.dotHidden : ''}`}
        aria-hidden="true"
      />

      {/* Trailing Cybernetic Reticle Ring */}
      <div
        ref={ringRef}
        className={`
          ${styles.ring}
          ${isHoveringLink ? styles.ringHover : ''}
          ${cursorText ? styles.ringWithText : ''}
        `}
        aria-hidden="true"
      >
        <span className={styles.tickTop} />
        <span className={styles.tickBottom} />
        <span className={styles.tickLeft} />
        <span className={styles.tickRight} />
      </div>

      {/* Dynamic Context Floating Badge */}
      <div
        ref={badgeRef}
        className={`${styles.badge} ${cursorText ? styles.badgeVisible : ''}`}
        aria-hidden="true"
      >
        <span>{cursorText}</span>
      </div>
    </>
  );
}
