# Audit — existing surface-selection rules (pre-work for Patterns: Create)

> Scope: extract verbatim, list contradictions/overlaps. No new rules proposed, no code touched. This document is an input to Fase 0 (freezing the cascade), not the cascade itself.

Sources audited (exactly 4, as scoped):

1. `CLAUDE.md` → `### Overlays` (lines 281–286)
2. `CLAUDE.md` → `### Panel overlays — PM component selection guide` (lines 287–376)
3. `src/App.tsx` → `PatternFormsPage()` (`patterns-forms` doc page), specifically its "Form Context Decision Table" (lines 15252–15281), the adjacent Do/Don't list (15283–15306), the "CTA Placement per Form Context" table (15418–15459), and its 3 worked Examples (15465–15538, plus the `createPreviewOpen` full-screen render at 15174–15187)
4. `src/App.tsx` → `PatternOverlayPage()` (`patterns-overlay` doc page), lines 11793–12044

---

## 1 · Verbatim extraction

### 1.1 — CLAUDE.md § Overlays (lines 281–286)

```
### Overlays
- **`ModalDialog`** — user MUST stop (destructive action, confirmation, critical form)
- **`SlideOut`** — user can continue browsing (details, filters, context)
- Rule: can the user ignore it? → SlideOut. Must they respond? → Modal.
- Only 1 Modal + 1 SlideOut active at a time.
```

No mention of `SidePanel`. No mention of full-page/wizard. Binary Modal-vs-SlideOut only.

### 1.2 — CLAUDE.md § Panel overlays — PM component selection guide (lines 287–376)

Table, "Which panel component to use":

| Context | Component | Why |
|---|---|---|
| Entity detail preview from a list (Eye button) | `SlideOut` | Overlay on top of the list — user browses back quickly |
| Node / item configuration within a canvas or builder | `SidePanel` | Inline with the canvas — no backdrop, user sees context while editing |
| Filters panel (full filter set) | `SlideOut` type `"filters"` | Standard pattern, always overlays list |
| **Step-by-step guided form (multi-step)** | **`SlideOut`** | Focused flow, backdrop keeps user on task |

Plus a `SlideOut` → `type` sub-table (`with-variants` / `filters` / `default`), full mandatory-prop blocks for both `SlideOut` and `SidePanel`, and this closing line:

> **Quick decision:** Is the panel overlapping a browsable list? → `SlideOut`. Is it embedded alongside a canvas or builder where the user edits something in context? → `SidePanel`.

This is the ONLY one of the 4 sources that mentions `SidePanel` at all.

### 1.3 — patterns-forms: Form Context Decision Table (App.tsx 15252–15281)

| Situation | Form context | Container |
|---|---|---|
| Dedicated page — create or edit a single record | Full-page form | `ScreenLayout` · Header CTAs |
| **Multi-step process (3+ steps, 8+ total fields)** | Full-page wizard | `ScreenLayout` + `StepperNavFooter` |
| Destructive or must-stop action requiring input | Blocking form | `ModalDialog` |
| **Contextual create / edit (user can continue later)** | Side panel form | `SlideOut` |
| Quick single-field inline edit | Inline edit | `Input` (no container) |

Do/Don't (line 15288):
> "Don't open a `ModalDialog` for forms with more than 5 fields — the user needs room. Use `SlideOut` instead."

CTA Placement per Form Context (15418–15459) restates the same 5 contexts (Full-page form / Full-page wizard / Modal form / SlideOut form / Inline edit) with matching CTA-slot rules — internally consistent with the Decision Table's own row names.

**Worked Examples tab (15465–15538):** exactly 3 example cards, each opening a real, full-screen (`fixed inset-0` + `AppBackground`) preview:
- Example 1 — Edit existing record → `FormsSettingsExampleScreen` (full-page)
- Example 2 — **Create new record** ("New Automation," 2 sections / 6 fields) → `FormsCreatePageExampleScreen` (full-page, confirmed at 15174–15187 — same `fixed inset-0`/`AppBackground` wrapper as Example 1)
- Example 3 — Multi-step wizard (4 steps) → full-page + `StepperNavFooter`

**No worked example exists for "Modal form" or "SlideOut form"** anywhere in this page, despite both being named rows in the Decision Table and named contexts in the CTA table.

### 1.4 — patterns-overlay (App.tsx 11793–12044)

"When to Use" tab — two `PatternCard`s (Modal-Blocking / Slide-out-Non-blocking), each a plain feature list. Quick Decision Rule (11833–11868):

> "Can the user safely ignore this and keep working? **NO → Modal**, **YES → Slide-out**."

Property comparison table (background interaction, focus trap, dismiss, priority, stacking, max-simultaneous) — Modal vs. Slide-out only.

"Rules" tab (11990–12038) — a Figma-derived pseudo-code spec, `MODAL_SLIDEOUT_PATTERN`, strictly binary:
```
DECISION_LOGIC
  IF blocking_interaction_required == true → USE MODAL
  ELSE IF contextual AND non_blocking → USE SLIDE_OUT
```

**`SidePanel` is never mentioned anywhere in this page.** Neither is "create," "form," "wizard," or "full-page" — this page is silent on where any create flow fits; it only decides Modal-vs-Slide-out for content that's already assumed to be an overlay.

---

## 2 · Contradictions and overlaps (cited)

### C1 — Multi-step forms: SlideOut (CLAUDE.md) vs. full-page wizard (patterns-forms)

- CLAUDE.md §Panel overlays (line ~296, table row): **"Step-by-step guided form (multi-step) → `SlideOut`."**
- patterns-forms Decision Table (App.tsx 15265): **"Multi-step process (3+ steps, 8+ total fields) → Full-page wizard → `ScreenLayout` + `StepperNavFooter`."**

These directly disagree on the container for the exact same situation (a multi-step guided form). Neither source cross-references the other or states a threshold at which one supersedes the other (e.g., CLAUDE.md's rule has no step/field-count qualifier at all, so it's not clear if it's meant for *short* multi-step flows only).

### C2 — patterns-forms's own Decision Table contradicts its own worked example

- Decision Table (App.tsx 15267): "Contextual create / edit (user can continue later)" → Side panel form → `SlideOut`.
- Worked "Example 2 · Create new record" (App.tsx 15496–15515, rendered at 15174–15187): a small, non-destructive create form (2 sections, 6 fields — well inside "user can continue later" territory) is built as a **full-page screen**, not a `SlideOut`.

The page's own reference implementation doesn't follow its own table. Either the table's "Contextual create/edit" row is wrong, or the worked example is miscategorized (it may actually belong under the table's *first* row, "Dedicated page — create or edit a single record" → Full-page form — but then two rows of the same table both describe "create," with no rule distinguishing which applies when).

### C3 — SidePanel exists in one source, is invisible in the other three

- CLAUDE.md §Panel overlays is the only source that introduces `SidePanel` as a legitimate third surface (for "node/item configuration within a canvas or builder").
- CLAUDE.md §Overlays (the shorter, earlier section in the same file) is strictly binary (Modal/SlideOut) and doesn't acknowledge SidePanel exists.
- patterns-overlay (the doc page a PM would actually browse) is also strictly binary and never mentions SidePanel.
- patterns-forms never mentions SidePanel either.

A reader who only sees patterns-overlay (the page, not CLAUDE.md) has no way to learn `SidePanel` is a valid option at all. If any "create" flow is meant to happen inside a canvas/builder context (e.g., creating a node inline), none of the 3 PM-facing/doc-page sources would surface that as a choice.

### C4 — Two independent decision *frameworks* for the same Modal-vs-SlideOut question, never reconciled

- CLAUDE.md §Overlays: single question — *"can the user ignore it?"*
- patterns-overlay Quick Decision Rule: single question — *"can the user safely ignore this and keep working?"* (near-identical wording, but a separate, independently-editable copy)
- CLAUDE.md §Panel overlays: a *different* question for the Modal/SlideOut/SidePanel split — *"is it overlapping a browsable list, or embedded alongside a canvas/builder?"*

Three overlapping-but-not-identical decision questions exist for what is nominally one decision. None references the others. Drift risk: editing one doesn't touch the other two.

### C5 — Unreconciled field-count thresholds

- patterns-forms Decision Table: wizard threshold is "3+ steps, **8+ total fields**."
- patterns-forms Do/Don't (line 15288): "Don't open Modal for forms with **more than 5 fields** — use SlideOut instead."

Between 6 and 8 fields, single-step: the Do/Don't rule says "not Modal, use SlideOut," but the Decision Table has no row that matches this case ("Destructive/must-stop" doesn't apply; "3+ steps" doesn't apply; "quick single-field" doesn't apply). The only two rows left both say "create/edit" (full-page vs. SlideOut) with no field-count disambiguator between them — see C2.

### C6 — No source frames "create" as its own decision axis

None of the 4 sources treats *creating a new entity* as a distinct decision from *editing an existing one*, even though they clearly can differ (a new entity may need fewer fields than a fully-populated edit view, has no pre-fill, and often wants a "create another" loop — as seen in the worked Example 2's own description, "success modal with 'Create another' option," a detail that appears nowhere in any rule table). This is very likely *the* gap the Patterns: Create page needs to close, per C2's own miscategorized example.

### C7 (overlap, not contradiction) — SlideOut `type` selection is defined once, unreferenced elsewhere

CLAUDE.md §Panel overlays defines a `type="default" | "filters" | "with-variants"` table for `SlideOut`, including "Generic content / form without entity header → `type="default"`." Neither patterns-forms nor patterns-overlay ever mentions the `type` prop when discussing SlideOut-as-a-form-container — so today there is no stated rule for which `type` a create-in-SlideOut flow should use.

---

## 3 · Notes (not analysis — out of scope per the audit's own instructions)

- Two adjacent doc pages exist in `NAV_SECTIONS` (`patterns-slideout`, `patterns-panel-content`) that were **not** audited here — the task scoped this pass to exactly the 4 named sources. They may restate or further contradict the above; flag for a follow-up audit if Fase 0 needs them.
- `specs/` is autogenerated from `*_SPEC` objects and was not touched or read as a source — per the handoff's own warning, it's a build artifact, not a rule source.

---

## 4 · Summary table for Fase 0

| # | Type | What's at stake for "Create" |
|---|---|---|
| C1 | Contradiction | Where does a multi-step create flow live — SlideOut or full-page wizard? |
| C2 | Contradiction | patterns-forms's own table disagrees with its own reference implementation for "create new record" |
| C3 | Coverage gap | Is `SidePanel` ever valid for a create flow (e.g., creating a node inside a builder canvas)? |
| C4 | Structural risk | 3 separately-maintained copies of "how do I choose Modal vs SlideOut" |
| C5 | Threshold gap | No rule covers 6–8 field, single-step, non-destructive forms |
| C6 | Root gap | No source distinguishes "create" from "edit" as its own axis at all |
| C7 | Minor gap | No stated `SlideOut.type` for a create flow |
