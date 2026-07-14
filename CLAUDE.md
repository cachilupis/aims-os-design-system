# AIMS OS — Prototyping rules

Stack: React + Tailwind + shadcn/ui. TypeScript.

---

## Non-negotiables

- Use ONLY components from `src/components/ui/`. Never hand-roll a button, input, card, table, sidebar, topbar or tabs — import the existing one.
- Use design tokens (CSS vars). NEVER hardcode hex, rgba, px spacing, or radii. If a value isn't in the token scale, stop and inform the user before creating a new token.
- Match component states to the variants already defined (default, hover, focus, active, disabled, error). Don't invent new variants.
- Default theme is dark. Background = `var(--canvas)`, surfaces = `var(--surface)`, borders = `var(--field-border)`.
- Font is Inter. Use the typographic scale in `tailwind.config`, not arbitrary sizes.
- All colors via `var(--token-name)`. No exceptions in `.tsx` files.

---

## Before generating any screen

1. Check `src/components/ui/` for an existing component that fits.
2. If a Figma node URL is given, fetch it via the Figma MCP server before writing a single line of code.
3. If something needed doesn't exist as a component, build the screen with what exists and FLAG the gap in a `// GAP:` comment — do not improvise a new component silently.

---

## Pattern composition — how to assemble views

Use established patterns from `src/App.tsx` as templates. Never compose from scratch.

### List View screens
Stack in this exact order:
1. `Topbar` — top navigation bar
2. `Sidebar` — left nav (use `AppBackground` as page wrapper)
3. Content area:
   - `Tabs` — "Where am I?" (e.g. All Workers / Teams)
   - `SwitchTab` — "How am I viewing?" (e.g. List / Grid) — only when needed
   - `Filters` — "What do I see?" (always present when there's a filterable dataset)
   - `EntityList` inside `CardContainer` — one card per item, 12px gap
   - `Pagination` — only when `total_results > rows_per_page`

Entity items must include actions in this order: **primary → secondary → tertiary (Eye/preview)**.
The Eye button always opens a `SlideOut` with item detail.

Use `ListViewSection` from `src/components/layouts/list-view-section.tsx` to get this structure pre-wired.

### Filter system
Three layers — always compose in this order:
1. **Visible Filters** (`Filters` component) — always shown
2. **All Filters button** → opens `FiltersSlideout`
3. **Applied chips** (`Tag` or `Chip`) — appear below filters after Apply, show active state

Rules:
- Closing `FiltersSlideout` without Apply discards draft state; list does not change.
- Apply → sync draft to applied → reset pagination to page 1 → close slideout.
- Chips are optional; the system works without them.

### Navigation depth (multiple layers)
Maximum 2 navigation layers:
- `Tabs` — primary navigation (Where am I?)
- `SwitchTab` — secondary view toggle (How am I viewing?)
- `Filters` — dataset control (What do I see?)

24px gap between Filters and the first chip/card row. 12px gap between entity cards.

### Overlays
- **`ModalDialog`** — user MUST stop (destructive action, confirmation, critical form)
- **`SlideOut`** — user can continue browsing (details, filters, context)
- Rule: can the user ignore it? → SlideOut. Must they respond? → Modal.
- Only 1 Modal + 1 SlideOut active at a time.

### Header sticky
- Scroll == 0 → DEFAULT (full header)
- Scroll > 16px → COMPRESSED (60px, title + status + CTA)
- Hover 0–24px from top AND cursor idle 3s → COMPRESSED_WITH_FILTERS

### Pagination
- Show only when `total_results > rows_per_page`.
- Any filter/sort/tab change → reset to page 1.

---

## Dropdown menus (filter slots)

Dropdowns must appear **centered below the clicked slot button**, not at the mouse position.
Pattern:
```tsx
onClickCapture={(e: React.MouseEvent) => {
  const btn = (e.target as HTMLElement).closest('button')
  const left = btn
    ? btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2
    : e.clientX
  setAnchor({ left, top: (e.currentTarget as HTMLElement).getBoundingClientRect().bottom })
}}
// Dropdown div:
style={{ position: "fixed", left: anchor.left, top: anchor.top + 4, transform: "translateX(-50%)", zIndex: 10001 }}
```

---

## Experimental components — when something doesn't exist in the DS

If a screen requires a component that doesn't exist in `src/components/ui/`:

**Step 1 — Try composition first.** Can the result be achieved by combining existing DS components (CardContainer, Tag, EntityList, Button, etc.)? If yes, compose — no new component needed.

**Step 2 — If genuine gap, create in `src/components/experimental/`**, never in `ui/`. The file must:
- Use ONLY `var(--token)` — no hex, no rgba
- Start with a `// DS-GAP:` comment on line 1:
  ```tsx
  // DS-GAP: MetricCard — KPI card with trend delta. Closest DS component: CardContainer.
  ```
- Accept `variant?`, `size?`, `className?` props at minimum
- Never introduce new color semantics — only arrange existing token values

**Step 3 — Continue prototyping.** The PM doesn't need to know this happened. The DS-GAP comment is the handoff artifact for Design to audit later.

**Never move anything from `experimental/` to `ui/`** without explicit instruction from Michael (Product Design).

---

## Anti-patterns — never do these

- Hardcoding `#hex` or `rgba(...)` in `.tsx` — use `var(--token)`.
- Using `position: absolute` for overlays — use `position: fixed` with `getBoundingClientRect()`.
- Rendering dropdowns inside `overflow: hidden` parents — use fixed positioning to escape.
- Creating a new button/input/card component when `src/components/ui/` has one.
- Showing two secondary buttons side by side — order is always primary → secondary → tertiary.
- Adding a filter chip before Apply is clicked.
- Opening a Modal for non-destructive/non-blocking content — use SlideOut instead.
- Showing a loading indicator for operations under 300ms.
- Showing two loading indicators on the same view simultaneously.

---

## Output — how to add a PM prototype screen

Each PM prototype lives in its own file in `src/screens/`. App.tsx only gets a registration entry.

**Step 1 — Create the screen file:**
```
src/screens/[pm-name]-[feature].tsx
```
Export a single default React component.

**Step 2 — ALWAYS wrap the screen in `ScreenLayout`** (mandatory — no exceptions):

```tsx
import { ScreenLayout }    from "@/components/layouts/screen-layout"
import { ListViewSection } from "@/components/layouts/list-view-section"
import type { SidebarItem } from "@/components/ui/sidebar"

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "ai-workers", label: "AI Workers", icon: "Bot" },
  // ... other app sections
]

export default function MyScreen() {
  return (
    <ScreenLayout
      workspaceName="Tenant Name"
      userName="PM Name"
      userEmail="pm@company.com"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="ai-workers"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Page Title"
          description="Page description."
          primaryAction={<Button variant="main" size="sm">New Item</Button>}
        />
      )}
    >
      {/* Filters + entity list + pagination */}
      <ListViewSection items={pagedItems} filterSlots={...} ... />
    </ScreenLayout>
  )
}
```

`ScreenLayout` bakes in the DS-spec layout values so they can't drift:
- Horizontal margin: **32px** (L Desktop 1440px — DS standard baseline, confirmed in all pattern previews)
- Content padding: **8px top · 32px sides · 64px bottom**
- Sidebar: collapsed by default (56px)
- Header zone: outside the scrollable area — stays visible when the list scrolls
- Scroll detection: `isScrolled` fires at `scrollTop > 16px` (matches Header compress threshold)

`ListViewSection` handles Filters + filter dropdown + EntityList + Pagination with no extra padding (the parent already provides it). Key rules for ListViewSection:
- Pass `currentPage`, `totalItems`, `itemsPerPage`, `onPageChange` to get the DS `<Pagination>` component — it auto-hides when `totalItems ≤ itemsPerPage`
- Set `showPreview={false}` and wire your own `SlideOut` outside `ListViewSection` when you need custom detail content
- Set `showPreview={true}` for a quick default preview without custom content

**Step 3 — Register in App.tsx** (the only change to App.tsx):
```tsx
import MyScreen from "./screens/pm-juan-dashboard"

{ id: "proto-juan-dashboard", label: "Dashboard — Juan", description: "Adoption metrics view", author: "Juan", component: MyScreen },
```

The screen appears in the "Prototypes" sidebar group and opens full-screen (no DS library shell).

**Rules:**
- Screen files: only `var(--token)` colors, only `src/components/ui/` and `src/components/layouts/` components.
- App.tsx: only the import + registry entry. No new functions, no new routes.
- NEVER hardcode pixel values for padding or spacing — use ScreenLayout and let it handle margins.
- Validate with `npx tsc -b --noEmit` before marking complete.
- Never push to production without Michael's visual sign-off on localhost first.

---

## When a PM needs a UI element the DS doesn't have yet

PMs will often ask for something that doesn't exist in `src/components/ui/` — a metric card, a timeline, a custom chart. Follow these steps in order:

**Step 1 — Try DS composition first.**
Can the result be built by combining existing DS components (`CardContainer`, `Tag`, `EntityList`, `Table`, `HighlightCard`, etc.)? If yes, compose — no new component needed.

**Step 2 — If a genuine gap: create in `src/components/experimental/`.**
Never in `ui/`. File must:
- Start with a `// DS-GAP:` comment on line 1:
  ```tsx
  // DS-GAP: MetricCard — KPI card with trend delta. Closest DS component: CardContainer.
  ```
- Use only `var(--token)` — no hex, no rgba
- Accept `variant?`, `size?`, `className?` props at minimum
- Never introduce new color semantics — only arrange existing token values

**Step 3 — Continue prototyping.** The PM doesn't need to know this happened. The DS-GAP comment is the handoff artifact for Design to audit and officially promote later.

**Upgrade path**: Claude never moves anything from `experimental/` to `ui/` without explicit instruction from Michael (Product Design lead). The upgrade requires a Figma node to be created and reviewed first.

---

## DS consistency health check

Run `/ds-health` before any PM prototype session to audit the repo for violations. It checks:
1. Token compliance (no hardcoded hex/rgba in `.tsx` files)
2. Raw HTML elements inside pattern previews
3. Experimental component integrity (DS-GAP comment present)
4. PM screens registered in `PROTOTYPE_PAGES`
5. TypeScript — zero errors
6. Pattern page previews using real DS components

Run it also after adding any new component, pattern page, or screen.
