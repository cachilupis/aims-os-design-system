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
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Default | 4465:4448 | #5c5c5c | #ffffff1a |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Input text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Supporting text | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |

### Hover

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Black | 4465:4583 | #000000 | #ffffff4d |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Supporting text | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |

### Focus

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Input text | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |
| Supporting text | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |

### Error

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Error/Lighter | 4465:4457 | #d32f2f | #fb2c36 |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |
| Supporting text | Text/Error | 4465:4473 | #5f2120 | #ff6467 |

### Success

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Success/Default | 4465:4464 | #00a07e | #00c9504d |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |
| Supporting text | Text/Success | 4465:4505 | #003328 | #6ee7b7 |

### Alert

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Alert/Default | 4465:4460 | #ed6c02 | #fbbf24 |
| Label text | Text/Subtitle | 4465:4468 | #2a2a2a | #ffffff99 |
| Placeholder | Text/Body | 4465:4469 | #5c5c5c | #ffffff99 |
| Supporting text | Text/Alert | 4465:4504 | #663c00 | #fcd34d |

### Disabled

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | #ffffff1a |
| Border | Border/Neutral/Lighter | 4465:4449 | #bababa | #ffffff26 |
| Label text | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Input text | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |
| Supporting text | Text/Disabled | 4465:4472 | #bababa | #ffffff4d |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
