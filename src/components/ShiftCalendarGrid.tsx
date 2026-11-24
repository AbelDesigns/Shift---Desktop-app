import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CALENDAR_BUSY_DAYS } from '../data/mockData';
import { EASE_OUT_EXPO, SPRING_INDICATOR } from '../lib/motion';

interface DayCell {
  day: number;
  inMonth: boolean;
  weekdayIndex: number; // 0 = Sun ... 6 = Sat
}

// November grid calibrated so Nov 20 aligns on Thursday (index 4), matching "Thu, Nov 20" across Shift.
const NOVEMBER_CELLS: DayCell[] = [
  // Leading October days (26..31) -> wait: Nov 1 on Saturday (index 6) puts Nov 20 on Thursday (index 4)!
  { day: 26, inMonth: false, weekdayIndex: 0 },
  { day: 27, inMonth: false, weekdayIndex: 1 },
  { day: 28, inMonth: false, weekdayIndex: 2 },
  { day: 29, inMonth: false, weekdayIndex: 3 },
  { day: 30, inMonth: false, weekdayIndex: 4 },
  { day: 31, inMonth: false, weekdayIndex: 5 },
  ...Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return {
      day,
      inMonth: true,
      weekdayIndex: (6 + i) % 7,
    };
  }),
  // Trailing December days (1..6) to complete 6 crisp rows? Actually 6 + 30 = 36 -> 5 weeks + 1 day;
  // let's show 5 clean rows (26..31 + 1..29) OR 6 rows; better: Oct 26..31 + Nov 1..30 + Dec 1..6 = 42 cells (6 rows).
  // Wait: if we start week on Sunday and Nov 1 is Sat (index 6), row 5 has Nov 23..29 and row 6 has Nov 30 + Dec 1..6.
  { day: 1, inMonth: false, weekdayIndex: 1 },
  { day: 2, inMonth: false, weekdayIndex: 2 },
  { day: 3, inMonth: false, weekdayIndex: 3 },
  { day: 4, inMonth: false, weekdayIndex: 4 },
  { day: 5, inMonth: false, weekdayIndex: 5 },
  { day: 6, inMonth: false, weekdayIndex: 6 },
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TODAY_DAY = 20;

interface ShiftCalendarGridProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  compact?: boolean;
}

export const ShiftCalendarGrid: React.FC<ShiftCalendarGridProps> = ({
  selectedDay,
  onSelectDay,
  compact = false,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Determine active weekday index for selectedDay
  const selectedCell = NOVEMBER_CELLS.find((c) => c.inMonth && c.day === selectedDay);
  const selectedWeekday = selectedCell?.weekdayIndex ?? 4;

  // Week slice containing selectedDay (7 cells)
  const selectedFlatIdx = NOVEMBER_CELLS.findIndex((c) => c.inMonth && c.day === selectedDay);
  const weekRowStart = selectedFlatIdx >= 0 ? Math.floor(selectedFlatIdx / 7) * 7 : 21;
  const visibleCells =
    viewMode === 'week'
      ? NOVEMBER_CELLS.slice(weekRowStart, weekRowStart + 7)
      : NOVEMBER_CELLS;

  const stepDay = (delta: number) => {
    const next = Math.min(30, Math.max(1, selectedDay + delta));
    onSelectDay(next);
  };

  return (
    <div
      className={`rounded-2xl bg-[#111113] hairline-border ${
        compact ? 'p-3.5' : 'p-5'
      }`}
    >
      {/* Top Month & Week/Month Switcher Row */}
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2
            className={`font-medium tracking-[-0.025em] text-[#F5F5F7] ${
              compact ? 'text-[16px]' : 'text-[18px]'
            }`}
          >
            November
          </h2>
          <span className="font-mono text-[10.5px] tabular-nums text-[#86868B]">2026</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => stepDay(viewMode === 'week' ? -7 : -1)}
            aria-label="Previous day"
            className="pressable flex h-6 w-6 items-center justify-center rounded-md text-[#86868B] hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>

          <div className="flex items-center rounded-lg bg-[#0A0A0C] p-0.5 hairline-border">
            {(['week', 'month'] as const).map((m) => {
              const active = viewMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMode(m)}
                  className={`pressable relative rounded-md px-2 py-0.5 text-[10.5px] font-medium capitalize transition-colors ${
                    active ? 'text-[#F5F5F7]' : 'text-[#86868B] hover:text-[#F5F5F7]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`cal-mode-pill-${compact ? 'mob' : 'desk'}`}
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
            onClick={() => stepDay(viewMode === 'week' ? 7 : 1)}
            aria-label="Next day"
            className="pressable flex h-6 w-6 items-center justify-center rounded-md text-[#86868B] hover:bg-[#1A1A1E] hover:text-[#F5F5F7]"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Weekday Labels Row */}
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((letter, idx) => (
          <span
            key={idx}
            className={`font-mono text-[10px] font-medium ${
              idx === selectedWeekday ? 'text-[#F5F5F7]' : 'text-[#86868B]'
            }`}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Tactile Rounded-Square Date Tile Grid */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0.7, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
        className="grid grid-cols-7 gap-1.5"
      >
        {visibleCells.map((cell, idx) => {
          const isSelected = cell.inMonth && cell.day === selectedDay;
          const isToday = cell.inMonth && cell.day === TODAY_DAY;
          const load = cell.inMonth ? CALENDAR_BUSY_DAYS[cell.day] : undefined;

          return (
            <button
              key={`${cell.inMonth ? 'in' : 'out'}-${cell.day}-${idx}`}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.inMonth && onSelectDay(cell.day)}
              aria-label={cell.inMonth ? `November ${cell.day}` : undefined}
              aria-pressed={isSelected}
              className={`pressable relative flex flex-col items-center justify-center rounded-[10px] font-mono tabular-nums transition-colors ${
                compact ? 'h-9 text-[12px]' : 'h-10 text-[12.5px]'
              } ${
                !cell.inMonth
                  ? 'cursor-default text-[#86868B]/30'
                  : isSelected
                    ? 'bg-[#F5F5F7] font-semibold text-[#060607]'
                    : load
                      ? 'bg-[#1A1A1E] text-[#F5F5F7] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-white/[0.11] hover:bg-[#232329]'
                      : 'bg-[#0B0B0D] text-[#86868B] ring-1 ring-inset ring-white/[0.04] hover:bg-[#151519] hover:text-[#F5F5F7]'
              }`}
            >
              <span className="leading-none">{cell.day}</span>

              {/* Micro load / today indicator dot */}
              {cell.inMonth && (isToday || load) && (
                <span
                  className={`mt-1 h-[3px] w-[3px] rounded-full ${
                    isSelected
                      ? isToday
                        ? 'bg-[#FF2A36]'
                        : 'bg-[#060607]/50'
                      : isToday || load === 'heavy'
                        ? 'bg-[#FF2A36]'
                        : load === 'protected'
                          ? 'bg-[#F5F5F7]/75'
                          : 'bg-[#86868B]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Subtle Legend */}
      <div className="mt-3.5 flex items-center justify-between pt-3 font-mono text-[10px] text-[#86868B] hairline-t">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[3px] bg-[#1A1A1E] ring-1 ring-white/15" />
            <span>Scheduled</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A36]" />
            <span>High load</span>
          </span>
        </div>
        {selectedDay !== TODAY_DAY && (
          <button
            type="button"
            onClick={() => onSelectDay(TODAY_DAY)}
            className="pressable text-[#F5F5F7] hover:underline"
          >
            Jump to Today
          </button>
        )}
      </div>
    </div>
  );
};
