import { useState, useRef, useLayoutEffect } from "react"
import {
  ChevronDown, CircleCheck, TriangleAlert, CircleX, Info, Sparkles, Sparkle, MoreHorizontal, X, Lock, Mail, Phone,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem } from "@/components/ui/menu-item"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip } from "@/components/ui/tooltip"
import { TableCellLink } from "@/components/ui/table"

/**
 * Record Header — AIMS OS Design System
 *
 * NOT YET IN FIGMA — this is a new component, not synced from an existing node.
 * It's modeled on well-established patterns (there is no invented interaction
 * here, only a composition of them), formalized as 3 CONTENT ZONES (a content
 * contract, not a visual redesign — see the Reference tab's own "Content
 * contract" section for the full framing):
 *   Zone 1 — Identity  → Salesforce Lightning "Highlights Panel" (compact
 *      layout): avatar + primary field + stable identity tags. Fixed, never
 *      changes shape.
 *   Zone 2 — Signal    → HubSpot's conditional "why this matters now" section,
 *      fed by a Next Best Action engine — one recommendation, not a dashboard.
 *   Zone 3 — Actions + key fields → the action row (agent/CTA/overflow, top-
 *      right of Zone 1's physical position) plus a small set of glanceable+
 *      actionable key fields (max ~3-4) rendered below Signal. Both halves of
 *      Zone 3 are grouped conceptually, not physically moved — see KeyField's
 *      own doc comment for the glanceable+actionable filter and the 2 kinds
 *      (contact/relational) it can produce. This REPLACES an earlier version
 *      of this file that showed up to 6 plain-text metadata fields behind an
 *      expand/collapse disclosure — cut for 2 reasons: plain text isn't
 *      glanceable+actionable, and Highlights Panel fields are never hidden
 *      behind a click in the first place (that's what makes it a Highlights
 *      Panel and not a details accordion). Fields that didn't survive the
 *      filter aren't deleted from the data shape — see the `// TODO: pertenece
 *      al Overview/tab de detalle` comments on EmployeeRecord/CustomerRecord/
 *      ClientRecord below for exactly which ones and why.
 * Before this ships to Figma, Michael should design a real node for it and this
 * file should get a figmaNodeId/figmaUrl like every other component in ui/.
 *
 * One shared layout for all 3 variants (employee/customer/client) — only the
 * chip/key-field/action *content* changes per variant, never the structure or
 * the styles. This is what makes wiring a Next Best Action engine variant-
 * agnostic: the engine only ever returns one NextBestAction shape, regardless
 * of which of the 3 record types it's reacting to.
 *
 * Page context this was refined against: RecordHeader always sits atop that
 * record's own profile page — Overview widgets + Activity/Log tabs render
 * right below it. Two consequences that shape this file:
 *   - Identity chips show only STABLE attributes (role, industry, source) —
 *     never a dynamic state or metric, since those belong in Signal/key
 *     fields, not in an always-visible "who is this" row that shouldn't need
 *     updating every time a status changes.
 *   - Header actions must not duplicate a tab below (see
 *     RECORD_HEADER_RECOMMENDED_ACTIONS for the specific calls this drove).
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Card       → CardContainer (size="default", variant="default") — same size used by
 *                every other "entity header" context in this repo.
 *   Avatar     → AvatarCircle sizeKey="lg" — Avatar's own doc calls "lg" out for
 *                exactly this use case ("Entity headers, cards").
 *   Identity metadata → Tag (size="sm"), NOT Chip. Verified directly in this repo:
 *                Chip (chip.tsx) is documented as the *interactive* filter-row
 *                control (used in Filters/quick-filter rows, has hover/press/
 *                disabled states implying affordance). Tag (tag.tsx) is the
 *                non-interactive "status, category and label" atom — no onClick
 *                in its own type, pure display. Identity attributes here are
 *                read-only and never clickable, so Tag is the only one of the
 *                two that doesn't communicate a false affordance. If this ever
 *                looks ambiguous again: Chip = you can act on it, Tag = you can
 *                only read it.
 *   AI agent trigger → Button icon-only. Reuses the exact glyph Topbar's own
 *                "IA-icon" uses — `Sparkle` (single 4-point sparkle), NOT
 *                `Sparkles` (3-star) — see topbar.tsx's own header comment,
 *                which already corrected this exact mix-up once. Uses
 *                variant="main" — a DELIBERATE, NAMED EXCEPTION to CLAUDE.md's
 *                Button hierarchy rule ("never variant=main inside a widget,
 *                card, or SlideOut"), confirmed directly by Michael: the
 *                agent trigger is the platform's one persistent, always-there
 *                entry point (same conceptual role as Topbar's own IA-icon,
 *                which gets its own one-off gradient treatment precisely
 *                because it's not "just another card CTA"), so it earns the
 *                same top-of-hierarchy treatment even though it physically
 *                renders inside a CardContainer. This is the ONLY sanctioned
 *                main-inside-a-card case — see the CLAUDE.md exception note
 *                next to the Button hierarchy rule. Don't use this exception
 *                as precedent for any other card-level button.
 *   Overflow   → Menu/MenuItem (menu-item.tsx) — the repo's real dropdown atom,
 *                anchored the same way NotificationCenter's own filter dropdown
 *                is (capture the trigger's rect on click, render fixed-position,
 *                dismiss on backdrop click) — not a new positioning technique.
 *   Key fields (Zone 3) → 2 kinds, each mapped to an existing DS primitive,
 *                never plain text: "contact" (a real communication channel,
 *                e.g. Email/Phone) → Button variant="tertiary" with a leading
 *                icon, same component as the overflow trigger above, just
 *                with a label. "relational" (a link to ANOTHER record, e.g.
 *                Manager/Owner) → TableCellLink, the repo's actual "Link-
 *                text=Yes" DS variant (table.tsx) — verified directly, no
 *                dedicated Link/TextLink component exists elsewhere in
 *                src/components/ui/, so this is the correct one to reuse
 *                rather than inventing a new one. Always visible, no
 *                disclosure — see the Zone 3 note above for why.
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
 *
 * Token family — Signal source ("this is an AI suggestion" vs. a plain status):
 *   `signal.aiGenerated` swaps the whole bar to --tag-purple-bg/--tag-purple-bd/
 *   --tag-purple-fg + a Sparkles icon (the 3-star one is correct HERE — this
 *   matches EntityList's own aiInsight block exactly, see entity-list.tsx's
 *   "AI {action}" row) — not the --color-surface-purple-more-subtle/
 *   --card-purple-border pairing used for the unrelated AI Summary panels
 *   elsewhere in this app's SlideOut content. Two different purple treatments
 *   already coexist in this DS; this reuses the one that's actually about "AI
 *   produced this specific recommendation," which is what a NextBestAction is.
 *   Use aiGenerated ONLY for a probabilistic/inferred suggestion (e.g. "ready to
 *   send proposal — confidence 82%") — NOT for a deterministic operational fact
 *   or an urgent risk state (e.g. "2 tasks pending approval," "renewal at risk").
 *   Severity color communicates urgency; urgency should always win visually over
 *   "by the way, AI produced this" — so aiGenerated is the exception, not the
 *   default, even though every Signal is technically NBA-engine-sourced.
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
  /** Short supporting context, e.g. "Due today", "SLA breached 2h ago", "NBA engine · confidence 82%" */
  dueContext?: string
  /**
   * True → this specific recommendation is an AI-inferred suggestion (not a
   * deterministic fact), so the bar uses the purple/Sparkles "AI produced
   * this" treatment instead of the severity color — see file header for why
   * this is the exception, not the default. `severity` is still required
   * even when true (kept for sorting/prioritization); it just isn't what
   * renders visually in that case.
   */
  aiGenerated?: boolean
  /**
   * Label for an explicit inline button that fires `onAction` directly (e.g.
   * "Send proposal," "Schedule renewal call") — makes the NBA engine's
   * recommendation something you DO from the Signal, not just something you
   * read and then have to go find a button for elsewhere. Omit when there's
   * no single action to name (e.g. "2 tasks pending approval" — several
   * distinct items, not one action); the bar then falls back to a plain
   * click-through affordance, same as before this field existed.
   */
  actionLabel?: string
  /**
   * Fires on the inline action button (when actionLabel is set) AND on a
   * click anywhere else on the bar — same "row and its primary action must
   * resolve to the same destination" rule this repo's NotificationItem
   * already documents, applied here instead of inventing a second rule.
   */
  onAction?: () => void
  /**
   * True → the bar gets a small close (X) affordance, same treatment as
   * AlertBanner's own onClose. Reserve this for the "nothing pressing"
   * cases — a Signal with a real actionLabel/onAction shouldn't be
   * dismissable, since dismissing it would let the actual next step get
   * lost. Dismissal is local UI state (session-only); pass onDismiss if the
   * host needs to persist the choice.
   */
  dismissible?: boolean
  onDismiss?: () => void
}

// ── Assigned AI agent (transversal — task 5) ────────────────────────────────
// AIMS OS is agent-first: every Employee/Customer/Client has an assigned
// agent. This is a top-level prop (like `signal`), not nested per-variant
// data, because the trigger button and its behavior are identical regardless
// of variant — only *which* agent is assigned changes.
// NOTE TO VERIFY: this shape is a reasonable guess (id/name/onOpenChat) based
// on how `signal.onAction` and RecordAction.onClick already delegate behavior
// to the caller in this file. If AIMS OS already models "assigned agent"
// somewhere in the backend/repo with a different shape, map to THAT shape
// instead of this one — flagging instead of assuming, per the no-invented-
// contracts rule.
export interface AssignedAgent {
  id:   string
  name: string
  /** Opens a chat scoped to this record. RecordHeader never renders the chat
   *  UI itself — same delegation pattern as signal.onAction: whatever side
   *  panel/slide-out mechanism the consuming screen already uses for chat,
   *  it stays there. There is no dedicated "agent chat" component yet
   *  anywhere in src/components/ui/ — checked directly — so if one gets
   *  built, this is the callback it should be wired to. */
  onOpenChat: () => void
}

// ── Record action (Identity row) ────────────────────────────────────────────
// Same shape as EntityList's own ELAction — reused on purpose so callers who
// already build EntityList actions don't have to learn a second convention.
// actions[0] renders as the one contextual CTA button; actions[1+] render
// inside the "···" overflow Menu — see the 3-tier action hierarchy below.

export type RecordActionVariant = "primary" | "secondary" | "tertiary"

export interface RecordAction {
  label: string
  variant?: RecordActionVariant
  onClick?: () => void
}

// ── Per-variant record data ─────────────────────────────────────────────────
// Only the Primary-slot field (name/accountName) is required — every other
// field is genuinely optional in real data (a customer without a confirmed
// industry, a client with no expectedCloseDate yet, etc.). getRecordFields
// coalesces a missing field to "" and the render layer drops it — see the
// "missing data" fallback rule at the identity-tags and key-fields render sites.
//
// on*Click callbacks: same embedded-callback convention this file already
// uses for NextBestAction.onAction and RecordAction.onClick — the click
// destination is presentation-layer routing (which record to navigate to,
// what a "contact" action actually does), not something RecordHeader decides.
// DECISION FLAGGED FOR TEAM REVIEW: onEmailClick/onPhoneClick are NOT
// defaulted to mailto:/tel: internally, even though that's arguably a safe,
// unambiguous browser behavior rather than a guessed business action — kept
// fully delegated instead, for consistency with every other action in this
// file ("RecordHeader never renders navigation/business logic itself"). If
// the team decides mailto:/tel: should be a built-in default, that's a
// one-line change at the contactField() call sites below, not a shape change.

export interface EmployeeRecord {
  name: string
  role?: string
  department?: string
  manager?: string
  /** Fires when the Manager key field (relational link) is clicked — routes
   *  to that person's own record. Not wired by RecordHeader itself. */
  onManagerClick?: () => void
  location?: string
  email?: string
  onEmailClick?: () => void
  phone?: string
  onPhoneClick?: () => void
  /** TODO: pertenece al Overview/tab de detalle — pure reference info, no
   *  glanceable+actionable use in the header itself (see Reference tab's
   *  content contract). Kept on the data shape; just not rendered here. */
  startDate?: string
  /** TODO: pertenece al Overview/tab de detalle — same reasoning as startDate. */
  team?: string
  /** TODO: pertenece al Overview/tab de detalle — not actionable (no click
   *  destination), so it fails the glanceable+actionable filter. */
  accessRole?: string
}

export interface CustomerRecord {
  accountName: string
  segment?: string
  owner?: string
  /** Fires when the Owner key field (relational link) is clicked. */
  onOwnerClick?: () => void
  tier?: string
  /** Stable identity attribute — added so the identity row has a 3rd chip
   *  that isn't a health/adoption metric (see chips content rule below). */
  industry?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  renewalDate?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  mrr?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  lastContact?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  openTickets?: number
  /** TODO: pertenece al Overview/tab de detalle — already not an identity
   *  chip (see its own note below); also not a header key field, since a
   *  level/score alone isn't actionable. */
  adoptionLevel?: string
  /** DECISION FLAGGED FOR TEAM REVIEW: the brief's "Componentes del DS a
   *  usar" section lists Primary Contact under "Contexto relacional → link,"
   *  but the per-variant starting point says "contacto a Primary Contact →
   *  Button tertiary." CustomerRecord has no separate email/phone field FOR
   *  the primary contact today — only this one name/title string — so
   *  there's no data to build a contact-kind (Button tertiary) field from
   *  without inventing a channel that doesn't exist. Implemented as a
   *  relational link (matches the authoritative component-mapping section);
   *  if AIMS OS wants a direct "contact the primary contact" action, this
   *  record shape needs its own email/phone field first. */
  primaryContact?: string
  onPrimaryContactClick?: () => void
}

export interface ClientRecord {
  name: string
  company?: string
  /** TODO: pertenece al Overview/tab de detalle — a deal stage is a dynamic
   *  state; Signal already surfaces it when it's urgent enough to act on
   *  (see the chip-content rule below), so a second, always-visible copy of
   *  it in the header is redundant rather than additive. */
  dealStage?: string
  dealValue?: string
  owner?: string
  /** Fires when the Owner key field (relational link) is clicked. */
  onOwnerClick?: () => void
  email?: string
  onEmailClick?: () => void
  phone?: string
  onPhoneClick?: () => void
  leadSource?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  lastInteraction?: string
  /** TODO: pertenece al Overview/tab de detalle. */
  expectedCloseDate?: string
}

export type RecordHeaderVariant = "employee" | "customer" | "client"

export interface RecordHeaderProps {
  variant: RecordHeaderVariant
  data: EmployeeRecord | CustomerRecord | ClientRecord
  /** Fed by the NBA engine (or a static fallback) — same shape for all 3 variants, see NextBestAction above */
  signal: NextBestAction
  /**
   * "resolved" (default) renders `signal` as-is. "loading" shows a Skeleton
   * placeholder in the exact same footprint while the NBA engine is still
   * computing — never an empty bar, never a layout jump when the real value
   * lands. "error" ignores whatever `signal` was passed and substitutes the
   * centralized RECORD_HEADER_FALLBACKS.nbaError instead, so a timed-out
   * engine call never renders a broken/partial Signal.
   */
  signalStatus?: "loading" | "resolved" | "error"
  /**
   * Required as a PROP (every caller must decide), but the value itself can
   * be `null` for a record that genuinely has no assigned agent yet — this
   * is "required with a fallback state," not optional. `null` renders the
   * same button, disabled, with a Tooltip explaining why (see
   * RECORD_HEADER_FALLBACKS.noAgent) — never a silently missing button and
   * never a broken one. See AssignedAgent above.
   */
  assignedAgent: AssignedAgent | null
  /** actions[0] = the one contextual CTA; actions[1+] = overflow menu items. See RECORD_HEADER_RECOMMENDED_ACTIONS for the default per variant. */
  actions?: RecordAction[]
  /**
   * True → this record is read-only right now. The contextual CTA and the
   * overflow's write actions disable (with a Tooltip explaining why) — but
   * the AI agent trigger and the Signal stay fully interactive, since
   * consulting a record isn't the same permission as editing it.
   */
  locked?: boolean
  className?: string
}

// ── Centralized fallback copy (task constraint: configurable/centralized,
// never scattered inline in JSX) ────────────────────────────────────────────
export const RECORD_HEADER_FALLBACKS = {
  /** Shown when signalStatus === "error" — replaces whatever `signal` was passed. */
  nbaError: { label: "No recommendation available", severity: "neutral" } as NextBestAction,
  /** Tooltip on the agent trigger when assignedAgent is null. */
  noAgentTooltip: "No agent assigned to this record",
  /** The read-only Tag shown next to the type label when `locked` is true. */
  lockedTagLabel: "Locked",
  /** Tooltip on the CTA/overflow trigger when `locked` is true. */
  lockedActionTooltip: "This record is locked — read-only",
}

// ── Severity → token mapping (Signal) ──────────────────────────────────────
// See file header for why informative/neutral fall back to Tag's tokens.
// neutral has no Icon: there's no lucide glyph that reads as "status: fine,
// nothing to report" without either duplicating informative's Info icon or
// looking like a form control (an empty ringed circle reads as an unchecked
// radio button — that's exactly what this used to render and what prompted
// this fix). Badge's own neutral dot (badge.tsx) already IS the DS's real
// "muted/inactive status" indicator, so SignalBar renders that instead of an
// icon for this one severity — see the null check at its render site.

const SEVERITY_CONFIG: Record<NBASeverity, { Icon: LucideIcon | null; bg: string; bd: string; fg: string }> = {
  success: { Icon: CircleCheck,   bg: "var(--ab-success-bg)",     bd: "var(--ab-success-bd)",     fg: "var(--ab-success-text)" },
  alert:   { Icon: TriangleAlert, bg: "var(--ab-alert-bg)",       bd: "var(--ab-alert-bd)",       fg: "var(--ab-alert-text)" },
  error:   { Icon: CircleX,       bg: "var(--ab-error-bg)",       bd: "var(--ab-error-bd)",       fg: "var(--ab-error-text)" },
  informative: { Icon: Info,      bg: "var(--tag-informative-bg)", bd: "var(--tag-informative-bd)", fg: "var(--tag-informative-fg)" },
  neutral:     { Icon: null,      bg: "var(--tag-neutral-bg)",     bd: "var(--tag-neutral-bd)",     fg: "var(--tag-neutral-fg)" },
}

// Same trio + icon as EntityList's own aiInsight block ("AI {action}" row) —
// deliberately NOT a new "purple severity," since aiGenerated overrides
// severity's color rather than being one of its values.
const AI_SIGNAL_CONFIG: { Icon: LucideIcon; bg: string; bd: string; fg: string } = {
  Icon: Sparkles, bg: "var(--tag-purple-bg)", bd: "var(--tag-purple-bd)", fg: "var(--tag-purple-fg)",
}

// ── Per-variant content mapping ─────────────────────────────────────────────
// This is the ONLY place variant-specific logic lives. Everything below this
// function renders the exact same JSX regardless of which variant was passed —
// per the brief's "one shared layout, only slot content changes" constraint.

// ── Key fields (Zone 3) — the glanceable+actionable filter ──────────────────
// Every key field is one of exactly 2 kinds — a pure-reference field (Start
// date, MRR, Access role, ...) fails the filter entirely and isn't a KeyField
// at all; see the TODO comments on the record interfaces above for what got
// cut and why. Contact = a real communication channel → Button tertiary
// (icon self-labels, no separate caption needed). Relational = a link to
// ANOTHER record → TableCellLink (this repo's real "Link-text=Yes" DS
// variant, table.tsx), with a small caption above it since a bare name
// doesn't say who it's linking to or why.
export type KeyField =
  | { kind: "contact"; label: string; value: string; icon: LucideIcon; onClick?: () => void }
  | { kind: "relational"; label: string; value: string; onClick?: () => void }

// Small builder helpers, not exported — exist purely so every variant below
// applies the SAME missing-data rule (omit when the value is falsy, don't
// emit a placeholder) without repeating the conditional 6 times.
function contactField(label: string, value: string | undefined, icon: LucideIcon, onClick?: () => void): KeyField[] {
  return value ? [{ kind: "contact", label, value, icon, onClick }] : []
}
function relationalField(label: string, value: string | undefined, onClick?: () => void): KeyField[] {
  return value ? [{ kind: "relational", label, value, onClick }] : []
}

type RecordFields = {
  name: string
  typeLabel: string
  /** Max 3 — enforced by slicing, not by trusting the caller. Stable identity
   *  attributes ONLY (role, industry, source) — never a dynamic state or a
   *  metric; those belong in Signal (if urgent/actionable) or a key field /
   *  the Overview tab (if just reference info).
   *
   *  Missing-data rule: a blank/undefined field never renders as a gap or a
   *  "—" placeholder — the render site's `.filter(Boolean)` drops it, and
   *  the row compacts to whatever chips remain (down to zero, in which case
   *  the whole chips row doesn't render at all). Same rule for keyFields
   *  below (contactField/relationalField return [] on a falsy value) — both
   *  content slots agree on one behavior instead of two. */
  chips: string[]
  /** Zone 3's "campos clave" — max ~3-4 (sliced defensively below), each
   *  already the correct kind for its DS primitive. See KeyField's own doc
   *  comment for the glanceable+actionable filter these passed to get here. */
  keyFields: KeyField[]
}

function getRecordFields(variant: RecordHeaderVariant, data: RecordHeaderProps["data"]): RecordFields {
  if (variant === "employee") {
    const d = data as EmployeeRecord
    return {
      name: d.name,
      typeLabel: "Employee",
      chips: [d.role ?? "", d.department ?? "", d.location ?? ""],
      keyFields: [
        ...relationalField("Manager", d.manager, d.onManagerClick),
        ...contactField("Email", d.email, Mail, d.onEmailClick),
        ...contactField("Phone", d.phone, Phone, d.onPhoneClick),
        // TODO: Start date, Team, Access role — removed from the header (see
        // their own TODO comments on EmployeeRecord above). Pure reference
        // info, not glanceable+actionable; belongs on the Overview/detail
        // tab, not duplicated here.
      ].slice(0, 4),
    }
  }
  if (variant === "customer") {
    const d = data as CustomerRecord
    return {
      name: d.accountName,
      typeLabel: "Customer account",
      chips: [d.tier ?? "", d.segment ?? "", d.industry ?? ""],
      keyFields: [
        ...relationalField("Owner", d.owner, d.onOwnerClick),
        // Primary contact — relational link, not a contact-kind Button.
        // See the DECISION FLAGGED comment on CustomerRecord.primaryContact.
        ...relationalField("Primary contact", d.primaryContact, d.onPrimaryContactClick),
        // TODO: Renewal date, MRR, Last contact, Open tickets, Adoption
        // level — removed from the header (see their own TODO comments on
        // CustomerRecord above). Pure reference info; belongs on the
        // Overview/detail tab, not duplicated here.
      ].slice(0, 4),
    }
  }
  const d = data as ClientRecord
  return {
    name: d.name,
    typeLabel: "Client (deal)",
    chips: [d.company ?? "", d.dealValue ?? "", d.leadSource ?? ""],
    keyFields: [
      ...relationalField("Owner", d.owner, d.onOwnerClick),
      ...contactField("Email", d.email, Mail, d.onEmailClick),
      ...contactField("Phone", d.phone, Phone, d.onPhoneClick),
      // TODO: Deal stage, Last interaction, Expected close date — removed
      // from the header (see their own TODO comments on ClientRecord
      // above). Pure reference info; belongs on the Overview/detail tab,
      // not duplicated here.
    ].slice(0, 4),
  }
}

// ── Recommended actions per variant ─────────────────────────────────────────
// The single source of truth for "which CTA(s) go on this card" — used by the
// catalog's Overview/Playground/CLAUDE.md guidance so they can't drift apart.
// actions[0] is the one contextual CTA (rendered as a real button, next to the
// always-present AI agent trigger); actions[1+] land in the "···" overflow.
//
// Revised after an AIMS OS page-context check: RecordHeader always sits ON
// that record's own profile page, with Overview/Activity/Log tabs rendering
// right below it — so an action must do something no tab already covers.
//   Employee: just "Message" — "View profile" was circular (already on it).
//   Customer: "Contact account" is the CTA; "View contract" is the only
//   overflow item — "Log activity" was dropped, since the Activity tab below
//   already has its own log-activity affordance.
//   Client: "Email" is the CTA (mirrors Employee's Message / Customer's
//   Contact account — a "reach out" action, not covered elsewhere). "Log
//   call" moved to overflow — it belongs to the Activity tab, not gone
//   entirely, since some screens may still want it one tap away. "Send
//   proposal" is deliberately NOT here anymore: it's now the Signal's own
//   inline action (see NextBestAction.actionLabel) — keeping it here too
//   would duplicate the exact recommendation the Signal already surfaces.
// No variant sets a "primary" RecordAction here on purpose: the AI agent
// button now owns the row's one "primary" visual weight (see the component
// below) — a second primary-blue button next to it would blur which action
// is actually the most important one to notice first.
export const RECORD_HEADER_RECOMMENDED_ACTIONS: Record<RecordHeaderVariant, RecordAction[]> = {
  employee: [{ label: "Message" }],
  customer: [{ label: "Contact account" }, { label: "View contract" }],
  client:   [{ label: "Email" }, { label: "Log call" }],
}

// ── Desktop overflow — container-width collapse thresholds ─────────────────
// Not viewport breakpoints: this card can sit in a narrower panel (a SlideOut,
// a resized widget) on an otherwise-desktop screen, so width is measured on
// the card's own rendered box via ResizeObserver, not read from Tailwind's
// sm:/md: (which only sees the viewport). No Figma node exists for this
// component yet (see file header), so these two px values are calibrated
// estimates, not a spec'd breakpoint — revisit once one exists.
// Priority order when space runs out (least-important first): identity tags
// hide completely below COLLAPSE_HIDE_TAGS_WIDTH; the contextual CTA folds
// into the "···" overflow menu below the narrower COLLAPSE_HIDE_CTA_WIDTH.
// The AI agent trigger and the disclosure chevron are NEVER sacrificed — the
// agent is the platform's one persistent entry point (see file header), and
// the chevron is the only way to reach Details once they exist. The name
// itself never truncates (wraps instead) — unaffected by either threshold.
const COLLAPSE_HIDE_TAGS_WIDTH = 560
const COLLAPSE_HIDE_CTA_WIDTH = 440

// ── Component ────────────────────────────────────────────────────────────────

function RecordHeader({
  variant,
  data,
  signal,
  signalStatus = "resolved",
  assignedAgent,
  actions = [],
  locked = false,
  className,
}: RecordHeaderProps) {
  const fields = getRecordFields(variant, data)
  const [primaryAction, ...overflowActions] = actions

  // Signal loading/error — see RecordHeaderProps.signalStatus doc. Neither
  // path touches the NextBestAction shape itself; "error" just substitutes a
  // different, centralized VALUE of that same shape.
  const effectiveSignal = signalStatus === "error" ? RECORD_HEADER_FALLBACKS.nbaError : signal
  const sig = effectiveSignal.aiGenerated ? AI_SIGNAL_CONFIG : SEVERITY_CONFIG[effectiveSignal.severity]

  const hasKeyFields = fields.keyFields.length > 0

  // Avatar fallback: only a genuinely blank name gets the DS's own "empty"
  // glyph (avatar.tsx's existing avatarStyle="empty") instead of initials —
  // a single-character name (e.g. "J") already renders fine as one initial,
  // so it isn't special-cased here, only true emptiness is.
  const hasName = Boolean(fields.name && fields.name.trim())

  // Desktop overflow (task 3) — width-driven, not a 2-pass "measure after
  // hiding" algorithm: both thresholds read the SAME measured width
  // independently, so there's no flicker and it naturally reverses when the
  // card grows back (no state to "un-collapse" — it's derived every measure).
  const rootRef = useRef<HTMLDivElement>(null)
  const [tagsHidden, setTagsHidden] = useState(false)
  const [ctaCollapsed, setCtaCollapsed] = useState(false)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      setTagsHidden(w < COLLAPSE_HIDE_TAGS_WIDTH)
      setCtaCollapsed(w < COLLAPSE_HIDE_CTA_WIDTH)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // When the CTA collapses for width, it doesn't disappear — it folds into
  // the same overflow menu the 1+ extra actions already use, so it's still
  // one click away instead of gone.
  const effectiveOverflowItems = ctaCollapsed && primaryAction ? [primaryAction, ...overflowActions] : overflowActions

  return (
    <CardContainer size="default" variant="default" className={cn("w-full", className)}>
      <div ref={rootRef} className="flex flex-col gap-[16px]">

        {/* ── Layer 1: Identity row (always visible) — Salesforce Highlights Panel pattern:
            avatar + primary field (name) + stable identity metadata + a 3-tier action row. */}
        <div className="flex items-start gap-[12px] flex-wrap">
          <AvatarCircle name={fields.name || fields.typeLabel} sizeKey="lg" avatarStyle={hasName ? "text" : "empty"} />

          <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
            {/* Name is the single most prominent element — never truncated (wraps instead), never repeated by a chip below */}
            <div className="flex items-baseline gap-[8px] flex-wrap">
              <span className="text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-title)" }}>
                {fields.name}
              </span>
              <span className="text-[12px] font-medium" style={{ color: "var(--field-supporting)" }}>
                {fields.typeLabel}
              </span>
              {/* Locked (task 5) — a STATE, not a stable attribute, so it never
                  competes for one of the 3 identity-chip slots (same reasoning
                  that keeps Deal stage/Adoption level out of chips) — it sits
                  next to the type label instead, read-only Tag, no onClick. */}
              {locked && (
                <Tag variant="secondary" size="sm" leadingIcon={<Lock size={12} strokeWidth={1.75} />}>
                  {RECORD_HEADER_FALLBACKS.lockedTagLabel}
                </Tag>
              )}
            </div>

            {/* Read-only identity metadata — Tag, not Chip (see file header). Stable
                attributes only; a dynamic state here would need updating every time
                it changes, which is exactly what Signal/Details are for instead.
                Missing-data rule: .filter(Boolean) drops any blank field before
                slicing to 3 — no gap, no "—", the row just compacts. Hidden
                entirely (not just compacted) when the card itself is too narrow
                to fit both this row and the action group — see COLLAPSE_HIDE_TAGS_WIDTH. */}
            {!tagsHidden && fields.chips.filter(Boolean).length > 0 && (
              <div className="flex items-center gap-[6px] flex-wrap">
                {fields.chips.filter(Boolean).slice(0, 3).map((label, i) => (
                  <Tag key={i} variant="secondary" size="sm">{label}</Tag>
                ))}
              </div>
            )}
          </div>

          {/* 3-tier action hierarchy: AI agent (always, most prominent) → one
              contextual CTA → overflow for anything else. Mobile-first: this
              group is first in DOM order among the wrapping row's trailing
              items, and the AI button is the first child within it, so it's
              the last thing to get pushed off on a narrow viewport. */}
          <div className="flex items-center gap-[6px] shrink-0 flex-wrap justify-end">
            {/* variant="main" — deliberate exception, see file header comment
                and the CLAUDE.md Button hierarchy exception note.
                assignedAgent === null (task 1c) — the button still renders,
                disabled, with a Tooltip explaining why — never a silently
                missing or broken trigger. */}
            {assignedAgent ? (
              <Button
                variant="main"
                size="sm"
                iconPosition="alone"
                icon={<Sparkle size={16} strokeWidth={1.75} />}
                aria-label={`Chat with ${assignedAgent.name}`}
                onClick={assignedAgent.onOpenChat}
              />
            ) : (
              <Tooltip content={RECORD_HEADER_FALLBACKS.noAgentTooltip}>
                <Button
                  variant="main"
                  size="sm"
                  iconPosition="alone"
                  icon={<Sparkle size={16} strokeWidth={1.75} />}
                  aria-label={RECORD_HEADER_FALLBACKS.noAgentTooltip}
                  disabled
                />
              </Tooltip>
            )}

            {/* Locked (task 5): the contextual CTA is a write action, so it
                disables with a Tooltip — but it isn't hidden, same "explain,
                don't silently omit" rule as the no-agent case above. Folds
                into the overflow menu instead of rendering here at all when
                the card is too narrow (task 3) — ctaCollapsed. */}
            {primaryAction && !ctaCollapsed && (
              locked ? (
                <Tooltip content={RECORD_HEADER_FALLBACKS.lockedActionTooltip}>
                  <Button variant={primaryAction.variant ?? "secondary"} size="sm" disabled>
                    {primaryAction.label}
                  </Button>
                </Tooltip>
              ) : (
                <Button variant={primaryAction.variant ?? "secondary"} size="sm" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )
            )}

            {effectiveOverflowItems.length > 0 && (
              <ActionOverflowMenu
                items={effectiveOverflowItems}
                disabled={locked}
                disabledTooltip={RECORD_HEADER_FALLBACKS.lockedActionTooltip}
              />
            )}
          </div>
        </div>

        {/* ── Layer 2: Signal (always visible) — HubSpot conditional-section + Next Best
            Action pattern: exactly one recommendation, answering "why does this record
            matter right now", never a dashboard of every possible metric. Actionable:
            when the NBA engine names a specific action (signal.actionLabel), it renders
            as a real inline button instead of asking the user to click-through and hunt
            for it. Loading/error (task 2): see signalStatus doc on RecordHeaderProps —
            neither state removes the bar or changes its footprint, only its content. */}
        <SignalBar signal={effectiveSignal} sig={sig} loading={signalStatus === "loading"} />

        {/* ── Zone 3, part 2: key fields — Salesforce Highlights Panel pattern:
            always visible, never behind a disclosure toggle. This replaces
            the old 6-field plain-text "Details" grid — the fields that
            survived the glanceable+actionable filter (see KeyField's doc
            comment) are few enough (max ~3-4) that hiding them behind a
            click would cost more than it saves, which is exactly why
            Highlights Panel fields are never collapsed in the first place.
            Zone 3 conceptually also includes the action row above (agent/
            CTA/overflow) — kept in its existing physical position rather
            than moved down here, per "don't redo the layout"; see the
            Reference tab's content-contract section for the full 3-zone
            framing. */}
        {hasKeyFields && (
          <div className="pt-[16px]" style={{ borderTop: "0.5px solid var(--color-border-neutral-lighter)" }}>
            <div className="flex flex-wrap items-start gap-x-[24px] gap-y-[12px]">
              {fields.keyFields.map((f, i) =>
                f.kind === "contact" ? (
                  // Contact = a real communication channel → Button tertiary,
                  // icon+label together (the icon self-labels — Mail/Phone —
                  // so no separate uppercase caption above it, unlike relational).
                  <Button key={i} variant="tertiary" size="sm" icon={<f.icon size={14} strokeWidth={1.75} />} onClick={f.onClick}>
                    {f.value}
                  </Button>
                ) : (
                  // Relational = a link to ANOTHER record → TableCellLink
                  // (table.tsx's real "Link-text=Yes" DS variant). A caption
                  // stays above it, since "David Kim" alone doesn't say
                  // who's being linked to or why.
                  <div key={i} className="flex flex-col gap-[2px] min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                      {f.label}
                    </span>
                    <TableCellLink onClick={f.onClick}>{f.value}</TableCellLink>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </CardContainer>
  )
}

// ── Overflow menu — the repo's real Menu/MenuItem atom, anchored the same way
// NotificationCenter's own filter dropdown already is (capture the trigger's
// rect on click, render fixed-position, dismiss on backdrop click). ──

function ActionOverflowMenu({
  items,
  disabled,
  disabledTooltip,
}: {
  items: RecordAction[]
  /** Locked (task 5) — every item in this menu is a write action, so the
   *  whole trigger disables rather than opening a menu of dead entries. */
  disabled?: boolean
  disabledTooltip?: string
}) {
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null)

  const trigger = (
    <Button
      variant="tertiary"
      size="sm"
      iconPosition="alone"
      icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
      aria-label="More actions"
      disabled={disabled}
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        setAnchor(prev => (prev ? null : { left: rect.right - 200, top: rect.bottom + 4 }))
      }}
    />
  )

  return (
    <>
      {disabled && disabledTooltip ? <Tooltip content={disabledTooltip}>{trigger}</Tooltip> : trigger}
      {anchor && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={() => setAnchor(null)} />
          <div style={{ position: "fixed", left: anchor.left, top: anchor.top, zIndex: 10001 }}>
            <Menu className="w-[200px]">
              {items.map((a, i) => (
                <MenuItem
                  key={i}
                  size="sm"
                  label={a.label}
                  onClick={() => { a.onClick?.(); setAnchor(null) }}
                />
              ))}
            </Menu>
          </div>
        </>
      )}
    </>
  )
}

// ── Signal bar — kept as its own small function for readability, not a
// separately-exported component (it's not meant to be used outside RecordHeader). ──

function SignalBar({
  signal,
  sig,
  loading,
}: {
  signal: NextBestAction
  sig: { Icon: LucideIcon | null; bg: string; bd: string; fg: string }
  /** Task 2 — NBA engine still computing. Same footprint (padding/border/
   *  radius), Skeleton content instead of icon+label, never clickable,
   *  never dismissible — there's nothing resolved yet to act on or close. */
  loading?: boolean
}) {
  const { Icon } = sig
  const clickable = !loading && Boolean(signal.onAction)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Task 3 — long label/dueContext truncates (with a Tooltip for the full
  // text) past a rough length threshold, instead of wrapping the bar taller
  // and shifting everything below it. Short text (the common case, and every
  // existing mock) is completely unaffected — no Tooltip wrapper at all.
  const fullText = signal.dueContext ? `${signal.label} · ${signal.dueContext}` : signal.label
  const isLongText = fullText.length > 60

  // Loading always renders the neutral container — there's no severity yet
  // to color it by (see SEVERITY_CONFIG.neutral, already in module scope).
  const containerBg = loading ? SEVERITY_CONFIG.neutral.bg : sig.bg
  const containerBd = loading ? SEVERITY_CONFIG.neutral.bd : sig.bd

  const labelContent = (
    <>
      {signal.label}
      {signal.dueContext && (
        <span className="font-medium opacity-80"> · {signal.dueContext}</span>
      )}
    </>
  )

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={loading ? undefined : signal.onAction}
      onKeyDown={e => {
        if (!clickable) return
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); signal.onAction?.() }
      }}
      className={cn(
        "flex items-center gap-[8px] rounded-[8px] px-[12px] py-[10px] outline-none",
        clickable && "cursor-pointer transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[ring-offset-color:var(--canvas)]",
      )}
      style={{ background: containerBg, border: `0.5px solid ${containerBd}` }}
    >
      {loading ? (
        <>
          <Skeleton shape="circle" width={16} height={16} />
          <Skeleton shape="text" width="55%" height={13} className="flex-1" />
        </>
      ) : (
        <>
          {/* neutral has no Icon (see SEVERITY_CONFIG) — Badge's own neutral dot
              is the real "muted status" indicator, not a stroked icon standing
              in for one. */}
          {Icon ? (
            <Icon size={16} strokeWidth={1.75} style={{ color: sig.fg }} className="shrink-0" />
          ) : (
            <Badge variant="neutral" className="shrink-0" />
          )}
          {isLongText ? (
            <Tooltip content={fullText} triggerClassName="block min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-[1.4]" style={{ color: sig.fg }}>
                {labelContent}
              </span>
            </Tooltip>
          ) : (
            <span className="text-[13px] font-semibold leading-[1.4] flex-1 min-w-0" style={{ color: sig.fg }}>
              {labelContent}
            </span>
          )}
          {signal.actionLabel && (
            // The action is nameable — a real button replaces the plain chevron
            // hint, since "click somewhere on this bar" is a worse affordance
            // than a labeled button once there's a specific verb to show.
            // stopPropagation so this doesn't also fire the row's own onClick —
            // same double-invoke risk this repo's NotificationCenter filter fix
            // already ran into once with a similarly-nested click target.
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={e => { e.stopPropagation(); signal.onAction?.() }}
            >
              {signal.actionLabel}
            </Button>
          )}
          {!signal.actionLabel && clickable && (
            <ChevronDown size={14} strokeWidth={1.75} style={{ color: sig.fg, transform: "rotate(-90deg)" }} className="shrink-0" />
          )}
          {signal.dismissible && (
            // Same affordance as AlertBanner's onClose — reserved for signals with
            // no actionLabel/onAction (see the field's own doc comment above), so
            // dismissing never hides an actual next step.
            <button
              type="button"
              aria-label="Dismiss"
              onClick={e => { e.stopPropagation(); setDismissed(true); signal.onDismiss?.() }}
              className="shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-opacity hover:opacity-70 focus-visible:outline-none"
              style={{ color: sig.fg }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

export { RecordHeader }
