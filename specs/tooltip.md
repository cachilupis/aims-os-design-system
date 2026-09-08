# Tooltip

**Figma node:** [`4614:5319`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4614-5319)

Small informational overlay that appears on hover or focus. Always dark (Surface/Neutral/Darker) regardless of light/dark mode — inverted style. Two variants: plain (no arrow) and with directional arrow pointer. Max recommended width: 300px.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| content | String | string | required | Tooltip text. Keep to 1–3 lines max (300px wide). |
| arrow | Boolean | false,true | false | Show directional arrow pointer toward trigger element. |
| side | Variant | top,right,bottom,left | top | Which side of the trigger the tooltip appears on. |
| children | ReactNode | ReactNode | required | Trigger element — typically a button or icon. |
| className | String | string | — | Extra classes on the tooltip bubble. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Border radius | — | — | 4px | rounded · 4px fixed |
| Padding H | 12px | — | — | px-3 · Spacing/3x |
| Padding V | 8px | — | — | py-2 · Spacing/2x |
| Max width | — | — | — | 300px — use ellipsis if content would exceed 2 lines |
| Trigger gap | — | 8px | — | mb-2 / mt-2 / mr-2 / ml-2 · 8px between trigger and bubble |

## States / token groups

### Container

Border width: `0px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tooltip-bg |  | #111827 | #111827 |
| Text color | --tooltip-text |  | #ffffff | #ffffff |
| Arrow fill (reused) | --tooltip-bg |  | #111827 | #111827 |

### Typography

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Font size | text-sm | — | 14px | 14px |
| Font weight | font-medium | — | 500 | 500 |
| Line height | leading-5 | — | 20px | 20px |
| Text color (reused) | --tooltip-text | — | #ffffff | #ffffff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
