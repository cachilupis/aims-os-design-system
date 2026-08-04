# Breadcrumb

**Figma node:** [`18352:45`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=18352-45)

Hierarchical back-navigation trail for L3+ depth levels. Shows the full path from root to the current page with all ancestors clickable. At depth L2, use Header backButton instead — never both.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| depth | number | 2,3,4,4+ | 3 | depth<2 → no breadcrumb · depth=2 → Depth=2 variant · depth=3 → Depth=3 · depth≥4 → Depth=4 (middle items truncated with …) |
| items | BreadcrumbItem[] | { label: string; href?: string }[] | [] | items[0] is always 'Home' with href='/'. items[last] is the Selected item (no href). |
| onNavigate | (href: string) => void | — | — | Called when a Default (non-selected) item is clicked. |
| className | string | — | — | Optional class override for the root <nav> element. |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Breadcrumb item | Inter | 14px | Medium (500) | 20px |

## Variants / token groups

### Default item

Ancestor links — clickable. Hover changes text to Text/Subtitle.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Text (rest) | Text/Body | 4465:4469 | #5C5C5C | #94A3B8 |
| Text (hover) | Text/Subtitle | 4465:4468 | #2a2a2a | rgba(255,255,255,0.60) |

### Selected item

Current page — last item, non-interactive.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Text | Text/Subtitle | 4465:4468 | #2a2a2a | rgba(255,255,255,0.60) |

### Separator

ChevronRight icon between items.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon | Icon/Neutral/Light | 4465:4467 | #ffffff | #ffffff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
