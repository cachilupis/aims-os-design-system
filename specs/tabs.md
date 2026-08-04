# Tabs

**Figma node:** [`856:11281`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=856-11281)

Horizontal tab bar for switching between related views within the same context. Sits directly on any surface — no CardContainer needed. Active state: primary-blue 2px indicator + label. Supports leading icon, disabled state, and two sizes (M/S).

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
| Label | Border/Primary/Default |  | #2173ff | #2b7fff |
| Indicator | Border/Primary/Default |  | #2173ff | #2b7fff |

### Default

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label | Text/Body |  | #5c5c5c | rgba(255,255,255,0.60) |

### Hover

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/Subtle |  | #fafafa | rgba(255,255,255,0.06) |
| Label | Text/Title |  | #1a1a1a | rgba(255,255,255,0.80) |

### Disabled

Border width: `opacity 40%`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label ×0.4 | Text/Body |  | #5c5c5c | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
