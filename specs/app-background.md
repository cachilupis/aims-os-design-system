# App Background

**Figma node:** [`12655:211429`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=12655-211429)

Fixed full-screen gradient background layer. Switches light↔dark automatically via two FLOAT opacity variables bound to each gradient layer. Contextual variants are always light — no dark mode switching.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | Variant | default,green,red,orange,yellow,purple,light-blue,lime | default | Default switches automatically. Contextual variants are always light. |
| className | String | string | — | Additional classes on the fixed background div. |

## Variants / token groups

### Mode-aware default

Two stacked gradient layers with FLOAT opacity variables. Switching Primitives Tokens mode swaps them automatically.

CSS prefix: `--app-bg`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dark mode gradient | --app-bg | App Background/Dark | — | linear-gradient(144deg, #020618 0%, #0F172B 50%, #020618 100%) |
| Light mode gradient | --app-bg (.light) | Primary Color BG | radial-gradient(circle at 50% 0%, #F6F9FF 0%, #FFFFFF 80%) | — |

### Figma variable system — FLOAT opacity

Layer OPACITY (not fill opacity) is bound to these FLOAT variables (0–100 scale) from the Primitives Tokens collection.

CSS prefix: `BG/*-Opacity`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| BG/Light-Opacity | Layer opacity (Light BG) | Primitives Tokens | 100 (visible) | 0 (hidden) |
| BG/Dark-Opacity | Layer opacity (Dark BG) | Primitives Tokens | 0 (hidden) | 100 (visible) |

### Contextual variants (always light)

Applied directly as fill — no dark mode switching. Use for mood-specific screens only.

CSS prefix: `--app-bg-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Green | --app-bg-green | Green BG | radial-gradient(circle at 50% 0%, #E5FDF8 0%, #FFFFFF 80%) | static |
| Red | --app-bg-red | Red BG | radial-gradient(circle at 50% 0%, #FDECED 0%, #FFFFFF 80%) | static |
| Orange | --app-bg-orange | Orange BG | radial-gradient(circle at 50% 0%, #FFF4E5 0%, #FFFFFF 80%) | static |
| Yellow | --app-bg-yellow | Yellow BG | radial-gradient(circle at 50% 0%, #FFFAF0 0%, #FFFFFF 80%) | static |
| Purple | --app-bg-purple | Purple BG | radial-gradient(circle at 50% 0%, #F3E9FD 0%, #FFFFFF 80%) | static |
| Light Blue | --app-bg-light-blue | Light Blue BG | radial-gradient(circle at 50% 0%, #E5F8FF 0%, #FFFFFF 80%) | static |
| Lime | --app-bg-lime | Lime Green BG | radial-gradient(circle at 50% 0%, #F9FEE5 0%, #FFFFFF 80%) | static |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
