'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import styles from './ImageShowcase.module.css';

const PANELS = [
  {
    src: '/ev-home-charge.png',
    alt: 'Sleek white electric vehicle charging at a modern home — SHUGA FLEET',
    num: '01',
    title: 'SHUGA FLEET',
    sub: 'Vehicle Ownership',
    caption: 'Drive it. Pay for it. Own it.',
    href: '/shuga-cars',
  },
  {
    src: '/ev-fleet-charging.png',
    alt: 'Three electric vehicles at charging stations — Shuga Fleet',
    num: '02',
    title: 'Shuga Ride',
    sub: 'Ride-Hailing',
    caption: 'Lagos & Abuja. Then everywhere.',
    href: '/shuga-ride',
  },
  {
    src: '/charging-hub-row.png',
    alt: 'Row of solar-powered EV charging stations at sunset — Shuga Energy',
    num: '03',
    title: 'Shuga Energy',
    sub: 'EV Charging',
    caption: 'Solar-powered. Always on.',
    href: '/shuga-energy',
  },
];

export default function ImageShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section ref={containerRef} className={styles.showcase}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          The Ecosystem
        </p>
        <h2 className={styles.title}>Three businesses.<br />One connected future.</h2>
      </div>

      <div className={`${styles.grid} skew-on-scroll`} data-cursor-text="EXPLORE">
        {PANELS.map((panel, i) => (
          <PanelCard key={panel.num} panel={panel} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

function PanelCard({
  panel,
  index,
  scrollYProgress,
}: {
  panel: (typeof PANELS)[0];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // each card gets a slightly different parallax offset
  const dir = index % 2 === 0 ? 1 : -1;
  const imgY = useTransform(scrollYProgress, [0, 1], [`${dir * 30}px`, `${dir * -30}px`]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  return (
    <motion.a
      href={panel.href}
      className={styles.card}
      style={{ opacity: cardOpacity }}
      whileHover="hover"
      initial="rest"
      data-cursor
    >
      {/* Image with parallax shift */}
      <div className={styles.imgWrap}>
        <motion.div className={styles.imgInner} style={{ y: imgY }} variants={{
          rest: { scale: 1 },
          hover: { scale: 1.06 },
        }} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <Image
            src={panel.src}
            alt={panel.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.img}
          />
          {/* Dark overlay */}
          <motion.div
            className={styles.overlay}
            variants={{
              rest: { opacity: 0.55 },
              hover: { opacity: 0.3 },
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </div>

      {/* Card info */}
      <div className={styles.info}>
        <div className={styles.topRow}>
          <span className={styles.num}>{panel.num}</span>
          <span className={styles.sub}>{panel.sub}</span>
        </div>
        <div className={styles.bottom}>
          <h3 className={styles.cardTitle}>{panel.title}</h3>
          <motion.p
            className={styles.caption}
            variants={{ rest: { opacity: 0, y: 8 }, hover: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35 }}
          >
            {panel.caption}
          </motion.p>
          <motion.div
            className={styles.arrow}
            variants={{ rest: { x: 0, opacity: 0.4 }, hover: { x: 8, opacity: 1 } }}
            transition={{ duration: 0.3 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}
