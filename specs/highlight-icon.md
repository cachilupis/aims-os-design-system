# Highlight Icon

**Figma node:** [`7919:10532`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7919-10532)

Rounded semantic icon container with tinted background. Used as the leading slot in Menu/Dropdown items, list rows, and standalone context indicators.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| Variant | Variant | informative,success,alert,error,neutral,yellow,lime,purple,light-blue | informative | Controls both bg and icon color |
| Size | Variant | L,M,S | M | L=40×40 · M=32×32 · S=24×24 |
| Icon Color | Variant | Dark,Default | Dark | Dark = deep saturated DS icon token · Default = lighter/softer tone |

## Sizes / scale

| Size | Dimensions | IconSize | Padding | Radius |
| --- | --- | --- | --- | --- |
| L | 40×40px | 24×24px | 8px all sides | 8px |
| M | 32×32px | 24×24px | 4px all sides | 8px |
| S | 24×24px | 16×16px | 4px all sides | 4px |

## Variants / token groups

### informative

Primary blue — default for general highlights

CSS prefix: `hi-informative`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Primary/100 | 4461:2592 | #E9F1FF | rgba(33,115,255,0.14) |
| Icon (dark) | Icon/Informative/Dark | 4465:4514 | #001740 | #A8C8FF |

### success

Success / green states

CSS prefix: `hi-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Success/50 | 8541:11928 | #CBFFF4 | rgba(0,169,127,0.14) |
| Icon (dark) | Icon/Success/Dark | 4567:4619 | #003328 | #70EDD8 |

### alert

Alert / warning states

CSS prefix: `hi-alert`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Alert/50 | 4465:2666 | #FFEEDB | rgba(217,119,6,0.14) |
| Icon (dark) | Icon/Alert/Dark | 4567:4618 | #663C00 | #FFC070 |

### error

Error / destructive states

CSS prefix: `hi-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Error/50 | 4465:2662 | #FDEDED | rgba(220,38,38,0.14) |
| Icon (dark) | Icon/Error/Dark | 4567:4620 | #5F2120 | #FF9898 |

### neutral

Neutral / gray for no-color contexts

CSS prefix: `hi-neutral`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Gray/100 | 4465:4589 | #F2F2F2 | rgba(255,255,255,0.08) |
| Icon (dark) | Text/Primary/Dark | 4465:4589 | #2A2A2A | rgba(255,255,255,0.70) |

### yellow

Yellow / golden highlights

CSS prefix: `hi-yellow`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Yellow/50 | 8539:40814 | #FFEEDB | rgba(202,138,4,0.14) |
| Icon (dark) | Icon/Yellow/Dark | 8539:40814 | #5C3500 | #FFE070 |

### lime

Lime green — growth, eco, positive activity

CSS prefix: `hi-lime`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Lime/50 | 8539:40885 | #E7F9B5 | rgba(101,163,13,0.14) |
| Icon (dark) | Icon/Lime/Dark | 8539:40885 | #3E5C0A | #C4F060 |

### purple

Purple / creative / AI contexts

CSS prefix: `hi-purple`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Purple/100 | 8539:40955 | #E4CEFC | rgba(124,58,237,0.14) |
| Icon (dark) | Icon/Purple/Dark | 8539:40955 | #2C075C | #D4A0FF |

### light-blue

Light blue / sky — integrations, cloud, data

CSS prefix: `hi-lightblue`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | LightBlue/100 | 8540:41021 | #CCF1FF | rgba(2,132,199,0.14) |
| Icon (dark) | Icon/LightBlue/Dark | 8540:41021 | #02445A | #80DCFF |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
