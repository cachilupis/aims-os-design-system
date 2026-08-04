# Informational Card

**Figma node:** [`8057:1259`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8057-1259)

Horizontal notice surface combining icon + title + optional description + optional CTA pair. Uses --ic-* token family (separate from --hi-*). 5 semantic states × 3 sizes.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| state | Variant | informative,alert,error,success,neutral | "informative" | — |
| size | Variant | sm,md,lg | "md" | — |
| title | string | any string | required | Primary message text — 14px semibold |
| description | string | any string | undefined | Optional secondary line below title — 14px medium |
| cta | object | { label, onClick? } | undefined | Primary action button (Button primary sm), right-aligned |
| ctaSecondary | object | { label, onClick? } | undefined | Secondary action button (Button secondary sm), left of primary |
| icon | ReactNode | any | undefined | Overrides default state icon |
| className | string | any string | undefined | — |

## Sizes / scale

| Size | Padding | Height | Notes |
| --- | --- | --- | --- |
| S | 8px | auto | Compact inline use |
| M | 16px | auto | Default — modal dialog, forms |
| L | 24px | auto | Expanded surface, standalone sections |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 14px | Semi Bold (600) | 1.2 |
| Description | Inter | 14px | Medium (500) | 1.4 |

## States / token groups

### Informative

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Primary/Subtle |  | #E9F1FF | rgba(33,115,255,0.12) |
| Icon | Icon/Primary/Default |  | #2173FF | #A8C8FF |
| Text | Text/Info |  | #001740 | #A8C8FF |

### Alert

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Warning/Subtle |  | #FFF4E5 | rgba(237,108,2,0.12) |
| Icon | Icon/Alert/Default |  | #ED6C02 | #FFC070 |
| Text | Text/Alert |  | #663C00 | #fcd34d |

### Error

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Error/Subtle |  | #FDEDED | rgba(220,38,38,0.12) |
| Icon | Icon/Error/Default |  | #992222 | #FF9898 |
| Text | Text/Error |  | #5F2120 | #ff6467 |

### Success

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Success/Subtle |  | #E5FDF8 | rgba(0,169,127,0.12) |
| Icon | Icon/Success/Default |  | #00A07E | #70EDD8 |
| Text | Text/Success |  | #003328 | #70EDD8 |

### Neutral

Border width: `0`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/Default |  | #F2F2F2 | rgba(255,255,255,0.08) |
| Icon | Icon/Neutral/Dark |  | #2A2A2A | rgba(255,255,255,0.50) |
| Text | Text/Primary |  | #2A2A2A | rgba(255,255,255,0.70) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
