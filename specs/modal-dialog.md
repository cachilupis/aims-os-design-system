# Modal Dialog

**Figma node:** [`13753:29038`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=13753-29038)

Focused overlay for confirmations and structured content. Fixed scrim + blur backdrop. Two layout variants × 5 semantic tones × independent icon and card state overrides.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | Variant | confirmation,content | "confirmation" | Confirmation = centered column; Content = left-aligned row |
| tone | Variant | default,warning,error,alert,success | "default" | Sets iconVariant + infoCardState together; both can be overridden |
| showIcon | Boolean | true,false | true | — |
| iconName | string | Lucide icon name | "Info" | Any Lucide icon name — e.g. Sparkles, Trash2, Shield |
| iconVariant | Variant | informative,success,alert,error,neutral,yellow,lime,purple,light-blue | from tone | Overrides tone for the HighlightIcon |
| title | string | any string | undefined | — |
| description | string | any string | undefined | — |
| slot | ReactNode | any | undefined | Custom content rendered in rounded slot container |
| informativeCard | string|boolean | string,true,false | undefined | true = default text; string = custom title for InformativeCard |
| infoCardState | Variant | informative,alert,error,success,neutral | from tone | Overrides tone for the InformativeCard |
| ctaPrimary | object | { label, destructive?, onClick? } | undefined | — |
| ctaSecondary | object | { label, onClick? } | undefined | — |
| showClose | Boolean | true,false | true | — |
| embedded | Boolean | true,false | false | Renders inline without overlay — used in docs previews |

## Sizes / scale

| Variant | MaxWidth | Padding | Layout | Notes |
| --- | --- | --- | --- | --- |
| Confirmation | 900px | 24px | flex-col centered | Icon + title + desc centered; CTAs centered |
| Content | 900px | 32px | flex-col left-aligned | Icon + title inline row; CTAs right-aligned |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 20px | Semi Bold (600) | 1.2 |
| Description | Inter | 14px | Regular (400) | 1.6 |

## Variants / token groups

### Confirmation

max-w-[900px] · p-[24px] · centered column layout

CSS prefix: `--modal`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Surface | Surface/Modal |  | rgba(255,255,255,0.96) | rgba(18,20,30,0.96) |
| Border | Border/Modal |  | #BABABA | rgba(255,255,255,0.15) |
| Scrim | Overlay/Scrim |  | rgba(0,0,0,0.40) | rgba(0,0,0,0.60) |
| Slot bg | Surface/Modal/Slot |  | #F5F6FA | rgba(255,255,255,0.05) |
| Close icon | Icon/Neutral/Default |  | #5C5C5C | rgba(255,255,255,0.50) |

### Content

max-w-[900px] · p-[32px] · left-aligned row layout

CSS prefix: `--modal`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Surface | Surface/Modal |  | rgba(255,255,255,0.96) | rgba(18,20,30,0.96) |
| Border | Border/Modal |  | #BABABA | rgba(255,255,255,0.15) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
