import { useState } from "react"
import { ChevronDown, ChevronUp, CircleCheck, TriangleAlert, CircleX, Info, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"

/**
 * Record Header — AIMS OS Design System
 *
 * NOT YET IN FIGMA — this is a new component, not synced from an existing node.
 * It's modeled on three external, well-established patterns (there is no
 * invented interaction here, only a new composition of them):
 *   1. Identity row  → Salesforce Lightning "Highlights Panel" (compact layout):
 *      avatar + primary field + secondary fields + up to 3 actions, always visible.
 *   2. Signal        → HubSpot's conditional "why this matters now" section, fed
 *      by a Next Best Action engine — one recommendation, not a dashboard.
 *   3. Details       → a standard disclosure/accordion revealing secondary
 *      fields, same idea as this repo's own DocSection collapsible pattern.
 * Before this ships to Figma, Michael should design a real node for it and this
 * file should get a figmaNodeId/figmaUrl like every other component in ui/.
 *
 * One shared layout for all 3 variants (employee/customer/client) — only the
 * chip/detail *content* changes per variant (see RECORD_FIELD_MAP below), never
 * the structure or the styles. This is what makes wiring a Next Best Action
 * engine variant-agnostic: the engine only ever returns one NextBestAction
 * shape, regardless of which of the 3 record types it's reacting to.
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Card       → CardContainer (size="default", variant="default") — same size used by
 *                every other "entity header" context in this repo.
 *   Avatar     → AvatarCircle sizeKey="lg" — Avatar's own doc calls "lg" out for
 *                exactly this use case ("Entity headers, cards").
 *   Context chips → Tag (size="sm"), not Chip. Chip in this repo is documented as
 *                the *interactive* filter-row control; Tag is the non-interactive
 *                "status, category and label" atom — context chips here are pure
 *                metadata, never clickable, so Tag is the correct atom even though
 *                the brief calls them "chips."
 *   Actions    → Button (size="sm") — variant per action, default "secondary."
 *   Disclosure → local expanded state + max-height transition, the same technique
 *                already used by widget-father.tsx for its collapse animation, and
 *                the same chevron-rotate affordance DocSection/EntityList already
 *                use elsewhere in this app — not a new pattern.
 *
 * Token family — Signal severity:
 *   success/alert/error reuse Alert Banner's own token family (--ab-{state}-*),
 *   since Signal is functionally the same "colored surface + icon + text" shape
 *   Alert Banner already established — no new colors invented.
 *   ASSUMPTION TO VERIFY: --ab-informative-* and --ab-neutral-* do NOT exist in
 *   index.css today (checked directly — only alert/error/success are defined).
 *   Rather than invent them, "informative" and "neutral" fall back to the Tag
 *   component's existing --tag-informative-* and --tag-neutral-* triads, which
 *   cover the identical two semantics elsewhere in this app. If Michael later
 *   adds --ab-informative-* and --ab-neutral-* tokens (to fully complete the
 *   Alert Banner family), swap SEVERITY_CONFIG below to use them instead —
 *   flagging this here instead of quietly hardcoding a new color, per the
 *   no-invented-tokens rule.
 */

// ── Shared Next Best Action shape ──────────────────────────────────────────
// Deliberately minimal and identical across all 3 record types — the whole
// point is that AIMS OS's NBA engine only has to return this one shape; this
// component never branches its rendering logic on `variant` to interpret it.

export type NBASeverity = "success" | "alert" | "error" | "informative" | "neutral"

export interface NextBestAction {
  /** e.g. "3 tasks pending approval", "Renews in 12 days — health dropped to 61", "Best next step: schedule demo" */
  label: string
  severity: NBASeverity
  /** Short supporting context, e.g. "Due today", "SLA breached 2h ago" */
  dueContext?: string
  /** Present → the whole Signal row becomes clickable (same interaction model as NotificationItem's onClick rows) */
  onAction?: () => void
}

// ── Record action (Identity row, max 3) ────────────────────────────────────
// Same shape as EntityList's own ELAction — reused on purpose so callers who
// already build EntityList actions don't have to learn a second convention.

export type RecordActionVariant = "primary" | "secondary" | "tertiary"

export interface RecordAction {
  label: string
  variant?: RecordActionVariant
  onClick?: () => void
}

// ── Per-variant record data ─────────────────────────────────────────────────

export interface EmployeeRecord {
  name: string
  role: string
  department: string
  manager: string
  location: string
  email: string
  phone: string
  startDate: string
  team: string
  accessRole: string
}

export interface CustomerRecord {
  accountName: string
  segment: string
  owner: string
  tier: string
  renewalDate: string
  mrr: string
  lastContact: string
  openTickets: number
  adoptionLevel: string
  primaryContact: string
}

export interface ClientRecord {
  name: string
  company: string
  dealStage: string
  dealValue: string
  owner: string
  email: string
  phone: string
  leadSource: string
  lastInteraction: string
  expectedCloseDate: string
}

export type RecordHeaderVariant = "employee" | "customer" | "client"

export interface RecordHeaderProps {
  variant: RecordHeaderVariant
  data: EmployeeRecord | CustomerRecord | ClientRecord
  /** Fed by the NBA engine (or a static fallback) — same shape for all 3 variants, see NextBestAction above */
  signal: NextBestAction
  /** Up to 3 — extras are dropped, not overflowed into a menu (keeps the row predictable at any width) */
  actions?: RecordAction[]
  /** Uncontrolled initial state for the Details disclosure. Default: false (collapsed) */
  defaultExpanded?: boolean
  className?: string
}

// ── Severity → token mapping (Signal) ──────────────────────────────────────
// See file header for why informative/neutral fall back to Tag's tokens.

const SEVERITY_CONFIG: Record<NBASeverity, { Icon: typeof CircleCheck; bg: string; bd: string; fg: string }> = {
  success: { Icon: CircleCheck,   bg: "var(--ab-success-bg)",     bd: "var(--ab-success-bd)",     fg: "var(--ab-success-text)" },
  alert:   { Icon: TriangleAlert, bg: "var(--ab-alert-bg)",       bd: "var(--ab-alert-bd)",       fg: "var(--ab-alert-text)" },
  error:   { Icon: CircleX,       bg: "var(--ab-error-bg)",       bd: "var(--ab-error-bd)",       fg: "var(--ab-error-text)" },
  informative: { Icon: Info,      bg: "var(--tag-informative-bg)", bd: "var(--tag-informative-bd)", fg: "var(--tag-informative-fg)" },
  neutral:     { Icon: Circle,    bg: "var(--tag-neutral-bg)",     bd: "var(--tag-neutral-bd)",     fg: "var(--tag-neutral-fg)" },
}

// ── Per-variant content mapping ─────────────────────────────────────────────
// This is the ONLY place variant-specific logic lives. Everything below this
// function renders the exact same JSX regardless of which variant was passed —
// per the brief's "one shared layout, only slot content changes" constraint.

type RecordFields = {
  name: string
  typeLabel: string
  /** Max 3 — enforced by slicing, not by trusting the caller */
  chips: string[]
  details: { label: string; value: string }[]
}

function getRecordFields(variant: RecordHeaderVariant, data: RecordHeaderProps["data"]): RecordFields {
  if (variant === "employee") {
    const d = data as EmployeeRecord
    return {
      name: d.name,
      typeLabel: "Employee",
      chips: [d.role, d.department, d.location],
      details: [
        { label: "Manager",     value: d.manager },
        { label: "Email",       value: d.email },
        { label: "Phone",       value: d.phone },
        { label: "Start date",  value: d.startDate },
        { label: "Team",        value: d.team },
        { label: "Access role", value: d.accessRole },
      ],
    }
  }
  if (variant === "customer") {
    const d = data as CustomerRecord
    return {
      name: d.accountName,
      typeLabel: "Customer account",
      chips: [d.tier, d.segment, d.adoptionLevel],
      details: [
        { label: "Owner",           value: d.owner },
        { label: "Renewal date",    value: d.renewalDate },
        { label: "MRR",             value: d.mrr },
        { label: "Last contact",    value: d.lastContact },
        { label: "Open tickets",    value: String(d.openTickets) },
        { label: "Primary contact", value: d.primaryContact },
      ],
    }
  }
  const d = data as ClientRecord
  return {
    name: d.name,
    typeLabel: "Client (deal)",
    chips: [d.dealStage, d.company, d.leadSource],
    details: [
      { label: "Deal value",          value: d.dealValue },
      { label: "Owner",                value: d.owner },
      { label: "Email",                value: d.email },
      { label: "Phone",                value: d.phone },
      { label: "Last interaction",     value: d.lastInteraction },
      { label: "Expected close date",  value: d.expectedCloseDate },
    ],
  }
}

// ── Component ────────────────────────────────────────────────────────────────

function RecordHeader({
  variant,
  data,
  signal,
  actions = [],
  defaultExpanded = false,
  className,
}: RecordHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const fields = getRecordFields(variant, data)
  const visibleChips   = fields.chips.filter(Boolean).slice(0, 3)
  const visibleActions = actions.slice(0, 3)
  const sig = SEVERITY_CONFIG[signal.severity]

  return (
    <CardContainer size="default" variant="default" className={cn("w-full", className)}>
      <div className="flex flex-col gap-[16px]">

        {/* ── Layer 1: Identity row (always visible) — Salesforce Highlights Panel pattern:
            avatar + primary field (name) + secondary context + up to 3 actions, all in one glanceable row. */}
        <div className="flex items-start gap-[12px] flex-wrap">
          <AvatarCircle name={fields.name} sizeKey="lg" />

          <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
            {/* Name is the single most prominent element — never truncated (wraps instead), never repeated by a chip below */}
            <div className="flex items-baseline gap-[8px] flex-wrap">
              <span className="text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-title)" }}>
                {fields.name}
              </span>
              <span className="text-[12px] font-medium" style={{ color: "var(--field-supporting)" }}>
                {fields.typeLabel}
              </span>
            </div>

            {visibleChips.length > 0 && (
              <div className="flex items-center gap-[6px] flex-wrap">
                {visibleChips.map((label, i) => (
                  <Tag key={i} variant="secondary" size="sm">{label}</Tag>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-[6px] shrink-0 flex-wrap justify-end">
            {visibleActions.map((a, i) => (
              <Button key={i} variant={a.variant ?? "secondary"} size="sm" onClick={a.onClick}>
                {a.label}
              </Button>
            ))}

            {/* Disclosure trigger — native <button> gets Enter/Space activation for free;
                aria-expanded is the only piece that needs adding by hand. */}
            <Button
              variant="tertiary"
              size="sm"
              iconPosition="alone"
              aria-expanded={expanded}
              aria-label={expanded ? "Hide details" : "Show details"}
              icon={expanded ? <ChevronUp size={16} strokeWidth={1.75} /> : <ChevronDown size={16} strokeWidth={1.75} />}
              onClick={() => setExpanded(v => !v)}
            />
          </div>
        </div>

        {/* ── Layer 2: Signal (always visible) — HubSpot conditional-section + Next Best
            Action pattern: exactly one recommendation, answering "why does this record
            matter right now", never a dashboard of every possible metric. */}
        <SignalBar signal={signal} sig={sig} />

        {/* ── Layer 3: Details (disclosure) — secondary fields, revealed on demand.
            max-height transition mirrors widget-father.tsx's own collapse animation
            rather than inventing a second technique for the same problem. */}
        <div
          style={{
            maxHeight: expanded ? 999 : 0,
            overflow: "hidden",
            transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="pt-[4px] flex flex-col gap-[12px]" style={{ borderTop: expanded ? "0.5px solid var(--color-border-neutral-lighter)" : undefined }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-[16px] gap-y-[12px]">
              {fields.details.map((f, i) => (
                <div key={i} className="flex flex-col gap-[2px] min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                    {f.label}
                  </span>
                  <span className="text-[13px] leading-[1.4] truncate" style={{ color: "var(--foreground)" }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContainer>
  )
}

// ── Signal bar — kept as its own small function for readability, not a
// separately-exported component (it's not meant to be used outside RecordHeader). ──

function SignalBar({
  signal,
  sig,
}: {
  signal: NextBestAction
  sig: { Icon: typeof CircleCheck; bg: string; bd: string; fg: string }
}) {
  const { Icon } = sig
  const clickable = Boolean(signal.onAction)

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={signal.onAction}
      onKeyDown={e => {
        if (!clickable) return
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); signal.onAction?.() }
      }}
      className={cn(
        "flex items-center gap-[8px] rounded-[8px] px-[12px] py-[10px] outline-none",
        clickable && "cursor-pointer transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[ring-offset-color:var(--canvas)]",
      )}
      style={{ background: sig.bg, border: `0.5px solid ${sig.bd}` }}
    >
      <Icon size={16} strokeWidth={1.75} style={{ color: sig.fg }} className="shrink-0" />
      <span className="text-[13px] font-semibold leading-[1.4] flex-1 min-w-0" style={{ color: sig.fg }}>
        {signal.label}
        {signal.dueContext && (
          <span className="font-medium opacity-80"> · {signal.dueContext}</span>
        )}
      </span>
      {clickable && <ChevronDown size={14} strokeWidth={1.75} style={{ color: sig.fg, transform: "rotate(-90deg)" }} className="shrink-0" />}
    </div>
  )
}

export { RecordHeader }
