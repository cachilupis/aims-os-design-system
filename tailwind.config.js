/**
 * tailwind.config.js — AIMS OS
 *
 * SINGLE SOURCE OF TRUTH for tokens in code.
 * Stays in sync with the Figma variable collections:
 *   - "Semantic Color Tokens" (162)  -> colors
 *   - "Space and Radios Tokens" (21) -> spacing + borderRadius  [values below are REAL]
 *   - "Type Tokens" (54)             -> typography scale (pull via Figma MCP)
 *   - "Primitives Tokens" (189)      -> raw primitives the semantic tokens reference
 * Recommended: auto-generate this file from a tokens.json exported from Figma,
 * so nobody types a value by hand.
 */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Seed values from the AIMS OS dark theme. Replace with the exact
        // "Semantic Color Tokens" pulled from Figma during setup.
        canvas:   "#0A0E1A",
        surface:  "#0D1120",
        primary:  "#3B6CFF",
        success:  "#00D68F",
        warning:  "#FF8C42",
        danger:   "#FF4D6A",
        caution:  "#FFD166",
        accent:   "#9B6BFF",
        "text-primary":   "#EDF1FF",
        "text-secondary": "#8898C0",
        "text-tertiary":  "#4A5675",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.09)",
      },
      // Spacing — EXACT values from "Space and Radios Tokens" (px).
      // Names mirror the Figma tokens so Claude can map 1:1 (Figma "2x" -> class p-2x).
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
      // Radius — EXACT values from "Space and Radios Tokens" (px).
      borderRadius: {
        none: "0px",
        xs:   "2px",   // Radius-XS
        sm:   "4px",   // Radius-S
        md:   "8px",   // Radius-M
        lg:   "16px",  // Radius-L
        xl:   "24px",  // Radius-XL
        "2xl":"32px",  // Radius-XXL
        full: "100px", // Radius-Full
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      // TODO: add the typographic scale from "Type Tokens" (sizes, weights,
      // line-heights). Pull these via the Figma MCP during setup.
    },
  },
};
