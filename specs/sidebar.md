# Sidebar

**Figma node:** [`8572:42410`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8572-42410)

Vertical navigation rail. Always renders on a dark background regardless of mode. Expanded (250px) shows icon + label; Collapsed (56px) shows icon-only with tooltips.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| items | Array | SidebarItem[] | required | { id, label, icon: Lucide name, badge? } |
| activeId | string | any item id | undefined | Highlights the active nav item with gradient + glow |
| onSelect | Function | (id: string) => void | undefined | — |
| collapsed | Boolean | true,false | false | Collapsed = 56px icon-only rail |
| onCollapse | Function | () => void | undefined | Toggle callback for the collapse chevron button |
| className | string | any string | undefined | — |

## Sizes / scale

| State | Width | IconSize | LabelSize | Gap | Notes |
| --- | --- | --- | --- | --- | --- |
| Expanded | 250px | 24×24px | 13px | 4px | Icon + text label, always dark bg |
| Collapsed | 56px | 24×24px | — | — | Icon only, tooltip on hover |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Nav label | Inter | 12px | Semi Bold (600) | 1 |

## States / token groups

### Default

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Container bg | --sb-bg |  | #000000 | #0f172b |
| Icon | --sb-icon-default |  | rgba(128,175,255,1) | rgba(128,175,255,0.90) |
| Label | --sb-text |  | #ffffff | #ffffff |

### Hover

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Row bg (expanded only) | --sb-row-hover |  | #2a2a2a | rgba(255,255,255,0.20) |
| Icon square bg | --sb-icon-hover-bg |  | #000000 | #0f172b |
| Icon | --sb-icon-active |  | #ffffff | #ffffff |
| Glow shadow | — |  | rgba(33,115,255,0.50) blur:20 | rgba(33,115,255,0.50) blur:20 |

### Active

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Icon bg | — |  | radial-gradient(circle at 61% 68%, #2173FF 29%, #09E2AB 61%) | radial-gradient(circle at 61% 68%, #2173FF 29%, #09E2AB 61%) |
| Icon (reused) | --sb-icon-active |  | #ffffff | #ffffff |
| Chevron | --sb-chevron-active |  | rgba(233,241,255,1) | rgba(233,241,255,1) |
| Teal shadow | — |  | rgba(82,163,255,0.38) offset(8,8) blur:20 | rgba(82,163,255,0.38) offset(8,8) blur:20 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
