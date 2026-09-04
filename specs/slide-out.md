# Slide Out

**Figma node:** [`5066:9783`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5066-9783)

Frosted-glass overlay panel from the right. Two types: With variants (full header + tabs + search + chips + content slot + CTA) and Full slot (just the content slot). Two sizes: M (635px) and S (420px). Background: Surface/Floating/Default with backdrop-blur(30px).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| type | Enum | with-variants,full-slot | with-variants | With variants: full anatomy. Full slot: dashed content area only. |
| size | Enum | m,s | m | M = 635px · Radius-XL 24px. S = 420px · Radius-L 16px. |
| showIcon | Boolean | true,false | true | DS prop: icon. Purple 40px (M) / 32px (S) highlight icon in header. |
| showStatus | Boolean | true,false | true | DS prop: status. Green status tag next to title. |
| showTabs | Boolean | true,false | true | DS prop: tabs. Tab navigation row below header. |
| showTab3 | Boolean | true,false | true | DS prop: tab3. Show or hide the third tab. |
| showSearchBar | Boolean | true,false | true | DS prop: searchBar. Search input field below tabs. |
| showChips | Boolean | true,false | true | DS prop: chips. Category chip row with overflow + > button. |
| showCta | Boolean | true,false | true | DS prop: cta. Secondary + Primary CTA buttons row at the bottom. |
| showTopButton | Boolean | true,false | true | DS prop: topButton. Edit (pencil) icon in the top-right header. |
| showClose | Boolean | true,false | true | DS prop: close. X close button in the top-right header. |

## Sizes / scale

| Size | Dimensions | Note |
| --- | --- | --- |
| M (With variants) | 635px × 100vh · Radius-XL 24px · gap 24px | Full anatomy for detail views, filter panels, configuration drawers. |
| M (Full slot) | 600px × 100vh · Radius-XL 24px · gap 32px | Blank slot for fully custom content — no pre-built anatomy. |
| S (With variants) | 420px × 100vh · Radius-L  16px · gap 16px | Compact anatomy for quick edits and focused tasks. |
| S (Full slot) | 420px × 100vh · Radius-L  16px · gap 24px | Compact blank slot. |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title M | Inter | 24px | 600 | 100% |
| Title S | Inter | 18px | 600 | 100% |
| Subtitle M | Inter | 14px | 500 | 143% |
| Subtitle S | Inter | 12px | 500 | 167% |
| Tab label | Inter | 14px | 600 | 100% |
| Chip / CTA M | Inter | 14px | 500 | 143% |
| Chip / CTA S | Inter | 12px | 500 | 167% |
| Slot indicator | Inter | 18px | 600 | 100% |

## Variants / token groups

### Surface tokens

Panel frosted glass surface, icon highlight, and status tag backgrounds — tokens actually read directly by slide-out.tsx.

CSS prefix: `--slide-out-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Panel BG | --slide-out-bg |  | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Panel shadow | --slide-out-shadow |  | -24px -24px 60px 0px rgba(0,0,0,0.08) | -24px -24px 60px 0px rgba(0,0,0,0.08) |
| Icon highlight (Purple) | --color-surface-purple-more-subtle |  | #f3e9fd | rgba(139,92,246,0.12) |
| Status tag BG (Success) | --color-surface-success-more-subtle |  | #e5fdf8 | rgba(110,231,183,0.10) |
| Resize handle / active tab (reused) | --primary |  | #2173ff | #2b7fff |

### Text & border tokens

Title, body, success, and border tokens actually read directly by slide-out.tsx.

CSS prefix: `--slide-out-* / --color-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title | --color-text-title |  | #000000 | rgba(255,255,255,0.80) |
| Body / subtitle | --slide-out-body |  | #5c5c5c | #94A3B8 |
| Status tag text | --color-text-success |  | #003328 | #6ee7b7 |
| Dashed slot border | --color-border-primary-lighter |  | #80afff | #80afff |
| Status tag border | --color-border-success-lighter |  | #009978 | #009978 |
| Backdrop / overlay | --slide-out-overlay |  | rgba(0,0,0,0.30) | rgba(0,0,0,0.30) |

### Delegated to nested atoms (not read directly)

slide-out.tsx composes the real Tabs, Input, Button, and Chip atoms for its tab row, search bar, and CTA buttons instead of styling them inline — so these Figma-catalog tokens are never actually referenced in slide-out.tsx itself. The real colors come from each atom's own spec (Tabs, Input, Button, Chip).

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Inactive chip / search BG (→ Input/Chip spec) | --color-surface-neutral-white |  | #ffffff | #ffffff |
| Secondary CTA bg (→ Button spec) | --slide-out-btn-secondary-bg |  | #ffffff | rgba(255,255,255,0.08) |
| Tab/chip label inactive (→ Tabs/Chip spec) | --color-text-subtitle |  | #2a2a2a | rgba(255,255,255,0.60) |
| Search placeholder (→ Input spec) | --color-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Primary btn text (→ Button spec) | --color-text-negative |  | #ffffff | #ffffff |
| Secondary CTA text (→ Button spec) | --slide-out-btn-secondary-text |  | #2a2a2a | rgba(255,255,255,0.80) |
| Search/chip border (→ Input/Chip spec) | --color-border-neutral-default |  | #5c5c5c | rgba(255,255,255,0.10) |

## Additional data

Fields present in the source `_SPEC` object not covered by the sections above:

```json
{
  "componentName": "Slide Out",
  "nodeId": "5066:9783"
}
```

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
