# Stepper Nav Footer

**Figma node:** [`8210:21937`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=8210-21937)

Sticky bottom navigation bar for multi-step wizards and guided forms. Provides consistent Cancel/Back ← and Next → controls. Always white (#FFFFFF) with a 1px top separator, anchored to the bottom of the scroll container so it remains visible regardless of scroll position.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| variant | StepperNavFooterVariant | cancel-next,back-next | cancel-next | "cancel-next" on the first step (no Back arrow). "back-next" on all subsequent steps (Back with ArrowLeft icon). |
| cancelLabel | string | string | "Cancel" | Label for the left Cancel button. Only rendered in cancel-next variant. |
| backLabel | string | string | "Back" | Label for the left Back button. Only rendered in back-next variant. |
| onCancel | () => void | function | undefined | Called when Cancel is clicked. Typically dismisses the wizard or routes back to the list view. |
| onBack | () => void | function | undefined | Called when Back is clicked. Typically decrements the current step index. |
| nextLabel | string | string | "Next" | Change to "Submit" or "Finish" on the last step. |
| nextDisabled | boolean | true,false | false | Disables the Next button when the current step has unmet requirements. aria-label communicates the reason to screen readers. |
| onNext | () => void | function | undefined | Called when Next is clicked. Typically increments the step index or submits the form. |
| secondaryLabel | string | string,undefined | undefined | Optional secondary CTA in the right group, e.g. "Save as draft". Only rendered when both secondaryLabel and onSecondary are defined. |
| onSecondary | () => void | function,undefined | undefined | Called when the optional secondary CTA is clicked. |
| className | string | string | — | Extra classes applied to the footer container. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Footer bar | 0 24px | — | 0 | 72px total height · position: sticky; bottom: 0 · z-index: 40 |
| Separator | — | — | — | 1px top border · var(--step-nav-footer-separator) · #E0E0E8 static |
| Right button group | — | 12px | — | flex-row gap-[12px] · secondary CTA (optional) + Next (always) |
| Buttons | 0 16px | 8px | 6px | Size=M (40px height) · matches DS Button size='default' |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Button label | Inter | 14px | 500 (Medium) | 20px |

## Variants / token groups

### Cancel / Next

First step — left button has no icon, dismisses the wizard

CSS prefix: `snf-cancel`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Footer background | --step-nav-footer-bg |  | #FFFFFF | #0D1120 |
| Top separator | --step-nav-footer-separator |  | #BABABA | rgba(255,255,255,0.08) |
| Corner radius | --radius-m |  | 8px | 8px |

### Back / Next

Subsequent steps — Back button has ArrowLeft icon, navigates to previous step

CSS prefix: `snf-back`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Footer background (reused) | --step-nav-footer-bg |  | #FFFFFF | #0D1120 |
| Top separator (reused) | --step-nav-footer-separator |  | #BABABA | rgba(255,255,255,0.08) |
| Corner radius (reused) | --radius-m |  | 8px | 8px |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
