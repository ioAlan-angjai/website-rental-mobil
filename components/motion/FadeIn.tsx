// components/motion/FadeIn.tsx - Framer Motion fade-in wrapper

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay, duration }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}
