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
| Background | --tag-success-bg |  | #e5fdf8 | #0a1f1a |
| Border | --tag-success-bd |  | #009978 | #34d399 |
| Text | --tag-success-fg |  | #003328 | #6ee7b7 |

### error

Failed, blocked, critical

CSS prefix: `tag-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-error-bg |  | #fdeded | #2d1515 |
| Border | --tag-error-bd |  | #992222 | #e05252 |
| Text | --tag-error-fg |  | #5f2120 | #ff6467 |

### alert

Pending, needs attention, expiring

CSS prefix: `tag-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-alert-bg |  | #ffeedb | #281e00 |
| Border | --tag-alert-bd |  | #b25102 | #f59e0b |
| Text | --tag-alert-fg |  | #663c00 | #fcd34d |

### informative

Category, type, feature flags

CSS prefix: `tag-informative`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-informative-bg |  | #e9f1ff | rgba(21,93,252,0.15) |
| Border | --tag-informative-bd |  | #2173ff | #2b7fff |
| Text | --tag-informative-fg |  | #001740 | rgba(255,255,255,0.8) |

### primary

Selected, active, high-emphasis

CSS prefix: `tag-primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-primary-bg |  | #2173ff | #155dfc |
| Border | — |  | none | none |
| Text | --tag-primary-fg |  | #ffffff | #ffffff |

### secondary

Default neutral label

CSS prefix: `tag-secondary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --tag-secondary-bd |  | #5c5c5c | rgba(255,255,255,0.10) |
| Text | --tag-secondary-fg |  | #2a2a2a | rgba(255,255,255,0.60) |

### limeGreen

Categorical — extended palette

CSS prefix: `tag-limegreen`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-limegreen-bg |  | #f9fee5 | #111a04 |
| Border | --tag-limegreen-bd |  | #a0da1d | #84cc16 |
| Text | --tag-limegreen-fg |  | #3e5c0a | #bdef49 |

### yellow

Categorical — extended palette

CSS prefix: `tag-yellow`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-yellow-bg |  | #fffaf0 | #281e00 |
| Border | --tag-yellow-bd |  | #ed6c02 | #fbbf24 |
| Text | --tag-yellow-fg |  | #663c00 | #fcd34d |

### purple

Categorical — extended palette / AI contexts

CSS prefix: `tag-purple`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-purple-bg |  | #f3e9fd | #120520 |
| Border | --tag-purple-bd |  | #7b27ed | #a855f7 |
| Text | --tag-purple-fg |  | #2c075c | #d8b4fe |

### lightBlue

Categorical — extended palette

CSS prefix: `tag-lightblue`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-lightblue-bg |  | #e5f8ff | #071828 |
| Border | --tag-lightblue-bd |  | #00b5d9 | #38bdf8 |
| Text | --tag-lightblue-fg |  | #0c4a6e | #7dd3fc |

### neutral

Low-emphasis label on tinted surfaces

CSS prefix: `tag-neutral`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-neutral-bg |  | #f2f2f2 | rgba(255,255,255,0.08) |
| Border | --tag-neutral-bd |  | #5c5c5c | rgba(255,255,255,0.10) |
| Text | --tag-neutral-fg |  | #2a2a2a | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
