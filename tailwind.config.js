/**
 * tailwind.config.js — AIMS OS Design System
 *
 * Collection synced from Figma (file: v6rmYKA2zmyXWOahlxLOeI):
 *   - "Space and Radios Tokens" → borderRadius
 *
 * Spacing and typography use Tailwind's NATIVE scale directly (p-2, gap-4,
 * text-sm, font-medium, etc.) — no custom overrides. Verified live against
 * Figma 2026-08-04: Figma's real spacing scale (Spacing/0x..20x, each Nx =
 * N×4px) and its "DESIGN TOKENS — NEW TYPE SYSTEM" table both match
 * Tailwind's defaults exactly (or within 2-4px on the two least-used Display
 * sizes) — a custom scale duplicating names Tailwind already provides was
 * pure risk (see the former "7x": "32px" entry, which was really Figma's
 * "8x" mislabeled — Figma's own scale has no 7x step at all). Only use
 * font weights 500 (font-medium), 600 (font-semibold), and 900 (font-black)
 * per Figma's explicit rule — do not use font-bold or font-extrabold.
 *
 * There is NO `colors` block here on purpose (removed 2026-07-31, token
 * consolidation pass). Every component reads color via `var(--token-name)`
 * directly (arbitrary-value classes or inline style) from src/index.css,
 * which is the single canonical, actively-synced color token layer.
 * Do not re-add a `colors` block — reference index.css vars instead.
 */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      // ─── Border Radius — Space and Radios Tokens ─────────────────────────────
      borderRadius: {
        none:  "0px",
        xs:    "2px",
        sm:    "4px",
        md:    "8px",
        lg:    "16px",
        xl:    "24px",
        "2xl": "32px",
        full:  "100px",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
