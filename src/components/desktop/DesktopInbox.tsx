import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  ArrowUpRight,
  Check,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { InboxSignal } from '../../data/mockData';
import { SourceBadge } from '../SourceBadge';
import { AnimatedCounter } from '../AnimatedCounter';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO, SPRING_INDICATOR } from '../../lib/motion';

interface DesktopInboxProps {
  signals: InboxSignal[];
  executingId: string | null;
  onExecuteSignal: (signalId: string) => void;
  onPromoteSignal: (signalId: string) => void;
  onArchiveSignal: (signalId: string) => void;
  onSweepNoise: () => void;
  onResetInbox: () => void;
}

type InboxFilter = 'all' | 'decision' | 'drafted' | 'noise';

export const DesktopInbox: React.FC<DesktopInboxProps> = ({
  signals,
  executingId,
  onExecuteSignal,
  onPromoteSignal,
  onArchiveSignal,
  onSweepNoise,
  onResetInbox,
}) => {
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(signals[0]?.id ?? '');

  const activeSignals = signals.filter((s) => !s.resolved);
  const filteredSignals =
    filter === 'all'
      ? activeSignals
      : activeSignals.filter((s) => s.category === filter);

  const selectedSignal =
    filteredSignals.find((s) => s.id === selectedId) ?? filteredSignals[0] ?? null;

  const totalCount = activeSignals.reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const noiseCount = activeSignals
    .filter((s) => s.category === 'noise')
    .reduce((acc, s) => acc + (s.weight ?? 1), 0);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      {/* Left Signal Feed */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-7 py-6">
        <div className="flex items-start justify-between gap-4 pb-5 hairline-b">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[#86868B]">
              <span>Signal Ingest</span>
              <span className="text-white/20">/</span>
              <span className="text-[#F5F5F7]">
                <AnimatedCounter value={totalCount} /> pending
              </span>
            </div>
            <h1 className="mt-1.5 text-[22px] font-medium tracking-[-0.025em] text-[#F5F5F7]">
              Inbox
            </h1>
            <p className="mt-1 max-w-[60ch] text-[13px] text-[#86868B]">
              Incoming threads distilled to facts and staged actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {noiseCount > 0 && (
              <button
                disabled={Boolean(executingId)}
                onClick={onSweepNoise}
                className="pressable flex items-center gap-1.5 rounded-lg bg-[#111113] px-3 py-2 text-[12px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#1A1A1E] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-[#86868B]" strokeWidth={1.75} />
                <span>Sweep Noise ({noiseCount})</span>
              </button>
            )}
            {activeSignals.length < signals.length && (
              <button
                onClick={onResetInbox}
                className="pressable flex items-center gap-1.5 rounded-lg bg-[#111113] px-2.5 py-2 font-mono text-[11px] text-[#86868B] hairline-border hover:text-[#F5F5F7]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips with smooth shared pill */}
        <div className="mt-4 flex items-center gap-1">
          {(
            [
              { id: 'all', label: 'All Signals' },
              { id: 'drafted', label: 'Draft Ready' },
              { id: 'decision', label: 'Needs Decision' },
              { id: 'noise', label: 'Low Signal' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`pressable relative rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                  active ? 'text-[#F5F5F7]' : 'text-[#86868B] hover:text-[#F5F5F7]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="inbox-filter-pill"
                    transition={SPRING_INDICATOR}
                    className="absolute inset-0 rounded-md bg-[#1A1A1E] hairline-border"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Signal List with clean filter-empty vs truly-empty fallbacks */}
        <div className="mt-4 flex-1 space-y-2">
          {filteredSignals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="flex flex-col items-center justify-center rounded-xl bg-[#111113] px-6 py-12 text-center hairline-border"
            >
              <ShieldCheck className="h-6 w-6 text-[#F5F5F7]" strokeWidth={1.6} />
              <p className="mt-3 text-[14px] font-medium text-[#F5F5F7]">
                {activeSignals.length > 0 ? 'No signals in this filter' : 'Inbox cleared'}
              </p>
              <p className="mt-1 text-[12.5px] text-[#86868B]">
                {activeSignals.length > 0
                  ? `${totalCount} remaining signals exist in other categories.`
                  : 'All incoming signals executed or archived.'}
              </p>
              {activeSignals.length > 0 ? (
                <button
                  onClick={() => setFilter('all')}
                  className="pressable mt-4 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border hover:bg-[#24242A]"
                >
                  View all ({totalCount})
                </button>
              ) : (
                <button
                  onClick={onResetInbox}
                  className="pressable mt-4 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border hover:bg-[#24242A]"
                >
                  Restore demo inbox
                </button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredSignals.map((sig, index) => {
                const isSelected = selectedSignal?.id === sig.id;
                const isRunning = executingId === sig.id;
                return (
                  <motion.div
                    key={sig.id}
                    layout="position"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.16, ease: EASE_OUT_CUBIC },
                    }}
                    transition={{
                      duration: 0.18,
                      delay: Math.min(index * 0.018, 0.07),
                      ease: EASE_OUT_EXPO,
                    }}
                    onClick={() => setSelectedId(sig.id)}
                    className={`shift-anim-card shift-light-subtle relative cursor-pointer overflow-hidden rounded-xl p-3.5 hairline-border transition-colors ${
                      isSelected
                        ? 'bg-[#1A1A1E] border-white/15'
                        : 'bg-[#111113] hover:bg-[#151518]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SourceBadge source={sig.source} refText={sig.sourceRef} compact />
                        <span className="text-[12px] font-medium text-[#86868B]">{sig.sender}</span>
                      </div>
                      <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">
                        {sig.timestamp}
                      </span>
                    </div>

                    <p className="mt-2 text-[13.5px] font-medium text-[#F5F5F7]">{sig.subject}</p>
                    <p className="mt-0.5 line-clamp-1 text-[12px] text-[#86868B]">{sig.preview}</p>

                    {isRunning && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.95, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FF2A36]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right Executive Brief Inspector */}
      <aside className="flex w-[330px] shrink-0 flex-col bg-[#09090B] hairline-l">
        <div className="flex items-center justify-between px-5 py-4 hairline-b">
          <div>
            <h2 className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#F5F5F7]">
              Distilled Brief
            </h2>
            <p className="mt-0.5 font-mono text-[10.5px] text-[#86868B]">Action inspector</p>
          </div>
          {selectedSignal && (
            <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">
              {selectedSignal.timestamp}
            </span>
          )}
        </div>

        {selectedSignal ? (
          <motion.div
            key={selectedSignal.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
            className="flex flex-1 flex-col justify-between overflow-y-auto p-5"
          >
            <div>
              <SourceBadge source={selectedSignal.source} refText={selectedSignal.sourceRef} />
              <h3 className="mt-3 text-[15px] font-medium leading-snug text-[#F5F5F7]">
                {selectedSignal.subject}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-[#86868B]">{selectedSignal.sender}</p>

              {/* Key Extracted Bullets */}
              <div className="mt-5 space-y-2.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Extracted Facts
                </div>
                {selectedSignal.bullets.map((b, i) => (
                  <div
                    key={i}
                    className="shift-light-subtle flex items-start gap-2.5 overflow-hidden rounded-lg bg-[#111113] p-3 hairline-border"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F5F5F7]" />
                    <p className="text-[12px] leading-relaxed text-[#F5F5F7]/90">{b}</p>
                  </div>
                ))}
              </div>

              {/* Staged Action Preview */}
              {selectedSignal.stagedAction && (
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                    Staged Execution
                  </div>
                  <div className="rounded-lg bg-[#1A1A1E] p-3 font-mono text-[11.5px] leading-relaxed text-[#F5F5F7] hairline-border">
                    {selectedSignal.stagedAction}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Execution Buttons */}
            <div className="mt-6 space-y-2 pt-4 hairline-t">
              <button
                disabled={Boolean(executingId)}
                onClick={() => onExecuteSignal(selectedSignal.id)}
                className="pressable flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5F5F7] py-2.5 text-[12.5px] font-semibold text-[#060607] hover:opacity-90 disabled:opacity-60"
              >
                {executingId === selectedSignal.id ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                    <span className="font-mono text-[11.5px]">Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Execute Staged Action</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={Boolean(executingId)}
                  onClick={() => onPromoteSignal(selectedSignal.id)}
                  className="pressable flex items-center justify-center gap-1.5 rounded-lg bg-[#111113] py-2 text-[11.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#1A1A1E] disabled:opacity-50"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#86868B]" />
                  <span>To Priorities</span>
                </button>
                <button
                  disabled={Boolean(executingId)}
                  onClick={() => onArchiveSignal(selectedSignal.id)}
                  className="pressable flex items-center justify-center gap-1.5 rounded-lg bg-[#111113] py-2 text-[11.5px] font-medium text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7] disabled:opacity-50"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <Check className="h-5 w-5 text-[#86868B]" />
            <p className="mt-2 text-[12.5px] text-[#86868B]">Select a signal to inspect.</p>
          </div>
        )}
      </aside>
    </div>
  );
};
