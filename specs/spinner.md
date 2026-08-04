# Spinner

**Figma node:** [`7185:3933`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7185-3933)

Circular indeterminate loading indicator for operations where duration is unknown. A single arc rotates at 0.7s linear speed. Six semantic styles match DS surface token families. Five sizes (XS–XL) cover inline, button, and full-section contexts.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| style | SpinnerStyle | primary,success,alert,error,informative,bw | primary | Determines arc color and track color via --spinner-{style}-fill / --spinner-{style}-track tokens. |
| size | SpinnerSize | xs,s,m,l,xl | m | XS=12px, S=16px, M=24px, L=32px, XL=48px. Border width scales: 1.5/2/2.5/3/3.5px. |
| label | string | string | Loading… | Accessible label for screen readers via aria-label. |
| className | string | string | — | Extra Tailwind classes on the spinner div. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| XS | — | — | 50% | 12px · border 1.5px — inline text, tight button contexts |
| S | — | — | 50% | 16px · border 2px — small buttons, table cells |
| M | — | — | 50% | 24px · border 2.5px — default, standalone loaders |
| L | — | — | 50% | 32px · border 3px — card-level loading |
| XL | — | — | 50% | 48px · border 3.5px — full-section or page-level loading |

## Variants / token groups

### Primary

Blue — data fetch, page transitions, API calls

CSS prefix: `spinner-primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-primary-fill | Surface/Primary/Default | #2173ff | #2b7fff |
| Track | --spinner-primary-track | Surface/Primary/Subtle | #E9F1FF | rgba(33,115,255,0.15) |

### Success

Green — processing a confirmed-success operation

CSS prefix: `spinner-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-success-fill | Surface/Success/Default | #00a07e | #00a07e |
| Track | --spinner-success-track | Surface/Success/More Subtle | #e5fdf8 | rgba(110,231,183,0.10) |

### Alert

Orange — warning-level operation in progress

CSS prefix: `spinner-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-alert-fill | Surface/Alert/Default | #ed6c02 | #ed6c02 |
| Track | --spinner-alert-track | Surface/Alert/More Subtle | #FFF4E5 | rgba(217,119,6,0.08) |

### Error

Red — retrying a failed operation

CSS prefix: `spinner-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-error-fill | Surface/Error/Default | #e05252 | #e05252 |
| Track | --spinner-error-track | Surface/Error/More Subtle | #FEF5F5 | rgba(220,38,38,0.08) |

### Informative

Teal — neutral background operations (sync, indexing)

CSS prefix: `spinner-informative`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-informative-fill | Surface/LightBlue/Default | #00b5d9 | #00b5d9 |
| Track | --spinner-informative-track | Surface/LightBlue/Subtle | #E5F8FF | rgba(2,132,199,0.14) |

### B/W

Neutral — on colored or image backgrounds

CSS prefix: `spinner-bw`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Arc (fill) | --spinner-bw-fill | Icon/Neutral/Black (L) · White (D) | #2a2a2a | rgba(255,255,255,0.80) |
| Track | --spinner-bw-track | Neutral/Subtle | rgba(0,0,0,0.08) | rgba(255,255,255,0.10) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
