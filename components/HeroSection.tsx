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

// ── 5 DISTINCT HEADLINE TRANSITIONS (Mobile View) ────────────────────────────
type HeadlineTransition = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
};

const HEADLINE_TRANSITIONS: HeadlineTransition[] = [
  // 1: Cinematic Zoom & Depth Blur
  {
    initial: { opacity: 0, scale: 0.8, filter: 'blur(12px)', y: 25 },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 },
    exit: { opacity: 0, scale: 1.15, filter: 'blur(10px)', y: -20 },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
  // 2: Kinetic Cyber Slide & Skew
  {
    initial: { opacity: 0, x: -70, skewX: -12, filter: 'blur(8px)' },
    animate: { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: 70, skewX: 12, filter: 'blur(8px)' },
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
  },
  // 3: 3D Perspective Pitch Flip
  {
    initial: { opacity: 0, rotateX: 65, y: 35, transformPerspective: 800 },
    animate: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 800 },
    exit: { opacity: 0, rotateX: -65, y: -35, transformPerspective: 800 },
    transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] },
  },
  // 4: Dramatic Vertical Shutter Drop & Flash
  {
    initial: { opacity: 0, y: -50, scaleY: 1.25, filter: 'brightness(1.9)' },
    animate: { opacity: 1, y: 0, scaleY: 1, filter: 'brightness(1)' },
    exit: { opacity: 0, y: 50, scaleY: 0.8, filter: 'brightness(1.5)' },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
  // 5: Vortex Twist & Elastic Reveal
  {
    initial: { opacity: 0, scale: 0.6, rotate: -8, filter: 'blur(12px)' },
    animate: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.7, rotate: 8, filter: 'blur(10px)' },
    transition: { duration: 0.85, ease: [0.34, 1.56, 0.64, 1] },
  },
];

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

// ── DESKTOP HEADLINE TYPING & TRANSITIONS (Desktop Screen Alone) ────────────
const DESKTOP_LINES = [
  { text: 'More Than', isAccent: false, accentType: '' },
  { text: 'A Ride.', isAccent: true, accentType: 'ride' },
  { text: "We're Building", isAccent: false, accentType: '' },
  { text: 'The Future.', isAccent: true, accentType: 'future' },
];

const CYBER_GLYPHS = ['0', '1', '⚡', 'Δ', '§', 'X', '9', '7', '◊', 'λ', 'Ψ'];

const TYPING_MODES = [
  { id: 'typewriter', label: 'Typewriter', shortName: '01 Typewriter' },
  { id: 'decoder', label: 'Matrix Decode', shortName: '02 Matrix Decode' },
  { id: 'kinetic', label: 'Kinetic Burst', shortName: '03 Kinetic Burst' },
  { id: 'wave', label: 'Luminous Wave', shortName: '04 Luminous Wave' },
];

function getLineSlice(lineIndex: number, currentChars: number) {
  const offsets = [0, 9, 16, 30, 41];
  const start = offsets[lineIndex];
  const end = offsets[lineIndex + 1];
  const fullText = DESKTOP_LINES[lineIndex].text;

  if (currentChars <= start) {
    return { text: '', isCurrent: false, isComplete: false };
  }
  if (currentChars >= end) {
    return { text: fullText, isCurrent: false, isComplete: true };
  }
  return {
    text: fullText.slice(0, currentChars - start),
    isCurrent: true,
    isComplete: false,
  };
}

function DesktopTypingHeading() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing' | 'glitchOut' | 'curtainOut'>('typing');
  const [charCount, setCharCount] = useState(0);
  const [glitchSuffix, setGlitchSuffix] = useState('');
  const [kineticStep, setKineticStep] = useState(0);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const startCycle = useCallback((targetMode: number) => {
    clearAllTimeouts();
    setMode(targetMode);
    setPhase('typing');

    if (targetMode === 0) {
      // 01 ── Cyber Terminal Typewriter
      setCharCount(0);
      setGlitchSuffix('');
      let current = 0;

      const step = () => {
        current += 1;
        setCharCount(current);
        if (current < 41) {
          const isBreak = current === 9 || current === 16 || current === 30;
          addTimeout(step, isBreak ? 140 : 42);
        } else {
          setPhase('holding');
          addTimeout(() => {
            setPhase('erasing');
            let eraseCur = 41;
            const eraseStep = () => {
              eraseCur -= 1;
              setCharCount(eraseCur);
              if (eraseCur > 0) {
                addTimeout(eraseStep, 16);
              } else {
                addTimeout(() => {
                  startCycle((targetMode + 1) % 4);
                }, 350);
              }
            };
            addTimeout(eraseStep, 16);
          }, 4200);
        }
      };
      addTimeout(step, 120);
    } else if (targetMode === 1) {
      // 02 ── Matrix / Cyber Glyph Decoder
      setCharCount(0);
      let current = 0;

      const stepDecode = () => {
        const r1 = CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
        setGlitchSuffix(r1);

        addTimeout(() => {
          const r2 = CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
          setGlitchSuffix(r2);

          addTimeout(() => {
            current += 1;
            setCharCount(current);
            setGlitchSuffix('');
            if (current < 41) {
              const isBreak = current === 9 || current === 16 || current === 30;
              addTimeout(stepDecode, isBreak ? 130 : 36);
            } else {
              setPhase('holding');
              addTimeout(() => {
                setPhase('glitchOut');
                addTimeout(() => {
                  startCycle((targetMode + 1) % 4);
                }, 450);
              }, 4200);
            }
          }, 24);
        }, 24);
      };
      addTimeout(stepDecode, 120);
    } else if (targetMode === 2) {
      // 03 ── Kinetic Staccato Burst
      setKineticStep(0);
      setCharCount(41);
      setGlitchSuffix('');

      addTimeout(() => setKineticStep(1), 100);
      addTimeout(() => setKineticStep(2), 460);
      addTimeout(() => setKineticStep(3), 820);
      addTimeout(() => {
        setKineticStep(4);
        setPhase('holding');
        addTimeout(() => {
          setPhase('curtainOut');
          addTimeout(() => {
            startCycle((targetMode + 1) % 4);
          }, 450);
        }, 4200);
      }, 1180);
    } else {
      // 04 ── Luminous Wave Stream
      setCharCount(0);
      setGlitchSuffix('');
      let current = 0;

      const stepWave = () => {
        current += 1;
        setCharCount(current);
        if (current < 41) {
          addTimeout(stepWave, 26);
        } else {
          setPhase('holding');
          addTimeout(() => {
            setPhase('erasing');
            let eraseCur = 41;
            const eraseStep = () => {
              eraseCur -= 1;
              setCharCount(eraseCur);
              if (eraseCur > 0) {
                addTimeout(eraseStep, 14);
              } else {
                addTimeout(() => {
                  startCycle(0);
                }, 300);
              }
            };
            addTimeout(eraseStep, 14);
          }, 4200);
        }
      };
      addTimeout(stepWave, 120);
    }
  }, [addTimeout, clearAllTimeouts]);

  useEffect(() => {
    setMounted(true);
    startCycle(0);
    return () => clearAllTimeouts();
  }, [startCycle, clearAllTimeouts]);

  if (!mounted) {
    return (
      <div className={styles.desktopHeadingWrap}>
        <h1 className={styles.headingDesktop}>
          <span className={styles.headingLine}>More Than</span>
          <span className={styles.headingLine}>
            <span className={styles.accentRideDesktop}>A Ride.</span>
          </span>
          <span className={styles.headingLine}>We&apos;re Building</span>
          <span className={styles.headingLine}>
            <span className={styles.accentFutureDesktop}>The Future.</span>
          </span>
        </h1>
      </div>
    );
  }

  const isKinetic = mode === 2;
  const isPhaseGlitch = phase === 'glitchOut';
  const isPhaseCurtain = phase === 'curtainOut';

  const s0 = getLineSlice(0, charCount);
  const s1 = getLineSlice(1, charCount);
  const s2 = getLineSlice(2, charCount);
  const s3 = getLineSlice(3, charCount);

  return (
    <div
      className={`${styles.desktopHeadingWrap} ${isPhaseGlitch ? styles.phaseGlitchOut : ''} ${
        isPhaseCurtain ? styles.phaseCurtainOut : ''
      }`}
    >
      <h1 className={styles.headingDesktop} aria-label="More Than A Ride. We're Building The Future.">
        {/* Line 1: More Than */}
        <span className={styles.headingLine}>
          {isKinetic ? (
            kineticStep >= 1 && (
              <motion.span
                initial={{ opacity: 0, y: 15, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 25 }}
              >
                More Than
              </motion.span>
            )
          ) : (
            <>
              {s0.text}
              {s0.isCurrent && glitchSuffix}
              {s0.isCurrent && <span className={styles.desktopCursor} />}
            </>
          )}
        </span>

        {/* Line 2: A Ride. (Emphasis on A Ride) */}
        <span className={styles.headingLine}>
          {isKinetic ? (
            kineticStep >= 2 && (
              <motion.span
                className={styles.accentRideDesktop}
                initial={{ opacity: 0, scale: 0.82, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                A Ride.
              </motion.span>
            )
          ) : (
            <>
              {(s1.text.length > 0 || s1.isCurrent) && (
                <span className={styles.accentRideDesktop}>
                  {s1.text}
                  {s1.isCurrent && glitchSuffix}
                </span>
              )}
              {s1.isCurrent && <span className={styles.desktopCursor} />}
            </>
          )}
        </span>

        {/* Line 3: We're Building */}
        <span className={styles.headingLine}>
          {isKinetic ? (
            kineticStep >= 3 && (
              <motion.span
                initial={{ opacity: 0, y: 15, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 25 }}
              >
                We&apos;re Building
              </motion.span>
            )
          ) : (
            <>
              {s2.text}
              {s2.isCurrent && glitchSuffix}
              {s2.isCurrent && <span className={styles.desktopCursor} />}
            </>
          )}
        </span>

        {/* Line 4: The Future. (Emphasis on The Future) */}
        <span className={styles.headingLine}>
          {isKinetic ? (
            kineticStep >= 4 && (
              <motion.span
                className={styles.accentFutureDesktop}
                initial={{ opacity: 0, scale: 0.82, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              >
                The Future.
              </motion.span>
            )
          ) : (
            <>
              {(s3.text.length > 0 || s3.isCurrent) && (
                <span className={styles.accentFutureDesktop}>
                  {s3.text}
                  {s3.isCurrent && glitchSuffix}
                </span>
              )}
              {(s3.isCurrent || phase === 'holding') && <span className={styles.desktopCursor} />}
            </>
          )}
        </span>
      </h1>
    </div>
  );
}

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

  const [isMobile, setIsMobile] = useState(false);
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setHeadlineIdx((prev) => (prev + 1) % HEADLINE_TRANSITIONS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isMobile]);

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
            animate={{ opacity: [0.15, 1, 0.15], y: 0 }}
            transition={{
              opacity: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 0.8, delay: 0.3 },
            }}
          >
            <span className={styles.eyebrowLine} />
            SHUGA EMPIRE HOLDCO
            <span className={styles.eyebrowLine} />
          </motion.p>

          {isMobile ? (
            <div className={styles.mobileHeadingWrap}>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headlineIdx}
                  className={styles.heading}
                  initial={HEADLINE_TRANSITIONS[headlineIdx].initial}
                  animate={HEADLINE_TRANSITIONS[headlineIdx].animate}
                  exit={HEADLINE_TRANSITIONS[headlineIdx].exit}
                  transition={HEADLINE_TRANSITIONS[headlineIdx].transition}
                >
                  More Than
                  <br />
                  <span className={styles.headingAccent}>A Ride.</span>
                  <br />
                  We&apos;re Building
                  <br />
                  The Future.
                </motion.h1>
              </AnimatePresence>
            </div>
          ) : (
            <DesktopTypingHeading />
          )}
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
