# Side Panel

**Figma node:** [`14423:32215`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=14423-32215)

Inline layout panel for persistent contextual content alongside the main view. Not an overlay — it reduces main content width when open. Supports header, scrollable body slot, and optional footer CTAs.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| open | boolean | — | false | Controls visibility. Width animates from 450px to 0 on close. |
| side | "left" | "right" | — | "right" | Which edge the panel attaches to. |
| title | string | — | — | Panel heading. 18px SemiBold, letter-spacing 0.25px. |
| description | string | — | — | Subtitle below title. 14px Medium. |
| showSearch | boolean | — | false | Renders a search input below the title row. |
| showMenu | boolean | — | false | Renders a menu icon button beside the close button. |
| footer | ReactNode | — | — | Sticky footer. Typically primary + secondary action buttons. |
| width | number | — | 450 | Panel open width in px. Use 300 on small screens. |
| searchPlaceholder | string | — | "Search…" | Search input placeholder text. |
| onClose | () => void | — | — | Called on close/collapse button click. |
| children | ReactNode | — | — | Dynamic content slot. Scrollable. Supports any content. |

## Sizes / scale

| Name | Value |
| --- | --- |
| Default (1/3) | 450px |
| Expanded (1/3) | 480px |
| Expanded (1/2) | 704px |
| Min (small screen) | 300px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 18px | 600 | 100% |
| Description | Inter | 14px | 500 | 20px |
| Search placeholder | Inter | 14px | 500 | 20px |

## Variants / token groups

### Panel surface

Frosted-glass BG and border

CSS prefix: `side-panel-surface`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --side-panel-bg | Surface/Floating/Default | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Border | --side-panel-border | Border/Neutral/Subtle | #E4E4E7 | rgba(255,255,255,0.10) |

### Text

Title and body copy inside the panel

CSS prefix: `side-panel-text`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title | --side-panel-title | Text/Label | #2a2a2a | rgba(255,255,255,0.80) |
| Description | --side-panel-description | Text/Body | #5C5C5C | #94A3B8 |

### Icons

Action icons and close button

CSS prefix: `side-panel-icons`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon fill | --side-panel-icon | Icon/Neutral/Default | #52525B | #D1D5DB |
| Icon hover BG | --side-panel-icon-hover-bg | Surface/Neutral/Default | rgba(0,0,0,0.05) | rgba(255,255,255,0.08) |

### Search field

Optional search input below the header

CSS prefix: `side-panel-search`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --side-panel-search-bg | Surface/Neutral/White | #FFFFFF | rgba(255,255,255,0.10) |
| Border | --side-panel-search-bd | Border/Neutral/Default | #5c5c5c | rgba(255,255,255,0.10) |

## Additional data

Fields present in the source `_SPEC` object not covered by the sections above:

```json
{
  "componentName": "Side Panel",
  "nodeId": "14423:32215"
}
```

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
