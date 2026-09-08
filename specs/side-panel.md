# Side Panel

**Figma node:** [`14423:32215`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=14423-32215)

Inline layout panel for persistent contextual content alongside the main view. Not an overlay — it reduces main content width when open. Supports header, scrollable body slot, and optional footer CTAs.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| open | boolean | — | false | Controls visibility. Width animates from defaultWidth to the collapsed strip (48px) on close. |
| side | "left" | "right" | — | "right" | Which edge the panel attaches to. |
| title | string | — | — | Panel heading. 18px SemiBold, letter-spacing 0.25px. |
| description | string | — | — | Subtitle below title. 14px Medium. |
| showSearch | boolean | — | false | Renders a search input below the title row. |
| showMenu | boolean | — | false | Renders a menu icon button beside the close button. |
| footer | ReactNode | — | — | Sticky footer. Typically primary + secondary action buttons. |
| defaultWidth | number | — | 350 | Starting width in px. Use 350 (S) on small screens or multi-panel layouts. |
| widthPresets | number[] | — | [350, 450] | Drag-to-resize snap points (S, M) — a dynamic half-screen snap is always added as the third point. |
| onWidthChange | (width: number) => void | — | — | Called when width snaps to a new preset via drag. |
| showCollapsedStrip | boolean | — | true | Show a 48px strip with nav icons when closed. Set false to fully collapse to 0. |
| searchPlaceholder | string | — | "Search…" | Search input placeholder text. |
| onClose | () => void | — | — | Called on close/collapse button click. |
| children | ReactNode | — | — | Dynamic content slot. Scrollable. Supports any content. |

## Sizes / scale

| Name | Value |
| --- | --- |
| S (default) | 350px |
| M | 450px |
| Half-screen | 50vw (dynamic — always half the live window width) |
| Collapsed | 48px (shown when closed, unless showCollapsedStrip={false}) |

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
| Background | --side-panel-bg |  | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Border | --side-panel-border |  | #E4E4E7 | rgba(255,255,255,0.10) |

### Text

Title and body copy inside the panel. Uses the same generic tokens as other surfaces, not dedicated side-panel-* text vars.

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title | --foreground |  | #1a1a1a | #ffffffcc |
| Description | --field-supporting |  | #5C5C5C | rgba(255,255,255,0.60) |

### Collapsed strip

Vertical divider line + stacked dots shown when the panel is collapsed to its 48px strip.

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Divider / dots | --primary |  | #2173ff | #2b7fff |

### Stale / unused tokens

Defined in index.css but not referenced anywhere in side-panel.tsx — the menu/collapse icon buttons delegate to the Button atom (variant=tertiary, see Button spec) and the search input delegates entirely to the Input atom (see Text field spec). Kept here as a documented gap, not deleted from CSS, in case a future redesign wires them up.

CSS prefix: `side-panel-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title (unused) | --side-panel-title |  | #2a2a2a | rgba(255,255,255,0.80) |
| Description (unused) | --side-panel-description |  | #5C5C5C | #94A3B8 |
| Icon fill (unused) | --side-panel-icon |  | #52525B | #D1D5DB |
| Icon hover BG (unused) | --side-panel-icon-hover-bg |  | rgba(0,0,0,0.05) | rgba(255,255,255,0.08) |
| Search BG (unused) | --side-panel-search-bg |  | #FFFFFF | rgba(255,255,255,0.10) |
| Search border (unused) | --side-panel-search-bd |  | #5c5c5c | rgba(255,255,255,0.10) |

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
