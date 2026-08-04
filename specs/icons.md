# Icons

**Figma:** [Design System file](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS)

Material Design icons (Figma DS) mapped to Lucide equivalents. Import from lucide-react. Default: size=16, strokeWidth=1.75. Semantic mapping documented in the Reference tab.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| library | String | lucide-react | lucide-react | import { IconName } from 'lucide-react' |
| size | Number | 12,14,16,18,20,24 | 16 | Match container context — nav=16, action=18, hero=24 |
| strokeWidth | Number | 1.5,1.75,2 | 1.75 | 1.75 is AIMS OS standard — do not use Lucide's default 2 |
| color | String | var(--foreground),var(--field-supporting),currentColor | currentColor | — |

## Sizes / scale

| Context | Size | StrokeWidth | Color |
| --- | --- | --- | --- |
| Navigation item | 16px | 1.75 | var(--foreground) |
| Button (sm) | 14px | 1.75 | currentColor |
| Button (md) | 16px | 1.75 | currentColor |
| Action / toolbar | 18px | 1.75 | var(--foreground) |
| Alert Banner icon | 20px | 1.75 | var(--ab-*-icon) |
| Highlight / hero | 24px | 1.5 | var(--foreground) |

## Variants / token groups

### Color tokens for icons

Use these semantic vars — never hardcode icon colors

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Default | --foreground | — | #1a1a1a | #f0f4ff |
| Muted | --field-supporting | — | #5c5c5c | rgba(255,255,255,0.5) |
| Brand | --brand | — | #2173ff | #4d8fff |
| Error | --ab-error-icon | — | #992222 | #ff6467 |
| Success | --ab-success-icon | — | #009978 | #6ee7b7 |
| Alert | --ab-alert-icon | — | #b45309 | #fcd34d |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
