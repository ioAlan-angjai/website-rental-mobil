// components/motion/StaggerContainer.tsx - Framer Motion stagger effect

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        ...staggerContainerVariants,
        visible: {
          ...staggerContainerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerChildVariants} className={className}>
      {children}
    </motion.div>
  );
}
