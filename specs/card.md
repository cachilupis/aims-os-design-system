# Card Container

**Figma node:** [`5388:23473`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5388-23473)

Semantic container for grouping related content. 11 color styles communicate intent at a glance — neutral, primary, status, or categorical. Use S for compact metadata, M for general content, L for featured sections.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| Style | Variant | Default,White Opacity,Primary,Green,Reed,Orange,Yellow,Purple,Light Blue,Lime Green,Dashed | Default | — |
| Size | Variant | S,M,L | M | — |
| Selected | Boolean | true,false | false | Border width increases to 1px and color shifts to selected token. Use for card-based selection UI (radio cards, choice sets) |
| Disabled | Boolean | true,false | false | Reduces opacity to 40% and blocks pointer events |

## Sizes / scale

| Size | Padding | CornerRadius | Stroke |
| --- | --- | --- | --- |
| S | 12px all sides | 8px | 0.5px inside |
| M | 16px H / 24px V | 8px | 0.5px inside |
| L | 24px all sides | 16px | 0.5px inside |

## States / token groups

### Default

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | 4465:4591 | #ffffff | rgba(255,255,255,0.1) |
| Border | Border/Neutral/Lighter | 4465:4449 | #bababa | rgba(255,255,255,0.15) |
| Border hover | Border/Neutral/Default | 4465:4448 | #5c5c5c | rgba(255,255,255,0.1) |
| Border selected | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |

### Primary

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Primary/More Subtle | 4465:4597 | #f6f9ff | rgba(43,127,255,0.08) |
| Border | Border/Primary/Lighter | 4465:4453 | #80afff | rgba(43,127,255,0.1) |
| Border hover | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |
| Border selected | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |

### Green

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Success/More Subtle | 4465:4598 | #e5fdf8 | #0a1f1a |
| Border | Border/Success/Default | 4465:4464 | #00a07e | rgba(0,201,80,0.3) |
| Border hover | Border/Success/Lighter | 4465:4465 | #009978 | #34d399 |
| Border selected | Border/Success/Default | 4465:4464 | #00a07e | rgba(0,201,80,0.3) |

### Reed

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Card/Reed BG/Stop0 |  | #fdeded | rgba(251,44,54,0.1) |
| Border | Border/Error/Lighter | 4465:4457 | #d32f2f | #fb2c36 |
| Border hover | Border/Error/Lighter | 4465:4457 | #d32f2f | #fb2c36 |
| Border selected | Border/Error/Lighter | 4465:4457 | #d32f2f | #fb2c36 |

### Orange

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Alert/More Subtle | 4465:4599 | #fff4e5 | #281e00 |
| Border | Border/Alert/Subtle | 4465:4461 | #edc6a6 | #2d1a08 |
| Border hover | Border/Alert/Lighter | 4465:4462 | #b25102 | #f59e0b |
| Border selected | Border/Alert/Default | 4465:4460 | #ed6c02 | #fbbf24 |

### Yellow

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Yellow/More Subtle |  | #fffaf0 | #281e00 |
| Border | Border/Yellow/Lighter |  | #edc6a6 | #f59e0b |
| Border hover | Border/Yellow/Default |  | #ed6c02 | #fbbf24 |
| Border selected | Border/Yellow/Darker |  | #663c00 | #fcd34d |

### Purple

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Purple/More Subtle |  | #f3e9fd | #120520 |
| Border | Border/Purple/Lighter |  | #cfa7f9 | rgba(173,70,255,0.2) |
| Border hover | Border/Purple/Default |  | #7b27ed | #a855f7 |
| Border selected | Border/Purple/Darker |  | #2c075c | #d8b4fe |

### Light Blue

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Light Blue/More Subtle |  | #e5f8ff | #071828 |
| Border | Border/Light Blue/Lighter |  | #99e5f9 | rgba(81,162,255,0.2) |
| Border hover | Border/Light Blue/Default |  | #00b5d9 | #38bdf8 |
| Border selected | Border/Light Blue/Darker |  | #02445a | #7dd3fc |

### Lime Green

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Lime Green/More Subtle |  | #f9fee5 | #111a04 |
| Border | Border/LimeGreen/Lighter |  | #d4f381 | rgba(189,238,73,0.2) |
| Border hover | Border/LimeGreen/Default |  | #a0da1d | #84cc16 |
| Border selected | Border/LimeGreen/Darker |  | #3e5c0a | #bdee49 |

### Dashed

Border width: `0.5px dashed`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | — |  | transparent | transparent |
| Border | Border/Neutral/Lighter | 4465:4449 | #bababa | rgba(255,255,255,0.15) |
| Border hover | Border/Neutral/Default | 4465:4448 | #5c5c5c | rgba(255,255,255,0.1) |
| Border selected | Border/Primary/Default | 4465:4452 | #2173ff | #2b7fff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
