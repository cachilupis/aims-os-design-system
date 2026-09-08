# Toggle

**Figma node:** [`6068:18167`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=6068-18167)

On/Off switch with sliding thumb animation. Used for binary settings where the change takes effect immediately — feature flags, notifications, dark mode, permissions.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| checked | Boolean | true,false | false | — |
| size | Variant | lg (L),default (M),sm (S) | default | — |
| disabled | Boolean | true,false | false | — |
| label | String | any string | undefined | — |
| description | String | any string | undefined | — |
| onChange | Function | (checked: boolean) => void | undefined | — |

## Sizes / scale

| Size | Track | Thumb | Travel | Border |
| --- | --- | --- | --- | --- |
| L (lg) | 52×32px | 16×16px | 28px | 2px (off only) |
| M (default) | 39×24px | 16×16px | 15px | 2px (off only) |
| S (sm) | 26×16px | 8×8px | 10px | 2px (off only) |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 14px | Medium (500) | 1.4 |
| Label (disabled) | Inter | 14px | Medium (500) | 1.4 |
| Description | Inter | 12px | Regular (400) | 1.5 |

## States / token groups

### Off · Enabled

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track bg | --toggle-track-off |  | rgba(242,242,242,1) | rgba(255,255,255,0.08) |
| Track border | --toggle-border-off |  | #5c5c5c | rgba(255,255,255,0.30) |
| Track border hover | --field-border-hover |  | #2a2a2a | rgba(255,255,255,0.2) |
| Thumb | --toggle-thumb-off |  | #2a2a2a | rgba(255,255,255,0.60) |

### On  · Enabled

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track bg | --toggle-track-on |  | #2173ff | #2b7fff |
| Thumb | --toggle-thumb-on |  | #ffffff | #ffffff |

### Off · Disabled

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track bg | --toggle-track-off-disabled |  | rgba(242,242,242,1) | rgba(255,255,255,0.05) |
| Track border | --toggle-border-off-disabled |  | #bababa | rgba(255,255,255,0.15) |
| Thumb | --toggle-thumb-disabled |  | #bababa | rgba(255,255,255,0.20) |

### On  · Disabled

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Track bg | --toggle-track-on-disabled |  | #80afff | rgba(43,127,255,0.40) |
| Thumb (reused) | --toggle-thumb-on |  | #ffffff | #ffffff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
