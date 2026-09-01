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

max-w-[900px] · p-[24px] · centered column layout. All tokens below are shared with Content — only the layout differs.

CSS prefix: `--modal`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Surface | --modal-surface |  | #FFFFFF | rgba(12,14,34,0.82) |
| Surface blur | --modal-surface-blur |  | none | blur(10px) |
| Border | --modal-border |  | #BABABA | rgba(255,255,255,0.15) |
| Scrim | --modal-scrim |  | rgba(0,0,0,0.50) | rgba(0,0,0,0.65) |
| Slot bg | --modal-slot-bg |  | #F5F6FA | rgba(255,255,255,0.04) |
| Close icon | --modal-close-icon |  | rgba(0,0,0,0.35) | rgba(255,255,255,0.35) |
| Close icon hover | --modal-close-hover |  | rgba(0,0,0,0.80) | rgba(255,255,255,0.80) |

### Content

max-w-[900px] · p-[32px] · left-aligned row layout (icon + title inline). Same 7 tokens as Confirmation (reused) — layout is the only difference.

CSS prefix: `--modal`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Surface (reused) | --modal-surface |  | #FFFFFF | rgba(12,14,34,0.82) |
| Surface blur (reused) | --modal-surface-blur |  | none | blur(10px) |
| Border (reused) | --modal-border |  | #BABABA | rgba(255,255,255,0.15) |
| Scrim (reused) | --modal-scrim |  | rgba(0,0,0,0.50) | rgba(0,0,0,0.65) |
| Slot bg (reused) | --modal-slot-bg |  | #F5F6FA | rgba(255,255,255,0.04) |
| Close icon (reused) | --modal-close-icon |  | rgba(0,0,0,0.35) | rgba(255,255,255,0.35) |
| Close icon hover (reused) | --modal-close-hover |  | rgba(0,0,0,0.80) | rgba(255,255,255,0.80) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
