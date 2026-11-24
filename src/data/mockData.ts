export type SourceType = 'Gmail' | 'Linear' | 'Calendar';

export interface FocusResource {
  id: string;
  label: string;
  meta: string;
  type: 'diff' | 'doc' | 'thread' | 'spec';
}

export interface PriorityTask {
  id: string;
  title: string;
  summary: string;
  source: SourceType;
  sourceRef: string;
  meta: string;
  priority: 'P0' | 'P1' | 'SYNC';
  actionLabel: 'Execute' | 'Done';
  executedLogTitle: string;
  executedLogDetail: string;
  durationSeconds: number;
  completed: boolean;
  resources: [FocusResource, FocusResource];
}

export interface BackgroundActivityItem {
  id: string;
  title: string;
  detail: string;
  source: SourceType | 'System';
  timestamp: string;
  isNew?: boolean;
}

export interface ExecutableCommand {
  id: string;
  label: string;
  mobileLabel: string;
  detail: string;
  source: SourceType | 'System';
  shortcut: string;
  resultTitle: string;
  resultDetail: string;
}

export interface InboxSignal {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  bullets: string[];
  stagedAction?: string;
  source: SourceType;
  sourceRef: string;
  timestamp: string;
  category: 'decision' | 'drafted' | 'noise';
  resolved: boolean;
  weight?: number; // allows compact bundled noise signals so total count starts at 12
}

export interface CalendarEventItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
  attendees: string[];
  status: 'scheduled' | 'protected' | 'declined';
  briefBullets: string[];
  location: string;
  rescheduled?: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  source: SourceType | 'System';
  enabled: boolean;
  runsThisWeek: number;
  lastRun: string;
  testLogTitle: string;
  testLogDetail: string;
}

export const INITIAL_TASKS: PriorityTask[] = [
  {
    id: 'task-1',
    title: 'Approve v2.4 auth token rotation PR',
    summary: 'Blocking staging deploy. Security checks passed; 2-line diff verified for sign-off.',
    source: 'Linear',
    sourceRef: 'LIN-418',
    meta: 'Due 11:00',
    priority: 'P0',
    actionLabel: 'Execute',
    executedLogTitle: 'Approved PR #1842 & merged to staging',
    executedLogDetail: 'Linear • LIN-418 transitioned to In QA',
    durationSeconds: 25 * 60,
    completed: false,
    resources: [
      {
        id: 'res-1a',
        label: 'PR #1842 — auth-token-rotation.diff',
        meta: '+14 / -12 lines • CI Passed',
        type: 'diff',
      },
      {
        id: 'res-1b',
        label: 'Security-Signoff-v2.4.md',
        meta: 'Updated 18m ago • 0 blockers',
        type: 'doc',
      },
    ],
  },
  {
    id: 'task-2',
    title: 'Confirm Q4 enterprise SLA terms with Marcus',
    summary: 'Extracted 3 legal redlines from Stripe thread and staged final approval response.',
    source: 'Gmail',
    sourceRef: '3 msgs',
    meta: '14m ago',
    priority: 'P0',
    actionLabel: 'Execute',
    executedLogTitle: 'Sent SLA confirmation to Marcus',
    executedLogDetail: 'Gmail • Thread archived & deal owner CC’d',
    durationSeconds: 15 * 60,
    completed: false,
    resources: [
      {
        id: 'res-2a',
        label: 'Re: Stripe Q4 SLA Redlines (Draft Ready)',
        meta: 'Gmail Thread • 3 messages',
        type: 'thread',
      },
      {
        id: 'res-2b',
        label: 'Enterprise_SLA_Appendix_B.pdf',
        meta: 'Clause 4.2 highlighted • 2 pages',
        type: 'spec',
      },
    ],
  },
  {
    id: 'task-3',
    title: 'Architecture review: edge sync latency',
    summary: 'Brief compiled from 2 RFCs. Overlapping Design Sync already declined automatically.',
    source: 'Calendar',
    sourceRef: '14:00',
    meta: 'In 1h 18m',
    priority: 'SYNC',
    actionLabel: 'Done',
    executedLogTitle: 'Marked architecture review brief complete',
    executedLogDetail: 'Calendar • Agenda & benchmarks pinned',
    durationSeconds: 30 * 60,
    completed: false,
    resources: [
      {
        id: 'res-3a',
        label: 'RFC-091 — Sub-40ms Edge Replication',
        meta: 'Compiled Brief • 4 key decisions',
        type: 'spec',
      },
      {
        id: 'res-3b',
        label: 'us-east-p99-latency-trace.json',
        meta: 'Telemetry Snapshot • Today 09:15',
        type: 'doc',
      },
    ],
  },
  {
    id: 'task-4',
    title: 'Ship telemetry worker hotfix to production',
    summary: 'Memory leak isolated in worker pool #3. Canary running clean at 0.02% error rate.',
    source: 'Linear',
    sourceRef: 'LIN-429',
    meta: 'Due 16:30',
    priority: 'P1',
    actionLabel: 'Execute',
    executedLogTitle: 'Promoted worker hotfix to 100% traffic',
    executedLogDetail: 'Linear • LIN-429 closed & release tagged',
    durationSeconds: 20 * 60,
    completed: false,
    resources: [
      {
        id: 'res-4a',
        label: 'worker-pool-flush.patch',
        meta: 'Canary 0.02% err • Ready to promote',
        type: 'diff',
      },
      {
        id: 'res-4b',
        label: 'Incident-044-Postmortem-Draft.md',
        meta: 'Auto-populated timeline',
        type: 'doc',
      },
    ],
  },
  {
    id: 'task-5',
    title: 'Sign off Q1 infrastructure spend cap',
    summary: 'Finance requested final confirmation on reserved GPU & edge egress budget (+4.2%).',
    source: 'Gmail',
    sourceRef: '2 msgs',
    meta: 'Due 17:00',
    priority: 'P1',
    actionLabel: 'Execute',
    executedLogTitle: 'Approved Q1 infrastructure spend cap',
    executedLogDetail: 'Gmail • Confirmation routed to Finance Ops',
    durationSeconds: 15 * 60,
    completed: false,
    resources: [
      {
        id: 'res-5a',
        label: 'Q1-Cloud-Spend-Delta.csv',
        meta: '+4.2% QoQ • Within threshold',
        type: 'spec',
      },
      {
        id: 'res-5b',
        label: 'Re: Q1 Infrastructure Approval (Draft)',
        meta: 'Finance Ops • Ready to send',
        type: 'thread',
      },
    ],
  },
];

export const INITIAL_INBOX_SIGNALS: InboxSignal[] = [
  {
    id: 'sig-1',
    sender: 'Elena Vance (Security)',
    subject: 'SOC2 Type II penetration report ready for signature',
    preview: 'Zero high-severity findings. Shift prepared approval signature and archived raw logs.',
    bullets: [
      'External audit completed with 0 critical and 0 high findings.',
      'Requires 1-click sign-off before 18:00 to publish trust portal badge.',
    ],
    stagedAction: 'Sign & reply: "Verified. Approved for trust portal publication."',
    source: 'Gmail',
    sourceRef: 'SOC2',
    timestamp: '09:38',
    category: 'drafted',
    resolved: false,
    weight: 1,
  },
  {
    id: 'sig-2',
    sender: 'Linear Bot',
    subject: 'LIN-435: Android offline queue race condition on reconnect',
    preview: 'Flagged by mobile telemetry; reproducible on flaky LTE handoff. Needs owner assignment.',
    bullets: [
      'Affects 0.8% of Android sessions resuming from airplane mode.',
      'Suggested owner: @diego (authored sync queue engine).',
    ],
    stagedAction: 'Assign to @diego as P1 in Cycle 24',
    source: 'Linear',
    sourceRef: 'LIN-435',
    timestamp: '09:24',
    category: 'decision',
    resolved: false,
    weight: 1,
  },
  {
    id: 'sig-3',
    sender: 'David Park (Stripe)',
    subject: 'Contract addendum: EU data residency start date',
    preview: 'Confirmed Dec 1 rollout window; asks whether Frankfurt cluster is live for staging.',
    bullets: [
      'EU-Central cluster passed synthetic checks at 28ms p99.',
      'Staged reply confirms staging access link for Monday 09:00 CET.',
    ],
    stagedAction: 'Send staged reply with eu-staging credentials link',
    source: 'Gmail',
    sourceRef: 'Enterprise',
    timestamp: '09:11',
    category: 'drafted',
    resolved: false,
    weight: 1,
  },
  {
    id: 'sig-4',
    sender: 'Calendar Engine',
    subject: 'Conflict detected: Product Review vs. Candidate Debrief',
    preview: 'Both booked at 15:00 tomorrow. Candidate Debrief has 3 interviewers available at 16:00.',
    bullets: [
      'Product Review includes 6 stakeholders (high reschedule cost).',
      'Shift found a clean 16:00 slot with 100% interviewer availability.',
    ],
    stagedAction: 'Move Candidate Debrief to 16:00 & notify panel',
    source: 'Calendar',
    sourceRef: 'Conflict',
    timestamp: '08:52',
    category: 'decision',
    resolved: false,
    weight: 1,
  },
  {
    id: 'sig-5',
    sender: 'Linear Bot',
    subject: 'LIN-441: Command Bar shortcut telemetry spike on Linux',
    preview: 'Minor focus-trap edge case when Ctrl+K fires inside Monaco editor panes.',
    bullets: [
      'Non-blocking UX paper-cut reported by 2 beta users.',
      'Can be promoted to Priorities or deferred to next polish sprint.',
    ],
    stagedAction: 'Defer to Cycle 25 polish queue',
    source: 'Linear',
    sourceRef: 'LIN-441',
    timestamp: '08:31',
    category: 'decision',
    resolved: false,
    weight: 1,
  },
  {
    id: 'sig-6',
    sender: 'Batch Digest • 7 senders',
    subject: '7 low-signal updates (GitHub notifications, SaaS receipts, newsletters)',
    preview: 'Shift scanned all 7 threads: zero decisions, zero mentions, zero deadlines detected.',
    bullets: [
      '4 automated CI/CD pass digests and 2 invoice receipts routed to accounting.',
      '1 weekly industry newsletter summarized to archive.',
    ],
    stagedAction: 'Archive all 7 low-signal threads silently',
    source: 'Gmail',
    sourceRef: '7 items',
    timestamp: '08:15',
    category: 'noise',
    resolved: false,
    weight: 7,
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: 'cal-deep-1',
    title: 'Protected Deep Work — Core Engine',
    startTime: '09:30',
    endTime: '11:00',
    durationLabel: '90m',
    attendees: ['Auto-locked by Shift'],
    status: 'protected',
    briefBullets: [
      'Slack & email notifications muted automatically.',
      'Linked to LIN-418 auth token rotation review.',
    ],
    location: 'Local Focus Shield',
  },
  {
    id: 'cal-1',
    title: 'Product Ship Sync — v2.4 Cut',
    startTime: '11:00',
    endTime: '11:30',
    durationLabel: '30m',
    attendees: ['Maya R.', 'Diego S.', 'Alex K.'],
    status: 'scheduled',
    briefBullets: [
      'Confirm staging sign-off for LIN-418 and worker pool canary.',
      'Zero unresolved blockers across mobile & desktop builds.',
    ],
    location: 'meet.shift.app/v24-cut',
  },
  {
    id: 'cal-declined',
    title: 'Weekly Marketing Sync',
    startTime: '14:00',
    endTime: '14:30',
    durationLabel: '30m',
    attendees: ['Growth Team (8)'],
    status: 'declined',
    briefBullets: [
      'Auto-declined due to overlap with Architecture Review.',
      'Async status bullet sent to organizer at 09:40.',
    ],
    location: 'Auto-declined by Shift',
  },
  {
    id: 'cal-2',
    title: 'Architecture Review: Edge Sync Latency',
    startTime: '14:00',
    endTime: '14:45',
    durationLabel: '45m',
    attendees: ['Samira T.', 'Kenji M.', 'Alex K.'],
    status: 'scheduled',
    briefBullets: [
      'Compare regional quorum vs. optimistic CRDT write path.',
      'Benchmarks from us-east-p99-latency-trace.json pinned.',
    ],
    location: 'meet.shift.app/edge-rfc-091',
  },
  {
    id: 'cal-3',
    title: 'Design System Sync — Android Ergonomics',
    startTime: '16:00',
    endTime: '16:30',
    durationLabel: '30m',
    attendees: ['Nora L.', 'Diego S.'],
    status: 'scheduled',
    briefBullets: [
      'Final review on Bottom Sheet haptic curves & thumb targets.',
      'Can move to Thu 10:00 AM if deep work block is extended.',
    ],
    location: 'figma.com/board/shift-android',
  },
];

export const CALENDAR_BUSY_DAYS: Record<number, 'scheduled' | 'protected' | 'heavy'> = {
  3: 'scheduled',
  6: 'protected',
  7: 'scheduled',
  10: 'heavy',
  12: 'scheduled',
  13: 'protected',
  14: 'scheduled',
  17: 'heavy',
  18: 'scheduled',
  19: 'protected',
  20: 'heavy',
  21: 'scheduled',
  24: 'protected',
  25: 'heavy',
  27: 'scheduled',
};

export const OTHER_DAY_CALENDAR_EVENTS: Record<number, CalendarEventItem[]> = {
  3: [
    {
      id: 'd3-1',
      title: 'Cycle 24 Kickoff — Core Priorities',
      startTime: '10:00',
      endTime: '10:45',
      durationLabel: '45m',
      attendees: ['Core Eng (6)'],
      status: 'scheduled',
      briefBullets: ['Aligned on LIN-418 auth rotation and Android sync deliverables.'],
      location: 'meet.shift.app/cycle24-kickoff',
    },
  ],
  6: [
    {
      id: 'd6-1',
      title: 'Protected Deep Work — CRDT Sync Benchmarks',
      startTime: '09:30',
      endTime: '11:30',
      durationLabel: '120m',
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: ['Zero-interruption benchmarking across EU and US edge nodes.'],
      location: 'Local Focus Shield',
    },
  ],
  7: [
    {
      id: 'd7-1',
      title: 'Weekly Design Crit — Command Bar Ergonomics',
      startTime: '14:00',
      endTime: '14:45',
      durationLabel: '45m',
      attendees: ['Nora L.', 'Alex K.'],
      status: 'scheduled',
      briefBullets: ['Signed off on keyboard shortcut hints and focus trap fixes.'],
      location: 'figma.com/board/shift-cmd',
    },
  ],
  10: [
    {
      id: 'd10-1',
      title: 'SOC2 Pre-Audit Readiness Check',
      startTime: '10:00',
      endTime: '10:45',
      durationLabel: '45m',
      attendees: ['Elena V.', 'Marcus B.'],
      status: 'scheduled',
      briefBullets: ['Verified encryption-at-rest attestations and audit log retention.'],
      location: 'meet.shift.app/soc2-prep',
    },
    {
      id: 'd10-2',
      title: 'EU Data Residency Architecture Sync',
      startTime: '13:00',
      endTime: '13:45',
      durationLabel: '45m',
      attendees: ['Samira T.', 'David P.'],
      status: 'scheduled',
      briefBullets: ['Confirmed Frankfurt cluster failover SLA under 30ms p99.'],
      location: 'meet.shift.app/eu-residency',
    },
    {
      id: 'd10-3',
      title: 'Android Offline Queue Review',
      startTime: '16:00',
      endTime: '16:30',
      durationLabel: '30m',
      attendees: ['Diego S.', 'Kenji M.'],
      status: 'scheduled',
      briefBullets: ['Reviewed LTE reconnect backoff telemetry and retry policy.'],
      location: 'meet.shift.app/android-sync',
    },
  ],
  12: [
    {
      id: 'd12-1',
      title: 'Customer Pilot Check-in (Linear Team)',
      startTime: '11:30',
      endTime: '12:00',
      durationLabel: '30m',
      attendees: ['Maya R.', 'Pilot Ops'],
      status: 'scheduled',
      briefBullets: ['Reviewed auto-triage precision metrics (97.4% accepted).'],
      location: 'meet.shift.app/pilot-linear',
    },
  ],
  13: [
    {
      id: 'd13-1',
      title: 'Protected Deep Work — Triage Engine Rules',
      startTime: '09:00',
      endTime: '11:00',
      durationLabel: '120m',
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: ['Deterministic IF/THEN rule evaluator latency cut by 34%.'],
      location: 'Local Focus Shield',
    },
  ],
  14: [
    {
      id: 'd14-1',
      title: 'Sprint Demo & Canary Sign-off',
      startTime: '15:00',
      endTime: '15:45',
      durationLabel: '45m',
      attendees: ['Product & Eng (7)'],
      status: 'scheduled',
      briefBullets: ['Demoed v2.4 onboarding flow and Android focus timer.'],
      location: 'meet.shift.app/sprint-demo',
    },
  ],
  17: [
    {
      id: 'd17-1',
      title: 'Monday Execution Triage — Release Week',
      startTime: '09:30',
      endTime: '10:00',
      durationLabel: '30m',
      attendees: ['Core Eng (5)'],
      status: 'scheduled',
      briefBullets: ['Locked release blockers: LIN-418 and worker pool #3 heap fix.'],
      location: 'meet.shift.app/release-triage',
    },
    {
      id: 'd17-2',
      title: 'Stripe Enterprise Addendum Review',
      startTime: '13:30',
      endTime: '14:15',
      durationLabel: '45m',
      attendees: ['David P.', 'Legal Ops'],
      status: 'scheduled',
      briefBullets: ['Reviewed EU staging timeline and DPA redlines.'],
      location: 'meet.shift.app/stripe-dpa',
    },
    {
      id: 'd17-3',
      title: 'v2.4 QA Bug Bash — Desktop & Android',
      startTime: '16:00',
      endTime: '16:45',
      durationLabel: '45m',
      attendees: ['Nora L.', 'Diego S.', 'Kenji M.'],
      status: 'scheduled',
      briefBullets: ['Verified zero regressions across offline sync and Command Bar.'],
      location: 'meet.shift.app/v24-qa',
    },
  ],
  18: [
    {
      id: 'd18-1',
      title: 'Protected Deep Work — Telemetry Hotfix',
      startTime: '09:00',
      endTime: '11:00',
      durationLabel: '120m',
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: ['Worker pool #3 heap profiling completed cleanly.'],
      location: 'Local Focus Shield',
    },
    {
      id: 'd18-2',
      title: 'Enterprise Security Review (Stripe)',
      startTime: '15:00',
      endTime: '15:45',
      durationLabel: '45m',
      attendees: ['Marcus B.', 'Elena V.'],
      status: 'scheduled',
      briefBullets: ['SOC2 evidence bundle verified with zero follow-ups.'],
      location: 'meet.shift.app/sec-stripe',
    },
  ],
  19: [
    {
      id: 'd19-1',
      title: 'Cycle 24 Triage & Scope Lock',
      startTime: '10:30',
      endTime: '11:00',
      durationLabel: '30m',
      attendees: ['Core Eng (5)'],
      status: 'scheduled',
      briefBullets: ['6 P3 tickets deferred automatically before standup.'],
      location: 'meet.shift.app/cycle-24',
    },
    {
      id: 'd19-2',
      title: '1:1 with Samira — Edge Replication',
      startTime: '14:30',
      endTime: '15:00',
      durationLabel: '30m',
      attendees: ['Samira T.'],
      status: 'scheduled',
      briefBullets: ['Finalized benchmark matrix ahead of Thu review.'],
      location: 'meet.shift.app/1on1-samira',
    },
  ],
  21: [
    {
      id: 'd21-1',
      title: 'Protected Deep Work — Release Hardening',
      startTime: '09:30',
      endTime: '12:00',
      durationLabel: '150m',
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: ['Reserved for v2.4 production rollout monitoring.'],
      location: 'Local Focus Shield',
    },
    {
      id: 'd21-2',
      title: 'v2.4 Go / No-Go Sign-off',
      startTime: '13:30',
      endTime: '14:00',
      durationLabel: '30m',
      attendees: ['Maya R.', 'Kenji M.', 'Diego S.'],
      status: 'scheduled',
      briefBullets: ['Automated canary scorecard attached 15m prior.'],
      location: 'meet.shift.app/v24-launch',
    },
  ],
  24: [
    {
      id: 'd24-1',
      title: 'Q1 Infrastructure Budget Sync',
      startTime: '11:00',
      endTime: '11:45',
      durationLabel: '45m',
      attendees: ['Finance Ops', 'Alex K.'],
      status: 'scheduled',
      briefBullets: ['Reserved instance delta (+4.2%) pre-approved.'],
      location: 'meet.shift.app/q1-infra',
    },
  ],
  25: [
    {
      id: 'd25-1',
      title: 'Android Beta Feedback Review',
      startTime: '10:00',
      endTime: '10:45',
      durationLabel: '45m',
      attendees: ['Nora L.', 'Diego S.'],
      status: 'scheduled',
      briefBullets: ['Shift clustered 18 beta notes into 3 gesture tweaks.'],
      location: 'figma.com/board/android-beta',
    },
    {
      id: 'd25-2',
      title: 'Protected Deep Work — Sync Engine',
      startTime: '13:00',
      endTime: '15:00',
      durationLabel: '120m',
      attendees: ['Auto-locked by Shift'],
      status: 'protected',
      briefBullets: ['Offline reconnect queue stress tests.'],
      location: 'Local Focus Shield',
    },
  ],
  27: [
    {
      id: 'd27-1',
      title: 'Post-Launch Telemetry & Retrospective',
      startTime: '11:00',
      endTime: '11:45',
      durationLabel: '45m',
      attendees: ['Core Eng (6)', 'Maya R.'],
      status: 'scheduled',
      briefBullets: ['Review v2.4 adoption metrics and Cycle 25 roadmap.'],
      location: 'meet.shift.app/v24-retro',
    },
  ],
};

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Decline overlapping low-priority meetings',
    trigger: 'IF Calendar conflict & attendee > 5',
    action: 'THEN decline + send async status brief',
    source: 'Calendar',
    enabled: true,
    runsThisWeek: 6,
    lastRun: '09:40',
    testLogTitle: 'Verified calendar conflict guard',
    testLogDetail: 'Calendar • 0 active overlaps remaining today',
  },
  {
    id: 'auto-2',
    name: 'Pre-draft VIP enterprise replies',
    trigger: 'IF Gmail from Tier-1 customer domain',
    action: 'THEN extract redlines + stage approval draft',
    source: 'Gmail',
    enabled: true,
    runsThisWeek: 11,
    lastRun: '09:34',
    testLogTitle: 'Pre-drafted 1 pending VIP reply',
    testLogDetail: 'Gmail • Staged response in Inbox queue',
  },
  {
    id: 'auto-3',
    name: 'Route P3 Linear tickets to next cycle',
    trigger: 'IF Linear issue priority == P3 & non-blocking',
    action: 'THEN snooze to Cycle 25 + tag triaged',
    source: 'Linear',
    enabled: true,
    runsThisWeek: 19,
    lastRun: '09:18',
    testLogTitle: 'Swept P3 Linear tickets to Cycle 25',
    testLogDetail: 'Linear • 3 low-impact tickets deferred',
  },
  {
    id: 'auto-4',
    name: 'Archive zero-action newsletters & digests',
    trigger: 'IF Gmail action_items == 0 & bulk sender',
    action: 'THEN archive silently + log summary',
    source: 'Gmail',
    enabled: true,
    runsThisWeek: 42,
    lastRun: '08:55',
    testLogTitle: 'Archived 4 automated digest threads',
    testLogDetail: 'Gmail • Inbox noise reduced automatically',
  },
  {
    id: 'auto-5',
    name: 'Protect 2h morning deep-work window',
    trigger: 'IF Weekday 09:30 & calendar slot open',
    action: 'THEN lock block + enable DND across devices',
    source: 'Calendar',
    enabled: true,
    runsThisWeek: 4,
    lastRun: '08:30',
    testLogTitle: 'Verified morning deep-work shield',
    testLogDetail: 'Calendar • 09:30–11:00 block remains locked',
  },
  {
    id: 'auto-6',
    name: 'Compile pre-meeting RFC & doc briefs',
    trigger: 'IF Calendar event starts in 30m',
    action: 'THEN attach top 2 linked docs to Focus Mode',
    source: 'Calendar',
    enabled: true,
    runsThisWeek: 9,
    lastRun: '08:12',
    testLogTitle: 'Compiled Architecture Review brief',
    testLogDetail: 'Calendar • 2 RFC files pinned to Focus Mode',
  },
  {
    id: 'auto-7',
    name: 'Auto-approve green dependency PRs',
    trigger: 'IF Linear/GitHub patch bump & CI == green',
    action: 'THEN approve + queue squash merge',
    source: 'Linear',
    enabled: true,
    runsThisWeek: 7,
    lastRun: 'Yesterday',
    testLogTitle: 'Checked dependency queue (all green)',
    testLogDetail: 'Linear • 1 minor SDK patch queued for merge',
  },
  {
    id: 'auto-8',
    name: 'Silence notifications during Focus Mode',
    trigger: 'IF Shift Focus timer == RUNNING',
    action: 'THEN pause Slack + batch Android alerts',
    source: 'System',
    enabled: true,
    runsThisWeek: 15,
    lastRun: 'Yesterday',
    testLogTitle: 'Tested cross-device DND sync',
    testLogDetail: 'System • Desktop & Android shields verified',
  },
];

export const INITIAL_ACTIVITIES: BackgroundActivityItem[] = [
  {
    id: 'act-1',
    title: 'Declined overlapping meeting',
    detail: 'Weekly Marketing Sync • Sent async status note',
    source: 'Calendar',
    timestamp: '09:40',
  },
  {
    id: 'act-2',
    title: 'Drafted reply to Alex',
    detail: 'Gmail • Re: SOC2 audit evidence package ready',
    source: 'Gmail',
    timestamp: '09:34',
  },
  {
    id: 'act-3',
    title: 'Triaged 11 Linear issues',
    detail: 'Routed 8 to backlog • Escalated 2 P0 blockers',
    source: 'Linear',
    timestamp: '09:18',
  },
  {
    id: 'act-4',
    title: 'Archived 14 low-signal threads',
    detail: 'Gmail • Zero action items detected',
    source: 'Gmail',
    timestamp: '08:55',
  },
];

export const DESKTOP_COMMANDS: ExecutableCommand[] = [
  {
    id: 'cmd-deep-work',
    label: 'Block 2h for deep work',
    mobileLabel: 'Block 2h focus',
    detail: 'Locks 13:00–15:00 on Calendar & enables DND',
    source: 'Calendar',
    shortcut: '⌘1',
    resultTitle: 'Blocked 2h deep work window',
    resultDetail: 'Calendar • 13:00–15:00 locked & notifications muted',
  },
  {
    id: 'cmd-summarize',
    label: 'Summarize morning emails',
    mobileLabel: 'Summarize emails',
    detail: 'Compresses 19 unread threads into 3 actionable bullets',
    source: 'Gmail',
    shortcut: '⌘2',
    resultTitle: 'Summarized 19 morning emails',
    resultDetail: 'Gmail • 3 decisions extracted, 16 archived',
  },
  {
    id: 'cmd-reschedule',
    label: 'Reschedule 4pm call',
    mobileLabel: 'Move 4pm call',
    detail: 'Moves Design Sync to Thu 10:00 AM with all attendees',
    source: 'Calendar',
    shortcut: '⌘3',
    resultTitle: 'Rescheduled 4pm Design Sync',
    resultDetail: 'Calendar • Moved to Thu 10:00 AM (4/4 free)',
  },
  {
    id: 'cmd-linear-sweep',
    label: 'Snooze low-priority Linear queue',
    mobileLabel: 'Snooze P3 queue',
    detail: 'Defers 6 non-blocking P3 tickets to next cycle',
    source: 'Linear',
    shortcut: '⌘4',
    resultTitle: 'Snoozed 6 P3 Linear tickets',
    resultDetail: 'Linear • Deferred to Cycle 24 automatically',
  },
];

export const VOICE_PRESET_COMMANDS = [
  {
    transcript: 'Block 90m focus and mute incoming alerts',
    resultTitle: 'Locked 90m focus block via voice',
    resultDetail: 'System • Calendar protected & notifications silenced',
    source: 'System' as const,
  },
  {
    transcript: 'Approve staged replies for Q4 finance thread',
    resultTitle: 'Dispatched 2 staged replies via voice',
    resultDetail: 'Gmail • Finance & Ops threads marked resolved',
    source: 'Gmail' as const,
  },
];

export function formatCurrentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
