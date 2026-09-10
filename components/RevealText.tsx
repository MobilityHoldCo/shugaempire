'use client';
import { useRef, HTMLAttributes } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './RevealText.module.css';

type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Props extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: TagName;
}

export default function RevealText({ children, delay = 0, className = '', as: Tag = 'div', style, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <div ref={ref} className={styles.wrapper}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <Tag className={className} style={style} {...rest as Record<string, unknown>}>{children}</Tag>
      </motion.div>
    </div>
  );
}
