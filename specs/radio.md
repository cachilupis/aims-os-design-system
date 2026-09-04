# Radio

**Figma node:** [`5045:52590`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5045-52590)

Selects exactly one option from a set of two or more mutually exclusive choices — picking one deselects the rest. Never used alone: reach for RadioGroup, which renders the radios and owns the fieldset, the legend and arrow-key navigation. Use Checkbox when more than one option can be selected at once, and Select when there are more than about six.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| legend | String | any string | — | RadioGroup. Required — names what the set is choosing between. Use hideLegend to keep it for screen readers only. |
| options | Array | { value, label, description?, disabled? }[] | [] | RadioGroup. |
| value | String | any option value | undefined | The selected option. |
| onChange | Function | (value: string) => void | undefined | — |
| size | Variant | sm (S),md (M),lg (L) | md | — |
| orientation | Variant | vertical,horizontal | vertical | Horizontal only suits two or three short options. |
| disabled | Boolean | true,false | false | On the group, disables every option. |
| label | String | any string | — | Radio. Required — a radio without a label is not a radio. |
| description | String | any string | undefined | Radio. Secondary line under the label. |

## Sizes / scale

| Size | Ring | Dot | Padding | Note |
| --- | --- | --- | --- | --- |
| L (lg) | 24×24px | 10px | 4px | Spacing/1x on all sides |
| M (md) | 20×20px | 8px | 4px | Default |
| S (sm) | 16×16px | 6px | 4px | Dense forms and filter panels |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label | Inter | 14px | Medium (500) | 28px |
| Description | Inter | 12px | Regular (400) | 1.4 |

## Variants / token groups

### Unselect

Empty ring. The default.

CSS prefix: `radio`

### Select

Filled dot inside the ring.

CSS prefix: `radio`

### Disabled

Muted ring, and dot if selected. Leaves the tab order.

CSS prefix: `radio`

## States / token groups

### unselected

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ring | --color-icon-neutral-dark | Icon/Neutral/Dark | rgba(92,92,92,1) | rgba(255,255,255,0.50) |

### selected

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ring and dot | --primary | Icon/Primary/Default | #2173ff | #2b7fff |

### disabled

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Ring and dot | --color-text-disabled | Icon/Neutral/Disable-Dark | #bababa | rgba(255,255,255,0.30) |

### hover / focus

Border width: `2px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Container background | --color-surface-primary-subtle | Surface/Primary/Subtle | #E9F1FF | rgba(33,115,255,0.15) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
