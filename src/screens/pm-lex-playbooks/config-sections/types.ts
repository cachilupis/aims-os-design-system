// ────────────────────────────────────────────────────────────────────────
// Shared draft types for the Playbook Configuration form.
//
// Each section (Basics, Knowledge, Moment, ...) works two ways:
//   1. Editing an existing playbook — pre-filled from that Playbook.
//   2. Prompt 12's create wizard — starts from an EMPTY_*_DRAFT.
// So every section takes a plain draft value + onChange patch, never a
// Playbook directly — that's what lets Prompt 12 import these unmodified.
// ────────────────────────────────────────────────────────────────────────

import type { Playbook } from "@/screens/pm-lex-playbooks/playbooks-data"

// ── Basics ──────────────────────────────────────────────────────────────

export type TenantScope = "global" | "specific"
export type PriorityRank = "critical" | "high" | "standard" | "low"

export const DEPARTMENTS = ["Sales", "Customer Success", "Product", "Marketing", "Operations"] as const

// DS-GAP: playbooks-data.ts has no `department` field on Playbook.owner —
// same gap flagged in the list-view prompt's OWNER_DEPARTMENT map. Reused
// here (plus one invented 5th owner, since this form calls for 5 named
// owners and the data only carries 4) so Basics has something real to
// pre-fill from rather than blanking every Organization field on edit.
export const OWNERS = ["Sarah Chen", "Michael Torres", "Emily Rodriguez", "David Park", "Jordan Blake"] as const

const OWNER_DEPARTMENT: Record<string, (typeof DEPARTMENTS)[number]> = {
  "Sarah Chen":      "Customer Success",
  "Michael Torres":  "Sales",
  "Emily Rodriguez": "Product",
  "David Park":       "Sales",
  "Jordan Blake":     "Marketing",
}

export const PRIORITIES: { id: PriorityRank; label: string; sub: string; icon: string }[] = [
  { id: "critical", label: "Critical — P1", sub: "Overrides all other playbooks",        icon: "AlertOctagon" },
  { id: "high",     label: "High — P2",     sub: "Runs before standard playbooks",        icon: "ArrowUpCircle" },
  { id: "standard", label: "Standard — P3", sub: "Default arbitration priority",          icon: "Circle" },
  { id: "low",      label: "Low — P4",      sub: "Runs only if no higher applies",        icon: "ArrowDownCircle" },
]

export interface BasicsDraft {
  name:               string
  shortDescription:   string
  tenantScope:        TenantScope
  department:         (typeof DEPARTMENTS)[number] | null
  owner:              (typeof OWNERS)[number] | null
  priority:           PriorityRank | null
  exclusiveExecution: boolean
  tags:               string
  internalNotes:      string
}

export const EMPTY_BASICS_DRAFT: BasicsDraft = {
  name: "", shortDescription: "", tenantScope: "global", department: null, owner: null,
  priority: null, exclusiveExecution: false, tags: "", internalNotes: "",
}

// Fields the data model doesn't carry (tenantScope, priority, exclusive
// execution, tags, internal notes) default rather than blank, so editing an
// existing playbook shows a plausible starting point instead of an empty
// Organization card. Replace with real fields when the data model grows them.
export function basicsDraftFromPlaybook(pb: Playbook): BasicsDraft {
  return {
    name: pb.name,
    shortDescription: pb.shortDescription,
    tenantScope: "global",
    department: OWNER_DEPARTMENT[pb.owner.name] ?? null,
    owner: (OWNERS as readonly string[]).includes(pb.owner.name) ? (pb.owner.name as (typeof OWNERS)[number]) : null,
    priority: "standard",
    exclusiveExecution: false,
    tags: "",
    internalNotes: "",
  }
}

// ── Knowledge ───────────────────────────────────────────────────────────

export interface KnowledgeDraft {
  selectedPackIds: string[]
}

export const EMPTY_KNOWLEDGE_DRAFT: KnowledgeDraft = { selectedPackIds: [] }

export function knowledgeDraftFromPlaybook(pb: Playbook): KnowledgeDraft {
  return { selectedPackIds: [...pb.knowledgePackIds] }
}

// ── Moment ──────────────────────────────────────────────────────────────

export const PRIMARY_EVENTS = [
  "New Lead Created",
  "Customer Signup Completed",
  "Trial Started",
  "First Login Detected",
  "Renewal Window Opening",
  "Usage Threshold Crossed",
  "Support Ticket Created",
  "Inactivity Period Detected",
  "Feature Adoption Event",
] as const

export const EVENT_SOURCES: { id: string; label: string; description: string; icon: string }[] = [
  { id: "CRM Platform",         label: "CRM Platform",         description: "Contacts, deals & lead records",         icon: "Building2" },
  { id: "Marketing Automation", label: "Marketing Automation", description: "Email, campaigns & nurture flows",       icon: "Megaphone" },
  { id: "Product Analytics",    label: "Product Analytics",    description: "Usage events, sessions & funnels",       icon: "BarChart3" },
  { id: "Customer Platform",    label: "Customer Platform",    description: "Onboarding, success & health scores",    icon: "HeartHandshake" },
  { id: "Support System",       label: "Support System",       description: "Tickets, escalations & CSAT",            icon: "LifeBuoy" },
  { id: "Data Warehouse",       label: "Data Warehouse",       description: "Batch syncs & streaming pipelines",      icon: "Database" },
  { id: "Web Events",           label: "Web Events",           description: "Sessions, clicks & form submissions",    icon: "MousePointerClick" },
]

export const CONDITION_OPERATORS = ["=", "!=", ">", "<", ">=", "<=", "contains"] as const

export interface QualifyingConditionDraft {
  id:       string
  field:    string
  operator: (typeof CONDITION_OPERATORS)[number]
  value:    string
}

export interface MomentDraft {
  primaryEvent:          string | null
  eventSources:          string[]
  businessMeaning:       string
  qualifyingConditions:  QualifyingConditionDraft[]
}

export const EMPTY_MOMENT_DRAFT: MomentDraft = {
  primaryEvent: null, eventSources: [], businessMeaning: "", qualifyingConditions: [],
}

// The data model (playbooks-data.ts) stores each qualifying condition as one
// free-form string (e.g. "Account type = Enterprise"), not the field/
// operator/value triple this row edits. Split on the first operator found so
// existing conditions land in the right boxes instead of all piling into
// `field`; a condition with no recognizable operator keeps its full text as
// `field` with operator defaulted to "=" and value left blank.
function parseCondition(id: string, raw: string): QualifyingConditionDraft {
  for (const op of [...CONDITION_OPERATORS].sort((a, b) => b.length - a.length)) {
    const idx = raw.indexOf(` ${op} `)
    if (idx !== -1) {
      return { id, field: raw.slice(0, idx).trim(), operator: op, value: raw.slice(idx + op.length + 2).trim() }
    }
  }
  return { id, field: raw, operator: "=", value: "" }
}

export function momentDraftFromPlaybook(pb: Playbook): MomentDraft {
  return {
    primaryEvent: pb.moment.primaryEvent,
    eventSources: [...pb.moment.eventSources],
    businessMeaning: pb.moment.businessMeaning ?? "",
    qualifyingConditions: pb.moment.qualifyingConditions.map((text, i) => parseCondition(`qc-${i}-${text.slice(0, 8)}`, text)),
  }
}

// ── Hard Gates ──────────────────────────────────────────────────────────
//
// The Playbook data model (playbooks-data.ts) stores hard gates as free-form
// per-playbook text (`hardGates.operational` / `.legal` / `.custom`) — it has
// no concept of a fixed, tenant-wide gate catalog. The Hard Gates section's
// spec describes exactly that catalog (5 named gates, each inherited from
// tenant settings until overridden), so TENANT_GATE_CATALOG is defined here
// as static reference data, separate from any one playbook. What a playbook
// actually has configured today (its real operational/legal/custom entries)
// becomes the starting "Custom Gates" list — the one part of this section
// that IS playbook-specific data.

export type GateTier = "operational" | "legal"
export type GateOverrideState = "inherited" | "overridden" | "pending-review"

export interface TenantGateDef {
  id:          string
  name:        string
  description: string
  tier:        GateTier
}

export const TENANT_GATE_CATALOG: TenantGateDef[] = [
  { id: "rep-active",              name: "Rep Active / Ownership Conflict", description: "Block if rep active in the last 24 hours — create a task instead", tier: "operational" },
  { id: "channel-availability",    name: "Channel Availability",            description: "SMS and Email must be available — defer until met",                tier: "operational" },
  { id: "customer-status",         name: "Customer Status Restrictions",    description: "Block churned, suspended, payment past due, and legal hold customers", tier: "operational" },
  { id: "consent-required",        name: "Consent Required",                description: "Consent required for SMS and Email — suppress playbook if not met", tier: "legal" },
  { id: "compliance-restrictions", name: "Compliance Restrictions",         description: "DNC, TCPA, and GDPR compliance checks enforced",                    tier: "legal" },
]

export interface CustomGateDraft {
  id:     string
  text:   string
  action: string
}

export interface HardGatesDraft {
  gateStates:       Record<string, GateOverrideState>  // keyed by TenantGateDef.id
  overrideReasons:  Record<string, string>
  customGates:      CustomGateDraft[]
}

function inheritedGateStates(): Record<string, GateOverrideState> {
  return Object.fromEntries(TENANT_GATE_CATALOG.map(g => [g.id, "inherited" as GateOverrideState]))
}

export const EMPTY_HARD_GATES_DRAFT: HardGatesDraft = {
  gateStates: inheritedGateStates(),
  overrideReasons: {},
  customGates: [],
}

export function hardGatesDraftFromPlaybook(pb: Playbook): HardGatesDraft {
  const custom: CustomGateDraft[] = [
    ...pb.hardGates.operational.map(g => ({ text: g.text, action: g.action as string })),
    ...pb.hardGates.legal.map(g => ({ text: g.text, action: g.action as string })),
    ...pb.hardGates.custom.map(g => ({ text: g.text, action: g.action })),
  ].map((g, i) => ({ id: `hg-${pb.id}-${i}`, ...g }))

  return {
    gateStates: inheritedGateStates(),
    overrideReasons: {},
    customGates: custom,
  }
}

// ── Objective & Success ─────────────────────────────────────────────────

export const GOAL_TYPES = [
  "Book Appointment",
  "Start Two-Way Conversation",
  "Qualify Lead",
  "Re-engage Lead",
  "Drive Service Appointment",
  "Collect Feedback",
  "Compliance Notification",
  "Collect Missing Info",
] as const

export const KPI_OPTIONS = [
  "No KPI association",
  "Conversion Rate",
  "Customer Retention",
  "Revenue Per Customer",
  "Appointment Show Rate",
  "Service Completion",
] as const

export type ExitConditionKind = "Time-based limit" | "Action-based threshold" | "Event-based trigger"

export interface ExitConditionDef {
  id:   string
  label: string
  kind: ExitConditionKind
}

export const PREDEFINED_EXIT_CONDITIONS: ExitConditionDef[] = [
  { id: "max-time",           label: "Maximum Time Limit",         kind: "Time-based limit" },
  { id: "max-attempts",       label: "Maximum Attempts Reached",   kind: "Action-based threshold" },
  { id: "opted-out",          label: "Customer Opted Out",         kind: "Event-based trigger" },
  { id: "negative-response",  label: "Negative Response Received", kind: "Event-based trigger" },
]

export const EXIT_OUTCOMES = ["Archive", "Escalate", "Retry", "Hand off to another playbook"] as const

export const EXIT_CONDITION_KINDS: ExitConditionKind[] = ["Time-based limit", "Action-based threshold", "Event-based trigger"]

export interface CustomExitConditionDraft {
  id:      string
  text:    string
  kind:    ExitConditionKind
  outcome: string
}

export interface ObjectiveSuccessDraft {
  goalType:                  string | null
  successEvents:             string[]
  enabledExitConditionIds:   string[]
  exitConditionOutcomes:     Record<string, string>  // keyed by predefined or custom condition id
  customExitConditions:      CustomExitConditionDraft[]
  kpiAssociation:            string
  strategyNotes:             string
}

export const EMPTY_OBJECTIVE_SUCCESS_DRAFT: ObjectiveSuccessDraft = {
  goalType: null,
  successEvents: [],
  enabledExitConditionIds: [],
  exitConditionOutcomes: {},
  customExitConditions: [],
  kpiAssociation: KPI_OPTIONS[0],
  strategyNotes: "",
}

// The data model (playbooks-data.ts Playbook.objective) carries free-form
// `goalType`/`text`/`successConditionText` — not this form's fixed goal-type
// enum, event multi-select, exit-condition toggles, or KPI association. Only
// goalType is mapped back (and only when it happens to match one of the
// fixed options); everything else genuinely has no source field to pre-fill
// from, so it starts at the same default a create-wizard draft would.
export function objectiveSuccessDraftFromPlaybook(pb: Playbook): ObjectiveSuccessDraft {
  const matchedGoalType = (GOAL_TYPES as readonly string[]).includes(pb.objective.goalType) ? pb.objective.goalType : null
  return {
    ...EMPTY_OBJECTIVE_SUCCESS_DRAFT,
    goalType: matchedGoalType,
  }
}

// ── Phases & Actions ("Outreach" in the builder wizard) ────────────────────

export const TOUCH_GAP_UNITS = ["Minutes", "Hours", "Days"] as const
export const OUTREACH_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
export type TimezoneMode = "customer" | "tenant"

export interface PlaybookWideSettingsDraft {
  minTouchGapValue: number
  minTouchGapUnit:  (typeof TOUCH_GAP_UNITS)[number]
  quietHoursStart:  string  // "HH:MM"
  quietHoursEnd:    string
  allowedDays:      string[]
  timezoneMode:     TimezoneMode
}

// 4 levels of the NBA personalization guardrail. fieldsUsed/fieldsTotal drive
// the "N of 13 fields selected" fraction and the progress bar.
export interface PersonalizationLevelDef {
  level:       number
  label:       string
  fieldsUsed:  number
  fieldsTotal: number
  description: string
}

export const PERSONALIZATION_LEVELS: PersonalizationLevelDef[] = [
  { level: 1, label: "Basic",       fieldsUsed: 4,  fieldsTotal: 13, description: "Basic-tier personalization with 4 of 13 lead fields enabled — safe to use at first contact." },
  { level: 2, label: "Standard",    fieldsUsed: 7,  fieldsTotal: 13, description: "Standard-tier personalization with 7 of 13 lead fields enabled — appropriate once trust is established." },
  { level: 3, label: "Advanced",    fieldsUsed: 10, fieldsTotal: 13, description: "Advanced-tier personalization with 10 of 13 lead fields enabled — for warm, engaged leads." },
  { level: 4, label: "Full",        fieldsUsed: 13, fieldsTotal: 13, description: "Full personalization with all 13 lead fields enabled — use only where explicit consent covers it." },
]

export interface PhaseDraft {
  id:            string
  name:          string
  durationLabel: string
  maxAttempts:   number
  channels:      string[]
  description:   string
}

export interface SignalPhaseDraft {
  id:       string
  name:     string
  signal:   string
  response: string
}

export interface PhasesActionsDraft {
  wideSettings:        PlaybookWideSettingsDraft
  personalizationLevel: number
  phases:              PhaseDraft[]
  signalPhases:         SignalPhaseDraft[]
  templatesDismissed:   boolean
}

// No source field for any of these on Playbook — wide settings, the
// personalization guardrail, and signal phases are all new to this form.
const DEFAULT_WIDE_SETTINGS: PlaybookWideSettingsDraft = {
  minTouchGapValue: 4,
  minTouchGapUnit: "Hours",
  quietHoursStart: "20:00",
  quietHoursEnd: "08:00",
  allowedDays: [...OUTREACH_DAYS],
  timezoneMode: "customer",
}

export const EMPTY_PHASES_ACTIONS_DRAFT: PhasesActionsDraft = {
  wideSettings: DEFAULT_WIDE_SETTINGS,
  personalizationLevel: 1,
  phases: [],
  signalPhases: [],
  templatesDismissed: false,
}

export function phasesActionsDraftFromPlaybook(pb: Playbook): PhasesActionsDraft {
  return {
    wideSettings: { ...DEFAULT_WIDE_SETTINGS },
    personalizationLevel: 1,
    phases: pb.phases.map(p => ({
      id: p.id, name: p.name, durationLabel: p.durationLabel, maxAttempts: p.maxAttempts,
      channels: [...p.channels], description: p.description,
    })),
    signalPhases: [],
    templatesDismissed: true, // an existing playbook always has phases already — never show "quick start"
  }
}

// ── Phase templates — "Quick start from template" (create-wizard only) ────

export interface PhaseTemplateDef {
  id:          string
  name:        string
  phaseNames:  string[]
}

export const PHASE_TEMPLATES: PhaseTemplateDef[] = [
  { id: "hot-window",    name: "Hot Window + Follow-Up",   phaseNames: ["Hot Window", "Follow-Up", "Nurture"] },
  { id: "re-engagement", name: "Re-engagement Campaign",   phaseNames: ["Re-activate", "Final Push"] },
  { id: "service-reminder", name: "Service Reminder",       phaseNames: ["Reminder", "Escalation"] },
]

export function phasesFromTemplate(template: PhaseTemplateDef): PhaseDraft[] {
  return template.phaseNames.map((name, i) => ({
    id: `${template.id}-${i}-${Date.now()}`,
    name,
    durationLabel: "3 Days",
    maxAttempts: 3,
    channels: ["Email"],
    description: "",
  }))
}

// ── Trust Controls ──────────────────────────────────────────────────────
//
// Playbook.trustMode / trustControls (playbooks-data.ts) only cover mode,
// confidenceThreshold, and escalatesTo — presets, sensitive topics, handoff
// triggers, post-handoff routing, and HITL review requirements are all new
// to this form. Note the preset badge vocabulary ("Draft for Review" /
// "Approval Required" / "Auto-Send") is this form's own label set, distinct
// from Playbook's TrustMode enum ("Auto-Execute"|"Approval Required"|
// "Draft") — they describe the same idea but aren't the same type, so this
// section doesn't import TrustMode.

export interface TrustPresetDef {
  id:                   string
  name:                 string
  description:          string
  badges:               string[]
  trustModeLabel:       string
  confidenceThreshold:  number
  handoffBehaviorLabel: string
}

export const TRUST_PRESETS: TrustPresetDef[] = [
  { id: "tenant-defaults", name: "Tenant Defaults", description: "Uses your organization's default guardrails from tenant settings", badges: ["Draft for Review", "75% Confidence", "All Topics Enabled"], trustModeLabel: "Draft for Review", confidenceThreshold: 75, handoffBehaviorLabel: "Assign to original rep" },
  { id: "conservative",    name: "Conservative",    description: "Maximum human oversight — all actions require approval",           badges: ["Approval Required", "85% Confidence", "Strictest Guardrails"], trustModeLabel: "Approval Required", confidenceThreshold: 85, handoffBehaviorLabel: "Assign to Sales Manager" },
  { id: "balanced",        name: "Balanced",        description: "Good mix of automation and human review",                          badges: ["Draft for Review", "70% Confidence"], trustModeLabel: "Draft for Review", confidenceThreshold: 70, handoffBehaviorLabel: "Assign to original rep" },
  { id: "aggressive",      name: "Aggressive",      description: "More automation with less manual review",                          badges: ["Auto-Send", "60% Confidence"], trustModeLabel: "Auto-Send", confidenceThreshold: 60, handoffBehaviorLabel: "Round Robin" },
  { id: "auto-pilot",      name: "Auto Pilot",      description: "Maximum automation — minimal human intervention",                  badges: ["Auto-Send", "50% Confidence"], trustModeLabel: "Auto-Send", confidenceThreshold: 50, handoffBehaviorLabel: "Round Robin" },
]

export const SENSITIVE_TOPIC_ACTIONS = ["Require Approval", "Block Action", "Flag for Review"] as const

export interface SensitiveTopicDraft {
  id:     string
  name:   string
  action: string
}

// Matches PB-001's "5 of 5 enabled" reference state — 5 seeded rows, all
// with an action set, used as the default for every playbook (the data
// model has no per-playbook sensitive-topics list to seed from instead).
const SEED_SENSITIVE_TOPICS: string[] = [
  "Cancellation Requests", "Pricing Complaints", "Legal & Compliance", "Competitor Mentions", "Data Privacy Requests",
]

export interface HandoffTriggerDraft {
  id:      string
  label:   string
  subtext?: string
  enabled: boolean
}

export const DEFAULT_HANDOFF_TRIGGERS: { id: string; label: string; subtext: string }[] = [
  { id: "high-intent",         label: "High purchase intent detected",         subtext: 'e.g., "Can I come in today?" or "Ready to buy."' },
  { id: "in-person",           label: "Customer requests in-person visit",     subtext: "Requires appointment scheduling and coordination." },
  { id: "trade-in",            label: "Trade-in or financing complexity",      subtext: "Credit questions, payoff amounts, or trade valuations." },
  { id: "negotiation",         label: "Negotiation or pricing sensitivity",    subtext: "Price objections, competitive quotes, or discount requests." },
  { id: "negative-sentiment",  label: "Negative sentiment detected",           subtext: "Frustration, complaints, or dissatisfaction signals." },
  { id: "policy-topic",        label: "Policy-restricted topic raised",        subtext: "Legal issues, warranty disputes, or recall questions." },
]

export type PostHandoffBehavior = "original-rep" | "sales-manager" | "round-robin"

export interface ReviewRequirementDraft {
  id:      string
  label:   string
  enabled: boolean
}

export const DEFAULT_REVIEW_REQUIREMENTS: { id: string; label: string }[] = [
  { id: "before-sending",         label: "Require approval before sending" },
  { id: "first-contact",          label: "Require review for first contact attempt" },
  { id: "phone-scripts",          label: "Require review for all phone call scripts" },
  { id: "sensitive-responses",    label: "Require review for sensitive topic responses" },
  { id: "price-negotiations",     label: "Require review for price negotiations or discounts" },
  { id: "trade-in-value",         label: "Require review for trade-in value discussions" },
  { id: "competitor-comparisons", label: "Require review for competitor comparisons" },
  { id: "delivery-timeline",      label: "Require review for delivery timeline commitments" },
]

export const ESCALATION_TIMEOUT_OPTIONS = [
  "10 minutes", "15 minutes", "20 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours", "3 hours",
] as const

export interface TrustControlsDraft {
  selectedPreset:                 string | null
  confidenceThreshold:            number
  requireApprovalBelowThreshold:  boolean
  sensitiveTopics:                SensitiveTopicDraft[]
  aiHandoffEnabled:               boolean
  handoffTriggers:                HandoffTriggerDraft[]
  postHandoffBehavior:            PostHandoffBehavior
  reviewRequirements:             ReviewRequirementDraft[]
  escalationTimeout:              (typeof ESCALATION_TIMEOUT_OPTIONS)[number]
}

export const EMPTY_TRUST_CONTROLS_DRAFT: TrustControlsDraft = {
  selectedPreset: null,
  confidenceThreshold: 75,
  requireApprovalBelowThreshold: false,
  sensitiveTopics: SEED_SENSITIVE_TOPICS.map((name, i) => ({ id: `topic-${i}`, name, action: SENSITIVE_TOPIC_ACTIONS[0] })),
  aiHandoffEnabled: true,
  handoffTriggers: DEFAULT_HANDOFF_TRIGGERS.map(t => ({ ...t, enabled: true })),
  postHandoffBehavior: "original-rep",
  reviewRequirements: DEFAULT_REVIEW_REQUIREMENTS.map(r => ({ ...r, enabled: true })),
  escalationTimeout: "30 minutes",
}

export function trustControlsDraftFromPlaybook(pb: Playbook): TrustControlsDraft {
  return {
    ...EMPTY_TRUST_CONTROLS_DRAFT,
    sensitiveTopics: SEED_SENSITIVE_TOPICS.map((name, i) => ({ id: `topic-${pb.id}-${i}`, name, action: SENSITIVE_TOPIC_ACTIONS[0] })),
    handoffTriggers: DEFAULT_HANDOFF_TRIGGERS.map(t => ({ ...t, enabled: true })),
    reviewRequirements: DEFAULT_REVIEW_REQUIREMENTS.map(r => ({ ...r, enabled: true })),
    confidenceThreshold: pb.trustMode === "Draft" ? EMPTY_TRUST_CONTROLS_DRAFT.confidenceThreshold : pb.trustControls.confidenceThreshold,
    requireApprovalBelowThreshold: pb.trustMode === "Approval Required",
  }
}

export function applyTrustPreset(preset: TrustPresetDef, draft: TrustControlsDraft): TrustControlsDraft {
  return {
    ...draft,
    selectedPreset: preset.id,
    confidenceThreshold: preset.confidenceThreshold,
    requireApprovalBelowThreshold: preset.trustModeLabel === "Approval Required",
    postHandoffBehavior:
      preset.handoffBehaviorLabel === "Assign to Sales Manager" ? "sales-manager"
      : preset.handoffBehaviorLabel === "Round Robin" ? "round-robin"
      : "original-rep",
  }
}
