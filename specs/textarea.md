# Text Description

**Figma node:** [`5084:2494`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5084-2494)

Multi-line field for free text: paragraphs, descriptions, notes, prompts, JSON payloads. Use when the expected input is longer than one sentence.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| State | Variant | Default,Hover,Focus,Error,Success,Alert,Disabled | Default | — |
| Label | Boolean | true,false | true | Label text above the field |
| Feedback Characters | Boolean | true,false | true | Character count shown as 'current/max' |
| ScrollBar | Boolean | true,false | true | Scrollbar shown when content overflows the fixed height |
| Expand Content | Boolean | true,false | false | When true, the field auto-grows with content (no fixed height) |
| Placeholder | Boolean | true,false | true | Placeholder text (shown as 'Placeholder...') |
| Caret | Boolean | true,false | false | Cursor indicator (shown in Focus state) |

## Sizes / scale

| Size | Height | InputFontSize | CornerRadius | PaddingX | PaddingY | Gap | OuterGap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Default | 148px (textarea area) | 14px | 8px | 16px | 12px | 10px (inner) | 4px (between label/field/feedback) |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 12px | Semi Bold (600) | 1.5 |
| Input text | Inter | 14px | Medium (500) | 1.5 |
| Placeholder | Inter | 14px | Medium (500) | 1.5 |
| Char count | Inter | 12px | Medium (500) | 1.5 |
| Supporting text | Inter | 12px | Medium (500) | 1.5 |

## States / token groups

### Default

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Label text | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Placeholder | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Trailing icon | --field-icon |  | #bababa | rgba(255,255,255,0.30) |
| Expand-content icon | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |
| Char count | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |
| Supporting text | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |

### Hover

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-hover |  | #2a2a2a | rgba(255,255,255,0.20) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Placeholder (reused) | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |

### Focus

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-focus |  | #2173ff | #2b7fff |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Char count (reused) | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |

### Error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-error |  | #d32f2f | #fb2c36 |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Placeholder (reused) | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Supporting text | --field-text-error |  | #5f2120 | #ff6467 |
| Char count | --field-text-error |  | #5f2120 | #ff6467 |

### Success

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-success |  | #00a07e | rgba(0,201,80,0.3) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Supporting text | --field-text-success |  | #003328 | #6ee7b7 |
| Char count | --field-text-success |  | #003328 | #6ee7b7 |

### Alert

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border-alert |  | #ed6c02 | #fbbf24 |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Supporting text | --field-text-alert |  | #663c00 | #fcd34d |
| Char count | --field-text-alert |  | #663c00 | #fcd34d |

### Disabled

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background (reused) | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border (reused) | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Label text (reused) | --field-label |  | #2a2a2a | rgba(255,255,255,0.60) |
| Placeholder (reused) | --field-placeholder |  | #bababa | rgba(255,255,255,0.30) |
| Char count (reused) | --field-supporting |  | #5c5c5c | rgba(255,255,255,0.60) |
| Opacity | — |  | 40% | 40% |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
