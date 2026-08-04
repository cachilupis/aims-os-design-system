# Breakpoints

**Figma node:** [`6729:35011`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=6729-35011)

5-tier responsive system, verified live against Figma's "Breakpoint Tokens" table (node 6729:35011, 2026-08-04). All layouts must use these breakpoints — no custom values. Mapped to Tailwind's custom screens (see tailwind.config.js) as sm / md / lg / xl.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| tier | Variant | xs,s,m,l,xl | l | — |
| device | Variant | Mobile,Tablet,Laptop,Desktop,Wide | Desktop | — |

## Sizes / scale

| Tier | Label | MinWidth | MaxWidth | Tailwind |
| --- | --- | --- | --- | --- |
| xs | Mobile | 0px | 599px | — |
| s | Tablet | 600px | 1279px | sm: |
| m | Laptop | 1280px | 1439px | md: |
| l | Desktop | 1440px | 1919px | lg: |
| xl | Wide | 1920px | ∞ | xl: |

## Variants / token groups

### Tier color palette

Each tier has an accent color used in the DS visualization

CSS prefix: `—`

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| xs / Mobile | — | — | #f59e0b | #f59e0b |
| s / Tablet | — | — | #10b981 | #10b981 |
| m / Laptop | — | — | #3b82f6 | #3b82f6 |
| l / Desktop | — | — | #8b5cf6 | #8b5cf6 |
| xl / Wide | — | — | #ec4899 | #ec4899 |

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
