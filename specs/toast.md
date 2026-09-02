# Toast (floating AlertBanner)


Not a separate component — a placement layer over AlertBanner. Each tile is a real &lt;AlertBanner&gt;, portalled to &lt;body&gt;, floated top-right with a 24px inset, auto-dismissed after 3500ms. One feedback language, two placements: in flow when the message should persist, floating when it confirms an action just taken. Stack grows downward, newest last, at z-index 10050 — above SlideOut (10010) and ModalDialog (10020).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| ToastProvider | Component | wraps a subtree | required | Renders the portal stack; descendants can call useToast() |
| useToast() | Hook | { success, info, error, dismiss } | — | Imperative push handlers; no-op fallback outside a provider |
| success/info/error | Method | (title, options?) => void | — | Push a toast of that variant |
| dismiss | Method | (id: number) => void | — | Remove a specific toast before it auto-dismisses |
| variant | Variant | success,info,error | — | Maps 1:1 onto AlertBanner state — no separate visual vocabulary. Sets the icon + left accent stripe |
| duration | Option | number (ms) | 3500 | Auto-dismiss delay; pass 0 to persist until dismissed |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Tile | 12×14px | 12px | 10px | min-w 280px · max-w 380px |
| Accent border | — | — | — | 4px left border · per-state color |
| Icon | — | — | — | 18px · state-colored |
| Close button | — | — | — | 14px × icon · Text/Caption |
| Stack | 24px | 8px | — | Fixed bottom-right · grows upward · z-index 10050 |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Message | Inter | 14px | Medium (500) | 1.43 |

## Variants / token groups

### Success

Completed saves · confirmed non-blocking actions (CheckCircle2 icon)

CSS prefix: `--color-text-success`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Accent + Icon | --color-text-success | — | #003328 | #6ee7b7 |

### Info

Neutral status · background progress · undo affordance (Info icon)

CSS prefix: `--primary`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Accent + Icon | --primary | — | #2b7fff | #2173ff |

### Error

Non-blocking failure feedback (XCircle icon) — errors needing a decision use Modal instead

CSS prefix: `--color-text-error`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Accent + Icon | --color-text-error | — | #5f2120 | #ff6467 |

### Shared chrome

Surface, border, message and elevation shared across all 3 states

CSS prefix: `tile`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Background | --color-surface-neutral-white | — | #FFFFFF | #FFFFFF |
| Border | --color-border-neutral-default | — | #5c5c5c | rgba(255,255,255,0.10) |
| Message | --color-text-title | — | #000000 | rgba(255,255,255,0.80) |
| Close | --color-text-caption | — | #5c5c5c | rgba(255,255,255,0.50) |
| Elevation | --shadow-elevation-3 | — | 4px 4px 12px 2px rgba(0,0,0,0.12) | 4px 4px 12px 2px rgba(0,0,0,0.12) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
