import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowUp, Check, Mic, Square, X } from 'lucide-react';
import {
  DESKTOP_COMMANDS,
  ExecutableCommand,
  VOICE_PRESET_COMMANDS,
} from '../../data/mockData';
import { EASE_OUT_CUBIC, TRANSITION_SHEET } from '../../lib/motion';

interface QuickCommandSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: {
    title: string;
    detail: string;
    source: ExecutableCommand['source'];
  }) => void;
}

type SheetPhase = 'idle' | 'listening' | 'executing' | 'confirmed';

export const QuickCommandSheet: React.FC<QuickCommandSheetProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<SheetPhase>('idle');
  const [statusText, setStatusText] = useState('');
  const [voiceIndex, setVoiceIndex] = useState(0);
  const timersRef = useRef<number[]>([]);

  const quickChips = DESKTOP_COMMANDS.slice(0, 3);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      clearTimers();
      setInput('');
      setPhase('idle');
      setStatusText('');
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'executing') {
        clearTimers();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, phase, onClose]);

  const runAction = (payload: {
    label: string;
    title: string;
    detail: string;
    source: ExecutableCommand['source'];
  }) => {
    clearTimers();
    setStatusText(payload.label);
    setPhase('executing');

    const t1 = window.setTimeout(() => {
      onExecuteCommand({
        title: payload.title,
        detail: payload.detail,
        source: payload.source,
      });
      setPhase('confirmed');

      const t2 = window.setTimeout(() => {
        onClose();
      }, 620);
      timersRef.current.push(t2);
    }, 1000);
    timersRef.current.push(t1);
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || phase !== 'idle') return;
    runAction({
      label: trimmed,
      title: trimmed,
      detail: 'System • Executed via Android Quick Command',
      source: 'System',
    });
  };

  const handleToggleVoice = () => {
    if (phase === 'executing' || phase === 'confirmed') return;

    if (phase === 'listening') {
      clearTimers();
      const preset = VOICE_PRESET_COMMANDS[voiceIndex % VOICE_PRESET_COMMANDS.length];
      setVoiceIndex((i) => i + 1);
      runAction({
        label: preset.transcript,
        title: preset.resultTitle,
        detail: preset.resultDetail,
        source: preset.source,
      });
      return;
    }

    setPhase('listening');
    setStatusText('Listening for command...');

    const vt = window.setTimeout(() => {
      const preset = VOICE_PRESET_COMMANDS[voiceIndex % VOICE_PRESET_COMMANDS.length];
      setVoiceIndex((i) => i + 1);
      runAction({
        label: preset.transcript,
        title: preset.resultTitle,
        detail: preset.resultDetail,
        source: preset.source,
      });
    }, 1800);
    timersRef.current.push(vt);
  };

  const handleBackdropDismiss = () => {
    if (phase === 'executing') return;
    clearTimers();
    onClose();
  };

  // Vaul-inspired swipe-down gesture to dismiss bottom sheet naturally
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (phase === 'executing') return;
    if (info.offset.y > 70 || info.velocity.y > 380) {
      clearTimers();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
          onClick={handleBackdropDismiss}
          className="absolute inset-0 z-40 flex items-end bg-black/65 backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Command"
            drag={phase === 'executing' ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.35 }}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={TRANSITION_SHEET}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full overflow-hidden rounded-t-[26px] bg-[#111113] px-4 pb-7 pt-3 shadow-[0_-16px_48px_rgba(0,0,0,0.75)] hairline-t"
          >
            {/* Interactive Drag Handle */}
            <div className="mx-auto mb-3.5 h-1 w-9 cursor-grab rounded-full bg-white/20 active:cursor-grabbing" />

            {/* Sheet Header */}
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    phase === 'listening' || phase === 'executing'
                      ? 'animate-pulse bg-[#FF2A36]'
                      : phase === 'confirmed'
                        ? 'bg-[#30D158]'
                        : 'bg-[#86868B]'
                  }`}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                  {phase === 'listening'
                    ? 'Voice Capture'
                    : phase === 'executing'
                      ? 'Executing...'
                      : phase === 'confirmed'
                        ? 'Confirmed'
                        : 'Quick Command'}
                </span>
              </div>

              <button
                onClick={handleBackdropDismiss}
                aria-label="Close quick command"
                className="pressable flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1E] text-[#86868B] hairline-border"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {phase === 'listening' ? (
              <div className="rounded-2xl bg-[#1A1A1E] px-4 py-5 hairline-border">
                <div className="flex h-10 items-center justify-center gap-1.5">
                  {[0.35, 0.75, 1, 0.55, 0.9, 0.65, 1, 0.45, 0.8, 0.4].map((peak, idx) => (
                    <motion.span
                      key={idx}
                      animate={{ scaleY: [0.25, peak, 0.3] }}
                      transition={{
                        duration: 0.55 + (idx % 3) * 0.14,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: idx * 0.05,
                      }}
                      className="h-9 w-[3px] origin-center rounded-full bg-[#FF2A36]"
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11px] text-[#F5F5F7]">
                    Listening...
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        clearTimers();
                        setPhase('idle');
                        setStatusText('');
                      }}
                      className="pressable rounded-md bg-[#111113] px-2.5 py-1 font-mono text-[10px] text-[#86868B] hairline-border"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className="pressable inline-flex items-center gap-1 rounded-md bg-[#111113] px-2.5 py-1 font-mono text-[10px] text-[#FF2A36] hairline-border"
                    >
                      <Square className="h-2.5 w-2.5 fill-current" />
                      <span>Run now</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : phase === 'executing' || phase === 'confirmed' ? (
              <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1E] px-4 py-4 hairline-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#F5F5F7]">{statusText}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-[#86868B]">
                      {phase === 'executing'
                        ? 'Dispatching via Shift Engine...'
                        : 'Logged to activity feed'}
                    </p>
                  </div>
                  {phase === 'confirmed' ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#060607]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                  ) : (
                    <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-[#FF2A36]" />
                  )}
                </div>

                {phase === 'executing' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.96, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FF2A36]"
                  />
                )}
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmitText} className="flex items-center gap-2">
                  <div className="flex flex-1 items-center rounded-xl bg-[#1A1A1E] px-3 py-2.5 hairline-border">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Execute action directly..."
                      className="w-full bg-transparent text-[13px] text-[#F5F5F7] placeholder-[#86868B] focus:outline-none"
                    />
                    {input.trim().length > 0 && (
                      <button
                        type="submit"
                        aria-label="Run command"
                        className="pressable ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-[#060607]"
                      >
                        <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    aria-label="Voice command"
                    className="pressable flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#1A1A1E] text-[#F5F5F7] hairline-border active:border-[#FF2A36]/60"
                  >
                    <Mic className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </form>

                {/* 3 Executable Quick-Action Chips */}
                <div className="mt-4">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                    Instant Actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickChips.map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() =>
                          runAction({
                            label: chip.label,
                            title: chip.resultTitle,
                            detail: chip.resultDetail,
                            source: chip.source,
                          })
                        }
                        className="pressable rounded-lg bg-[#1A1A1E] px-3 py-2 text-[12px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#232329]"
                      >
                        {chip.mobileLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
