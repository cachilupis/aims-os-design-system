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
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Default | 4465:4448 | #5c5c5c | #ffffff1a |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Char count | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |
| Supporting text | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |

### Hover

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Darker | 4465:4450 | #2a2a2a | #ffffff33 |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |

### Focus

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Char count | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |

### Error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Error/Lighter | 4465:4457 | #d32f2f | #fb2c36 |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Supporting text | Text/Error | 4465:4473 | #5f2120 | #ff6467 |
| Char count | Text/Error | 4465:4473 | #5f2120 | #ff6467 |

### Success

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Success/Default | 4465:4464 | #00a07e | #00c9504d |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Supporting text | Text/Success | 4465:4505 | #003328 | #6ee7b7 |
| Char count | Text/Success | 4465:4505 | #003328 | #6ee7b7 |

### Alert

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Alert/Default | 4465:4460 | #ed6c02 | #fbbf24 |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Supporting text | Text/Alert | 4465:4504 | #663c00 | #fcd34d |
| Char count | Text/Alert | 4465:4504 | #663c00 | #fcd34d |

### Disabled

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Lighter | 4465:4449 | #bababa | #ffffff26 |
| Label text | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Char count | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Supporting text | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
