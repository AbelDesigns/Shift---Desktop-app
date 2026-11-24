import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CornerDownLeft, Terminal } from 'lucide-react';
import { DESKTOP_COMMANDS, ExecutableCommand } from '../../data/mockData';
import { SourceBadge } from '../SourceBadge';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO } from '../../lib/motion';

interface CommandBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: {
    title: string;
    detail: string;
    source: ExecutableCommand['source'];
  }) => void;
}

type ModalPhase = 'idle' | 'executing' | 'confirmed';

export const CommandBarModal: React.FC<CommandBarModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<ModalPhase>('idle');
  const [activeCommandLabel, setActiveCommandLabel] = useState('');
  const [confirmedDetail, setConfirmedDetail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  const filteredCommands = DESKTOP_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.trim().toLowerCase()) ||
      cmd.detail.toLowerCase().includes(query.trim().toLowerCase()) ||
      cmd.source.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const clearPendingTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      clearPendingTimers();
      setQuery('');
      setSelectedIndex(0);
      setPhase('idle');
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
      timersRef.current.push(focusTimer);
    } else {
      clearPendingTimers();
    }
    return clearPendingTimers;
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const triggerExecution = (cmd: {
    label: string;
    resultTitle: string;
    resultDetail: string;
    source: ExecutableCommand['source'];
  }) => {
    if (phase !== 'idle') return;
    setActiveCommandLabel(cmd.label);
    setConfirmedDetail(cmd.resultDetail);
    setPhase('executing');

    const t1 = window.setTimeout(() => {
      onExecuteCommand({
        title: cmd.resultTitle,
        detail: cmd.resultDetail,
        source: cmd.source,
      });
      setPhase('confirmed');

      const t2 = window.setTimeout(() => {
        onClose();
      }, 620);
      timersRef.current.push(t2);
    }, 1000);
    timersRef.current.push(t1);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'idle') {
        e.preventDefault();
        onClose();
        return;
      }

      if (phase !== 'idle') return;

      // Support Cmd/Ctrl + 1..4 instant execution matching displayed shortcuts
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (DESKTOP_COMMANDS[idx]) {
          e.preventDefault();
          triggerExecution(DESKTOP_COMMANDS[idx]);
          return;
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0
            ? (prev - 1 + filteredCommands.length) % filteredCommands.length
            : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          triggerExecution(filteredCommands[selectedIndex]);
        } else if (query.trim().length > 0) {
          triggerExecution({
            label: query.trim(),
            resultTitle: query.trim(),
            resultDetail: 'System • Executed via Command Bar',
            source: 'System',
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, filteredCommands, selectedIndex, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
          onClick={() => phase === 'idle' && onClose()}
          className="absolute inset-0 z-50 flex items-start justify-center bg-black/65 pt-[108px] backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Shift Command Bar"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl bg-[#111113] shadow-[0_24px_70px_rgba(0,0,0,0.8)] hairline-border"
          >
            <div className="shift-top-glint" aria-hidden="true" />
            {/* Input Row */}
            <div className="relative flex items-center gap-3 px-4 py-3.5 hairline-b">
              {phase === 'executing' ? (
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-[#FF2A36] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF2A36]" />
                </span>
              ) : phase === 'confirmed' ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#060607]"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </motion.span>
              ) : (
                <Terminal className="h-4 w-4 shrink-0 text-[#86868B]" strokeWidth={1.75} />
              )}

              {phase === 'idle' ? (
                <div className="relative flex flex-1 items-center">
                  {query.length === 0 && (
                    <span className="pointer-events-none absolute left-0 inline-block h-4 w-[1.5px] bg-[#F5F5F7] animate-caret" />
                  )}
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Execute a command directly..."
                    className="w-full bg-transparent pl-1.5 text-[14px] text-[#F5F5F7] placeholder-[#86868B] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-medium text-[#F5F5F7]">
                    {activeCommandLabel}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[11px] ${
                      phase === 'executing' ? 'text-[#FF2A36]' : 'text-[#F5F5F7]'
                    }`}
                  >
                    {phase === 'executing' ? 'Executing...' : 'Confirmed'}
                  </span>
                </div>
              )}

              <kbd className="rounded bg-[#1A1A1E] px-1.5 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border">
                ESC
              </kbd>

              {/* Shift Red 1-second execution progress bar */}
              {phase === 'executing' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.98, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FF2A36]"
                />
              )}
            </div>

            {/* Body */}
            {phase === 'idle' ? (
              <div className="p-2">
                <div className="px-2.5 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Direct Actions
                </div>

                {filteredCommands.length > 0 ? (
                  <div className="space-y-0.5">
                    {filteredCommands.map((cmd, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <button
                          key={cmd.id}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => triggerExecution(cmd)}
                          className={`pressable flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            active ? 'bg-[#1A1A1E]' : 'hover:bg-[#1A1A1E]/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-[#F5F5F7]">
                                {cmd.label}
                              </span>
                              <SourceBadge source={cmd.source} compact />
                            </div>
                            <p className="mt-0.5 truncate text-[11.5px] text-[#86868B]">
                              {cmd.detail}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-mono text-[11px] tabular-nums text-[#86868B]">
                              {cmd.shortcut}
                            </span>
                            {active && (
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#111113] text-[#F5F5F7] hairline-border">
                                <CornerDownLeft className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      triggerExecution({
                        label: query.trim(),
                        resultTitle: query.trim(),
                        resultDetail: 'System • Executed via Command Bar',
                        source: 'System',
                      })
                    }
                    className="pressable flex w-full items-center justify-between rounded-xl bg-[#1A1A1E] px-3 py-2.5 text-left"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#F5F5F7]">
                        Execute &ldquo;{query.trim()}&rdquo;
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#86868B]">
                        Run directly without chat thread
                      </p>
                    </div>
                    <CornerDownLeft className="h-3.5 w-3.5 text-[#F5F5F7]" />
                  </button>
                )}

                <div className="mt-2 flex items-center justify-between px-2.5 pb-1 pt-2 font-mono text-[10.5px] text-[#86868B] hairline-t">
                  <div className="flex items-center gap-3">
                    <span>↑↓ navigate</span>
                    <span>↵ execute</span>
                    <span>⌘1–4 instant</span>
                  </div>
                  <span>Zero chat. Pure execution.</span>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
                className="px-5 py-6"
              >
                <div className="flex items-center justify-between rounded-xl bg-[#1A1A1E] px-4 py-3.5 hairline-border">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                      {phase === 'executing' ? 'Shift Engine Pipeline' : 'Logged to Activity'}
                    </p>
                    <p className="mt-1 text-[13px] text-[#F5F5F7]">
                      {phase === 'executing'
                        ? 'Dispatching action across connected workspace...'
                        : confirmedDetail}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      phase === 'executing' ? 'text-[#FF2A36]' : 'text-[#30D158]'
                    }`}
                  >
                    {phase === 'executing' ? '1.0s' : 'OK'}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
