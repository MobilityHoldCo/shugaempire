'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import styles from './EcosystemFlow.module.css';

const nodes = [
  { id: '01', name: 'SHUGA FLEET', sub: 'Vehicle Ownership', desc: 'Creates the entry point — drivers access EVs and work toward ownership.' },
  { id: '02', name: 'SHUGA RIDE', sub: 'Ride-Hailing', desc: 'Puts vehicles to work. Connects drivers with passengers across Lagos & Abuja.' },
  { id: '03', name: 'SHUGA ENERGY', sub: 'EV Charging', desc: 'Solar-powered charging keeps the fleet moving. Open to all EV operators.' },
  { id: '→', name: 'MOBILITY HOLD CO.', sub: 'The Ecosystem', desc: 'Access. Ownership. Opportunity. Sustainability — all connected.' },
];

export default function EcosystemFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <div ref={ref} className={styles.flow}>
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className={`${styles.node} ${node.id === '→' ? styles.final : ''}`}
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: i * 0.15 }}
        >
          <div className={styles.nodeId}>{node.id}</div>
          <div className={styles.nodeContent}>
            <div className={styles.nodeName}>{node.name}</div>
            <div className={styles.nodeSub}>{node.sub}</div>
            <p className={styles.nodeDesc}>{node.desc}</p>
          </div>
          {i < nodes.length - 1 && (
            <motion.div
              className={styles.connector}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.15 + 0.5 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
