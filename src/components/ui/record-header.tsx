import { useState, useRef, useLayoutEffect } from "react"
import {
  ChevronDown, ChevronUp, ChevronRight, ArrowUpRight, Sparkle, MoreHorizontal, Lock, Info, Workflow, User,
  AlertTriangle, CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem } from "@/components/ui/menu-item"
import { Tooltip } from "@/components/ui/tooltip"
import { InformativeCard } from "@/components/ui/informative-card"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Record Header — AIMS OS Design System
 *
 * NOT YET IN FIGMA — this is a new component, not synced from an existing node.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * REDESIGN PASS (this revision) — realigned to a validated visual redesign.
 * 5 changes, same underlying data model:
 *   1. The RECORD provenance trigger and entity type were already beside
 *      the name (left-aligned) from a prior correction pass — unchanged
 *      here, just confirmed as part of this redesign's own reference.
 *   2. Next Best Action is REINTRODUCED (`nextBestActions` prop) — but as a
 *      protagonist block, not the old Signal bar the history note below
 *      describes. Same block, repositioned: visible right under the
 *      identity tags while collapsed, and at the end of the expanded zones
 *      while expanded — never duplicated, never hidden in either state.
 *   3. Agentic System lost its section heading (the reference design shows
 *      Workflow/Agent as plain cards, no label above them) and the agent's
 *      signal color moved from purple to lime green — Workflow stays light
 *      blue. This is a deliberate, validated change to Law-adjacent color
 *      convention, not a bug: purple is no longer a signal color in this
 *      file at all.
 *   4. Your Intervention's pending items now trigger via a diagonal arrow
 *      (ArrowUpRight), never a labeled "Review" button — clicking one opens
 *      the real HTL view in a NEW TAB, never a same-page overlay, so the
 *      viewer never loses their place on this record. "Show N more" caps
 *      at 3 extra items inline; "View all" is the separate, always-present
 *      escape hatch to the full list (also a new tab). See OPEN_HTL_TOOLTIP
 *      and InterventionZoneContent's own doc comment.
 *   5. `RecordHeaderZoneLabels` lost `agenticSystem` (no heading left to
 *      translate) on top of `record` (already gone from the prior pass).
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AGNOSTICISM PASS (earlier revision) — the component previously modeled exactly
 * 3 closed entity variants (uep/ucp/uvp — Employee/Customer/Vendor), each with
 * its own fixed field-name interface (UEPRecord.manager, UCPRecord.renewalDate,
 * etc.) and an internal switch statement deriving the Identity type icon/label
 * and the RECORD field list from that variant. That's gone. This card now
 * serves ANY entity type on the platform, not just HR/CRM shapes:
 *   - `variant`/`data` (UEPRecord | UCPRecord | UVPRecord) → replaced by
 *     `name: string` + `entityType: { icon, label }` + `recordFields:
 *     RecordField[]` passed straight from the host. There is no internal
 *     switch on entity type anywhere in this file anymore — the type icon
 *     and the RECORD grid are both 100% data-driven. A host can pass
 *     `entityType={{ icon: Stethoscope, label: "Patient" }}` today with zero
 *     changes to this file.
 *   - Zone labels ("Agentic System"/"Your Intervention"/"Record") are
 *     configurable via the `labels` prop (i18n-ready) — default English
 *     copy applies when omitted.
 *   - Every zone already rendered conditionally (Agentic System/Your
 *     Intervention/Record all omit entirely when the host doesn't pass
 *     them) — that data-driven-presence rule is unchanged and now extends
 *     to the zones' own STATE unions (see AgenticSystemInfo/
 *     PendingIntervention below): passing the prop at all (even in an
 *     "empty"/"loading" status) means "render this zone"; omitting it
 *     entirely means "this entity type doesn't use this zone."
 *   - The 3 signal colors (lime green = AI/agent, light blue = workflow,
 *     amber = intervention/HTL — agent was purple before the redesign pass
 *     above) encode SIGNAL TYPE, never a vertical — nothing in this file
 *     branches color by entity type. Confirmed by construction: there's no
 *     entity-type variable in scope anywhere near the color tokens below.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MAJOR RESTRUCTURE (earlier revision, kept for history): this file used to
 * model a generic Employee/Customer/Client header with a Next Best Action
 * Signal bar and a variable secondary-actions list. Replaced end to end by
 * the governed-card product: Identity (fixed) + 3 expandable zones (Agentic
 * System / Your Intervention / Record). An interim revision added a
 * decorative `statusDot` next to the name in place of the Signal bar; that
 * was removed (this revision) — a colored dot with no label/tooltip/meaning
 * communicated nothing and was pure visual noise. If a glanceable status
 * indicator is wanted here in the future, it needs an explicit meaning and
 * a Tooltip, not a bare color.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Governance canon (AIMS OS law, not preference — see the Reference tab's
 * own "Governance canon" section for the full, reader-facing version):
 *   Law 1 — Authority/origin of every field is ALWAYS visible. Every RECORD
 *     field carries a FieldProvenance and renders its origin-system badge
 *     inline — never a value floating with no traceable source.
 *   Law 2 — Every governed answer carries provenance reachable WITHOUT
 *     leaving the view. The (i) icon sits directly beside the name
 *     (redesign pass) and opens the Data Provenance SlideOut (the host may
 *     title it "About this record") from right here — no navigating away
 *     first.
 *   Law 3 — HTL (human-in-the-loop) items are first-class states with their
 *     own calm, explanatory language — NEVER rendered as red errors. Every
 *     Your Intervention status (pending/empty/loading/no-permission/error/
 *     resolved-elsewhere) renders through InformativeCard's calm token
 *     families — "error" (red) is never used, even for the "error" status
 *     (that uses "alert"/amber, per explicit instruction).
 *   Law 4 — PII resolves only at display-time, per viewer entitlements. A
 *     hydrated (real) field and a masked field are the SAME RecordField in
 *     2 states — see RecordField's own doc comment. This component renders
 *     whichever state it's given; it never resolves entitlements itself.
 *
 * Structure — Identity (fixed) + NBA (protagonist, repositionable) + 2
 * expandable zones, one shared skeleton for any entity type — only the
 * zone CONTENT changes, never the skeleton:
 *   Identity (always visible) → avatar, name (truncates with a Tooltip —
 *     never stretches or wraps the row), the RECORD provenance trigger
 *     (icon-only Button, see below), entity-type icon + TEXT (both, not
 *     icon-only) — all left-aligned, beside the name — up to 3
 *     governance-state Tags (hidden once expanded), Locked state. Actions:
 *     AI agent trigger ("Ask about {firstName}") → optional primary CTA
 *     (actions[0], host-provided — omitted entirely if the host passes
 *     none) → "···" overflow (actions[1+]) → disclosure chevron. Clicking a
 *     compressed Tag expands the card and scrolls/highlights the zone that
 *     Tag summarizes — see Block 2 note below.
 *   NEXT BEST ACTION (always visible, not gated by the disclosure — this
 *     redesign pass) → right under the identity tags while collapsed, at
 *     the end of the expanded zones while expanded. See NextBestAction's
 *     own doc comment and NextBestActionBlock.
 *   AGENTIC SYSTEM (expanded, no section heading — this redesign pass) →
 *     each item (Active Workflow / Last Agent) is a CardContainer
 *     (size="sm") with a HighlightIcon (size="sm", colored: light-blue =
 *     workflow, lime = agent) + a NEUTRAL tertiary Button — color lives in
 *     the icon, never in the button. Also renders "empty" (no
 *     workflow/agent yet) and "loading" (Skeleton) states.
 *   YOUR INTERVENTION (expanded, only if `intervention` is set) → renders
 *     one of 6 states through InformativeCard (size="sm", never red):
 *     pending (default, N items — most prioritized shown + a diagonal-
 *     arrow trigger that opens the real HTL view in a NEW TAB, never a
 *     same-page overlay; "Show N more" caps at 3 extra inline, "View all"
 *     is the separate always-present escape hatch — this redesign pass,
 *     see InterventionZoneContent's own doc comment) / empty / loading /
 *     no-permission (+ Escalate) / error / resolved-elsewhere. See
 *     PendingIntervention's own doc comment.
 *   RECORD → no expandable zone at all (moved out in the prior correction
 *     pass) — its trigger is the icon-only Button beside the name
 *     (Identity, above), always visible, opening the Data Provenance
 *     SlideOut (Law 2) for every field at once — disabled + a Tooltip
 *     explaining why when the host hasn't wired onProvenanceOpen, never
 *     silently hidden.
 *
 * Block 2 — clicking a compressed identity Tag (this revision): every tag
 *   (agent/workflow/HTL) is a single, consistent interaction — it expands
 *   the card (if collapsed) and scrolls/highlights the zone it summarizes.
 *   It NEVER opens a SlideOut/new-tab directly from the collapsed tag —
 *   the deep detail is reached from the expanded zone itself (its own
 *   Button, or the HTL item's own diagonal-arrow trigger), same "expand
 *   first, drill in second" flow for every tag, every time. See
 *   `focusZone()` below.
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Card       → CardContainer (size="default", variant="default") for the
 *                whole header; CardContainer (size="sm") for each Agentic
 *                System item.
 *   Avatar     → AvatarCircle sizeKey="lg".
 *   Identity metadata → Tag (size="sm"), NOT Chip — Chip is the interactive
 *                filter-row control, Tag is the read-only display atom.
 *   AI agent trigger → Button icon+label, `Sparkle` glyph, variant="main" —
 *                the one confirmed, named exception to "never main in a
 *                card" (see CLAUDE.md's Button hierarchy rules). Don't
 *                extend it to any other button in this file.
 *   Overflow   → Menu/MenuItem (menu-item.tsx), anchored via captured
 *                getBoundingClientRect() on trigger click.
 *   Disclosure → local expanded state + max-height transition, also reused
 *                for the identity-tags hide-on-expand transition and for
 *                Block 2's "expand + scroll to zone" tag click behavior.
 *   Agentic System items → CardContainer (sm) + HighlightIcon (sm, colored)
 *                + Button variant="tertiary" (neutral, no color). RECORD
 *                trigger (beside the name, Identity) → a single icon-only
 *                Button variant="tertiary", opening Data Provenance for
 *                every field at once. Never a colored card for metadata,
 *                per explicit instruction — HighlightIcon's own tinted box
 *                is the one sanctioned exception (it's a dedicated
 *                colored-icon atom, not a colored metadata card).
 *   Next Best Action → a native `<button>` (not the Button component — the
 *                whole block, icon+text+chevron, is one clickable target,
 *                same "raw styled element for a custom shape" precedent as
 *                the collapsed identity tags), dark-purple surface
 *                (--color-surface-purple-darker, paired with the SAME
 *                constant-white text token Chip's purple-primary variant
 *                already uses — see NextBestActionBlock's own doc comment
 *                for why, never --color-text-purple).
 *   Your Intervention → InformativeCard (size="sm"), title in normal
 *                sentence case (not literal ALL CAPS), state="alert" for
 *                pending/error, state="neutral" for empty/resolved-
 *                elsewhere — never state="error" (red), regardless of
 *                intervention.severity or status. Pending items' trigger →
 *                InformativeCard's new `trailingIcon` prop (this redesign
 *                pass — an icon-only Button, ArrowUpRight, added
 *                additively to informative-card.tsx alongside the
 *                existing cta/ctaSecondary, default behavior unchanged).
 *   Loading states → Skeleton (skeleton.tsx) — no spinner-only dead air;
 *                shapes approximate the real content so layout doesn't jump
 *                when data arrives.
 *   Field origin badge → Tag (size="sm"), wrapped in Tooltip (side="cursor"
 *                — the only Tooltip mode that flips off a viewport edge
 *                instead of clipping) showing the fuller provenance.
 *   Governed SlideOuts/SidePanels (Workflow detail, Pending Decisions,
 *                Agent detail, Data Provenance, agent chat) → RecordHeader
 *                itself never renders any of them — every clickable
 *                surface exposes an `onOpen`/`onAction` callback, and the
 *                consuming screen (App.tsx's RecordHeaderPage demo) owns
 *                the actual overlay instance, composed per the "SlideOut/
 *                SidePanel — Content" pattern page.
 */

// ── Field-level provenance (Law 1 + Law 2) ──────────────────────────────────
// Every RECORD field carries exactly this — never a bare value with no
// traceable source. `systemAbbr` is the short badge label (e.g. "WD"); the
// Tooltip on that badge (and the Data Provenance SlideOut, Law 2) both read
// from the same object, so the two surfaces can never drift out of sync.
export interface FieldProvenance {
  /** Full source-system name, e.g. "Workday", "Okta", "Salesforce". */
  system: string
  /** Short badge label, e.g. "WD", "OK", "SF" — what actually renders inline. */
  systemAbbr: string
  /** Unified profile model version, e.g. "UEP v2.3". */
  modelVersion: string
  /** e.g. "2h ago" — when Source last synced into the Model layer. */
  syncedAgo: string
}

// ── A single RECORD field (Law 4 — display-time PII resolution) ────────────
// A "hydrated" field and a "masked" field are the SAME field in 2 possible
// entitlement states — NOT two different field types. RecordHeader renders
// whichever state it's given; it never resolves permissions itself. See the
// Reference tab's "PII / masking (Law 4)" section for the full framing.
//
// Block 4 — this is the ONLY field shape RECORD ever renders, for ANY entity
// type: { label, value, provenance, destination? }. There is no hidden
// "employee field" structure anywhere else in this file — the host builds
// this array directly (see RecordHeaderProps.recordFields).
export interface RecordField {
  label: string
  /** Leading icon for scanability — also reinforces Law 1 (authority/origin
   *  always visible) alongside the provenance badge, not a decoration. */
  icon: LucideIcon
  provenance: FieldProvenance
  // Ley 4: display-time PII resolution — masking depende de entitlements del
  // backend. This component does NOT implement entitlement resolution; the
  // caller decides which state to construct this field in per the current
  // viewer's permissions. Both states still carry full provenance (Law 1
  // applies regardless of masking — the badge/Tooltip never disappear).
  state: "hydrated" | "masked"
  /** The real value — rendered when state === "hydrated". */
  value: string
  /** Shown instead of `value` when state === "masked", e.g. "•••• (restricted)". */
  maskedValue?: string
  /**
   * Does this field have somewhere to go beyond its own provenance? Default
   * true (most fields do — clicking opens Data Provenance, per the
   * transversal "opens detail" convention). Set `false` for a plain
   * descriptive fact with nothing further to show (e.g. a pure date, a pure
   * figure) — that field renders as static text, NO chevron, NOT a Button —
   * only its provenance badge stays hoverable (Tooltip on the badge itself).
   */
  hasDestination?: boolean
}

// ── Agentic System (Zone: AGENTIC SYSTEM) ───────────────────────────────────
// A discriminated union, not just the 2 fixed slots — covers the full state
// coverage this revision adds:
//   status omitted or "ready" → normal rendering, both slots independently
//     optional (a record can have a workflow but no agent, or vice versa).
//   status "empty"  → this entity type uses the zone, but genuinely has
//     neither a workflow nor an agent right now (e.g. a freshly imported
//     record) — renders a calm "nothing yet" message, not a broken gap.
//   status "loading" → the agent/workflow is still resolving — Skeleton
//     rows, same footprint as the real content so layout doesn't jump.
// Omitting the whole `agenticSystem` prop (undefined) still means "this
// entity type doesn't use this zone at all" — the zone doesn't render,
// full stop (Block 4's conditional-zone rule).
export type AgenticSystemInfo =
  | {
      status?: "ready"
      activeWorkflow?: { name: string; onOpen?: () => void }
      lastAgent?: { name: string; onOpen?: () => void }
    }
  | { status: "loading" }
  | { status: "empty"; message?: string }

// ── A single pending decision (Zone: YOUR INTERVENTION, "pending" status) ──
// Block 3 (this pass) — a record can have N pending interventions, not just
// 1. Each keeps its own severity and its own Review action — approving one
// never bundles or blocks the others. The host is expected to pass `items`
// already ordered by priority (most prioritized first — typically highest
// severity, then oldest); this component is a dumb renderer, not a sorting
// engine, so it never re-sorts what it's given.
export interface InterventionItem {
  id: string
  description: string
  severity: "high" | "medium" | "low"
  onReview: () => void
}

// ── Your Intervention (Zone: YOUR INTERVENTION, conditional) ───────────────
// A first-class HTL state (Law 3) — a discriminated union covering every
// state this revision's edge-case gallery calls for, all rendered through
// InformativeCard's calm token families (never the red "error" state):
//   status omitted or "pending" → `items: InterventionItem[]` (Block 3).
//     The first item renders full-size and prioritized (severity feeds the
//     Pending Decisions SlideOut's own display only — it does NOT change
//     this card's visual treatment, which stays alert/amber regardless,
//     that constancy IS Law 3); items[1:] collapse behind a "+N more"
//     disclosure — see InterventionZoneContent's own doc comment for why
//     that's a disclosure and NOT a carousel. Exactly 1 item renders with
//     no counter at all — the counter only exists once there's something
//     to count.
//   "empty"             → genuinely nothing pending right now — a calm
//     completion message, not an absent/broken zone.
//   "loading"           → the NBA engine is still computing — Skeleton.
//   "no-permission"     → this viewer can't approve; Review renders
//     disabled (with a Tooltip explaining why) and, when `onEscalate` is
//     given, an "Escalate" alternate action appears alongside it.
//   "error"             → the last approve/dismiss attempt failed — amber
//     InformativeCard (state="alert"), NEVER a red toast.
//   "resolved-elsewhere"→ stale state: someone else already resolved this
//     since the viewer last saw it — "Already resolved by {resolvedBy} ·
//     {resolvedAgo}", no Approve/Review button (there's nothing left to do).
// Omitting the whole `intervention` prop (undefined) means this entity type
// has genuinely nothing to show here right now — the zone omits entirely.
export type PendingIntervention =
  | { status?: "pending"; items: InterventionItem[]; onViewAll?: () => void }
  | { status: "empty"; message?: string }
  | { status: "loading" }
  | { status: "no-permission"; description: string; onEscalate?: () => void }
  | { status: "error"; message: string; onRetry?: () => void }
  | { status: "resolved-elsewhere"; resolvedBy: string; resolvedAgo: string; description: string }

// ── Next Best Action (reintroduced, this redesign pass — NEW shape, not the
// pre-governed-card Signal bar the file header's history note describes) ──
// A protagonist block, not a zone: visible in BOTH collapsed (right under
// the identity tags) and expanded (at the end, after Your Intervention) —
// same block, repositioned, never duplicated or hidden. A record can have
// N of these; each opens its own detail SlideOut (host-owned, same
// onOpen/onAction delegation as everything else in this file). Detail
// SlideOut CONTENT (the "base + type + dynamic" 3-layer task structure) is
// // TODO: Prompt 2 — this pass only wires the trigger and a placeholder.
export interface NextBestAction {
  id: string
  title: string
  description: string
  onOpen: () => void
}

// ── Assigned AI agent (transversal across entity types) ─────────────────────
// AIMS OS is agent-first: every record has one, regardless of entity type.
export interface AssignedAgent {
  id: string
  name: string
  /** Opens a chat scoped to this record. RecordHeader never renders the chat
   *  UI itself — same delegation pattern as every onOpen/onAction below. */
  onOpenChat: () => void
}

// ── Record action (Identity row CTA + overflow) ─────────────────────────────
export type RecordActionVariant = "primary" | "secondary" | "tertiary"

export interface RecordAction {
  label: string
  variant?: RecordActionVariant
  onClick?: () => void
  /**
   * Explicit disabled override, independent from `locked` — e.g. "no
   * contact channel on file" or "you don't have permission to contact this
   * record." Never hides the action (same "never a silently missing
   * button" rule as assignedAgent === null) — it disables with
   * `disabledTooltip` explaining why.
   */
  disabled?: boolean
  /** Tooltip shown when disabled (by either `disabled` or the record's own `locked`). */
  disabledTooltip?: string
  /**
   * Default true (disables like every other action when the record is
   * `locked`). Set `false` when this specific action doesn't modify the
   * record — e.g. Message/contact: DECISION FLAGGED, hypothesis not
   * explicitly confirmed — // TODO: confirmar con Michael si "locked"
   * debería seguir permitiendo contactar al record.
   */
  disableWhenLocked?: boolean
}

// ── Entity type (Block 4 — data-driven, not a closed enum) ─────────────────
// Whatever this record IS — Employee, Customer, Vendor, Patient, Citizen,
// Student, anything the host platform defines tomorrow — comes from the
// host as a plain icon + label. This file never enumerates entity types.
export interface RecordHeaderEntityType {
  icon: LucideIcon
  label: string
}

// ── Zone labels (Block 4 — i18n-ready, never baked in) ─────────────────────
// Every zone heading can be renamed/translated by the host. Defaults
// preserve the existing English copy when the host doesn't override. No
// `record` entry (RECORD's trigger lives beside the name, no heading) and
// no `agenticSystem` entry either (this redesign pass — the reference
// design shows the Workflow/Agent cards with no section title at all).
// Your Intervention keeps its heading — only these 2 lost theirs.
export interface RecordHeaderZoneLabels {
  intervention?: string
}

const DEFAULT_ZONE_LABELS: Required<RecordHeaderZoneLabels> = {
  intervention: "Your Intervention",
}

export interface RecordHeaderProps {
  /** The record's display name — e.g. a person's name or an account name. */
  name: string
  /** What kind of record this is — icon + label, entirely host-defined. */
  entityType: RecordHeaderEntityType
  /** Zone: RECORD. Each field already carries provenance (Law 1) and a
   *  masking state (Law 4) — see RecordField's own doc comment. Omit or
   *  pass an empty array to skip the RECORD zone for this entity type. */
  recordFields?: RecordField[]
  /**
   * Required as a PROP (every caller must decide), but the value itself can
   * be `null` for a record that genuinely has no assigned agent yet. `null`
   * renders the same button, disabled, with a Tooltip explaining why —
   * never a silently missing button and never a broken one.
   */
  assignedAgent: AssignedAgent | null
  /** actions[0] = an optional primary CTA (e.g. contact); actions[1+] = overflow menu items. Omit entirely for no CTA/overflow. */
  actions?: RecordAction[]
  /** Zone: AGENTIC SYSTEM. Omit entirely to skip the zone for this entity type. */
  agenticSystem?: AgenticSystemInfo
  /** Zone: YOUR INTERVENTION. Omit entirely to skip the zone for this entity type. */
  intervention?: PendingIntervention
  /**
   * The protagonist block (this redesign pass) — omit or pass an empty
   * array for a record with genuinely nothing to recommend right now (it
   * disappears entirely, same "never fake a state" rule as every other
   * zone). N is supported; each renders its own block, stacked.
   */
  nextBestActions?: NextBestAction[]
  /** Opens the Data Provenance SlideOut for the whole RECORD zone (Law 2). */
  onProvenanceOpen?: () => void
  /** Uncontrolled initial state for the zones disclosure. Default: false (collapsed) — predictable header height. */
  defaultExpanded?: boolean
  /**
   * True → this record is read-only right now. The contact CTA and the
   * overflow's write actions disable (with a Tooltip explaining why) — but
   * the AI agent trigger, the Agentic System buttons, and every RECORD
   * field's own provenance stay fully interactive/visible. DECISION
   * FLAGGED — hypothesis, not explicitly confirmed: "locked" means you
   * can't act on or edit this record, not that you can't consult it, so
   * read-only surfaces (agent chat, Agentic System detail, provenance) are
   * deliberately left active. // TODO: confirmar con Michael si "locked"
   * debería restringir también estas superficies de solo lectura.
   */
  locked?: boolean
  /** i18n-ready zone headings — see RecordHeaderZoneLabels's own doc comment. */
  labels?: RecordHeaderZoneLabels
  className?: string
}

// ── Centralized fallback copy (configurable/centralized, never scattered inline in JSX) ──
export const RECORD_HEADER_FALLBACKS = {
  /** Tooltip on the agent trigger when assignedAgent is null. */
  noAgentTooltip: "No agent assigned to this record",
  /** The read-only Tag shown next to the type label when `locked` is true. */
  lockedTagLabel: "Locked",
  /** Tooltip on the CTA/overflow trigger when `locked` is true. */
  lockedActionTooltip: "This record is locked — read-only",
  /** Default empty-state copy when AgenticSystemInfo/PendingIntervention omit `message`. */
  agenticSystemEmpty: "No workflow or agent assigned yet",
  /** Reads as completion, not absence — an empty queue is a good state, not a broken one. */
  interventionEmpty: "No interventions pending — you're all caught up",
}

// ── Desktop overflow — container-width collapse thresholds ─────────────────
// Not viewport breakpoints: this card can sit in a narrower panel on an
// otherwise-desktop screen, so width is measured on the card's own rendered
// box via ResizeObserver, not read from Tailwind's sm:/md:. No Figma node
// exists for this component yet, so these px values are calibrated
// estimates, not a spec'd breakpoint. Below COLLAPSE_HIDE_TAGS_WIDTH,
// identity tags hide completely; below the narrower
// COLLAPSE_SHORTEN_ASSISTANT_WIDTH, "Ask about {name}" shortens to "Ask AI"
// — the agent trigger and disclosure chevron are never sacrificed, only
// their label content adapts.
const COLLAPSE_HIDE_TAGS_WIDTH = 560
const COLLAPSE_SHORTEN_ASSISTANT_WIDTH = 480
// A long first name can overflow even at full width — this is a length
// guard, not a replacement for the width measurement above; both apply.
const ASSISTANT_LABEL_MAX_NAME_LENGTH = 12
// How long the scrolled-to zone stays visually highlighted after a tag click.
const ZONE_HIGHLIGHT_MS = 1400
// Every HTL diagonal-arrow trigger carries this same Tooltip copy (this
// redesign pass) — never a same-page SlideOut/Modal, always a fresh tab, so
// the viewer never loses their place on this record.
const OPEN_HTL_TOOLTIP = "Opens in a new tab"

type ZoneKey = "agenticSystem" | "intervention"

// ── Component ────────────────────────────────────────────────────────────────

function RecordHeader({
  name,
  entityType,
  recordFields = [],
  assignedAgent,
  actions = [],
  agenticSystem,
  intervention,
  nextBestActions = [],
  onProvenanceOpen,
  defaultExpanded = false,
  locked = false,
  labels,
  className,
}: RecordHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const TypeIcon = entityType.icon
  const zoneLabels = { ...DEFAULT_ZONE_LABELS, ...labels }
  const [primaryAction, ...overflowActions] = actions
  const hasNBA = nextBestActions.length > 0

  const agenticStatus = agenticSystem ? (agenticSystem.status ?? "ready") : undefined
  const interventionStatus = intervention ? (intervention.status ?? "pending") : undefined
  const hasAgenticSystem = agenticSystem !== undefined
  const hasIntervention = intervention !== undefined
  const hasRecordFields = recordFields.length > 0
  // RECORD is no longer one of the expandable zones (this correction pass —
  // its provenance trigger moved up beside the name, always visible). Only
  // Agentic System/Your Intervention still gate the disclosure chevron.
  const hasAnyZone = hasAgenticSystem || hasIntervention

  // Block 2 — clicking a compressed identity Tag expands the card and
  // scrolls/highlights the zone it summarizes. Never opens a SlideOut
  // directly — the deep detail lives one step further in, inside the
  // expanded zone's own Button/Review CTA.
  const agenticSystemZoneRef = useRef<HTMLDivElement>(null)
  const interventionZoneRef = useRef<HTMLDivElement>(null)
  const [highlightZone, setHighlightZone] = useState<ZoneKey | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function focusZone(zone: ZoneKey) {
    setExpanded(true)
    setHighlightZone(zone)
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    // Wait a frame so the expand region has started laying out before we
    // scroll to it — scrollIntoView on a still-collapsed (max-height: 0)
    // ancestor would compute the wrong position.
    requestAnimationFrame(() => {
      const ref = zone === "agenticSystem" ? agenticSystemZoneRef : interventionZoneRef
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightZone(prev => (prev === zone ? null : prev))
    }, ZONE_HIGHLIGHT_MS)
  }

  // Avatar fallback: only a genuinely blank name gets the DS's own "empty"
  // glyph (avatar.tsx's existing avatarStyle="empty") instead of initials —
  // a single-character name already renders fine as one initial.
  const hasName = Boolean(name && name.trim())

  // Desktop overflow — width-driven, derived fresh on every measure (no
  // "un-collapse" state to manage — it naturally reverses when the card
  // grows back).
  const rootRef = useRef<HTMLDivElement>(null)
  const [tagsHidden, setTagsHidden] = useState(false)
  const [assistantShortened, setAssistantShortened] = useState(false)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      setTagsHidden(el.clientWidth < COLLAPSE_HIDE_TAGS_WIDTH)
      setAssistantShortened(el.clientWidth < COLLAPSE_SHORTEN_ASSISTANT_WIDTH)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Collapsed identity tags — measured, not guessed (this correction). The
  // row can hold up to 3 Tags (agent/workflow/HTL) and wraps at
  // intermediate widths (narrow enough that 3 don't fit on one line, but
  // not narrow enough to trip COLLAPSE_HIDE_TAGS_WIDTH's full-hide
  // fallback) — a fixed max-height tall enough for only 1 line clipped the
  // wrapped 2nd line's tag almost entirely. Measuring the real content
  // height via ResizeObserver (same pattern as the width measurements
  // above) means the collapse animation always reserves exactly the room
  // the tags actually need, 1 line or 2, without guessing a magic number
  // or reserving dead space when there's nothing to wrap.
  const tagsRowRef = useRef<HTMLDivElement>(null)
  const [tagsRowHeight, setTagsRowHeight] = useState(0)
  useLayoutEffect(() => {
    const el = tagsRowRef.current
    if (!el) { setTagsRowHeight(0); return }
    const measure = () => setTagsRowHeight(el.scrollHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
    // Re-attach whenever the row's own mount condition (below) can flip —
    // tagsHidden toggling, or a zone's presence/status changing, mounts or
    // unmounts the ref target, and a plain [] effect would miss that.
  }, [tagsHidden, assignedAgent, agenticStatus, interventionStatus])

  // NBA, collapsed position — same measured-height technique as the tags
  // row above, kept as its own independent ref/state since it lives at a
  // different DOM level (full card width, not nested in the name column)
  // and can't share that wrapper's ref.
  const nbaBlockRef = useRef<HTMLDivElement>(null)
  const [nbaBlockHeight, setNbaBlockHeight] = useState(0)
  useLayoutEffect(() => {
    const el = nbaBlockRef.current
    if (!el) { setNbaBlockHeight(0); return }
    const measure = () => setNbaBlockHeight(el.scrollHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [hasNBA])

  // AI Assistant CTA — "Ask about {firstName}" communicates this chat is
  // scoped to THIS record, not a generic assistant entry point. Falls back
  // to "Ask AI" (+ Tooltip carrying the same context) when the card is
  // narrow OR the first name itself is long enough to risk breaking the
  // action row — either condition alone is enough to trigger the fallback.
  const assistantFirstName = name.trim().split(/\s+/)[0] ?? ""
  const assistantUseFallback = assistantShortened || assistantFirstName.length > ASSISTANT_LABEL_MAX_NAME_LENGTH
  const assistantLabel = assistantUseFallback ? "Ask AI" : `Ask about ${assistantFirstName}`
  const assistantTooltip = `Ask the assistant with ${name}'s context`

  return (
    <CardContainer size="default" variant="default" className={cn("w-full", className)}>
      <div ref={rootRef} className="flex flex-col gap-[16px]">

        {/* ── Identity row (always visible, fixed) — avatar + name +
            entity-type icon+text + up to 3 governance-state Tags + action row.
            Cross-axis alignment is conditional: items-start while collapsed
            (the tags row underneath makes this a 2-line block), items-center
            once expanded (name row is the only line left, so it should sit
            centered against the avatar, not pinned to its top edge). */}
        <div className={cn("flex gap-[12px] flex-wrap", expanded ? "items-center" : "items-start")}>
          <AvatarCircle name={name || entityType.label} sizeKey="lg" avatarStyle={hasName ? "text" : "empty"} />

          <div className="flex-1 flex flex-col gap-[6px]">
            <div className="flex items-center gap-[12px] min-w-0">
              {/* Overflow — a long name truncates with an ellipsis instead of
                  wrapping/stretching the row; a Tooltip on hover carries the
                  full value. Sibling elements (entity type, Locked tag) are
                  shrink-0 so the name is the only thing that ever gives up
                  width. */}
              <Tooltip content={name} side="cursor" triggerClassName="block min-w-0 flex-1">
                <span className="block truncate text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-title)" }}>
                  {name}
                </span>
              </Tooltip>
              {/* Entity type — icon AND text (not icon-only): "icons that
                  communicate," but the label stays legible on its own too.
                  Order (this Figma-fidelity pass): name → entity type → the
                  RECORD provenance trigger, matching the reference design
                  exactly — was name → trigger → entity type before. */}
              <Tooltip content={entityType.label} side="cursor">
                <span className="inline-flex items-center gap-[4px] shrink-0">
                  <TypeIcon size={14} strokeWidth={1.75} style={{ color: "var(--field-supporting)" }} />
                  <span className="text-[12px] font-medium" style={{ color: "var(--field-supporting)" }}>
                    {entityType.label}
                  </span>
                </span>
              </Tooltip>
              {/* RECORD provenance trigger — lives beside the name, after
                  entity type (Figma order), not gated behind expand/collapse:
                  an icon-only Button variant="tertiary", same primitive
                  every other secondary action in this file uses. Disabled +
                  a Tooltip explaining why when the host hasn't wired
                  onProvenanceOpen — never silently hidden (same rule as
                  assignedAgent === null). */}
              {hasRecordFields && (
                <Tooltip
                  content={onProvenanceOpen ? "View record details — data provenance for every field" : "No provenance view wired for this record yet"}
                  side="cursor"
                >
                  <Button
                    variant="tertiary"
                    size="sm"
                    iconPosition="alone"
                    icon={<Info size={14} strokeWidth={1.75} />}
                    aria-label="View record details"
                    disabled={!onProvenanceOpen}
                    onClick={onProvenanceOpen}
                    className="shrink-0"
                  />
                </Tooltip>
              )}
              {locked && (
                <Tag variant="secondary" size="sm" leadingIcon={<Lock size={12} strokeWidth={1.75} />} className="shrink-0">
                  {RECORD_HEADER_FALLBACKS.lockedTagLabel}
                </Tag>
              )}
            </div>

            {/* Identity tags hide once the card expands: the same facts they
                summarize reappear in full detail in the zones below, so
                keeping both visible is pure redundancy. max-height
                transition (not a hard unmount) so the collapse is animated,
                not an abrupt height jump.
                Tag CONTENT — governance-state indicators: assigned agent
                (lime green, matches Last Agent below — this redesign pass;
                was purple before), active workflow (light blue, matches
                Active Workflow below), pending HTL (amber, matches Your
                Intervention below). Block 2 — every tag is
                clickable: it expands the card and scrolls/highlights the
                zone it summarizes (never opens a SlideOut directly from
                here). Each only renders when that signal is actually in its
                "there's something to summarize" state — no tag for an
                empty/loading/error zone, nothing pretending to summarize
                data that isn't really there. */}
            <div
              style={{
                maxHeight: expanded ? 0 : tagsRowHeight,
                opacity: expanded ? 0 : 1,
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
              }}
            >
              {!tagsHidden && (assignedAgent || agenticStatus === "ready" || interventionStatus === "pending") && (
                <div ref={tagsRowRef} className="flex items-center gap-[6px] flex-wrap">
                  {assignedAgent && (
                    <Tooltip content={`Assigned agent: ${assignedAgent.name}`} side="cursor">
                      <button
                        type="button"
                        onClick={() => focusZone("agenticSystem")}
                        className="cursor-pointer rounded-[8px]"
                      >
                        <Tag variant="limeGreen" size="sm" leadingIcon={<User size={12} strokeWidth={1.75} />}>
                          {assignedAgent.name}
                        </Tag>
                      </button>
                    </Tooltip>
                  )}
                  {agenticStatus === "ready" && agenticSystem && "activeWorkflow" in agenticSystem && agenticSystem.activeWorkflow && (
                    <Tooltip content={`Active workflow: ${agenticSystem.activeWorkflow.name}`} side="cursor">
                      <button
                        type="button"
                        onClick={() => focusZone("agenticSystem")}
                        className="cursor-pointer rounded-[8px]"
                      >
                        <Tag variant="lightBlue" size="sm" leadingIcon={<Workflow size={12} strokeWidth={1.75} />}>
                          {agenticSystem.activeWorkflow.name}
                        </Tag>
                      </button>
                    </Tooltip>
                  )}
                  {interventionStatus === "pending" && intervention && "items" in intervention && intervention.items.length > 0 && (
                    <Tooltip content={intervention.items[0].description} side="cursor">
                      <button
                        type="button"
                        onClick={() => focusZone("intervention")}
                        className="cursor-pointer rounded-[8px]"
                      >
                        <Tag variant="alert" size="sm" leadingIcon={<AlertTriangle size={12} strokeWidth={1.75} />}>
                          {intervention.items.length} pending
                        </Tag>
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[6px] shrink-0 flex-wrap justify-end">
            {/* variant="main" — deliberate, named exception, see file header. */}
            {assignedAgent ? (
              assistantUseFallback ? (
                <Tooltip content={assistantTooltip} side="cursor">
                  <Button
                    variant="main"
                    size="sm"
                    icon={<Sparkle size={16} strokeWidth={1.75} />}
                    aria-label={assistantTooltip}
                    onClick={assignedAgent.onOpenChat}
                  >
                    {assistantLabel}
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  variant="main"
                  size="sm"
                  icon={<Sparkle size={16} strokeWidth={1.75} />}
                  aria-label={assistantTooltip}
                  onClick={assignedAgent.onOpenChat}
                >
                  {assistantLabel}
                </Button>
              )
            ) : (
              <Tooltip content={RECORD_HEADER_FALLBACKS.noAgentTooltip} side="cursor">
                <Button
                  variant="main"
                  size="sm"
                  icon={<Sparkle size={16} strokeWidth={1.75} />}
                  aria-label={RECORD_HEADER_FALLBACKS.noAgentTooltip}
                  disabled
                >
                  {assistantLabel}
                </Button>
              </Tooltip>
            )}

            {primaryAction && (() => {
              // Block 6 (this pass) — an action can be disabled for 2
              // independent reasons: the record is `locked` (unless this
              // action opted out via `disableWhenLocked: false`), or the
              // action itself is explicitly disabled (no channel, no
              // permission — see RecordAction's own doc comment). Never
              // silently hide it either way — same rule as assignedAgent
              // === null: disabled + a Tooltip explaining why, always.
              const lockDisabled = locked && primaryAction.disableWhenLocked !== false
              const disabled = lockDisabled || Boolean(primaryAction.disabled)
              const tooltip = lockDisabled ? RECORD_HEADER_FALLBACKS.lockedActionTooltip : primaryAction.disabledTooltip
              const button = (
                <Button
                  variant={primaryAction.variant ?? "secondary"}
                  size="sm"
                  disabled={disabled}
                  onClick={disabled ? undefined : primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              )
              return disabled && tooltip ? <Tooltip content={tooltip} side="cursor">{button}</Tooltip> : button
            })()}

            {overflowActions.length > 0 && (
              <ActionOverflowMenu
                items={overflowActions}
                disabled={locked}
                disabledTooltip={RECORD_HEADER_FALLBACKS.lockedActionTooltip}
              />
            )}

            {hasAnyZone && (
              <Button
                variant="tertiary"
                size="sm"
                iconPosition="alone"
                aria-expanded={expanded}
                aria-label={expanded ? "Hide record detail" : "Show record detail"}
                icon={expanded ? <ChevronUp size={16} strokeWidth={1.75} /> : <ChevronDown size={16} strokeWidth={1.75} />}
                onClick={() => setExpanded(v => !v)}
              />
            )}
          </div>
        </div>

        {/* NBA, collapsed position — full card width (this redesign pass),
            so it sits as a sibling of the whole identity row rather than
            nested inside the narrower name column the tags row lives in.
            Same measured maxHeight+opacity collapse technique as the tags
            row above, kept as its own independent measurement since it's a
            different DOM region and can't share that ref. */}
        {hasNBA && (
          <div
            style={{
              maxHeight: expanded ? 0 : nbaBlockHeight,
              opacity: expanded ? 0 : 1,
              overflow: "hidden",
              transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
            }}
          >
            <div ref={nbaBlockRef}>
              <NextBestActionZone items={nextBestActions} />
            </div>
          </div>
        )}

        {/* ── Expandable zones — collapsed by default, predictable header height. */}
        {hasAnyZone && (
          <div
            style={{
              maxHeight: expanded ? 4000 : 0,
              overflow: "hidden",
              transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="pt-[16px] flex flex-col gap-[16px]" style={{ borderTop: "0.5px solid var(--color-border-neutral-lighter)" }}>

              {/* No section heading here (this redesign pass) — the reference
                  design shows Workflow/Agent as plain context cards, no
                  "Agentic System" label above them. */}
              {hasAgenticSystem && agenticSystem && (
                <div
                  ref={agenticSystemZoneRef}
                  className="flex flex-col gap-[8px] rounded-[8px] transition-shadow duration-500"
                  style={{ boxShadow: highlightZone === "agenticSystem" ? "0 0 0 2px var(--primary)" : "0 0 0 0px transparent" }}
                >
                  <AgenticSystemZoneContent state={agenticSystem} />
                </div>
              )}

              {hasIntervention && intervention && (
                <div
                  ref={interventionZoneRef}
                  className="flex flex-col gap-[8px] rounded-[8px] transition-shadow duration-500"
                  style={{ boxShadow: highlightZone === "intervention" ? "0 0 0 2px var(--primary)" : "0 0 0 0px transparent" }}
                >
                  <span className="flex items-center gap-[4px] text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--tag-alert-fg)" }}>
                    <AlertTriangle size={11} strokeWidth={1.75} />
                    {zoneLabels.intervention}
                  </span>
                  <InterventionZoneContent state={intervention} />
                </div>
              )}

              {/* NBA, expanded position — the SAME block as the collapsed
                  one below, just repositioned to the end (this redesign
                  pass). Never duplicated content, never a second copy with
                  different data — see the file header's NBA note. */}
              {hasNBA && <NextBestActionZone items={nextBestActions} />}

            </div>
          </div>
        )}
      </div>
    </CardContainer>
  )
}

// ── Next Best Action block — the protagonist, dark-purple surface ──────────
// A native `<button>`, not the Button component — the whole block is one
// clickable target (icon-in-a-box + 2-line text + chevron), same "raw
// styled element for a custom shape" precedent as the collapsed identity
// tags above, not a shape any Button variant already covers.
//
// Verified against the actual Figma redesign node (v6rmYKA2zmyXWOahlxLOeI,
// 19815:101548) via the Figma MCP — pixel-sampled, not guessed:
//   - Block background #120520 in dark mode is an exact match for
//     --card-purple-bg (the SAME token the "AI Summary" card pattern
//     already uses elsewhere in this file) — corrected from 2 earlier
//     guesses in this same pass (--color-surface-purple-darker, a fully
//     opaque non-adapting hex; then --color-surface-purple-lighter, still
//     too saturated/vibrant next to this card's own neutral bg).
//   - The sparkle sits in its OWN tinted icon box (measured ≈24×24px,
//     composited color matches --hi-purple-bg over the block background)
//     — a real HighlightIcon (variant="purple", size="sm"), not a bare
//     icon floating in the row.
//   - Title and description are NEUTRAL text (--foreground /
//     --field-supporting), same as every other card in this file — color
//     lives ONLY in the icon box + block background, never in the text.
//     Same principle AgenticSystemItem already follows ("color lives in
//     the icon, never in the button").
//   - Trailing chevron is neutral (--field-supporting) too, not purple.
//
// Correction pass — N items use the SAME disclosure pattern as Your
// Intervention (InterventionZoneContent below): the most prioritized item
// always renders full-size, the rest collapse behind "Show N more" /
// "Show less" instead of all stacking open at once (verified against the
// Figma file's own multi-NBA node — the revealed extras render as the SAME
// full NextBestActionBlock, not HTL's compact bordered row, since NBA
// items carry a title+description HTL's single-line items don't). Caps
// at 3 revealed extras like HTL does, for the same reason — if this ever
// needs a "View all" escape hatch beyond that, it isn't built yet (not
// requested), same "flag rather than silently truncate" rule HTL follows.
//
// Button position — BELOW every card, not between the primary and the
// extras. Re-checked against the Figma node's own expanded-state frame
// (its "Show less" sits at the bottom of the whole stack, after all 3
// NBA cards) — an earlier pass had copied HTL's own code layout (button
// row before the revealed extras) instead of re-verifying this specific
// pattern's actual Figma order, which put "Show less" in the middle.
function NextBestActionZone({ items }: { items: NextBestAction[] }) {
  const [showMore, setShowMore] = useState(false)
  if (items.length === 0) return null
  const [primary, ...rest] = items
  const visibleRest = rest.slice(0, 3)
  return (
    <div className="flex flex-col gap-[8px]">
      <NextBestActionBlock nba={primary} />
      {showMore && visibleRest.map(nba => <NextBestActionBlock key={nba.id} nba={nba} />)}
      {visibleRest.length > 0 && (
        <Button variant="tertiary" size="sm" onClick={() => setShowMore(v => !v)} className="self-start">
          {showMore ? "Show less" : `Show ${visibleRest.length} more`}
          {showMore
            ? <ChevronUp size={14} strokeWidth={1.75} className="ml-[2px]" />
            : <ChevronDown size={14} strokeWidth={1.75} className="ml-[2px]" />}
        </Button>
      )}
    </div>
  )
}

function NextBestActionBlock({ nba }: { nba: NextBestAction }) {
  return (
    <button
      type="button"
      onClick={nba.onOpen}
      className="w-full flex items-center gap-[8px] rounded-[8px] p-[12px] text-left transition-opacity hover:opacity-90"
      style={{ background: "var(--card-purple-bg)", border: "0.5px solid var(--card-purple-border)" }}
    >
      <HighlightIcon size="sm" variant="purple" icon={<Sparkle size={16} strokeWidth={1.75} />} className="shrink-0" />
      <div className="flex-1 flex flex-col gap-[2px] min-w-0">
        <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          {nba.title}
        </span>
        <span className="text-[12px] leading-[1.4]" style={{ color: "var(--field-supporting)" }}>
          {nba.description}
        </span>
      </div>
      <ChevronRight size={16} strokeWidth={1.75} className="shrink-0" style={{ color: "var(--field-supporting)" }} />
    </button>
  )
}

// ── Agentic System zone content — ready / empty / loading ──────────────────
// Task 3 (Block 1) — restructured as CardContainer(sm) + HighlightIcon(sm,
// colored) + a NEUTRAL tertiary Button beside it. Color lives in the icon,
// never in the button — this is the whole point of the change.
function AgenticSystemZoneContent({ state }: { state: AgenticSystemInfo }) {
  // Narrow on `state.status` directly (not a copied local) — TS control-flow
  // narrowing for a discriminated union only tracks the actual property
  // access expression, not a variable derived from it.
  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-[8px]">
        <Skeleton height={44} />
        <Skeleton height={44} />
      </div>
    )
  }

  if (state.status === "empty") {
    return (
      <InformativeCard
        state="neutral"
        size="sm"
        icon={<Info className="w-[24px] h-[24px]" />}
        title={state.message ?? RECORD_HEADER_FALLBACKS.agenticSystemEmpty}
      />
    )
  }

  // Correction pass — flex, not a 2-column grid: a grid with sm:grid-cols-2
  // still reserves 2 equal tracks even when only 1 item renders (Employee
  // is workflow-only per Thom's rule: "solo workflows por ahora" — no
  // agent), leaving the second track empty instead of letting the lone
  // item fill the row. flex-1 on each item means 1 item = full width, 2
  // items = even split, with no per-count branching needed.
  return (
    <div className="flex flex-col sm:flex-row gap-[8px]">
      {state.activeWorkflow && (
        <AgenticSystemItem
          icon={<Workflow size={16} strokeWidth={1.75} />}
          iconVariant="light-blue"
          name={state.activeWorkflow.name}
          onOpen={state.activeWorkflow.onOpen}
          tooltip={`Open "${state.activeWorkflow.name}" — steps, timeline, and who's running it`}
          className="flex-1"
        />
      )}
      {state.lastAgent && (
        <AgenticSystemItem
          icon={<Sparkle size={16} strokeWidth={1.75} />}
          iconVariant="lime"
          name={state.lastAgent.name}
          onOpen={state.lastAgent.onOpen}
          tooltip={`Open ${state.lastAgent.name}'s latest session — summary, finding, and recommendation`}
          className="flex-1"
        />
      )}
    </div>
  )
}

function AgenticSystemItem({
  icon,
  iconVariant,
  name,
  onOpen,
  tooltip,
  className,
}: {
  icon: React.ReactNode
  iconVariant: "light-blue" | "lime"
  name: string
  onOpen?: () => void
  tooltip: string
  className?: string
}) {
  return (
    // Task 2 (Block 1, this pass) — a plain card BORDER, not the
    // CardContainer component: this item already lives inside the header's
    // own CardContainer, so nesting a second one reads as card-in-card and
    // wastes padding. Same visual result (border/radius/bg exactly match
    // CardContainer's own "sm" size via its real tokens — nothing
    // hardcoded), just not the component itself. Color still lives only in
    // HighlightIcon; this border is neutral.
    <div
      className={cn("rounded-[8px] border-[0.5px] p-[12px] min-w-0", className)}
      style={{ background: "var(--card-default-bg)", borderColor: "var(--card-default-border)" }}
    >
      <div className="flex items-center gap-[8px]">
        <HighlightIcon size="sm" variant={iconVariant} icon={icon} />
        {/* Overflow — long workflow/agent names truncate with their own
            Tooltip carrying the full name, never a silent cutoff. */}
        <Tooltip content={name} side="cursor" triggerClassName="flex-1 min-w-0 block">
          <span className="block text-[13px] font-medium truncate" style={{ color: "var(--foreground)" }}>
            {name}
          </span>
        </Tooltip>
        {/* Bare chevron, no "View" label (Figma fidelity pass — the
            reference design shows only a chevron here, no text). */}
        <Tooltip content={tooltip} side="cursor">
          <Button
            variant="tertiary"
            size="sm"
            iconPosition="alone"
            icon={<ChevronRight size={14} strokeWidth={1.75} style={{ color: "var(--field-supporting)" }} />}
            aria-label={tooltip}
            onClick={onOpen}
            className="shrink-0"
          />
        </Tooltip>
      </div>
    </div>
  )
}

// ── Your Intervention zone content — all 6 states ───────────────────────────
// Every branch goes through InformativeCard (size="sm") — never a hand-
// rolled container, never state="error" (red). Title case: normal sentence
// case, not literal ALL CAPS (Block 1, task 2).
//
// Block 3 (this pass) — "pending" can carry N items. The most prioritized
// (items[0], host-sorted) renders full-size with its own Review; the rest
// collapse behind a "+N more" disclosure (Button variant="tertiary", the
// same expand/collapse mechanism the card's own outer zones already use —
// no new interaction pattern). Deliberately NOT a carousel: urgent
// decisions must be visible at a glance — how many there are and that they
// exist — not hidden behind a swipe gesture the viewer has to discover.
// Each item, expanded or not, keeps its own individual Review action.
function InterventionZoneContent({ state }: { state: PendingIntervention }) {
  const [showMore, setShowMore] = useState(false)

  // Narrow on `state.status` directly (not a copied local) — same reasoning
  // as AgenticSystemZoneContent above.
  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-[8px]">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="90%" />
      </div>
    )
  }

  if (state.status === "empty") {
    return (
      <InformativeCard
        state="neutral"
        size="sm"
        icon={<CheckCircle2 className="w-[24px] h-[24px]" />}
        title={state.message ?? RECORD_HEADER_FALLBACKS.interventionEmpty}
      />
    )
  }

  if (state.status === "no-permission") {
    return (
      <InformativeCard
        state="alert"
        size="sm"
        title="Review restricted — you don't have permission to approve this"
        description={state.description}
        cta={{ label: "Review", onClick: () => {}, disabled: true }}
        ctaSecondary={state.onEscalate ? { label: "Escalate", onClick: state.onEscalate } : undefined}
      />
    )
  }

  if (state.status === "error") {
    return (
      <InformativeCard
        state="alert"
        size="sm"
        title="Couldn't approve — something went wrong"
        description={state.message}
        cta={state.onRetry ? { label: "Retry", onClick: state.onRetry } : undefined}
      />
    )
  }

  if (state.status === "resolved-elsewhere") {
    return (
      <InformativeCard
        state="neutral"
        size="sm"
        icon={<CheckCircle2 className="w-[24px] h-[24px]" />}
        title={`Already resolved by ${state.resolvedBy} · ${state.resolvedAgo}`}
        description={state.description}
      />
    )
  }

  // "pending" (status omitted or explicitly "pending") — Block 3: N items,
  // most-prioritized first (see InterventionItem's own doc comment on sort
  // expectations). A "pending" status with an empty items array is a
  // caller bug, not a real state — read it as "empty" rather than render a
  // broken/blank alert card.
  if (state.items.length === 0) {
    return (
      <InformativeCard
        state="neutral"
        size="sm"
        icon={<CheckCircle2 className="w-[24px] h-[24px]" />}
        title={RECORD_HEADER_FALLBACKS.interventionEmpty}
      />
    )
  }

  // This redesign pass — every HTL item (primary and extras alike) gets the
  // SAME diagonal-arrow trailing action, never a "Review" label: it opens
  // the real HTL view in a NEW TAB (never redirects/reloads this page — the
  // viewer keeps their place on this record), with a Tooltip saying so.
  // "Show N more" caps at 3 extras inline (never all of them at once — see
  // OPEN_HTL_TOOLTIP below); "View all" is the separate, always-available
  // escape hatch to the full list, also a new tab.
  const [primary, ...rest] = state.items
  const visibleRest = rest.slice(0, 3)
  return (
    <div className="flex flex-col gap-[8px]">
      <InformativeCard
        state="alert"
        size="sm"
        title={`${state.items.length} ${state.items.length === 1 ? "action" : "actions"} awaiting review`}
        description={primary.description}
        trailingIcon={{ icon: <ArrowUpRight size={16} strokeWidth={1.75} />, onClick: primary.onReview, "aria-label": "Open in a new tab", tooltip: OPEN_HTL_TOOLTIP }}
      />
      {/* Figma fidelity pass — "Show N more" and "View all" sit at OPPOSITE
          ends of the row (justify-between), not stacked together. "View
          all" is a plain text tertiary Button, no icon — the new-tab
          behavior is real on click, it just isn't signaled visually here
          the way the per-item arrows signal it (verified against the
          actual Figma node: "View all" renders as bare text). */}
      {rest.length > 0 && (
        <div className="flex items-center justify-between">
          <Button variant="tertiary" size="sm" onClick={() => setShowMore(v => !v)} className="self-start">
            {showMore ? "Show less" : `Show ${visibleRest.length} more`}
            {showMore
              ? <ChevronUp size={14} strokeWidth={1.75} className="ml-[2px]" />
              : <ChevronDown size={14} strokeWidth={1.75} className="ml-[2px]" />}
          </Button>
          {state.onViewAll && (
            <Tooltip content={OPEN_HTL_TOOLTIP} side="cursor">
              <Button variant="tertiary" size="sm" onClick={state.onViewAll} className="self-start">
                View all
              </Button>
            </Tooltip>
          )}
        </div>
      )}
      {/* Figma fidelity pass — the 3 extra items shown here render as the
          SAME bordered "Action Card" row AgenticSystemItem already uses
          (border + --card-default-bg), not a compact severity-tag row —
          the actual Figma node shows plain description text + arrow, no
          visible severity badge. Severity stays reachable via Tooltip so
          it isn't lost, just not rendered as a visible chip here. */}
      {showMore && visibleRest.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {visibleRest.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-[8px] p-[12px] rounded-[8px] min-w-0"
              style={{ background: "var(--card-default-bg)", border: "0.5px solid var(--card-default-border)" }}
            >
              <Tooltip content={`${item.severity.toUpperCase()} — ${item.description}`} side="cursor" triggerClassName="flex-1 min-w-0 block">
                <span className="block truncate text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                  {item.description}
                </span>
              </Tooltip>
              <Tooltip content={OPEN_HTL_TOOLTIP} side="cursor">
                <Button
                  variant="tertiary"
                  size="sm"
                  iconPosition="alone"
                  icon={<ArrowUpRight size={14} strokeWidth={1.75} />}
                  aria-label="Open in a new tab"
                  onClick={item.onReview}
                  className="shrink-0"
                />
              </Tooltip>
            </div>
          ))}
        </div>
      )}
      {/* Items beyond the 3-extra cap are deliberately not rendered here —
          "View all" above is the only way to reach them. DECISION FLAGGED —
          hypothesis, not explicitly confirmed: if a host has >4 items total
          and passes no onViewAll, there's currently no way to reach the
          rest at all. // TODO: confirmar con Michael — ¿debería onViewAll
          ser obligatorio cuando items.length > 4? */}
    </div>
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
      {disabled && disabledTooltip ? <Tooltip content={disabledTooltip} side="cursor">{trigger}</Tooltip> : trigger}
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

export { RecordHeader }
export type { LucideIcon }
