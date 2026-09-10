// ────────────────────────────────────────────────────────────────────────
// Playbooks — data module.
// PB-001 is the full, live-sourced seed. PB-002..PB-005 are card-level plus
// invented full detail (see INVENTED-DETAIL comments) so every list/detail
// view has something real to render before the source prototype's actual
// data is ported in.
// ────────────────────────────────────────────────────────────────────────

export type PlaybookCategoryTag = "Onboarding" | "Renewal" | "Adoption" | "Expansion" | "Retention"
export type PlaybookStatus      = "Draft" | "Published"
export type TrustMode           = "Auto-Execute" | "Approval Required" | "Draft"
export type GateAction          = "Suppress Playbook"
export type HistoryCategory     = "Published" | "Configuration" | "Trust & NBA" | "Gates" | "Phases"

export interface PlaybookOwner {
  name:      string
  initials:  string
  colorSeed: string   // fed to AvatarCircle so a given owner's color stays stable
}

export interface PlaybookMoment {
  primaryEvent:         string
  eventSources:         string[]
  businessMeaning?:     string
  qualifyingConditions: string[]
}

export interface TrustControls {
  mode:                TrustMode
  confidenceThreshold: number   // percent, 0-100
  escalatesTo:         string
}

export interface GateOverride {
  text:   string
  action: GateAction
}

export interface CustomGate {
  text:   string
  action: string
}

export interface HardGates {
  operational: GateOverride[]
  legal:       GateOverride[]
  custom:      CustomGate[]
}

export interface PlaybookObjective {
  goalType:            string
  text:                string
  successConditionText: string
}

export interface Phase {
  id:            string
  name:          string
  durationLabel: string   // e.g. "3 Days"
  maxAttempts:   number
  channels:      string[]
  // Added in the Phases & Actions config-section prompt (phase cards need a
  // short description) — additive field, populated below for every phase.
  description:   string
}

export interface PhaseFunnelStep {
  phase: string
  pct:   number
  count: number
}

export interface BlockedReason {
  reason: string
  count:  number
}

export interface ApprovalStats {
  approved:          number
  rejected:          number
  pending:           number
  avgResolutionHours: number
}

export interface ActivityMetrics {
  momentsTriggered:          number
  momentsTriggeredDeltaPct:  number   // vs last week
  plansInstantiated:         number
  conversionRatePct:         number   // plansInstantiated / momentsTriggered
  autoExecuted:              number
  autoExecutedPct:           number
  approvalsRequired:         number
  approvalsRequiredPct:      number
  planSuccessRatePct:        number
  successCount:              number
  exitedWithoutSuccessPct:   number
  nbaSelectionRatePct:       number
  avgPlanDurationDays:       number
  accountsReached:           number
  phaseFunnel:               PhaseFunnelStep[]
  blockedReasons:            BlockedReason[]
  blockedTotal:              number
  approvals:                 ApprovalStats
}

export interface VersionEntry {
  version: string
  date:    string
  note:    string
}

export interface HistoryEntry {
  date:        string
  category:    HistoryCategory
  description: string
}

export interface Playbook {
  id:               string
  name:             string
  shortDescription: string
  categoryTag:      PlaybookCategoryTag
  status:           PlaybookStatus
  version:          string
  owner:            PlaybookOwner
  updatedRelative:  string
  trustMode:        TrustMode
  phaseCount:       number
  gateCount:        number
  moment:           PlaybookMoment
  trustControls:    TrustControls
  hardGates:        HardGates
  objective:        PlaybookObjective
  phases:           Phase[]
  knowledgePackIds: string[]
  activity:         ActivityMetrics
  versions:         VersionEntry[]
  history:          HistoryEntry[]
}

// ── PB-001 — Customer Onboarding Excellence (full, live-sourced seed) ─────

export const PB_001: Playbook = {
  id: "PB-001",
  name: "Customer Onboarding Excellence",
  shortDescription: "Guides new enterprise customers from account creation to first value in 30 days.",
  categoryTag: "Onboarding",
  status: "Published",
  version: "v2.3",
  owner: { name: "Sarah Chen", initials: "SC", colorSeed: "Sarah Chen" },
  updatedRelative: "2 days ago",
  trustMode: "Auto-Execute",
  phaseCount: 4,
  gateCount: 3,
  moment: {
    primaryEvent: "Customer Created",
    eventSources: ["CRM Platform", "Customer Platform"],
    businessMeaning: "A new enterprise account has been provisioned and is ready to begin onboarding.",
    qualifyingConditions: ["Account type = Enterprise", "Account status = Active"],
  },
  trustControls: {
    mode: "Auto-Execute",
    confidenceThreshold: 75,
    escalatesTo: "Assigned CSM",
  },
  hardGates: {
    operational: [
      { text: "Account activation confirmed in platform", action: "Suppress Playbook" },
    ],
    legal: [
      { text: "Email or SMS consent is active", action: "Suppress Playbook" },
      { text: "No suppression or DNC flag present", action: "Suppress Playbook" },
    ],
    custom: [],
  },
  objective: {
    goalType: "First Value Realization",
    text: "Drive first value realization for new enterprise customers within 30 days of account creation",
    successConditionText: "Customer achieves first meaningful product milestone within 30 days of account creation",
  },
  phases: [
    { id: "ph-1", name: "Welcome & Orientation", durationLabel: "3 Days",  maxAttempts: 3, channels: ["Email", "SMS"], description: "Introduces the account team and sets expectations for the onboarding journey." },
    { id: "ph-2", name: "Product Setup",         durationLabel: "7 Days",  maxAttempts: 4, channels: ["Email", "SMS"], description: "Guides the customer through initial configuration and integration steps." },
    { id: "ph-3", name: "First Value Milestone", durationLabel: "14 Days", maxAttempts: 5, channels: ["Email", "SMS"], description: "Drives the customer toward their first meaningful product outcome." },
    { id: "ph-4", name: "Expansion Signal",      durationLabel: "21 Days", maxAttempts: 3, channels: ["Email", "SMS"], description: "Watches for usage growth and surfaces expansion-ready accounts." },
  ],
  knowledgePackIds: ["PKG-001", "PKG-002", "PKG-003"],
  activity: {
    momentsTriggered: 342,
    momentsTriggeredDeltaPct: 12,
    plansInstantiated: 287,
    conversionRatePct: 84,
    autoExecuted: 244,
    autoExecutedPct: 85,
    approvalsRequired: 29,
    approvalsRequiredPct: 10,
    planSuccessRatePct: 71,
    successCount: 204,
    exitedWithoutSuccessPct: 29,
    nbaSelectionRatePct: 83,
    avgPlanDurationDays: 18,
    accountsReached: 261,
    phaseFunnel: [
      { phase: "Welcome & Orientation", pct: 100, count: 287 },
      { phase: "Product Setup",         pct: 87,  count: 250 },
      { phase: "First Value Milestone", pct: 73,  count: 210 },
      { phase: "Expansion Signal",      pct: 61,  count: 175 },
    ],
    blockedReasons: [
      { reason: "Email opt-out",                count: 28 },
      { reason: "Hard gate not satisfied",      count: 15 },
      { reason: "Confidence below threshold",   count: 12 },
      { reason: "Rep conflict",                 count: 6 },
      { reason: "Account suppressed",           count: 3 },
    ],
    blockedTotal: 64,
    approvals: { approved: 24, rejected: 3, pending: 2, avgResolutionHours: 4.2 },
  },
  versions: [
    { version: "v1.0", date: "2026-02-27", note: "Initial production release" },
    { version: "v2.0", date: "2026-04-15", note: "Major refactor: moved to 4-phase structure, added expansion signal phase" },
    { version: "v2.1", date: "2026-05-20", note: "Fixed gate condition for email opt-in validation" },
    { version: "v2.2", date: "2026-07-10", note: "Updated NBA confidence threshold from 70% to 75%" },
    { version: "v2.3", date: "2026-09-09", note: "Added executive touchpoint phase and refined trust thresholds" },
  ],
  history: [
    { date: "2026-02-27", category: "Published",     description: "Playbook published — v1.0 (Initial production release)" },
    { date: "2026-03-09", category: "Gates",          description: "Hard gate added: Account activation confirmed in platform" },
    { date: "2026-03-21", category: "Phases",         description: "Welcome & Orientation phase duration adjusted to 3 Days" },
    { date: "2026-04-02", category: "Configuration",  description: "Escalation contact changed from Team Lead to Assigned CSM" },
    { date: "2026-04-15", category: "Published",      description: "Playbook published — v2.0 (Major refactor: moved to 4-phase structure, added expansion signal phase)" },
    { date: "2026-04-29", category: "Phases",         description: "Expansion Signal phase added — 21 Days, Max 3 attempts, Email+SMS" },
    { date: "2026-05-13", category: "Trust & NBA",    description: "Confidence threshold set to 70%" },
    { date: "2026-05-20", category: "Gates",          description: "Playbook published — v2.1 (Fixed gate condition for email opt-in validation)" },
    { date: "2026-06-04", category: "Gates",          description: "Gate condition updated: Email or SMS consent is active" },
    { date: "2026-06-22", category: "Phases",         description: "Product Setup phase max attempts increased from 3 to 4" },
    { date: "2026-07-10", category: "Trust & NBA",    description: "Playbook published — v2.2 (Updated NBA confidence threshold from 70% to 75%)" },
    { date: "2026-07-10", category: "Trust & NBA",    description: "Confidence threshold changed from 70% to 75%" },
    { date: "2026-08-25", category: "Phases",         description: "Playbook published — v2.3 (Added executive touchpoint phase and refined trust thresholds)" },
    { date: "2026-09-09", category: "Trust & NBA",    description: "Escalation contact refined: confirmed Assigned CSM as sole escalation target" },
  ],
}

// ── PB-002..PB-005 — card-level, with invented full detail ────────────────

// INVENTED-DETAIL: not sourced from the live prototype
export const PB_002: Playbook = {
  id: "PB-002",
  name: "Renewal Optimization Strategy",
  shortDescription: "Surfaces renewal risk and readiness signals starting 90 days before contract end.",
  categoryTag: "Renewal",
  status: "Published",
  version: "v1.8",
  owner: { name: "Michael Torres", initials: "MT", colorSeed: "Michael Torres" },
  updatedRelative: "5 days ago",
  trustMode: "Approval Required",
  phaseCount: 3,
  gateCount: 2,
  moment: {
    primaryEvent: "90 Days to Renewal",
    eventSources: ["CRM Platform", "Billing Platform"],
    businessMeaning: "Contract is entering the renewal window and needs a readiness review.",
    qualifyingConditions: ["Contract status = Active", "Renewal date within 90 days"],
  },
  trustControls: { mode: "Approval Required", confidenceThreshold: 65, escalatesTo: "Assigned AE" },
  hardGates: {
    operational: [{ text: "Contract owner assigned in CRM", action: "Suppress Playbook" }],
    legal: [{ text: "No active dispute or legal hold on account", action: "Suppress Playbook" }],
    custom: [],
  },
  objective: {
    goalType: "Renewal Risk Mitigation",
    text: "Secure a signed renewal or expansion commitment before contract end date",
    successConditionText: "Renewal contract signed or expansion order placed before contract end date",
  },
  phases: [
    { id: "ph-1", name: "Health Review",       durationLabel: "10 Days", maxAttempts: 2, channels: ["Email"], description: "Reviews account health signals ahead of the renewal conversation." },
    { id: "ph-2", name: "Renewal Proposal",    durationLabel: "20 Days", maxAttempts: 3, channels: ["Email", "SMS"], description: "Delivers the renewal proposal and negotiates terms." },
    { id: "ph-3", name: "Close & Confirm",     durationLabel: "14 Days", maxAttempts: 3, channels: ["Email"], description: "Confirms the signed renewal and closes out the cycle." },
  ],
  knowledgePackIds: ["PKG-001", "PKG-004"],
  activity: {
    momentsTriggered: 156, momentsTriggeredDeltaPct: 4,
    plansInstantiated: 118, conversionRatePct: 76,
    autoExecuted: 41, autoExecutedPct: 35,
    approvalsRequired: 77, approvalsRequiredPct: 65,
    planSuccessRatePct: 64, successCount: 76, exitedWithoutSuccessPct: 36,
    nbaSelectionRatePct: 70, avgPlanDurationDays: 32, accountsReached: 112,
    phaseFunnel: [
      { phase: "Health Review",    pct: 100, count: 118 },
      { phase: "Renewal Proposal", pct: 81,  count: 96 },
      { phase: "Close & Confirm",  pct: 58,  count: 68 },
    ],
    blockedReasons: [
      { reason: "Contract owner missing", count: 9 },
      { reason: "Confidence below threshold", count: 5 },
    ],
    blockedTotal: 14,
    approvals: { approved: 52, rejected: 9, pending: 6, avgResolutionHours: 9.1 },
  },
  versions: [
    { version: "v1.0", date: "2026-03-12", note: "Initial production release" },
    { version: "v1.8", date: "2026-09-04", note: "Tuned confidence threshold and added Close & Confirm phase" },
  ],
  history: [
    { date: "2026-03-12", category: "Published", description: "Playbook published — v1.0 (Initial production release)" },
    { date: "2026-09-04", category: "Published", description: "Playbook published — v1.8 (Tuned confidence threshold and added Close & Confirm phase)" },
  ],
}

// INVENTED-DETAIL: not sourced from the live prototype
export const PB_003: Playbook = {
  id: "PB-003",
  name: "Product Adoption Accelerator",
  shortDescription: "Re-engages accounts showing low product usage before adoption risk compounds.",
  categoryTag: "Adoption",
  status: "Draft",
  version: "v0.4",
  owner: { name: "Emily Rodriguez", initials: "ER", colorSeed: "Emily Rodriguez" },
  updatedRelative: "1 day ago",
  trustMode: "Draft",
  phaseCount: 2,
  gateCount: 1,
  moment: {
    primaryEvent: "Low Engagement Detected",
    eventSources: ["Customer Platform"],
    businessMeaning: "Product usage has dropped below the adoption-health threshold for the account.",
    qualifyingConditions: ["Weekly active usage below 30% of baseline"],
  },
  trustControls: { mode: "Draft", confidenceThreshold: 60, escalatesTo: "Assigned CSM" },
  hardGates: {
    operational: [{ text: "Account is not already in an active save motion", action: "Suppress Playbook" }],
    legal: [],
    custom: [],
  },
  objective: {
    goalType: "Adoption Recovery",
    text: "Restore weekly active usage to baseline within 21 days of detection",
    successConditionText: "Weekly active usage returns to at least 80% of baseline within 21 days",
  },
  phases: [
    { id: "ph-1", name: "Re-Engagement Outreach", durationLabel: "7 Days",  maxAttempts: 3, channels: ["Email"], description: "Reaches out to accounts showing declining product usage." },
    { id: "ph-2", name: "Usage Coaching Session",  durationLabel: "14 Days", maxAttempts: 2, channels: ["Email", "SMS"], description: "Offers a coaching session to rebuild adoption habits." },
  ],
  knowledgePackIds: ["PKG-003"],
  activity: {
    momentsTriggered: 48, momentsTriggeredDeltaPct: -6,
    plansInstantiated: 21, conversionRatePct: 44,
    autoExecuted: 0, autoExecutedPct: 0,
    approvalsRequired: 21, approvalsRequiredPct: 100,
    planSuccessRatePct: 38, successCount: 8, exitedWithoutSuccessPct: 62,
    nbaSelectionRatePct: 55, avgPlanDurationDays: 12, accountsReached: 19,
    phaseFunnel: [
      { phase: "Re-Engagement Outreach", pct: 100, count: 21 },
      { phase: "Usage Coaching Session", pct: 52,  count: 11 },
    ],
    blockedReasons: [
      { reason: "Already in active save motion", count: 4 },
    ],
    blockedTotal: 4,
    approvals: { approved: 6, rejected: 2, pending: 13, avgResolutionHours: 18.5 },
  },
  versions: [
    { version: "v0.4", date: "2026-09-08", note: "Draft: initial phase and gate definitions" },
  ],
  history: [
    { date: "2026-09-08", category: "Configuration", description: "Draft created — initial phase and gate definitions" },
  ],
}

// INVENTED-DETAIL: not sourced from the live prototype
export const PB_004: Playbook = {
  id: "PB-004",
  name: "Expansion Opportunity Generator",
  shortDescription: "Flags accounts crossing usage thresholds that signal readiness for expansion.",
  categoryTag: "Expansion",
  status: "Published",
  version: "v3.1",
  owner: { name: "David Park", initials: "DP", colorSeed: "David Park" },
  updatedRelative: "3 days ago",
  trustMode: "Auto-Execute",
  phaseCount: 3,
  gateCount: 2,
  moment: {
    primaryEvent: "Usage Threshold Met",
    eventSources: ["Customer Platform", "Billing Platform"],
    businessMeaning: "Account usage has crossed a plan-capacity threshold that typically precedes an upsell conversation.",
    qualifyingConditions: ["Usage at or above 85% of plan capacity", "Account tenure >= 90 days"],
  },
  trustControls: { mode: "Auto-Execute", confidenceThreshold: 78, escalatesTo: "Assigned AE" },
  hardGates: {
    operational: [{ text: "Account not already in an open expansion opportunity", action: "Suppress Playbook" }],
    legal: [{ text: "No active dispute or legal hold on account", action: "Suppress Playbook" }],
    custom: [],
  },
  objective: {
    goalType: "Expansion Readiness",
    text: "Convert usage-threshold signals into a qualified expansion opportunity within 14 days",
    successConditionText: "Expansion opportunity created and qualified in CRM within 14 days of trigger",
  },
  phases: [
    { id: "ph-1", name: "Signal Confirmation", durationLabel: "3 Days",  maxAttempts: 2, channels: ["Email"], description: "Confirms the usage-threshold signal is genuine before engaging." },
    { id: "ph-2", name: "Value Case Delivery", durationLabel: "7 Days",  maxAttempts: 3, channels: ["Email", "SMS"], description: "Delivers a tailored value case for expanding the account." },
    { id: "ph-3", name: "Opportunity Handoff", durationLabel: "4 Days",  maxAttempts: 2, channels: ["Email"], description: "Hands the qualified opportunity to the account executive." },
  ],
  knowledgePackIds: ["PKG-001", "PKG-003"],
  activity: {
    momentsTriggered: 203, momentsTriggeredDeltaPct: 19,
    plansInstantiated: 179, conversionRatePct: 88,
    autoExecuted: 161, autoExecutedPct: 90,
    approvalsRequired: 18, approvalsRequiredPct: 10,
    planSuccessRatePct: 79, successCount: 141, exitedWithoutSuccessPct: 21,
    nbaSelectionRatePct: 88, avgPlanDurationDays: 9, accountsReached: 168,
    phaseFunnel: [
      { phase: "Signal Confirmation", pct: 100, count: 179 },
      { phase: "Value Case Delivery", pct: 91,  count: 163 },
      { phase: "Opportunity Handoff", pct: 80,  count: 143 },
    ],
    blockedReasons: [
      { reason: "Open expansion opportunity already exists", count: 11 },
      { reason: "Confidence below threshold", count: 5 },
    ],
    blockedTotal: 16,
    approvals: { approved: 15, rejected: 1, pending: 2, avgResolutionHours: 3.4 },
  },
  versions: [
    { version: "v1.0", date: "2026-01-15", note: "Initial production release" },
    { version: "v3.1", date: "2026-08-30", note: "Raised confidence threshold and added Opportunity Handoff phase" },
  ],
  history: [
    { date: "2026-01-15", category: "Published", description: "Playbook published — v1.0 (Initial production release)" },
    { date: "2026-08-30", category: "Published", description: "Playbook published — v3.1 (Raised confidence threshold and added Opportunity Handoff phase)" },
  ],
}

// INVENTED-DETAIL: not sourced from the live prototype
export const PB_005: Playbook = {
  id: "PB-005",
  name: "Churn Prevention Protocol",
  shortDescription: "Triggers a save motion when an account's churn risk score jumps into the danger band.",
  categoryTag: "Retention",
  status: "Published",
  version: "v2.0",
  owner: { name: "Sarah Chen", initials: "SC", colorSeed: "Sarah Chen" },
  updatedRelative: "6 days ago",
  trustMode: "Approval Required",
  phaseCount: 3,
  gateCount: 2,
  moment: {
    primaryEvent: "Risk Score Change",
    eventSources: ["Customer Platform", "CRM Platform"],
    businessMeaning: "The account's churn risk score has moved into the high-risk band.",
    qualifyingConditions: ["Risk score >= 80", "Risk score increased by 15+ points in the last 7 days"],
  },
  trustControls: { mode: "Approval Required", confidenceThreshold: 70, escalatesTo: "Assigned CSM" },
  hardGates: {
    operational: [{ text: "Account not already in an active save motion", action: "Suppress Playbook" }],
    legal: [{ text: "No suppression or DNC flag present", action: "Suppress Playbook" }],
    custom: [],
  },
  objective: {
    goalType: "Churn Risk Mitigation",
    text: "Reduce the account's churn risk score below the danger band within 10 days",
    successConditionText: "Risk score drops back below 80 within 10 days of trigger",
  },
  phases: [
    { id: "ph-1", name: "Risk Triage",       durationLabel: "2 Days", maxAttempts: 2, channels: ["Email"], description: "Triages the churn-risk signal and gathers account context." },
    { id: "ph-2", name: "Save Outreach",     durationLabel: "5 Days", maxAttempts: 3, channels: ["Email", "SMS"], description: "Runs a save motion aimed at addressing the risk drivers." },
    { id: "ph-3", name: "Executive Escalation", durationLabel: "3 Days", maxAttempts: 1, channels: ["Email"], description: "Escalates to an executive sponsor when the save motion stalls." },
  ],
  knowledgePackIds: ["PKG-002", "PKG-005"],
  activity: {
    momentsTriggered: 91, momentsTriggeredDeltaPct: 22,
    plansInstantiated: 84, conversionRatePct: 92,
    autoExecuted: 19, autoExecutedPct: 23,
    approvalsRequired: 65, approvalsRequiredPct: 77,
    planSuccessRatePct: 58, successCount: 49, exitedWithoutSuccessPct: 42,
    nbaSelectionRatePct: 74, avgPlanDurationDays: 8, accountsReached: 80,
    phaseFunnel: [
      { phase: "Risk Triage",          pct: 100, count: 84 },
      { phase: "Save Outreach",        pct: 86,  count: 72 },
      { phase: "Executive Escalation", pct: 39,  count: 33 },
    ],
    blockedReasons: [
      { reason: "Already in active save motion", count: 6 },
      { reason: "Account suppressed", count: 1 },
    ],
    blockedTotal: 7,
    approvals: { approved: 41, rejected: 6, pending: 4, avgResolutionHours: 6.7 },
  },
  versions: [
    { version: "v1.0", date: "2026-02-05", note: "Initial production release" },
    { version: "v2.0", date: "2026-09-03", note: "Added Executive Escalation phase and tightened risk-score qualifying conditions" },
  ],
  history: [
    { date: "2026-02-05", category: "Published", description: "Playbook published — v1.0 (Initial production release)" },
    { date: "2026-09-03", category: "Published", description: "Playbook published — v2.0 (Added Executive Escalation phase and tightened risk-score qualifying conditions)" },
  ],
}

export const PLAYBOOKS: Playbook[] = [PB_001, PB_002, PB_003, PB_004, PB_005]
