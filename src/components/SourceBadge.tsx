import React from 'react';
import { Calendar, GitBranch, Mail, Terminal } from 'lucide-react';
import { SourceType } from '../data/mockData';

interface SourceBadgeProps {
  source: SourceType | 'System';
  refText?: string;
  compact?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, refText, compact = false }) => {
  const Icon =
    source === 'Gmail'
      ? Mail
      : source === 'Linear'
        ? GitBranch
        : source === 'Calendar'
          ? Calendar
          : Terminal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded bg-[#1A1A1E] hairline-border font-mono text-[#86868B] ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <Icon className="h-3 w-3 text-[#F5F5F7]/75" strokeWidth={1.75} />
      <span className="text-[#F5F5F7]/85">{source}</span>
      {refText && (
        <>
          <span className="text-[#86868B]/50">/</span>
          <span className="text-[#86868B]">{refText}</span>
        </>
      )}
    </span>
  );
};
