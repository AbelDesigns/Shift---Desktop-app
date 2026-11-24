import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Command,
  Crosshair,
  Inbox,
  Layers,
  LucideIcon,
  SlidersVertical,
} from 'lucide-react';
import {
  AutomationRule,
  BackgroundActivityItem,
  CalendarEventItem,
  ExecutableCommand,
  InboxSignal,
  PriorityTask,
  formatSeconds,
} from '../../data/mockData';
import { ShiftLogo } from '../ShiftLogo';
import { AnimatedCounter } from '../AnimatedCounter';
import { ExecutionToast, ToastPayload } from '../ExecutionToast';
import { OnboardingConfig, OnboardingFlow } from '../OnboardingFlow';
import { DesktopTriage } from './DesktopTriage';
import { DesktopFocus } from './DesktopFocus';
import { DesktopInbox } from './DesktopInbox';
import { DesktopCalendar } from './DesktopCalendar';
import { DesktopAutomations } from './DesktopAutomations';
import { CommandBarModal } from './CommandBarModal';
import { SPRING_INDICATOR, TRANSITION_VIEW } from '../../lib/motion';
import {
  animateStaggerBoxes,
  gsap,
  isMotionReduced,
  useGSAP,
} from '../../lib/gsap';

export type DesktopTab = 'inbox' | 'triage' | 'calendar' | 'automations' | 'focus';

interface DesktopWindowProps {
  activeTab: DesktopTab;
  onChangeTab: (tab: DesktopTab) => void;
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
  isCommandBarOpen: boolean;
  showOnboarding: boolean;
  onCompleteOnboarding: (config: OnboardingConfig) => void;
  onSkipOnboarding: () => void;
  toast: ToastPayload | null;
  onDismissToast: () => void;
  onOpenCommandBar: () => void;
  onCloseCommandBar: () => void;
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

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  activeTab,
  onChangeTab,
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
  isCommandBarOpen,
  showOnboarding,
  onCompleteOnboarding,
  onSkipOnboarding,
  toast,
  onDismissToast,
  onOpenCommandBar,
  onCloseCommandBar,
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
  onToggleTimer,
  onResetTimer,
  onExtendTimer,
  onSelectFocusTask,
  onExecuteCommand,
}) => {
  const inboxCount = inboxSignals
    .filter((s) => !s.resolved)
    .reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const calendarCount = calendarEvents.filter((e) => e.status === 'scheduled').length;
  const activeRulesCount = automations.filter((r) => r.enabled).length;

  const breadcrumbLabel: Record<DesktopTab, string> = {
    inbox: 'inbox',
    triage: 'priorities',
    calendar: 'calendar',
    automations: 'automations',
    focus: 'focus-mode',
  };

  const workspaceItems: Array<{
    id: DesktopTab;
    label: string;
    icon: LucideIcon;
    count: number;
  }> = [
      { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
      { id: 'triage', label: 'Priorities', icon: Layers, count: pendingCount },
      { id: 'calendar', label: 'Calendar', icon: Calendar, count: calendarCount },
      { id: 'automations', label: 'Automations', icon: SlidersVertical, count: activeRulesCount },
    ];

  const windowRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Stagger sidebar & sweep window light when entering workspace from onboarding
  useGSAP(
    () => {
      if (isMotionReduced() || showOnboarding) return;
      gsap.from('.gsap-sidebar-item', {
        x: -10,
        opacity: 0,
        duration: 0.36,
        stagger: 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    },
    { dependencies: [showOnboarding], scope: windowRef },
  );

  // Stagger inner view boxes cleanly on tab switch
  useGSAP(
    () => {
      if (showOnboarding) return;
      animateStaggerBoxes(stageRef.current, '.shift-anim-card', {
        y: 16,
        duration: 0.42,
        stagger: 0.05,
      });
    },
    { dependencies: [activeTab, showOnboarding], scope: stageRef },
  );

  return (
    <div
      ref={windowRef}
      className="shift-light-box shift-light-box-red relative flex h-[min(760px,calc(100vh-132px))] min-h-[620px] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl bg-[#060607] shadow-[0_32px_90px_rgba(0,0,0,0.85)] hairline-border"
    >
      {/* Top Specular Glint */}
      <div className="shift-top-glint shift-top-glint-red" aria-hidden="true" />

      {/* Native Minimalist Window Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between bg-[#09090B] px-4 hairline-b">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-[#86868B]">
          <span>shift.app</span>
          <span className="text-white/15">/</span>
          <span className="text-[#F5F5F7]">
            {showOnboarding ? 'onboarding' : breadcrumbLabel[activeTab]}
          </span>
        </div>

        <button
          disabled={showOnboarding}
          onClick={onOpenCommandBar}
          className="pressable flex items-center gap-1.5 rounded-md bg-[#111113] px-2 py-1 font-mono text-[10.5px] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7] disabled:opacity-35"
        >
          <Command className="h-3 w-3" strokeWidth={1.75} />
          <span>K</span>
        </button>
      </div>

      {/* App Shell Body OR Full-Window Onboarding */}
      {showOnboarding ? (
        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#060607]">
          <OnboardingFlow
            variant="desktop"
            onComplete={onCompleteOnboarding}
            onSkip={onSkipOnboarding}
          />
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Left Sidebar (220px strict) */}
          <aside className="flex w-[220px] shrink-0 flex-col justify-between bg-[#09090B] px-3 py-4 hairline-r">
            <div>
              {/* Sidebar Brand with Official // Shift Logo */}
              <div className="flex items-center justify-between px-2.5 pb-5">
                <div className="flex items-center gap-2">
                  <ShiftLogo size={18} />
                  <span className="text-[15px] font-medium tracking-[-0.02em] text-[#F5F5F7]">
                    Shift
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#86868B]">v2.4</span>
              </div>

              {/* WORKSPACE Section */}
              <div className="space-y-0.5">
                <div className="px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#86868B]">
                  Workspace
                </div>

                {workspaceItems.map(({ id, label, icon: Icon, count }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onChangeTab(id)}
                      className={`gsap-sidebar-item pressable relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors ${active
                        ? 'font-medium text-[#F5F5F7]'
                        : 'font-normal text-[#86868B] hover:bg-[#111113] hover:text-[#F5F5F7]'
                        }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="desktop-sidebar-active"
                          transition={SPRING_INDICATOR}
                          className="absolute inset-0 rounded-lg bg-[#1A1A1E] hairline-border"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2.5">
                        <Icon className="h-4 w-4" strokeWidth={active ? 1.9 : 1.65} />
                        <span>{label}</span>
                      </span>
                      <AnimatedCounter
                        value={count}
                        className="relative z-10 text-[11px] text-[#86868B]"
                      />
                    </button>
                  );
                })}
              </div>

              {/* EXECUTION Section */}
              <div className="mt-5 space-y-0.5">
                <div className="px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#86868B]">
                  Execution
                </div>

                <button
                  onClick={() => onChangeTab('focus')}
                  className={`pressable relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors ${activeTab === 'focus'
                    ? 'font-medium text-[#F5F5F7]'
                    : 'font-normal text-[#86868B] hover:bg-[#111113] hover:text-[#F5F5F7]'
                    }`}
                >
                  {activeTab === 'focus' && (
                    <motion.span
                      layoutId="desktop-sidebar-active"
                      transition={SPRING_INDICATOR}
                      className="absolute inset-0 rounded-lg bg-[#1A1A1E] hairline-border"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Crosshair className="h-4 w-4" strokeWidth={activeTab === 'focus' ? 1.9 : 1.65} />
                    <span>Focus Mode</span>
                  </span>
                  {isTimerRunning ? (
                    <span className="relative z-10 flex items-center gap-1.5 font-mono text-[10.5px] tabular-nums text-[#F5F5F7]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                      {formatSeconds(focusSecondsRemaining)}
                    </span>
                  ) : (
                    <span className="relative z-10 font-mono text-[10.5px] tabular-nums text-[#86868B]">
                      {formatSeconds(focusSecondsRemaining)}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOpenCommandBar}
                  className="pressable flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-normal text-[#86868B] hover:bg-[#111113] hover:text-[#F5F5F7]"
                >
                  <span className="flex items-center gap-2.5">
                    <Command className="h-4 w-4" strokeWidth={1.65} />
                    <span>Command Bar</span>
                  </span>
                  <kbd className="rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>

            {/* Connected Pipelines Footer */}
            <div className="space-y-3 pt-4 hairline-t">
              <div className="px-2">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Live Pipelines
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Gmail', status: '2m' },
                    { name: 'Linear', status: 'Live' },
                    { name: 'Calendar', status: 'Synced' },
                  ].map((pipe) => (
                    <div
                      key={pipe.name}
                      className="flex items-center justify-between text-[12px] text-[#86868B]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]/85" />
                        <span>{pipe.name}</span>
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-[#86868B]">
                        {pipe.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#111113] px-2.5 py-2 hairline-border">
                <p className="font-mono text-[10px] text-[#86868B]">Zero chat. Pure execution.</p>
              </div>
            </div>
          </aside>

          {/* Active View Content (direct keyed mount — never hangs on nested animations) */}
          <div ref={stageRef} className="relative flex min-w-0 flex-1 overflow-hidden bg-[#060607]">
            <motion.div
              key={`desktop-tab-${activeTab}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TRANSITION_VIEW}
              className="flex h-full w-full"
            >
              {activeTab === 'triage' && (
                <DesktopTriage
                  tasks={tasks}
                  activities={activities}
                  executingTaskId={executingTaskId}
                  isEngineExecuting={isEngineExecuting}
                  onExecuteTask={onExecuteTask}
                  onCompleteTaskInstant={onCompleteTaskInstant}
                  onFocusTask={onFocusTask}
                  onResetTasks={onResetTasks}
                  onOpenCommandBar={onOpenCommandBar}
                />
              )}

              {activeTab === 'inbox' && (
                <DesktopInbox
                  signals={inboxSignals}
                  executingId={executingSignalId}
                  onExecuteSignal={onExecuteSignal}
                  onPromoteSignal={onPromoteSignal}
                  onArchiveSignal={onArchiveSignal}
                  onSweepNoise={onSweepNoise}
                  onResetInbox={onResetInbox}
                />
              )}

              {activeTab === 'calendar' && (
                <DesktopCalendar
                  events={calendarEvents}
                  executingEventId={executingEventId}
                  canAddFocusBlock={canAddFocusBlock}
                  hasScheduleChanges={hasScheduleChanges}
                  onDeclineEvent={onDeclineEvent}
                  onRescheduleEvent={onRescheduleEvent}
                  onAddFocusBlock={onAddFocusBlock}
                  onResetCalendar={onResetCalendar}
                />
              )}

              {activeTab === 'automations' && (
                <DesktopAutomations
                  rules={automations}
                  executingRuleId={executingRuleId}
                  onToggleRule={onToggleRule}
                  onRunRule={onRunRule}
                  onCreateRule={onCreateRule}
                />
              )}

              {activeTab === 'focus' && (
                <DesktopFocus
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
                  onExitFocus={() => onChangeTab('triage')}
                />
              )}
            </motion.div>

            {/* Sonner-inspired micro-toast with Undo */}
            <ExecutionToast toast={toast} onDismiss={onDismissToast} />
          </div>

          {/* Interactive Cmd+K Modal */}
          <CommandBarModal
            isOpen={isCommandBarOpen}
            onClose={onCloseCommandBar}
            onExecuteCommand={onExecuteCommand}
          />
        </div>
      )}
    </div>
  );
};
