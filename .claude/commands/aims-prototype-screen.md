# AIMS OS — Prototype Screen Generator

**Invoke:** `/aims-prototype-screen [plain-language description of the screen]`

Example: `/aims-prototype-screen A list view of AI Workers for a tenant admin. Filter by status (Active, Draft, Running) and category. Each row shows name, status badge, owner, and two actions: Publish (primary) and Edit (secondary). Paginate past 10 results. My name is Juan.`

---

## What this skill does

Turns one plain-language description into a finished, working prototype screen — file created, wired with real DS components, registered in the sidebar under **Prototypes**, verified, and shipped as a branch + PR. The person invoking it never touches a component, a token, or `App.tsx` by hand.

This skill is the **generator**. It applies two other sources of truth without duplicating them — read them, don't re-derive them:
- **`CLAUDE.md`** (repo root) — the full composition ruleset: List View / Detail / Filter / Overlay / Navigation-depth patterns, button hierarchy, anti-patterns. This is the actual spec.
- **`/aims-os-prototyping`** — the pre-delivery consistency checklist (interaction pairing, token rules, spacing). Run it inline as Phase 3 below.

If either file has since changed its rules, follow the file — this skill's job is orchestration, not re-stating the ruleset.

---

## Before you start — the one constraint that shapes everything

`.github/CODEOWNERS` requires `@cachilupis` (Michael) to review any PR touching `src/App.tsx`, `src/components/`, `src/index.css`, `tailwind.config.*`, or `CLAUDE.md`. **Registering a new prototype always edits `App.tsx`** (one import line + one `PROTOTYPE_PAGES` entry), so every prototype PR needs his approval before merge — even though the screen file itself lives safely in the unowned `src/screens/`. This is expected, not a failure state. Say so plainly in the PR and in your final report; don't imply the PR will self-merge.

Keep the `App.tsx` diff to **exactly** those two lines. Never touch anything else in the file — that's what makes the review trivial for Michael instead of a real audit.

---

## Phase 0 — Understand the ask (keep this fast)

Read the description for:
1. **Entity** — what is this a list/detail/dashboard of? (workers, tickets, tasks, connections...)
2. **Shape** — does it map to List View, Detail/master-detail, Dashboard (Widget Canvas), or a Form/wizard? See the decision table below.
3. **Fields per item** — what shows on each row/card.
4. **Actions** — and their hierarchy (primary/secondary/tertiary — max 2 primary visible at once).
5. **Filters** — which dataset dimensions are filterable.
6. **Author name** — for the `author` field and branch name. If not stated, ask for it — everything else, infer or pick a sensible default and keep moving.

Only ask a clarifying question when a genuine ambiguity would produce the wrong pattern (e.g. "detail view" without saying what the tabs are). Don't interrogate — a PM invoking this wants a screen, not a requirements interview. Default to the most common shape for the entity type described and let them correct it after seeing it rendered.

**Shape → pattern decision table** (full detail in `CLAUDE.md` → "Pattern composition"):

| Description sounds like... | Use |
|---|---|
| "a list of X", "all X", "manage X" | List View — `ListViewSection` inside `ScreenLayout`, `Pagination` on `ScreenLayout` |
| "click into X and see...", "X detail with tabs" | Detail page — `Header` (backButton or breadcrumbs per depth) + `Tabs` (Overview always first via `WidgetCanvasView`, Logs always last via `Table`) |
| "queue", "inbox", "review these one at a time" | Master-detail — `EntityList` queue (left) + detail/decision panel (right), same shape as `pm-michael-attention-room.tsx` |
| "overview", "dashboard", "KPIs" | `WidgetCanvasView` + `HighlightIcon`/`HighlightCard` widgets |
| "form to create/edit X", "settings for X" | Form/wizard — see `patterns-forms` page; field gap 16px, section gap 24px, validate on blur |
| "history", "audit log", "activity" | `Table` + `Filters` (Search · Status) + `Pagination` — see Logs Table pattern |

Read **one existing screen with the same shape** in `src/screens/` before writing anything (e.g. `pm-lex-htl-work-queue.tsx` for a queue, `pm-michael-test-v1.tsx` for a filtered list + SlideOut). This is the fastest way to avoid inventing a structure that already exists.

---

## Phase 1 — Compose the screen

File: `src/screens/pm-[author]-[feature].tsx` (kebab-case, matches the `author`/`feature` used in the registry entry). Export a single component.

Hard rules (from `CLAUDE.md` — restated here only because violating them is the #1 way this goes wrong):

- **Always** wrap in `ScreenLayout` — no exceptions, no hand-rolled Topbar/Sidebar/AppBackground.
- **Only** components from `src/components/ui/` and `src/components/layouts/`. Never a custom lookalike (a `div` styled to look like `EntityList`, a fake `Tabs` bar, etc.) — see `aims-os-ds-documentation`'s "Addition 6" for why this silently breaks DS behaviors.
- **Only** `var(--token)` colors. Zero hex/rgba in the screen file. If a token you need doesn't exist, stop and say so — don't invent one and don't approximate with a raw value.
- `Pagination` goes on `ScreenLayout`'s `pagination` prop, never inline in the list — and only renders when `total > pageSize` (this is now enforced by the component itself, not just a convention).
- Realistic mock data: real-sounding names, dates, IDs, statuses. Never "Lorem ipsum", "Option A/B", or "Item 1/2/3".
- Wire **every** interactive element the description implies — a filter chip, a button, a filter slot's `onOpen`/`onRemove` — nothing left as `onClick={undefined}`. Full pairing table is in `aims-os-prototyping`.
- If the description needs a UI element that has no DS equivalent: don't improvise silently. Follow `CLAUDE.md` → "When a PM needs a UI element the DS doesn't have yet" — try composition first, then `src/components/experimental/` with a `// DS-GAP:` comment on line 1. Flag it in your final report so Michael can triage it.

---

## Phase 2 — Register (the only `App.tsx` touch)

Two lines, placed with their siblings — don't reformat or move anything else:

```tsx
// near the other `import ... from "./screens/pm-..."` lines, top of file
import MyScreen from "./screens/pm-[author]-[feature]"
```

```tsx
// inside PROTOTYPE_PAGES, as a new array entry
{ id: "proto-[author]-[feature]", label: "[Human label] — [Author]", description: "[one-sentence summary of what it demonstrates]", author: "[Author]", component: MyScreen },
```

`id` becomes the shareable URL: `aims-os-design-system.vercel.app/?proto=proto-[author]-[feature]` — keep it slug-safe (lowercase, hyphens).

---

## Phase 3 — Verify (run `/aims-os-prototyping`'s checklist, in this order)

1. `npx tsc -b --noEmit` → 0 errors.
2. Start/confirm the dev server, screenshot the screen in the Browser pane — **every tab and every state** the description implies (empty state included if the dataset can legitimately be empty).
3. `grep -n 'rgba\|#[0-9a-fA-F]\{3,6\}' src/screens/pm-[author]-[feature].tsx` → must return nothing.
4. Confirm: every filter/tab/sort change resets pagination to page 1; `showAllFilters` has `onAllFiltersClick` wired; `SlideOut`/`ModalDialog` `onClose` is wired and never hardcoded `open`.
5. Only after all four pass, move to Phase 4. Don't ship on "the types pass" alone — that's necessary, not sufficient.

---

## Phase 4 — Ship (branch → commit → push → PR)

Mirrors the flow already documented on the DS Strategy page's "PM Working Guide" tab — use the same conventions so every prototype PR looks the same in the repo's history:

```bash
git checkout -b pm-[author]/[feature-slug]
git add src/screens/pm-[author]-[feature].tsx src/App.tsx
git commit -m "Add [human label] prototype screen"
git push -u origin pm-[author]/[feature-slug]
gh pr create --title "Add [human label] prototype screen" --body "$(cat <<'EOF'
## Summary
- New PM prototype: [one-sentence description], authored by [Author].
- Adds `src/screens/pm-[author]-[feature].tsx` + registers it in `PROTOTYPE_PAGES`.
- Preview once merged: `?proto=proto-[author]-[feature]`

## Note for review
This touches `src/App.tsx` (2 lines: import + registry entry) to register the screen — CODEOWNERS requires @cachilupis's review for that file. Everything else is new, isolated screen code.

## Test plan
- [x] `npm run build` — clean
- [x] Every tab/state screenshotted in the browser
- [x] No hardcoded colors (grep clean)
- [x] All interactive elements wired; pagination resets on filter/tab/sort change
EOF
)"
```

Poll `gh pr checks <number>` until Vercel finishes, then fetch the preview URL from the Vercel bot's PR comment and report it — same technique as any other PR on this repo.

---

## Final report to the person who invoked this

Always end with:
- The file path created.
- The prototype `id` and the `?proto=` URL it'll have once deployed.
- The PR link, **and an explicit note that it's waiting on Michael's review** (per the CODEOWNERS constraint above) — don't let silence here be read as "something's stuck."
- Any `// DS-GAP:` comments left in the code, called out by name so they're easy to triage.
- The screenshot(s) taken during Phase 3.

---

## Common mistakes this skill exists to prevent

- Building the layout by hand instead of `ScreenLayout` — loses the 32px margin / scroll / sticky-header behavior for free.
- A custom div that looks like `EntityList`/`Tabs`/`Filters` instead of the real component — passes a glance, fails on hover/focus/token-update.
- Registering the screen with more than a 2-line `App.tsx` diff — turns a trivial CODEOWNERS review into a real one.
- Marking a screen "done" because `tsc` passed without ever taking a screenshot.
- Placeholder data ("Item 1", "Lorem ipsum") — the whole point of this repo is prototypes that look real enough for a stakeholder to react to.
- Skipping the "read one similar screen first" step and re-deriving a structure that already exists in `src/screens/`.
