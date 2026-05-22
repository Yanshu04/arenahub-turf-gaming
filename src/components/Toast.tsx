/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useBooking } from '../context/MockBookingContext';
import { CheckCircle, X } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useBooking();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-4 text-white shadow-2xl ring-1 ring-white/10">
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-sm font-bold tracking-tight">{toast}</span>
            <button
              onClick={hideToast}
              className="ml-2 rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
