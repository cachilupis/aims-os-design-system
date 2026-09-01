# Text field

**Figma node:** [`4833:2316`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4833-2316)

Single-line input for short values: names, emails, search queries, codes. Use Text Description for longer free text.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| State | Variant | Default,Hover,Focus,Error,Success,Alert,Disabled | Default | — |
| Size | Variant | M,S | M | — |
| Label | Boolean | true,false | true | Label text above the field |
| Left icon | Boolean | true,false | false | Leading icon slot (16×16px) |
| Right Icon | Boolean | true,false | false | Trailing icon slot — auto-shows state indicator |
| Supporting text | Boolean | true,false | false | Helper / validation message below the field |
| Placeholder | Boolean | true,false | true | Placeholder text inside the field |
| Placeholder visible | Boolean | true,false | true | — |
| Caret | Boolean | true,false | false | Cursor indicator (shown in Focus state) |

## Sizes / scale

| Size | Height | InputFontSize | CornerRadius | PaddingX | IconGap |
| --- | --- | --- | --- | --- | --- |
| S | 32px | 14px | 8px | 12px | 10px |
| M | 40px | 14px | 8px | 12px | 10px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 12px | Semi Bold (600) | 1.5 |
| Input text | Inter | 14px | Medium (500) | 1.5 |
| Placeholder | Inter | 14px | Medium (500) | 1.5 |
| Supporting text | Inter | 12px | Medium (500) | 1.5 |

## States / token groups

### Default

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Label text | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Input text | --field-text |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon | --field-icon |  | #bababa | rgba(255,255,255,0.30) |
| Placeholder | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Supporting text | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |

### Hover

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --color-border-neutral-black |  | #000000 | rgba(255,255,255,0.30) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Placeholder (reused) | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Supporting text (reused) | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |

### Focus

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-focus |  | #2173ff | #2b7fff |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Input text (reused) | --field-text |  | #2a2a2a | rgba(255,255,255,0.60) |
| Supporting text (reused) | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |

### Error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-error |  | #d32f2f | #fb2c36 |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon | --field-text-error |  | #5f2120 | #ff6467 |
| Supporting text | --field-text-error |  | #5f2120 | #ff6467 |

### Success

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-success |  | #00a07e | rgba(0,201,80,0.3) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon | --field-text-success |  | #003328 | #6ee7b7 |
| Supporting text | --field-text-success |  | #003328 | #6ee7b7 |

### Alert

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-alert |  | #ed6c02 | #fbbf24 |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon | --field-text-alert |  | #663c00 | #fcd34d |
| Supporting text | --field-text-alert |  | #663c00 | #fcd34d |

### Disabled

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border (reused) | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Supporting text (reused) | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |
| Opacity | — |  | 40% | 40% |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
