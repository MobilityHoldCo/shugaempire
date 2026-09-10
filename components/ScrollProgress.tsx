'use client';
import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <motion.div
      style={{ scaleX, originX: 0 }}
      className="scroll-progress-bar"
    />
  );
}
