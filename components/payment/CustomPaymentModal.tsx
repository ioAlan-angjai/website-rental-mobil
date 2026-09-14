'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CustomPaymentView } from './CustomPaymentView';

interface CustomPaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  paymentType?: 'DP' | 'FULL_PAYMENT';
  amount: number;
  carName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomPaymentModal({
  isOpen,
  bookingId,
  paymentType = 'DP',
  amount,
  carName,
  onClose,
  onSuccess,
}: CustomPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl my-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <CustomPaymentView
            bookingId={bookingId}
            paymentType={paymentType}
            amount={amount}
            carName={carName}
            onCancel={onClose}
            onSuccess={() => {
              onSuccess?.();
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
