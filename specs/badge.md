# Badge

**Figma node:** [`13072:7066`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=13072-7066)

A compact 8×8px filled circle used as an inline status indicator. Contains no text or icon — meaning is conveyed entirely by color. Purpose-built for dense interfaces such as tables, lists, and data visualizations. Each badge maps directly to a Badge/* semantic token, keeping it consistent across light and dark themes.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | BadgeVariant | error,alert,inProgress,success,neutral,lightBlue,limeGreen,yellow,purple | neutral | — |
| label | string | any string | undefined | Accessible label — sets role="status" + aria-label. The dot alone conveys nothing to screen readers. |

## Sizes / scale

| Size | Height | PaddingX | PaddingY | FontSize | Gap | Radius |
| --- | --- | --- | --- | --- | --- | --- |
| Default | 8px | — | — | — | — | Full (4px = 50%) |

## Variants / token groups

### error

Error / Notification — alerts needing immediate attention

CSS prefix: `badge-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Error | — | #d32f2f | #ff6467 |

### alert

Alert — pending, needs attention

CSS prefix: `badge-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Alert | — | #ed6c02 | #fdc700 |

### inProgress

In Progress — async/loading row-level indicators

CSS prefix: `badge-in-progress`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/In Progress | — | #2173ff | #2b7fff |

### success

Success — completed, verified, healthy

CSS prefix: `badge-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Success | — | #00765f | #05df72 |

### neutral

Neutral — inactive or unknown status

CSS prefix: `badge-neutral`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Neutral | — | #bababa | rgba(255,255,255,0.50) |

### lightBlue

Extended palette — taxonomy / category classification

CSS prefix: `badge-light-blue`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Light Blue | — | #00b5d9 | #51a2ff |

### limeGreen

Extended palette — taxonomy / category classification

CSS prefix: `badge-lime-green`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Lime Green | — | #a0da1d | #bdee49 |

### yellow

Extended palette — taxonomy / category classification

CSS prefix: `badge-yellow`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Yellow | — | #ff9900 | #fdc700 |

### purple

Extended palette — taxonomy / category classification

CSS prefix: `badge-purple`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Fill | Badge/Purple | — | #7b27ed | #ad46ff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
