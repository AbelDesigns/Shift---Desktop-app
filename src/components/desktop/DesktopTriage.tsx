import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Crosshair,
  Play,
  RotateCcw,
  ArrowUpRight,
  Command,
  ShieldCheck,
} from 'lucide-react';
import { BackgroundActivityItem, PriorityTask } from '../../data/mockData';
import { SourceBadge } from '../SourceBadge';
import { AnimatedCounter } from '../AnimatedCounter';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO } from '../../lib/motion';

interface DesktopTriageProps {
  tasks: PriorityTask[];
  activities: BackgroundActivityItem[];
  executingTaskId: string | null;
  isEngineExecuting: boolean;
  onExecuteTask: (taskId: string) => void;
  onCompleteTaskInstant: (taskId: string) => void;
  onFocusTask: (taskId: string) => void;
  onResetTasks: () => void;
  onOpenCommandBar: () => void;
}

export const DesktopTriage: React.FC<DesktopTriageProps> = ({
  tasks,
  activities,
  executingTaskId,
  isEngineExecuting,
  onExecuteTask,
  onCompleteTaskInstant,
  onFocusTask,
  onResetTasks,
  onOpenCommandBar,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      {/* Main Triage Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-7 py-6">
        {/* Technical Header */}
        <div className="flex items-start justify-between gap-4 pb-6 hairline-b">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#86868B]">
                Thu, Nov 20
              </span>
              <span className="text-white/20">/</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                <span className="relative flex h-1.5 w-1.5">
                  {isEngineExecuting && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-80" />
                  )}
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isEngineExecuting ? 'bg-[#FF2A36]' : 'bg-[#30D158]'
                      }`}
                  />
                </span>
                <span className={isEngineExecuting ? 'text-[#F5F5F7]' : 'text-[#86868B]'}>
                  {isEngineExecuting ? 'Shift Engine • Executing...' : 'Shift Engine • Synced 2m ago'}
                </span>
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-medium tracking-[-0.025em] text-[#F5F5F7]">
              Today&apos;s Triage
            </h1>
            <p className="mt-1 max-w-[60ch] text-[13px] text-[#86868B]">
              {pendingTasks.length > 0
                ? `${pendingTasks.length} critical ${pendingTasks.length === 1 ? 'action' : 'actions'
                } extracted from 34 incoming signals.`
                : 'Queue clear. All prioritized items completed.'}
            </p>
          </div>

          <button
            onClick={onOpenCommandBar}
            className="pressable flex shrink-0 items-center gap-2 rounded-lg bg-[#111113] px-3 py-2 text-[12px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#1A1A1E]"
          >
            <Command className="h-3.5 w-3.5 text-[#86868B]" strokeWidth={1.75} />
            <span>Command</span>
            <kbd className="ml-0.5 rounded bg-[#1A1A1E] px-1.5 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Auto-Triaged Priorities */}
        <div className="mt-6 flex-1">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#86868B]">
                Auto-Triaged Priorities
              </h2>
              <span className="rounded bg-[#111113] px-1.5 py-0.5 text-[10.5px] text-[#F5F5F7] hairline-border">
                <AnimatedCounter value={pendingTasks.length} pad />
              </span>
            </div>

            {completedTasks.length > 0 && (
              <button
                onClick={onResetTasks}
                className="pressable inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-[#86868B] hover:bg-[#111113] hover:text-[#F5F5F7]"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                <span>Restore queue</span>
              </button>
            )}
          </div>

          {pendingTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="flex flex-col items-center justify-center rounded-xl bg-[#111113] px-6 py-12 text-center hairline-border"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1E] hairline-border">
                <ShieldCheck className="h-5 w-5 text-[#F5F5F7]" strokeWidth={1.6} />
              </div>
              <p className="mt-3.5 text-[14px] font-medium text-[#F5F5F7]">
                All priorities complete
              </p>
              <p className="mt-1 max-w-xs text-[12.5px] text-[#86868B]">
                Monitoring Gmail, Linear, and Calendar for the next critical signal.
              </p>
              <button
                onClick={onResetTasks}
                className="pressable mt-4 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border hover:bg-[#232329]"
              >
                Restore demo queue
              </button>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {pendingTasks.map((task, index) => {
                  const isRunning = executingTaskId === task.id;
                  return (
                    <motion.div
                      key={task.id}
                      layout="position"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.98,
                        y: -4,
                        transition: { duration: 0.16, ease: EASE_OUT_CUBIC },
                      }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index * 0.02, 0.08),
                        ease: EASE_OUT_EXPO,
                      }}
                      className={`shift-anim-card shift-light-subtle group relative overflow-hidden rounded-xl bg-[#111113] p-4 hairline-border transition-colors ${
                        isRunning ? 'bg-[#1A1A1E] border-white/15' : 'hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <SourceBadge source={task.source} refText={task.sourceRef} />
                            <span className="font-mono text-[10.5px] font-medium text-[#86868B]">
                              {task.priority}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="font-mono text-[11px] tabular-nums text-[#86868B]">
                              {task.meta}
                            </span>
                          </div>

                          <h3 className="mt-2.5 text-[14px] font-medium tracking-[-0.01em] text-[#F5F5F7]">
                            {task.title}
                          </h3>
                          <p className="mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-[#86868B]">
                            {task.summary}
                          </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                          <button
                            disabled={Boolean(executingTaskId)}
                            onClick={() => onFocusTask(task.id)}
                            title="Open in Focus Mode"
                            className="pressable flex items-center gap-1.5 rounded-md bg-[#1A1A1E] px-2.5 py-1.5 text-[11.5px] font-medium text-[#86868B] hairline-border hover:text-[#F5F5F7] disabled:opacity-40"
                          >
                            <Crosshair className="h-3.5 w-3.5" strokeWidth={1.75} />
                            <span>Focus</span>
                          </button>

                          {task.actionLabel === 'Execute' ? (
                            <button
                              disabled={Boolean(executingTaskId)}
                              onClick={() => onExecuteTask(task.id)}
                              className="pressable flex min-w-[92px] items-center justify-center gap-1.5 rounded-md bg-[#F5F5F7] px-3 py-1.5 text-[11.5px] font-semibold text-[#060607] hover:opacity-90 disabled:opacity-70"
                            >
                              {isRunning ? (
                                <>
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                                  <span className="font-mono text-[11px]">Running</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 fill-current" />
                                  <span>Execute</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled={Boolean(executingTaskId)}
                              onClick={() => onCompleteTaskInstant(task.id)}
                              className="pressable flex min-w-[92px] items-center justify-center gap-1.5 rounded-md bg-[#1A1A1E] px-3 py-1.5 text-[11.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#24242A] disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>Done</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Surgical Shift Red Progress Sweep on Execute */}
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
            </div>
          )}

          {/* Completed Strip */}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                Completed ({completedTasks.length})
              </div>
              <div className="space-y-1.5">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
                    className="flex items-center justify-between rounded-lg bg-[#0A0A0C] px-3.5 py-2 hairline-border"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#1A1A1E] text-[#86868B]">
                        <Check className="h-2.5 w-2.5" strokeWidth={2.2} />
                      </span>
                      <span className="truncate text-[12px] text-[#86868B] line-through">
                        {task.title}
                      </span>
                    </div>
                    <span className="ml-3 shrink-0 font-mono text-[10.5px] text-[#86868B]">
                      {task.source}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Background Activity */}
      <aside className="flex w-[320px] shrink-0 flex-col bg-[#09090B] hairline-l">
        <div className="flex items-center justify-between px-5 py-4 hairline-b">
          <div>
            <h2 className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#F5F5F7]">
              Background Activity
            </h2>
            <p className="mt-0.5 font-mono text-[10.5px] text-[#86868B]">
              Resolved autonomously
            </p>
          </div>
          <span className="rounded bg-[#111113] px-2 py-0.5 text-[11px] text-[#86868B] hairline-border">
            <AnimatedCounter value={activities.length} />
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="relative space-y-2.5">
            <AnimatePresence initial={false}>
              {activities.map((item) => (
                <motion.div
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  className="shift-anim-card shift-light-subtle overflow-hidden rounded-xl bg-[#111113] p-3 hairline-border"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${item.isNew ? 'bg-[#FF2A36]' : 'bg-[#86868B]'
                          }`}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-[#86868B]">
                        {item.source}
                      </span>
                    </div>
                    <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-[#F5F5F7]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-[#86868B]">{item.detail}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Telemetry */}
        <div className="flex items-center justify-between px-5 py-3 hairline-t">
          <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">
            41m saved today
          </span>
          <button
            onClick={onOpenCommandBar}
            className="pressable inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] text-[#86868B] hover:text-[#F5F5F7]"
          >
            <span>Run action</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </aside>
    </div>
  );
};
