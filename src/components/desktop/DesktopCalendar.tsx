import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  RotateCcw,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import {
  CALENDAR_BUSY_DAYS,
  CalendarEventItem,
  OTHER_DAY_CALENDAR_EVENTS,
} from '../../data/mockData';
import { AnimatedCounter } from '../AnimatedCounter';
import { EASE_OUT_EXPO, SPRING_INDICATOR } from '../../lib/motion';

interface DesktopCalendarProps {
  events: CalendarEventItem[];
  executingEventId: string | null;
  canAddFocusBlock: boolean;
  hasScheduleChanges: boolean;
  onDeclineEvent: (eventId: string) => void;
  onRescheduleEvent: (eventId: string) => void;
  onAddFocusBlock: () => void;
  onResetCalendar: () => void;
}

interface DayCell {
  day: number;
  inMonth: boolean;
  weekdayIndex: number;
}

const WEEKDAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TODAY_DAY = 20;

// Calibrated so Nov 20 aligns on Thursday (index 4), matching "Thu, Nov 20" across Shift.
const NOVEMBER_CELLS: DayCell[] = [
  { day: 26, inMonth: false, weekdayIndex: 0 },
  { day: 27, inMonth: false, weekdayIndex: 1 },
  { day: 28, inMonth: false, weekdayIndex: 2 },
  { day: 29, inMonth: false, weekdayIndex: 3 },
  { day: 30, inMonth: false, weekdayIndex: 4 },
  { day: 31, inMonth: false, weekdayIndex: 5 },
  ...Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    inMonth: true,
    weekdayIndex: (6 + i) % 7,
  })),
  { day: 1, inMonth: false, weekdayIndex: 1 },
  { day: 2, inMonth: false, weekdayIndex: 2 },
  { day: 3, inMonth: false, weekdayIndex: 3 },
  { day: 4, inMonth: false, weekdayIndex: 4 },
  { day: 5, inMonth: false, weekdayIndex: 5 },
  { day: 6, inMonth: false, weekdayIndex: 6 },
];

export const DesktopCalendar: React.FC<DesktopCalendarProps> = ({
  events,
  executingEventId,
  canAddFocusBlock,
  hasScheduleChanges,
  onDeclineEvent,
  onRescheduleEvent,
  onAddFocusBlock,
  onResetCalendar,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(TODAY_DAY);
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const [expandedEventId, setExpandedEventId] = useState<string>('cal-2');

  const isToday = selectedDay === TODAY_DAY;
  const displayedEvents: CalendarEventItem[] = isToday
    ? events
    : (OTHER_DAY_CALENDAR_EVENTS[selectedDay] ?? []);

  const scheduledCount = displayedEvents.filter((e) => e.status === 'scheduled').length;
  const protectedCount = displayedEvents.filter((e) => e.status === 'protected').length;

  const selectedFlatIdx = NOVEMBER_CELLS.findIndex((c) => c.inMonth && c.day === selectedDay);
  const weekRowStart = selectedFlatIdx >= 0 ? Math.floor(selectedFlatIdx / 7) * 7 : 21;
  const visibleWeekCells = NOVEMBER_CELLS.slice(weekRowStart, weekRowStart + 7);

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const list = day === TODAY_DAY ? events : (OTHER_DAY_CALENDAR_EVENTS[day] ?? []);
    const firstActive = list.find((e) => e.status === 'scheduled') ?? list[0];
    setExpandedEventId(firstActive?.id ?? '');
  };

  const stepDay = (delta: number) => {
    const next = Math.min(30, Math.max(1, selectedDay + delta));
    handleSelectDay(next);
  };

  const getDaySummaryTag = (day: number): string => {
    if (day === TODAY_DAY) {
      const c = events.filter((e) => e.status === 'scheduled').length;
      return `${c} mtg`;
    }
    const list = OTHER_DAY_CALENDAR_EVENTS[day];
    if (list && list.length > 0) {
      return `${list.length} item${list.length > 1 ? 's' : ''}`;
    }
    const load = CALENDAR_BUSY_DAYS[day];
    if (load === 'protected') return 'Focus';
    if (load === 'heavy') return '3 mtg';
    if (load === 'scheduled') return '1 mtg';
    return 'Open';
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-7 py-6">
      {/* Top Page Header */}
      <div className="flex shrink-0 items-start justify-between gap-4 pb-5 hairline-b">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[#86868B]">
            <span>{isToday ? 'Thu, Nov 20' : `Nov ${selectedDay}, 2026`}</span>
            <span className="text-white/20">/</span>
            <span className="text-[#F5F5F7]">
              <AnimatedCounter value={scheduledCount} /> meetings
            </span>
            <span className="text-white/20">•</span>
            <span>
              <AnimatedCounter value={protectedCount} /> shielded
            </span>
          </div>
          <h1 className="mt-1.5 text-[22px] font-medium tracking-[-0.025em] text-[#F5F5F7]">
            Calendar
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {selectedDay !== TODAY_DAY && (
            <button
              onClick={() => handleSelectDay(TODAY_DAY)}
              className="pressable rounded-lg bg-[#111113] px-3 py-2 font-mono text-[11px] text-[#F5F5F7] hairline-border hover:bg-[#1A1A1E]"
            >
              Jump to Today
            </button>
          )}
          {isToday && hasScheduleChanges && (
            <button
              onClick={onResetCalendar}
              className="pressable flex items-center gap-1.5 rounded-lg bg-[#111113] px-2.5 py-2 font-mono text-[11px] text-[#86868B] hairline-border hover:text-[#F5F5F7]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
          {isToday && (
            <button
              disabled={Boolean(executingEventId) || !canAddFocusBlock}
              onClick={onAddFocusBlock}
              className="pressable flex items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-3 py-2 text-[12px] font-semibold text-[#060607] hover:opacity-90 disabled:opacity-45"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>{canAddFocusBlock ? 'Lock Focus Block' : 'Day Shielded'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Calendar Strip (Above Tasks) */}
      <section className="shift-anim-card mt-5 shrink-0 overflow-hidden rounded-2xl bg-[#111113] p-4 hairline-border">
        {/* Horizontal Strip Controls */}
        <div className="mb-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-medium tracking-[-0.02em] text-[#F5F5F7]">
              November <span className="font-mono text-[12px] text-[#86868B]">2026</span>
            </h2>
            <span className="hidden items-center gap-1.5 rounded-md bg-[#0B0B0D] px-2 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border sm:inline-flex">
              <Shield className="h-3 w-3" />
              <span>Auto-conflict guard active</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stepDay(calendarMode === 'week' ? -7 : -1)}
              aria-label="Previous"
              className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#0B0B0D] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>

            <div className="flex items-center rounded-lg bg-[#0B0B0D] p-0.5 hairline-border">
              {(['week', 'month'] as const).map((m) => {
                const active = calendarMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCalendarMode(m)}
                    className={`pressable relative rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${active ? 'text-[#F5F5F7]' : 'text-[#86868B] hover:text-[#F5F5F7]'
                      }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desk-cal-mode-pill"
                        transition={SPRING_INDICATOR}
                        className="absolute inset-0 rounded-md bg-[#1A1A1E] hairline-border"
                      />
                    )}
                    <span className="relative z-10">{m}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => stepDay(calendarMode === 'week' ? 7 : 1)}
              aria-label="Next"
              className="pressable flex h-7 w-7 items-center justify-center rounded-md bg-[#0B0B0D] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Horizontal Week Strip (Default) OR Compact Full-Width Month Matrix */}
        <motion.div
          key={`desk-cal-${calendarMode}`}
          initial={{ opacity: 0.7, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
        >
          {calendarMode === 'week' ? (
            <div className="grid grid-cols-7 gap-2">
              {visibleWeekCells.map((cell, idx) => {
                const isSelected = cell.inMonth && cell.day === selectedDay;
                const isCellToday = cell.inMonth && cell.day === TODAY_DAY;
                const load = cell.inMonth ? CALENDAR_BUSY_DAYS[cell.day] : undefined;
                const summaryTag = cell.inMonth ? getDaySummaryTag(cell.day) : '';

                return (
                  <button
                    key={`wk-${cell.day}-${idx}`}
                    type="button"
                    disabled={!cell.inMonth}
                    onClick={() => cell.inMonth && handleSelectDay(cell.day)}
                    aria-pressed={isSelected}
                    className={`pressable flex flex-col justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${!cell.inMonth
                      ? 'cursor-default bg-[#09090B] opacity-35'
                      : isSelected
                        ? 'bg-[#F5F5F7] text-[#060607]'
                        : load
                          ? 'bg-[#1A1A1E] text-[#F5F5F7] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-white/[0.11] hover:bg-[#232329]'
                          : 'bg-[#0B0B0D] text-[#86868B] ring-1 ring-inset ring-white/[0.05] hover:bg-[#151519] hover:text-[#F5F5F7]'
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`font-mono text-[10px] font-medium ${isSelected ? 'text-[#060607]/70' : 'text-[#86868B]'
                          }`}
                      >
                        {WEEKDAYS_SHORT[cell.weekdayIndex]}
                      </span>
                      {cell.inMonth && (isCellToday || load) && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isCellToday || load === 'heavy'
                            ? 'bg-[#FF2A36]'
                            : isSelected
                              ? 'bg-[#060607]/45'
                              : 'bg-[#F5F5F7]/50'
                            }`}
                        />
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline justify-between gap-1">
                      <span
                        className={`font-mono text-[17px] font-medium leading-none tabular-nums ${isSelected ? 'text-[#060607]' : 'text-[#F5F5F7]'
                          }`}
                      >
                        {cell.day}
                      </span>
                      {cell.inMonth && (
                        <span
                          className={`font-mono text-[10px] tabular-nums ${isSelected ? 'text-[#060607]/70' : 'text-[#86868B]'
                            }`}
                        >
                          {summaryTag}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center">
                {WEEKDAYS_SHORT.map((label, idx) => (
                  <span key={idx} className="font-mono text-[10px] text-[#86868B]">
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {NOVEMBER_CELLS.map((cell, idx) => {
                  const isSelected = cell.inMonth && cell.day === selectedDay;
                  const isCellToday = cell.inMonth && cell.day === TODAY_DAY;
                  const load = cell.inMonth ? CALENDAR_BUSY_DAYS[cell.day] : undefined;

                  return (
                    <button
                      key={`mo-${cell.inMonth ? 'in' : 'out'}-${cell.day}-${idx}`}
                      type="button"
                      disabled={!cell.inMonth}
                      onClick={() => cell.inMonth && handleSelectDay(cell.day)}
                      className={`pressable flex h-8 items-center justify-between rounded-lg px-2.5 font-mono text-[11.5px] tabular-nums transition-colors ${!cell.inMonth
                        ? 'cursor-default text-[#86868B]/30'
                        : isSelected
                          ? 'bg-[#F5F5F7] font-semibold text-[#060607]'
                          : load
                            ? 'bg-[#1A1A1E] text-[#F5F5F7] ring-1 ring-inset ring-white/[0.11] hover:bg-[#232329]'
                            : 'bg-[#0B0B0D] text-[#86868B] ring-1 ring-inset ring-white/[0.04] hover:bg-[#151519] hover:text-[#F5F5F7]'
                        }`}
                    >
                      <span>{cell.day}</span>
                      {cell.inMonth && (isCellToday || load) && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isCellToday || load === 'heavy'
                            ? 'bg-[#FF2A36]'
                            : isSelected
                              ? 'bg-[#060607]/45'
                              : 'bg-[#F5F5F7]/50'
                            }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Now Indicator Strip (when viewing Today) */}
      {isToday && (
        <div className="mb-3 mt-5 flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1.5 rounded bg-[#111113] px-2 py-0.5 font-mono text-[10.5px] tabular-nums text-[#F5F5F7] hairline-border">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A36]" />
            <span>NOW 09:42</span>
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="font-mono text-[10.5px] text-[#86868B]">
            Click any block to inspect or reschedule
          </span>
        </div>
      )}

      {/* Full-Width Split-Column Agenda Rows Below Calendar */}
      <motion.div
        key={`day-list-${selectedDay}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
        className={`shrink-0 space-y-2.5 pb-6 ${isToday ? '' : 'mt-5'}`}
      >
        {displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#111113] px-6 py-12 text-center hairline-border">
            <Lock className="h-5 w-5 text-[#86868B]" strokeWidth={1.6} />
            <p className="mt-3 text-[14px] font-medium text-[#F5F5F7]">Open execution day</p>
            <p className="mt-1 max-w-xs text-[12.5px] text-[#86868B]">
              Zero meetings booked on Nov {selectedDay}. Full uninterrupted focus window.
            </p>
          </div>
        ) : (
          displayedEvents.map((ev) => {
            const isExpanded = expandedEventId === ev.id;
            const isRunning = executingEventId === ev.id;
            const isDeclined = ev.status === 'declined';
            const isProtected = ev.status === 'protected';

            return (
              <motion.div
                key={ev.id}
                layout="position"
                transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                className={`relative overflow-hidden rounded-2xl transition-colors ${
                  isDeclined
                    ? 'bg-[#0A0A0C] opacity-60 hairline-border'
                    : isExpanded
                      ? 'bg-[#1A1A1E] ring-1 ring-inset ring-white/20'
                      : 'bg-[#111113] hairline-border hover:bg-[#151518]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedEventId(isExpanded ? '' : ev.id)}
                  className="flex w-full items-stretch gap-4 px-5 py-3.5 text-left"
                >
                  {/* Left Fixed Time Column */}
                  <div className="flex w-[86px] shrink-0 flex-col justify-center font-mono tabular-nums">
                    <span
                      className={`text-[12.5px] font-medium ${isExpanded ? 'text-[#F5F5F7]' : 'text-[#86868B]'
                        }`}
                    >
                      {ev.startTime}
                    </span>
                    {isExpanded && (
                      <span className="mt-0.5 text-[11px] text-[#86868B]">– {ev.endTime}</span>
                    )}
                  </div>

                  {/* Crisp Vertical Hairline Divider */}
                  <div
                    className={`w-px shrink-0 ${isExpanded ? 'bg-white/20' : 'bg-white/[0.08]'
                      }`}
                  />

                  {/* Right Content Column */}
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`truncate text-[14px] font-medium ${isDeclined ? 'text-[#86868B] line-through' : 'text-[#F5F5F7]'
                          }`}
                      >
                        {ev.title}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        {isProtected && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[10px] text-[#F5F5F7] hairline-border">
                            <Lock className="h-2.5 w-2.5" />
                            <span>SHIELDED</span>
                          </span>
                        )}
                        {isDeclined && (
                          <span className="rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[10px] text-[#86868B] hairline-border">
                            AUTO-DECLINED
                          </span>
                        )}
                        {ev.rescheduled && !isDeclined && (
                          <span className="rounded bg-[#111113] px-1.5 py-0.5 font-mono text-[10px] text-[#30D158] hairline-border">
                            OPTIMIZED
                          </span>
                        )}
                        <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">
                          {ev.durationLabel}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-1">
                            {ev.briefBullets.map((note, idx) => (
                              <p
                                key={idx}
                                className="max-w-[68ch] text-[12.5px] leading-relaxed text-[#86868B]"
                              >
                                {note}
                              </p>
                            ))}
                            <div className="flex flex-wrap items-center gap-3 pt-1.5 font-mono text-[11px] text-[#F5F5F7]/85">
                              <span>{ev.location}</span>
                              <span className="text-white/20">•</span>
                              <span className="inline-flex items-center gap-1.5 text-[#86868B]">
                                <Users className="h-3 w-3" />
                                {ev.attendees.join(', ')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>

                {/* Inline Action Bar on Expanded Scheduled Events */}
                <AnimatePresence initial={false}>
                  {isExpanded && isToday && ev.status === 'scheduled' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-end gap-2 bg-[#141418] px-5 py-2.5 hairline-t">
                        <button
                          disabled={Boolean(executingEventId)}
                          onClick={() => onRescheduleEvent(ev.id)}
                          className="pressable inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1E] px-3 py-1.5 text-[11.5px] font-medium text-[#F5F5F7] hairline-border hover:bg-[#25252C] disabled:opacity-50"
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Optimize Time Slot</span>
                        </button>
                        <button
                          disabled={Boolean(executingEventId)}
                          onClick={() => onDeclineEvent(ev.id)}
                          className="pressable inline-flex items-center gap-1.5 rounded-lg bg-[#111113] px-3 py-1.5 text-[11.5px] font-medium text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7] disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline &amp; Send Async Note</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
          })
        )}
      </motion.div>
    </div>
  );
};
