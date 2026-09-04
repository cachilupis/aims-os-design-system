# Filters

**Figma node:** [`7996:4655`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=7996-4655)

Horizontal 40px filter bar for narrowing large datasets. 8 state variants, up to 5 filter chips, sorting control, grid/list view toggle. Chip label truncated at 14 characters with tooltip on hover. Search/All-Filters button/chip base use the shared --field-* tokens; chip and control accents use --fi-*. The All-Filters button opens FiltersSlideout (a separate component, tokens documented in its own group below).

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
| Chip label (inactive) | Inter | 13px | Medium (500) | 1 |
| Chip label (active) | Inter | 13px | Medium (500) | 1 |
| Clear Filters | Inter | 13px | Medium (500) | 1 |
| Sort label | Inter | 13px | Medium (500) | 1 |

## States / token groups

### Default chip (inactive) / search / All Filters button

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --field-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Border | --field-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Border hover | --field-border-hover |  | #2a2a2a | rgba(255,255,255,0.20) |
| Text | --field-text |  | #2a2a2a | rgba(255,255,255,0.60) |
| Icon | --field-icon |  | #bababa | rgba(255,255,255,0.30) |

### Chip — inactive / active states

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Inactive chip bg | --fi-chip-bg |  | rgba(250,250,250,1) | rgba(255,255,255,0.05) |
| Inactive chip icon | --fi-chip-icon |  | rgba(0,0,0,0.40) | rgba(255,255,255,0.40) |
| Active chip bg | --fi-chip-active-bg |  | rgba(33,115,255,0.06) | rgba(43,127,255,0.08) |
| Active chip border | --fi-chip-active-border |  | #2173ff | #2b7fff |
| Active chip icon (×) | --fi-chip-active-icon |  | #001740 | rgba(168,200,255,0.80) |

### Compact badge / Clear Filters / Sort / View toggle

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Compact badge bg | --fi-badge-bg |  | #2173ff | #2b7fff |
| Compact badge text | --fi-badge-text |  | #ffffff | #ffffff |
| Clear Filters text | --fi-clear-text |  | rgba(0,0,0,0.45) | rgba(255,255,255,0.45) |
| Clear Filters hover | --fi-clear-hover |  | rgba(0,0,0,0.80) | rgba(255,255,255,0.80) |
| Sort label | --fi-sort-text |  | rgba(0,0,0,0.65) | rgba(255,255,255,0.65) |
| Sort icon | --fi-sort-icon |  | rgba(0,0,0,0.40) | rgba(255,255,255,0.40) |
| View toggle — active bg | --fi-view-active-bg |  | #2173ff | #2b7fff |
| View toggle — active icon | --fi-view-active-icon |  | #ffffff | #ffffff |
| View toggle — inactive icon | --fi-view-icon |  | rgba(0,0,0,0.40) | rgba(255,255,255,0.40) |

### FiltersSlideout — "All Filters" panel (separate component, no own spec)

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Backdrop scrim | --modal-scrim |  | rgba(0,0,0,0.50) | rgba(0,0,0,0.65) |
| Panel surface | --surface |  | #F2F7FF | #0D1120 |
| Panel divider/border | --table-border |  | rgba(33,115,255,0.10) | rgba(255,255,255,0.15) |
| Title / body text | --foreground |  | #1a1a1a | #ffffffcc |
| CtrlGroup pill (inactive) | --ctrl-inactive-bg |  | rgba(0,0,0,0.07) | rgba(255,255,255,0.10) |
| Accent (applied count, links) | --primary |  | #2173ff | #2b7fff |
| Priority dot — critical | --priority-critical |  | #ef4444 | #f87171 |
| Priority dot — high | --priority-high |  | #f97316 | #fb923c |
| Priority dot — medium | --priority-medium |  | #f59e0b | #fbbf24 |
| Priority dot — low | --priority-low |  | #22c55e | #4ade80 |
| Informative Tag bg | --tag-informative-bg |  | #e9f1ff | rgba(21,93,252,0.15) |
| Informative Tag border | --tag-informative-bd |  | #2173ff | #2b7fff |
| Informative Tag text | --tag-informative-fg |  | #001740 | rgba(255,255,255,0.80) |
| Field bg / border / icon / text / placeholder / supporting | --field-* (same tokens as the Filters bar above) |  | — | — |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
