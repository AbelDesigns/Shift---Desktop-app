import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
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

interface AndroidFocusProps {
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
}

export const AndroidFocus: React.FC<AndroidFocusProps> = ({
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
}) => {
  const [pinnedResourceId, setPinnedResourceId] = useState<string | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0] ?? null;

  if (!activeTask) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 pb-20 text-center">
        <ShieldCheck className="h-6 w-6 text-[#F5F5F7]" strokeWidth={1.6} />
        <p className="mt-2.5 text-[14px] font-medium text-[#F5F5F7]">No active focus task</p>
        <button
          onClick={onResetTasks}
          className="pressable mt-3 rounded-lg bg-[#F5F5F7] px-3.5 py-2 text-[12px] font-semibold text-[#060607]"
        >
          Restore priorities
        </button>
      </div>
    );
  }

  const currentIndex = tasks.findIndex((t) => t.id === activeTask.id);
  const nextPendingTask = tasks.find((t) => !t.completed && t.id !== activeTask.id);
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;
  const isTimerFinished = secondsRemaining === 0;

  const getResourceIcon = (type: FocusResource['type']) => {
    if (type === 'diff') return FileCode2;
    if (type === 'thread') return Mail;
    return FileText;
  };

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 pb-28 pt-3">
      {/* Top Task Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10.5px]">
          <span className="relative flex h-2 w-2">
            {isTimerRunning && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                activeTask.completed
                  ? 'bg-[#30D158]'
                  : isTimerRunning
                    ? 'bg-[#FF2A36]'
                    : 'bg-[#86868B]'
              }`}
            />
          </span>
          <span
            className={
              isTimerRunning || activeTask.completed ? 'text-[#F5F5F7]' : 'text-[#86868B]'
            }
          >
            {activeTask.completed
              ? 'COMPLETED'
              : isTimerFinished
                ? 'SESSION DONE'
                : isTimerRunning
                  ? 'FOCUS ACTIVE'
                  : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={tasks.length <= 1}
            onClick={() => {
              onSelectTask(tasks[(currentIndex - 1 + tasks.length) % tasks.length].id);
              setPinnedResourceId(null);
            }}
            aria-label="Previous focus task"
            className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#111113] text-[#86868B] hairline-border active:bg-[#1A1A1E] disabled:opacity-35"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-1 font-mono text-[10px] tabular-nums text-[#86868B]">
            {currentIndex + 1}/{tasks.length}
          </span>
          <button
            disabled={tasks.length <= 1}
            onClick={() => {
              onSelectTask(tasks[(currentIndex + 1) % tasks.length].id);
              setPinnedResourceId(null);
            }}
            aria-label="Next focus task"
            className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#111113] text-[#86868B] hairline-border active:bg-[#1A1A1E] disabled:opacity-35"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Centered Large Timer Block */}
      <motion.div
        key={activeTask.id}
        initial={{ opacity: 0, y: 6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        className="shift-anim-card my-auto py-3 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <SourceBadge source={activeTask.source} refText={activeTask.sourceRef} compact />
          <span className="inline-flex items-center gap-1 rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border">
            <Shield className="h-2.5 w-2.5" />
            <span>DND</span>
          </span>
        </div>

        <h2 className="mt-3 px-2 text-[17px] font-medium leading-snug tracking-[-0.02em] text-[#F5F5F7]">
          {activeTask.title}
        </h2>

        {/* Large JetBrains Mono Countdown */}
        <div className="mt-6 font-mono text-[62px] font-medium leading-none tracking-[-0.04em] tabular-nums text-[#F5F5F7]">
          {formatSeconds(secondsRemaining)}
        </div>

        {/* Thin Shift Red Progress Bar */}
        <div className="mx-auto mt-5 h-[2px] w-full max-w-[260px] overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full bg-[#FF2A36]"
            animate={{ width: `${Math.max(4, progress)}%` }}
            transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
          />
        </div>

        {/* Thumb-Ergonomic Controls */}
        <div className="mt-6 flex items-center justify-center gap-2.5">
          <button
            onClick={onResetTimer}
            aria-label="Reset timer"
            className="pressable flex h-11 w-11 items-center justify-center rounded-xl bg-[#111113] text-[#86868B] hairline-border"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {isTimerFinished ? (
            <button
              onClick={onExtendTimer}
              className="pressable flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1A1A1E] text-[13px] font-medium text-[#F5F5F7] hairline-border"
            >
              <Plus className="h-4 w-4" />
              <span>+5m</span>
            </button>
          ) : (
            <button
              onClick={onToggleTimer}
              className="pressable flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A1A1E] text-[13px] font-medium text-[#F5F5F7] hairline-border"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="h-4 w-4" strokeWidth={2} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start</span>
                </>
              )}
            </button>
          )}

          {activeTask.completed ? (
            nextPendingTask ? (
              <button
                onClick={() => onSelectTask(nextPendingTask.id)}
                className="pressable flex h-11 flex-1 items-center justify-center rounded-xl bg-[#F5F5F7] text-[13px] font-semibold text-[#060607]"
              >
                <span>Next Task</span>
              </button>
            ) : (
              <button
                onClick={onResetTasks}
                className="pressable flex h-11 flex-1 items-center justify-center rounded-xl bg-[#1A1A1E] text-[12.5px] font-medium text-[#F5F5F7] hairline-border"
              >
                <span>Restore</span>
              </button>
            )
          ) : (
            <button
              onClick={() => onCompleteTask(activeTask.id)}
              className="pressable flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#F5F5F7] text-[13px] font-semibold text-[#060607]"
            >
              <Check className="h-4 w-4" strokeWidth={2.4} />
              <span>Complete</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Interactive 2 Required Files */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
          <span>Linked Context (2)</span>
          <span>{pinnedResourceId ? '1 pinned' : 'Tap to pin'}</span>
        </div>
        {activeTask.resources.map((res) => {
          const ResIcon = getResourceIcon(res.type);
          const isPinned = pinnedResourceId === res.id;
          return (
            <button
              key={res.id}
              onClick={() => setPinnedResourceId(isPinned ? null : res.id)}
              className={`shift-anim-card shift-light-subtle pressable flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-left hairline-border ${
                isPinned ? 'bg-[#1A1A1E] border-white/20' : 'bg-[#111113]'
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1A1A1E] text-[#F5F5F7]/85 hairline-border">
                <ResIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-[#F5F5F7]">{res.label}</p>
                <p className="truncate font-mono text-[10px] text-[#86868B]">
                  {isPinned ? 'Pinned for session' : res.meta}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#86868B]" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
