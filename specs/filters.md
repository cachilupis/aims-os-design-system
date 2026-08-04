# Filters

**Figma node:** [`7996:4655`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7996-4655)

Horizontal 40px filter bar for narrowing large datasets. 8 state variants, up to 5 filter chips, sorting control, grid/list view toggle. Chip label truncated at 14 characters with tooltip on hover. Token family --fi-*.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| compact | Boolean | true,false | false | S Variant — shows only Search + All Filters button |
| compactCount | number | 0,1,2+ | 0 | > 0 → S Variant Filters Apply: shows Filters badge with count |
| showSearch | Boolean | true,false | true | Renders the 140px search input on the left |
| searchPlaceholder | string | any string | "Search" | — |
| slots | FilterSlot[] | { placeholder, value?, onRemove?, onOpen? }[] | [] | Up to 5 filter chips. value set → active chip with × dismiss |
| showClearFilters | Boolean | true,false | false | Shows 'Clear Filters' text link after the chips |
| onClearFilters | function | () => void | undefined | — |
| showAllFilters | Boolean | true,false | true | Shows 'All filters' pill button in the right controls |
| showSort | Boolean | true,false | true | Sort direction arrow + sort label dropdown |
| sortLabel | string | any string | "Name" | — |
| showViewToggle | Boolean | true,false | true | Grid/List icon toggle buttons |
| viewMode | Variant | grid,list | "grid" | — |
| onViewModeChange | function | (mode: 'grid' | 'list') => void | undefined | — |
| className | string | any string | undefined | — |

## Sizes / scale

| Size | Height | Layout | Notes |
| --- | --- | --- | --- |
| Fixed | 40px | flex row, full-width | Height is always 40px; width fills the container |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Chip label | Inter | 13px | Medium (500) | 1 |
| Clear Filters | Inter | 13px | Medium (500) | 1 |
| Sort label | Inter | 13px | Medium (500) | 1 |

## States / token groups

### Default chip (inactive)

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/Subtle |  | rgba(250,250,250,1) | rgba(255,255,255,0.05) |
| Border | Border/Neutral/Lighter |  | rgba(186,186,186,1) | rgba(255,255,255,0.15) |
| Text | Text/Subtitle |  | #2a2a2a | rgba(255,255,255,0.70) |
| Icon | Icon/Neutral |  | rgba(0,0,0,0.40) | rgba(255,255,255,0.40) |

### Active chip (selected value)

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Primary/Subtle |  | rgba(33,115,255,0.06) | rgba(43,127,255,0.08) |
| Border | Border/Primary/Default |  | #2173ff | #2b7fff |
| Text | Text/Info |  | #001740 | #A8C8FF |
| Icon (×) | Icon/Primary/Darker |  | #001740 | rgba(168,200,255,0.80) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
