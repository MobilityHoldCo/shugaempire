'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './BusinessCard.module.css';
import Link from 'next/link';

interface Props {
  num: string;
  title: string;
  tagline: string;
  description: string;
  cta: string;
  href: string;
  index: number;
}

export default function BusinessCard({ num, title, tagline, description, cta, href, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <motion.article
      ref={ref}
      className={styles.card}
      style={{ y, opacity }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={styles.topRow}>
        <span className={styles.num}>{num}</span>
        <div className={styles.badge}>{tagline}</div>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      <Link href={href} className={styles.link} data-cursor>
        <span>{cta}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
      <div className={styles.glow} />
    </motion.article>
  );
}
