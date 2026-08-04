# Scroll Area

**Figma node:** [`4838:8343`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4838-8343)

Scrollable container with a DS-branded 4px custom scrollbar (Size S only). Thumb is hidden by default and appears on container hover. Always maintain 8px (Spacing/2x) between the scrollbar and the scrollable content. Supports vertical, horizontal, or both axes.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| children | ReactNode | ReactNode | required | Content to scroll. |
| axis | Variant | y,x,both | y | "y" = vertical · "x" = horizontal · "both" = 2D. |
| className | String | string | — | Add h-[N] for vertical scroll, pr-[8px] or pb-[8px] for gap. |
| style | Object | React.CSSProperties | — | Inline styles for the container div. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Scrollbar width | — | — | 100px | Fixed 4px — Size S only. M size deprecated. |
| Gap to content | 8px | — | — | Spacing/2x · apply pr-[8px] (vertical) or pb-[8px] (horizontal). |

## States / token groups

### Thumb · Default (hidden)

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Thumb | transparent |  | transparent | transparent |

### Thumb · Container hover

Border width: `4px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Thumb | Surface/Neutral/Emphasis |  | #d9d9d9 | rgba(255,255,255,0.20) |

### Thumb · Thumb hover

Border width: `4px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Thumb | Surface/Neutral/Focus |  | #bababa | rgba(255,255,255,0.32) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
