# Entity List

**Figma:** [Design System file](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS)

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

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
