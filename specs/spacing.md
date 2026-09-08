# Spacing Scale

**Figma node:** [`4492:12478`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=4492-12478)

4px base grid, 11 steps (0–64px). Unlike other foundation tokens, spacing has no --spacing-* CSS variable — apply it directly via Tailwind arbitrary-value classes (e.g. gap-[24px], p-[16px]) matching the step below.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| step | Token | 0x,1x,2x,3x,4x,5x,6x,8x,10x,12x,16x | 4x | Pick the step that matches the relationship being spaced, not an arbitrary pixel value |

## Sizes / scale

| Token | Px | Usage |
| --- | --- | --- |
| spacing.0 | 0px | Reset — remove spacing between elements |
| spacing.1 | 4px | Micro — icon to text, tight inline spacing |
| spacing.2 | 8px | Small — gaps inside buttons, inputs, chips |
| spacing.3 | 12px | Compact — grouping inside dense components |
| spacing.4 | 16px | Standard — card padding, container insets |
| spacing.5 | 20px | Medium — stacked elements, list item padding |
| spacing.6 | 24px | Section — gap between modules and nav layers |
| spacing.8 | 32px | Layout — horizontal page padding, modal insets |
| spacing.10 | 40px | Loose — large layout separation, form groups |
| spacing.12 | 48px | Page — section padding, panel top insets |
| spacing.16 | 64px | Hero — full-page section spacing, scroll guard |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
