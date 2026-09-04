# Notification Center

**Figma node:** [`18695:1059`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=18695-1059)

420px floating panel — the bell icon's dropdown. Header (bell + title + count + "Mark all read ✓" compound control) → filter chips → date-grouped Notification Item list → footer View all. 5 states: Default, Empty, Loading, Error, Offline. Panel surface reuses --surface-floating-default (same concept as Menu/SidePanel/SlideOut) — no dedicated alias since there's no unique tinting.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| state | Variant | default,empty,loading,error,offline | "default" | — |
| count | number | any positive integer | 0 | Shown as "(N)" next to the title |
| groups | Array | { label, items: NotificationItemData[] }[] | [] | Date-grouped rows, e.g. TODAY / YESTERDAY / EARLIER |
| filters | Array | string[] | ["All","Unread"] | Rendered as Chip — active filter uses variant=primary, inactive uses variant=secondary |
| activeFilter | string | any string | "All" | — |
| onFilterChange | Function | (filter) => void | undefined | — |
| onMarkAllRead | Function | () => void | undefined | Fires the compound "Mark all read" control — the text button AND the adjacent check-icon button both call this. Omitting it hides both. Only shown in the default state. |
| onViewAll | Function | () => void | undefined | — |
| emptyTitle / emptyDescription / emptyCtaLabel / onEmptyCta | string/Function | — | "You're all caught up" | Passed through to the reused EmptyState atom |
| errorTitle / errorDescription / retryLabel / onRetry | string/Function | — | "Something went wrong" | Passed through to the reused EmptyState atom |
| offlineMessage | string | any string | "You're offline. Showing cached notifications." | — |

## Sizes / scale

| Size | Dimensions | Padding | Gap | CornerRadius |
| --- | --- | --- | --- | --- |
| Panel | 420×560px | — | — | 8px |
| Header | 420×56px | 16px | 8px | — |
| Filter bar | 420×36px | 8px 16px | 4px | — |
| Footer | 420×52px | 12px 16px | — | — |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Panel title | Inter | 14px | Semi Bold (600) | 1 |
| Count | Inter | 12px | Medium (500) | 1 |
| Date-group label | Inter | 12px | Semi Bold (600) | 1 |
| Offline banner text | Inter | 12px | Medium (500) | 20px |

## States / token groups

### Chrome (all states)

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Panel background | --surface-floating-default |  | rgba(255,255,255,0.92) | rgba(16,22,40,0.92) |
| Divider | --color-border-neutral-lighter |  | #bababa | rgba(255,255,255,0.15) |
| Bell icon | --foreground |  | #1a1a1a | #ffffffcc |

### Header actions (reused)

Mark all read (text) / View all → Button variant=tertiary size=sm. Mark all read (check icon) → Button variant=tertiary size=sm pill iconPosition=alone — both call the same onMarkAllRead, matching the two adjacent instances in Figma's Header > Actions frame.

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Button text (→ Button spec) | --btn-tertiary-fg |  | #2a2a2a | rgba(255,255,255,0.8) |

### Filter chips (reused)

Active → Chip variant=primary size=s. Inactive → Chip variant=secondary size=s. See Chip spec for the full token set.

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Active chip bg (→ Chip spec) | --color-surface-primary-default |  | #2173ff | #2b7fff |
| Inactive chip bg (→ Chip spec) | --chip-secondary-bg |  | #ffffff | rgba(255,255,255,0.1) |

### Offline banner

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --color-surface-alert-more-subtle |  | #fff4e5 | #281e00 |
| Text (reused) | --color-text-alert |  | #663c00 | #fcd34d |

### Loading / Empty / Error (reused)

Loading → Skeleton (circle + text shapes). Empty and Error → EmptyState atom with different title/description/CTA. See their own specs for tokens.

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Skeleton shimmer (→ Skeleton spec) | --skeleton-base |  | see Skeleton spec | see Skeleton spec |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
