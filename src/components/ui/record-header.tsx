import { useState, useRef, useLayoutEffect } from "react"
import {
  ChevronDown, ChevronUp, ChevronRight, Sparkle, MoreHorizontal, Lock, Info, Workflow, Bot,
  AlertTriangle, User, Building2, Truck,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Badge, type BadgeVariant } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem } from "@/components/ui/menu-item"
import { Tooltip } from "@/components/ui/tooltip"
import { InformativeCard } from "@/components/ui/informative-card"

/**
 * Record Header — AIMS OS Design System
 *
 * NOT YET IN FIGMA — this is a new component, not synced from an existing node.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MAJOR RESTRUCTURE (this revision): this file previously modeled a generic
 * Employee/Customer/Client entity header with a Next Best Action Signal bar
 * and a variable secondary-actions list (Email/Phone/Manager-link/Add note/
 * Create task/etc.). That version is GONE, replaced end to end by the
 * governed card product defined for AIMS OS Work Surfaces:
 *   - Variants renamed: employee/customer/client → uep/ucp/uvp (Universal
 *     Employee/Customer/Vendor Profile) — this component now lives ONLY in
 *     Work Surfaces, never replicated inside Governance/Data/Agentic Studio.
 *   - Signal/NextBestAction (severity color, actionLabel, loading/error
 *     states, aiGenerated purple treatment) is RETIRED. DECISION FLAGGED —
 *     inferred, not explicitly stated in the brief: the brief's card
 *     skeleton is Identity + 3 expandable zones, full stop, with no Signal
 *     row anywhere in it. Its "at a glance, is something up" role splits in
 *     two: a minimal `statusDot` next to the name (Identity row, always
 *     visible, color-only) for the glance, and "Your Intervention" (a real,
 *     expandable, HTL-specific detail zone) for the substance — matching
 *     Law 3 (HTL states are calm and explanatory, never red errors) far
 *     better than a colored Signal bar ever could. If this reads wrong,
 *     Signal's old code is fully recoverable from git history before this
 *     commit — flagging the call, not silently deleting without a trace.
 *   - The variable secondary-actions disclosure (contact/navigation/
 *     creation Buttons) is also RETIRED — replaced by exactly 2 fixed,
 *     always-the-same-shape expandable zones: AGENTIC SYSTEM (Active
 *     Workflow, Last Agent) and RECORD (governed field grid with
 *     provenance). Neither is a "pick whichever actions apply" list
 *     anymore; both are fixed slots every variant fills the same way.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Governance canon (AIMS OS law, not preference — see the Reference tab's
 * own "Governance canon" section for the full, reader-facing version):
 *   Law 1 — Authority/origin of every field is ALWAYS visible. Every RECORD
 *     field carries a FieldProvenance and renders its origin-system badge
 *     inline — never a value floating with no traceable source.
 *   Law 2 — Every governed answer carries provenance reachable WITHOUT
 *     leaving the view. The (i) icon next to the RECORD heading opens the
 *     Data Provenance SlideOut from right here — no navigating away first.
 *   Law 3 — HTL (human-in-the-loop) items are first-class states with their
 *     own calm, explanatory language — NEVER rendered as red errors. "Your
 *     Intervention" uses the same informative/neutral token family as this
 *     repo's Alert Banner, deliberately never the error/red one, regardless
 *     of the underlying severity value.
 *   Law 4 — PII resolves only at display-time, per viewer entitlements. A
 *     hydrated (real) field and a masked field are the SAME RecordField in
 *     2 states — see RecordField's own doc comment. This component renders
 *     whichever state it's given; it never resolves entitlements itself.
 *
 * Structure — Identity (fixed) + 3 expandable zones, one shared skeleton for
 * all 3 variants (uep/ucp/uvp) — only the zone CONTENT changes per variant,
 * never the skeleton:
 *   Identity (always visible) → avatar, name + statusDot, type label, up to
 *     3 read-only Tags (hidden once expanded — see REFINEMENT below), Locked
 *     state. Actions: AI agent trigger ("Ask about {firstName}", persistent)
 *     → 1 contact CTA (Message) → "···" overflow → disclosure chevron.
 *   AGENTIC SYSTEM (expanded) → Active Workflow + Last Agent, each a Button
 *     variant="tertiary" with a leading icon (Workflow/Bot), a Tooltip
 *     explaining what opens, and a trailing ChevronRight — never a colored
 *     card. Opens a SlideOut per item.
 *   YOUR INTERVENTION (expanded, only if `intervention` is set) → the HTL
 *     pending-decision block, rendered with InformativeCard (state="alert")
 *     — the DS's own canonical "first-class calm state" primitive, not a
 *     hand-rolled container. Never state="error" (red), regardless of
 *     `intervention.severity`. Opens the "Pending Decisions" SlideOut via
 *     its Review button.
 *   RECORD (expanded) → each field is its OWN Button variant="tertiary" row
 *     (leading field icon + label/value + origin badge + trailing
 *     ChevronRight — Law 1 + the same "opens detail" convention as Agentic
 *     System above), opening the Data Provenance SlideOut. The (i) icon
 *     next to the "RECORD" heading (Law 2 — findable, not floating
 *     unlabeled at the row's far edge) opens the identical panel — a second
 *     entry point to the same content, not a different one.
 *
 * REFINEMENT (this revision) — 7 scoped changes on top of the governed-card
 * structure above, none of which touch the 3-zone skeleton or the variants:
 *   1. Identity tags hide once expanded (animated, not an abrupt height
 *      jump) — the facts they summarize reappear in full detail below, so
 *      showing both is pure redundancy.
 *   2. AI agent trigger: icon-only → "Ask about {firstName}" (falls back to
 *      "Ask AI" + Tooltip on a narrow card or a long name) — the button now
 *      communicates WHO it's scoped to, not just "there is an assistant."
 *      Opens a SidePanel (originally a SlideOut — see REFINEMENT 2 below)
 *      with a CHAT PLACEHOLDER — no Chat component exists in this repo yet
 *      (it's coming from Figma later); see the // TODO in App.tsx's demo
 *      wiring. Don't build a real chat component here.
 *   3. Your Intervention → InformativeCard (was a hand-rolled div).
 *   4. Every SlideOut this card opens follows the "SlideOut/SidePanel —
 *      Content" pattern page's conventions (Section Titles, and severity
 *      Tags render compact/inline — never stretched full-width) — enforced
 *      in App.tsx's demo wiring, since RecordHeader itself doesn't render
 *      the SlideOuts (see Composition below).
 *   5. Every RECORD field now carries a leading icon (RecordField.icon).
 *   6. Agentic System buttons get a Tooltip explaining what opens on click.
 *   7. One convention for "this opens a detail panel": Button variant=
 *      "tertiary" + trailing ChevronRight — applied identically to Active
 *      Workflow, Last Agent, and every RECORD field row. Learn the chevron
 *      once, recognize it everywhere.
 *
 * REFINEMENT 2 (this revision) — 10 more scoped changes, still none of which
 * touch the 3-zone skeleton or the variants:
 *   1. Identity tags recast as governance-state indicators — assigned agent
 *      (purple), active workflow (light blue), pending HTL (amber) — instead
 *      of plain identity facts (role/department/location, now unused for
 *      this purpose — see the NOTE above getRecordFields). Each tag's color
 *      + icon carries down into its own zone below (Agentic System buttons
 *      recolored to match; Your Intervention's heading recolored amber) —
 *      the collapsed summary and the expanded detail now visibly correlate.
 *   2. "Ask about {name}" opens a SidePanel, not a SlideOut (App.tsx's demo
 *      wiring only — RecordHeader never renders it either way) — so the
 *      user can keep the rest of the page visible while chatting.
 *   3. Identity block centers vertically against the avatar once expanded
 *      (items-center) instead of top-aligning (items-start, still used
 *      while collapsed, where the tags row makes it a 2-line block).
 *   4. Contact type → icon + Tooltip (User/Building2/Truck per variant),
 *      replacing the plain text badge — "icons that communicate," same
 *      direction as the rest of this card.
 *   5. RecordField.hasDestination — a plain descriptive fact (Start Date,
 *      Job Title) renders as static text, NOT a Button, no chevron; only a
 *      field with somewhere real to go stays clickable. See its own doc
 *      comment for the reasoning and RecordField's own field docs.
 *   6. Every Tooltip in this file is side="cursor" — the only Tooltip mode
 *      that actually flips off a viewport edge instead of clipping (see
 *      tooltip.tsx's own header comment).
 *   7–10. SlideOut header actions (no generic edit pencil), richer SlideOut
 *      content (AI Summary, list sections), compact severity Tags, and the
 *      governed-decision confirmation step are ALL in App.tsx's demo wiring
 *      — RecordHeader itself doesn't render any of that (see Composition).
 *
 * Composition — reuses existing DS atoms, no custom re-implementations:
 *   Card       → CardContainer (size="default", variant="default").
 *   Avatar     → AvatarCircle sizeKey="lg".
 *   Status dot → Badge (badge.tsx) — the repo's real filled-dot status
 *                primitive, not a new one. success/alert/neutral variants.
 *   Identity metadata → Tag (size="sm"), NOT Chip — same reasoning as every
 *                prior revision of this file: Chip is the interactive
 *                filter-row control, Tag is the read-only display atom.
 *   AI agent trigger → Button icon+label, `Sparkle` glyph, variant="main" —
 *                the same named, single-purpose exception to the "never
 *                main in a card" rule this file has documented since it was
 *                first confirmed with Michael. Still the only sanctioned
 *                case — don't extend it here either.
 *   Overflow   → Menu/MenuItem (menu-item.tsx), anchored via captured
 *                getBoundingClientRect() on trigger click — this file's
 *                established positioning technique, unchanged.
 *   Disclosure → local expanded state + max-height transition — unchanged
 *                technique from every prior revision of this file, now also
 *                reused for the identity-tags hide-on-expand transition.
 *   Agentic System items / RECORD field rows → Button variant="tertiary",
 *                leading icon, trailing ChevronRight. Never a colored card
 *                for metadata, per explicit instruction.
 *   Your Intervention → InformativeCard (informative-card.tsx), state=
 *                "alert" — its real amber/warning semantic, never "error".
 *   Field origin badge → Tag (size="sm"), wrapped in Tooltip showing the
 *                fuller provenance (system + model version + synced-ago).
 *   Governed SlideOuts (Workflow detail, Pending Decisions, Agent detail,
 *                Data Provenance) + the agent chat SidePanel → RecordHeader
 *                itself never renders any of them — same delegation rule this
 *                file has followed since `assignedAgent.onOpenChat` first
 *                existed: every clickable surface exposes an
 *                `onOpen`/`onAction` callback, and the consuming screen
 *                (App.tsx's RecordHeaderPage demo) owns the actual
 *                SlideOut/SidePanel instance, composed per the "SlideOut/
 *                SidePanel — Content" pattern page. This keeps the DS
 *                component free of page-level overlay state and matches
 *                "reuse the existing SlideOut/SidePanel primitive"
 *                literally — RecordHeader doesn't reimplement it internally.
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
   * descriptive fact with nothing further to show (e.g. Start Date, a pure
   * date; ARR, a pure figure) — that field renders as static text, NO
   * chevron, NOT a Button — only its provenance badge stays hoverable
   * (Tooltip on the badge itself), per the interaction-logic rule: only
   * elements with a real destination look clickable.
   */
  hasDestination?: boolean
}

// ── Agentic System (Zone: AGENTIC SYSTEM) ───────────────────────────────────
// Exactly 2 fixed slots, not a variable list — every variant fills both the
// same way. Each opens its own SlideOut; RecordHeader only holds the trigger.
export interface AgenticSystemInfo {
  activeWorkflow?: {
    name: string
    onOpen?: () => void
  }
  lastAgent?: {
    name: string
    onOpen?: () => void
  }
}

// ── Your Intervention (Zone: YOUR INTERVENTION, conditional) ───────────────
// A first-class HTL state (Law 3) — only rendered when there's a real
// pending decision; omitted entirely otherwise (never an empty "0 actions"
// placeholder). `severity` feeds the Pending Decisions SlideOut's own
// display — it does NOT change this block's calm/informative visual
// treatment on the card itself, which stays constant regardless of
// severity (that constancy IS Law 3, not an oversight).
export interface PendingIntervention {
  count: number
  description: string
  severity: "high" | "medium" | "low"
  onReview: () => void
}

// ── Assigned AI agent (transversal across variants) ─────────────────────────
// AIMS OS is agent-first: every Employee/Customer/Vendor record has one.
// NOTE TO VERIFY: this shape (id/name/onOpenChat) is a reasonable guess based
// on how every other callback in this file delegates behavior to the caller.
// If AIMS OS already models "assigned agent" elsewhere with a different
// shape, map to THAT shape instead — flagging instead of assuming.
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
}

// ── Status dot (Identity row) ───────────────────────────────────────────────
// DECISION FLAGGED — inferred detail, not explicitly spec'd: a minimal,
// glanceable "is something up with this record" indicator, replacing the
// old always-visible Signal bar (see file header HISTORY note). Maps
// directly onto Badge's own existing variants — no new color semantics.
export type RecordStatusDot = "attention" | "success" | "neutral"

const STATUS_DOT_VARIANT: Record<RecordStatusDot, BadgeVariant> = {
  attention: "alert",
  success: "success",
  neutral: "neutral",
}

// ── Per-variant record data ─────────────────────────────────────────────────
// Only the Primary-slot field (name/accountName) is required — every other
// field is genuinely optional in real data. getRecordFields coalesces a
// missing field to "" and the render layer drops it — same missing-data
// rule this file has used since it was first introduced.

export interface UEPRecord {
  name: string
  role?: string
  department?: string
  location?: string
  manager?: RecordField
  accessRole?: RecordField
  /** Governed/sourced counterpart to the plain `department` chip above —
   *  deliberately kept as a separate field rather than reused, since the
   *  chip is an informal glance-level label with no provenance, while this
   *  is the same fact backed by a real source system. */
  departmentDetail?: RecordField
  jobTitle?: RecordField
  startDate?: RecordField
}

export interface UCPRecord {
  accountName: string
  segment?: string
  tier?: string
  accountType?: string
  owner?: RecordField
  renewalDate?: RecordField
  arr?: RecordField
}

export interface UVPRecord {
  name: string
  vendorType?: string
  contractStatus?: string
  category?: string
  procurementOwner?: RecordField
  contractEndDate?: RecordField
  spendYtd?: RecordField
}

export type RecordHeaderVariant = "uep" | "ucp" | "uvp"

export interface RecordHeaderProps {
  variant: RecordHeaderVariant
  data: UEPRecord | UCPRecord | UVPRecord
  /** Minimal glanceable indicator next to the name — see RecordStatusDot's own doc comment for why this replaces the old Signal bar. */
  statusDot?: RecordStatusDot
  /**
   * Required as a PROP (every caller must decide), but the value itself can
   * be `null` for a record that genuinely has no assigned agent yet. `null`
   * renders the same button, disabled, with a Tooltip explaining why —
   * never a silently missing button and never a broken one.
   */
  assignedAgent: AssignedAgent | null
  /** actions[0] = the one contact CTA (Message); actions[1+] = overflow menu items. */
  actions?: RecordAction[]
  /** Zone: AGENTIC SYSTEM. Omit the whole prop (or leave both slots unset) to skip the zone entirely — see hasAgenticSystem below. */
  agenticSystem?: AgenticSystemInfo
  /** Zone: YOUR INTERVENTION — only rendered when set. */
  intervention?: PendingIntervention
  /** Opens the Data Provenance SlideOut for the whole RECORD zone (Law 2). */
  onProvenanceOpen?: () => void
  /** Uncontrolled initial state for the zones disclosure. Default: false (collapsed) — predictable header height. */
  defaultExpanded?: boolean
  /**
   * True → this record is read-only right now. The contact CTA and the
   * overflow's write actions disable (with a Tooltip explaining why) — but
   * the AI agent trigger stays fully interactive, since consulting a
   * record isn't the same permission as editing it.
   */
  locked?: boolean
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
}

// ── Per-variant content mapping ─────────────────────────────────────────────
// This is the ONLY place variant-specific logic lives. Everything below this
// function renders the exact same JSX regardless of which variant was
// passed — per the "one shared skeleton, only slot content changes" rule.

type RecordFields = {
  name: string
  typeLabel: string
  /** Icon standing in for typeLabel in the Identity row (this refinement —
   *  iconography instead of a text badge, see the file's own doc comment). */
  typeIcon: LucideIcon
  /** Zone: RECORD. Each already carries provenance (Law 1) and a masking
   *  state (Law 4) — see RecordField's own doc comment. */
  recordFields: RecordField[]
}

// NOTE — role/department/location (UEP), tier/segment/accountType (UCP), and
// vendorType/contractStatus/category (UVP) on the *Record data types below
// are intentionally NOT read here anymore. This refinement replaces the old
// identity-row Tags (those plain identity facts) with 3 GOVERNANCE-STATE
// tags — assigned agent / active workflow / pending HTL — computed straight
// from props inside the component body (they need assignedAgent/
// agenticSystem/intervention, not just `data`). The fields themselves stay
// on the interfaces (harmless, may still serve other consumers later); nothing
// in this file reads them for rendering purposes anymore.

function getRecordFields(variant: RecordHeaderVariant, data: RecordHeaderProps["data"]): RecordFields {
  if (variant === "uep") {
    const d = data as UEPRecord
    return {
      name: d.name,
      typeLabel: "Employee",
      typeIcon: User,
      // DECISION FLAGGED — `departmentDetail` was defined on UEPRecord and
      // documented in the Reference tab's RECORD row ("Manager/Access Role/
      // Department/Job Title/Start Date") but was missing from this array,
      // so it never actually rendered. Fixed while touching this function
      // for the destination/no-destination split below — not a scope
      // change, a pre-existing gap between the type and its own doc.
      recordFields: [d.manager, d.accessRole, d.departmentDetail, d.jobTitle, d.startDate].filter((f): f is RecordField => Boolean(f)),
    }
  }
  if (variant === "ucp") {
    const d = data as UCPRecord
    return {
      name: d.accountName,
      typeLabel: "Customer account",
      typeIcon: Building2,
      recordFields: [d.owner, d.renewalDate, d.arr].filter((f): f is RecordField => Boolean(f)),
    }
  }
  const d = data as UVPRecord
  return {
    name: d.name,
    typeLabel: "Vendor",
    // DECISION FLAGGED — Truck reads well for THIS demo's vendor (a logistics
    // company), but "Vendor" as a type isn't always logistics. No DS icon
    // spec exists yet for vendor-type iconography; flagging the pick rather
    // than guessing something more "generic" with no real basis either.
    typeIcon: Truck,
    recordFields: [d.procurementOwner, d.contractEndDate, d.spendYtd].filter((f): f is RecordField => Boolean(f)),
  }
}

// ── Recommended actions per variant ─────────────────────────────────────────
// The single source of truth for "which CTA goes on this card" — one
// contact action (Message) across all 3 variants, per explicit instruction.
// No overflow items specified for any variant — left empty rather than
// inventing content not asked for.
export const RECORD_HEADER_RECOMMENDED_ACTIONS: Record<RecordHeaderVariant, RecordAction[]> = {
  uep: [{ label: "Message" }],
  ucp: [{ label: "Message" }],
  uvp: [{ label: "Message" }],
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

// ── Component ────────────────────────────────────────────────────────────────

function RecordHeader({
  variant,
  data,
  statusDot,
  assignedAgent,
  actions = [],
  agenticSystem,
  intervention,
  onProvenanceOpen,
  defaultExpanded = false,
  locked = false,
  className,
}: RecordHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const fields = getRecordFields(variant, data)
  const TypeIcon = fields.typeIcon
  const [primaryAction, ...overflowActions] = actions

  const hasAgenticSystem = Boolean(agenticSystem?.activeWorkflow || agenticSystem?.lastAgent)
  const hasRecordFields = fields.recordFields.length > 0
  const hasAnyZone = hasAgenticSystem || Boolean(intervention) || hasRecordFields

  // Avatar fallback: only a genuinely blank name gets the DS's own "empty"
  // glyph (avatar.tsx's existing avatarStyle="empty") instead of initials —
  // a single-character name already renders fine as one initial.
  const hasName = Boolean(fields.name && fields.name.trim())

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

  // AI Assistant CTA — "Ask about {firstName}" communicates this chat is
  // scoped to THIS record, not a generic assistant entry point. Falls back
  // to "Ask AI" (+ Tooltip carrying the same context) when the card is
  // narrow OR the first name itself is long enough to risk breaking the
  // action row — either condition alone is enough to trigger the fallback.
  const assistantFirstName = fields.name.trim().split(/\s+/)[0] ?? ""
  const assistantUseFallback = assistantShortened || assistantFirstName.length > ASSISTANT_LABEL_MAX_NAME_LENGTH
  const assistantLabel = assistantUseFallback ? "Ask AI" : `Ask about ${assistantFirstName}`
  const assistantTooltip = `Pregúntale al asistente con contexto de ${fields.name}`

  return (
    <CardContainer size="default" variant="default" className={cn("w-full", className)}>
      <div ref={rootRef} className="flex flex-col gap-[16px]">

        {/* ── Identity row (always visible, fixed) — avatar + name + statusDot +
            type icon + up to 3 governance-state Tags + action row. Cross-axis
            alignment is conditional: items-start while collapsed (the tags
            row underneath makes this a 2-line block), items-center once
            expanded (name row is the only line left, so it should sit
            centered against the avatar, not pinned to its top edge). */}
        <div className={cn("flex gap-[12px] flex-wrap", expanded ? "items-center" : "items-start")}>
          <AvatarCircle name={fields.name || fields.typeLabel} sizeKey="lg" avatarStyle={hasName ? "text" : "empty"} />

          <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
            <div className="flex items-center gap-[8px] flex-wrap">
              <span className="text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-title)" }}>
                {fields.name}
              </span>
              {/* Status dot — see RecordStatusDot's own doc comment. Badge's
                  own aria label carries the meaning for screen readers. */}
              {statusDot && <Badge variant={STATUS_DOT_VARIANT[statusDot]} label={`Status: ${statusDot}`} />}
              {/* Contact type — icon + Tooltip instead of a text badge, same
                  "icons that communicate" direction as the rest of this
                  card. Tooltip carries the full type name for anyone who
                  needs it spelled out (a11y, first-time users). */}
              <Tooltip content={fields.typeLabel} side="cursor">
                <TypeIcon size={14} strokeWidth={1.75} aria-label={fields.typeLabel} style={{ color: "var(--field-supporting)" }} />
              </Tooltip>
              {locked && (
                <Tag variant="secondary" size="sm" leadingIcon={<Lock size={12} strokeWidth={1.75} />}>
                  {RECORD_HEADER_FALLBACKS.lockedTagLabel}
                </Tag>
              )}
            </div>

            {/* Identity tags hide once the card expands: the same facts they
                summarize reappear in full detail in the zones below, so
                keeping both visible is pure redundancy. max-height
                transition (not a hard unmount) so the collapse is animated,
                not an abrupt height jump.
                Tag CONTENT — governance-state indicators, not plain identity
                facts: assigned agent (purple, matches Last Agent below),
                active workflow (light blue, matches Active Workflow below),
                pending HTL (amber, matches Your Intervention below). Color +
                icon continuity is the whole point — glance at the collapsed
                summary, then recognize the same color when you expand into
                its detail. At most 3, and each only renders when that data
                actually exists (no empty placeholder tags). */}
            <div
              style={{
                maxHeight: expanded ? 0 : 40,
                opacity: expanded ? 0 : 1,
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
              }}
            >
              {!tagsHidden && (assignedAgent || agenticSystem?.activeWorkflow || intervention) && (
                <div className="flex items-center gap-[6px] flex-wrap">
                  {assignedAgent && (
                    <Tooltip content={`Assigned agent: ${assignedAgent.name}`} side="cursor">
                      <Tag variant="purple" size="sm" leadingIcon={<Bot size={12} strokeWidth={1.75} />}>
                        {assignedAgent.name}
                      </Tag>
                    </Tooltip>
                  )}
                  {agenticSystem?.activeWorkflow && (
                    <Tooltip content={`Active workflow: ${agenticSystem.activeWorkflow.name}`} side="cursor">
                      <Tag variant="lightBlue" size="sm" leadingIcon={<Workflow size={12} strokeWidth={1.75} />}>
                        {agenticSystem.activeWorkflow.name}
                      </Tag>
                    </Tooltip>
                  )}
                  {intervention && (
                    <Tooltip content={intervention.description} side="cursor">
                      <Tag variant="alert" size="sm" leadingIcon={<AlertTriangle size={12} strokeWidth={1.75} />}>
                        {intervention.count} pending
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[6px] shrink-0 flex-wrap justify-end">
            {/* variant="main" — deliberate, named exception, see file header.
                Task 2 — icon+label, not icon-only: "Ask about {firstName}"
                names WHO the assistant is scoped to, so the button itself
                communicates context instead of relying on a generic sparkle.
                Falls back to "Ask AI" + Tooltip (still carrying the full
                name) when the card is narrow or the name is long — see
                assistantUseFallback above. */}
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

            {primaryAction && (
              locked ? (
                <Tooltip content={RECORD_HEADER_FALLBACKS.lockedActionTooltip} side="cursor">
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

        {/* ── Expandable zones — collapsed by default, predictable header height. */}
        {hasAnyZone && (
          <div
            style={{
              maxHeight: expanded ? 2000 : 0,
              overflow: "hidden",
              transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="pt-[16px] flex flex-col gap-[16px]" style={{ borderTop: "0.5px solid var(--color-border-neutral-lighter)" }}>

              {hasAgenticSystem && (
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                    Agentic System
                  </span>
                  {/* Tooltip explains what opens on click (side="cursor" so it
                      flips instead of clipping near a viewport edge). Same
                      "opens detail" convention as the RECORD rows below:
                      Button tertiary + trailing ChevronRight — one visual
                      language for "this has a detail panel," not two.
                      Icon + text recolored to match the identity Tag that
                      summarizes this same data above (light blue = workflow,
                      purple = agent) — that color continuity is the point:
                      recognize the collapsed tag's color again in its own
                      expanded detail. Button's own `color` (set inline,
                      beats the tertiary variant's default token class) is
                      inherited by the icon too since neither sets its own
                      color — one style prop tints both. */}
                  <div className="flex flex-wrap items-center gap-[8px]">
                    {agenticSystem?.activeWorkflow && (
                      <Tooltip content={`Open "${agenticSystem.activeWorkflow.name}" — steps, timeline, and who's running it`} side="cursor">
                        <Button
                          variant="tertiary"
                          size="sm"
                          icon={<Workflow size={14} strokeWidth={1.75} />}
                          onClick={agenticSystem.activeWorkflow.onOpen}
                          style={{ color: "var(--tag-lightblue-fg)" }}
                        >
                          {agenticSystem.activeWorkflow.name}
                          <ChevronRight size={14} strokeWidth={1.75} className="ml-[2px]" style={{ color: "var(--field-supporting)" }} />
                        </Button>
                      </Tooltip>
                    )}
                    {agenticSystem?.lastAgent && (
                      <Tooltip content={`Open ${agenticSystem.lastAgent.name}'s latest session — summary, finding, and recommendation`} side="cursor">
                        <Button
                          variant="tertiary"
                          size="sm"
                          icon={<Bot size={14} strokeWidth={1.75} />}
                          onClick={agenticSystem.lastAgent.onOpen}
                          style={{ color: "var(--tag-purple-fg)" }}
                        >
                          {agenticSystem.lastAgent.name}
                          <ChevronRight size={14} strokeWidth={1.75} className="ml-[2px]" style={{ color: "var(--field-supporting)" }} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}

              {intervention && (
                <div className="flex flex-col gap-[8px]">
                  {/* Heading recolored + iconed to match the amber HTL tag
                      above — InformativeCard's own state="alert" is already
                      amber, so this just extends the same color up into the
                      zone label for full top-to-bottom continuity. */}
                  <span className="flex items-center gap-[4px] text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--tag-alert-fg)" }}>
                    <AlertTriangle size={11} strokeWidth={1.75} />
                    Your Intervention
                  </span>
                  {/* Task 3 — the DS's own InformativeCard, not a hand-rolled
                      container. state="alert" is InformativeCard's amber/
                      warning semantic (Surface/Warning/Subtle + Icon/Alert/
                      Default) — never state="error" (red). That's Law 3
                      enforced by using the component correctly, not by
                      copying its look: HTL items are a first-class calm
                      state, not an error, regardless of intervention.severity
                      (which only feeds the Pending Decisions SlideOut, not
                      this card's own treatment — see PendingIntervention's
                      own doc comment). */}
                  <InformativeCard
                    state="alert"
                    size="sm"
                    title={`${intervention.count} ${intervention.count === 1 ? "ACTION" : "ACTIONS"} AWAITING REVIEW`}
                    description={intervention.description}
                    cta={{ label: "Review", onClick: intervention.onReview }}
                  />
                </div>
              )}

              {hasRecordFields && (
                <div className="flex flex-col gap-[8px]">
                  {/* Law 2 — the (i) provenance icon sits directly next to the
                      RECORD label, not floating unlabeled at the row's far
                      edge, so it's actually findable. */}
                  <div className="flex items-center gap-[4px]">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                      Record
                    </span>
                    {onProvenanceOpen && (
                      <Tooltip content="Data provenance for every field below" side="cursor">
                        <button
                          type="button"
                          aria-label="View data provenance"
                          onClick={onProvenanceOpen}
                          className="flex items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none"
                          style={{ color: "var(--field-supporting)" }}
                        >
                          <Info size={12} strokeWidth={1.75} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-[8px] gap-y-[4px]">
                    {fields.recordFields.map((f, i) => {
                      const FieldIcon = f.icon
                      const valueText = f.state === "masked" ? (f.maskedValue ?? "•••• (restricted)") : f.value
                      const provenanceText = `${f.provenance.system} · ${f.provenance.modelVersion} · Synced ${f.provenance.syncedAgo}`
                      const badge = (
                        <Tag variant="secondary" size="sm" className="shrink-0">{f.provenance.systemAbbr}</Tag>
                      )
                      const valueSpan = (
                        <span
                          className="text-[13px] leading-[1.4] truncate max-w-full"
                          style={{ color: f.state === "masked" ? "var(--field-supporting)" : "var(--foreground)", fontStyle: f.state === "masked" ? "italic" : undefined }}
                        >
                          {valueText}
                        </span>
                      )

                      // Destination split (this refinement) — only a field
                      // with somewhere to go (hasDestination !== false) is a
                      // clickable Button + chevron; a plain descriptive fact
                      // (Start Date, a pure date; ARR, a pure figure — see
                      // RecordField.hasDestination's own doc comment) renders
                      // as static text. Its origin badge still gets a Tooltip
                      // (Law 1 never turns off), and — since the value itself
                      // can still truncate — the value gets its own Tooltip
                      // too, wrapping each element that actually needs it,
                      // never a "never cut without an escape" dead end.
                      if (f.hasDestination === false) {
                        return (
                          <div key={i} className="flex items-start gap-[8px] px-[8px] py-[8px]">
                            <FieldIcon size={14} strokeWidth={1.75} className="shrink-0 mt-[2px]" style={{ color: "var(--field-supporting)" }} />
                            <div className="flex flex-col items-start gap-[2px] flex-1 min-w-0 text-left">
                              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                                {f.label}
                              </span>
                              <Tooltip content={valueText} side="cursor" triggerClassName="block min-w-0 w-full">
                                {valueSpan}
                              </Tooltip>
                            </div>
                            <Tooltip content={provenanceText} side="cursor">
                              {badge}
                            </Tooltip>
                          </div>
                        )
                      }

                      // Task 5 — a leading icon per field, for scanability
                      // AND to reinforce Law 1 alongside the badge. Task 7 —
                      // the whole row is one Button tertiary + trailing
                      // ChevronRight (same "opens detail" convention as
                      // Agentic System above), opening the same Data
                      // Provenance panel the (i) icon opens — this is a
                      // second entry point to the identical content, not a
                      // different one, so there's nothing to keep in sync.
                      // Tooltip carries the full value (item 9 — truncated
                      // values must never dead-end) alongside provenance,
                      // since a clickable row only gets the one Tooltip.
                      return (
                        <Tooltip key={i} content={`${valueText} — ${provenanceText}`} side="cursor">
                          <Button
                            variant="tertiary"
                            onClick={onProvenanceOpen}
                            className="h-auto w-full justify-start px-[8px] py-[8px]"
                          >
                            <FieldIcon size={14} strokeWidth={1.75} className="shrink-0 mt-[2px]" style={{ color: "var(--field-supporting)" }} />
                            <div className="flex flex-col items-start gap-[2px] flex-1 min-w-0 text-left">
                              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--field-supporting)" }}>
                                {f.label}
                              </span>
                              {valueSpan}
                            </div>
                            {/* Field origin badge — Law 1, always renders regardless
                                of masking state (provenance ≠ the value itself). */}
                            {badge}
                            <ChevronRight size={14} strokeWidth={1.75} className="shrink-0" style={{ color: "var(--field-supporting)" }} />
                          </Button>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
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
