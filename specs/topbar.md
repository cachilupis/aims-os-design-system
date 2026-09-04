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
| Icon color | --topbar-icon |  | rgba(92,92,92,1) | rgba(255,255,255,0.70) |
| Text (workspace name) | --topbar-text |  | rgba(42,42,42,1) | rgba(255,255,255,0.60) |
| Text secondary (company/search) | --topbar-text-secondary |  | rgba(92,92,92,1) | rgba(255,255,255,0.50) |

### TopbarButton — Hover / Focus

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background hover | --topbar-btn-hover-bg |  | rgba(250,250,250,1) | rgba(255,255,255,0.08) |
| Background focus | --topbar-btn-focus-bg |  | rgba(242,242,242,1) | rgba(255,255,255,0.12) |
| Notification badge bg | --topbar-badge-bg |  | rgba(211,47,47,1) | rgba(255,100,103,1) |
| Avatar ring | --topbar-avatar-ring |  | rgba(128,175,255,1) | rgba(43,127,255,0.30) |

### Zone borders

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Workspace / Company border | --topbar-workspace-border |  | rgba(233,241,255,1) | rgba(43,127,255,0.20) |
| Vertical / bottom divider | --topbar-divider |  | rgba(242,242,242,1) | rgba(255,255,255,0.08) |
| Zone hover border | --topbar-zone-hover-bd |  | rgba(43,127,255,0.45) | rgba(43,127,255,0.45) |
| Zone hover background | --topbar-zone-hover-bg |  | rgba(0,0,0,0.03) | rgba(255,255,255,0.04) |

### Search field

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --topbar-search-bg |  | rgba(255,255,255,1) | rgba(255,255,255,0.10) |
| Border | --topbar-search-border |  | rgba(186,186,186,1) | rgba(255,255,255,0.10) |

### Dropdown menu — workspace / company / profile

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --topbar-menu-bg |  | rgba(255,255,255,1) | rgba(22,22,22,1) |
| Item selected | --topbar-menu-item-sel |  | rgba(233,241,255,1) | rgba(33,115,255,0.15) |
| Item label | --topbar-menu-text |  | rgba(42,42,42,1) | rgba(255,255,255,0.80) |
| Secondary text | --topbar-menu-text-dim |  | rgba(92,92,92,1) | rgba(255,255,255,0.45) |

### Shared Menu / Dropdown (reused inside Topbar)

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --menu-bg |  | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Divider | --menu-divider |  | #f2f2f2 | rgba(255,255,255,0.08) |
| Item hover | --menu-item-hover |  | rgba(242,242,242,0.95) | rgba(32,42,62,0.90) |

### Sign out row

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Hover background | --signout-hover-bg |  | rgba(239,68,68,0.07) | rgba(239,68,68,0.07) |
| Icon | --signout-icon |  | rgba(210,47,47,0.65) | rgba(239,68,68,0.65) |
| Text | --signout-text |  | rgba(210,47,47,0.85) | rgba(239,68,68,0.85) |

### Tooltip (hover labels)

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tooltip-bg (Surface/Neutral/Darker) |  | #111827 | #111827 |
| Text | --tooltip-text (Text/Negative) |  | #ffffff | #ffffff |

### FocusChip — active filter row

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Panel background | --fc-bg |  | rgba(255,255,255,0.97) | rgba(20,26,46,0.98) |
| Panel border | --fc-border |  | rgba(0,0,0,0.10) | rgba(255,255,255,0.10) |
| Section label | --fc-label |  | rgba(92,92,92,1) | rgba(255,255,255,0.45) |
| Chip background | --fc-chip-bg |  | transparent | transparent |
| Chip border | --fc-chip-bd |  | rgba(0,0,0,0.18) | rgba(255,255,255,0.18) |
| Chip text | --fc-chip-fg |  | rgba(42,42,42,1) | rgba(255,255,255,0.75) |
| "Clear all" text | --fc-cta-clear |  | rgba(92,92,92,1) | rgba(255,255,255,0.50) |
| Trigger active bg | --fc-trigger-active-bg |  | rgba(33,115,255,0.08) | rgba(33,115,255,0.10) |

### GlobalSearch overlay

Border width: `0.5px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Panel background | --gs-bg |  | rgba(255,255,255,0.97) | rgba(16,22,40,0.94) |
| Panel border | --gs-border |  | rgba(0,0,0,0.10) | rgba(255,255,255,0.08) |
| Backdrop scrim | --gs-scrim |  | rgba(0,0,0,0.25) | rgba(0,0,0,0.45) |
| Divider | --gs-divider |  | rgba(0,0,0,0.07) | rgba(255,255,255,0.06) |
| Input border | --gs-input-border |  | rgba(186,186,186,1) | rgba(255,255,255,0.12) |
| Row hover | --gs-row-hover |  | rgba(0,0,0,0.04) | rgba(255,255,255,0.05) |
| Section label | --gs-section-label |  | rgba(92,92,92,1) | rgba(255,255,255,0.40) |
| Primary text | --gs-text |  | rgba(42,42,42,1) | rgba(255,255,255,0.90) |
| Secondary text | --gs-text-dim |  | rgba(92,92,92,1) | rgba(255,255,255,0.55) |
| Meta text | --gs-text-meta |  | rgba(140,140,140,1) | rgba(255,255,255,0.35) |
| Chip inactive bg | --gs-chip-inactive-bg |  | rgba(242,242,242,1) | rgba(255,255,255,0.08) |
| Chip inactive text | --gs-chip-inactive-fg |  | rgba(42,42,42,1) | rgba(255,255,255,0.70) |
| Kbd shortcut bg | --gs-kbd-bg |  | rgba(242,242,242,1) | rgba(255,255,255,0.08) |
| Kbd shortcut text | --gs-kbd-fg |  | rgba(92,92,92,1) | rgba(255,255,255,0.40) |

### Misc / AI

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Primary button text | --color-button-primary-text-default |  | #ffffff | #ffffff |
| Primary button text disabled | --color-button-primary-text-disabled |  | #f2f2f2 | rgba(255,255,255,0.30) |
| Icon on colored bg | --color-icon-neutral-light |  | #ffffff | #ffffff |
| AI action glow shadow | --shadow-glow-ai |  | 4px 8px 12px 8px rgba(9,226,171,0.16) | 4px 8px 12px 8px rgba(9,226,171,0.16) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
