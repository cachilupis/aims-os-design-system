# Entity List

**Figma node:** [`4770:5089`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4770-5089)

High-density list row for entities — conversations, tickets, tasks. Composes icon highlight or avatar, primary meta, AI insight, description, secondary meta, tags, actions, and state tag. Row background/border/hover are NOT its own — in Figma this component is always embedded as a slot inside Card Container, which provides the row's background/border and already signals interactivity via its own hover state (confirmed: every real usage in this repo wraps <EntityList> in <CardContainer>; design decision, Michael, confirmed no per-row hover treatment needed on top of the Card's). AI callout tokens confirmed live against Figma node 11838:24922 ("IA Insight - List Entity") — it reuses the standard Tag purple tokens, not a dedicated AI color.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| items | Array | EntityListItemData[] | required | — |
| title | string | any string | required | Primary label — 16px semibold |
| iconVariant | Variant | yellow,success,error,info,neutral,purple,light-blue | undefined | HighlightIcon container color |
| iconName | string | Lucide icon name | undefined | — |
| avatarName | string | any string | undefined | Derives 2-letter initials; shown if no icon |
| primaryMeta | Array | ELMetaItem[] | undefined | { iconName?, label?, tooltip?, tag? } |
| secondaryMeta | Array | ELMetaItem[] | undefined | Bottom-left row of icon+label pairs |
| description | string | any string | undefined | Collapsible body text |
| aiInsight | object | { action, detail, showLabel?, viewMore? } | undefined | Purple AI callout with Sparkle icon |
| tags | Array | { label }[] | undefined | — |
| actions | Array | ELAction[] | undefined | { label, variant: primary|secondary|tertiary } |
| state | object | { label, variant } | undefined | Semantic Tag shown right-side |
| timestamp | string | any string | undefined | — |
| pinned | Boolean | true,false | false | Red Pin tag next to primary meta |
| showMenu | Boolean | true,false | false | 3-dot kebab menu at far right |
| showCheckbox | Boolean | true,false | false | Leading checkbox for multi-select |

## Sizes / scale

| Density | MinHeight | Padding | Notes |
| --- | --- | --- | --- |
| Default | 72px | t:12 r:16 b:12 l:16 | With description expanded |
| Compact | 48px | t:8 r:16 b:8 l:16 | Title + meta only, no description |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 16px | Semi Bold (600) | 1.2 |
| Description | Inter | 13px | Regular (400) | 1.5 |
| Meta label | Inter | 12px | Regular (400) | 1 |
| AI insight | Inter | 12px | Medium (500) | 1.4 |

## States / token groups

### AI callout

Border width: `1px`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --tag-purple-bg (Surface/Purple/More Subtle) |  | #f3e9fd | #120520 |
| Icon | --tag-purple-bd (Icon/Purple/Default) |  | #7b27ed | #a855f7 |
| Text | --tag-purple-fg (Text/Purple) |  | #2c075c | #d8b4fe |

### Icon Highlight — 7 variants

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Yellow bg | --hi-yellow-bg |  | #FFEEDB | rgba(202,138,4,0.14) |
| Yellow icon | --hi-yellow-icon |  | #5C3500 | #FFE070 |
| Success bg | --hi-success-bg |  | #CBFFF4 | rgba(0,169,127,0.14) |
| Success icon | --hi-success-icon |  | #003328 | #70EDD8 |
| Error bg | --hi-error-bg |  | #FDEDED | rgba(220,38,38,0.14) |
| Error icon | --hi-error-icon |  | #5F2120 | #FF9898 |
| Informative bg | --hi-informative-bg |  | #E9F1FF | rgba(33,115,255,0.14) |
| Informative icon | --hi-informative-icon |  | #001740 | #A8C8FF |
| Neutral bg | --hi-neutral-bg |  | #F2F2F2 | rgba(255,255,255,0.08) |
| Neutral icon | --hi-neutral-icon |  | #2A2A2A | rgba(255,255,255,0.70) |
| Purple bg | --hi-purple-bg |  | #E4CEFC | rgba(124,58,237,0.14) |
| Purple icon | --hi-purple-icon |  | #2C075C | #D4A0FF |
| Light Blue bg | --hi-lightblue-bg |  | #CCF1FF | rgba(2,132,199,0.14) |
| Light Blue icon | --hi-lightblue-icon |  | #02445A | #80DCFF |

### Avatar & Separators

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Avatar ring (initials fallback) | --el-avatar-ring |  | rgba(128,175,255,0.80) | rgba(128,175,255,0.50) |
| Meta bullet separator (•) | --el-bullet |  | #d9d9d9 | rgba(255,255,255,0.18) |

### Text & Actions

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Title / description text | --foreground |  | #1a1a1a | #ffffffcc |
| Meta labels, timestamp, icons | --muted-foreground |  | #5c5c5c | #ffffff99 |
| Secondary action bg (hover) | --muted |  | #0000000a | #ffffff0d |
| Divider / secondary action border | --border |  | rgba(33,115,255,0.13) | #ffffff1a |
| Primary action bg | --primary |  | #2173ff | #2b7fff |
| Primary action text | --primary-foreground |  | #ffffff | #ffffff |

### Metadata Tooltip

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Tooltip background | --tooltip-bg (Surface/Neutral/Darker) |  | #111827 | #111827 |
| Tooltip text | --tooltip-text (Text/Negative) |  | #ffffff | #ffffff |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
