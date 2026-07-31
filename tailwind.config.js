/**
 * tailwind.config.js — AIMS OS Design System
 *
 * Collections synced from Figma variable collections (file: v6rmYKA2zmyXWOahlxLOeI):
 *   - "Space and Radios Tokens" (21 vars) → spacing + borderRadius
 *   - "Type Tokens" (54 vars) → fontSize, fontWeight
 *
 * There is NO `colors` block here on purpose (removed 2026-07-31, token
 * consolidation pass). Every component reads color via `var(--token-name)`
 * directly (arbitrary-value classes or inline style) from src/index.css,
 * which is the single canonical, actively-synced color token layer.
 * A hardcoded color duplicate of index.css used to live here — confirmed
 * unused by every component (including canvas/node-bg/badge, which looked
 * live but weren't) and already drifted from Figma in several places.
 * Do not re-add a `colors` block — reference index.css vars instead.
 */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      // ─── Spacing — Space and Radios Tokens ───────────────────────────────────
      spacing: {
        "0x":   "0px",
        "0-5x": "2px",
        "1x":   "4px",
        "2x":   "8px",
        "3x":   "12px",
        "4x":   "16px",
        "5x":   "20px",
        "6x":   "24px",
        "7x":   "32px",
        "10x":  "40px",
        "12x":  "48px",
        "16x":  "64px",
        "20x":  "80px",
      },

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

      // ─── Typography — Type Tokens ─────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        "type-xs":   ["10px", { lineHeight: "1.4" }],  // Caption XS
        "type-sm":   ["12px", { lineHeight: "1.5" }],  // Caption S / Label S / Body S
        "type-base": ["14px", { lineHeight: "1.5" }],  // Body M / Label M / Caption M
        "type-md":   ["16px", { lineHeight: "1.5" }],  // Body L / Label L / Subtitle M
        "type-lg":   ["18px", { lineHeight: "1.4" }],  // Title S / Subtitle L
        "type-xl":   ["20px", { lineHeight: "1.3" }],  // Title M
        "type-2xl":  ["24px", { lineHeight: "1.3" }],  // Title L
        "type-3xl":  ["32px", { lineHeight: "1.2" }],  // Display M
        "type-4xl":  ["40px", { lineHeight: "1.2" }],  // Display L
        "type-5xl":  ["48px", { lineHeight: "1.1" }],  // Display XL
      },

      fontWeight: {
        regular:   "500",  // Body/Regular, Caption/Regular, Link/Regular
        semibold:  "600",  // Title, Subtitle, Label Bold
        bold:      "700",  // Display/Bold
        extrabold: "800",  // Display/ExtraBold
        black:     "900",  // Display/Black
      },
    },
  },
};
