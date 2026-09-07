import { useState, useRef } from "react"
import { Sparkle, MoreHorizontal, Lock, Info, Database, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { Menu, MenuItem } from "@/components/ui/menu-item"
import { Tooltip } from "@/components/ui/tooltip"
import { HighlightIcon, type HighlightIconVariant } from "@/components/ui/highlight-icon"

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
 *   5. `EntityHeaderZoneLabels` lost `agenticSystem` (no heading left to
 *      translate) on top of `record` (already gone from the prior pass).
 *      Closing pass, later still: `intervention` — its last remaining
 *      entry — also lost its heading, so the whole `labels` prop/type is
 *      now gone; there was nothing left for a host to translate.
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
 *   - The 2 remaining signal colors (light blue = workflow, amber =
 *     intervention/HTL) encode SIGNAL TYPE, never a vertical — nothing in
 *     this file branches color by entity type. Confirmed by construction:
 *     there's no entity-type variable in scope anywhere near the color
 *     tokens below. Agent had its own lime-green signal color at one point
 *     (itself moved off purple by the redesign pass above) — closing pass,
 *     later still: the lime identity Tag it lived on is retired too (see
 *     AssignedAgent's own doc comment), so lime is no longer a live signal
 *     color anywhere in this file, only in this historical note.
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
 *     Your Intervention status (pending/empty/loading) renders calmly —
 *     "error" (red) is never used anywhere in this zone.
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
 *     icon-only) — all left-aligned, beside the name — up to 2
 *     governance-state Tags (hidden once expanded: workflow, HTL — no
 *     assigned-agent tag, closing pass; see Block 2 note below for why),
 *     Locked state. Actions: AI agent trigger ("Ask about {firstName}") →
 *     optional primary CTA (actions[0], host-provided — omitted entirely if
 *     the host passes none) → "···" overflow (actions[1+]) → disclosure
 *     chevron. Clicking a compressed Tag expands the card and scrolls/
 *     highlights the zone that Tag summarizes.
 *   NEXT BEST ACTION (always visible, not gated by the disclosure — this
 *     redesign pass) → right under the identity tags while collapsed, at
 *     the end of the expanded zones while expanded. See NextBestAction's
 *     own doc comment and NextBestActionBlock.
 *   AGENTIC SYSTEM (expanded, no section heading — this redesign pass) →
 *     N workflows, most prioritized (workflows[0]) full-size + the same
 *     "Show N more"/"Show less"/"View all" disclosure Your Intervention
 *     and Next Best Action use (closing pass — one learnable pattern for
 *     every zone, not 3 bespoke ones). Each item is a CardContainer
 *     (size="sm") with a HighlightIcon (size="sm", light-blue) + a NEUTRAL
 *     tertiary Button — color lives in the icon, never in the button. Also
 *     renders "empty" (no workflow yet) and "loading" (Skeleton) states. No
 *     agent card here — see AgenticSystemInfo's own doc comment for why.
 *   YOUR INTERVENTION (expanded, only if `intervention` is set, no section
 *     heading — closing pass, matching Agentic System's own plain-card
 *     treatment) → renders one of 3 states, never red: pending (default,
 *     N items — most prioritized shown + a diagonal-arrow trigger that
 *     opens the real HTL view in a NEW TAB, never a same-page overlay;
 *     "Show N more" caps at 3 extra inline, revealed BELOW the primary
 *     item, with "View all" as the separate always-present escape hatch
 *     positioned after every item — see InterventionZoneContent's own doc
 *     comment) / empty / loading. See PendingIntervention's own doc
 *     comment.
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
 *                Agent detail, Data Provenance, agent chat) → EntityHeader
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
// entitlement states — NOT two different field types. EntityHeader renders
// whichever state it's given; it never resolves permissions itself. See the
// Reference tab's "PII / masking (Law 4)" section for the full framing.
//
// Block 4 — this is the ONLY field shape RECORD ever renders, for ANY entity
// type: { label, value, provenance, destination? }. There is no hidden
// "employee field" structure anywhere else in this file — the host builds
// this array directly (see EntityHeaderProps.recordFields).
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

// The four zone types — WorkflowSummary, AgenticSystemInfo, InterventionItem
// and PendingIntervention — lived here. The Figma Entity Header has no
// AGENTIC SYSTEM and no YOUR INTERVENTION zone: that content lives in
// Overview widgets, and the header reaches system interpretation only as a
// tag with a tooltip ("NO INSIGHT SECTION").

// ── Assigned AI agent (transversal across entity types) ─────────────────────
// AIMS OS is agent-first: every record has one, regardless of entity type.
// Closing pass — the collapsed identity row used to also carry a lime-green
// Tag echoing this same value ("Renewal Copilot," etc.) alongside the "Ask
// about {name}" button below. That Tag is REMOVED: it was pure redundancy
// with the button, which is already this record's one persistent, always-
// visible agent signal — unlike the workflow/HTL tags, which each
// summarize a genuinely DIFFERENT zone the button doesn't cover. The
// button/trigger itself is untouched and must stay ACTIVE whenever this is
// non-null (disabling it by default was itself a bug from an earlier pass).
export interface AssignedAgent {
  id: string
  name: string
  /** Opens a chat scoped to this record. EntityHeader never renders the chat
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

// ── Visual identity (Figma: "AVATAR OR HIGHLIGHT ICON") ───────────────────
// One question decides it: does this entity have a real-world visual identity
// — a face or a brand?
//
//   avatar  → natural persons, AND branded entities: companies, sites,
//             tenants, suppliers, partners. Photo or logo, falling back to
//             initials taken from `name`.
//   icon    → everything else: objects, assets, processes, transactions,
//             documents.
//
// EXACTLY ONE RENDERS. Never both, never neither — which is why this prop is
// required and has no default.
//
// Rules that prevent drift, from the Figma block of the same name:
//   - A site inherits its parent company's brand. It is not a separate mark.
//   - Initials are NEVER derived from a code. `RO-48291` has no initials, so
//     a code-titled record uses `kind: "icon"` by definition. The component
//     cannot police this — a caller passing `avatar` with a code as the name
//     gets nonsense initials, and that is the caller's bug.
//   - The icon's colour is assigned per entity TYPE and stays the same
//     everywhere in the product. Pass the same `variant` for the same type on
//     every surface.
//   - The rule is about the entity, not about whether the asset exists. A
//     company with no logo still uses `avatar`, falling back to initials.
export type EntityVisual =
  | { kind: "avatar" }
  | { kind: "icon"; icon: LucideIcon; variant?: HighlightIconVariant }

// ── Tags: three roles, two colour rules ───────────────────────────────────
// Figma's TAG ROLES block: three kinds of tag, one component. "The vocabulary
// belongs to the tenant; the colour belongs to the platform."
//
// The third role — STATE — is not in this array. It has its own slot on the
// right (`stateBadge`) because it is the only one there can be exactly one of,
// and the only one that gets the full semantic colour range.
//
//   signal          Something that needs attention, bounded in time or in
//                   condition. Zero or many. "Access review", "Renewal at
//                   risk", "6d overdue", "Sync failing".
//   classification  What kind of thing this is. ONLY when the visual is an
//                   avatar — a highlight icon already says the type.
//                   "Employee", "Customer", "Vendor", "Partner".
export type EntityTagRole = "signal" | "classification"

export interface EntityHeaderTag {
  /** Max ~22 characters. The ceiling itself belongs to the Tag component. */
  label: string
  role: EntityTagRole
  /**
   * COLOUR, RULE 2 OF 2 — left tags get two colours only:
   *   error  blocking — something is broken or overdue
   *   alert  needs review
   *   (omit) everything else, including EVERY classification
   *
   * The test is not whether it is a signal or a classification. It is whether
   * someone has to do something about it. If yes, colour. If no, neutral.
   *
   * CLASSIFICATION IS NEVER COLOURED, and the component enforces it: a tone
   * passed on a classification tag is ignored. That is what makes the
   * vocabulary scalable — a tenant can define a hundred classifications and
   * none of them breaks the visual system, because none of them picks a
   * colour.
   *
   * There can be six of these. If each picked its own semantic colour, a
   * healthy header would light up in three shades and colour would stop
   * meaning anything.
   */
  tone?: "error" | "alert"
  icon?: LucideIcon
}

/**
 * Six visible, then a `+N` chip. Enforced here rather than by trusting the
 * caller, same as `secondaryMetadata`.
 *
 * Tags are the flexible element on the row: show fewer tags and a larger `+N`
 * rather than truncating the title further. The identifier is what the user
 * came to read — a tag can be recovered from the overflow, a cut-off name
 * cannot.
 */
export const ENTITY_HEADER_TAGS_MAX = 6

// ── State badge — its own slot, on the right ──────────────────────────────
// COLOUR, RULE 1 OF 2 — full semantic range. There is exactly one, so colour
// costs nothing and carries real meaning: Active reads success, Degraded reads
// alert, Blocked reads error.
//
// If several statuses are true at once, THE MOST BLOCKING ONE WINS and the
// rest become signal tags. The component cannot decide that for you — it
// renders the one badge it is given.
//
// Never dropped, at any width. Never a focus stop: it is status, not a
// control.
export interface EntityStateBadge {
  /** Max ~19 characters. */
  label: string
  variant: "success" | "informative" | "alert" | "error" | "neutral"
  icon?: LucideIcon
}

// ── Secondary metadata (Entity Header change spec, section 3) ──────────────
// The compact attribute row under the title. Icon says what KIND of
// information this is, text is the value, tooltip carries the field label
// plus context ("Assigned agent · Manager Agent. Handling this account since
// Mar 3."). Capped at SECONDARY_METADATA_MAX by the component, not by
// trusting the caller.
//
// This is NOT `recordFields`. RECORD fields carry provenance and a masking
// state and are reached through the "About this record" trigger; secondary
// metadata is display-only and always visible. Both exist at once in the
// reference design, so they stay separate props.
//
// What qualifies: something a person could act on, or something governance
// requires be visible — counts of facts, open items and workflows, the
// assigned agent tier, access role, tenure, a Bridge ID where policy
// permits. What does not: anything true of every entity of the same type
// (that is a label, not information), and anything describing a conversation
// rather than the entity.
export interface SecondaryMetadataItem {
  /** What kind of information this is — never rendered without `text`. */
  icon: LucideIcon
  /** The value. Short form ≤ 8 chars / 2 words, long form ≤ 24 chars. */
  text: string
  /** Field label + context. Required: the tooltip shows even when `text` is not truncated. */
  tooltip: string
}

/**
 * Six is the maximum, not the goal — aim for four. Past six it stops being a
 * row and becomes a section, and anything beyond belongs in the Overview,
 * never behind a `+N` chip: an item hidden behind a counter is not
 * discovered, and if it was worth showing it is worth having a place.
 */
export const SECONDARY_METADATA_MAX = 6

export interface EntityHeaderProps {
  /** The record's display name — e.g. a person's name or an account name. */
  name: string
  /**
   * Avatar or highlight icon — exactly one, never neither. See EntityVisual's
   * own doc comment for the rule that decides which, and for why a
   * code-titled record can only ever be an icon.
   *
   * There is no `entityType` prop. What kind of thing this is arrives as a
   * CLASSIFICATION tag in `tags`, and only when this is an avatar — a
   * highlight icon already names the type.
   */
  visual: EntityVisual
  /**
   * Signal and classification tags, in one array. The component sorts them —
   * signals first, coloured before uncoloured, then classification — and caps
   * the visible set at ENTITY_HEADER_TAGS_MAX with a `+N` chip for the rest.
   *
   * Omit or pass an empty array for a record with no signals and no
   * classification: the group is REMOVED, not left empty.
   */
  tags?: EntityHeaderTag[]
  /**
   * The entity's overall status — its own slot on the right, before the
   * actions. Exactly one, full semantic colour range, never dropped.
   *
   * This replaces the old `statusTag`, which sat on the LEFT and whose doc
   * said "never error". Both of those contradicted the Figma: the state badge
   * is a right-hand slot, and `Blocked` and `Suspended` are precisely the
   * cases that take `error`.
   */
  stateBadge?: EntityStateBadge
  /**
   * Which system this record came from — Workday, Salesforce, NetSuite, DMS,
   * Helix Data Studio. Renders beside the title, always visible.
   *
   * ONE ITEM, NEVER TWO. A source is a single fact: which system this record
   * comes from. Concatenating a second value breaks it — "Enterprise Account
   * · Midwest Region" is a category next to a location, and neither of them
   * is a source. A job title, a location, a region, a category or a parent
   * company DESCRIBE or PLACE the entity; they do not say where the data came
   * from, so they belong in tags or in secondary metadata, or nowhere.
   *
   * Omit entirely for an entity created in the platform itself and therefore
   * having no source — the slot is removed, never filled with something else.
   */
  source?: string
  /**
   * Durable context, OFF by default — most headers do not carry one, and it
   * is an edge case rather than a slot to fill. Ask in this order and stop at
   * the first yes: needs attention now → signal tag; what kind of thing this
   * is → classification tag; current status → `statusTag`; a fact someone
   * might act on → `secondaryMetadata`; durable context none of those
   * captured → this.
   *
   * The one case that justifies it: the title is an opaque code. `RO-48291`
   * alone means nothing, so the description says what the record concerns.
   *
   * Durability test — if the sentence could change next week it is an
   * activity note and belongs in the Overview, not here. It says what the
   * entity IS, never what is happening to it. Renders as one line,
   * truncated with a Tooltip; it never wraps.
   */
  description?: string
  /** The compact attribute row under the title. Capped at SECONDARY_METADATA_MAX (6) by the component. Omit or pass an empty array to skip the row. */
  secondaryMetadata?: SecondaryMetadataItem[]
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
  /**
   * The one optional secondary action, off by default — the vast majority of
   * records do not have one. It exists for the edge case where a contextual
   * CTA genuinely belongs in the header.
   *
   * There is no primary-CTA slot: `Ask` IS the primary CTA. The old
   * `actions[0]` — "Message", "Export", "Contact account" — is gone. Anything
   * that is not this one secondary action belongs in `menuActions`.
   */
  secondaryAction?: RecordAction
  /**
   * The "···" overflow. Destructive and secondary actions ONLY — never a
   * visible button.
   *
   * The header does not define which actions exist; that is configured per
   * entity in Helix Data Studio. The header owns exactly one rule: destructive
   * actions live here.
   */
  menuActions?: RecordAction[]
  /**
   * Shows the Information (ⓘ) trigger. A boolean the caller owns, NOT derived
   * from whether `recordFields` has anything in it — whether the panel is
   * worth offering is a per-case decision, and the old behaviour made the
   * control vanish whenever the field array happened to be empty.
   */
  showInformation?: boolean
  /**
   * Opens the Information side panel: where the fields IN THIS HEADER came
   * from — the title, the source, the state. Not the Overview, not the
   * Knowledge tab. It explains what is on screen right now, nothing more.
   *
   * ONE SIDE PANEL AT A TIME. This panel and the Personal Assistant both open
   * on the side; opening one closes the other, and the panel requested last
   * wins. The component delegates both, so enforcing that is the host's job.
   */
  onInformationOpen?: () => void
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
  className?: string
}

// ── Centralized fallback copy (configurable/centralized, never scattered inline in JSX) ──
export const RECORD_HEADER_FALLBACKS = {
  /** Tooltip on the agent trigger when assignedAgent is null. */
  noAgentTooltip: "No agent assigned to this record",
  /** Tooltip on Ask. The button's label is one word; this carries the rest. */
  askTooltip: "Ask about this entity",
  /** The read-only Tag shown next to the type label when `locked` is true. */
  lockedTagLabel: "Locked",
  /** Tooltip on the CTA/overflow trigger when `locked` is true. */
  lockedActionTooltip: "This record is locked — read-only",
}

// ── Removed: the container-width collapse thresholds ──────────────────────
// Three constants lived here (560px hide-tags, 480px shorten-assistant, and a
// 12-character first-name guard) and their own comment admitted the problem:
// "No Figma node exists for this component yet, so these px values are
// calibrated estimates, not a spec'd breakpoint." The node exists now, and it
// specifies something else entirely — reflow into stacked rows, then yield
// (tags → +N, then the title), then drop, with a fixed visibility priority.
// Hiding the tags wholesale is not in it. Reflow lands with the responsive
// pass; until then this card has one arrangement.
// Every HTL diagonal-arrow trigger carries this same Tooltip copy (this


// ── Component ────────────────────────────────────────────────────────────────

function EntityHeader({
  name,
  visual,
  tags = [],
  stateBadge,
  source,
  description,
  secondaryMetadata = [],
  // `recordFields` is intentionally NOT destructured. It stays on the props
  // interface — every caller keeps passing it, so the contract lives in one
  // place — but this component no longer renders it anywhere: the Figma
  // Anatomy has no RECORD grid, and the Information panel that explains
  // those fields is host-rendered through `onInformationOpen`. Reading it
  // here would only invite a second render site for data the panel owns.
  assignedAgent,
  secondaryAction,
  menuActions = [],
  showInformation = false,
  onInformationOpen,
  locked = false,
  className,
}: EntityHeaderProps) {

  // ── Tag order and cap ───────────────────────────────────────────────────
  // Signals first, sorted by severity, then classification. Classification is
  // stripped of any tone the caller passed: it is never coloured, and that is
  // the rule that keeps a tenant's hundred classifications from breaking the
  // visual system.
  const TONE_RANK: Record<string, number> = { error: 0, alert: 1, none: 2 }
  const orderedTags = [...tags]
    .map(t => (t.role === "classification" ? { ...t, tone: undefined } : t))
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "signal" ? -1 : 1
      return TONE_RANK[a.tone ?? "none"] - TONE_RANK[b.tone ?? "none"]
    })
  const visibleTags = orderedTags.slice(0, ENTITY_HEADER_TAGS_MAX)
  const hiddenTags = orderedTags.slice(ENTITY_HEADER_TAGS_MAX)

  // Capped here rather than by trusting the caller — same reasoning as the
  // identity tags cap. Six is the maximum; the overflow goes to the Overview,
  // never to a `+N` chip.
  const visibleMetadata = secondaryMetadata.slice(0, SECONDARY_METADATA_MAX)
  // RECORD is no longer one of the expandable zones (this correction pass —
  // its provenance trigger moved up beside the name, always visible). Only
  // Agentic System/Your Intervention still gate the disclosure chevron.

  // Block 2 — clicking a compressed identity Tag expands the card and
  // scrolls/highlights the zone it summarizes. Never opens a SlideOut
  // directly — the deep detail lives one step further in, inside the
  // expanded zone's own Button/Review CTA.
  // focusZone() and the two zone refs lived here, plus the highlight timer.
  // Only the clickable zone-summary tags called them, and those are gone —
  // so the scroll-and-highlight behaviour goes with them. Nothing in this
  // header scrolls to a zone any more.
  // Avatar fallback: only a genuinely blank name gets the DS's own "empty"
  // glyph (avatar.tsx's existing avatarStyle="empty") instead of initials —
  // a single-character name already renders fine as one initial.
  const hasName = Boolean(name && name.trim())

  // The width-measuring machinery that used to live here is GONE. It hid the
  // identity tags below 560px and shortened "Ask about {name}" below 480px —
  // neither exists in the Figma, which specifies reflow (stack the rows) and
  // then yielding (tags collapse to +N, then the title truncates) instead of
  // hiding things wholesale. The Ask label is one word now, so there is
  // nothing left to shorten either. Reflow lands with the responsive pass.
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <CardContainer size="default" variant="default" className={cn("w-full", className)}>
      <div ref={rootRef} className="flex flex-col gap-[16px]">

        {/* ── Identity row (always visible, fixed) — avatar + name +
            entity-type icon+text + up to 2 governance-state Tags + action row.
            Cross-axis alignment is conditional: items-start while collapsed
            (the tags row underneath makes this a 2-line block), items-center
            once expanded (name row is the only line left, so it should sit
            centered against the avatar, not pinned to its top edge). */}
        <div className="flex gap-[12px] flex-wrap items-center">
          {/* Visual identity — exactly one, never both. Avatar for people and
              brands, highlight icon for everything else. Decorative to the
              keyboard (never a focus stop), named to the screen reader. */}
          {visual.kind === "avatar" ? (
            <AvatarCircle name={name} sizeKey="lg" avatarStyle={hasName ? "text" : "empty"} />
          ) : (
            <HighlightIcon
              size="lg"
              variant={visual.variant ?? "neutral"}
              icon={<visual.icon size={16} strokeWidth={1.75} />}
              className="shrink-0"
            />
          )}

          <div className="flex-1 flex flex-col gap-[6px]">
            <div className="flex items-center gap-[12px] min-w-0">
              {/* Title — PROTECTED, and it yields last.
                  `flex: 0 1 auto` + `min-width: 0` + a 540px ceiling, exactly
                  as the Figma truncation block specifies for code: the title
                  takes whatever the row has left after visual, source,
                  collapsed tags and actions, and truncates only there.
                  It was `flex-1`, which made it GROW and shove the source out
                  to the right edge — the bug visible in the prototype. The
                  540px is Figma's own number: the identity row is 932px and
                  visual + source + tags + gaps take roughly 395 of it.
                  A title cut short with empty space beside it is a bug, not a
                  rule. Never wraps, at any width. Never dropped. */}
              <Tooltip content={name} side="cursor" triggerClassName="block min-w-0 basis-auto grow-0 shrink max-w-[540px]">
                <span className="block truncate text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-text-title)" }}>
                  {name}
                </span>
              </Tooltip>
              {/* Source — which system this record came from. One item,
                  always visible, separated from the entity type by the same
                  bullet the reference design uses. Tokens read from Figma:
                  the bullet is Surface/Neutral/Emphasis, the icon is
                  Icon/Neutral/Dark, the value is Text/Body at 12px Medium. */}
              {source && (
                <span className="inline-flex items-center gap-[8px] shrink-0 min-w-0">
                  <span
                    aria-hidden="true"
                    className="text-[16px] leading-none"
                    style={{ color: "var(--color-surface-neutral-emphasis)" }}
                  >
                    •
                  </span>
                  <Tooltip content={`Source · ${source}`} side="cursor">
                    <span className="inline-flex items-center gap-[4px] min-w-0">
                      <Database size={14} strokeWidth={1.75} style={{ color: "var(--color-icon-neutral-dark)" }} />
                      <span className="block truncate text-[12px] font-medium" style={{ color: "var(--color-text-body)" }}>
                        {source}
                      </span>
                    </span>
                  </Tooltip>
                </span>
              )}
              {/* Divider — separates identity from the tag group, per the
                  Figma identity row (Identity · Divider · Tags, gap 8). */}
              {visibleTags.length > 0 && (
                <span
                  aria-hidden="true"
                  className="shrink-0 self-center"
                  style={{ width: 1, height: 16, background: "var(--color-border-neutral-lighter)" }}
                />
              )}
              {/* Tag group — signals first, then classification, capped at 6
                  with a `+N` chip. Tags HUG and wrap: they never take a fixed
                  width, so growth in the title or source makes them collapse
                  instead of overlapping.
                  Colour rule: only signals may be error/alert. Classification
                  is always neutral — enforced above, in orderedTags. */}
              {visibleTags.length > 0 && (
                <div className="flex items-center gap-[6px] flex-wrap min-w-0">
                  {visibleTags.map((t, i) => (
                    <Tag
                      key={`${t.role}-${t.label}-${i}`}
                      variant={t.tone ?? "neutral"}
                      size="sm"
                      leadingIcon={t.icon ? <t.icon size={12} strokeWidth={1.75} /> : undefined}
                      className="shrink-0"
                    >
                      {t.label}
                    </Tag>
                  ))}
                  {/* +N — the hidden tags reach the keyboard and the screen
                      reader through the Tooltip's own content, not only on
                      hover. That is what makes it acceptable for tags to
                      yield before the title: nothing is lost, only moved. */}
                  {hiddenTags.length > 0 && (
                    <Tooltip content={hiddenTags.map(t => t.label).join(" · ")} side="cursor">
                      <Tag variant="neutral" size="sm" className="shrink-0">
                        {`+${hiddenTags.length}`}
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              )}
              {locked && (
                <Tag variant="secondary" size="sm" leadingIcon={<Lock size={12} strokeWidth={1.75} />} className="shrink-0">
                  {RECORD_HEADER_FALLBACKS.lockedTagLabel}
                </Tag>
              )}
            </div>

            {/* The clickable zone-summary tags that used to sit here are
                GONE, along with focusZone(). They were a second tag system
                occupying the same visual slot the real `tags` array now
                owns, and they summarised the two expandable zones — which
                the Figma does not have. Their scroll-and-highlight
                behaviour went with them: nothing in this header scrolls to
                a zone any more. */}
          </div>

          {/* Right cluster — Figma's own order and gap: Information → State
              badge → Secondary CTA → Ask → Menu, 8px apart. This side is
              FIXED and never compressed; the left side is what yields. */}
          <div className="flex items-center gap-[8px] shrink-0 flex-wrap justify-end">
            {/* 1 · Information — where the fields IN THIS HEADER came from:
                the title, the source, the state. Not the Overview, not the
                Knowledge tab. A boolean the caller owns; it no longer
                disappears just because `recordFields` happens to be empty. */}
            {showInformation && (
              <Tooltip
                content={onInformationOpen ? "About this record — where the title, source and state came from" : "No information panel wired for this record yet"}
                side="cursor"
              >
                <Button
                  variant="tertiary"
                  size="sm"
                  iconPosition="alone"
                  icon={<Info size={14} strokeWidth={1.75} />}
                  aria-label="About this record"
                  disabled={!onInformationOpen}
                  onClick={onInformationOpen}
                  className="shrink-0"
                />
              </Tooltip>
            )}

            {/* 2 · State badge — full semantic range, exactly one, never
                dropped. Never a focus stop: it is status, not a control. */}
            {stateBadge && (
              <Tag
                variant={stateBadge.variant}
                size="sm"
                leadingIcon={stateBadge.icon ? <stateBadge.icon size={12} strokeWidth={1.75} /> : undefined}
                className="shrink-0"
              >
                {stateBadge.label}
              </Tag>
            )}

            {/* 3 · Secondary action — optional, off by default. Most records
                do not have one. */}
            {secondaryAction && (() => {
              const lockDisabled = locked && secondaryAction.disableWhenLocked !== false
              const disabled = lockDisabled || Boolean(secondaryAction.disabled)
              const tooltip = lockDisabled ? RECORD_HEADER_FALLBACKS.lockedActionTooltip : secondaryAction.disabledTooltip
              const btn = (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  onClick={disabled ? undefined : secondaryAction.onClick}
                  className="shrink-0"
                >
                  {secondaryAction.label}
                </Button>
              )
              return disabled && tooltip
                ? <Tooltip content={tooltip} side="cursor">{btn}</Tooltip>
                : btn
            })()}

            {/* 4 · Ask — the primary CTA. variant="main" is the deliberate,
                named exception (see file header).
                It KEEPS the Sparkle, shared with the Next Best Action card.
                Figma's prose says the two must not share a mark; Michael
                overruled that deliberately (2026-09-07): both are AI
                surfaces, and the shared glyph is what communicates that —
                one converses, the other transacts. The Figma component
                itself already shares it (both instance the same `IA-icon`),
                so the file agrees with the decision and only its prose does
                not. Do not "fix" this back. */}
            {/* The label is ONE WORD on purpose. It was "Ask about {name}",
                which grew with the entity name and consumed space the header
                needs — the tooltip carries the rest. That is also what makes
                the width-measuring machinery obsolete: there is no long label
                left to shorten. */}
            <Tooltip content={assignedAgent ? RECORD_HEADER_FALLBACKS.askTooltip : RECORD_HEADER_FALLBACKS.noAgentTooltip} side="cursor">
              <Button
                variant="main"
                size="sm"
                icon={<Sparkle size={16} strokeWidth={1.75} />}
                aria-label={assignedAgent ? RECORD_HEADER_FALLBACKS.askTooltip : RECORD_HEADER_FALLBACKS.noAgentTooltip}
                disabled={!assignedAgent}
                onClick={assignedAgent ? assignedAgent.onOpenChat : undefined}
              >
                Ask
              </Button>
            </Tooltip>

            {/* 5 · Menu — destructive and secondary actions only, never a
                visible button. Which actions exist is configured per entity
                in Helix Data Studio; the header owns one rule: destructive
                lives here. */}
            {menuActions.length > 0 && (
              <ActionOverflowMenu
                items={menuActions}
                disabled={locked}
                disabledTooltip={RECORD_HEADER_FALLBACKS.lockedActionTooltip}
              />
            )}

            {/* The disclosure chevron was here. There is nothing left to
                disclose: the Figma Entity Header is a fixed arrangement of
                slots, not a collapsible card. */}
          </div>
        </div>

        {/* Description — one line, never wraps, truncates with a Tooltip
            carrying the full sentence. Off unless the caller passes one:
            there is no default copy and no placeholder. Text/Body at 14px
            Medium, read from Figma. */}
        {description && (
          <Tooltip content={description} side="cursor" triggerClassName="block min-w-0">
            <p className="truncate text-[14px] font-medium leading-[1.4]" style={{ color: "var(--color-text-body)" }}>
              {description}
            </p>
          </Tooltip>
        )}

        {/* Secondary metadata — the compact attribute row. Icon + text, never
            an icon alone: Entity List allows icon-only under space pressure,
            this header does not — it has the width, and a bare symbol forces
            the user to interpret it. Tooltip is always present, even when the
            text is not truncated. */}
        {visibleMetadata.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[8px]">
            {visibleMetadata.map((item, i) => {
              const ItemIcon = item.icon
              return (
                <Tooltip key={`${item.text}-${i}`} content={item.tooltip} side="cursor">
                  <span className="inline-flex items-center gap-[4px] min-w-0">
                    <ItemIcon size={14} strokeWidth={1.75} style={{ color: "var(--color-icon-neutral-dark)" }} />
                    <span className="block truncate text-[12px] font-medium" style={{ color: "var(--color-text-body)" }}>
                      {item.text}
                    </span>
                  </span>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* The two expandable zones rendered here. Gone: the Figma Entity
            Header has no AGENTIC SYSTEM and no YOUR INTERVENTION. That
            content belongs to Overview widgets, and this card reaches
            system interpretation only through a tag with a tooltip. */}
      </div>
    </CardContainer>
  )
}

// AgenticSystemZoneContent, AgenticSystemItem and InterventionZoneContent
// lived here — 6 states each, workflow cards, HTL rows, the Show-N-more
// disclosures. All of it went with the zones.

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

export { EntityHeader }
export type { LucideIcon }
