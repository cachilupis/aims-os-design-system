# Corner Radius

**Figma node:** [`4495:1311`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4495-1311)

8-step radius scale. Applied via --radius-* CSS variables and Tailwind classes. Never hardcode px radius values — always use the token.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| step | Variant | none,xs,sm,md,lg,xl,2xl,full | md | — |
| usage | String | badges,chips,buttons,cards,modals,avatars | — | Pick the step that matches the element's visual weight |

## Sizes / scale

| Token | Tailwind | Px | Usage |
| --- | --- | --- | --- |
| --radius-none | rounded-none | 0px | Tables, flush containers |
| --radius-xs | rounded-xs | 2px | Small tags, chips |
| --radius-s | rounded-sm | 4px | Inputs, small buttons |
| --radius-m | rounded-md | 8px | Buttons, cards (default) |
| --radius-l | rounded-lg | 16px | Panels, modals |
| --radius-xl | rounded-xl | 24px | Large cards, drawers |
| --radius-xxl | rounded-2xl | 32px | Hero sections |
| --radius-full | rounded-full | 100px | Avatars, pills, toggles |

## Variants / token groups

### CSS variables

Applied in index.css — same value in both modes (radius is not adaptive)

CSS prefix: `--radius-*`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| None | --radius-none | — | 0px | 0px |
| XS | --radius-xs | — | 2px | 2px |
| S | --radius-s | — | 4px | 4px |
| M | --radius-m | — | 8px | 8px |
| L | --radius-l | — | 16px | 16px |
| XL | --radius-xl | — | 24px | 24px |
| XXL | --radius-xxl | — | 32px | 32px |
| Full | --radius-full | — | 100px | 100px |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
