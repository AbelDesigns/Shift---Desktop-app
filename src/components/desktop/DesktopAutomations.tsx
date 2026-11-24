import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X } from 'lucide-react';
import { AutomationRule } from '../../data/mockData';
import { SourceBadge } from '../SourceBadge';
import { AnimatedCounter } from '../AnimatedCounter';
import { EASE_OUT_EXPO, SPRING_TOGGLE } from '../../lib/motion';

interface DesktopAutomationsProps {
  rules: AutomationRule[];
  executingRuleId: string | null;
  onToggleRule: (ruleId: string) => void;
  onRunRule: (ruleId: string) => void;
  onCreateRule: (rule: Omit<AutomationRule, 'id' | 'runsThisWeek' | 'lastRun'>) => void;
}

export const DesktopAutomations: React.FC<DesktopAutomationsProps> = ({
  rules,
  executingRuleId,
  onToggleRule,
  onRunRule,
  onCreateRule,
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('IF Gmail unread > 24h & low priority');
  const [newAction, setNewAction] = useState('THEN archive + log digest');
  const [newSource, setNewSource] = useState<AutomationRule['source']>('Gmail');
  const [nameError, setNameError] = useState(false);

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalRuns = rules.reduce((sum, r) => sum + r.runsThisWeek, 0);

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setNameError(false);
    onCreateRule({
      name: trimmed,
      trigger: newTrigger.trim() || 'IF event matches filter',
      action: newAction.trim() || 'THEN execute autonomously',
      source: newSource,
      enabled: true,
      testLogTitle: `Ran custom rule: ${trimmed}`,
      testLogDetail: `${newSource} • Executed via Shift Automation Engine`,
    });
    setNewName('');
    setShowCreator(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-7 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-5 hairline-b">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[#86868B]">
            <span>Autonomous Pipeline</span>
            <span className="text-white/20">/</span>
            <span className="text-[#F5F5F7]">
              <AnimatedCounter value={activeCount} /> active
            </span>
            <span className="text-white/20">•</span>
            <span className="tabular-nums">
              <AnimatedCounter value={totalRuns} /> runs / 7d
            </span>
          </div>
          <h1 className="mt-1.5 text-[22px] font-medium tracking-[-0.025em] text-[#F5F5F7]">
            Automations
          </h1>
          <p className="mt-1 max-w-[60ch] text-[13px] text-[#86868B]">
            Deterministic rules running continuously across Gmail, Linear, and Calendar.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreator((prev) => !prev);
            setNameError(false);
          }}
          className="pressable flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F5F5F7] px-3 py-2 text-[12px] font-semibold text-[#060607] hover:opacity-90"
        >
          {showCreator ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>New Rule</span>
            </>
          )}
        </button>
      </div>

      {/* Inline Rule Creator */}
      <AnimatePresence>
        {showCreator && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            onSubmit={handleSubmitNew}
            className="mt-4 overflow-hidden rounded-xl bg-[#111113] p-4 hairline-border"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Rule Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder="e.g. Escalate P0 alerts to Android immediately"
                  className={`mt-1.5 w-full rounded-lg bg-[#1A1A1E] px-3 py-2 text-[12.5px] text-[#F5F5F7] placeholder-[#86868B] hairline-border focus:outline-none ${nameError ? 'border-[#FF2A36]/70' : ''
                    }`}
                />
                {nameError && (
                  <p className="mt-1 font-mono text-[10px] text-[#FF2A36]">
                    Enter a concise rule name to activate.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Pipeline Source
                </label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as AutomationRule['source'])}
                  className="mt-1.5 w-full rounded-lg bg-[#1A1A1E] px-3 py-2 text-[12.5px] text-[#F5F5F7] hairline-border focus:outline-none"
                >
                  <option value="Gmail">Gmail</option>
                  <option value="Linear">Linear</option>
                  <option value="Calendar">Calendar</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Condition
                </label>
                <input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="mt-1.5 w-full rounded-lg bg-[#1A1A1E] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.06em] text-[#86868B]">
                  Autonomous Action
                </label>
                <input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="mt-1.5 w-full rounded-lg bg-[#1A1A1E] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F7] hairline-border focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="pressable w-full rounded-lg bg-[#F5F5F7] py-2 text-[12px] font-semibold text-[#060607] hover:opacity-90"
                >
                  Activate Rule
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rules Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
        {rules.map((rule, index) => {
          const isRunning = executingRuleId === rule.id;
          return (
            <motion.div
              key={rule.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: rule.enabled ? 1 : 0.6, y: 0 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.015, 0.08),
                ease: EASE_OUT_EXPO,
              }}
              className={`shift-anim-card shift-light-subtle relative flex flex-col justify-between overflow-hidden rounded-xl p-4 hairline-border transition-colors ${
                rule.enabled
                  ? isRunning
                    ? 'bg-[#1A1A1E] border-white/15'
                    : 'bg-[#111113] hover:border-white/15'
                  : 'bg-[#0B0B0D]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <SourceBadge source={rule.source} compact />

                  {/* Spring-tuned Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rule.enabled}
                    aria-label={`Toggle ${rule.name}`}
                    onClick={() => onToggleRule(rule.id)}
                    className={`pressable relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 hairline-border transition-colors ${rule.enabled ? 'bg-[#F5F5F7]' : 'bg-[#1A1A1E]'
                      }`}
                  >
                    <motion.span
                      layout
                      transition={SPRING_TOGGLE}
                      className={`h-3.5 w-3.5 rounded-full ${rule.enabled ? 'ml-auto bg-[#060607]' : 'mr-auto bg-[#86868B]'
                        }`}
                    />
                  </button>
                </div>

                <h3 className="mt-3 text-[13.5px] font-medium text-[#F5F5F7]">{rule.name}</h3>

                <div className="mt-2.5 space-y-1 rounded-lg bg-[#0A0A0C] p-2.5 font-mono text-[10.5px] hairline-border">
                  <div className="truncate text-[#86868B]">{rule.trigger}</div>
                  <div className="truncate text-[#F5F5F7]/90">{rule.action}</div>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between pt-2.5 hairline-t">
                <div className="flex items-center gap-2 font-mono text-[10.5px] tabular-nums text-[#86868B]">
                  <span>
                    <AnimatedCounter value={rule.runsThisWeek} /> runs
                  </span>
                  <span className="text-white/15">•</span>
                  <span>Last {rule.lastRun}</span>
                </div>

                <button
                  disabled={!rule.enabled || Boolean(executingRuleId)}
                  onClick={() => onRunRule(rule.id)}
                  className="pressable inline-flex items-center gap-1.5 rounded-md bg-[#1A1A1E] px-2.5 py-1 font-mono text-[10.5px] text-[#F5F5F7] hairline-border hover:bg-[#24242A] disabled:opacity-40"
                >
                  {isRunning ? (
                    <>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2A36]" />
                      <span>Running</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>Run now</span>
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
