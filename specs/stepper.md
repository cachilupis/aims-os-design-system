# Stepper

**Figma node:** [`8210:40358`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8210-40358)

Horizontal multi-step progress indicator. Communicates position in a multi-stage flow (onboarding, wizards, configuration sequences). Five step states cover all scenarios: Default (upcoming), Active (current), Completed (done), Locked (not yet accessible), View-only (read-only review).

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| steps | StepItem[] | StepItem[] | — | Array of step descriptors. Each item: { label: string, state: StepState, icon?: LucideIcon }. When icon is set, renders via HighlightIcon sm. When omitted, shows step number. |
| onStepClick | (index: number) => void | function,undefined | undefined | Optional click handler. Receives 0-based index. Locked steps are always non-clickable. |
| className | string | string | — | Extra Tailwind classes applied to the <ol> wrapper. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Step dot | — | — | 4px | 24×24px · Radius-S — flex container for icon or number |
| Dot → label | — | 4px | — | 4px gap between dot and label text |
| Separator (ChevronRight) | 16px mx | — | — | ChevronRight 16×16px · 16px margin each side · Icon/Neutral/Disabled color |
| Icon (dot) | — | — | — | 12px — Check (Completed), Lock (Locked), 11px number (others) |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Active label | Inter | 14px | 600 (SemiBold) | normal |
| Default label | Inter | 14px | 500 (Medium) | 20px |
| Step number | Inter | 12px | 600 (SemiBold) | 1 |

## Variants / token groups

### Active & Completed

The dot is rendered by the HighlightIcon atom (variant=informative, iconColor=dark) — NOT by dedicated --stepper-dot-*/--stepper-icon-* tokens (those exist in index.css but are never read by stepper.tsx). Real colors come from HighlightIcon's own informative variant.

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill (→ HighlightIcon informative) | --hi-informative-bg |  | #E9F1FF | rgba(33,115,255,0.14) |
| Icon color (→ HighlightIcon informative, dark) | --hi-informative-icon |  | #001740 | #A8C8FF |
| Label color | --stepper-label-active |  | #2a2a2a | rgba(255,255,255,0.60) |

### Default & View-only

Dot rendered by HighlightIcon (variant=neutral, iconColor=dark).

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill (→ HighlightIcon neutral) | --hi-neutral-bg |  | #F2F2F2 | rgba(255,255,255,0.08) |
| Icon color (→ HighlightIcon neutral, dark) | --hi-neutral-icon |  | #2A2A2A | rgba(255,255,255,0.70) |
| Label color | --stepper-label-default |  | — | #94A3B8 |

### Locked

Dot rendered by HighlightIcon (variant=neutral, iconColor=default → the softer 'icon-soft' tone, not the 'dark' tone used by Default/Active).

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill (reused, → HighlightIcon neutral) | --hi-neutral-bg |  | #F2F2F2 | rgba(255,255,255,0.08) |
| Lock icon (→ HighlightIcon neutral, default) | --hi-neutral-icon-soft |  | #6B7280 | rgba(255,255,255,0.40) |

### Connector

ChevronRight 16×16px between steps · 16px margin each side

CSS prefix: `stepper-connector`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Chevron color | --stepper-connector |  | #bababa | rgba(255,255,255,0.30) |

### Unused tokens (defined in index.css, never read by stepper.tsx)

The component delegates dot fill/icon color to the HighlightIcon atom — these dedicated stepper tokens are orphaned.

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill active (unused) | --stepper-dot-active-bg |  | #E9F1FF | rgba(33,115,255,0.15) |
| Icon color active (unused) | --stepper-icon-active |  | #001740 | #155dfc |
| Dot fill default (unused) | --stepper-dot-default-bg |  | #f2f2f2 | rgba(255,255,255,0.06) |
| Icon color default (unused) | --stepper-icon-default |  | #3F3F46 | rgba(255,255,255,0.50) |
| Lock icon (unused) | --stepper-icon-locked |  | #bababa | rgba(255,255,255,0.30) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
