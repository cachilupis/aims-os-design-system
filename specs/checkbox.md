# Checkbox

**Figma node:** [`4753:19229`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4753-19229)

Binary selection control. Supports standalone use (table rows, menu items) and labeled use (form fields). The outer area is a circular ripple zone that provides hover/focus visual feedback.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| checked | Boolean | true,false | false | — |
| size | Variant | default (M),sm (S) | default | — |
| disabled | Boolean | true,false | false | — |
| label | String | any string | undefined | — |
| description | String | any string | undefined | — |
| onChange | Function | (checked: boolean) => void | undefined | — |

## Sizes / scale

| Size | Outer | Icon | Padding | Ripple |
| --- | --- | --- | --- | --- |
| M (default) | 32×32px | 24×24px | 4px | rounded-full |
| S (sm) | 24×24px | 16×16px | 4px | rounded-full |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 14px | Medium (500) | 1.4 |
| Description | Inter | 12px | Regular (400) | 1.5 |

## States / token groups

### unchecked default

Border width: `1.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon color | Border/Neutral/Default |  | #5c5c5c | rgba(255,255,255,0.10) |

### unchecked hover

Border width: `1.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ripple bg | Surface/Neutral/Default |  | rgba(242,242,242,0.8) | rgba(255,255,255,0.06) |
| Icon color | Border/Neutral/Darker |  | #2a2a2a | rgba(255,255,255,0.20) |

### checked default

Border width: `–`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill color | Border/Primary/Default |  | #2173ff | #2b7fff |
| Check stroke | Text/White |  | #ffffff | #ffffff |

### checked hover

Border width: `–`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ripple bg | Primary/50 |  | #e9f1ff | rgba(43,127,255,0.14) |

### disabled

Border width: `1.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Unchecked color | Text/Disabled |  | #bababa | rgba(255,255,255,0.20) |
| Checked fill | Primary/200 |  | #80afff | rgba(43,127,255,0.50) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
