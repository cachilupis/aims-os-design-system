---
name: aims-ds-promote
description: Graduates a candidate component from src/components/experimental/ into the real design system — interviews Michael for the spec it is missing, moves it to src/components/ui/, registers it in NAV_SECTIONS and getSpec so it becomes searchable, and updates every import. Use when Michael says a candidate is ready, points at the "Ready to promote" queue on the DS Health page, or asks to promote / graduate / make official an experimental component. Only Michael promotes — never do this unprompted. Do NOT use it to create a new component (aims-ds-component) or to check whether something exists (aims-ds-search).
---

# AIMS OS — Promote a candidate

The repo has three tiers, and this skill is the one door between the second and
the third:

| Tier | Where | Exists because |
|---|---|---|
| Local | inside a screen | one prototype needed it |
| **Candidate** | `experimental/` | it worked, and a second screen wanted it |
| **Catalog** | `ui/` + Patterns page | it has a spec, and is supported |

A candidate is allowed to be unfinished. That is the point — demanding a full
spec on day one blocks the PM, and a blocked PM builds outside the system,
which is the problem the tier exists to prevent.

Promotion is the moment the debt gets paid, and it is Michael's call alone.

## Step 1 — Confirm it has earned it

```bash
python3 -c "
import json; d=json.load(open('ds-index.json'))
for c in d.get('promotionQueue', []):
    print(f\"{c['id']:<22} {c['usedInScreens']} screens   {c['import']}\")
"
```

The threshold is **two screens**. One use is a single screen's decision; two is
a pattern. If it is not in the queue, ask Michael why he wants it promoted
anyway — there are good answers (it is about to be used, it is a primitive
others will need) but he should say one out loud.

## Step 2 — Read it before touching it

```bash
cat src/components/experimental/<file>.tsx
grep -rn "experimental/<file>" src/screens src/components --include='*.tsx'
```

Two things to understand: what the `// DS-GAP:` comment says the gap was, and
how each caller uses it. The DS-GAP line is the closest thing to a spec it has;
the call sites tell you which props are real and which were speculative.

**A prop used by nobody does not survive promotion.** Say so and drop it.

## Step 3 — The spec interview

This is the part only Michael can answer, and the part that makes the component
usable by someone who did not write it. Ask all of it, in one message, and wait:

| Field | Question |
|---|---|
| `name` | The human name. What appears in the sidebar. |
| `classLabel` | Compact, Standard or Heavy? (widgets only) |
| `widthOptions` / `heightGU` | Which grid widths, and how tall? (widgets only) |
| Sizes | Which sizes exist, and what are their exact px? |
| Variants | Which variants, and what does each *mean*? Not what it looks like. |
| States | Default, hover, focus, active, disabled, error — which apply? |
| `useCases` | Three sentences: when you reach for this. |
| `dontUse` | Three sentences: when you must not, and what to use instead. |
| `figmaNodeId` | If there is a Figma node. Blank is acceptable. |

**`dontUse` is the field that stops the next duplicate.** Charts' `dontUse`
line — *"use a bar or pie chart"* — is the only reason anyone knows Charts is
not for categorical comparisons. Do not let it be skipped, and do not write it
yourself: it encodes a decision, not a description.

## Step 4 — Move it

```bash
git mv src/components/experimental/<file>.tsx src/components/ui/<file>.tsx
```

Use `git mv`, not a delete-and-create — the history is how the next person
learns why the component looks the way it does.

Then, in the file itself:

- Delete the `// DS-GAP:` comment. It is no longer a gap.
- Replace it with a header comment: what the component is for, and the one
  design decision inside it that a reader would otherwise undo.
- Keep any comment that records *why* a value is what it is. Those are the
  expensive ones.

## Step 5 — Make it findable

Skipping this step is how Breadcrumb and ProcessItem became invisible for weeks
while fully built and documented. **Both edits, or the promotion did not happen.**

1. **`SectionId`** in `src/App.tsx` — add the id to the union.
2. **`NAV_SECTIONS`** — add the entry, in the Components group, **alphabetical
   by label**. The description is what someone reads when scanning the sidebar,
   so write the differentiator, not the category.
3. **`getSpec`** — add `if (id === "<id>") return <NAME>_SPEC as AnySpec`.
4. **`<NAME>_SPEC`** — the object from the Step 3 interview.
5. **A catalog page** — Overview and Reference tabs. If an example already
   exists elsewhere, **share it, do not copy it**: two copies of the examples
   is the same failure one tier down.

## Step 6 — Update every caller

```bash
grep -rln "experimental/<file>" src/ | xargs sed -i '' 's|@/components/experimental/<file>|@/components/ui/<file>|g'
```

Then regenerate, in this order:

```bash
node scripts/generate-specs.cjs
node scripts/generate-ds-index.cjs
node scripts/generate-ds-health.cjs
```

The component should now appear with `tier: "catalog"` and disappear from
`promotionQueue`.

## Step 7 — Verify

1. `npx tsc -b --noEmit` → 0 errors
2. `npm run build` → passes
3. `node scripts/audit-ratchet.cjs` → no new warnings
4. Browser: the new catalog page renders, and **every screen that used the
   candidate still looks the same**. Promotion should be invisible to them.
5. Search the sidebar for the component's name. If it does not come up, step 5
   is incomplete and you are about to ship an invisible component.

## Step 8 — Record it

Add the verdict to `ds-decisions.json` so the finding that surfaced it closes:

```json
"duplicate-component:src/screens/<file>.tsx:<Name>": {
  "verdict": "promote",
  "why": "Promoted to ui/ on <date>. <one line on what the spec settled>",
  "decidedBy": "Michael",
  "decidedOn": "<YYYY-MM-DD>"
}
```

## What tends to go wrong

- **Promoting without the spec**, because the component already works. Then it
  is a catalog component nobody knows when to use, which is how the catalog
  becomes a list instead of a system.
- **Skipping the NAV_SECTIONS entry.** It compiles. It ships. It is invisible.
- **Copying the examples** into the new page instead of sharing them.
- **Promoting on one use**, because it looks generally useful. It usually is
  not — wait for the second screen to tell you what is actually shared.
