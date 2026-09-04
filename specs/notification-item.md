# Notification Item

**Figma node:** [`18687:577`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=18687-577)

Single-row notification: lead visual (Avatar or icon) + title/timestamp + description + tags/actions. 5 states (Default, Hover, Pressed, Focus, Disabled) × Read Status (Unread, Read). Read Status does not change any color — it only controls whether the unread dot renders. Composes AvatarCircle or HighlightIcon (lead), Badge variant=lightBlue (unread dot), Tag (tags), and Button (actions) — no custom re-implementations. Content toggles mirror Figma's own component properties (Show Description / Show Tags / Show Actions / Show Timestamp) exactly — omit the corresponding prop to hide that region, matching the DS boolean 1:1.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| avatarName | string | any string | undefined | Leading-visual priority 1 — renders AvatarCircle instead of the icon. Never replace an existing Avatar with a product icon. |
| avatarSrc | string | image URL | undefined | Optional photo for the Avatar; falls back to initials when omitted |
| iconVariant | Variant | informative,success,alert,error,neutral,yellow,lime,purple,light-blue | "informative" | Reuses HighlightIcon's semantic variants. Ignored when avatarName is set. |
| iconName | string | Lucide icon name | "Bell" | — |
| title | string | any string | required | — |
| timestamp | string | any string | required | — |
| showTimestamp | Boolean | true,false | true | Figma "Show Timestamp" boolean — hides the relative-time text (unread dot, if any, still renders) |
| description | string | any string | undefined | Figma "Show Description" — omit to hide the row entirely |
| unread | Boolean | true,false | false | Shows the lightBlue Badge dot next to the timestamp |
| tags | Array | { label, variant? }[] — max 2 recommended, 3 technically supported | undefined | Tag 1 = category, variant defaults to "secondary". Tag 2 = severity — pass variant="success"|"alert"|"error" explicitly (never "secondary"); omit tag 2 for Info severity. Verbatim DS rule, Figma node 18749:7093. |
| primaryAction | object | { label, variant?, onClick? } | undefined | Figma "Show Actions" — DS mock defines both action slots as variant=tertiary only |
| secondaryAction | object | { label, variant?, onClick? } | undefined | Figma "Second Action" — omit to show only the primary action |
| disabled | Boolean | true,false | false | — |
| onClick | Function | () => void | undefined | Must resolve to the same destination as primaryAction.onClick — never two different outcomes for the same row |
| hoverable | Boolean | true,false | true | The row's own gray hover/press background. Keep true in Notification Center's dropdown. Set false when wrapping in a container that owns its own hover (e.g. CardContainer in a List View) to avoid two competing hover treatments. |

## Sizes / scale

| Size | Dimensions | Padding | Gap |
| --- | --- | --- | --- |
| Row | 420×auto (100px typical) | 12px all sides | 12px |
| Lead icon | 24×24px (HighlightIcon sm) | — | — |
| Unread dot | 8×8px (Badge) | — | — |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 14px | Semi Bold (600) | 1 |
| Timestamp | Inter | 12px | Medium (500) | 20px |
| Description | Inter | 12px | Medium (500) | 20px |

## States / token groups

### Default

Border width: `1px transparent`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | — |  | transparent | transparent |

### Hover

Border width: `1px transparent`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --menu-item-hover |  | rgba(242,242,242,0.95) | rgba(32,42,62,0.90) |

### Pressed

Border width: `1px transparent`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --color-surface-neutral-subtle |  | #fafafa | rgba(255,255,255,0.05) |

### Focus

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused from Pressed) | --color-surface-neutral-subtle |  | #fafafa | rgba(255,255,255,0.05) |
| Focus ring | --field-border-focus |  | #2173ff | #2b7fff |

### Disabled

Border width: `1px transparent`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Opacity | — |  | 40% | 40% |

### Unread indicator (reused)

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill | --badge-light-blue |  | #00b5d9 | #51a2ff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
