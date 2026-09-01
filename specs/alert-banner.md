# Alert Banner

**Figma node:** [`119:5867`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=119-5867)

Full-width contextual notice for system-level feedback. 3 semantic states — Error, Success, Alert — with optional CTA text button and dismiss (×) button.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| state | Variant | error,success,alert | error | Sets background, icon, and text tokens |
| title | Prop | string | required | 14px SemiBold — always required |
| description | Prop | string,undefined | undefined | 14px Medium, same state color as title |
| cta | Prop | string,undefined | undefined | CTA button label — shown when provided |
| onCta | Prop | () => void,undefined | undefined | CTA click handler |
| onClose | Prop | () => void,undefined | undefined | Renders dismiss × button when provided |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Container | 12px | 8px | 8px | Outer layout |
| Icon box | 4px | — | — | 28×28px · icon 20px |
| Title | — | 4px | — | below → Description |
| CTA button | 12×4px | 4px | 4px | text-only, no bg |
| Close button | 4px | — | 4px | 28×28px · icon 16px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 14px | SemiBold (600) | 1.43 |
| Description | Inter | 14px | Medium (500) | 20px |
| CTA label | Inter | 12px | Medium (500) | 20px |

## Variants / token groups

### Error

Connection failures · validation errors · destructive action failed

CSS prefix: `--ab-error-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-error-bg | — | #fdeded | #2d1515 |
| Border | --ab-error-bd | — | rgba(153,34,34,0.25) | transparent |
| Icon | --ab-error-icon | — | #992222 | #ff6467 |
| Text | --ab-error-text | — | #5f2120 | #ff6467 |

### Success

Completed saves · confirmed actions · successful API calls

CSS prefix: `--ab-success-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-success-bg | — | #e5fdf8 | #0a1f1a |
| Border | --ab-success-bd | — | rgba(0,153,120,0.25) | transparent |
| Icon | --ab-success-icon | — | #00a07e | #6ee7b7 |
| Text | --ab-success-text | — | #003328 | #6ee7b7 |

### Alert

Warnings · expiring sessions · actions requiring attention

CSS prefix: `--ab-alert-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --ab-alert-bg | — | #ffeedb | #2d1a08 |
| Border | --ab-alert-bd | — | rgba(180,83,9,0.25) | transparent |
| Icon | --ab-alert-icon | — | #b45309 | #fcd34d |
| Text | --ab-alert-text | — | #663c00 | #fcd34d |

### CTA + Close

Neutral Text/Label applied to the CTA and dismiss × across all states

CSS prefix: `--ab-cta-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Text | --ab-cta-text | — | rgba(0,0,0,0.55) | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
