# Menu / Dropdown

**Figma node:** [`4762:7152`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4762-7152)

Floating list of selectable options. Used inside dropdowns, context menus, command palettes, and select fields. Supports icons, subtext, dividers, and section headers.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| State | Variant | Default,Hover,Focus,Disabled,Skeleton | Default | — |
| Size | Variant | M,S | M | M/S: height auto (py-8px) · 40px single-line · 56px with subtext |
| Leading icon | Boolean | Yes,No | No | Leading slot — any icon · Avatar · Highlight icon · Checkbox goes separately before this slot |
| Checkbox | Boolean | Yes,No | No | Checkbox-NEW before leadingIcon slot · 32×32 (M) · 24×24 (S) |
| Subtext | Boolean | Yes,No | No | Secondary row below label · DS: Roboto Regular 14px · doc app: Inter |
| Trailing | Variant | None,Tag,Button | None | Tag = Neutral/S · Button = Tertiary/Icon Alone/Close · 40×40 (M) · 28×28 (S) |

## Sizes / scale

| Size | Height | PaddingV | PaddingH | Gap | FontSize | IconSize |
| --- | --- | --- | --- | --- | --- | --- |
| M | auto · 40px single-line · 56px with subtext | 8px | 16px | 16px | 14px — Text/Subtitle | 24×24px |
| S | auto · 40px single-line · 56px with subtext | 8px | 8px | 8px | 12px — Text/Body (lighter) | 16×16px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label M | Inter | 14px | 500 — Medium | 20px |
| Label S | Inter | 12px | 500 — Medium | 20px |
| Subtext | Inter | 14px | 400 — Regular | 20px |
| Section | Inter | 11px | 600 — SemiBold | 1 |

## Variants / token groups

### default

Unselected row. Hover applies Surface/Floating/Hover automatically via CSS.

CSS prefix: `menu-item`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Floating/Default | 13469:2 | rgba(255,255,255,0.92) | rgba(20,27,42,0.85) |
| Hover background | Surface/Floating/Hover | 13469:3 | rgba(242,242,242,0.95) | rgba(32,42,62,0.90) |
| Label text | Text/Subtitle | 4465:4468 | #2A2A2A | rgba(255,255,255,0.60) |
| Icon | Icon/Neutral/Dark | 4465:4510 | #5C5C5C | rgba(255,255,255,0.50) |

### focus

Keyboard-focused or hover-locked row. Same bg as Hover — no color inversion.

CSS prefix: `menu-item-focus`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Floating/Hover | 13469:3 | rgba(242,242,242,0.95) | rgba(32,42,62,0.90) |
| Label text | Text/Subtitle (unchanged) | 4465:4468 | #2A2A2A | rgba(255,255,255,0.60) |

### disabled

Unavailable row. Background stays the same — only text/icon color changes to Text/Disabled.

CSS prefix: `menu-item-disabled`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Floating/Default (unchanged) | 13469:2 | rgba(255,255,255,0.92) | rgba(20,27,42,0.85) |
| Label + icon | Text/Disabled | 4465:4472 | #BABABA | rgba(255,255,255,0.30) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
