'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import styles from './SplitImageSection.module.css';

interface Props {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  heading: React.ReactNode;
  body: React.ReactNode;
  reverse?: boolean;
}

export default function SplitImageSection({ imageSrc, imageAlt, eyebrow, heading, body, reverse = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  return (
    <div
      ref={ref}
      className={`${styles.split} ${reverse ? styles.reverse : ''}`}
    >
      {/* ── Image side ── */}
      <div className={styles.imgSide}>
        <motion.div
          className={`${styles.imgFrame} skew-on-scroll`}
          data-cursor-text="INSPECT"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div ref={imgRef} className={styles.imgInner}>
            <motion.div className={styles.imgParallax} style={{ y: imgY }}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.img}
              />
              <div className={styles.imgOverlay} />
            </motion.div>
          </div>
        </motion.div>

        {/* Corner decoration */}
        <div className={styles.cornerTL} />
        <div className={styles.cornerBR} />
      </div>

      {/* ── Text side ── */}
      <motion.div
        className={styles.textSide}
        initial={{ opacity: 0, x: reverse ? -30 : 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          {eyebrow}
        </p>
        <div className={styles.headingWrap}>{heading}</div>
        <div className={styles.body}>{body}</div>
      </motion.div>
    </div>
  );
}
