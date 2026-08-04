# Progress Bar

**Figma node:** [`7091:37109`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7091-37109)

Linear determinate loading bar that communicates known progress. Full-width track with a filled indicator that animates as value changes. 7 semantic styles, 2 track sizes, and full ARIA progressbar semantics.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| value | number | 0–100 | required | Current progress percentage. Clamped to [0, 100] automatically. |
| style | ProgressBarStyle | primary,success,alert,error,yellow,light-blue,purple | primary | Determines fill and track colors via Surface/* DS tokens. |
| size | ProgressBarSize | s,m | m | S = 4px track height. M = 8px. Use S for compact contexts (tables, cards). |
| label | string | string | Loading | Accessible label for screen readers via aria-label. |
| className | string | string | — | Extra classes applied to the track container. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Track S | — | — | 2px | 4px height · Surface/Primary/Subtle BG |
| Track M | — | — | 2px | 8px height · same track token · wider visual prominence |
| Fill bar | — | — | 2px | Width = value% · inherits full track height · animated via transition-[width] 300ms |

## Variants / token groups

### Primary

Blue — data fetch, page transitions

CSS prefix: `pb-primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-primary-subtle | Surface/Primary/Subtle | #E9F1FF | rgba(33,115,255,0.15) |
| Fill | --color-surface-primary-default | Surface/Primary/Default | #2173ff | #2b7fff |

### Success

Green — successful operations

CSS prefix: `pb-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-success-more-subtle | Surface/Success/More Subtle | #e5fdf8 | rgba(110,231,183,0.10) |
| Fill | --color-surface-success-default | Surface/Success/Default | #00a07e | #00a07e |

### Alert

Orange — warning-level progress

CSS prefix: `pb-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-alert-more-subtle | Surface/Alert/More Subtle | #FFF4E5 | rgba(217,119,6,0.08) |
| Fill | --color-surface-alert-default | Surface/Alert/Default | #ed6c02 | #ed6c02 |

### Error

Red — failed or critical operations

CSS prefix: `pb-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-error-more-subtle | Surface/Error/More Subtle | #FEF5F5 | rgba(220,38,38,0.08) |
| Fill | --color-surface-error-default | Surface/Error/Default | #e05252 | #e05252 |

### Yellow

Amber — attention-required progress

CSS prefix: `pb-yellow`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-yellow-more-subtle | Surface/Yellow/More Subtle | #FFFAF0 | rgba(202,138,4,0.08) |
| Fill | --color-surface-yellow-default | Surface/Yellow/Default | #f59e0b | #f59e0b |

### Light Blue

Teal — informative / neutral progress

CSS prefix: `pb-lightblue`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-light-blue-subtle | Surface/Light Blue/Subtle | #CCF1FF | rgba(2,132,199,0.14) |
| Fill | --color-surface-light-blue-default | Surface/Light Blue/Default | #00b5d9 | #00b5d9 |

### Purple

Violet — creative / AI contexts

CSS prefix: `pb-purple`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track | --color-surface-purple-subtle | Surface/Purple/Subtle | #E4CEFC | rgba(124,58,237,0.14) |
| Fill | --color-surface-purple-default | Surface/Purple/Default | #7b27ed | #7b27ed |

### Layout

Track and fill share 2px border-radius

CSS prefix: `pb-layout`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Radius | --pb-radius | Radius/Radius-XS | 2px | 2px |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
