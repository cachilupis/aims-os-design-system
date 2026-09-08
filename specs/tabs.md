# Tabs

**Figma node:** [`856:11281`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=856-11281)

Primary navigation inside a screen — answers "where am I?". Horizontal bar with a 2px indicator under the active tab only. It manages its own indicator, so never add a borderBottom to the wrapper: that draws a line under ALL tabs, which the DS spec forbids. Sits directly on the surface, no CardContainer needed. Top of the navigation hierarchy — when a second level is needed below it, that is SwitchTab. Size M only on L screens; S everywhere else, to save space and stay consistent.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| items | Array | TabItem[] | required | id · label · icon? · disabled? |
| activeId | String | string | required | ID of the currently selected tab |
| onChange | Function | (id) => void | required | Called when user clicks a non-disabled tab. Receives tab id. |
| size | Variant | m,s | m | M: 14px / px-16 py-8 — S: 12px / px-12 py-8 |
| className | String | string | undefined | Extra Tailwind classes applied to the tablist container |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Tab M | 8×16px | 6px | 8px | Default · icon 16px · 14px label |
| Tab S | 8×12px | 4px | 8px | Compact · icon 14px · 12px label |
| Indicator | — | — | 0 | 2px · active tab only · bottom-[0] · abs positioned |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label M | Inter | 14px | Medium (500) | 1.4 |
| Label S | Inter | 12px | Medium (500) | 1.4 |

## States / token groups

### Active

Border width: `indicator 2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label | --primary |  | #2173ff | #2b7fff |
| Indicator | --primary |  | #2173ff | #2b7fff |

### Default

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label | --color-text-subtitle |  | #2a2a2a | rgba(255,255,255,0.60) |

### Hover

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tabs-hover-bg |  | #fafafa | rgba(255,255,255,0.06) |
| Label | --foreground |  | #1a1a1a | #ffffffcc |

### Disabled

Border width: `opacity 40%`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label ×0.4 (reused) | --color-text-subtitle |  | #2a2a2a | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
