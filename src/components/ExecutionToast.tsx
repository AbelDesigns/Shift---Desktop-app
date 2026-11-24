import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { EASE_OUT_EXPO } from '../lib/motion';

export interface ToastPayload {
  id: string;
  message: string;
  detail?: string;
  onUndo?: () => void;
}

interface ExecutionToastProps {
  toast: ToastPayload | null;
  onDismiss: () => void;
  compact?: boolean;
}

export const ExecutionToast: React.FC<ExecutionToastProps> = ({
  toast,
  onDismiss,
  compact = false,
}) => {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute z-50 flex ${compact
          ? 'inset-x-3.5 top-[48px] justify-center'
          : 'bottom-4 right-5 justify-end'
        }`}
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: compact ? -10 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: compact ? -6 : 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl bg-[#1A1A1E]/95 shadow-[0_14px_36px_rgba(0,0,0,0.7)] backdrop-blur-md hairline-border ${compact ? 'w-full px-3 py-2.5' : 'max-w-[360px] px-3.5 py-2.5'
              }`}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#060607]">
              <Check className="h-2.5 w-2.5" strokeWidth={2.8} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#F5F5F7]">{toast.message}</p>
              {toast.detail && (
                <p className="truncate font-mono text-[10px] text-[#86868B]">{toast.detail}</p>
              )}
            </div>

            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo?.();
                  onDismiss();
                }}
                className="pressable inline-flex shrink-0 items-center gap-1 rounded-md bg-[#111113] px-2 py-1 font-mono text-[10.5px] text-[#F5F5F7] hairline-border transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Undo</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
