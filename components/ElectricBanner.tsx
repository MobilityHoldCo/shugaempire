'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ElectricBanner.module.css';

export default function ElectricBanner() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const imgY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['20px', '-20px']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.banner} data-cursor-text="⚡ ENERGY HUB">
      {/* Parallax image layer */}
      <div className={styles.imgContainer}>
        <motion.div className={styles.imgWrapper} style={{ y: imgY }}>
          <Image
            src="/charging-hub-row.png"
            alt="Row of solar-powered EV charging stations at golden hour — Shuga Energy"
            fill
            sizes="100vw"
            className={styles.img}
            priority={false}
          />
        </motion.div>
        {/* Cinematic overlays */}
        <div className={styles.overlayDark} />
        <div className={styles.overlayVignette} />
        <div className={styles.scanlines} aria-hidden />
      </div>

      {/* Text content */}
      <motion.div className={styles.content} style={{ y: textY, opacity }}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          Why Electric?
        </p>
        <h2 className={styles.heading}>
          The Future of Nigerian<br />
          <span className={styles.headingOutline}>Mobility Will Be Different.</span>
        </h2>
        <p className={styles.body}>
          By combining electric vehicles with solar-powered charging infrastructure,
          we&apos;re building at the intersection of Mobility + Energy + Technology + Ownership.
          We aren&apos;t waiting for the future of transportation. We&apos;re building our place in it.
        </p>
        <Link href="/shuga-energy" className={styles.cta} data-cursor>
          <span>See How We Power It</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </motion.div>

      {/* Bottom stat bar */}
      <div className={styles.statBar}>
        <div className={styles.statItem}>
          <span className={styles.statN}>100%</span>
          <span className={styles.statL}>Solar Powered Charging</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statN}>0</span>
          <span className={styles.statL}>Grid Dependency</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statN}>24/7</span>
          <span className={styles.statL}>Charging Access</span>
        </div>
      </div>
    </section>
  );
}
