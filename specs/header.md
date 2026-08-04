# Header

**Figma node:** [`7995:4268`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7995-4268)

Page-level header with title, description, status tag, back button, icon highlight, and primary/secondary CTAs. Three size variants: Size L (24px title, full padding), Size M (18px, compact), Compress (scroll-triggered minimal state — only title + CTAs visible).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| title | string | any string | — | Required. Always visible in all sizes. |
| size | Variant | size-l,size-m,compress | size-l | — |
| description | string | any string | undefined | Hidden in compress. |
| tag | node | <Tag /> | undefined | Renders inline after title. Hidden in compress. |
| backButton | Boolean | true,false | false | ArrowLeft button. Hidden in compress. Use only in drill-down pages. |
| icon | node | LucideIcon | undefined | Rendered inside a HighlightIcon (sm). Hidden in compress. |
| iconVariant | Variant | informative,success,alert,error,neutral,yellow,lime,purple,light-blue | informative | HighlightIcon color variant. Only applies when icon is set. |
| primaryAction | node | <Button variant="main" size="sm" /> | undefined | — |
| secondaryAction | node | <Button variant="secondary" size="sm" /> | undefined | — |

## Sizes / scale

| Size | Padding | TitleSize | Height | Notes |
| --- | --- | --- | --- | --- |
| Size L | 12px 24px | 24px | auto (~48px) | Default. Full slots visible. |
| Size M | 10px 24px | 18px | auto (~38px) | Compact. Full slots visible. |
| Compress | 8px 24px | 18px | 60px (fixed) | Scroll state. Only title + CTAs. |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title — Size L | Inter | 24px | 600 SemiBold | tight (1.2) |
| Title — Size M / Compress | Inter | 18px | 600 SemiBold | tight (1.2) |
| Description | Inter | 14px | 400 Regular | 20px |

## Variants / token groups

### Size L

Default top-level header. 24px title, description, tag, back button, icon, CTAs. Padding 12px × 24px.

CSS prefix: `header`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title text | --header-title | Text/Title | #1A1A1A | rgba(255,255,255,0.80) |
| Description text | --header-desc | Text/Body | #5C5C5C | #94A3B8 |
| Back button icon | --header-back-icon | Icon/Neutral/Dark | rgba(92,92,92,1) | rgba(255,255,255,0.50) |

### Size M

Compact header. 18px title, reduced padding (10px × 24px). All slots remain available.

CSS prefix: `header`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title text | --header-title | Text/Title | #1A1A1A | rgba(255,255,255,0.80) |
| Description text | --header-desc | Text/Body | #5C5C5C | #94A3B8 |

### Compress

Scroll-triggered minimal state. 18px title only — description, tag, back button, and icon are hidden. Padding 8px × 24px.

CSS prefix: `header`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title text | --header-title | Text/Title | #1A1A1A | rgba(255,255,255,0.80) |

### Icon — HighlightIcon (informative)

The icon slot uses the HighlightIcon component (size sm, iconColor dark). Color variant controlled via iconVariant prop. Tokens shown for the default 'informative' variant.

CSS prefix: `hi-informative`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon bg | --hi-informative-bg | Surface/Informative/Subtle | #E9F1FF | rgba(33,115,255,0.14) |
| Icon color | --hi-informative-icon | Icon/Informative/Dark | #001740 | #A8C8FF |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
