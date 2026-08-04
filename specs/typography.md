# Typography

**Figma node:** [`4471:6680`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4471-6680)

Inter-based type scale, verified live against Figma's "DESIGN TOKENS — NEW TYPE SYSTEM" table (2026-08-04). Uses Tailwind's native text-* classes directly — no custom text-type-* scale. Figma's own guideline: only use weights 500 (Medium), 600 (SemiBold), and 900 (Black); minimum text size is 12px (text-xs).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| family | String | Inter | Inter | Loaded via Google Fonts. No substitutes. |
| category | Variant | Display,Title,Subtitle,Body,Label,Caption,Link | Body | — |
| weight | Variant | 500 Medium,600 SemiBold,900 Black | 500 Medium | Figma explicitly disallows 700/800 — do not use font-bold or font-extrabold |

## Sizes / scale

| Style | Size | Weight | LineHeight | Tailwind |
| --- | --- | --- | --- | --- |
| Display XL | 48px | 900 | 100% | text-5xl font-black |
| Display L | 40px | 900 | 100% | text-4xl font-black |
| Display M | 32px | 900 | 100% | text-3xl font-black |
| Title L | 24px | 600 | 100% | text-2xl font-semibold |
| Title M | 20px | 600 | 100% | text-xl font-semibold |
| Title S | 18px | 600 | 100% | text-lg font-semibold |
| Subtitle M | 16px | 600 | 100% | text-base font-semibold |
| Subtitle S | 14px | 600 | 100% | text-sm font-semibold |
| Body L | 16px | 500 | 24px | text-base font-medium leading-6 |
| Body M | 14px | 500 | 20px | text-sm font-medium leading-5 |
| Body S | 12px | 500 | 20px | text-xs font-medium leading-5 |
| Label M | 14px | 600 | 100% | text-sm font-semibold |
| Caption S Bold | 12px | 600 | 100% | text-xs font-semibold tracking-wide |
| Caption S Regular | 12px | 500 | 100% | text-xs font-medium |
| Code | 12px | 500 | 1.6 | font-mono text-xs |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Display XL | Inter | 48px | 900 / Black | 100% |
| Display L | Inter | 40px | 900 / Black | 100% |
| Display M | Inter | 32px | 900 / Black | 100% |
| Title L | Inter | 24px | 600 / SemiBold | 100% |
| Title M | Inter | 20px | 600 / SemiBold | 100% |
| Title S | Inter | 18px | 600 / SemiBold | 100% |
| Subtitle M | Inter | 16px | 600 / SemiBold | 100% |
| Subtitle S | Inter | 14px | 600 / SemiBold | 100% |
| Body L | Inter | 16px | 500 / Medium | 24px |
| Body M | Inter | 14px | 500 / Medium | 20px |
| Body S | Inter | 12px | 500 / Medium | 20px |
| Label M | Inter | 14px | 600 / SemiBold | 100% |
| Caption | Inter | 12px | 500-600 / Medium-SemiBold | 100% |
| Code | monospace | 12px | 500 / Medium | 1.6 |

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
