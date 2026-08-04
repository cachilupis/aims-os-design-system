# Switch Tab

**Figma node:** [`4591:349`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4591-349)

Segmented tab switcher for top-level navigation within a contained view. White pill container (Elevation-5 shadow) with 2–7 equal-width tab items. Active tab shows a blue tinted fill and SemiBold label; inactive tabs are transparent with a Medium label.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| items | SwitchTabItem[] | { id, label, icon? }[] | required | Tab definitions. Each item needs a unique id and a label. Icon is optional. |
| value | string | string | — | Controlled active tab id. Pair with onChange. |
| defaultValue | string | string | items[0] | Uncontrolled initial active tab id. |
| onChange | (id) => void | function | — | Called with the newly activated tab id. |
| size | SwitchTabSize | m,s | m | M = 48px container height. S = 44px. Font scales proportionally. |
| aria-label | string | string | — | Accessible label for the tablist region. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Container M | 8px all | 2px | 8px | 48px total height. Tabs fill equally. |
| Container S | 8px all | 2px | 8px | 44px total height. |
| Tab item M | 12px H / 4px V | — | 4px | 16px font, 24px line-height. |
| Tab item S | 8px H / 4px V | — | 4px | 14px font, 20px line-height. |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Active label M | Inter | 16px | 600 | 24px |
| Inactive label M | Inter | 16px | 500 | 24px |
| Active label S | Inter | 14px | 600 | 20px |
| Inactive label S | Inter | 14px | 500 | 20px |

## Variants / token groups

### Container

White pill wrapper with Elevation-5 shadow

CSS prefix: `st-container`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --st-bg | Surface/Neutral/White | #FFFFFF | #FFFFFF |
| Shadow | --st-shadow | Elevation-5 | 8px 8px 16px rgba(0,0,0,.08) | 8px 8px 16px rgba(0,0,0,.08) |
| Item radius | --st-item-radius | Radius/Radius-S | 4px | 4px |

### Active tab

Selected tab — blue tint + SemiBold label

CSS prefix: `st-active`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Tab BG | --st-active-bg | Surface/Primary/More Subtle | #f6f9ff | #f6f9ff |
| Text | --st-active-text | Text/Link | #2173ff | #2b7fff |

### Inactive tab

Non-selected tabs — transparent + Medium label

CSS prefix: `st-inactive`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Text | --st-text | Text/Info | #1a1a1a | rgba(255,255,255,.80) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
