'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion';
import styles from './HeroSection.module.css';
import Image from 'next/image';

const SLIDES = [
  { src: '/c1.jpeg', label: 'SHUGA RIDE', sub: 'Electric mobility, redefined.' },
  { src: '/c2.jpeg', label: 'SHUGA CARS', sub: 'Own the road. Own the future.' },
  { src: '/c3.jpeg', label: 'SHUGA ENERGY', sub: 'Power your world, sustainably.' },
];

const AUTOPLAY_MS = 6000;

// ── 7 DISTINCT TRANSITION STYLES ─────────────────────────────────────────────
type TransitionStyle = {
  name: string;
  duration: number;
  ease: Transition['ease'];
  getActive: () => TargetAndTransition;
  getExit: (dir: number) => TargetAndTransition;
  getEnter: (dir: number) => TargetAndTransition;
};

const TRANSITION_STYLES: TransitionStyle[] = [
  // 1 ── Cinematic 3D Rotate Y (premium depth)
  {
    name: 'rotate3d',
    duration: 1.1,
    ease: [0.22, 1, 0.36, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 1.07, rotateY: d * -14, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(0.3) blur(0px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 0.95, rotateY: d * 14, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(0.3) blur(0px)' }),
  },

  // 2 ── Vertical Lift (slides from above/below + blur)
  {
    name: 'verticalLift',
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 1.04, rotateY: 0, rotateX: 0, x: 0, y: d * -90, skewX: 0, filter: 'brightness(0.2) blur(6px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 0.97, rotateY: 0, rotateX: 0, x: 0, y: d * 90, skewX: 0, filter: 'brightness(0.2) blur(6px)' }),
  },

  // 3 ── Zoom Dissolve (cosmic zoom-in with heavy blur)
  {
    name: 'zoomDissolve',
    duration: 1.5,
    ease: [0.25, 0.46, 0.45, 0.94],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (_d) => ({ opacity: 0, scale: 1.25, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(0.05) blur(18px)' }),
    getEnter:  (_d) => ({ opacity: 0, scale: 0.78, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(0.05) blur(18px)' }),
  },

  // 4 ── Diagonal Sweep (moves at an angle)
  {
    name: 'diagonal',
    duration: 1.0,
    ease: [0.43, 0.13, 0.23, 0.96],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 1.06, rotateY: 0, rotateX: 0, x: d * -140, y: d * -50, skewX: 0, filter: 'brightness(0.2) blur(8px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 0.94, rotateY: 0, rotateX: 0, x: d * 140, y: d * 50, skewX: 0, filter: 'brightness(0.2) blur(8px)' }),
  },

  // 5 ── 3D Flip X (rotates on horizontal axis — dramatic)
  {
    name: 'flipX',
    duration: 1.3,
    ease: [0.77, 0, 0.175, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 1.02, rotateY: 0, rotateX: d * -20, x: 0, y: 0, skewX: 0, filter: 'brightness(0.3) blur(2px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1.02, rotateY: 0, rotateX: d * 20, x: 0, y: 0, skewX: 0, filter: 'brightness(0.3) blur(2px)' }),
  },

  // 6 ── Horizontal Slide (clean linear push)
  {
    name: 'slideX',
    duration: 0.95,
    ease: [0.76, 0, 0.24, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, x: '0%', y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0.3, scale: 1, rotateY: 0, rotateX: 0, x: `${d * -60}%`, y: 0, skewX: 0, filter: 'brightness(0.5) blur(3px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1, rotateY: 0, rotateX: 0, x: `${d * 60}%`, y: 0, skewX: 0, filter: 'brightness(0.5) blur(3px)' }),
  },

  // 7 ── Skew Glitch (dramatic skew + warp — cinematic shutter feel)
  {
    name: 'glitch',
    duration: 0.9,
    ease: [0.87, 0, 0.13, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 0.92, rotateY: 0, rotateX: 0, rotate: 0, x: d * -30, y: 0, skewX: d * -8, filter: 'brightness(0.15) blur(5px) saturate(2)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1.08, rotateY: 0, rotateX: 0, rotate: 0, x: d * 30, y: 0, skewX: d * 8, filter: 'brightness(0.15) blur(5px) saturate(2)' }),
  },

  // 8 ── Vortex Portal (rotational spin + deep scale dive)
  {
    name: 'vortexPortal',
    duration: 1.25,
    ease: [0.25, 1, 0.5, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 0.65, rotateY: 0, rotateX: 0, rotate: d * -18, x: 0, y: 0, skewX: 0, filter: 'brightness(0.2) blur(12px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1.35, rotateY: 0, rotateX: 0, rotate: d * 18, x: 0, y: 0, skewX: 0, filter: 'brightness(0.2) blur(12px)' }),
  },

  // 9 ── 3D Revolving Cube (deep corner perspective shift)
  {
    name: 'cubeRevolve',
    duration: 1.15,
    ease: [0.65, 0, 0.35, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 0.88, rotateY: d * -28, rotateX: 0, rotate: 0, x: d * -80, y: 0, skewX: 0, filter: 'brightness(0.25) blur(4px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 0.88, rotateY: d * 28, rotateX: 0, rotate: 0, x: d * 80, y: 0, skewX: 0, filter: 'brightness(0.25) blur(4px)' }),
  },

  // 10 ── Speed Flash & Kinetic Surge
  {
    name: 'speedSurge',
    duration: 0.85,
    ease: [0.16, 1, 0.3, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) contrast(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 1.15, rotateY: 0, rotateX: 0, rotate: 0, x: d * -120, y: 0, skewX: d * -12, filter: 'brightness(2.2) contrast(1.3) blur(6px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 0.9, rotateY: 0, rotateX: 0, rotate: 0, x: d * 120, y: 0, skewX: d * 12, filter: 'brightness(0.3) blur(6px)' }),
  },

  // 11 ── Deep Drop & Tilt (theatrical curtain drop)
  {
    name: 'theaterDrop',
    duration: 1.2,
    ease: [0.33, 1, 0.68, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 0.92, rotateY: 0, rotateX: d * -22, rotate: 0, x: 0, y: d * -110, skewX: 0, filter: 'brightness(0.2) blur(8px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1.05, rotateY: 0, rotateX: d * 22, rotate: 0, x: 0, y: d * 110, skewX: 0, filter: 'brightness(0.2) blur(8px)' }),
  },

  // 12 ── Horizon Fold (isometric diagonal fold)
  {
    name: 'horizonFold',
    duration: 1.1,
    ease: [0.22, 1, 0.36, 1],
    getActive: () => ({ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, rotate: 0, x: 0, y: 0, skewX: 0, filter: 'brightness(1) blur(0px)' }),
    getExit:   (d) => ({ opacity: 0, scale: 0.85, rotateY: d * -18, rotateX: 14, rotate: d * -4, x: d * -60, y: -40, skewX: d * -4, filter: 'brightness(0.2) blur(6px)' }),
    getEnter:  (d) => ({ opacity: 0, scale: 1.12, rotateY: d * 18, rotateX: -14, rotate: d * 4, x: d * 60, y: 40, skewX: d * 4, filter: 'brightness(0.2) blur(6px)' }),
  },
];

let _styleIdx = 0; // tracks which style was last used so we never repeat consecutively

function pickNextStyle(currentIdx: number): number {
  // Pick a random index that is different from the current one
  const pool = TRANSITION_STYLES.length;
  let next = Math.floor(Math.random() * (pool - 1));
  if (next >= currentIdx) next += 1; // skip current
  return next;
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitionIdx, setTransitionIdx] = useState(0);
  const dragStartX = useRef(0);
  const dragging = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const slideY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const slideScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setTransitionIdx(prev => {
      const next = pickNextStyle(prev);
      _styleIdx = next;
      return next;
    });
    setActive(a => {
      const next = (a + dir + SLIDES.length) % SLIDES.length;
      setPrev(a);
      return next;
    });
  }, []);

  const goTo = useCallback((idx: number, currentActive: number) => {
    const dir: 1 | -1 = idx > currentActive ? 1 : -1;
    setDirection(dir);
    setTransitionIdx(prev => {
      const next = pickNextStyle(prev);
      _styleIdx = next;
      return next;
    });
    setPrev(currentActive);
    setActive(idx);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), AUTOPLAY_MS);
  }, [go]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) { go(dx < 0 ? 1 : -1); resetTimer(); }
  };
  const onTouchStart = (e: React.TouchEvent) => { dragStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); resetTimer(); }
  };

  const ts = TRANSITION_STYLES[transitionIdx];

  const statsContent = (
    <>
      <div className={styles.stat}>
        <span className={styles.statNum}>3</span>
        <span className={styles.statLabel}>Connected Businesses</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.stat}>
        <span className={styles.statNum}>2</span>
        <span className={styles.statLabel}>Cities Live Today</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.stat}>
        <span className={styles.statNum}>100<span className={styles.statUnit}>%</span></span>
        <span className={styles.statLabel}>Electric Fleet</span>
      </div>
    </>
  );

  return (
    <div className={styles.heroWrapper}>
      <section
        ref={ref}
        className={styles.hero}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── 3D Carousel Background ── */}
        <motion.div
          className={styles.carouselBg}
          style={{ y: slideY, scale: slideScale }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {SLIDES.map((slide, i) => {
            const isActive = i === active;
            const isPrev = i === prev;
            return (
              <motion.div
                key={slide.src}
                className={styles.carouselSlide}
                initial={false}
                animate={
                  isActive
                    ? ts.getActive()
                    : isPrev
                    ? ts.getExit(direction)
                    : ts.getEnter(direction)
                }
                transition={{
                  duration: ts.duration,
                  ease: ts.ease as Transition['ease'],
                }}
                style={{ zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
              >
                <Image
                  src={slide.src}
                  alt={slide.label}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={styles.carouselImg}
                />
              </motion.div>
            );
          })}

          {/* Cinematic multi-layer overlay */}
          <div className={styles.carouselOverlay} />
        </motion.div>

        {/* Slide label badge — crisp, stable display without looping fade in/out */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className={styles.slideBadge}
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, y: -8 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.slideBadgeLabel}>{SLIDES[active].label}</span>
            <span className={styles.slideBadgeSub}>{SLIDES[active].sub}</span>
          </motion.div>
        </AnimatePresence>

        {/* ── Subtle grid overlay ── */}
        <motion.div className={styles.bgGrid} style={{ y: bgY }} />

        {/* ── Content ── */}
        <motion.div className={styles.content} style={{ y: textY, opacity }}>
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 0], y: 0 }}
            transition={{
              opacity: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 0.8, delay: 0.3 },
            }}
          >
            <span className={styles.eyebrowLine} />
            SHUGA EMPIRE HOLDCO
            <span className={styles.eyebrowLine} />
          </motion.p>

          <motion.h1
            className={styles.heading}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            More Than
            <br />
            <span className={styles.headingAccent}>A Ride.</span>
            <br />
            We&apos;re Building
            <br />
            The Future.
          </motion.h1>
        </motion.div>

        {/* ── Carousel controls ── */}
        <motion.div
          className={styles.carouselControls}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          {/* Prev */}
          <button
            className={styles.arrowBtn}
            onClick={() => { go(-1); resetTimer(); }}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Dots with progress ring */}
          <div className={styles.dots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                onClick={() => { goTo(i, active); resetTimer(); }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === active && (
                  <svg className={styles.dotRing} viewBox="0 0 32 32">
                    <circle
                      cx="16" cy="16" r="13"
                      stroke="white" strokeWidth="1.5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset="0"
                      className={styles.dotRingProgress}
                      style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            className={styles.arrowBtn}
            onClick={() => { go(1); resetTimer(); }}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </motion.div>

        {/* ── Desktop Stats strip (inside hero on desktop) ── */}
        <motion.div
          className={styles.statsBarDesktop}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
        >
          {statsContent}
        </motion.div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ── Mobile Stats strip (placed cleanly below the hero page) ── */}
      <motion.div
        className={styles.statsBarMobile}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {statsContent}
      </motion.div>
    </div>
  );
}
