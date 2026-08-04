# Empty State

**Figma node:** [`8419:24544`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8419-24544)

Zero-content placeholder for lists, tables, and views. Communicates absence and provides a clear next action. Anatomy: Icon Highlight → Title → Description → CTA buttons.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| showIcon | Boolean | true,false | true | Show/hide the Icon Highlight above the title |
| icon | LucideIcon | any Lucide icon | Inbox | Pass the icon component as a prop |
| title | String | any string | — | Required. Keep it short and direct |
| description | String | any string | — | Optional. Max ~440px wide, auto-wrapped |
| ctaLabel | String | any string | — | Primary action. Uses Button variant=primary |
| cta2Label | String | any string | — | Optional secondary action. Uses Button variant=secondary |
| className | String | Tailwind classes | — | Compact variant: className='py-[40px] rounded-none' |

## Sizes / scale

| Context | Padding | Radius | Gap |
| --- | --- | --- | --- |
| Default (standalone) | 64px / 24px | 16px (Radius-L) | 24px (Spacing/6x) |
| Compact (in Table) | 48px / 24px | none | 24px (Spacing/6x) |
| Compact (in Card) | 40px / 24px | none | 24px (Spacing/6x) |
| Icon container | 8px (all) | 8px (Radius-M) | — (40×40px total) |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 16px | 600 / SemiBold | 1.4 |
| Description | Inter | 14px | 500 / Medium | 20px |
| CTA label | Inter | 14px | 600 / SemiBold | 20px |

## Variants / token groups

### Icon Highlight

Rounded container behind the icon — Surface/Primary/More Subtle

CSS prefix: `--card-primary-bg / --primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon bg | --card-primary-bg | — | #f6f9ff | rgba(43,127,255,0.08) |
| Icon color | --primary | — | #2173ff | #2b7fff |

### Text

Title → Text/Title · Description → Text/Body

CSS prefix: `--foreground / --field-supporting`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title | --foreground | — | #1a1a1a | rgba(255,255,255,0.87) |
| Description | --field-supporting | — | #5c5c5c | rgba(255,255,255,0.60) |

### Primary CTA

Delegates to Button variant=primary — Surface/Primary/Default

CSS prefix: `--btn-primary-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --btn-primary-bg | — | #2173ff | #2b7fff |
| Text | — | — | #ffffff | #ffffff |

### Secondary CTA

Delegates to Button variant=secondary — Surface/Neutral/White

CSS prefix: `--btn-secondary-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --btn-secondary-bg | — | rgba(255,255,255,1) | rgba(255,255,255,0.10) |
| Border | --btn-secondary-border | — | rgba(0,0,0,0.10) | rgba(255,255,255,0.10) |
| Text | --btn-secondary-fg | — | #2a2a2a | rgba(255,255,255,0.60) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
