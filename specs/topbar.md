# Topbar

**Figma node:** [`8603:52598`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8603-52598)

Global navigation bar placed at the top of the app shell. 36px default, 34px tablet. Three fixed zones: left workspace selector, center search trigger, right actions + profile.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| workspaceName | string | any string | "Product Name" | Displayed in left zone, truncates if too long |
| workspaceAvatarSrc | string | image URL | undefined | Falls back to initials + primary color |
| onWorkspaceClick | Function | () => void | undefined | Opens workspace/Left Menu dropdown |
| searchPlaceholder | string | any string | "Search…" | Center zone trigger label |
| onSearchFocus | Function | () => void | undefined | Opens Global Search overlay (700×592px) |
| actions | Array | TopbarAction[] | [] | Max 3 shown. { icon, label, badge?, onClick? } |
| logo | ReactNode | any | 4-dot placeholder | Replace with actual isotipo/brand mark |
| companyName | string | any string | "Company" | Shown in Sub-group B, truncates |
| onCompanyClick | Function | () => void | undefined | Opens company selector/Left Menu |
| userName | string | any string | "User" | Profile avatar initials fallback |
| onProfileClick | Function | () => void | undefined | Opens user profile/Right Menu |
| variant | Variant | default,tablet | "default" | Tablet adds hamburger button; left zone → 172px |
| onMenuClick | Function | () => void | undefined | Tablet only — hamburger tap |

## Sizes / scale

| Size | Height | LeftZone | CenterZone | RightZone | Padding |
| --- | --- | --- | --- | --- | --- |
| Default | 36px | 140×28px | 250×24px | 232×28px | t:4 r:8 b:0 l:8 |
| Tablet | 34px | 172×28px (+ hamburger) | 250×24px | 232×28px | t:4 r:8 b:2 l:8 |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Workspace name | Inter | 10px | Semi Bold (600) | 1 |
| Company name | Inter | 10px | Regular (400) | 1 |
| Search label | Inter | 11px | Regular (400) | 1 |

## States / token groups

### TopbarButton — Default

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | — |  | transparent | transparent |
| Icon color | Icon/Neutral/Dark |  | rgba(92,92,92) | rgba(255,255,255,0.50) |

### TopbarButton — Hover

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/Hover |  | #fafafa | rgba(255,255,255,0.08) |
| Badge bg | Error/Notification |  | rgba(211,47,47) | rgba(255,100,103) |

### Zone borders

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Workspace / Company border | Border/Primary/Subtle |  | rgba(233,241,255) | rgba(43,127,255,0.20) |
| Vertical divider | Border/Neutral/Subtle |  | rgba(242,242,242) | rgba(255,255,255,0.08) |
| Bottom divider | Border/Neutral/Subtle |  | rgba(242,242,242) | rgba(255,255,255,0.08) |

### Search field

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White |  | #ffffff | rgba(255,255,255,0.10) |
| Border | Border/Neutral/Lighter |  | rgba(186,186,186) | rgba(255,255,255,0.10) |
| Placeholder | Text/Body |  | rgba(92,92,92) | rgba(255,255,255,0.50) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
