# Chip

**Figma node:** [`5051:62271`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5051-62271)

Pill-shaped selection control for filtering and categorization. 11 color variants × 2 sizes × 4 states. The secondary chip always uses a white background in both dark and light mode for contrast against dark panels. Error/Alert/Success added 2026-07-28 (synced from Figma, added there 2026-07-23/24) — see the Alert Primary / Success Primary variant notes below for dark-mode-specific token decisions.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | ChipVariant | primary,secondary,purple-primary,purple-secondary,light-blue-primary,error-primary,error-secondary,alert-primary,alert-secondary,success-primary,success-secondary | secondary | Color variant. Primary = selected/active state. |
| size | ChipSize | m,s | m | m = 28px height, s = 20px height. Both use px-12px horizontal. |
| personIcon | boolean | true,false | false | Displays a User icon to the left of the label. |
| disabled | boolean | true,false | false | Disables interaction; muted background + text. |
| onClick | () => void | — | — | Click handler. Ignored when disabled. |

## Sizes / scale

| Size | Height | PaddingH | PaddingV | FontSize | LineHeight | Gap | Radius |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M | 28px | 12px | 4px | 14px | 20px | 4px | Radius-Full (100px) |
| S | 20px | 12px | 0px | 12px | 20px | 4px | Radius-Full (100px) |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Chip label M | Inter | 14px | 500 (Medium) | 20px |
| Chip label S | Inter | 12px | 500 (Medium) | 20px |

## Variants / token groups

### Primary

Active / selected state. Brand blue background with white text.

CSS prefix: `--color-surface-primary-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-primary-default |  | #2173ff | #2b7fff |
| BG hover | --color-surface-primary-darker |  | #001740 | #002f80 |
| BG disabled | --color-surface-primary-lighter |  | #80afff | rgba(43,127,255,0.40) |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Secondary

Unselected state. Always-white-ish background (dedicated --chip-secondary-* tokens, not shared with generic Surface/Neutral/White) with border and muted text.

CSS prefix: `--chip-secondary-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| BG hover | --chip-secondary-bg-hover |  | #f2f2f2 | rgba(255,255,255,0.15) |
| BG disabled | --chip-secondary-bg-disabled |  | #fafafa | rgba(255,255,255,0.05) |
| Text | --chip-secondary-text |  | #2a2a2a | rgba(255,255,255,0.60) |
| Text disabled | --chip-secondary-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-neutral-default |  | #5c5c5c | rgba(255,255,255,0.10) |
| Border disabled | --color-border-neutral-lighter |  | #bababa | rgba(255,255,255,0.15) |

### Purple Primary

Purple brand variant for categorical tagging. Same structure as Primary.

CSS prefix: `--color-surface-purple-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-purple-default |  | #7b27ed | #7b27ed |
| BG hover | --color-surface-purple-darker |  | #2c075c | #2c075c |
| BG disabled | --color-surface-purple-lighter |  | #cfa7f9 | rgba(123,39,237,0.40) |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Purple Secondary

White-ish chip (dedicated --chip-secondary-bg, reused) with purple border and purple text.

CSS prefix: `--color-border-purple-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default (reused) | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| BG hover | --color-surface-purple-more-subtle |  | #f3e9fd | rgba(139,92,246,0.12) |
| BG disabled (reused) | --chip-secondary-bg-disabled |  | #fafafa | rgba(255,255,255,0.05) |
| Text | --color-text-purple |  | #2c075c | #d8b4fe |
| Text disabled (reused) | --chip-secondary-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-purple-default |  | #7b27ed | #7b27ed |
| Border disabled | --color-border-purple-lighter |  | #cfa7f9 | rgba(123,39,237,0.30) |

### Light Blue Primary

Teal/cyan variant for informational or system-level filters.

CSS prefix: `--color-surface-light-blue-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-light-blue-default |  | #00b5d9 | #00b5d9 |
| BG hover | --color-surface-light-blue-darker |  | #02445a | #02445a |
| BG disabled | --color-surface-light-blue-lighter |  | #99e5f9 | rgba(0,181,217,0.40) |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Error Primary

Destructive / error-state variant. Same structure as Primary — red background, white text.

CSS prefix: `--color-surface-error-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-error-default |  | #992222 | #e05252 |
| BG hover | --color-surface-error-darker |  | #5f2120 | #ff6467 |
| BG disabled | --color-surface-error-lighter |  | #d32f2f | #fb2c36 |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Error Secondary

White-ish chip (dedicated --chip-secondary-bg, reused) with red border and red text.

CSS prefix: `--color-border-error-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default (reused) | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| BG hover | --color-surface-error-more-subtle |  | #fdeded | #2d1515 |
| BG disabled (reused) | --chip-secondary-bg-disabled |  | #fafafa | rgba(255,255,255,0.05) |
| Text | --color-text-error |  | #5f2120 | #ff6467 |
| Text disabled (reused) | --chip-secondary-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-error-lighter |  | #d32f2f | #fb2c36 |
| Border disabled (reused) | --color-border-neutral-lighter |  | #bababa | rgba(255,255,255,0.15) |

### Alert Primary

Warning-state variant. Orange background, white text. Default/Hover use a Figma-side "Chip-only" AA-safe token (Surface/Alert/Default-AA, Darker-AA): identical light value to the original Surface/Alert/Default DS token, but a different dark value (Orange/700, Orange/600 instead of the original's washed-out Dark/Alert/100 yellow, ~1.4:1 contrast). This token exists only for Chip — it does not affect any other component using the original Surface/Alert/Default token.

CSS prefix: `--color-surface-alert-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-alert-default |  | #ed6c02 | #8f4201 |
| BG hover | --color-surface-alert-darker |  | #663c00 | #b25102 |
| BG disabled | --color-surface-alert-lighter |  | #b25102 | rgba(253,199,0,0.15) |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Alert Secondary

White-ish chip (dedicated --chip-secondary-bg, reused) with orange border and orange text.

CSS prefix: `--color-border-alert-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default (reused) | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| BG hover | --color-surface-alert-more-subtle |  | #fff4e5 | #281e00 |
| BG disabled (reused) | --chip-secondary-bg-disabled |  | #fafafa | rgba(255,255,255,0.05) |
| Text | --color-text-alert |  | #663c00 | #fcd34d |
| Text disabled (reused) | --chip-secondary-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-alert-lighter |  | #b25102 | #f59e0b |
| Border disabled (reused) | --color-border-neutral-lighter |  | #bababa | rgba(255,255,255,0.15) |

### Success Primary

Success-state variant. Teal/green background, white text. Default/Hover use the Figma-side "Chip-only" AA-safe token (Surface/Success/Default-AA, Darker-AA) — same rationale as Alert Primary (Green/700, Green/600 instead of a washed-out dark-mode green). Disabled intentionally reuses the Default token rather than a "Lighter" tier: Success's dark ramp has no tier that's both darker (for contrast) and still visually reads as green — the only darker option is near-black. Documented limitation, not an oversight.

CSS prefix: `--color-surface-success-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-success-default |  | #00a07e | #00765f |
| BG hover | --color-surface-success-darker |  | #003328 | #009978 |
| BG disabled | --color-surface-success-default |  | #00a07e | #00765f |
| Text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |

### Success Secondary

White-ish chip (dedicated --chip-secondary-bg, reused) with teal/green border and teal/green text.

CSS prefix: `--color-border-success-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default (reused) | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| BG hover | --color-surface-success-more-subtle |  | #e5fdf8 | #0a1f1a |
| BG disabled (reused) | --chip-secondary-bg-disabled |  | #fafafa | rgba(255,255,255,0.05) |
| Text | --color-text-success |  | #003328 | #6ee7b7 |
| Text disabled (reused) | --chip-secondary-text-disabled |  | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-success-lighter |  | #009978 | #34d399 |
| Border disabled (reused) | --color-border-neutral-lighter |  | #bababa | rgba(255,255,255,0.15) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
