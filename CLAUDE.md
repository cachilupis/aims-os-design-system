# AIMS OS — Prototyping rules

Stack: React + Tailwind + shadcn/ui. TypeScript.

## Non-negotiables
- Use ONLY components from `src/components/ui/`. Never hand-roll a button, input, card, table, sidebar, topbar or tabs — import the existing one.
- Use design tokens (Tailwind theme keys / CSS vars). NEVER hardcode hex, px spacing, or radii. If a value isn't in the token scale, stop and ask.
- Match component states to the variants already defined (default, hover, focus, active, disabled, error). Don't invent new variants.
- Default theme is dark. Background = `bg-canvas`, surfaces = `bg-surface`, borders = `border-subtle`.
- Font is Inter. Use the typographic scale in `tailwind.config`, not arbitrary sizes.

## Before generating any screen
1. Check `src/components/ui/` for an existing component that fits.
2. If a Figma node URL is given, pull it via the Figma MCP server and respect Code Connect mappings.
3. If something needed doesn't exist as a component, build the screen with what exists and FLAG the gap in a comment — do not improvise a new component silently.

## Output
- Compose screens from library components. Keep custom CSS to layout only.
- One file per screen under `src/screens/`.
