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

## Before creating ANY new component file

This applies everywhere a new file gets created — not just `src/screens/` (see that section below, this is the general version of the same rule). It exists because 5 components (`GreetingHero`, `DailyMessageCard`, `StartHereCard`, `DailyBriefSection`, `WidgetCanvasSection`) were built directly in `src/components/ui/` and `src/components/layouts/` in 2026-07, bypassing the `experimental/` pipeline entirely: none were ever imported by a real screen, none got a catalog entry, and `GreetingHero` duplicated a pattern that already existed and was already catalogued (`Home Banner`). All 5 were deleted as dead code in the 2026-07-31 audit — read the full incident in the audit conversation if you need the details.

**Before writing a single line of a new component:**
1. **Search first.** Check the DS catalog (`NAV_SECTIONS` in `App.tsx`) AND the Figma file for anything that already covers this. A near-duplicate of an existing pattern is the #1 cause of orphaned code — it's cheaper to reuse or extend than to rebuild.
2. **Can it be composed** from existing `src/components/ui/` components inside the screen file itself? If yes, compose there — don't create a new component file at all.
3. **If it's a genuine gap:** it goes in `src/components/experimental/` with a `// DS-GAP:` comment (see "Experimental components" below) — **never directly in `ui/` or `layouts/`.** Only Michael promotes a component out of `experimental/`.

**A new component file is not "done" until both of these are true:**
- It is imported and rendered by at least one real screen — not just written and left sitting.
- It has a catalog entry (`NAV_SECTIONS` + `getSpec` in `App.tsx`) — unless it's intentionally experimental/unpromoted, in which case it belongs in `experimental/`, not `ui/`/`layouts/`.

If you ever find a component in `ui/` or `layouts/` with zero imports anywhere in the repo, that's a bug from a prior session — flag it for removal, don't leave it sitting.

## Syncing a DS component with Figma (new component, new variant, new tokens)

**Any time you're asked to add a component, add/update a variant, or bring a component's colors in line with the Figma DS file (`v6rmYKA2zmyXWOahlxLOeI`) — use the `/aims-ds-component [component] [Figma node ID]` skill (`.claude/commands/aims-ds-component.md`).** This applies even when the user doesn't type the slash command literally — phrases like "update the Chip with the new colors from Figma," "add the Error/Alert/Success variants," or "sync this component" all mean: follow that skill's 6-phase workflow (extract real token values from Figma via the plugin API → map to CSS variable names → write both the `:root/.dark` and `.light` blocks in `src/index.css` → implement the component with `cva` → update the `[COMPONENT]_SPEC` in `App.tsx` → visually verify against a Figma screenshot).

Do not improvise a different sync approach (no re-deriving colors from memory, no approximating a dark-mode value from a light-mode one — they frequently differ by more than opacity). The skill's anti-hallucination rules exist because every prior manual attempt without them introduced drift.

**Known state (2026-07-28):** `chip.tsx` only implements `primary | secondary | purple-primary | purple-secondary | light-blue-primary` — the Figma DS file now also has `error-primary/secondary`, `alert-primary/secondary`, and `success-primary/secondary` (added to Figma 2026-07-23/24, with dark-mode-specific contrast fixes documented in that file's own A11y notes). `light-blue-secondary` is also missing from this repo. Treat any of these as a real sync job, not a new design decision — the Figma side is already finalized.

### Example screens and DS documentation pages (`src/screens/`)

These rules apply to ALL files in `src/screens/` — both PM prototypes and DS component example screens:

- **NEVER build a custom component that replicates an existing DS component.** If `EntityList` exists, use it. If `CardContainer` exists, use it. Building a custom entity card, custom tab bar, custom filter row, etc. silently loses all DS behaviors: hover effects, AI insight sizing, token bindings, accessibility. The bugs are invisible until runtime.
- **Entity items** → always `CardContainer size="sm" className="!p-0 overflow-hidden"` + `EntityList items={[item]}`. Never a custom div that mimics the card layout.
- **Tabs** → never add `borderBottom` to the wrapper div. The `Tabs` component manages its own active indicator (2px span, active tab only). A container border creates a full-width line under ALL tabs — wrong per DS spec ("NO container border").
- **AI insight** → always use `EntityListItemData.aiInsight`. The DS component applies `self-start` when text < 80 chars (auto-width). A custom purple div always stretches full-width.
- **Spacing between nav layers** → always 24px. Tabs → Filters: `className="mb-[24px]"` on `<Tabs>`. Filters → EntityList: `marginTop: 24` or `mt-[24px]`. Never 8px, 16px, or 20px.
- **DS composition checklist before writing any JSX in a screen file:**
  1. Is there a DS component in `src/components/ui/` for what I need? → Use it.
  2. Can I compose the result from existing DS components? → Compose.
  3. Only if neither applies: use a plain HTML element with `var(--token)` colors and `// DS-GAP:` comment.

---

## GUARDRAILS — read this before generating any component or screen

These are the rules most often violated in AI-generated views. Scan this block every time before writing screen code.

### Tokens & components
- **NEVER** hardcode `#hex` / `rgba()` in `.tsx` — always `var(--token-name)`.
- **NEVER** build a custom version of a DS component that exists in `src/components/ui/` — import it.
- **NEVER** add `borderBottom` on a `<Tabs>` wrapper — the component manages its own active indicator.
- **NEVER add anything visual to a `CardContainer` that is not part of the component** — no accent stripes, no coloured top borders, no dividers bolted on. If the card needs to signal something, that is a `Tag`, a `Chip` or a colour variant, not a decoration drawn on top. Use `variant="default"` unless the design genuinely calls for a colour, `size="sm"` for small items (entity rows, selectable cards, items with a CTA inside a SlideOut or Modal), and `variant="dashed"` for empty regions.

### Navigation & headers
- **NEVER** show `tag` on a list-view `Header` — only on a detail-view Header (single item, one state).
- **NEVER** combine `Header.breadcrumb` and `backButton` — from L2 it is the breadcrumb; the first crumb IS the way back. `backButton` is only for pages with no hierarchy to express (a creation wizard).
- **NEVER** use `WidgetCanvasSection` or a hand-rolled grid for Overview tabs — always `WidgetCanvasView`.
- **NEVER** pass the `label` prop to `Input` or `Textarea` in desktop screen files.

### Buttons & overlays
- **NEVER** use `variant="main"` inside a widget, card, SlideOut, or modal — use `primary`. One named exception: `RecordHeader`'s AI agent trigger — see the Button hierarchy rules below.
- **NEVER** open a `ModalDialog` for non-blocking or non-destructive content — use `SlideOut`.
- **NEVER** show a filter chip before the user clicks Apply.

### 3-dot context menu (kebab `•••`)
- Global default actions: **Archive** + **Duplicate** — always in that order, always present unless the entity type explicitly excludes them.
- **Delete** is context-dependent — only include it when the entity type supports deletion. It is NOT a global default.
- Any additional actions depend on the specific entity type.
- ALWAYS use the **icon + text** menu-item variant, **size S** — no icon-only, no size M or L.
- Never add actions that are not defined for the entity type in DS documentation.

### Sidebar sub-navigation
Two behaviors — choose based on the sidebar's current collapse state:

| Sidebar state | Sub-item behavior |
|---|---|
| **Collapsed** (56px, icon-only) | Active item with sub-items → **fly-out popup** appears to the RIGHT of the sidebar (~260px wide, dark surface), showing sub-items as `Menu-items` components |
| **Expanded** (250px, with labels) | Active item with sub-items → sub-items **expand inline below the parent**, indented, each with their own icon + label as `Menu-items` components. A `›` chevron on the parent indicates it has sub-items |

Toggle button at the top of the sidebar switches states. Tooltip: **"Expand"** (when collapsed) / **"Collapse"** (when expanded).
Figma reference: node `8602-48775` in the DS file (`v6rmYKA2zmyXWOahlxLOeI`).

### SlideOut content composition
A dedicated composition guide is **pending** — patterns will be extracted from the Agentic Workflow Builder Nodes Configuration section and documented in a new DS page.

Until that page ships:
- Use `SlideOut` as the container — never a custom overlay `div`.
- For entity detail content: header with entity name + status tag → primary action buttons → metadata fields → related items list.
- Flag edge cases with `// DS-GAP: SlideOut content pattern — pending composition guide`.

### Entity click behavior
Two distinct interactions — never conflate them:
- **Card click** (anywhere on the entity row/card) → always **navigates to the full detail view** for that entity (full-page or section transition). Never opens a SlideOut.
- **Eye button (preview)** → always opens a `SlideOut` with a lightweight preview. Only render the Eye button when preview content is available for that entity. If there is nothing to preview, **omit the button entirely** — do not show a disabled Eye.

```tsx
// ✅ Eye shown only when preview data exists
actions={[
  ...(hasPreview ? [{ icon: "Eye", onClick: () => setPreviewId(item.id) }] : []),
]}

// ❌ Eye always present (wrong when no preview content)
actions={[{ icon: "Eye", onClick: () => {} }]}
```

### Record Header — entity profile header (Employee/Customer/Client)
Use `RecordHeader` (`src/components/ui/record-header.tsx`) atop any dashboard view that summarizes a **single** Employee, Customer, or Client record — never for lists (use `EntityList`) and never as the page-level title bar (that's still `Header`; RecordHeader sits inside the content area, typically the Overview tab).

**Picking the variant** — by which fields the record actually has, not by guessing:
- Has manager/department/access role → `employee`
- Has MRR/renewal date/tier (existing paying account) → `customer`
- Has deal stage/value/expected close date (still in the pipeline) → `client`
- None of the 3 shapes fit → don't force it; flag `// DS-GAP: RecordHeader has no variant for this record shape`

**Identity chips are stable attributes ONLY — never a dynamic state or metric.** Role/department/location, tier/segment/industry, company/deal value/lead source — yes. Adoption level, deal stage, health score — no, those change and belong in Signal (if urgent) or Details (if just reference). A chip you'd need to update when something *happens* to the record is in the wrong slot.

**Don't invent chips, Details fields, or action labels per screen** — pull them from the component's own exports so every instance stays predictable:
- `getRecordFields(variant, data)` → which fields become the 3 identity chips vs. the Details grid (see record-header.tsx or the Reference tab for the exact per-variant list)
- `RECORD_HEADER_RECOMMENDED_ACTIONS[variant]` → `actions[0]` is the one contextual CTA, `actions[1+]` land in the "···" overflow. Not always 2 — e.g. `employee` is just "Message," since RecordHeader always sits on that record's own profile page, so anything the page already shows below it (Overview/Activity/Log tabs) — like "View profile" or "Log activity" — is dead weight, not a valid action. Genuinely tab-duplicate actions (e.g. "Log call," which belongs to Activity) go in the overflow, not the header's one CTA slot.

**`assignedAgent` is required, not optional** (`{ id, name, onOpenChat }`) — AIMS OS is agent-first, every record has one. Renders as an always-present, most-prominent (icon-only, `variant="main"`) button using the Topbar's own `Sparkle` glyph (the single 4-point one, not the 3-star `Sparkles`) — never omit it. This is the one confirmed exception to "never `main` inside a card" (see Button hierarchy rules below) — don't extend that exception to any other button in this file.

**Signal is required, not optional decoration** — every RecordHeader needs a `NextBestAction` (`{ label, severity, dueContext?, aiGenerated?, actionLabel?, onAction? }`) — but **required-as-a-prop does not mean "always urgent."** Most records, most of the time, have nothing pressing; forcing an alert-colored Signal onto a record that's genuinely fine is as wrong as omitting Signal would be. Pick `severity` from what's actually true about THIS record right now, never from a fixed per-variant template — see the Record Header catalog page's "All 3 variants — nothing urgent to surface" (Overview) and the Playground's "Needs attention / All good" toggle for the concrete range:
- `success`/`alert`/`error` — a real urgency or risk state (task counts, renewal risk, SLA breach) or a genuinely good milestone worth flagging. This is the exception, not the default.
- `informative`/`neutral` — a calm, non-urgent status line ("No pending approvals," "Early discovery, no next step due yet"). This is the common case — reach for it whenever nothing warrants an alert color.
- `aiGenerated: true` swaps to the purple/Sparkles treatment **only** for a genuine probabilistic recommendation (confidence-scored, inferred) — never for a plain count or a real risk state. Urgency should always win visually over "an AI produced this."
- `actionLabel` — set it when the NBA engine names ONE specific action ("Send proposal," "Schedule renewal call"); it renders as a real inline button, not just an implicit click-through. Leave it unset when there are several distinct items to review (e.g. "2 tasks pending approval") rather than one thing to do, AND leave it unset for a calm/neutral status — there's nothing to act on.

**Signal click destination** — same framework as Entity click behavior above, applied to `signal.onAction`:
- Multiple items need reviewing one by one before deciding (e.g. several pending approvals) → `SlideOut`, no `actionLabel` (nothing single to name)
- A risk/health state to investigate, with evidence to show before recommending a step → `SlideOut` + `actionLabel` (both the click-through and the named button lead here)
- One immediate, reversible-by-Cancel decision ("do this specific thing now?") → `ModalDialog` + `actionLabel` (the named button is the only entry point — no separate click-through chevron)
- Never Full Navigation from a Signal click — RecordHeader already lives on that record's own page.

### Empty states
**ALWAYS** use `EmptyState` from `src/components/ui/empty-state.tsx` when a view, section, or search has no content to display. **NEVER** hardcode a custom div, illustration, or message — custom empty states break visual consistency and are invisible to the DS.

Show `EmptyState` in every zero-result scenario:
- **Filtered empty** — active filters or search return 0 results → title: "No [entities] found", CTA: "Clear filters"
- **Global search empty** — global search returns 0 matches → title: "No results for '[query]'"
- **Page empty** — the list has no records yet (first visit or truly empty) → title: "No [entities] yet", CTA: "Create your first [entity]"

Key rules:
- Always set `title` (required) and `description` (recommended).
- Add `ctaLabel` + `onCta` only when there is a clear next action — do not add a CTA just to have one.
- Override `icon` with a semantic Lucide icon matching the entity type (`Bot` for Workers, `Zap` for Automations, etc.). Default is `Inbox`.
- **Never show `EmptyState` and `Pagination` at the same time** — if count is 0, pagination must be hidden.

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
   - `SwitchTab` — secondary navigation, one level below Tabs — only when Tabs alone is not enough
   - `Filters` — "What do I see?" (always present when there's a filterable dataset)
   - `EntityList` inside `CardContainer` — one card per item, 12px gap
   - `Pagination` — only when `total_results > rows_per_page`

**HighlightCard**: ALWAYS use `style="default"` (or omit the prop entirely — default is neutral). NEVER use colored styles (`primary-bg`, `green-bg`, `orange-bg`, etc.) — those are deprecated. Color differentiation goes only in the `iconName` and `feedbackType` props.

Entity items must include actions in this order: **primary → secondary → tertiary (Eye/preview)**.
The Eye icon belongs ONLY in the tertiary action (`icon: "Eye"`). Never use `iconName: "Eye"` as the leading icon of an entity item — use a semantic icon (Bot, User, FileText, etc.) that represents the entity type.

**Entity click vs Eye button — two separate interactions:**
- **Card click** → always navigates to the full detail view for that entity. Never opens a SlideOut.
- **Eye button** → opens a `SlideOut` preview. Render the Eye button ONLY when preview content exists for that entity. Omit it entirely when there is nothing to preview — never show a disabled Eye.

If the filtered or unfiltered entity list is empty, replace the list with `EmptyState` (see Empty States below). Never render an empty `EntityList`.

Use `ListViewSection` from `src/components/layouts/list-view-section.tsx` to get this structure pre-wired.

### Detail page layout (entity detail — full screen)
Every entity detail page follows this structure — tabs always in this order:

1. **Overview** → always `WidgetCanvasView`. Never a hand-rolled widget grid. (See Overview tabs rule.)
2. **[Entity-specific tabs]** → vary by entity type (e.g. Runs, Members, Triggers, Settings). Content defined per entity.
3. **Logs** → always the `Table` component following the Logs Table pattern. (See PatternLogsPage.)

Header rules on detail pages:
- `breadcrumb` with parent + current page — a detail page is L2 or deeper. Never `backButton` alongside it.
- Always show status `tag` — detail view = one entity, one state.
- Primary action in `Header.primaryAction` — an **action object**, not a `Button`: `{ label, icon?, onClick?, disabled?, priority? }`. Header picks the variant, so a screen never names one.

```tsx
// ✅ Standard detail page structure
<Header
  title="Meridian"
  tag={<Tag variant="success" size="s">Active</Tag>}
  breadcrumb={<Breadcrumb depth={2} items={[{ label: "Workers", href: "workers" }, { label: "Meridian" }]} onNavigate={go} />}
  size={isScrolled ? "compress" : "size-l"}
  primaryAction={{ label: "Edit", icon: Pencil }}
/>
<Tabs items={[
  { id: "overview", label: "Overview" },   // always first
  { id: "runs",     label: "Runs"     },   // entity-specific
  { id: "logs",     label: "Logs"     },   // always last
]} />

// Overview tab → WidgetCanvasView
// Logs tab     → Table + Filters + Pagination (PatternLogsPage)
```

### SwitchTab — when to show it
Default view in all list views is **entity cards** (`EntityList`). The `SwitchTab` component is **not shown by default**.

Only add `SwitchTab` when the use case explicitly requires an alternative view. If shown:
- `List` option → `EntityList` inside `CardContainer` (default)
- `Table` option → DS `Table` component rendering the same dataset with the same columns

**NEVER** hand-roll a custom grid or table when SwitchTab is active — always use the DS `Table` component for the table option. Filters and Pagination stay the same regardless of the active view.

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
- `SwitchTab` — secondary navigation, one level below Tabs
- `Filters` — dataset control (What do I see?)

**24px gap between every navigation layer** — Tabs → SwitchTab → Filters → Chips (nav). Confirmed from Figma DS node 14660-136237.
24px gap from the last nav element to the first entity card. 12px gap between entity cards.

### Navigation depth — the breadcrumb pattern

**From L2 onwards, a page states where it sits with a breadcrumb inside the `Header`. Not a back arrow.**

Confirmed by Michael (2026-09-02) after checking how Carbon and Atlassian handle it. Back and breadcrumb answer different questions — back is *chronological* ("where did I come from"), breadcrumb is *hierarchical* ("where am I") — and that distinction only earns its keep from L3, where "up one level" and "back" are genuinely different destinations. **At L2 they are the same place**: the first crumb IS the way back, so an arrow beside it is two affordances pointing at one target, in a 62px header.

| Depth | Pattern |
|---|---|
| L1 (a list, a home) | No breadcrumb, no back. `Breadcrumb` renders nothing below `depth={2}` anyway |
| **L2+** | `Breadcrumb` in `Header.breadcrumb` — **parent plus current page only**, not the whole path |

```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb"

<Header
  size={isScrolled ? "compress" : "size-l"}
  title="Meridian"
  tag={<Tag variant="success" size="sm">Active</Tag>}
  breadcrumb={
    <Breadcrumb
      depth={2}
      items={[{ label: "Workers", href: "workers" }, { label: "Meridian" }]}
      onNavigate={go}
    />
  }
  primaryAction={{ label: "Run now", onClick: run }}
/>
```

`Breadcrumb` lives at `src/components/ui/breadcrumb.tsx` — **import it, never hand-roll one.** Ancestors carry `href`; the current page does not.

**What happens on scroll.** The breadcrumb and the tag both survive compress, stacked above the title:

```
size-l    Workers › Meridian          ← breadcrumb
          Meridian  [Active]          ← title + tag
          Manages … (description)     ← hidden in compress

compress  Workers › Meridian          ← still there
          Meridian  [Active]          ← still there
```

Compress is **content-driven, not a fixed 60px** — about 48px normally, about 62px with a breadcrumb. That is deliberate: scrolling should never cost you your place in the hierarchy or the record's status. The 4px between the two rows is what keeps them reading as *path + page* instead of one wrapped title.

**Never combine `breadcrumb` and `backButton`.** `backButton` remains for pages with no hierarchy to express — a creation wizard, a standalone flow — where there is a "back" but no "up".

### Overlays
- **`ModalDialog`** — user MUST stop (destructive action, confirmation, critical form)
- **`SlideOut`** — user can continue browsing (details, filters, context)
- Rule: can the user ignore it? → SlideOut. Must they respond? → Modal.
- Only 1 Modal + 1 SlideOut active at a time.

### Panel overlays — PM component selection guide

**Which panel component to use:**

| Context | Component | Why |
|---|---|---|
| Entity detail preview from a list (Eye button) | `SlideOut` | Overlay on top of the list — user browses back quickly |
| Node / item configuration within a canvas or builder | `SidePanel` | Inline with the canvas — no backdrop, user sees context while editing |
| Filters panel (full filter set) | `SlideOut` type `"filters"` | Standard pattern, always overlays list |
| Step-by-step guided form (multi-step) | `SlideOut` | Focused flow, backdrop keeps user on task |

**SlideOut — which `type` variant to use:**

| Use case | `type` prop | When to add `showTabs` |
|---|---|---|
| Entity preview (name, status, key metrics, AI summary, recent runs) | `"with-variants"` | Yes, when content splits into Overview / History / Config |
| Filter set (full filter controls) | `"filters"` | No — filters panel has its own layout |
| Generic content / form without entity header | `"default"` | Only if content naturally separates into sections |

**SlideOut — mandatory props for `type="with-variants"` (entity detail):**

```tsx
<SlideOut
  open={open}
  onClose={onClose}
  type="with-variants"
  size="m"                          // default — always start with "m" (350px)
  title="Entity Name"               // required
  subtitle="Category · Subcategory" // required (format: "Type · Category")
  statusLabel="Active"              // required — entity current status
  showIcon                          // required — entity icon circle
  showStatus                        // required — status badge
  showTabs={hasSections}            // true when content splits into tabs
  tabLabels={["Overview", "History", "Config"]}  // always exactly 3 strings
  activeTab={tab}
  onTabChange={setTab}
  showSearchBar={false}
  showChips={false}
  showCta={needsCta}                // true only when panel has a Save/Cancel action
>
  {slotContent}
</SlideOut>
```

**Default sizes and drag behavior:**
- `size="m"` → starts at **350px**, drags to **450px** → **half-screen**. This is the default.
- `size="l"` → starts at **450px**, drags to **half-screen** → **full-screen**. Use only for complex forms or rich content.
- Never set a fixed pixel width — the snap system handles resizing.

**SlideOut content composition (inside the slot):**

Structure content top-to-bottom in this order:
1. **AI Summary block** (if AI-generated insight exists) — purple surface, `var(--color-surface-purple-more-subtle)`
2. **Key Metrics** — `AdaptiveMetricGrid` with 2–4 `HighlightCard` components. Max 4.
3. **Primary list** (`EntityList`) — recent runs, related items, linked records
4. **Process steps** (`ProcessItem`) — execution steps with status
5. **Detail table** — key-value pairs in a bordered table (type, owner, pipeline, timestamps)
6. **Form fields** (Config tab only) — `Input`, `Select`, `Toggle`, `Textarea` using DS components

**SidePanel — mandatory props:**

```tsx
<SidePanel
  open={open}
  onClose={onClose}
  title="Item Name"
  description="Brief description of the item"
  titleTag="Active"
  titleTagVariant="success"         // "success" | "alert" | "neutral"
  titleIcon={<Icon size={14} />}
  showCollapsedStrip                // required — shows the collapsed state strip
  showMenu={false}                  // omit unless panel has overflow actions
  showSearch={false}                // omit unless panel has search
  footer={                          // optional — use for Save/Cancel in config panels
    <div className="flex justify-end gap-[8px] p-[12px]" style={{ borderTop: "0.5px solid var(--field-border)" }}>
      <Button variant="secondary" size="sm">Cancel</Button>
      <Button variant="primary"   size="sm">Save</Button>
    </div>
  }
>
  {slotContent}
</SidePanel>
```

**SidePanel default sizes and drag behavior:**
- Starts at **350px**, drags to **450px** → **half-screen**. Same snap logic as SlideOut.
- Always set `showCollapsedStrip` — the collapsed strip is the only affordance when the panel is closed; without it, there's no way to reopen it.

**Quick decision:** Is the panel overlapping a browsable list? → `SlideOut`. Is it embedded alongside a canvas or builder where the user edits something in context? → `SidePanel`.

### Confirmation modals — standard composition
Use `variant="confirmation"` (the default) on `ModalDialog`. Always set `tone` to match the severity of the action:

| Action | `tone` | `iconName` | `ctaPrimary.destructive` |
|---|---|---|---|
| Archive | `"warning"` | `"Archive"` | `false` |
| Delete | `"error"` | `"Trash2"` | `true` |
| Other irreversible | `"warning"` | semantic icon | `true` |

Always include:
- `title` — frame as a question: `"Archive this worker?"`, `"Delete automation?"`.
- `description` — state the consequence: `"This action cannot be undone."` or entity-specific impact.
- `ctaPrimary` — the action label, matching the verb used to trigger it ("Archive", "Delete").
- `ctaSecondary` — always `{ label: "Cancel", onClick: onClose }`.

```tsx
// ✅ Delete confirmation
<ModalDialog
  isOpen={isOpen}
  onClose={onClose}
  tone="error"
  iconName="Trash2"
  title="Delete this worker?"
  description="All runs and logs associated with Meridian will be permanently removed."
  ctaPrimary={{ label: "Delete", destructive: true, onClick: handleDelete }}
  ctaSecondary={{ label: "Cancel", onClick: onClose }}
/>

// ✅ Archive confirmation
<ModalDialog
  isOpen={isOpen}
  onClose={onClose}
  tone="warning"
  iconName="Archive"
  title="Archive this worker?"
  description="Meridian will stop running and be moved to the archive. You can restore it later."
  ctaPrimary={{ label: "Archive", onClick: handleArchive }}
  ctaSecondary={{ label: "Cancel", onClick: onClose }}
/>
```

**NEVER** improvise a custom confirmation UI — always use `ModalDialog variant="confirmation"`.

### Header `tag` prop — when to show it

The `tag` prop renders a chip/badge inline next to the title. Use it only when it adds meaningful context — wrong usage is one of the most common AI-generated inconsistencies.

**Rule: tag = state only, never counters or statistics.**

| View type | Use `tag`? | Why |
|---|---|---|
| **List view** (multiple items, each with its own state) | ❌ Never | A list contains many states simultaneously — a single tag is meaningless and misleading |
| **Detail view** (one specific item open, e.g. a SlideOut or full-screen detail) | ✅ Yes, show the item's current state | A single item has one state; the tag gives immediate context |

**What goes in the tag:** a status label only — `Active`, `Draft`, `Running`, `Paused`, `Archived`. Never a count (`4 Workers`), never a statistic (`24 Polish`), never a category label.

```tsx
// ✅ Correct — detail view of a single AI Worker
<Header title="Meridian" tag={<Tag variant="success" size="s">Active</Tag>} />

// ❌ Wrong — list view of all AI Workers
<Header title="AI Workers" tag={<Tag>9 Workers</Tag>} />

// ❌ Wrong — statistics don't belong in the tag slot
<Header title="AI Workers" tag={<Tag>24 Active</Tag>} />
```

### Chip — color variants are semantic, not decorative

Chip supports 11 color variants, but **color signals meaning — it is not a styling choice.** Default to `primary` / `secondary` for the overwhelming majority of chips (selected vs. unselected state, active filter, generic category toggle). Only reach for a semantic-color variant (`error-*`, `alert-*`, `success-*`) when the chip represents that actual outcome or state — never to add visual variety, make a section "pop," or because a color happens to look good next to another element.

| Variant | Use when | Never use for |
|---|---|---|
| `primary` / `secondary` | Default choice — selected/unselected state, active filter, generic category toggle | — |
| `purple-primary` / `-secondary` | Categorical or brand tagging with no status meaning (e.g. "Premium," "Internal") | Signaling an outcome, result, or state |
| `light-blue-primary` / `-secondary` | Informational/system-level tagging — same non-status role as Purple | Signaling an outcome, result, or state |
| `error-primary` / `-secondary` | The item genuinely failed, is blocked, or needs correction | Decorative red, or "make this stand out" |
| `alert-primary` / `-secondary` | The item needs attention or is in a warning state | Decorative orange/yellow |
| `success-primary` / `-secondary` | The item completed, passed, or is in a confirmed positive state | Decorative green, or as a generic "active" indicator — use `primary` for that |

```tsx
// ✅ Semantic — the run actually failed
<Chip variant="error-secondary" size="s">Failed</Chip>

// ✅ Default — just an active/inactive filter toggle, no status meaning
<Chip variant={i === activeChip ? "primary" : "secondary"} size="s">{label}</Chip>

// ❌ Decorative — using Success just because green reads nicely here
<Chip variant="success-primary" size="s">Featured</Chip>
// → use purple-primary/secondary instead for non-status categorical tags
```

**Rule of thumb:** if you can't name the specific state or outcome the chip represents, it's `primary`/`secondary`. If you need color coding for categories or brands (not status), use Purple or Light Blue — never a semantic color for that.

### Header sticky
- Scroll == 0 → DEFAULT (full header)
- Scroll > 16px → COMPRESSED (60px, title + status + CTA)
- Hover 0–24px from top AND cursor idle 3s → COMPRESSED_WITH_FILTERS
- `ScreenLayout` renders a `linear-gradient(canvas → transparent)` at the bottom of the header zone when `isScrolled=true` — this is already built into the layout; no extra code needed.

### Overview tabs — always Widget Canvas
Any tab labelled "Overview" MUST use `WidgetCanvasView` from `src/components/layouts/widget-canvas-view.tsx`.
**Never use `WidgetCanvasSection` or hand-roll a CSS grid for Overview tabs.**

`WidgetCanvasView` is the interactive version extracted from the DS Live Canvas. It gives PMs:
- Hover → drag handle visible on the widget
- Drag-and-drop reordering with FLIP animation
- Horizontal resize (left/right edge, snaps to 1/2/3 columns)
- Vertical resize (bottom edge) + collapse (click bottom edge)

```tsx
import { WidgetCanvasView } from "@/components/layouts/widget-canvas-view"
import type { CanvasSlot }  from "@/components/layouts/widget-canvas-view"
import { HighlightIcon }    from "@/components/ui/highlight-icon"

// KpiContent helper — use for every KPI widget slot:
function KpiContent({ value, feedback, iconName, iconVariant }) {
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: "var(--color-text-title)" }}>{value}</span>
        <HighlightIcon size="lg" variant={iconVariant} iconName={iconName} />
      </div>
      <span style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginTop: 6, display: "block" }}>{feedback}</span>
    </div>
  )
}

<WidgetCanvasView
  initialSlots={[
    // colSpan: 1 = narrow (1/3), 2 = wide (2/3), 3 = full (3/3)
    {
      uid: "total-workers", title: "Total Workers", colSpan: 1,
      content: <KpiContent value={9} feedback="All categories" iconName="Bot" iconVariant="informative" />,
    },
    {
      uid: "recent-activity", title: "Recent Activity", colSpan: 2, widthClass: "wide",
      content: (
        <div style={{ padding: "0 16px 16px" }}>
          <Table columns={...} data={...} size="sm" />
        </div>
      ),
    },
    {
      uid: "timeline", title: "Timeline", colSpan: 3, widthClass: "full",
      content: <MyTimelineContent />,
    },
  ] satisfies CanvasSlot[]}
/>
```

Rules:
- Every slot needs a unique `uid` string — used as React key and drag anchor.
- `colSpan` drives the initial column span. `widthClass` defaults automatically from `colSpan` if omitted.
- `content` is rendered INSIDE `WidgetFather`. Pass only the inner content — `WidgetFather` chrome (title, drag handle, resize handles) is added by `WidgetCanvasView`.
- Do NOT wrap `content` in another `WidgetFather` — that would double the card shell.
- KPI padding: `"4px 16px 16px"`. Table/feed padding: `"0 16px 16px"`.
- HighlightIcon variants: `informative` (blue), `success` (green), `neutral` (grey), `alert` (yellow), `error` (red).
- Reactive values (counts, live rows) in `content` update automatically — the slot array is rebuilt on each render.

### Widget Content Adaptation — useWidgetSize()

Every widget content component can (and should) adapt its layout to the current canvas column width. Use the `useWidgetSize()` hook exported from `widget-canvas-view.tsx`:

```tsx
import { useWidgetSize } from "@/components/layouts/widget-canvas-view"

function MyWidgetContent() {
  const { widthClass, isNarrow, isWide, isFull, availableHeight } = useWidgetSize()
  // widthClass: "narrow" | "half" | "wide" | "xl" | "full"
  // isNarrow:   widthClass === "narrow"  (4 cols, ~330px)
  // isWide:     "wide" | "xl" | "full"  (8-12 cols)
  // isFull:     widthClass === "full"   (12 cols, full width)
  // availableHeight: number | undefined — set when user has explicitly resized the widget height
  ...
}
```

**Standard adaptation patterns:**

| Scenario | Narrow | Half/Wide | XL/Full |
|---|---|---|---|
| List items shown | 2–3 | 4–5 | All |
| Filter chips | Hidden | Visible | Visible + type row |
| Metadata rows | On hover only | On hover | Always visible |
| Action buttons | Primary only | Primary + secondary | All |
| Detail columns | 1 col | 1 col | 2 col |

**Height-responsive content** — when the user resizes a widget vertically, `availableHeight` is set. Use it to show more rows:

```tsx
const contentMaxH = availableHeight ? Math.max(100, availableHeight - 90) : isNarrow ? 260 : 380
const maxItems    = availableHeight ? Math.floor((availableHeight - 90) / 48) : isNarrow ? 3 : 5
```

The `90px` offset accounts for WidgetFather chrome (padding + header + gap). `48px` is a typical list item height.

**Rules:**
- ALWAYS use `useWidgetSize()` for layout decisions — never hardcode thresholds based on screen px
- NEVER duplicate ResizeObserver inside content components — the canvas already provides width via context
- Content at narrow width must still be functional (search stays, action buttons stay, metadata can hide)
- When `availableHeight` is set, the content must grow to fill it — no empty space below the list

### Logs / activity tabs — always Pagination
Any tab that shows log or run history MUST include a Pagination component.

```tsx
// Separate pagination state for logs (never share with Workers list state)
const [logsPage, setLogsPage] = useState(1)
const [logsPageSize, setLogsPageSize] = useState(10)

// Pass to ScreenLayout's pagination prop, conditional on active tab
pagination={
  mainTab === "workers" && filtered.length > pageSize
    ? <Pagination ... />
    : mainTab === "logs"
    ? <Pagination currentPage={logsPage} totalItems={allLogs.length} itemsPerPage={logsPageSize}
        onPageChange={setLogsPage} onItemsPerPageChange={n => { setLogsPageSize(n); setLogsPage(1) }}
        rowsPerPageOptions={[10, 25, 50]} />
    : undefined
}
```

Default page size for logs: 10. Options: [10, 25, 50].

### Input and Textarea — no label prop on desktop
**NEVER** pass the `label` prop to `Input` or `Textarea` in desktop PM screen files (`src/screens/*.tsx`).
- Use `placeholder` to describe the field — it is the only field hint on desktop.
- The floating label (absolute-positioned, overlaps the top border) is a mobile/touch convention only.
- This applies to all form fields in modals, slide-outs, and inline edit flows in any PM prototype.

### Empty States
Use `EmptyState` from `src/components/ui/empty-state.tsx` whenever a view, section, or search has no content. **NEVER** hardcode a custom empty message, illustration, or div.

| Scenario | title | description | CTA |
|---|---|---|---|
| No records yet (first visit) | "No [Entities] yet" | Brief explanation of what goes here | "Create your first [Entity]" |
| Filtered empty (filter/search returns 0) | "No [entities] found" | "Try adjusting your filters or search term." | "Clear filters" |
| Global search returns 0 | "No results for '[query]'" | Suggest broadening the search | — |

Rules:
- Override `icon` with a Lucide icon matching the entity type (`Bot` → Workers, `Zap` → Automations, `BookOpen` → Knowledge, etc.). Default `Inbox` is a fallback, not a choice.
- Add `ctaLabel` + `onCta` only when there is a concrete next action — never add a CTA just to fill the space.
- **Never show `EmptyState` and `Pagination` simultaneously** — 0 results means no pagination.
- Place `EmptyState` where the entity list would have been — same padding, same vertical position.

### Pagination
- Show only when `total_results > rows_per_page`.
- Any filter/sort/tab change → reset to page 1.

---

## Dropdown menus (filter slots)

A dropdown's **left edge aligns with its trigger's left edge, 4px below** — never centred on the trigger, never at the mouse position. If the panel would run off the right of the viewport it **flips**: right edges align instead. The flip is automatic, measured before paint, not a per-screen decision.

Do not reimplement this. `src/lib/dropdown-anchor.ts` is the one implementation:

```tsx
import { anchorFromEvent, useDropdownPosition, type DropdownAnchor } from "@/lib/dropdown-anchor"

const [anchor, setAnchor] = useState<DropdownAnchor | null>(null)
const dropdown = useDropdownPosition(anchor)

<div onClickCapture={(e) => setAnchor(anchorFromEvent(e))}>
  <Filters … />
</div>

{anchor && (
  <div ref={dropdown.ref} style={{ position: "fixed", zIndex: 10001, ...dropdown.style }}>
    <Menu>…</Menu>
  </div>
)}
```

Applies to every dropdown — filter slots, `Select` panels, kebab menus. **Tooltips and the Slider thumb are the exception**: those centre on their anchor, which is correct for them.

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

## Button hierarchy rules

- `variant="main"` — **header-level CTA only**, and screens no longer write it: `Header` applies it itself from `primaryAction`, which takes an action object (`{ label, icon?, onClick?, disabled?, priority? }`), never a `Button`. Maximum 1 per screen. If you find yourself typing `variant="main"` in a screen file, the action is in the wrong place.
- `variant="primary"` — content-area actions inside cards, widgets, SlideOuts, or table rows. Use when an action is the clear recommended next step within a contained context.
- **Never repeat `main` more than once per view.** If a widget or card needs a call-to-action, use `primary`, not `main`.
- **No more than 2 `primary` buttons visible at the same time** in a single scrolled viewport. If more actions compete, demote lower-priority ones to `secondary`.
- Action order is always: `main` (header) → `primary` → `secondary` → `tertiary`.
- **One confirmed exception:** `RecordHeader`'s AI agent trigger uses `variant="main"` even though it renders inside a `CardContainer`. Confirmed directly by Michael — the agent button is the platform's one persistent, always-present entry point (same role as Topbar's own IA-icon), not a regular card CTA, so it earns the top-of-hierarchy treatment. Do not treat this as precedent for any other card/widget/SlideOut button — it's a named, single-purpose exception, not a loophole.

---

## Anti-patterns — never do these

- Hardcoding `#hex` or `rgba(...)` in `.tsx` — use `var(--token)`.
- Using `position: absolute` for overlays — use `position: fixed` with `getBoundingClientRect()`.
- Rendering dropdowns inside `overflow: hidden` parents — use fixed positioning to escape.
- Creating a new button/input/card component when `src/components/ui/` has one.
- Showing two secondary buttons side by side — order is always primary → secondary → tertiary.
- Using `variant="main"` inside a widget, card, or SlideOut — use `primary` instead (except `RecordHeader`'s AI agent trigger — see Button hierarchy rules).
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
          primaryAction={{ label: "New Item", icon: Plus }}
        />
      )}
      pagination={
        filtered.length > pageSize
          ? <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={pageSize} onPageChange={setPage} />
          : undefined
      }
    >
      {/* Filters + entity list only — no Pagination here */}
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

`ListViewSection` handles Filters + filter dropdown + EntityList only — no Pagination. Key rules:
- **Pagination lives in `ScreenLayout`** — pass `<Pagination .../>` to ScreenLayout's `pagination` prop, not to ListViewSection
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

**Validation checklist — run in this exact order before marking complete:**
1. `npx tsc -b --noEmit` → 0 errors (catches type mistakes)
2. Take a browser screenshot of the screen on `localhost:5173` → compare against the DS pattern page for the same pattern. TypeScript passing ≠ screen rendering correctly.
3. Check every tab of the screen in the screenshot: Overview uses `WidgetCanvasSection`, Workers uses `ListViewSection`, Logs shows `Pagination`.
4. Never push to production without Michael's visual sign-off on localhost first.

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

**Status: partially built and running automatically.** `scripts/audit-tokens.cjs` (`npm run audit:tokens`) covers items 1, 5, and 7 below and runs on every PR and push to `main` via `.github/workflows/design-system-checks.yml` (added 2026-08-04) — a PR with a hardcoded hex/rgba, an orphaned component, or a build/type error fails CI automatically. `/ds-health` as a slash command still does not exist — items 2, 3, 4, and 6 need semantic checks the script doesn't do (parsing JSX for raw elements, cross-referencing DS-GAP comments, registry lookups) and haven't been built. This section documents the full intended scope so whoever builds the rest doesn't have to guess:

1. **Token compliance** (no hardcoded hex/rgba in `.tsx`/`.css` files) — ✅ automated, `audit-tokens.cjs`
2. Raw HTML elements inside pattern previews — not automated
3. Experimental component integrity (DS-GAP comment present) — not automated
4. PM screens registered in `PROTOTYPE_PAGES` — not automated
5. **TypeScript — zero errors** — ✅ automated, CI runs `npm run build`
6. Pattern page previews using real DS components — not automated
7. **Zero-import check** — ✅ automated, `audit-tokens.cjs` (same failure mode as the 2026-07 orphan incident above)

For anything not yet automated (2, 3, 4, 6), do a manual pass after adding any new component, pattern page, or screen.
