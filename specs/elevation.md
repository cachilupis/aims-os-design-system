# Elevation

**Figma:** [Design System file](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS)

5-level shadow scale for communicating depth and layer hierarchy. Use only `var(--shadow-elevation-N)` — never hardcode rgba() in box-shadow. Figma defines these as a single mode-agnostic scale — light and dark share the same values (2026-08 audit: this page previously showed fabricated, different light/dark numbers that didn't match the real tokens).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| level | Variant | 1,2,3,4,5 | 2 | Use the lowest level that separates the surface from its background |
| mode | Variant | dark (default),light | dark | — |

## Sizes / scale

| Level | Token | Role | Usage |
| --- | --- | --- | --- |
| 1 | --shadow-elevation-1 | Micro | Focused inputs, toggles, subtle chip lift |
| 2 | --shadow-elevation-2 | Low | Card rest state, inline panels |
| 3 | --shadow-elevation-3 | Mid | Dropdown menus, select overlays, filter dropdowns |
| 4 | --shadow-elevation-4 | High | Modals, topbar sheets, large floating panels |
| 5 | --shadow-elevation-5 | Float | SwitchTab — diagonal offset for floating containers |

## Variants / token groups

### Dark mode values (default)

Shadows are perceptually stronger on dark backgrounds to maintain visible depth separation

CSS prefix: `--shadow-elevation-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Elevation-1 Micro | --shadow-elevation-1 | Elevation-1 | 2px 2px 8px 1px rgba(0,0,0,0.06) | 2px 2px 8px 1px rgba(0,0,0,0.06) |
| Elevation-2 Low | --shadow-elevation-2 | Elevation-2 | 4px 4px 12px 2px rgba(0,0,0,0.08) | 4px 4px 12px 2px rgba(0,0,0,0.08) |
| Elevation-3 Mid | --shadow-elevation-3 | Elevation-3 | 4px 4px 12px 2px rgba(0,0,0,0.12) | 4px 4px 12px 2px rgba(0,0,0,0.12) |
| Elevation-4 High | --shadow-elevation-4 | Elevation-4 | 8px 8px 16px 8px rgba(0,0,0,0.08) | 8px 8px 16px 8px rgba(0,0,0,0.08) |
| Elevation-5 Float | --shadow-elevation-5 | Elevation-5 | 8px 8px 16px 0px rgba(0,0,0,0.08) | 8px 8px 16px 0px rgba(0,0,0,0.08) |

### Component mapping

Which elevation level each DS component uses

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Input focus ring | --shadow-elevation-1 |  | Elevation-1 | Elevation-1 |
| Card hover | --shadow-elevation-2 |  | Elevation-2 | Elevation-2 |
| Dropdown / Select | --shadow-elevation-3 |  | Elevation-3 | Elevation-3 |
| Pagination strip | --shadow-elevation-3 |  | Elevation-3 | Elevation-3 |
| SlideOut panel | --shadow-elevation-4 |  | Elevation-4 | Elevation-4 |
| ModalDialog | --shadow-elevation-4 |  | Elevation-4 | Elevation-4 |
| SwitchTab container | --shadow-elevation-5 |  | Elevation-5 | Elevation-5 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
