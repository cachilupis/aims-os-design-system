# Avatar

**Figma node:** [`4753:19229`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4753-19229)

Circular user/workspace badge. Auto-assigns color from name hash. 3 styles × 7 colors × 5 sizes + selected ring state.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| style | Variant | text,photo,empty | text | — |
| size | Variant | xs,sm,md,lg,xl | md | — |
| color | Variant | blue,green,orange,purple,cyan,lime,red,auto | auto | auto = deterministic from name hash |
| selected | Boolean | true,false | false | — |
| name | String | any string | — | Initials extracted: first letter of each word, max 2 |
| src | String | image URL | — | Only used when style=photo |

## Sizes / scale

| Size | Height | FontSize | FontWeight |
| --- | --- | --- | --- |
| xs | 20px | 9px | 700 |
| sm | 24px | 11px | 700 |
| md | 32px | 13px | 700 |
| lg | 40px | 15px | 700 |
| xl | 48px | 18px | 700 |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Initials (xs) | Inter | 9px | 700 / ExtraBold | 1 |
| Initials (sm) | Inter | 11px | 700 / ExtraBold | 1 |
| Initials (md) | Inter | 13px | 700 / ExtraBold | 1 |
| Initials (lg) | Inter | 15px | 700 / ExtraBold | 1 |
| Initials (xl) | Inter | 18px | 700 / ExtraBold | 1 |

## Variants / token groups

### Text / Blue

Default color — #2173FF brand blue

CSS prefix: `--avatar-blue-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --avatar-blue-bg | — | #2173ff26 | #2173ff33 |
| Text | --avatar-blue-text | — | #2173ff | #6fa8ff |

### Selected ring

2px ring shown when selected=true

CSS prefix: `--foreground`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ring color | --foreground | — | #1a1a1a | #f0f4ff |
| Ring width | — | — | 2px | 2px |
| Ring gap | — | — | 2px | 2px |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
