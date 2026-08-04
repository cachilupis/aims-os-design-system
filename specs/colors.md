# Colors

**Figma:** [Design System file](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS)

Full token system: primitive palette (raw hex) + semantic layer (adaptive CSS vars). Dark mode is default; light activated via .light class on root.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| mode | Variant | dark (default),light | dark | Switched via .light class on the root element |
| scope | Variant | primitives,semantic | semantic | Primitives = fixed hex. Semantic = context-adaptive var() |
| surface | Variant | canvas,surface,overlay | canvas | Three surface elevation levels |

## Sizes / scale

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| --foreground | Primary text | #1a1a1a | #f0f4ff |
| --field-supporting | Secondary / muted | #5c5c5c | rgba(255,255,255,0.5) |
| --canvas | App background | #f5f7ff | #080a14 |
| --surface | Card / panel surface | #ffffff | #0e1120 |

## Variants / token groups

### Foreground tokens

Text and icon colors

CSS prefix: `--foreground / --field-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Primary text | --foreground | — | #1a1a1a | #f0f4ff |
| Label / muted | --field-label | — | #3d3d3d | rgba(255,255,255,0.87) |
| Supporting | --field-supporting | — | #5c5c5c | rgba(255,255,255,0.5) |
| Placeholder | --field-placeholder | — | rgba(0,0,0,0.35) | rgba(255,255,255,0.25) |

### Surface tokens

Background and panel fills

CSS prefix: `--canvas / --surface / --field-bg`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Canvas (app bg) | --canvas | — | #f5f7ff | #080a14 |
| Surface | --surface | — | #ffffff | #0e1120 |
| Field bg | --field-bg | — | #f2f2f2 | rgba(255,255,255,0.06) |
| Field bg hover | --field-bg-hover | — | #e8e8e8 | rgba(255,255,255,0.1) |
| Code bg | --code-bg | — | #f0f0f5 | rgba(255,255,255,0.08) |

### Border tokens

Stroke and divider colors

CSS prefix: `--field-border / --table-border`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Field border | --field-border | — | #5c5c5c | rgba(255,255,255,0.1) |
| Border hover | --field-border-hover | — | #2173ff | rgba(255,255,255,0.24) |
| Table border | --table-border | — | rgba(0,0,0,0.09) | rgba(255,255,255,0.07) |

### Semantic — Tag / Alert

Status color tokens shared by Tags and Alert Banner

CSS prefix: `--tag-*/--ab-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Error bg | --tag-error-bg | — | #fdeded | #2d1515 |
| Error text | --tag-error-fg | — | #5f2120 | #ff6467 |
| Success bg | --tag-success-bg | — | #e5fdf8 | #0a1f1a |
| Success text | --tag-success-fg | — | #003328 | #6ee7b7 |
| Alert bg | --tag-alert-bg | — | #ffeedb | #2d1a08 |
| Alert text | --tag-alert-fg | — | #663c00 | #fcd34d |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
