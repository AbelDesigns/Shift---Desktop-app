import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import {
  AutomationRule,
  BackgroundActivityItem,
  CalendarEventItem,
  ExecutableCommand,
  INITIAL_ACTIVITIES,
  INITIAL_AUTOMATIONS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_INBOX_SIGNALS,
  INITIAL_TASKS,
  InboxSignal,
  PriorityTask,
  formatCurrentTime,
} from './data/mockData';
import { PortfolioHeader, ViewportMode } from './components/PortfolioHeader';
import { DesktopTab, DesktopWindow } from './components/desktop/DesktopWindow';
import { AndroidFrame } from './components/android/AndroidFrame';
import { ToastPayload } from './components/ExecutionToast';
import { OnboardingConfig } from './components/OnboardingFlow';
import {
  gsap,
  isMotionReduced,
  useGSAP,
} from './lib/gsap';

const FOCUS_BLOCK_SLOTS = [
  { startTime: '12:00', endTime: '13:00', durationLabel: '60m' },
  { startTime: '15:00', endTime: '16:00', durationLabel: '60m' },
  { startTime: '17:00', endTime: '18:00', durationLabel: '60m' },
];

export function App() {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('triage');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  // Shared live mock state across Desktop & Android prototypes
  const [tasks, setTasks] = useState<PriorityTask[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<BackgroundActivityItem[]>(INITIAL_ACTIVITIES);
  const [inboxSignals, setInboxSignals] = useState<InboxSignal[]>(INITIAL_INBOX_SIGNALS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(
    INITIAL_CALENDAR_EVENTS,
  );
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);

  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [executingSignalId, setExecutingSignalId] = useState<string | null>(null);
  const [executingEventId, setExecutingEventId] = useState<string | null>(null);
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);
  const [isEngineExecuting, setIsEngineExecuting] = useState(false);

  // Sonner-inspired micro-toast with optional Undo
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Shared Focus Mode state
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string>(INITIAL_TASKS[0].id);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState<number>(
    INITIAL_TASKS[0].durationSeconds,
  );
  const [focusTotalSeconds, setFocusTotalSeconds] = useState<number>(
    INITIAL_TASKS[0].durationSeconds,
  );
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const showToast = useCallback((payload: Omit<ToastPayload, 'id'>) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ ...payload, id: `toast-${Date.now()}` });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3400);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Global Cmd+K / Ctrl+K shortcut for Desktop Command Bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (showOnboarding) return;
        e.preventDefault();
        if (viewportMode !== 'desktop') {
          setViewportMode('desktop');
        }
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewportMode, showOnboarding]);

  // Live countdown timer for Focus Mode
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = window.setInterval(() => {
      setFocusSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  const appendActivity = useCallback(
    (entry: { title: string; detail: string; source: ExecutableCommand['source'] }) => {
      const newItem: BackgroundActivityItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: entry.title,
        detail: entry.detail,
        source: entry.source,
        timestamp: formatCurrentTime(),
        isNew: true,
      };
      setActivities((prev) => [newItem, ...prev.map((a) => ({ ...a, isNew: false }))]);
    },
    [],
  );

  // --- Priorities / Triage Handlers ---
  const handleSelectFocusTask = useCallback(
    (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;
      setActiveFocusTaskId(taskId);
      setFocusTotalSeconds(target.durationSeconds);
      setFocusSecondsRemaining(target.durationSeconds);
      setIsTimerRunning(!target.completed);
    },
    [tasks],
  );

  const handleOpenDesktopFocusForTask = useCallback(
    (taskId: string) => {
      handleSelectFocusTask(taskId);
      setDesktopTab('focus');
    },
    [handleSelectFocusTask],
  );

  const handleExecuteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.completed || executingTaskId) return;

      setExecutingTaskId(taskId);
      setIsEngineExecuting(true);

      window.setTimeout(() => {
        setTasks((prev) =>
          prev.map((item) => (item.id === taskId ? { ...item, completed: true } : item)),
        );
        appendActivity({
          title: task.executedLogTitle,
          detail: task.executedLogDetail,
          source: task.source,
        });
        showToast({
          message: task.executedLogTitle,
          detail: task.executedLogDetail,
          onUndo: () => {
            setTasks((prev) =>
              prev.map((item) => (item.id === taskId ? { ...item, completed: false } : item)),
            );
          },
        });
        setExecutingTaskId(null);
        setIsEngineExecuting(false);
      }, 1000);
    },
    [tasks, executingTaskId, appendActivity, showToast],
  );

  const handleCompleteTaskInstant = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      setTasks((prev) =>
        prev.map((item) => (item.id === taskId ? { ...item, completed: true } : item)),
      );
      appendActivity({
        title: task.executedLogTitle,
        detail: task.executedLogDetail,
        source: task.source,
      });
      showToast({
        message: task.executedLogTitle,
        detail: task.executedLogDetail,
        onUndo: () => {
          setTasks((prev) =>
            prev.map((item) => (item.id === taskId ? { ...item, completed: false } : item)),
          );
        },
      });

      if (taskId === activeFocusTaskId) {
        setIsTimerRunning(false);
        const nextPending = tasks.find((t) => !t.completed && t.id !== taskId);
        if (nextPending) {
          setActiveFocusTaskId(nextPending.id);
          setFocusTotalSeconds(nextPending.durationSeconds);
          setFocusSecondsRemaining(nextPending.durationSeconds);
        }
      }
    },
    [tasks, activeFocusTaskId, appendActivity, showToast],
  );

  const handleResetTasks = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setActiveFocusTaskId(INITIAL_TASKS[0].id);
    setFocusTotalSeconds(INITIAL_TASKS[0].durationSeconds);
    setFocusSecondsRemaining(INITIAL_TASKS[0].durationSeconds);
    setIsTimerRunning(false);
  }, []);

  // --- Inbox Handlers ---
  const handleExecuteSignal = useCallback(
    (signalId: string) => {
      const sig = inboxSignals.find((s) => s.id === signalId);
      if (!sig || sig.resolved || executingSignalId) return;

      setExecutingSignalId(signalId);
      setIsEngineExecuting(true);

      window.setTimeout(() => {
        setInboxSignals((prev) =>
          prev.map((s) => (s.id === signalId ? { ...s, resolved: true } : s)),
        );
        const title = sig.stagedAction
          ? `Executed: ${sig.subject}`
          : `Resolved: ${sig.subject}`;
        const detail = `${sig.source} • ${sig.sender}`;
        appendActivity({ title, detail, source: sig.source });
        showToast({
          message: title,
          detail,
          onUndo: () => {
            setInboxSignals((prev) =>
              prev.map((s) => (s.id === signalId ? { ...s, resolved: false } : s)),
            );
          },
        });
        setExecutingSignalId(null);
        setIsEngineExecuting(false);
      }, 1000);
    },
    [inboxSignals, executingSignalId, appendActivity, showToast],
  );

  const handlePromoteSignal = useCallback(
    (signalId: string) => {
      const sig = inboxSignals.find((s) => s.id === signalId);
      if (!sig || sig.resolved) return;

      const promotedId = `task-promoted-${Date.now()}`;
      const promotedTask: PriorityTask = {
        id: promotedId,
        title: sig.subject,
        summary: sig.preview,
        source: sig.source,
        sourceRef: sig.sourceRef,
        meta: 'Promoted',
        priority: 'P1',
        actionLabel: 'Execute',
        executedLogTitle: `Completed promoted signal: ${sig.subject}`,
        executedLogDetail: `${sig.source} • ${sig.sender}`,
        durationSeconds: 20 * 60,
        completed: false,
        resources: [
          {
            id: `res-p1-${Date.now()}`,
            label: `${sig.sourceRef} — Extracted Brief`,
            meta: sig.sender,
            type: 'thread',
          },
          {
            id: `res-p2-${Date.now()}`,
            label: 'Staged Execution Payload.md',
            meta: 'Prepared by Shift Inbox',
            type: 'doc',
          },
        ],
      };

      setTasks((prev) => [promotedTask, ...prev]);
      setInboxSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, resolved: true } : s)),
      );
      appendActivity({
        title: `Promoted to Priorities: ${sig.subject}`,
        detail: `${sig.source} • Moved from Inbox queue`,
        source: sig.source,
      });
      showToast({
        message: 'Moved to Priorities',
        detail: sig.subject,
        onUndo: () => {
          setTasks((prev) => prev.filter((t) => t.id !== promotedId));
          setInboxSignals((prev) =>
            prev.map((s) => (s.id === signalId ? { ...s, resolved: false } : s)),
          );
        },
      });
    },
    [inboxSignals, appendActivity, showToast],
  );

  const handleArchiveSignal = useCallback(
    (signalId: string) => {
      const sig = inboxSignals.find((s) => s.id === signalId);
      if (!sig || sig.resolved) return;
      setInboxSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, resolved: true } : s)),
      );
      appendActivity({
        title: `Archived: ${sig.subject}`,
        detail: `${sig.source} • Cleared from Inbox`,
        source: sig.source,
      });
      showToast({
        message: 'Signal archived',
        detail: sig.subject,
        onUndo: () => {
          setInboxSignals((prev) =>
            prev.map((s) => (s.id === signalId ? { ...s, resolved: false } : s)),
          );
        },
      });
    },
    [inboxSignals, appendActivity, showToast],
  );

  const handleSweepNoise = useCallback(() => {
    const noiseTarget = inboxSignals.find((s) => !s.resolved && s.category === 'noise');
    if (!noiseTarget || executingSignalId) return;

    setExecutingSignalId(noiseTarget.id);
    setIsEngineExecuting(true);

    window.setTimeout(() => {
      setInboxSignals((prev) =>
        prev.map((s) => (s.category === 'noise' ? { ...s, resolved: true } : s)),
      );
      appendActivity({
        title: 'Swept 7 low-signal inbox threads',
        detail: 'Gmail • Receipts filed, newsletters archived',
        source: 'Gmail',
      });
      showToast({
        message: 'Swept 7 low-signal threads',
        detail: 'Archived silently',
      });
      setExecutingSignalId(null);
      setIsEngineExecuting(false);
    }, 1000);
  }, [inboxSignals, executingSignalId, appendActivity, showToast]);

  const handleResetInbox = useCallback(() => {
    setInboxSignals(INITIAL_INBOX_SIGNALS);
  }, []);

  // --- Calendar Handlers ---
  const nextAvailableSlot = FOCUS_BLOCK_SLOTS.find(
    (slot) => !calendarEvents.some((ev) => ev.startTime === slot.startTime && ev.status === 'protected'),
  );
  const hasScheduleChanges = calendarEvents !== INITIAL_CALENDAR_EVENTS;

  const handleDeclineEvent = useCallback(
    (eventId: string) => {
      const ev = calendarEvents.find((e) => e.id === eventId);
      if (!ev || ev.status === 'declined' || executingEventId) return;

      const prevLocation = ev.location;
      setExecutingEventId(eventId);
      setIsEngineExecuting(true);

      window.setTimeout(() => {
        setCalendarEvents((prev) =>
          prev.map((item) =>
            item.id === eventId
              ? { ...item, status: 'declined', location: 'Auto-declined by Shift' }
              : item,
          ),
        );
        appendActivity({
          title: `Declined ${ev.title}`,
          detail: 'Calendar • Sent concise async update to attendees',
          source: 'Calendar',
        });
        showToast({
          message: `Declined ${ev.title}`,
          detail: 'Async note dispatched',
          onUndo: () => {
            setCalendarEvents((prev) =>
              prev.map((item) =>
                item.id === eventId
                  ? { ...item, status: 'scheduled', location: prevLocation }
                  : item,
              ),
            );
          },
        });
        setExecutingEventId(null);
        setIsEngineExecuting(false);
      }, 1000);
    },
    [calendarEvents, executingEventId, appendActivity, showToast],
  );

  const handleRescheduleEvent = useCallback(
    (eventId: string) => {
      const ev = calendarEvents.find((e) => e.id === eventId);
      if (!ev || executingEventId) return;

      setExecutingEventId(eventId);
      setIsEngineExecuting(true);

      window.setTimeout(() => {
        setCalendarEvents((prev) =>
          prev.map((item) =>
            item.id === eventId
              ? { ...item, startTime: '17:00', endTime: '17:30', rescheduled: true }
              : item,
          ),
        );
        appendActivity({
          title: `Optimized slot for ${ev.title}`,
          detail: 'Calendar • Moved to 17:00–17:30 (all attendees free)',
          source: 'Calendar',
        });
        showToast({
          message: 'Time slot optimized',
          detail: `${ev.title} → 17:00–17:30`,
        });
        setExecutingEventId(null);
        setIsEngineExecuting(false);
      }, 1000);
    },
    [calendarEvents, executingEventId, appendActivity, showToast],
  );

  const handleAddFocusBlock = useCallback(() => {
    if (!nextAvailableSlot) return;
    const newBlock: CalendarEventItem = {
      id: `cal-focus-${Date.now()}`,
      title: 'Protected Deep Work — Execution Sprint',
      startTime: nextAvailableSlot.startTime,
      endTime: nextAvailableSlot.endTime,
      durationLabel: nextAvailableSlot.durationLabel,
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: [
        'Added on demand from Shift Calendar.',
        'Incoming invites during this window will auto-reschedule.',
      ],
      location: 'Local Focus Shield',
    };
    setCalendarEvents((prev) =>
      [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    );
    appendActivity({
      title: `Locked 60m deep-work shield (${nextAvailableSlot.startTime}–${nextAvailableSlot.endTime})`,
      detail: 'Calendar • DND schedule synchronized',
      source: 'Calendar',
    });
    showToast({
      message: 'Deep-work window locked',
      detail: `${nextAvailableSlot.startTime}–${nextAvailableSlot.endTime} • DND active`,
    });
  }, [nextAvailableSlot, appendActivity, showToast]);

  const handleResetCalendar = useCallback(() => {
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
  }, []);

  // --- Automations Handlers ---
  const handleToggleRule = useCallback((ruleId: string) => {
    setAutomations((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
    );
  }, []);

  const handleRunRule = useCallback(
    (ruleId: string) => {
      const rule = automations.find((r) => r.id === ruleId);
      if (!rule || executingRuleId) return;

      setExecutingRuleId(ruleId);
      setIsEngineExecuting(true);

      window.setTimeout(() => {
        setAutomations((prev) =>
          prev.map((r) =>
            r.id === ruleId
              ? { ...r, runsThisWeek: r.runsThisWeek + 1, lastRun: formatCurrentTime() }
              : r,
          ),
        );
        appendActivity({
          title: rule.testLogTitle,
          detail: rule.testLogDetail,
          source: rule.source,
        });
        showToast({
          message: rule.testLogTitle,
          detail: rule.testLogDetail,
        });
        setExecutingRuleId(null);
        setIsEngineExecuting(false);
      }, 1000);
    },
    [automations, executingRuleId, appendActivity, showToast],
  );

  const handleCreateRule = useCallback(
    (newRule: Omit<AutomationRule, 'id' | 'runsThisWeek' | 'lastRun'>) => {
      const created: AutomationRule = {
        ...newRule,
        id: `auto-${Date.now()}`,
        runsThisWeek: 0,
        lastRun: 'Just added',
      };
      setAutomations((prev) => [created, ...prev]);
      appendActivity({
        title: `Activated rule: ${created.name}`,
        detail: `${created.source} • Live in autonomous pipeline`,
        source: created.source,
      });
      showToast({
        message: 'Automation rule activated',
        detail: created.name,
      });
    },
    [appendActivity, showToast],
  );

  // --- Command Bar & Focus Timer ---
  const handleExecuteCommand = useCallback(
    (cmd: { title: string; detail: string; source: ExecutableCommand['source'] }) => {
      setIsEngineExecuting(true);
      appendActivity(cmd);
      showToast({ message: cmd.title, detail: cmd.detail });
      window.setTimeout(() => setIsEngineExecuting(false), 450);
    },
    [appendActivity, showToast],
  );

  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setFocusSecondsRemaining(focusTotalSeconds);
  }, [focusTotalSeconds]);

  const handleExtendTimer = useCallback(() => {
    setFocusTotalSeconds((prev) => prev + 5 * 60);
    setFocusSecondsRemaining((prev) => prev + 5 * 60);
    setIsTimerRunning(true);
  }, []);

  // --- Onboarding Completion (applies real user configuration to live workspace) ---
  const handleCompleteOnboarding = useCallback(
    (config: OnboardingConfig) => {
      // Configure automation rules based on selected autonomy boundary
      const assistedIds = new Set(['auto-2', 'auto-5', 'auto-6', 'auto-8']);
      setAutomations((prev) =>
        prev.map((rule) => ({
          ...rule,
          enabled: config.autonomy === 'assisted' ? assistedIds.has(rule.id) : true,
        })),
      );

      // Apply selected morning focus window to Today's protected block
      const [start, end] = config.focusWindow.split('–');
      if (start && end) {
        setCalendarEvents((prev) =>
          prev.map((ev) =>
            ev.id === 'cal-deep-1'
              ? { ...ev, startTime: start, endTime: end, durationLabel: '120m' }
              : ev,
          ),
        );
      }

      const modeLabel =
        config.autonomy === 'full'
          ? 'Full Autonomy'
          : config.autonomy === 'assisted'
            ? 'Assisted'
            : 'Surgical';

      appendActivity({
        title: `Initialized Shift Engine (${modeLabel})`,
        detail: `${config.pipelines.join(', ')} • Shield ${config.focusWindow}`,
        source: 'System',
      });
      showToast({
        message: `Shift armed in ${modeLabel} mode`,
        detail: `${config.pipelines.length} pipelines • Focus shield ${config.focusWindow}`,
      });
      setShowOnboarding(false);
    },
    [appendActivity, showToast],
  );

  const handleSkipOnboarding = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const appRootRef = useRef<HTMLDivElement>(null);
  const stageWrapperRef = useRef<HTMLDivElement>(null);
  const hasMountedStageRef = useRef(false);
  const reducedMotion = isMotionReduced();

  // Apply optional reduced-motion attribute (?motion=reduced)
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute('data-motion', 'reduced');
    }
  }, [reducedMotion]);

  // Choreographed GSAP entrance timeline on first load
  useGSAP(
    () => {
      if (reducedMotion) return;
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from('.gsap-app-header', {
        y: -22,
        opacity: 0,
        duration: 0.65,
        clearProps: 'transform,opacity',
      })
        .from(
          '.gsap-stage-horizon',
          {
            opacity: 0,
            scaleX: 0.65,
            duration: 0.9,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          },
          '-=0.42',
        )
        .from(
          stageWrapperRef.current,
          {
            y: 34,
            opacity: 0,
            scale: 0.96,
            duration: 0.82,
            clearProps: 'transform,opacity',
          },
          '-=0.72',
        )
        .from(
          '.gsap-stage-caption',
          {
            y: 12,
            opacity: 0,
            duration: 0.52,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
          '-=0.44',
        );
    },
    { scope: appRootRef },
  );

  // Smooth GSAP morph + specular light sweep when switching Desktop <-> Android
  useGSAP(
    () => {
      if (!hasMountedStageRef.current) {
        hasMountedStageRef.current = true;
        return;
      }
      if (reducedMotion || !stageWrapperRef.current) return;

      gsap.fromTo(
        stageWrapperRef.current,
        { opacity: 0, y: 20, scale: 0.965 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.52,
          ease: 'power4.out',
          clearProps: 'transform,opacity',
        },
      );
    },
    { dependencies: [viewportMode], scope: appRootRef },
  );

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <div
        ref={appRootRef}
        className="showcase-grid relative min-h-screen w-full overflow-x-hidden text-[#F5F5F7]"
      >
        {/* Subtle Ambient Shift Red Horizon Glow Behind Active Device Frame */}
        <div
          aria-hidden="true"
          className="gsap-stage-horizon shift-stage-horizon pointer-events-none fixed left-1/2 top-16 z-0 h-[360px] w-[min(980px,92vw)]"
          style={{
            background:
              'radial-gradient(ellipse 58% 68% at 50% 24%, rgba(255,42,54,0.28) 0%, rgba(255,42,54,0.08) 46%, transparent 76%)',
            filter: 'blur(54px)',
          }}
        />

        <PortfolioHeader
          mode={viewportMode}
          onChangeMode={setViewportMode}
          isExecuting={isEngineExecuting}
          showOnboarding={showOnboarding}
          onToggleOnboarding={() => {
            setIsCommandBarOpen(false);
            setShowOnboarding((prev) => !prev);
          }}
          onOpenCommandBar={() => setIsCommandBarOpen(true)}
        />

        <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 pb-8 pt-20">
          <div
            ref={stageWrapperRef}
            className="flex w-full justify-center"
          >
            {viewportMode === 'desktop' ? (
              <DesktopWindow
                activeTab={desktopTab}
                onChangeTab={setDesktopTab}
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
                canAddFocusBlock={Boolean(nextAvailableSlot)}
                hasScheduleChanges={hasScheduleChanges}
                activeFocusTaskId={activeFocusTaskId}
                focusSecondsRemaining={focusSecondsRemaining}
                focusTotalSeconds={focusTotalSeconds}
                isTimerRunning={isTimerRunning}
                isCommandBarOpen={isCommandBarOpen}
                showOnboarding={showOnboarding}
                onCompleteOnboarding={handleCompleteOnboarding}
                onSkipOnboarding={handleSkipOnboarding}
                toast={toast}
                onDismissToast={dismissToast}
                onOpenCommandBar={() => setIsCommandBarOpen(true)}
                onCloseCommandBar={() => setIsCommandBarOpen(false)}
                onExecuteTask={handleExecuteTask}
                onCompleteTaskInstant={handleCompleteTaskInstant}
                onFocusTask={handleOpenDesktopFocusForTask}
                onResetTasks={handleResetTasks}
                onExecuteSignal={handleExecuteSignal}
                onPromoteSignal={handlePromoteSignal}
                onArchiveSignal={handleArchiveSignal}
                onSweepNoise={handleSweepNoise}
                onResetInbox={handleResetInbox}
                onDeclineEvent={handleDeclineEvent}
                onRescheduleEvent={handleRescheduleEvent}
                onAddFocusBlock={handleAddFocusBlock}
                onResetCalendar={handleResetCalendar}
                onToggleRule={handleToggleRule}
                onRunRule={handleRunRule}
                onCreateRule={handleCreateRule}
                onToggleTimer={() => setIsTimerRunning((r) => !r)}
                onResetTimer={handleResetTimer}
                onExtendTimer={handleExtendTimer}
                onSelectFocusTask={handleSelectFocusTask}
                onExecuteCommand={handleExecuteCommand}
              />
            ) : (
              <AndroidFrame
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
                canAddFocusBlock={Boolean(nextAvailableSlot)}
                hasScheduleChanges={hasScheduleChanges}
                activeFocusTaskId={activeFocusTaskId}
                focusSecondsRemaining={focusSecondsRemaining}
                focusTotalSeconds={focusTotalSeconds}
                isTimerRunning={isTimerRunning}
                showOnboarding={showOnboarding}
                onCompleteOnboarding={handleCompleteOnboarding}
                onSkipOnboarding={handleSkipOnboarding}
                toast={toast}
                onDismissToast={dismissToast}
                onExecuteTask={handleExecuteTask}
                onCompleteTaskInstant={handleCompleteTaskInstant}
                onResetTasks={handleResetTasks}
                onExecuteSignal={handleExecuteSignal}
                onPromoteSignal={handlePromoteSignal}
                onArchiveSignal={handleArchiveSignal}
                onSweepNoise={handleSweepNoise}
                onResetInbox={handleResetInbox}
                onDeclineEvent={handleDeclineEvent}
                onRescheduleEvent={handleRescheduleEvent}
                onAddFocusBlock={handleAddFocusBlock}
                onResetCalendar={handleResetCalendar}
                onToggleRule={handleToggleRule}
                onRunRule={handleRunRule}
                onCreateRule={handleCreateRule}
                onToggleTimer={() => setIsTimerRunning((r) => !r)}
                onResetTimer={handleResetTimer}
                onExtendTimer={handleExtendTimer}
                onSelectFocusTask={handleSelectFocusTask}
                onExecuteCommand={handleExecuteCommand}
              />
            )}
          </div>

          {/* Subtle Showcase Caption */}
          <div className="gsap-stage-caption mt-5 flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#86868B]">
            <span>
              {viewportMode === 'desktop'
                ? '1200 × 760px • Desktop Frame'
                : '390 × 844px • Android Frame'}
            </span>
            <span className="text-white/15">•</span>
            <span>
              {viewportMode === 'desktop'
                ? 'Press ⌘K / Ctrl+K for Command Bar'
                : 'Tap action button for Quick Command'}
            </span>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
