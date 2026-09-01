# Record Header


Entity profile header used atop Employee/Customer/Client dashboard views. 3-layer architecture: Identity row (always visible — avatar, name, type, up to 3 stable-attribute Tags, a 3-tier action row), Signal (always visible — a single NextBestAction, semantically colored, optionally actionable inline), Details (disclosure — secondary fields grid). One shared layout for all 3 variants; only which fields land in chips vs. Details vs. actions changes per variant.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | Variant | employee,customer,client | required | Selects which of the 3 record shapes `data` must match, and which fields populate the context chips vs. the Details grid — see getRecordFields in record-header.tsx. |
| data | object | EmployeeRecord | CustomerRecord | ClientRecord | required | — |
| signal | object | NextBestAction — { label, severity, dueContext?, aiGenerated?, actionLabel?, onAction?, dismissible?, onDismiss? } | required | Fed by the AIMS OS Next Best Action engine. Same shape for all 3 variants. actionLabel renders a real inline button (calls onAction) when the recommendation names one specific action. dismissible adds a close (X) — reserve it for signals with no actionLabel/onAction, so dismissing never buries a real next step. |
| assignedAgent | object | AssignedAgent — { id, name, onOpenChat } | required | AIMS OS is agent-first — every record has one. Renders as an always-present icon-only button (Sparkle, variant="main" — a named exception to the usual no-main-in-a-card rule) that opens a chat scoped to this record. RecordHeader never renders the chat UI itself. |
| actions | Array | RecordAction[] — { label, variant?, onClick? } | [] | actions[0] renders as the one contextual CTA button; actions[1+] land in the "···" overflow Menu. Same RecordAction shape as EntityList's ELAction. |
| defaultExpanded | Boolean | true,false | false | Uncontrolled initial state for the Details disclosure. Chevron only renders when there's at least one Details field. |

## Sizes / scale

| Size | Dimensions | Padding | Gap |
| --- | --- | --- | --- |
| Card | 100% width, auto height | 16px H / 24px V (CardContainer default) | 16px between layers |
| Avatar | 32×32px (AvatarCircle lg) | — | — |
| Signal | 100% width × auto | 12px H / 10px V | 8px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Name | Inter | 18px | Semi Bold (600) | 1.3 |
| Type label | Inter | 12px | Medium (500) | 1 |
| Signal text | Inter | 13px | Semi Bold (600) | 1.4 |
| Detail label | Inter | 10px | Semi Bold (600) | 1 |
| Detail value | Inter | 13px | Regular | 1.4 |

## States / token groups

### Signal — success

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-success-bg |  | #e5fdf8 | #0a1f1a |
| Border | --ab-success-bd |  | rgba(0,153,120,0.25) | rgba(0,153,120,0.25) |
| Icon + text | --ab-success-text |  | #003328 | #6ee7b7 |

### Signal — alert

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-alert-bg |  | #fff4e5 | #281e00 |
| Border | --ab-alert-bd |  | rgba(180,83,9,0.25) | rgba(180,83,9,0.25) |
| Icon + text | --ab-alert-text |  | #663c00 | #fcd34d |

### Signal — error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-error-bg |  | #fdeded | #2d1515 |
| Border | --ab-error-bd |  | rgba(153,34,34,0.25) | rgba(153,34,34,0.25) |
| Icon + text | --ab-error-text |  | #5f2120 | #ff6467 |

### Signal — informative (fallback, see file header)

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-informative-bg |  | #e9f1ff | rgba(21,93,252,0.15) |
| Border | --tag-informative-bd |  | #2173ff | #2b7fff |
| Icon + text | --tag-informative-fg |  | #001740 | rgba(255,255,255,0.80) |

### Signal — neutral (fallback, see file header)

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-neutral-bg |  | #f2f2f2 | rgba(255,255,255,0.08) |
| Border | --tag-neutral-bd |  | #5c5c5c | rgba(255,255,255,0.10) |
| Icon + text | --tag-neutral-fg |  | #2a2a2a | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
