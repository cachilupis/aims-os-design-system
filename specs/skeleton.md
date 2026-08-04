# Skeleton

**Figma node:** [`5992:6760`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=5992-6760)

Loading placeholder that mirrors the shape and size of real content. A linear shimmer (left→right, 1.2s, infinite) signals ongoing data fetching without blocking the UI. Three shape variants cover all common content types.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| shape | SkeletonShape | rectangle,circle,text | rectangle | Controls border-radius: rectangle=12px (Radius-L), circle=50% (Radius-Full), text=4px (Radius-XS). |
| width | string | number | string,number | 100% | CSS width. Accepts px number or any CSS string. Defaults to full container width. |
| height | string | number | string,number | 16px | CSS height. Accepts px number or any CSS string. Defaults to 16px (text line height). |
| className | string | string | — | Extra Tailwind classes applied to the skeleton div. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Rectangle radius | — | — | 12px | Radius/Radius-L — cards, image blocks, containers |
| Circle radius | — | — | 50% | Radius/Full — avatars, icon placeholders |
| Text radius | — | — | 4px | Radius/Radius-XS — titles, body lines, captions |
| Default height | — | — | — | 16px — matches standard text line height |

## Variants / token groups

### Skeleton

Shimmer gradient over a neutral base — 1.2s linear infinite

CSS prefix: `skeleton`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Base fill | --skeleton-base | Surface/Neutral/Default | #f2f2f2 | rgba(255,255,255,0.06) |
| Shimmer peak | --skeleton-shimmer | Surface/Neutral/Emphasis | rgba(217,217,217,0.8) | rgba(255,255,255,0.12) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
