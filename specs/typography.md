# Typography

**Figma:** [Design System file](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS)

Inter-based type scale. All styles defined as Tailwind classes (text-type-*) in tailwind.config.js. Never use arbitrary font sizes — pick the nearest scale step.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| family | String | Inter | Inter | Loaded via Google Fonts. No substitutes. |
| category | Variant | Display,Heading,Body,Caption,Label,Code | Body | — |
| weight | Variant | 400 Regular,500 Medium,600 SemiBold,700 Bold,800 ExtraBold | 500 Medium | — |

## Sizes / scale

| Style | Size | Weight | LineHeight | Tailwind |
| --- | --- | --- | --- | --- |
| Display XL | 48px | 800 | 1.1 | text-type-display-xl |
| Display LG | 36px | 800 | 1.1 | text-type-display-lg |
| Display MD | 30px | 700 | 1.2 | text-type-display-md |
| Heading LG | 24px | 600 | 1.3 | text-type-heading-lg |
| Heading MD | 20px | 600 | 1.35 | text-type-heading-md |
| Heading SM | 16px | 600 | 1.4 | text-type-heading-sm |
| Body LG | 16px | 400 | 1.5 | text-type-body-lg |
| Body MD | 14px | 400 | 1.5 | text-type-body-md |
| Body SM | 13px | 400 | 1.5 | text-type-body-sm |
| Caption | 12px | 400 | 1.5 | text-type-caption |
| Label | 11px | 500 | 1.4 | text-type-label |
| Code | 12px | 400 | 1.6 | font-mono |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Display XL | Inter | 48px | 800 / ExtraBold | 1.1 |
| Display LG | Inter | 36px | 800 / ExtraBold | 1.1 |
| Display MD | Inter | 30px | 700 / Bold | 1.2 |
| Heading LG | Inter | 24px | 600 / SemiBold | 1.3 |
| Heading MD | Inter | 20px | 600 / SemiBold | 1.35 |
| Heading SM | Inter | 16px | 600 / SemiBold | 1.4 |
| Body LG | Inter | 16px | 400 / Regular | 1.5 |
| Body MD | Inter | 14px | 400 / Regular | 1.5 |
| Body SM | Inter | 13px | 400 / Regular | 1.5 |
| Caption | Inter | 12px | 400 / Regular | 1.5 |
| Label | Inter | 11px | 500 / Medium | 1.4 |
| Code | monospace | 12px | 400 / Regular | 1.6 |

## Variants / token groups

### Color tokens for text

Semantic vars to use for text depending on context

CSS prefix: `--foreground / --field-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Primary | --foreground | — | #1a1a1a | #f0f4ff |
| Label | --field-label | — | #3d3d3d | rgba(255,255,255,0.87) |
| Supporting | --field-supporting | — | #5c5c5c | rgba(255,255,255,0.5) |
| Placeholder | --field-placeholder | — | rgba(0,0,0,0.35) | rgba(255,255,255,0.25) |
| Brand accent | --brand | — | #2173ff | #4d8fff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
