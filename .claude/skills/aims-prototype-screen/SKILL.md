---
name: aims-prototype-screen
description: Generates a complete, working PM prototype screen for the AIMS OS Design System repo (aims-os-design-system) from a single plain-language description — composes it from real DS components following CLAUDE.md's rules, registers it in the Prototypes gallery, verifies it, and ships it as a branch + PR. Use this whenever someone describes a screen, view, dashboard, list, queue, detail page, or flow they want added to this repo's "Prototypes" section — trigger on phrases like "prototype a screen for X", "generate a list view of X", "I need a screen that shows X", "add a dashboard for X", "build me a queue/detail view for X", or any description of a screen's fields/filters/actions even if the word "prototype" never appears. Do NOT use this to edit an existing screen already in src/screens/ (just edit that file directly) or to build an actual reusable DS component in src/components/ui/ (use aims-ds-component for that instead) — this is specifically for composing NEW prototype screens.
---

# AIMS OS — Prototype Screen Generator

Turn one plain-language description into a finished prototype screen: the file exists, it's built from real DS components, it shows up in the sidebar under **Prototypes**, and it's shipped as a branch + PR — all without the person describing it ever touching a component, a token, or `App.tsx` by hand.

## Why this exists

The whole value proposition of this repo (see the "DS Strategy" page in the app itself) is that a PM's prototype is built from the *exact same components* engineering will ship — not an approximation. That only holds if every screen is actually composed from `src/components/ui/` and `src/components/layouts/`, uses only `var(--token)` colors, and follows the same handful of layout patterns every other screen uses. Left unguided, it's easy to reach for a plausible-looking custom `div` instead of the real `EntityList`, and the screen silently loses hover states, token updates, and behaviors that ship with the real component. This skill exists to make the disciplined path the default path.

It deliberately doesn't re-explain rules that already live elsewhere — it points to them and applies them:
- **`CLAUDE.md`** (repo root, loaded automatically every session) — the actual composition ruleset: List View / Detail / Filter / Overlay / navigation-depth patterns, button hierarchy, anti-patterns.
- **`aims-os-prototyping`** skill (if installed in this session) or `.claude/commands/aims-os-prototyping.md` — the pre-delivery consistency checklist (interaction pairing, token rules, spacing).

If either of those changes, follow the current file — this skill's job is orchestration, not being a second source of truth that can drift out of sync with the first.

## The one constraint that shapes the whole shipping step

`.github/CODEOWNERS` requires `@cachilupis` (Michael) to review any PR touching `src/App.tsx`, `src/components/`, `src/index.css`, `tailwind.config.*`, or `CLAUDE.md`. Registering a new prototype always edits `App.tsx` — one import line, one entry in the `PROTOTYPE_PAGES` array — so **every** prototype PR needs his approval before merge, even though the screen file itself lives safely in the unowned `src/screens/`. This isn't a failure state to work around; it's the intended safety net (a PM accidentally editing a shared DS file shouldn't be able to break every other prototype). Say so plainly in the PR body and in the final report — silence here reads as "something's stuck" when it's actually working as designed.

Because of this, keep the `App.tsx` diff to *exactly* those two lines, every time. That's what makes the review a 10-second glance instead of a real audit.

## Phase 0 — Understand the ask, then move

Read the description for: the entity (workers, tickets, connections...), the shape it implies, the fields shown per item, the actions and their hierarchy, which fields are filterable, and the author's name (needed for the file name and branch — ask for it if genuinely missing, everything else, infer and keep going).

**Shape → pattern** (full detail lives in `CLAUDE.md` → "Pattern composition"):

| The description sounds like... | Compose as |
|---|---|
| "a list of X", "all X", "manage X" | List View — `ListViewSection` inside `ScreenLayout`, `Pagination` on `ScreenLayout` |
| "click into X and see...", "X detail with tabs" | Detail page — `Header` (`backButton` at depth 2, breadcrumbs at 3+) + `Tabs` (Overview always first via `WidgetCanvasView`, Logs always last via `Table`) |
| "queue", "inbox", "review these one at a time" | Master-detail — `EntityList` queue on the left, decision/detail panel on the right (see `pm-michael-attention-room.tsx` for the shape) |
| "overview", "dashboard", "KPIs" | `WidgetCanvasView` + `HighlightIcon`/`HighlightCard` widgets |
| "form to create/edit X", "settings for X" | Form/wizard — `patterns-forms` page: 16px field gap, 24px section gap, validate on blur |
| "history", "audit log", "activity" | `Table` + `Filters` (Search · Status) + `Pagination` — Logs Table pattern |

A genuine ambiguity that would produce the *wrong* pattern is worth one crisp clarifying question. A missing detail that just needs a sensible default (an icon choice, a filter's exact option list) isn't — infer it and let the person react to something real instead of a requirements interview. Before writing anything, skim one existing screen in `src/screens/` with the same shape (e.g. `pm-lex-htl-work-queue.tsx` for a queue) — it's faster to match an existing structure than to reconstruct one from CLAUDE.md's prose each time.

## Phase 1 — Compose

File: `src/screens/pm-[author]-[feature].tsx`, one default-exported component. A handful of things are non-negotiable, and here's the reasoning for each so it's clear these aren't arbitrary:

- **Always wrap in `ScreenLayout`.** It bakes in the exact DS margin/scroll/sticky-header spec — hand-assembling Topbar + Sidebar + AppBackground yourself is how those values quietly drift screen to screen.
- **Only components from `src/components/ui/` and `src/components/layouts/`.** A custom lookalike passes a glance but loses the real component's hover/focus states and stops updating when the DS token changes underneath it.
- **Only `var(--token)` colors, zero hex/rgba.** If the token you need doesn't exist yet, say so rather than approximating with a raw value — a slightly-off color is a worse outcome than a flagged gap.
- **`Pagination` lives on `ScreenLayout`'s `pagination` prop**, never inline in the list, and only when `total > pageSize` (enforced by the component itself now, not just convention).
- **Realistic mock data** — real-sounding names, dates, IDs, statuses. "Item 1" and "Lorem ipsum" undercut the entire point, which is a prototype that looks real enough for a stakeholder to react to.
- **Wire every interactive element the description implies.** A filter chip's `onOpen`/`onRemove`, a row action's `onClick` — nothing left silently inert.
- If the description genuinely needs something with no DS equivalent, don't improvise silently: try composing existing components first, then follow `CLAUDE.md`'s "When a PM needs a UI element the DS doesn't have yet" (a `src/components/experimental/` file with a `// DS-GAP:` comment on line 1). Flag it by name in the final report so it gets triaged.

## Phase 2 — Register

Exactly two lines added to `App.tsx`, placed with their siblings — nothing else in the file touched:

```tsx
// grouped with the other `import ... from "./screens/pm-..."` lines near the top
import MyScreen from "./screens/pm-[author]-[feature]"
```

```tsx
// one new entry inside the PROTOTYPE_PAGES array
{ id: "proto-[author]-[feature]", label: "[Human label] — [Author]", description: "[one sentence on what it demonstrates]", author: "[Author]", component: MyScreen },
```

`id` becomes the shareable link once deployed: `aims-os-design-system.vercel.app/?proto=proto-[author]-[feature]` — keep it a lowercase, hyphenated slug.

## Phase 3 — Verify before calling it done

Passing `tsc` is necessary, not sufficient — a screen can type-check cleanly and still render wrong. Run, in order:

1. `npx tsc -b --noEmit` → zero errors.
2. Start/confirm the dev server and screenshot the screen in the browser — every tab and state the description implies, including the empty state if the dataset can legitimately be empty.
3. `grep -n 'rgba\|#[0-9a-fA-F]\{3,6\}' src/screens/pm-[author]-[feature].tsx` → must return nothing.
4. Confirm by re-reading the file: every filter/tab/sort change resets pagination to page 1, `showAllFilters` has `onAllFiltersClick` wired to a real slideout, every `SlideOut`/`ModalDialog` has `onClose` wired and never a hardcoded `open`.

Only move to shipping once all four are clean.

## Phase 4 — Ship

Same branch/commit/PR conventions already used across this repo's history, so every prototype PR reads the same way:

```bash
git checkout -b pm-[author]/[feature-slug]
git add src/screens/pm-[author]-[feature].tsx src/App.tsx
git commit -m "Add [human label] prototype screen"
git push -u origin pm-[author]/[feature-slug]
gh pr create --title "Add [human label] prototype screen" --body "$(cat <<'EOF'
## Summary
- New PM prototype: [one-sentence description], authored by [Author].
- Adds `src/screens/pm-[author]-[feature].tsx` and registers it in `PROTOTYPE_PAGES`.
- Preview once merged: `?proto=proto-[author]-[feature]`

## Note for review
Touches `src/App.tsx` (2 lines: import + registry entry) to register the screen — CODEOWNERS requires @cachilupis's review for that file. Everything else is new, isolated screen code.

## Test plan
- [x] `npm run build` clean
- [x] Every tab/state screenshotted in the browser
- [x] No hardcoded colors (grep clean)
- [x] Every interactive element wired; pagination resets on filter/tab/sort change
EOF
)"
```

Poll `gh pr checks <number>` until Vercel finishes, pull the preview URL from the Vercel bot's PR comment, and include it in the final report.

## Final report — always include

- The file path created.
- The prototype `id` and the `?proto=` URL it'll resolve to once deployed.
- The PR link, with an explicit note that it's waiting on Michael's CODEOWNERS review (don't let silence here be misread as something being stuck).
- Any `// DS-GAP:` comments left in the code, named individually so they're easy to triage.
- The screenshot(s) from Phase 3.

## What tends to go wrong without this discipline

- Hand-building the layout instead of `ScreenLayout` — loses the margin/scroll/sticky-header behavior for free, and it's not obvious until someone compares it side-by-side with another screen.
- A custom div standing in for `EntityList`/`Tabs`/`Filters` — looks right, breaks on hover/focus, stops tracking DS token updates.
- An `App.tsx` diff bigger than the two required lines — turns a rubber-stamp CODEOWNERS review into a real one, and slows down every future PM's PR behind it.
- Calling it done because `tsc` passed, without ever opening the browser.
- Placeholder data that never gets replaced with something a stakeholder would actually recognize as real.
- Skipping the "read one similar screen first" step and re-deriving a structure that already exists in `src/screens/`.
