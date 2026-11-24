import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { BackgroundActivityItem } from '../../data/mockData';
import { AnimatedCounter } from '../AnimatedCounter';
import { EASE_OUT_EXPO, SPRING_INDICATOR } from '../../lib/motion';

interface AndroidActivityProps {
  activities: BackgroundActivityItem[];
}

type ActivityFilter = 'All' | 'Gmail' | 'Linear' | 'Calendar' | 'System';

export const AndroidActivity: React.FC<AndroidActivityProps> = ({ activities }) => {
  const [filter, setFilter] = useState<ActivityFilter>('All');

  const filtered =
    filter === 'All' ? activities : activities.filter((item) => item.source === filter);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-28 pt-3">
      <div className="flex items-center justify-between pb-3.5">
        <div>
          <h1 className="text-[16px] font-medium tracking-[-0.02em] text-[#F5F5F7]">
            Activity Log
          </h1>
          <p className="mt-0.5 font-mono text-[10.5px] text-[#86868B]">
            Autonomous execution ledger
          </p>
        </div>
        <span className="rounded-md bg-[#111113] px-2 py-1 font-mono text-[10.5px] text-[#86868B] hairline-border">
          <AnimatedCounter value={activities.length} /> logged
        </span>
      </div>

      {/* Filter Pills */}
      <div className="mb-3.5 flex items-center gap-1 overflow-x-auto pb-0.5">
        {(['All', 'Gmail', 'Linear', 'Calendar', 'System'] as const).map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pressable relative shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active ? 'text-[#F5F5F7]' : 'text-[#86868B]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="android-activity-filter"
                  transition={SPRING_INDICATOR}
                  className="absolute inset-0 rounded-md bg-[#1A1A1E] hairline-border"
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-[#111113] px-4 py-8 text-center hairline-border">
          <ShieldCheck className="h-5 w-5 text-[#F5F5F7]" strokeWidth={1.6} />
          <p className="mt-2 text-[13px] font-medium text-[#F5F5F7]">
            {activities.length === 0
              ? 'No autonomous activity yet'
              : `No ${filter} events yet`}
          </p>
          <p className="mt-1 text-[11.5px] text-[#86868B]">
            {activities.length === 0
              ? 'Executed actions and background resolutions appear here.'
              : `${activities.length} total actions logged in other sources.`}
          </p>
          {activities.length > 0 && filter !== 'All' && (
            <button
              onClick={() => setFilter('All')}
              className="pressable mt-3 rounded-md bg-[#1A1A1E] px-3 py-1.5 font-mono text-[10.5px] text-[#F5F5F7] hairline-border"
            >
              Show all ({activities.length})
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout="position"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(idx * 0.015, 0.06),
                  ease: EASE_OUT_EXPO,
                }}
                className="shift-anim-card shift-light-subtle overflow-hidden rounded-xl bg-[#111113] p-3.5 hairline-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.isNew ? 'bg-[#FF2A36]' : 'bg-[#86868B]'
                      }`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#86868B]">
                      {item.source}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-[#86868B]">
                    {item.timestamp}
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] font-medium leading-snug text-[#F5F5F7]">
                  {item.title}
                </p>
                <p className="mt-1 text-[11.5px] text-[#86868B]">{item.detail}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
