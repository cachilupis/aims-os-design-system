# Tag

**Figma node:** [`4607:619`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4607-619)

Inline badge for status, category, and metadata. 11 semantic variants communicate intent — success, error, alert, informative, and categorical colors. Size S for dense tables, M for general UI.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| State | Variant | Success,Secondary,Primary,Informative,Error,Alert,Lime Green,Yellow,Purple,Light Blue,Neutral | Secondary | — |
| Size | Variant | S,M | M | S: 20px height / 12px font. M: 24px height / 14px font. |
| Feedback | Variant | Active,Disabled | Active | — |
| Just icon | Boolean | Yes,No | No | When Yes, hides text and shows only the leading icon. Useful for compact column headers. |

## Sizes / scale

| Size | Height | PaddingH | PaddingV | FontSize | Gap | Radius |
| --- | --- | --- | --- | --- | --- | --- |
| S | 20px | 8px | 4px | 12px | 4px | 8px |
| M | 24px | 8px | 4px | 14px | 4px | 8px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 12px (S) / 14px (M) | 500 — Medium | 1 |

## Variants / token groups

### success

Completed, verified, healthy

CSS prefix: `tag-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Success/More Subtle | 4465:2672 | #e5fdf8 | #0a1f1a |
| Border | Border/Success/Lighter | 4465:4465 | #009978 | #34d399 |
| Text | Text/Success | 4465:4505 | #003328 | #6ee7b7 |

### error

Failed, blocked, critical

CSS prefix: `tag-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Error/More Subtle | 4465:2662 | #fdeded | #2d1515 |
| Border | Border/Error/Default | 4465:4456 | #992222 | #e05252 |
| Text | Text/Error | 4465:4473 | #5f2120 | #ff6467 |

### alert

Pending, needs attention, expiring

CSS prefix: `tag-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Alert/More Subtle | 4465:2666 | #ffeedb | #281e00 |
| Border | Border/Alert/Lighter | 4465:4461 | #b25102 | #f59e0b |
| Text | Text/Alert | 4465:4504 | #663c00 | #fcd34d |

### informative

Category, type, feature flags

CSS prefix: `tag-informative`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Primary/Subtle | 4461:2592 | #e9f1ff | rgba(21,93,252,0.15) |
| Border | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |
| Text | Text/Info | 4465:4506 | #001740 | rgba(255,255,255,0.8) |

### primary

Selected, active, high-emphasis

CSS prefix: `tag-primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Primary/500 | 4461:2591 | #2173ff | #155dfc |
| Border | transparent |  | none | none |
| Text | Text/Negative | 4465:4471 | #ffffff | #ffffff |

### secondary

Default neutral label

CSS prefix: `tag-secondary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Gray/100 / White/10 | 4465:4591 | #ffffff | rgba(255,255,255,0.10) |
| Border | Gray/600 / White/10 | 4465:4448 | #5c5c5c | rgba(255,255,255,0.10) |
| Text | Text/Subtitle | 4465:4468 | #2a2a2a | rgba(255,255,255,0.60) |

### neutral

Low-emphasis label on tinted surfaces

CSS prefix: `tag-neutral`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Gray/300 / White/8 | 4465:2687 | #f2f2f2 | rgba(255,255,255,0.08) |
| Border | Gray/600 / White/10 | 4465:4448 | #5c5c5c | rgba(255,255,255,0.10) |
| Text | Text/Subtitle | 4465:4468 | #2a2a2a | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
