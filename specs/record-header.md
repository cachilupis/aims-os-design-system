# Record Header


Governed entity card for a single record on any AIMS OS Work Surface — Employee, Customer, Vendor, or any entity type the host defines. Identity (fixed) + 3 expandable zones: Agentic System, Your Intervention, Record. One shared skeleton for every entity type — there is no variant prop; only the content each caller passes changes. See the Reference tab's Governance canon section for the 4 laws this component is built to enforce.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| name | string | The record's display name | required | A person's name or an account name. The component has NO variant prop and no closed set of entity types — see entityType below. |
| entityType | object | RecordHeaderEntityType — { icon: LucideIcon, label: string } | required | What kind of record this is, 100% host-defined. This file never enumerates entity types: Employee, Customer, Vendor, Patient, Borrower or anything a host defines tomorrow all use the same shape. An entity type the DS has not seen before is the normal case, not a DS-GAP. |
| recordFields | Array | RecordField[] — { label, icon, provenance, state, value, maskedValue?, hasDestination? } | undefined | Zone: RECORD. A flat array the host builds directly — there is no per-entity-type field structure inside the component. `provenance` is mandatory on every field (Law 1: no code path renders a value without its origin). `state: "hydrated" | "masked"` is the SAME field in 2 entitlement states, not 2 field types — the component renders whichever it is given and never resolves permissions itself (Law 4). `hasDestination: false` for a plain descriptive fact (a pure date, a pure figure) — static text, no chevron. Omit or pass an empty array to skip the zone. |
| assignedAgent | object | null | AssignedAgent — { id, name, onOpenChat } | null | required | AIMS OS is agent-first — required as a PROP, but the value can be null for a record that genuinely has none yet (renders disabled + Tooltip, see the States gallery's own "No agent assigned" example). Renders an always-present icon-only button (Sparkle, variant="main"); it must stay active whenever this is non-null — disabling it by default was itself a bug from an earlier pass. No identity-row Tag echoes this value anymore (closing pass) — the button alone is the signal, avoiding the duplication that caused that bug. Opens a chat SidePanel (never SlideOut) with a structured placeholder body. RecordHeader never renders the chat UI itself. |
| actions | Array | RecordAction[] — { label, variant?, onClick? } | [] | actions[0] renders as an optional primary CTA; actions[1+] land in the "···" overflow Menu. Omitted entirely by this demo since the Message CTA was removed (this correction pass). |
| agenticSystem | object | AgenticSystemInfo — { workflows: WorkflowSummary[], onViewAll? } | undefined | Zone: AGENTIC SYSTEM, no section heading, workflow(s) only (closing pass — the zone's own agent card was removed; that value is now fully carried by Next Best Action). N workflows: most prioritized (workflows[0]) full-size + "Show N more"/"Show less"/"View all" — the SAME disclosure pattern Your Intervention and Next Best Action use. Each item is a bordered card with a light-blue Workflow HighlightIcon + a bare icon-only chevron Button, always full-width. Zone omitted entirely if workflows is empty (outside "empty"/"loading" statuses). |
| intervention | object | PendingIntervention — pending: { items: InterventionItem[], onViewAll? } — each { id, description, severity, onReview, contextTag? } | undefined | Zone: YOUR INTERVENTION — only rendered when set (a real pending HTL decision). N items: most prioritized shown + "Show N more" (caps at 3 extra) + "View all". Every item's trigger is a diagonal ArrowUpRight opening the real HTL view in a NEW TAB (redesign pass — was a labeled "Review" button). Optional contextTag renders a neutral Tag beside the item ("Access", "Compliance", ...) — one word, never a signal color. Calm/informative styling ALWAYS, regardless of severity — Law 3. |
| nextBestActions | Array | NextBestAction[] — { id, title, description, onOpen, contextTag? } | [] | The protagonist block (redesign pass). Always visible, never gated by the disclosure — right under the identity tags collapsed, at the end of the zones expanded. Dark-purple surface, Sparkle icon. Optional contextTag renders a neutral Tag beside the title ("Renewal", "Coverage", ...) — one word, same convention as Your Intervention's own contextTag. Omit/empty array skips it entirely. |
| statusTag | object | { label: string, icon?: LucideIcon } | undefined | A visible, temporary status on the contact itself ("On Leave · Returns Mar 15") — renders as a single neutral/amber Tag beside entityType, always visible. Never `error`/red — a state, not a problem. Omit for the common case (nothing to show). |
| onProvenanceOpen | Function | () => void | undefined | Opens "About this record" (renamed from "Data Provenance" this redesign pass) for the RECORD zone — reached through the icon-only Button beside the name (moved there this redesign pass; used to be a labeled Button down in a RECORD zone that no longer exists). Fields never render inline. |
| defaultExpanded | Boolean | true,false | false | Uncontrolled initial state for the zones disclosure. Predictable header height when collapsed. |
| locked | Boolean | true,false | false | Read-only record. Shows a "Locked" Tag next to the type label; disables any contact/write actions passed via `actions` (Tooltip explains why); the agent trigger and RECORD's provenance button stay fully interactive. |

## Sizes / scale

| Size | Dimensions | Padding | Gap |
| --- | --- | --- | --- |
| Card | 100% width, auto height | 16px H / 24px V (CardContainer default) | 16px between rows |
| Avatar | 32×32px (AvatarCircle lg) | — | — |
| Your Intervention block | 100% width × auto | 12px H / 10px V | 10px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Name | Inter | 18px | Semi Bold (600) | 1.3 |
| Type label | Inter | 12px | Medium (500) | 1 |
| Zone heading (AGENTIC SYSTEM/YOUR INTERVENTION/RECORD) | Inter | 10px | Semi Bold (600) | 1 |
| Record field label | Inter | 10px | Semi Bold (600) | 1 |
| Record field value (hydrated) | Inter | 13px | Regular | 1.4 |
| Record field value (masked) | Inter | 13px | Regular, Italic | 1.4 |

## States / token groups

### Status dot — attention

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | --badge-alert |  | #f59e0b | #f59e0b |

### Status dot — success

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | --badge-success |  | #10b981 | #10b981 |

### Status dot — neutral

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | --badge-neutral |  | #bababa | rgba(255,255,255,0.50) |

### Your Intervention (Law 3 — calm, never error-red)

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-informative-bg |  | #e9f1ff | rgba(21,93,252,0.15) |
| Border | --tag-informative-bd |  | #2173ff | #2b7fff |
| Icon + text | --tag-informative-fg |  | #001740 | rgba(255,255,255,0.80) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
