# Button

**Figma node:** [`4504:5148`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4504-5148)

6 variants that communicate action hierarchy. Each one signals a different level of visual weight and semantic intent. Max 1–2 Primary or Main Action per screen.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| Type | Variant | Primary,Secondary,Tertiary,Warning,Positive,Main Action | Primary | — |
| Size | Variant | S,M,L | M | — |
| Icon | Variant | None,Left,Right,Alone | None | Alone → icon-only square button, no label |
| Pill | Boolean | true,false | false | Overrides corner radius to 100px (rounded-full) |
| State | Variant | Default,Hover,Focus,Active,Disabled | Default | — |

## Sizes / scale

| Size | Height | FontSize | CornerRadius | PaddingX | Gap | IconAlone |
| --- | --- | --- | --- | --- | --- | --- |
| S | 27px | 12px | 8px | 12px | 4px | 24×24px |
| M | 40px | 14px | 8px | 16px | 8px | 40×40px |
| L | 52px | 16px | 16px | 20px | 12px | 56×56px |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Label S | Inter | 12px | Semi Bold (600) | 1.5 |
| Label M | Inter | 14px | Semi Bold (600) | 1.5 |
| Label L | Inter | 16px | Semi Bold (600) | 1.5 |

## Variants / token groups

### Primary

Highest-weight CTA. Max 1–2 per view.

CSS prefix: `--btn-primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Border/Primary/Default | — | #2173ff | #2b7fff |
| Text | Text/White | — | #ffffff | #ffffff |
| Background hover | — | — | #002f80 | #002f80 |
| Background active | — | — | #001a5c | #001a5c |
| Focus ring | Border/Primary/Default | — | #2173ff | #2b7fff |

### Secondary

Alternative action, same section as Primary. Always pill shape.

CSS prefix: `--btn-secondary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Surface/Neutral/White | — | #ffffff | rgba(255,255,255,0.1) |
| Border | Border/Neutral/Default | — | #5c5c5c | rgba(255,255,255,0.1) |
| Text | Text/Label | — | #2a2a2a | rgba(255,255,255,0.6) |
| Background hover | Surface/Neutral/Default | — | #f2f2f2 | rgba(255,255,255,0.08) |
| Border hover | Surface/Neutral/Emphasis | — | #d9d9d9 | rgba(255,255,255,0.2) |
| Border focus | Border/Neutral/Lighter | — | #bababa | rgba(255,255,255,0.15) |
| Background disabled | Surface/Neutral/Subtle | — | #fafafa | rgba(255,255,255,0.05) |
| Text disabled | Text/Disabled | — | #bababa | rgba(255,255,255,0.3) |

### Tertiary

Cancel, go back, low-weight inline action. No background.

CSS prefix: `--btn-tertiary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | — | — | transparent | transparent |
| Text | Text/Label | — | #2a2a2a | rgba(255,255,255,0.6) |
| Background hover | Surface/Neutral/Subtle | — | #fafafa | rgba(255,255,255,0.05) |
| Background focus | Surface/Neutral/Default | — | #f2f2f2 | rgba(255,255,255,0.08) |

### Warning

Destructive / irreversible actions only. Delete, revoke, purge.

CSS prefix: `--btn-warning`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Color/Destructive | — | #d32f2f | #e05252 |
| Text | Text/White | — | #ffffff | #ffffff |
| Background hover | — | — | #b91c1c | #ff6467 |
| Background active | — | — | #991b1b | #c03030 |
| Focus ring | Color/Destructive | — | #d32f2f | #e05252 |

### Positive

Save, approve, confirm, complete. Confirmative end of a flow.

CSS prefix: `--btn-positive`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | Border/Success/Default | — | #00a07e | #00a07e |
| Text | Text/White | — | #ffffff | #ffffff |
| Background hover | — | — | #003328 | #003328 |
| Background active | — | — | #001f18 | #001f18 |
| Focus ring | Border/Success/Default | — | #00a07e | #00a07e |

### Main Action

High-conversion hero CTA. Used once per screen at the point of maximum attention.

CSS prefix: `gradient (hardcoded)`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Gradient start | — | — | #2173ff | #2173ff |
| Gradient end | — | — | #09e2ab | #09e2ab |
| Shadow default | — | — | #09e2ab29 | #09e2ab29 |
| Shadow hover | — | — | #00c94f59 | #00c94f59 |
| Focus ring | — | — | #cbfff4 | #cbfff4 |
| Hover grad start | — | — | #002f80 | #002f80 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
