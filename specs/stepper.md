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

Primary-tinted dot · SemiBold 600 label · aria-current=step

CSS prefix: `stepper-active`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill | --stepper-dot-active-bg | Surface/Primary/Subtle | #E9F1FF | rgba(33,115,255,0.15) |
| Icon color | --stepper-icon-active | Icon/Primary/Darker | #001740 | #155dfc |
| Label color | --stepper-label-active | Text/Subtitle | #2a2a2a | rgba(255,255,255,0.60) |

### Default & View-only

Neutral dot · Medium 500 label · upcoming or read-only steps

CSS prefix: `stepper-default`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Dot fill | --stepper-dot-default-bg | Surface/Neutral/Default | #f2f2f2 | rgba(255,255,255,0.06) |
| Icon color | --stepper-icon-default | Icon/Neutral/Dark | #3F3F46 | rgba(255,255,255,0.50) |
| Label color | --stepper-label-default | Text/Body | #5C5C5C | #94A3B8 |

### Locked

Neutral dot · Lock icon · non-interactive, aria-disabled=true

CSS prefix: `stepper-locked`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Lock icon | --stepper-icon-locked | Icon/Neutral/Disabled | #bababa | rgba(255,255,255,0.30) |

### Connector

ChevronRight 16×16px between steps · 16px margin each side

CSS prefix: `stepper-connector`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Chevron color | --stepper-connector | Icon/Neutral/Disabled | #bababa | rgba(255,255,255,0.30) |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
