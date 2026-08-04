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
 *
 * `screens` (below, replaces Tailwind's defaults rather than extending them)
 * matches Figma's real "Breakpoint Tokens" table (node 6729:35011, verified
 * live 2026-08-04): S=600px / M=1280px / L=1440px / XL=1920px. Tailwind's
 * own defaults (640/768/1024/1280/1536) don't match Figma at all, and
 * BREAKPOINTS_SPEC in App.tsx previously documented a third, also-wrong
 * scale (640/768/1024/1440) that didn't match either. No real component
 * used any responsive prefix at the time this was fixed (only the docs
 * site's own layout grids did) — fixed before that changed.
 */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    screens: {
      sm: "600px",
      md: "1280px",
      lg: "1440px",
      xl: "1920px",
    },
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
