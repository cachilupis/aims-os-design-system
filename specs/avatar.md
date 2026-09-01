# Avatar

**Figma node:** [`4753:19229`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4753-19229)

Circular user/workspace badge. Auto-assigns color from name hash. 3 styles × 10 colors × 5 sizes + selected ring state.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| style | Variant | text,photo,empty | text | — |
| size | Variant | xs,sm,md,lg,xl | md | — |
| color | Variant | blue,green,red,orange,purple,limegreen,lightblue,pink,teal,amber,auto | auto | auto = deterministic from name hash |
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

### Text style — 10 colors

Background per color key — text is always white regardless of color

CSS prefix: `--av-col-*-bg`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Blue | --av-col-blue-bg | — | #1a5fd4 | #2173ff |
| Green | --av-col-green-bg | — | #047857 | #059669 |
| Red | --av-col-red-bg | — | #b91c1c | #dc2626 |
| Orange | --av-col-orange-bg | — | #9a3412 | #c2410c |
| Purple | --av-col-purple-bg | — | #6d28d9 | #7c3aed |
| Lime Green | --av-col-limegreen-bg | — | #3f6212 | #4d7c0f |
| Light Blue | --av-col-lightblue-bg | — | #0369a1 | #0284c7 |
| Pink | --av-col-pink-bg | — | #9d174d | #be185d |
| Teal | --av-col-teal-bg | — | #0f766e | #0d9488 |
| Amber | --av-col-amber-bg | — | #92400e | #d97706 |

### Text / Ring colors — shared across all colors

Initials text and the two ring states are the same regardless of avatarStyle/color

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Initials text (all colors) | --color-text-negative | — | #ffffff | #ffffff |
| Empty style background | --tag-neutral-bg | — | #f2f2f2 | rgba(255,255,255,0.08) |
| Ring — default (not selected) | --topbar-avatar-ring | — | rgba(128,175,255,1) | rgba(43,127,255,0.30) |
| Ring — selected | --color-text-negative | — | #ffffff | #ffffff |

### Selected ring — dimensions

1px default ring, 1.5px + glow shadow when selected=true (boxShadow is a hardcoded literal, not a token)

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Default ring width | — | — | 1px | 1px |
| Selected ring width | — | — | 1.5px | 1.5px |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
