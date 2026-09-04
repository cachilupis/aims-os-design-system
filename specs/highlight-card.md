# Highlight Card

**Figma node:** [`6399:21296`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=6399-21296)

Compact KPI metric card for dashboards. Displays a label, large numeric value, optional unit, optional trend feedback, and a contextual icon. 9 background styles × 2 states = 18 variants.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| Styte | Variant | Default,Primary BG,Green BG,Orange BG,Yellow BG,Purple BG,Light Blue BG,Lime Green BG,Red | "Default" | Controls card bg + HighlightIcon variant. Note: 'Styte' is a typo in Figma |
| State | Variant | Default,Disabled | "Default" | Disabled = opacity 40% + pointer-events none on the whole card |

## Sizes / scale

| Size | Dimensions | Padding | Radius | Gap |
| --- | --- | --- | --- | --- |
| Card | 236×auto | 16px | 12px | 8px between rows |
| Icon | 40×40px | 8px | 8px | HighlightIcon size L |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 14px | 500 Medium | auto |
| Value | Inter | 20px | 600 Semibold | none (leading-none) |
| Unit | Inter | 12px | 500 Medium | auto |
| Feedback | Inter | 12px | 500 Medium | auto |

## Variants / token groups

### Component Tokens — --hc-* family

All component-level tokens alias canonical DS semantic tokens. Used in highlight-card.tsx — zero hardcoded hex.

CSS prefix: `hc`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Card bg (default) | --hc-bg |  | #FFFFFF | #131C2E |
| Label text | --hc-text-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Value text | --hc-text-value |  | #000000 | rgba(255,255,255,0.80) |
| Unit text | --hc-text-unit |  | #2a2a2a | rgba(255,255,255,0.60) |
| Feedback text | --hc-text-feedback |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon fill | --hc-icon-fill |  | #001740 | #2B7FFF |
| Icon circle bg | --hc-icon-bg |  | #E9F1FF | rgba(33,115,255,0.15) |
| Card border | --color-border-neutral-lighter |  | #BABABA | rgba(255,255,255,0.08) |
| Positive feedback (defined, not wired up) | --color-text-success |  | #003328 | #6ee7b7 |
| Negative feedback (defined, not wired up) | --color-text-error |  | #5f2120 | #ff6467 |

### Style Variant BG + Border

9 background styles. Each colored variant has a semantic border token. Default uses neutral border; Primary uses primary border.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Default BG | --hc-bg |  | #FFFFFF | #131C2E |
| Default border | --color-border-neutral-lighter |  | #BABABA | rgba(255,255,255,0.08) |
| Primary BG | --color-surface-primary-subtle |  | #E9F1FF | rgba(33,115,255,0.15) |
| Primary border | --color-border-primary-default |  | #2173FF | #2B7FFF |
| Green BG | --color-surface-success-subtle |  | #CBFFF4 | rgba(0,169,127,0.15) |
| Green border | --color-border-success-default |  | #00A07E | #00A07E |
| Orange BG | --color-surface-alert-subtle |  | #FFEEDB | rgba(217,119,6,0.15) |
| Orange border | --color-border-alert-default |  | #ED6C02 | #ED6C02 |
| Yellow BG | --color-surface-yellow-subtle |  | #FFFAF0 | rgba(202,138,4,0.14) |
| Yellow border | --color-border-yellow-default |  | #ED6C02 | #ED6C02 |
| Purple BG | --color-surface-purple-subtle |  | #E4CEFC | rgba(124,58,237,0.14) |
| Purple border | --color-border-purple-default |  | #7B27ED | #7B27ED |
| Light Blue BG | --color-surface-light-blue-subtle |  | #CCF1FF | rgba(2,132,199,0.14) |
| Light Blue border | --color-border-light-blue-default |  | #00B5D9 | #00B5D9 |
| Lime BG | --color-surface-lime-subtle |  | #E7F9B5 | rgba(101,163,13,0.14) |
| Lime border | --color-border-lime-green-default |  | #A0DA1D | #A0DA1D |
| Red BG | --color-surface-error-subtle |  | #FDECED | rgba(220,38,38,0.14) |
| Red border | --color-border-error-default |  | #992222 | #992222 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
