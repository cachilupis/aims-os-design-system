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

### default

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | Border/Neutral/Default |  | #5c5c5c | rgba(255,255,255,0.10) |
| Background | Surface/Neutral/White |  | #ffffff | rgba(255,255,255,0.10) |
| Right icon | ChevronDown |  | – | – |

### selected

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | Border/Primary/Default |  | #2173ff | #2b7fff |
| Right icon | X (clear) |  | – | – |

### open

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | Border/Primary/Default |  | #2173ff | #2b7fff |
| Right icon | ChevronUp |  | – | – |

### error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Border | Border/Error/Default |  | #d32f2f | #fb2c36 |
| Right icon | CircleAlert |  | – | – |
| Supporting | Text/Error |  | #5f2120 | #ff6467 |

### disabled

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| All text + icons | Text/Disabled |  | #bababa | rgba(255,255,255,0.30) |
| Opacity | – |  | 40% | 40% |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
