import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCode2,
  FileText,
  Mail,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { FocusResource, PriorityTask, formatSeconds } from '../../data/mockData';
import { SourceBadge } from '../SourceBadge';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO } from '../../lib/motion';

interface DesktopFocusProps {
  tasks: PriorityTask[];
  activeTaskId: string;
  secondsRemaining: number;
  totalSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onExtendTimer: () => void;
  onSelectTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onResetTasks: () => void;
  onExitFocus: () => void;
}

export const DesktopFocus: React.FC<DesktopFocusProps> = ({
  tasks,
  activeTaskId,
  secondsRemaining,
  totalSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onExtendTimer,
  onSelectTask,
  onCompleteTask,
  onResetTasks,
  onExitFocus,
}) => {
  const [openedResourceId, setOpenedResourceId] = useState<string | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0] ?? null;

  // Fallback if tasks list is unexpectedly empty
  if (!activeTask) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#060607] p-8 text-center">
        <ShieldCheck className="h-6 w-6 text-[#F5F5F7]" strokeWidth={1.6} />
        <p className="mt-3 text-[15px] font-medium text-[#F5F5F7]">No active focus task</p>
        <p className="mt-1 text-[12.5px] text-[#86868B]">
          Restore demo priorities or return to Triage.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onResetTasks}
            className="pressable rounded-lg bg-[#F5F5F7] px-3.5 py-2 text-[12px] font-semibold text-[#060607]"
          >
            Restore priorities
          </button>
          <button
            onClick={onExitFocus}
            className="pressable rounded-lg bg-[#111113] px-3.5 py-2 text-[12px] text-[#F5F5F7] hairline-border"
          >
            Back to Triage
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = tasks.findIndex((t) => t.id === activeTask.id);
  const nextPendingTask = tasks.find((t) => !t.completed && t.id !== activeTask.id);
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;
  const isTimerFinished = secondsRemaining === 0;

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + tasks.length) % tasks.length;
    onSelectTask(tasks[prevIdx].id);
    setOpenedResourceId(null);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % tasks.length;
    onSelectTask(tasks[nextIdx].id);
    setOpenedResourceId(null);
  };

  const getResourceIcon = (type: FocusResource['type']) => {
    if (type === 'diff') return FileCode2;
    if (type === 'thread') return Mail;
    return FileText;
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-[#060607]">
      {/* Minimal Focus Top Bar */}
      <div className="flex items-center justify-between px-7 py-4 hairline-b">
        <button
          onClick={onExitFocus}
          className="pressable inline-flex items-center gap-2 rounded-md px-2 py-1 text-[12px] text-[#86868B] hover:bg-[#111113] hover:text-[#F5F5F7]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Return to Priorities</span>
        </button>

        <div className="flex items-center gap-2 rounded-md bg-[#111113] px-2.5 py-1 hairline-border">
          <Shield className="h-3 w-3 text-[#86868B]" strokeWidth={1.75} />
          <span className="font-mono text-[10.5px] text-[#86868B]">
            DND active • Notifications batched
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            aria-label="Previous task"
            className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#111113] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] tabular-nums text-[#86868B]">
            {String(currentIndex + 1).padStart(2, '0')}/{String(tasks.length).padStart(2, '0')}
          </span>
          <button
            onClick={handleNext}
            aria-label="Next task"
            className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#111113] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Centered Single-Task Focus Stage */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-6">
        <motion.div
          key={activeTask.id}
          initial={{ opacity: 0, y: 6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          className="w-full max-w-[600px]"
        >
          <div className="shift-anim-card relative overflow-hidden rounded-2xl bg-[#111113] hairline-border">
            <div className="shift-top-glint shift-top-glint-red" aria-hidden="true" />
            <div className="px-7 pb-6 pt-7">
              <div className="flex items-center justify-between">
                <SourceBadge source={activeTask.source} refText={activeTask.sourceRef} />
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="relative flex h-2 w-2">
                    {isTimerRunning && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${activeTask.completed
                        ? 'bg-[#30D158]'
                        : isTimerRunning
                          ? 'bg-[#FF2A36]'
                          : 'bg-[#86868B]'
                        }`}
                    />
                  </span>
                  <span className={isTimerRunning || activeTask.completed ? 'text-[#F5F5F7]' : 'text-[#86868B]'}>
                    {activeTask.completed
                      ? 'COMPLETED'
                      : isTimerFinished
                        ? 'SESSION COMPLETE'
                        : isTimerRunning
                          ? 'SESSION ACTIVE'
                          : 'STANDBY'}
                  </span>
                </div>
              </div>

              <h1 className="mt-4 text-[21px] font-medium tracking-[-0.025em] text-[#F5F5F7]">
                {activeTask.title}
              </h1>
              <p className="mt-1.5 max-w-[58ch] text-[13px] leading-relaxed text-[#86868B]">
                {activeTask.summary}
              </p>

              {/* Precision Timer Readout */}
              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="font-mono text-[56px] font-medium leading-none tracking-[-0.04em] tabular-nums text-[#F5F5F7]">
                  {formatSeconds(secondsRemaining)}
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <button
                    onClick={onResetTimer}
                    title="Reset timer"
                    className="pressable flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1E] text-[#86868B] hairline-border hover:text-[#F5F5F7]"
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                  </button>

                  {isTimerFinished ? (
                    <button
                      onClick={onExtendTimer}
                      className="pressable flex h-10 items-center gap-1.5 rounded-lg bg-[#1A1A1E] px-3.5 text-[12.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#232329]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+5m</span>
                    </button>
                  ) : (
                    <button
                      onClick={onToggleTimer}
                      className="pressable flex h-10 items-center gap-2 rounded-lg bg-[#1A1A1E] px-4 text-[12.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#232329]"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="h-3.5 w-3.5" strokeWidth={2} />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Start</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeTask.completed ? (
                    nextPendingTask ? (
                      <button
                        onClick={() => onSelectTask(nextPendingTask.id)}
                        className="pressable flex h-10 items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-4 text-[12.5px] font-semibold text-[#060607] hover:opacity-90"
                      >
                        <span>Next Pending</span>
                      </button>
                    ) : (
                      <button
                        onClick={onResetTasks}
                        className="pressable flex h-10 items-center gap-1.5 rounded-lg bg-[#1A1A1E] px-4 text-[12.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#232329]"
                      >
                        <span>Restore Queue</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onCompleteTask(activeTask.id)}
                      className="pressable flex h-10 items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-4 text-[12.5px] font-semibold text-[#060607] hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.3} />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thin Shift Red Active Progress Bar */}
            <div className="relative h-[2px] w-full bg-white/[0.06]">
              <motion.div
                className="h-full bg-[#FF2A36]"
                animate={{ width: `${Math.max(4, progress)}%` }}
                transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
              />
            </div>

            {/* Exact 2 Contextual Links / Files */}
            <div className="bg-[#0B0B0D] px-7 py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                  Linked Context (2)
                </span>
                <span className="font-mono text-[10.5px] text-[#86868B]">
                  {openedResourceId ? '1 file pinned' : 'Click to pin'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {activeTask.resources.map((res) => {
                  const ResIcon = getResourceIcon(res.type);
                  const isOpened = openedResourceId === res.id;
                  return (
                    <button
                      key={res.id}
                      onClick={() => setOpenedResourceId(isOpened ? null : res.id)}
                      className={`shift-light-subtle pressable group flex items-start justify-between gap-2.5 overflow-hidden rounded-xl p-3.5 text-left hairline-border ${isOpened
                        ? 'bg-[#1A1A1E] border-white/20'
                        : 'bg-[#111113] hover:bg-[#1A1A1E]'
                        }`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1A1A1E] text-[#F5F5F7]/85 hairline-border">
                          <ResIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium text-[#F5F5F7]">
                            {res.label}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[10.5px] text-[#86868B]">
                            {isOpened ? 'Pinned in workspace' : res.meta}
                          </p>
                        </div>
                      </div>
                      <ExternalLink
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#86868B] transition-colors group-hover:text-[#F5F5F7]"
                        strokeWidth={1.75}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
