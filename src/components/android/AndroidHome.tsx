import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  ArrowUpRight,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  Crosshair,
  Inbox,
  Layers,
  Lock,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersVertical,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import {
  AutomationRule,
  BackgroundActivityItem,
  CalendarEventItem,
  InboxSignal,
  OTHER_DAY_CALENDAR_EVENTS,
  PriorityTask,
} from '../../data/mockData';
import { ShiftLogo } from '../ShiftLogo';
import { SourceBadge } from '../SourceBadge';
import { AnimatedCounter } from '../AnimatedCounter';
import { ShiftCalendarGrid } from '../ShiftCalendarGrid';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO, SPRING_INDICATOR, SPRING_TOGGLE } from '../../lib/motion';
import { animateStaggerBoxes, useGSAP } from '../../lib/gsap';

type MobileBriefSection = 'priorities' | 'inbox' | 'calendar' | 'rules';

interface AndroidHomeProps {
  tasks: PriorityTask[];
  activities: BackgroundActivityItem[];
  inboxSignals: InboxSignal[];
  calendarEvents: CalendarEventItem[];
  automations: AutomationRule[];
  executingTaskId: string | null;
  executingSignalId: string | null;
  executingEventId: string | null;
  executingRuleId: string | null;
  isEngineExecuting: boolean;
  canAddFocusBlock: boolean;
  hasScheduleChanges: boolean;
  onExecuteTask: (taskId: string) => void;
  onCompleteTaskInstant: (taskId: string) => void;
  onFocusTask: (taskId: string) => void;
  onResetTasks: () => void;
  onExecuteSignal: (signalId: string) => void;
  onPromoteSignal: (signalId: string) => void;
  onArchiveSignal: (signalId: string) => void;
  onSweepNoise: () => void;
  onResetInbox: () => void;
  onDeclineEvent: (eventId: string) => void;
  onRescheduleEvent: (eventId: string) => void;
  onAddFocusBlock: () => void;
  onResetCalendar: () => void;
  onToggleRule: (ruleId: string) => void;
  onRunRule: (ruleId: string) => void;
  onCreateRule: (rule: Omit<AutomationRule, 'id' | 'runsThisWeek' | 'lastRun'>) => void;
}

export const AndroidHome: React.FC<AndroidHomeProps> = ({
  tasks,
  activities,
  inboxSignals,
  calendarEvents,
  automations,
  executingTaskId,
  executingSignalId,
  executingEventId,
  executingRuleId,
  isEngineExecuting,
  canAddFocusBlock,
  hasScheduleChanges,
  onExecuteTask,
  onCompleteTaskInstant,
  onFocusTask,
  onResetTasks,
  onExecuteSignal,
  onPromoteSignal,
  onArchiveSignal,
  onSweepNoise,
  onResetInbox,
  onDeclineEvent,
  onRescheduleEvent,
  onAddFocusBlock,
  onResetCalendar,
  onToggleRule,
  onRunRule,
  onCreateRule,
}) => {
  const [section, setSection] = useState<MobileBriefSection>('priorities');
  const sectionContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      animateStaggerBoxes(sectionContainerRef.current, '.shift-anim-card', {
        y: 12,
        duration: 0.36,
        stagger: 0.045,
      });
    },
    { dependencies: [section], scope: sectionContainerRef },
  );
  const [showAllPriorities, setShowAllPriorities] = useState(false);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [selectedCalDay, setSelectedCalDay] = useState<number>(20);
  const [expandedEventId, setExpandedEventId] = useState<string | null>('cal-2');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // Mobile quick rule creator
  const [showRuleCreator, setShowRuleCreator] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSource, setNewRuleSource] = useState<AutomationRule['source']>('Gmail');
  const [ruleNameError, setRuleNameError] = useState(false);

  const allPendingTasks = tasks.filter((t) => !t.completed);
  const pendingTasks = showAllPriorities ? allPendingTasks : allPendingTasks.slice(0, 3);
  const hiddenPendingCount = Math.max(0, allPendingTasks.length - pendingTasks.length);
  const allPendingCount = allPendingTasks.length;
  const activeSignals = inboxSignals.filter((s) => !s.resolved);
  const inboxTotal = activeSignals.reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const noiseCount = activeSignals
    .filter((s) => s.category === 'noise')
    .reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const scheduledCount = calendarEvents.filter((e) => e.status === 'scheduled').length;
  const activeRulesCount = automations.filter((r) => r.enabled).length;

  const handleCreateMobileRule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRuleName.trim();
    if (!trimmed) {
      setRuleNameError(true);
      return;
    }
    setRuleNameError(false);
    onCreateRule({
      name: trimmed,
      trigger: `IF ${newRuleSource} matches priority filter`,
      action: 'THEN execute silently & log brief',
      source: newRuleSource,
      enabled: true,
      testLogTitle: `Ran rule: ${trimmed}`,
      testLogDetail: `${newRuleSource} • Executed from Android`,
    });
    setNewRuleName('');
    setShowRuleCreator(false);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-28 pt-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111113] hairline-border">
            <ShiftLogo size={14} />
          </div>
          <div>
            <h1 className="text-[16px] font-medium leading-tight tracking-[-0.02em] text-[#F5F5F7]">
              Daily Brief
            </h1>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-[#86868B]">
              <span className="relative flex h-1.5 w-1.5">
                {isEngineExecuting && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    isEngineExecuting ? 'bg-[#FF2A36]' : 'bg-[#30D158]'
                  }`}
                />
              </span>
              <span>{isEngineExecuting ? 'Executing...' : 'Synced 2m ago'}</span>
            </div>
          </div>
        </div>

        <span className="rounded-md bg-[#111113] px-2 py-1 font-mono text-[10.5px] tabular-nums text-[#86868B] hairline-border">
          THU 20
        </span>
      </div>

      {/* Workspace Strip with icons + smooth spring pill */}
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-[#111113] p-1 hairline-border">
        {(
          [
            { id: 'priorities', label: 'Priorities', icon: Layers, count: allPendingCount },
            { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxTotal },
            { id: 'calendar', label: 'Cal', icon: Calendar, count: scheduledCount },
            { id: 'rules', label: 'Rules', icon: SlidersVertical, count: activeRulesCount },
          ] as const
        ).map((tab) => {
          const active = section === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`pressable relative flex flex-col items-center justify-center rounded-lg py-1.5 text-center transition-colors ${
                active ? 'text-[#F5F5F7]' : 'text-[#86868B] active:text-[#F5F5F7]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="android-brief-pill"
                  transition={SPRING_INDICATOR}
                  className="absolute inset-0 rounded-lg bg-[#1A1A1E] hairline-border"
                />
              )}
              <div className="relative z-10 flex items-center gap-1">
                <Icon className="h-3 w-3 shrink-0" strokeWidth={active ? 2 : 1.75} />
                <AnimatedCounter value={tab.count} className="text-[10px] text-[#86868B]" />
              </div>
              <div className="relative z-10 mt-0.5 text-[10px] font-medium leading-tight">
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Section Content (direct keyed mount — never hangs) */}
      <div ref={sectionContainerRef}>
      <motion.div
        key={`mob-section-${section}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
      >
        {/* === 1. PRIORITIES === */}
        {section === 'priorities' && (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                Top Priorities ({pendingTasks.length})
              </span>
              {allPendingCount < tasks.length && (
                <button
                  onClick={onResetTasks}
                  className="pressable inline-flex items-center gap-1 font-mono text-[10px] text-[#86868B] active:text-[#F5F5F7]"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-[#111113] px-4 py-8 text-center hairline-border">
                <ShieldCheck className="h-5 w-5 text-[#F5F5F7]" strokeWidth={1.6} />
                <p className="mt-2.5 text-[13px] font-medium text-[#F5F5F7]">
                  All priorities complete
                </p>
                <p className="mt-1 text-[11.5px] text-[#86868B]">
                  Monitoring for the next critical signal.
                </p>
                <button
                  onClick={onResetTasks}
                  className="pressable mt-3 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[10.5px] text-[#F5F5F7] hairline-border"
                >
                  Restore priorities
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {pendingTasks.map((task) => {
                    const isRunning = executingTaskId === task.id;
                    return (
                      <motion.div
                        key={task.id}
                        layout="position"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.97,
                          transition: { duration: 0.16, ease: EASE_OUT_CUBIC },
                        }}
                        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                        className={`shift-anim-card shift-light-subtle relative overflow-hidden rounded-xl bg-[#111113] p-3.5 hairline-border ${
                          isRunning ? 'bg-[#1A1A1E] border-white/15' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <SourceBadge source={task.source} refText={task.sourceRef} compact />
                          <span className="font-mono text-[10px] tabular-nums text-[#86868B]">
                            {task.meta}
                          </span>
                        </div>

                        <h2 className="mt-2 text-[13.5px] font-medium leading-snug tracking-[-0.01em] text-[#F5F5F7]">
                          {task.title}
                        </h2>

                        <div className="mt-3 flex items-center gap-2">
                          {task.actionLabel === 'Execute' ? (
                            <button
                              disabled={Boolean(executingTaskId)}
                              onClick={() => onExecuteTask(task.id)}
                              className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#F5F5F7] py-1.5 text-[11.5px] font-semibold text-[#060607] disabled:opacity-70"
                            >
                              {isRunning ? (
                                <>
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                                  <span className="font-mono text-[10.5px]">Executing...</span>
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
                              className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1E] py-1.5 text-[11.5px] font-medium text-[#F5F5F7] hairline-border"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>Done</span>
                            </button>
                          )}

                          <button
                            disabled={Boolean(executingTaskId)}
                            onClick={() => onFocusTask(task.id)}
                            className="pressable flex items-center justify-center gap-1 rounded-lg bg-[#1A1A1E] px-3 py-1.5 text-[11.5px] font-medium text-[#86868B] hairline-border active:text-[#F5F5F7]"
                          >
                            <Crosshair className="h-3.5 w-3.5" strokeWidth={1.75} />
                            <span>Focus</span>
                          </button>
                        </div>

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

                {/* Overflow fallback toggle when > 3 priorities exist */}
                {(hiddenPendingCount > 0 || (showAllPriorities && allPendingCount > 3)) && (
                  <button
                    type="button"
                    onClick={() => setShowAllPriorities((p) => !p)}
                    className="pressable w-full rounded-xl bg-[#0C0C0E] py-2 font-mono text-[10.5px] text-[#86868B] hairline-border hover:text-[#F5F5F7]"
                  >
                    {showAllPriorities
                      ? 'Collapse to top 3'
                      : `Show +${hiddenPendingCount} more queued`}
                  </button>
                )}
              </div>
            )}

            {/* Collapsible Block: Resolved by Shift (N) */}
            <div className="mt-4 overflow-hidden rounded-xl bg-[#111113] hairline-border">
              <button
                onClick={() => setResolvedExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-3.5 py-3 text-left transition-colors active:bg-[#1A1A1E]"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                  <span className="text-[12.5px] font-medium text-[#F5F5F7]">
                    Resolved by Shift{' '}
                    <span className="font-mono text-[11.5px] tabular-nums text-[#86868B]">
                      ({activities.length})
                    </span>
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: resolvedExpanded ? 180 : 0 }}
                  transition={{ duration: 0.18, ease: EASE_OUT_CUBIC }}
                  className="text-[#86868B]"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {resolvedExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden hairline-t"
                  >
                    {activities.length === 0 ? (
                      <div className="px-3.5 py-4 text-center font-mono text-[11px] text-[#86868B]">
                        No autonomous resolutions yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.06] px-3.5">
                        {activities.slice(0, 5).map((item) => (
                          <div key={item.id} className="py-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-[12px] font-medium text-[#F5F5F7]">
                                {item.title}
                              </span>
                              <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#86868B]">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-[#86868B]">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* === 2. INBOX === */}
        {section === 'inbox' && (
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                Signal Queue ({inboxTotal})
              </span>
              <div className="flex items-center gap-1.5">
                {noiseCount > 0 && (
                  <button
                    disabled={Boolean(executingSignalId)}
                    onClick={onSweepNoise}
                    className="pressable inline-flex items-center gap-1 rounded-md bg-[#111113] px-2 py-1 font-mono text-[10px] text-[#F5F5F7] hairline-border disabled:opacity-50"
                  >
                    <Trash2 className="h-2.5 w-2.5 text-[#86868B]" />
                    <span>Sweep ({noiseCount})</span>
                  </button>
                )}
                {activeSignals.length < inboxSignals.length && (
                  <button
                    onClick={onResetInbox}
                    className="pressable inline-flex items-center gap-1 font-mono text-[10px] text-[#86868B]"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {activeSignals.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl bg-[#111113] p-6 text-center hairline-border">
                <ShieldCheck className="h-5 w-5 text-[#F5F5F7]" strokeWidth={1.6} />
                <p className="mt-2 text-[13px] font-medium text-[#F5F5F7]">Inbox cleared</p>
                <p className="mt-1 text-[11.5px] text-[#86868B]">No pending signals.</p>
                <button
                  onClick={onResetInbox}
                  className="pressable mt-3 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[10.5px] text-[#F5F5F7] hairline-border"
                >
                  Restore demo inbox
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {activeSignals.map((sig) => {
                    const isRunning = executingSignalId === sig.id;
                    const isExpanded = expandedSignalId === sig.id;
                    return (
                      <motion.div
                        key={sig.id}
                        layout="position"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.97,
                          transition: { duration: 0.16, ease: EASE_OUT_CUBIC },
                        }}
                        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                        className={`shift-anim-card shift-light-subtle relative overflow-hidden rounded-xl bg-[#111113] p-3.5 hairline-border ${
                          isRunning ? 'bg-[#1A1A1E] border-white/15' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedSignalId(isExpanded ? null : sig.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <SourceBadge source={sig.source} refText={sig.sourceRef} compact />
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] tabular-nums text-[#86868B]">
                                {sig.timestamp}
                              </span>
                              <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.16 }}
                                className="text-[#86868B]"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </motion.span>
                            </div>
                          </div>
                          <p className="mt-2 text-[13px] font-medium leading-snug text-[#F5F5F7]">
                            {sig.subject}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[11.5px] text-[#86868B]">
                            {sig.preview}
                          </p>
                        </button>

                        {/* Expandable Distilled Brief */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2.5 space-y-1.5 border-t border-white/[0.06] pt-2.5">
                                {sig.bullets.map((b, i) => (
                                  <div key={i} className="flex items-start gap-2 text-[11px] text-[#F5F5F7]/85">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F5F5F7]" />
                                    <span>{b}</span>
                                  </div>
                                ))}
                                {sig.stagedAction && (
                                  <div className="mt-2 rounded-lg bg-[#0A0A0C] p-2 font-mono text-[10px] text-[#F5F5F7]/90 hairline-border">
                                    {sig.stagedAction}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-3 flex items-center gap-1.5">
                          <button
                            disabled={Boolean(executingSignalId)}
                            onClick={() => onExecuteSignal(sig.id)}
                            className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#F5F5F7] py-1.5 text-[11px] font-semibold text-[#060607] disabled:opacity-65"
                          >
                            {isRunning ? (
                              <>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                                <span className="font-mono text-[10px]">Executing...</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 fill-current" />
                                <span>Execute</span>
                              </>
                            )}
                          </button>
                          <button
                            disabled={Boolean(executingSignalId)}
                            onClick={() => onPromoteSignal(sig.id)}
                            title="Move to Priorities"
                            className="pressable flex items-center justify-center gap-1 rounded-lg bg-[#1A1A1E] px-2.5 py-1.5 text-[11px] text-[#F5F5F7] hairline-border"
                          >
                            <ArrowUpRight className="h-3 w-3 text-[#86868B]" />
                            <span>P1</span>
                          </button>
                          <button
                            disabled={Boolean(executingSignalId)}
                            onClick={() => onArchiveSignal(sig.id)}
                            aria-label="Archive signal"
                            className="pressable flex items-center justify-center rounded-lg bg-[#1A1A1E] px-2.5 py-1.5 text-[#86868B] hairline-border"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </div>

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
          </div>
        )}

        {/* === 3. CALENDAR (Tactile Month/Week Grid + Split-Column Agenda) === */}
        {section === 'calendar' && (
          <div className="space-y-3">
            {/* Tactile Rounded-Square Month/Week Calendar Grid */}
            <ShiftCalendarGrid
              selectedDay={selectedCalDay}
              onSelectDay={(day) => {
                setSelectedCalDay(day);
                const list =
                  day === 20 ? calendarEvents : (OTHER_DAY_CALENDAR_EVENTS[day] ?? []);
                const firstActive = list.find((e) => e.status === 'scheduled') ?? list[0];
                setExpandedEventId(firstActive?.id ?? null);
              }}
              compact
            />

            {/* Day Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-[#F5F5F7]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    selectedCalDay === 20 ? 'bg-[#FF2A36]' : 'bg-[#86868B]'
                  }`}
                />
                <span>{selectedCalDay === 20 ? 'THU 20 • NOW 09:42' : `NOV ${selectedCalDay}`}</span>
              </div>

              {selectedCalDay === 20 && (
                <div className="flex items-center gap-1.5">
                  {hasScheduleChanges && (
                    <button
                      onClick={onResetCalendar}
                      className="pressable inline-flex items-center gap-1 rounded-md bg-[#111113] px-2 py-1 font-mono text-[10px] text-[#86868B] hairline-border"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    disabled={Boolean(executingEventId) || !canAddFocusBlock}
                    onClick={onAddFocusBlock}
                    className="pressable inline-flex items-center gap-1 rounded-md bg-[#F5F5F7] px-2.5 py-1 text-[10.5px] font-semibold text-[#060607] disabled:opacity-45"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.2} />
                    <span>{canAddFocusBlock ? 'Lock Focus' : 'Shielded'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Split-Column Agenda Rows (TIME | Vertical Hairline | Event Card) */}
            {(() => {
              const dayEvents =
                selectedCalDay === 20
                  ? calendarEvents
                  : (OTHER_DAY_CALENDAR_EVENTS[selectedCalDay] ?? []);

              if (dayEvents.length === 0) {
                return (
                  <div className="flex flex-col items-center rounded-2xl bg-[#111113] px-4 py-7 text-center hairline-border">
                    <Lock className="h-4 w-4 text-[#86868B]" strokeWidth={1.7} />
                    <p className="mt-2 text-[12.5px] font-medium text-[#F5F5F7]">
                      Open execution day
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#86868B]">
                      No meetings scheduled on Nov {selectedCalDay}.
                    </p>
                    {selectedCalDay !== 20 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCalDay(20);
                          setExpandedEventId('cal-2');
                        }}
                        className="pressable mt-3 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[10.5px] text-[#F5F5F7] hairline-border"
                      >
                        Return to Today (Nov 20)
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {dayEvents.map((ev) => {
                    const isExpanded = expandedEventId === ev.id;
                    const isRunning = executingEventId === ev.id;
                    const isDeclined = ev.status === 'declined';
                    const isProtected = ev.status === 'protected';

                    return (
                      <motion.div
                        key={ev.id}
                        layout="position"
                        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                        className={`relative overflow-hidden rounded-2xl transition-colors ${
                          isDeclined
                            ? 'bg-[#0A0A0C] opacity-60 hairline-border'
                            : isExpanded
                              ? 'bg-[#1A1A1E] ring-1 ring-inset ring-white/20'
                              : 'bg-[#111113] hairline-border'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                          className="flex w-full items-stretch gap-3 px-3.5 py-3 text-left"
                        >
                          {/* Left Fixed Time Column */}
                          <div className="flex w-[56px] shrink-0 flex-col justify-center font-mono tabular-nums">
                            <span
                              className={`text-[11.5px] font-medium ${
                                isExpanded ? 'text-[#F5F5F7]' : 'text-[#86868B]'
                              }`}
                            >
                              {ev.startTime}
                            </span>
                            {isExpanded && (
                              <span className="mt-0.5 text-[10px] text-[#86868B]">
                                – {ev.endTime}
                              </span>
                            )}
                          </div>

                          {/* Crisp Vertical Divider */}
                          <div
                            className={`w-px shrink-0 ${
                              isExpanded ? 'bg-white/20' : 'bg-white/[0.08]'
                            }`}
                          />

                          {/* Right Content Column */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-[13px] font-medium ${
                                  isDeclined ? 'text-[#86868B] line-through' : 'text-[#F5F5F7]'
                                }`}
                              >
                                {ev.title}
                              </p>
                              {isProtected && (
                                <Lock className="h-3 w-3 shrink-0 text-[#86868B]" />
                              )}
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1.5 space-y-1">
                                    {ev.briefBullets.map((note, idx) => (
                                      <p
                                        key={idx}
                                        className="text-[11px] leading-snug text-[#86868B]"
                                      >
                                        {note}
                                      </p>
                                    ))}
                                    <p className="pt-1 font-mono text-[10px] text-[#F5F5F7]/75">
                                      {ev.location}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </button>

                        {isExpanded && selectedCalDay === 20 && ev.status === 'scheduled' && (
                          <div className="grid grid-cols-2 gap-1.5 bg-[#141418] px-3.5 py-2 hairline-t">
                            <button
                              disabled={Boolean(executingEventId)}
                              onClick={() => onRescheduleEvent(ev.id)}
                              className="pressable flex items-center justify-center gap-1 rounded-lg bg-[#1A1A1E] py-1.5 text-[11px] font-medium text-[#F5F5F7] hairline-border disabled:opacity-50"
                            >
                              <CalendarClock className="h-3 w-3" />
                              <span>Optimize</span>
                            </button>
                            <button
                              disabled={Boolean(executingEventId)}
                              onClick={() => onDeclineEvent(ev.id)}
                              className="pressable flex items-center justify-center gap-1 rounded-lg bg-[#111113] py-1.5 text-[11px] font-medium text-[#86868B] hairline-border disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}

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
                </div>
              );
            })()}
          </div>
        )}

        {/* === 4. AUTOMATIONS === */}
        {section === 'rules' && (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                Active Rules ({activeRulesCount}/{automations.length})
              </span>
              <button
                onClick={() => {
                  setShowRuleCreator((p) => !p);
                  setRuleNameError(false);
                }}
                className="pressable inline-flex items-center gap-1 rounded-md bg-[#F5F5F7] px-2.5 py-1 text-[10.5px] font-semibold text-[#060607]"
              >
                {showRuleCreator ? (
                  <>
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" strokeWidth={2.2} />
                    <span>New Rule</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showRuleCreator && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                  onSubmit={handleCreateMobileRule}
                  className="mb-2.5 overflow-hidden rounded-xl bg-[#111113] p-3 hairline-border"
                >
                  <input
                    value={newRuleName}
                    onChange={(e) => {
                      setNewRuleName(e.target.value);
                      if (ruleNameError) setRuleNameError(false);
                    }}
                    placeholder="Rule name (e.g. Mute weekend pings)"
                    className={`w-full rounded-lg bg-[#1A1A1E] px-2.5 py-2 text-[12px] text-[#F5F5F7] placeholder-[#86868B] hairline-border focus:outline-none ${
                      ruleNameError ? 'border-[#FF2A36]/75' : ''
                    }`}
                  />
                  {ruleNameError && (
                    <p className="mt-1 font-mono text-[10px] text-[#FF2A36]">
                      Enter a rule name to activate.
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={newRuleSource}
                      onChange={(e) =>
                        setNewRuleSource(e.target.value as AutomationRule['source'])
                      }
                      className="rounded-lg bg-[#1A1A1E] px-2 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border focus:outline-none"
                    >
                      <option value="Gmail">Gmail</option>
                      <option value="Linear">Linear</option>
                      <option value="Calendar">Calendar</option>
                      <option value="System">System</option>
                    </select>
                    <button
                      type="submit"
                      className="pressable flex-1 rounded-lg bg-[#F5F5F7] py-1.5 text-[11.5px] font-semibold text-[#060607]"
                    >
                      Activate
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {automations.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl bg-[#111113] p-6 text-center hairline-border">
                <ShieldCheck className="h-5 w-5 text-[#F5F5F7]" strokeWidth={1.6} />
                <p className="mt-2 text-[13px] font-medium text-[#F5F5F7]">No active rules</p>
                <button
                  onClick={() => setShowRuleCreator(true)}
                  className="pressable mt-3 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[10.5px] text-[#F5F5F7] hairline-border"
                >
                  Create first rule
                </button>
              </div>
            ) : (
            <div className="space-y-2">
              {automations.map((rule) => {
                const isRunning = executingRuleId === rule.id;
                const isExpanded = expandedRuleId === rule.id;
                return (
                  <div
                    key={rule.id}
                    className={`shift-anim-card shift-light-subtle relative overflow-hidden rounded-xl p-3.5 hairline-border transition-colors ${
                      rule.enabled ? 'bg-[#111113]' : 'bg-[#0B0B0D] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SourceBadge source={rule.source} compact />
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rule.enabled}
                        aria-label={`Toggle ${rule.name}`}
                        onClick={() => onToggleRule(rule.id)}
                        className={`pressable relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 hairline-border transition-colors ${
                          rule.enabled ? 'bg-[#F5F5F7]' : 'bg-[#1A1A1E]'
                        }`}
                      >
                        <motion.span
                          layout
                          transition={SPRING_TOGGLE}
                          className={`h-3.5 w-3.5 rounded-full ${
                            rule.enabled ? 'ml-auto bg-[#060607]' : 'mr-auto bg-[#86868B]'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                      className="mt-2 flex w-full items-start justify-between gap-2 text-left"
                    >
                      <p className="text-[12.5px] font-medium text-[#F5F5F7]">{rule.name}</p>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.16 }}
                        className="mt-0.5 shrink-0 text-[#86868B]"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-0.5 rounded-lg bg-[#0A0A0C] p-2 font-mono text-[10px] hairline-border">
                            <div className="text-[#86868B]">{rule.trigger}</div>
                            <div className="text-[#F5F5F7]/90">{rule.action}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] tabular-nums text-[#86868B]">
                      <span>
                        <AnimatedCounter value={rule.runsThisWeek} /> runs/wk • {rule.lastRun}
                      </span>
                      <button
                        disabled={!rule.enabled || Boolean(executingRuleId)}
                        onClick={() => onRunRule(rule.id)}
                        className="pressable inline-flex items-center gap-1 rounded bg-[#1A1A1E] px-2 py-0.5 text-[#F5F5F7] hairline-border disabled:opacity-40"
                      >
                        {isRunning ? (
                          <>
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                            <span>Run</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-2.5 w-2.5 fill-current" />
                            <span>Run</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isRunning && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.95, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FF2A36]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
};
