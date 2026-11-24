import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Command, PlayCircle } from 'lucide-react';
import { ShiftLogo } from './ShiftLogo';
import { SPRING_INDICATOR } from '../lib/motion';

export type ViewportMode = 'desktop' | 'android';

interface PortfolioHeaderProps {
  mode: ViewportMode;
  onChangeMode: (mode: ViewportMode) => void;
  isExecuting: boolean;
  showOnboarding: boolean;
  onToggleOnboarding: () => void;
  onOpenCommandBar: () => void;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  mode,
  onChangeMode,
  isExecuting,
  showOnboarding,
  onToggleOnboarding,
  onOpenCommandBar,
}) => {
  return (
    <header className="gsap-app-header fixed inset-x-0 top-0 z-40 h-14 bg-[#060607]/85 backdrop-blur-md hairline-b">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="shift-light-subtle flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-[#111113] hairline-border">
            <ShiftLogo size={15} />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-[14px] font-medium tracking-[-0.02em] text-[#F5F5F7]">
              Shift
            </span>
            <span className="hidden font-mono text-[11px] text-[#86868B] sm:inline">
              Zero chat. Pure execution.
            </span>
          </div>
        </div>

        {/* Center: Portfolio View Switcher */}
        <div
          role="tablist"
          aria-label="Prototype platform switcher"
          className="shift-light-subtle flex items-center gap-1 overflow-hidden rounded-lg bg-[#111113] p-1 hairline-border"
        >
          {(
            [
              { id: 'desktop', label: 'Desktop App', icon: Monitor },
              { id: 'android', label: 'Android App', icon: Smartphone },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onChangeMode(id)}
                className={`pressable relative flex items-center gap-2 rounded-md px-3.5 py-1.5 text-[12px] font-medium transition-colors ${active ? 'text-[#F5F5F7]' : 'text-[#86868B] hover:text-[#F5F5F7]'
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="portfolio-view-pill"
                    transition={SPRING_INDICATOR}
                    className="absolute inset-0 rounded-md bg-[#1A1A1E] hairline-border"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Onboarding Replay + Synced State + Cmd+K Hint */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleOnboarding}
            className={`pressable flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] hairline-border transition-colors ${showOnboarding
              ? 'bg-[#1A1A1E] text-[#F5F5F7] border-white/20'
              : 'bg-[#111113] text-[#86868B] hover:bg-[#1A1A1E] hover:text-[#F5F5F7]'
              }`}
          >
            <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{showOnboarding ? 'Exit Setup' : 'Onboarding'}</span>
          </button>

          <div className="hidden items-center gap-2 rounded-md bg-[#111113] px-2.5 py-1 hairline-border md:flex">
            <span className="relative flex h-2 w-2">
              {isExecuting && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2A36] opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${isExecuting ? 'bg-[#FF2A36]' : 'bg-[#30D158]'
                  }`}
              />
            </span>
            <span className="font-mono text-[11px] text-[#86868B]">
              {isExecuting ? 'Executing...' : 'Synced State'}
            </span>
          </div>

          {mode === 'desktop' && !showOnboarding && (
            <button
              onClick={onOpenCommandBar}
              className="pressable hidden items-center gap-1.5 rounded-md bg-[#111113] px-2.5 py-1 font-mono text-[11px] text-[#86868B] hairline-border hover:bg-[#1A1A1E] hover:text-[#F5F5F7] lg:flex"
            >
              <Command className="h-3 w-3" strokeWidth={1.75} />
              <span>K</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
