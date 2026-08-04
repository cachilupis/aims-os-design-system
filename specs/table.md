# Table

**Figma node:** [`4687:5051`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4687-5051)

Data table for displaying structured information in rows and columns. Supports optional row selection with checkboxes, 2 sizes, hover and selected states.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| columns | Array | TableColumn<T>[] | [] | key, header, width?, align?, render?(row,index)=>ReactNode |
| data | Array | T[] | [] | — |
| size | Variant | default (M),sm (S) | default | — |
| selectable | Boolean | true,false | false | Adds checkbox column + row click selection |
| selectedRows | Set | Set<number> | new Set() | Controlled — set of selected row indexes |
| onRowSelect | Function | (index, checked) => void | undefined | — |
| onSelectAll | Function | (allChecked) => void | undefined | — |

## Sizes / scale

| Size | HeaderHeight | RowHeight | HeaderFont | CellFont | PaddingH | PaddingV |
| --- | --- | --- | --- | --- | --- | --- |
| M (default) | 48px | 60px | 14px Semi Bold | 14px Medium | 8px | 12px / 16px |
| S (sm) | 40px | 48px | 12px Semi Bold | 12px Medium | 8px | 8px / 12px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Header text | Inter | 14px (M) / 12px (S) | Semi Bold (600) | 1.4 |
| Cell text | Inter | 14px (M) / 12px (S) | Medium (500) | 1.4 |

## States / token groups

### Row default

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Row bg | Surface/Neutral/White |  | #ffffff | rgba(255,255,255,0.10) |

### Row hover

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Row bg | Surface/Neutral/Default |  | #f2f2f2 | rgba(255,255,255,0.08) |

### Row selected

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Row bg | Surface/Primary/More Subtle |  | rgba(246,249,255,1) | rgba(43,127,255,0.08) |

### Header

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Header bg | Surface/Neutral/White |  | #ffffff | rgba(255,255,255,0.10) |
| Text | Text/Subtitle |  | #2a2a2a | rgba(255,255,255,0.6) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
