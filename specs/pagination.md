# Pagination

**Figma node:** [`4755:606`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4755-606)

Bottom strip for paged datasets. Displays a rows-per-page selector, a visible range indicator (1–25 of 120 items), and previous/next navigation. Auto-hides when totalItems ≤ itemsPerPage (single page case).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| currentPage | number | any positive integer | 1 | 1-indexed. Page 1 = first page. |
| totalItems | number | any positive integer | — | Required. Controls visibility and range text. |
| itemsPerPage | number | 5,25,50,100,200 | 25 | — |
| onPageChange | function | (page: number) => void | — | Required. Called on prev/next click. |
| onItemsPerPageChange | function | (items: number) => void | undefined | Optional. Omit to make rows-per-page read-only. |
| rowsPerPageOptions | number[] | [5, 25, 50, 100, 200] | [5, 25, 50, 100, 200] | — |
| className | string | any CSS class string | undefined | — |

## Sizes / scale

| Element | Width | Height | Padding | Gap | Border | BorderRadius |
| --- | --- | --- | --- | --- | --- | --- |
| Outer wrapper | MAX | 48px | 8px 12px | — | none | — |
| Inner container | MAX | 32px | 4px 8px | 40px | 1px | 6px |
| Nav button | 24px | 24px | 0 | 12px | none | 4px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| "Rows per page:" caption | Inter | 12px | 500 Medium | — |
| Range text (1–25 of N items) | Inter | 12px | 500 Medium | — |

## Variants / token groups

### Default

Single-page or first page. Previous button disabled. All tokens shared across both Default and Multipage states.

CSS prefix: `pagination`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Range text + row count | --color-text-label |  | #2a2a2a | rgba(255,255,255,0.80) |
| "Rows per page:" caption | --color-text-subtitle |  | #2a2a2a | rgba(255,255,255,0.60) |
| Nav icons + selector chevron | --color-icon-neutral-dark |  | rgba(92,92,92,1) | rgba(255,255,255,0.50) |
| Inner container bg | --surface-floating-default |  | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Inner container border | --color-border-neutral-subtle |  | #e4e4e7 | rgba(255,255,255,0.10) |
| Container shadow (reused) | --shadow-elevation-5 |  | see Elevation spec | see Elevation spec |
| Selector button bg | --btn-secondary-bg |  | #ffffff | rgba(255,255,255,0.10) |
| Selector button border | --btn-secondary-border |  | #5c5c5c | rgba(255,255,255,0.10) |
| Selector button hover bg | --btn-secondary-hover-bg |  | #f2f2f2 | rgba(255,255,255,0.08) |
| Dropdown selected text | --primary |  | #2173ff | #2b7fff |
| Dropdown option hover/selected bg | --color-surface-neutral-default |  | #f2f2f2 | rgba(255,255,255,0.06) |
| Nav buttons (bg/border/hover) | — |  | see Button spec — variant: secondary, size: sm | see Button spec — variant: secondary, size: sm |

### Multipage

Middle or last page. Previous and/or next buttons (Button atom, variant=secondary) change to their own disabled state when at a boundary. No new tokens — inherits all tokens from Default.

CSS prefix: `pagination`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Range text + row count (reused) | --color-text-label |  | #2a2a2a | rgba(255,255,255,0.80) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
