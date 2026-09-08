# Select

**Figma node:** [`14405:9600`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=14405-9600)

Non-editable trigger field that opens a Menu/Dropdown panel. Shares all visual tokens with Input (Text Field). Shows the selected value or placeholder text with a dynamic right icon.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| state | Variant | default,error,disabled | default | — |
| size | Variant | default (M=40px),sm (S=32px) | default | — |
| value | String | any string | undefined | When truthy → blue border + clear (×) icon |
| open | Boolean | true,false | false | When true → blue border + ChevronUp |
| placeholder | String | any string | Select an option | — |
| label | String | any string | undefined | Floats on the top border (same as Input) |
| supportingText | String | any string | undefined | — |
| leadingIcon | ReactNode | any icon | undefined | — |
| onClick | Function | () => void | undefined | — |
| onClear | Function | () => void | undefined | — |

## Sizes / scale

| Size | Height | FontSize | CornerRadius | PaddingX | PaddingY |
| --- | --- | --- | --- | --- | --- |
| M (default) | 40px | 14px | 8px | 12px | 4px |
| S (sm) | 32px | 14px | 8px | 12px | 4px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 12px | Semi Bold (600) | 1.5 |
| Value / Placeholder | Inter | 14px | Medium (500) | 1.5 |
| Supporting text | Inter | 12px | Medium (500) | 1.5 |

## States / token groups

### Base (all states)

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Label | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Leading icon | --field-icon |  | #bababa | rgba(255,255,255,0.30) |

### default

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Border hover | --color-border-neutral-black |  | #000000 | rgba(255,255,255,0.30) |
| Right icon (reused) | --field-icon |  | #bababa | rgba(255,255,255,0.30) |
| Placeholder text | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |

### selected

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | --field-border-focus |  | #2173ff | #2b7fff |
| Right icon (reused) | --field-border-focus |  | #2173ff | #2b7fff |
| Value text | --field-text |  | #2a2a2a | rgba(255,255,255,0.60) |

### open

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border (reused) | --field-border-focus |  | #2173ff | #2b7fff |
| Right icon (reused) | --field-border-focus |  | #2173ff | #2b7fff |

### error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | --field-border-error |  | #d32f2f | #fb2c36 |
| Right icon (reused) | --field-text-error |  | #5f2120 | #ff6467 |
| Supporting text | --field-text-error |  | #5f2120 | #ff6467 |

### disabled

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Label (reused) | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Opacity | — |  | 40% | 40% |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
