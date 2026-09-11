'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './HeroSection.module.css';
import Link from 'next/link';
import Image from 'next/image';

const SLIDES = [
  { src: '/c1.jpeg', label: 'SHUGA RIDE', sub: 'Electric mobility, redefined.' },
  { src: '/c2.jpeg', label: 'SHUGA CARS', sub: 'Own the road. Own the future.' },
  { src: '/c3.jpeg', label: 'SHUGA ENERGY', sub: 'Power your world, sustainably.' },
];

const AUTOPLAY_MS = 5000;

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  // Parallax for each slide layer
  const slideY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const slideScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setActive(a => {
      const next = (a + dir + SLIDES.length) % SLIDES.length;
      setPrev(a);
      return next;
    });
  }, []);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > active ? 1 : -1);
    setPrev(active);
    setActive(idx);
  }, [active]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), AUTOPLAY_MS);
  }, [go]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  // Drag / swipe
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) { go(dx < 0 ? 1 : -1); resetTimer(); }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); resetTimer(); }
  };

  return (
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
        {/* Slides */}
        {SLIDES.map((slide, i) => {
          const isActive = i === active;
          const isPrev = i === prev;
          return (
            <motion.div
              key={slide.src}
              className={styles.carouselSlide}
              initial={false}
              animate={{
                opacity: isActive ? 1 : isPrev ? 0 : 0,
                scale: isActive ? 1 : isPrev ? 1.06 : 0.96,
                rotateY: isActive ? 0 : isPrev ? direction * -8 : direction * 8,
                z: isActive ? 0 : -120,
                filter: isActive ? 'brightness(1)' : 'brightness(0.4)',
              }}
              transition={{
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
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

      {/* Slide label badge — anchored to hero, not carousel (avoids inset clipping) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className={styles.slideBadge}
          initial={{ opacity: 0, x: -24, y: 12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 24, y: -8 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
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

        <motion.p
          className={styles.subtext}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
        >
          Nigeria&apos;s most connected mobility ecosystem — vehicle ownership,
          ride-hailing, and solar-powered EV charging. One system. Every opportunity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}
        >
          <Link
            href="/waitlist"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontFamily: 'var(--font-techno)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textDecoration: 'none',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
            <span>EARLY ACCESS WAITLIST OPEN &bull; RESERVE SPOT &rarr;</span>
          </Link>
        </motion.div>

        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <Link href="/shuga-cars" className={styles.ctaPrimary} data-cursor>
            GET A CAR FROM SHUGA
          </Link>
          <Link href="/shuga-ride" className={styles.ctaSecondary} data-cursor>
            Ride with Shuga
          </Link>
        </motion.div>
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
              onClick={() => { goTo(i); resetTimer(); }}
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

      {/* ── Stats strip ── */}
      <motion.div
        className={styles.statsBar}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4 }}
      >
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
  );
}
