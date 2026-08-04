# Breakpoints

**Figma node:** [`6729:35011`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=6729-35011)

5-tier responsive system. All layouts must use these breakpoints — no custom values. Defined as Tailwind screen keys: xs / sm / md / lg / xl.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| tier | Variant | xs,sm,md,lg,xl | lg | — |
| device | Variant | Mobile,Tablet,Laptop,Desktop,Wide | Desktop | — |

## Sizes / scale

| Tier | Label | MinWidth | MaxWidth | Tailwind |
| --- | --- | --- | --- | --- |
| xs | Mobile | 0px | 639px | — |
| sm | Tablet | 640px | 767px | sm: |
| md | Laptop | 768px | 1023px | md: |
| lg | Desktop | 1024px | 1439px | lg: |
| xl | Wide | 1440px | ∞ | xl: |

## Variants / token groups

### Tier color palette

Each tier has an accent color used in the DS visualization

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| xs / Mobile | — | — | #f59e0b | #f59e0b |
| sm / Tablet | — | — | #10b981 | #10b981 |
| md / Laptop | — | — | #3b82f6 | #3b82f6 |
| lg / Desktop | — | — | #8b5cf6 | #8b5cf6 |
| xl / Wide | — | — | #ec4899 | #ec4899 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
