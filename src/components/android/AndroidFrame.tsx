import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Battery, Crosshair, Layers, Signal, Terminal, Wifi } from 'lucide-react';
import {
  AutomationRule,
  BackgroundActivityItem,
  CalendarEventItem,
  ExecutableCommand,
  InboxSignal,
  PriorityTask,
} from '../../data/mockData';
import { AndroidHome } from './AndroidHome';
import { AndroidFocus } from './AndroidFocus';
import { AndroidActivity } from './AndroidActivity';
import { QuickCommandSheet } from './QuickCommandSheet';
import { ExecutionToast, ToastPayload } from '../ExecutionToast';
import { OnboardingConfig, OnboardingFlow } from '../OnboardingFlow';
import { SPRING_INDICATOR, TRANSITION_VIEW } from '../../lib/motion';
import { animateStaggerBoxes, useGSAP } from '../../lib/gsap';

export type AndroidTab = 'triage' | 'focus' | 'activity';

interface AndroidFrameProps {
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
  activeFocusTaskId: string;
  focusSecondsRemaining: number;
  focusTotalSeconds: number;
  isTimerRunning: boolean;
  showOnboarding: boolean;
  onCompleteOnboarding: (config: OnboardingConfig) => void;
  onSkipOnboarding: () => void;
  toast: ToastPayload | null;
  onDismissToast: () => void;
  onExecuteTask: (taskId: string) => void;
  onCompleteTaskInstant: (taskId: string) => void;
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
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onExtendTimer: () => void;
  onSelectFocusTask: (taskId: string) => void;
  onExecuteCommand: (cmd: {
    title: string;
    detail: string;
    source: ExecutableCommand['source'];
  }) => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
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
  activeFocusTaskId,
  focusSecondsRemaining,
  focusTotalSeconds,
  isTimerRunning,
  showOnboarding,
  onCompleteOnboarding,
  onSkipOnboarding,
  toast,
  onDismissToast,
  onExecuteTask,
  onCompleteTaskInstant,
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
  onToggleTimer,
  onResetTimer,
  onExtendTimer,
  onSelectFocusTask,
  onExecuteCommand,
}) => {
  const [activeTab, setActiveTab] = useState<AndroidTab>('triage');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Close Quick Command sheet cleanly if Onboarding is triggered
  useEffect(() => {
    if (showOnboarding) {
      setIsSheetOpen(false);
    }
  }, [showOnboarding]);

  useGSAP(
    () => {
      if (showOnboarding) return;
      animateStaggerBoxes(viewportRef.current, '.shift-anim-card', {
        y: 14,
        duration: 0.38,
        stagger: 0.05,
      });
    },
    { dependencies: [activeTab, showOnboarding], scope: viewportRef },
  );

  const handleOpenFocusForTask = (taskId: string) => {
    onSelectFocusTask(taskId);
    setActiveTab('focus');
  };

  return (
    <div className="relative flex h-[min(844px,calc(100vh-132px))] min-h-[600px] w-[390px] max-w-full flex-col overflow-hidden rounded-[46px] bg-[#060607] p-[9px] shadow-[0_32px_90px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.12]">
      {/* Inner Android Display Glass (concentric radius: 46px - 9px = 37px) */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[37px] bg-[#060607] hairline-border">
        {/* Android Status Bar */}
        <div className="relative flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[#F5F5F7]">
          <span className="font-mono text-[12px] font-medium tabular-nums tracking-tight">
            09:42
          </span>

          {/* Subtle Android Punch-Hole Camera */}
          <span className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-[#111113] ring-1 ring-white/[0.08]" />

          <div className="flex items-center gap-1.5 text-[#F5F5F7]">
            <Signal className="h-3.5 w-3.5" strokeWidth={2} />
            <Wifi className="h-3.5 w-3.5" strokeWidth={2} />
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10.5px] tabular-nums">88%</span>
              <Battery className="h-4 w-4" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Top Dynamic Notification Toast (never overlaps FAB or Bottom Nav) */}
        <ExecutionToast toast={toast} onDismiss={onDismissToast} compact />

        {showOnboarding ? (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1">
              <OnboardingFlow
                variant="android"
                onComplete={onCompleteOnboarding}
                onSkip={onSkipOnboarding}
              />
            </div>
            {/* Android Home Gesture Pill */}
            <div className="shrink-0 bg-[#060607] pb-3 pt-1">
              <div className="mx-auto h-1 w-28 rounded-full bg-white/20" />
            </div>
          </div>
        ) : (
        <>
        {/* Tab Screen Viewport (direct keyed transition so tabs never stall blank) */}
        <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden">
          <motion.div
            key={`android-tab-${activeTab}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TRANSITION_VIEW}
            className="h-full w-full"
          >
            {activeTab === 'triage' && (
              <AndroidHome
                tasks={tasks}
                activities={activities}
                inboxSignals={inboxSignals}
                calendarEvents={calendarEvents}
                automations={automations}
                executingTaskId={executingTaskId}
                executingSignalId={executingSignalId}
                executingEventId={executingEventId}
                executingRuleId={executingRuleId}
                isEngineExecuting={isEngineExecuting}
                canAddFocusBlock={canAddFocusBlock}
                hasScheduleChanges={hasScheduleChanges}
                onExecuteTask={onExecuteTask}
                onCompleteTaskInstant={onCompleteTaskInstant}
                onFocusTask={handleOpenFocusForTask}
                onResetTasks={onResetTasks}
                onExecuteSignal={onExecuteSignal}
                onPromoteSignal={onPromoteSignal}
                onArchiveSignal={onArchiveSignal}
                onSweepNoise={onSweepNoise}
                onResetInbox={onResetInbox}
                onDeclineEvent={onDeclineEvent}
                onRescheduleEvent={onRescheduleEvent}
                onAddFocusBlock={onAddFocusBlock}
                onResetCalendar={onResetCalendar}
                onToggleRule={onToggleRule}
                onRunRule={onRunRule}
                onCreateRule={onCreateRule}
              />
            )}

            {activeTab === 'focus' && (
              <AndroidFocus
                tasks={tasks}
                activeTaskId={activeFocusTaskId}
                secondsRemaining={focusSecondsRemaining}
                totalSeconds={focusTotalSeconds}
                isTimerRunning={isTimerRunning}
                onToggleTimer={onToggleTimer}
                onResetTimer={onResetTimer}
                onExtendTimer={onExtendTimer}
                onSelectTask={onSelectFocusTask}
                onCompleteTask={onCompleteTaskInstant}
                onResetTasks={onResetTasks}
              />
            )}

            {activeTab === 'activity' && <AndroidActivity activities={activities} />}
          </motion.div>
        </div>

        {/* Ergonomic Floating Action Button (#F5F5F7 fill, #060607 icon), cleanly clear of Bottom Nav */}
        <button
          onClick={() => setIsSheetOpen(true)}
          aria-label="Open Quick Command"
          className="pressable absolute bottom-[104px] right-4 z-30 flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-[#F5F5F7] text-[#060607] shadow-[0_10px_28px_rgba(0,0,0,0.65)] hover:opacity-95"
        >
          <Terminal className="h-5 w-5" strokeWidth={2.2} />
        </button>

        {/* Bottom Navigation Bar */}
        <nav className="relative z-20 shrink-0 bg-[#0B0B0D]/95 px-4 pb-5 pt-2.5 backdrop-blur-md hairline-t">
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: 'triage', label: 'Triage', icon: Layers },
                { id: 'focus', label: 'Focus', icon: Crosshair },
                { id: 'activity', label: 'Activity', icon: Activity },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              const showLiveDot = id === 'focus' && isTimerRunning;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors ${
                    active ? 'text-[#F5F5F7]' : 'text-[#86868B]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="android-nav-pill"
                      transition={SPRING_INDICATOR}
                      className="absolute inset-x-3 inset-y-0.5 rounded-xl bg-[#1A1A1E] hairline-border"
                    />
                  )}
                  <span className="relative z-10">
                    <Icon className="h-4 w-4" strokeWidth={active ? 2 : 1.75} />
                    {showLiveDot && (
                      <span className="absolute -right-1.5 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                    )}
                  </span>
                  <span className="relative z-10 text-[10.5px] font-medium">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Android Home Gesture Pill */}
          <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-white/20" />
        </nav>

        {/* Quick Command Bottom Sheet */}
        <QuickCommandSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onExecuteCommand={onExecuteCommand}
        />
        </>
        )}
      </div>
    </div>
  );
};
