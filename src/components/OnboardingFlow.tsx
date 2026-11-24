import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  GitBranch,
  Mail,
  Shield,
  SlidersVertical,
  Terminal,
} from 'lucide-react';
import { SourceType } from '../data/mockData';
import { ShiftLogo } from './ShiftLogo';
import { EASE_OUT_CUBIC, EASE_OUT_EXPO } from '../lib/motion';
import { animateStaggerBoxes, useGSAP } from '../lib/gsap';

export type AutonomyPreset = 'surgical' | 'assisted' | 'full';

export interface OnboardingConfig {
  pipelines: SourceType[];
  autonomy: AutonomyPreset;
  focusWindow: string;
}

interface OnboardingFlowProps {
  variant: 'desktop' | 'android';
  onComplete: (config: OnboardingConfig) => void;
  onSkip: () => void;
}

const PIPELINE_OPTIONS: Array<{
  id: SourceType;
  label: string;
  scope: string;
  icon: typeof Mail;
}> = [
  {
    id: 'Gmail',
    label: 'Gmail',
    scope: 'Distill threads • Stage VIP replies • Archive digests',
    icon: Mail,
  },
  {
    id: 'Linear',
    label: 'Linear',
    scope: 'Escalate P0 blockers • Snooze P3 backlog items',
    icon: GitBranch,
  },
  {
    id: 'Calendar',
    label: 'Calendar',
    scope: 'Lock focus windows • Decline low-priority overlaps',
    icon: Calendar,
  },
];

const AUTONOMY_OPTIONS: Array<{
  id: AutonomyPreset;
  label: string;
  tag: string;
  description: string;
  rulesLabel: string;
}> = [
  {
    id: 'surgical',
    label: 'Surgical',
    tag: 'Recommended',
    description:
      'Auto-declines conflicts, archives zero-action threads, and stages drafts. Keeps P0 approvals manual.',
    rulesLabel: '8 rules active',
  },
  {
    id: 'assisted',
    label: 'Assisted',
    tag: 'Manual gate',
    description:
      'Compiles briefs and stages replies, but waits for your confirmation before archiving or declining.',
    rulesLabel: '4 rules active',
  },
  {
    id: 'full',
    label: 'Full Autonomy',
    tag: 'Max throughput',
    description:
      'Auto-executes green dependency merges, P3 snoozes, and calendar optimizations without interruption.',
    rulesLabel: '8 rules + auto-merge',
  },
];

const FOCUS_WINDOWS = ['09:00–11:00', '09:30–11:30', '10:00–12:00'];

const CALIBRATION_STEPS = [
  { label: 'Scanning incoming Gmail threads', result: '14 low-signal archived' },
  { label: 'Indexing Linear cycle blockers', result: '2 P0 items surfaced' },
  { label: 'Auditing today’s Calendar overlaps', result: '1 conflict resolved' },
  { label: 'Arming Shift Execution Engine', result: 'Ready' },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  variant,
  onComplete,
  onSkip,
}) => {
  const isMobile = variant === 'android';

  const [step, setStep] = useState<number>(0); // 0..3
  const [pipelines, setPipelines] = useState<SourceType[]>(['Gmail', 'Linear', 'Calendar']);
  const [pipelineMinWarning, setPipelineMinWarning] = useState<boolean>(false);
  const [autonomy, setAutonomy] = useState<AutonomyPreset>('surgical');
  const [focusWindow, setFocusWindow] = useState<string>('09:30–11:30');
  const [calibrationDoneCount, setCalibrationDoneCount] = useState<number>(0);

  const timersRef = useRef<number[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      animateStaggerBoxes(cardRef.current, '.shift-onb-item', {
        y: 14,
        duration: 0.42,
        stagger: 0.06,
      });
    },
    { dependencies: [step], scope: cardRef },
  );

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    if (step !== 3) {
      setCalibrationDoneCount(0);
      return;
    }

    CALIBRATION_STEPS.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        setCalibrationDoneCount(idx + 1);
      }, 360 * (idx + 1));
      timersRef.current.push(t);
    });

    return clearTimers;
  }, [step]);

  const isCalibrationComplete = calibrationDoneCount >= CALIBRATION_STEPS.length;

  const togglePipeline = (id: SourceType) => {
    setPipelines((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setPipelineMinWarning(true);
          return prev;
        }
        setPipelineMinWarning(false);
        return prev.filter((item) => item !== id);
      }
      setPipelineMinWarning(false);
      return [...prev, id];
    });
  };

  const handlePrimaryAction = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else if (isCalibrationComplete) {
      onComplete({ pipelines, autonomy, focusWindow });
    }
  };

  // Keyboard support on Desktop (Enter advances, Esc skips)
  useEffect(() => {
    if (isMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      } else if (e.key === 'Enter') {
        if (step < 3 || isCalibrationComplete) {
          e.preventDefault();
          handlePrimaryAction();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile, step, isCalibrationComplete, pipelines, autonomy, focusWindow]);

  const progressPct = ((step + 1) / 4) * 100;

  return (
    <div
      className={`relative flex h-full w-full flex-col bg-[#060607] ${
        isMobile ? 'px-5 pb-6 pt-2' : 'items-center justify-center px-8 py-6'
      }`}
    >
      {/* Top Progress Hairline in Shift Red (#FF2A36) */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-white/[0.06]">
        <motion.div
          className="h-full bg-[#FF2A36]"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
        />
      </div>

      {/* Main Container */}
      <div
        ref={cardRef}
        className={`relative flex w-full flex-col justify-between overflow-hidden ${
          isMobile
            ? 'h-full'
            : 'shift-light-box shift-light-box-red max-w-[540px] rounded-2xl bg-[#111113] p-7 hairline-border'
        }`}
      >
        {!isMobile && (
          <div className="shift-top-glint shift-top-glint-red" aria-hidden="true" />
        )}
        {/* Top Row: Step Counter + Skip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShiftLogo size={isMobile ? 16 : 18} />
            <span className="font-mono text-[11px] tabular-nums text-[#86868B]">
              0{step + 1} / 04
            </span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="pressable rounded-md px-2 py-1 font-mono text-[11px] text-[#86868B] hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
          >
            Skip
          </button>
        </div>

        {/* Step Body (direct keyed mount — never stalls) */}
        <div className={`my-auto overflow-y-auto ${isMobile ? 'py-5' : 'py-7'}`}>
          <motion.div
            key={`onb-step-${step}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          >
            {/* === STEP 1: PHILOSOPHY === */}
            {step === 0 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-md bg-[#1A1A1E] px-2.5 py-1 font-mono text-[10.5px] text-[#86868B] hairline-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A36]" />
                  <span>Shift Engine v2.4</span>
                </div>

                <h1
                  className={`mt-4 font-medium tracking-[-0.03em] text-[#F5F5F7] ${
                    isMobile ? 'text-[24px] leading-tight' : 'text-[28px] leading-tight'
                  }`}
                >
                  Zero chat.
                  <br />
                  Pure execution.
                </h1>

                <p className="mt-2.5 max-w-[46ch] text-[13px] leading-relaxed text-[#86868B]">
                  Shift monitors Gmail, Linear, and Calendar silently, resolves routine noise on
                  its own, and surfaces only decisions that need your sign-off.
                </p>

                <div className="mt-6 space-y-2">
                  {[
                    {
                      icon: Terminal,
                      code: '01',
                      text: 'Distills threads into one-click actions — no chat prompts.',
                    },
                    {
                      icon: Shield,
                      code: '02',
                      text: 'Protects deep-work windows and declines overlapping noise.',
                    },
                    {
                      icon: SlidersVertical,
                      code: '03',
                      text: 'Runs deterministic rules across Desktop and Android.',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.code}
                        className={`shift-onb-item shift-light-subtle flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 hairline-border ${
                          isMobile ? 'bg-[#111113]' : 'bg-[#0B0B0D]'
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1A1A1E] text-[#F5F5F7] hairline-border">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </div>
                        <p className="text-[12.5px] leading-snug text-[#F5F5F7]/90">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === STEP 2: CONNECT PIPELINES === */}
            {step === 1 && (
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                  Signal Sources
                </div>
                <h2
                  className={`mt-1.5 font-medium tracking-[-0.025em] text-[#F5F5F7] ${
                    isMobile ? 'text-[20px]' : 'text-[22px]'
                  }`}
                >
                  Connect execution pipelines
                </h2>
                <p className="mt-1 text-[12.5px] text-[#86868B]">
                  Select which tools Shift monitors in real time. At least one pipeline is required.
                </p>

                <div className="mt-5 space-y-2.5">
                  {PIPELINE_OPTIONS.map((pipe) => {
                    const Icon = pipe.icon;
                    const connected = pipelines.includes(pipe.id);
                    return (
                      <button
                        key={pipe.id}
                        type="button"
                        onClick={() => togglePipeline(pipe.id)}
                        className={`shift-onb-item shift-light-subtle pressable flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl p-3.5 text-left transition-colors ${
                          connected
                            ? 'bg-[#1A1A1E] ring-1 ring-inset ring-white/20'
                            : isMobile
                              ? 'bg-[#111113] hairline-border'
                              : 'bg-[#0B0B0D] hairline-border hover:bg-[#151519]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hairline-border ${
                              connected
                                ? 'bg-[#F5F5F7] text-[#060607]'
                                : 'bg-[#1A1A1E] text-[#86868B]'
                            }`}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.85} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13.5px] font-medium text-[#F5F5F7]">
                              {pipe.label}
                            </div>
                            <p className="mt-0.5 truncate text-[11.5px] text-[#86868B]">
                              {pipe.scope}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10.5px] ${
                            connected
                              ? 'bg-[#111113] text-[#30D158] hairline-border'
                              : 'bg-[#1A1A1E] text-[#86868B] hairline-border'
                          }`}
                        >
                          {connected ? 'Connected' : 'Connect'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between font-mono text-[11px] tabular-nums">
                  <span className="text-[#86868B]">{pipelines.length} of 3 pipelines armed</span>
                  {pipelineMinWarning && (
                    <span className="text-[#FF2A36]">Min. 1 required</span>
                  )}
                </div>
              </div>
            )}

            {/* === STEP 3: AUTONOMY & FOCUS WINDOW === */}
            {step === 2 && (
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#86868B]">
                  Execution Policy
                </div>
                <h2
                  className={`mt-1.5 font-medium tracking-[-0.025em] text-[#F5F5F7] ${
                    isMobile ? 'text-[20px]' : 'text-[22px]'
                  }`}
                >
                  Set autonomous boundaries
                </h2>
                <p className="mt-1 text-[12.5px] text-[#86868B]">
                  Choose how much Shift resolves automatically before notifying you.
                </p>

                <div className="mt-4 space-y-2">
                  {AUTONOMY_OPTIONS.map((opt) => {
                    const active = autonomy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAutonomy(opt.id)}
                        className={`shift-onb-item shift-light-subtle pressable w-full overflow-hidden rounded-xl p-3.5 text-left transition-colors ${
                          active
                            ? 'bg-[#1A1A1E] ring-1 ring-inset ring-white/20'
                            : isMobile
                              ? 'bg-[#111113] hairline-border'
                              : 'bg-[#0B0B0D] hairline-border hover:bg-[#151519]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? 'border-[#F5F5F7] bg-[#F5F5F7] text-[#060607]'
                                  : 'border-white/25'
                              }`}
                            >
                              {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                            </span>
                            <span className="text-[13.5px] font-medium text-[#F5F5F7]">
                              {opt.label}
                            </span>
                            <span className="rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[9.5px] text-[#86868B] hairline-border">
                              {opt.tag}
                            </span>
                          </div>
                          {!isMobile && (
                            <span className="font-mono text-[10px] text-[#86868B]">
                              {opt.rulesLabel}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 pl-6 text-[11.5px] leading-relaxed text-[#86868B]">
                          {opt.description}
                        </p>
                        {isMobile && (
                          <div className="mt-1.5 pl-6 font-mono text-[10px] text-[#86868B]">
                            {opt.rulesLabel}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Protected Focus Window Selector */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                    <Clock className="h-3 w-3" />
                    <span>Daily Protected Focus Window</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FOCUS_WINDOWS.map((win) => {
                      const active = focusWindow === win;
                      return (
                        <button
                          key={win}
                          type="button"
                          onClick={() => setFocusWindow(win)}
                          className={`pressable rounded-lg py-2 font-mono text-[11px] tabular-nums transition-colors ${
                            active
                              ? 'bg-[#F5F5F7] font-semibold text-[#060607]'
                              : isMobile
                                ? 'bg-[#111113] text-[#86868B] hairline-border'
                                : 'bg-[#0B0B0D] text-[#86868B] hairline-border hover:text-[#F5F5F7]'
                          }`}
                        >
                          {win}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* === STEP 4: LIVE CALIBRATION === */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.06em]">
                  <span className="relative flex h-2 w-2">
                    {!isCalibrationComplete && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        isCalibrationComplete ? 'bg-[#30D158]' : 'bg-[#FF2A36]'
                      }`}
                    />
                  </span>
                  <span className={isCalibrationComplete ? 'text-[#F5F5F7]' : 'text-[#FF2A36]'}>
                    {isCalibrationComplete ? 'Engine Calibrated' : 'Calibrating Engine...'}
                  </span>
                </div>

                <h2
                  className={`mt-2 font-medium tracking-[-0.025em] text-[#F5F5F7] ${
                    isMobile ? 'text-[20px]' : 'text-[22px]'
                  }`}
                >
                  {isCalibrationComplete ? 'Workspace ready.' : 'Running initial triage...'}
                </h2>
                <p className="mt-1 text-[12.5px] text-[#86868B]">
                  Mode:{' '}
                  <span className="font-mono text-[#F5F5F7] capitalize">{autonomy}</span> •
                  Shield:{' '}
                  <span className="font-mono tabular-nums text-[#F5F5F7]">{focusWindow}</span>
                </p>

                <div className="mt-5 space-y-2">
                  {CALIBRATION_STEPS.map((item, idx) => {
                    const done = calibrationDoneCount > idx;
                    const active = calibrationDoneCount === idx;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0.45 }}
                        animate={{ opacity: done || active ? 1 : 0.4 }}
                        transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
                        className={`flex ${
                          isMobile
                            ? 'flex-col gap-1 bg-[#111113]'
                            : 'items-center justify-between gap-3 bg-[#0B0B0D]'
                        } rounded-xl px-3.5 py-3 hairline-border`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {done ? (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#060607]">
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </span>
                          ) : active ? (
                            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FF2A36]" />
                          ) : (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-white/15" />
                          )}
                          <span className="truncate text-[12.5px] text-[#F5F5F7]">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 font-mono text-[10.5px] ${
                            isMobile ? 'pl-6' : ''
                          } ${done ? 'text-[#30D158]' : 'text-[#86868B]'}`}
                        >
                          {done ? item.result : active ? 'Running...' : 'Queued'}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer Controls */}
        <div
          className={`flex items-center justify-between gap-3 pt-4 ${
            isMobile ? 'hairline-t' : 'hairline-t'
          }`}
        >
          {step > 0 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="pressable inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A1E] px-3.5 py-2.5 text-[12.5px] font-medium text-[#86868B] hairline-border hover:text-[#F5F5F7]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    dot === step
                      ? 'w-5 bg-[#F5F5F7]'
                      : dot < step
                        ? 'w-2 bg-[#86868B]'
                        : 'w-2 bg-white/15'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={step === 3 && !isCalibrationComplete}
            onClick={handlePrimaryAction}
            className={`pressable inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] px-4 py-2.5 text-[12.5px] font-semibold text-[#060607] hover:opacity-90 disabled:opacity-45 ${
              isMobile ? 'min-w-[160px]' : 'min-w-[168px]'
            }`}
          >
            <span>
              {step === 0
                ? 'Initialize Shift'
                : step === 1
                  ? 'Continue'
                  : step === 2
                    ? 'Calibrate Engine'
                    : isCalibrationComplete
                      ? 'Enter Workspace'
                      : 'Calibrating...'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};
