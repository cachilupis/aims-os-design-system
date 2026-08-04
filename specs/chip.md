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
| M | 28px | 12px | 4px | 14px | 20px | 4px | Radius-Full (999px) |
| S | 20px | 12px | 0px | 12px | 20px | 4px | Radius-Full (999px) |

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
| BG default | --color-surface-primary-default | Surface/Primary/Default | #2173ff | #2b7fff |
| BG hover | --color-surface-primary-darker | Surface/Primary/Darker | #001740 | #001740 |
| BG disabled | --color-surface-primary-lighter | Surface/Primary/Lighter | #80afff | #80afff |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |
| Text disabled | --color-button-primary-text-disabled | Button/Primary/Text/Disabled | #f2f2f2 | rgba(255,255,255,0.30) |

### Secondary

Unselected state. Always-white background with border and muted text.

CSS prefix: `--color-surface-neutral-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-neutral-white | Surface/Neutral/White | #ffffff | #ffffff |
| BG hover | --chip-secondary-bg-hover | — | #f2f2f2 | #f2f2f2 |
| BG disabled | --chip-secondary-bg-disabled | Surface/Neutral/Subtle | #fafafa | #fafafa |
| Text | --chip-secondary-text | Text/Subtitle (on white) | #8c8c8c | #5c5c5c |
| Text disabled | --color-text-disabled | Text/Disabled | #bababa | rgba(255,255,255,0.30) |
| Border | --color-border-neutral-default | Border/Neutral/Default | #5c5c5c | rgba(255,255,255,0.10) |

### Purple Primary

Purple brand variant for categorical tagging. Same structure as Primary.

CSS prefix: `--color-surface-purple-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-purple-default | Surface/Purple/Default | #7b27ed | #7b27ed |
| BG hover | --color-surface-purple-darker | Surface/Purple/Darker | #2c075c | #2c075c |
| BG disabled | --color-surface-purple-lighter | Surface/Purple/Lighter | #cfa7f9 | #cfa7f9 |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |

### Purple Secondary

White chip with purple border and purple text. Used for purple categorical labels.

CSS prefix: `--color-border-purple-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-neutral-white | Surface/Neutral/White | #ffffff | #ffffff |
| BG hover | --color-surface-purple-more-subtle | Surface/Purple/More Subtle | #f3e9fd | rgba(139,92,246,0.12) |
| Text | --color-text-purple | Text/Purple | #2c075c | #2c075c |
| Border | --color-border-purple-default | Border/Purple/Default | #7b27ed | #7b27ed |
| Border focus | --color-border-purple-lighter | Border/Purple/Lighter | #cfa7f9 | #cfa7f9 |

### Light Blue Primary

Teal/cyan variant for informational or system-level filters.

CSS prefix: `--color-surface-light-blue-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-light-blue-default | Surface/LightBlue/Default | #00b5d9 | #00b5d9 |
| BG hover | --color-surface-light-blue-darker | Surface/LightBlue/Darker | #02445a | #02445a |
| BG disabled | --color-surface-light-blue-lighter | Surface/LightBlue/Lighter | #99e5f9 | #99e5f9 |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |

### Error Primary

Destructive / error-state variant. Same structure as Primary — red background, white text.

CSS prefix: `--color-surface-error-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-error-default | Surface/Error/Default | #992222 | #e05252 |
| BG hover | --color-surface-error-darker | Surface/Error/Darker | #5f2120 | #ff6467 |
| BG disabled | --color-surface-error-lighter | Surface/Error/Lighter | #d32f2f | #fb2c36 |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |

### Error Secondary

White chip with red border and red text.

CSS prefix: `--color-border-error-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-neutral-white | Surface/Neutral/White | #ffffff | #ffffff |
| BG hover | --color-surface-error-more-subtle | Surface/Error/More Subtle | #fdeded | #2d1515 |
| Text | --color-text-error | Text/Error | #5f2120 | #ff6467 |
| Border | --color-border-error-lighter | Border/Error/Lighter | #d32f2f | #fb2c36 |

### Alert Primary

Warning-state variant. Orange background, white text. Default/Hover use a Figma-side "Chip-only" AA-safe token (Surface/Alert/Default-AA, Darker-AA): identical light value to the original Surface/Alert/Default DS token, but a different dark value (Orange/700, Orange/600 instead of the original's washed-out Dark/Alert/100 yellow, ~1.4:1 contrast). This token exists only for Chip — it does not affect any other component using the original Surface/Alert/Default token.

CSS prefix: `--color-surface-alert-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-alert-default | Surface/Alert/Default-AA | #ed6c02 | #8f4201 |
| BG hover | --color-surface-alert-darker | Surface/Alert/Darker-AA | #663c00 | #b25102 |
| BG disabled | --color-surface-alert-lighter | Surface/Alert/Lighter | #b25102 | rgba(253,199,0,0.15) |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |

### Alert Secondary

White chip with orange border and orange text.

CSS prefix: `--color-border-alert-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-neutral-white | Surface/Neutral/White | #ffffff | #ffffff |
| BG hover | --color-surface-alert-more-subtle | Surface/Alert/More Subtle | #fff4e5 | #281e00 |
| Text | --color-text-alert | Text/Alert | #663c00 | #fcd34d |
| Border | --color-border-alert-lighter | Border/Alert/Lighter | #b25102 | #f59e0b |

### Success Primary

Success-state variant. Teal/green background, white text. Default/Hover use the Figma-side "Chip-only" AA-safe token (Surface/Success/Default-AA, Darker-AA) — same rationale as Alert Primary (Green/700, Green/600 instead of a washed-out dark-mode green). Disabled intentionally reuses the Default token rather than a "Lighter" tier: Success's dark ramp has no tier that's both darker (for contrast) and still visually reads as green — the only darker option is near-black. Documented limitation, not an oversight.

CSS prefix: `--color-surface-success-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-success-default | Surface/Success/Default-AA | #00a07e | #00765f |
| BG hover | --color-surface-success-darker | Surface/Success/Darker-AA | #003328 | #009978 |
| BG disabled | --color-surface-success-default | Surface/Success/Default-AA (reused) | #00a07e | #00765f |
| Text | --color-button-primary-text-default | Button/Primary/Text/Default | #ffffff | #ffffff |

### Success Secondary

White chip with teal/green border and teal/green text.

CSS prefix: `--color-border-success-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG default | --color-surface-neutral-white | Surface/Neutral/White | #ffffff | #ffffff |
| BG hover | --color-surface-success-more-subtle | Surface/Success/More Subtle | #e5fdf8 | #0a1f1a |
| Text | --color-text-success | Text/Success | #003328 | #6ee7b7 |
| Border | --color-border-success-lighter | Border/Success/Lighter | #009978 | #34d399 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
