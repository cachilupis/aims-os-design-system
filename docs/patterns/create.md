# Pattern — Create

> Single source of truth for how any create action picks its surface in AIMS OS.
> Everything else — the `CLAUDE.md` table, the `patterns-create` doc page, the playground screens — is derived from this file.
>
> Status: **draft v0.3 — pending validation**
>
> v0.2 — volume threshold removed; step 1 rewritten as a declared property rather than an enumerated list.
> v0.3 — cascade rewritten as an explicit sequence; the two-stage flow named instead of falling through to the default.
> v0.4 — third create mode added (from a source / catalogue); §2b defines the jobs a modal holds in Create.
> v0.5 — contextual vs standalone split added as steps 4 and 5; a modal is now a first-class create form container. Reconciliation mapped against the seven findings in `create-audit.md`.
> v0.6 — `SlideOut type="default"` corrected to `type="full-slot"` throughout — `"default"` was never a real value on the component (checked directly against `slide-out.tsx`: the only two are `"with-variants"` and `"full-slot"`).

---

## 1 · Scope

**Create** brings a new object into existence.
**Configure** edits the properties of something that already exists.

This pattern governs Create only. It never governs Configure.

### Gate 0 — Does this pattern apply at all?

Run this before anything else. If any of the following is true, **the pattern does not apply** and no surface is selected.

| Condition | Why it is excluded | What governs it instead |
| --- | --- | --- |
| The object is created by direct manipulation — drag, drop, draw | Dropping the node onto the canvas already created it | Configure pattern (`SidePanel`) |
| The object is created inside an ongoing agent conversation | The chat is the container; there is no surface to choose | Chat surface |
| The action edits properties of an existing object | Nothing new comes into existence | Configure pattern |

**Control case.** Dragging a node from the library onto the Workflow Builder canvas is *not* a create action under this pattern. The `SidePanel` that opens afterwards configures the node that already exists. Any rule that tries to select a surface here is misapplied.

---

## 2 · Gate 1 — Which create mode?

Three distinct create modes exist. The mode is decided by the affordance the user activates, so it is never inferred.

| Trigger | Mode | Surface |
| --- | --- | --- |
| Any standard create affordance | **Manual** | Run the cascade in §3 |
| A `Create with AI` affordance | **Assisted** | `ModalDialog` hosting the chat component → success `ModalDialog` |
| Browse a catalogue — templates, marketplace, presets, starting points | **From a source** | `ModalDialog variant="content"` for the selection → then §3, pre-filled |

### Assisted create — behaviour

1. The trigger opens a `ModalDialog` containing the conversational chat component.
2. The object is defined through conversation, not through form fields.
3. On completion, a success `ModalDialog` confirms what was created, with two exits: view the new object, or create another.

**Implementation status:** the chat component exists in the Figma Design System but **is not implemented in this repo**. This branch is documented, not buildable. Mark as `DS-GAP` until the chat component ships.

### Create from a source — behaviour

1. The trigger opens a `ModalDialog variant="content"` whose slot holds the catalogue: browse, filter, compare, select.
2. On selection, one of two things happens, decided by whether the source leaves anything to complete:

| After selection | Next |
| --- | --- |
| The source fully defines the object | The object is created. Land per §5. |
| Fields remain to be completed | Run the cascade in §3, with the source's values pre-filled |

The catalogue modal is a **selection** surface. It never becomes the form.

---

## 2b · When Create uses a modal

`ModalDialog` is not excluded from Create. It has three jobs, and one prohibition.

| Job | Variant | Example |
| --- | --- | --- |
| **Fill in** a standalone create, five fields or fewer | `content` | A new entity from its own list view · a user in Admin |
| **Choose** from a catalogue | `content` | Pick a template from the marketplace |
| **Converse** with an agent | `content` | `Create with AI` |
| **Confirm** before an irreversible save | `confirmation` | Publishing a tenant-wide policy |

**Prohibition:** a modal never holds a form whose fields depend on what the modal is covering. If the user has to remember, compare against, or navigate the background to complete it, the surface is a `SlideOut` — however few fields it has.

### The test that separates them

The design system's own question decides it: **can the user ignore this and keep working in the background?**

| Task | Can it be ignored? | Surface |
| --- | --- | --- |
| Filling in fields **that relate to what is on screen** | Yes — the background is what the user is drawing from | `SlideOut` |
| Filling in fields for a **standalone** object, five or fewer | No — nothing on screen contributes to the task | `ModalDialog variant="content"` |
| Choosing from a catalogue | No — the catalogue owns the screen and the decision is one act | `ModalDialog variant="content"` |
| Conversing with an agent | No — the conversation is in progress | `ModalDialog variant="content"` |
| Confirming | No | `ModalDialog variant="confirmation"` |

Stated as one line: **a `SlideOut` is for work that draws on what is behind it. A modal is for work that does not.**

A modal absolutely may hold a create form. What it may not hold is a form whose fields depend on the context it is covering — that is the actual defect, and field count was never the right way to detect it.

This also satisfies NN/g's constraint that a modal must not host a decision requiring information unavailable inside it — a catalogue modal contains everything the choice needs, which is precisely why it qualifies.

---

## 3 · The cascade — manual create

**This is a sequence, not a lookup table.** Start at 1. On a yes, stop and take that surface. On a no, go to the next step. A case never evaluates two tests as equally applicable, because it never reaches the second one.

| Step | Test | Yes | No |
| --- | --- | --- | --- |
| 1 | Does the object type declare a workspace of its own — a builder, canvas, or editor where it continues to be built after creation? | **Dedicated view** | → 2 |
| 2 | Does the flow branch, or does it have three or more stages? | **Dedicated view + `Stepper` + `StepperNavFooter`** | → 3 |
| 3 | Can the object be created from a single field, *and* is a list of the same object type visible on screen? | **Inline create row** ⚠️ `DS-GAP` | → 4 |
| 4 | Does the new object attach to something visible on screen — a parent record, a collection inside it, the thing the user is looking at? | **`SlideOut type="full-slot"`** | → 5 |
| 5 | More than five fields? | **Dedicated view** | **`ModalDialog variant="content"`** |

### Steps 4 and 5 — contextual versus standalone

This is the split that decides between a panel and a modal, and it is the one most often got wrong.

| | Contextual create | Standalone create |
| --- | --- | --- |
| Test | The new object hangs off something on screen | Nothing on screen is its parent |
| Examples | A note on a record · a vehicle inside a customer profile · a task in a project | A new entity from its own list view · a user in Admin · an API key |
| Why | The background is what the user is drawing from. Covering it is a defect regardless of the form's size. | The background contributes nothing. A centred, focused dialog is the better container. |
| Surface | `SlideOut type="full-slot"` | `ModalDialog variant="content"` |

**Why the five-field threshold lives here and nowhere else.** A `SlideOut` grows — 350px → 450px → half screen → full screen — so no volume rule is needed on the contextual side. A modal does not grow: it is capped at 900px and can only scroll. The design system's existing rule — *"don't open a ModalDialog for forms with more than 5 fields — the user needs room"* — was written about modals, and step 5 is the only place it applies. Used anywhere else, it is a number borrowed from a problem it was not measuring.

A standalone create that exceeds five fields is not a modal that needs to be bigger. It is a dedicated view.

### Staged flows: where the line sits

A create with **exactly two stages and no branching** resolves to step 4 — a `SlideOut`. This is deliberate and consistent with what the design system already says in two places: the Forms pattern reserves `StepperNavFooter` for wizards of three or more steps, and the panel guidance explicitly sanctions a step-by-step guided form inside a `SlideOut`.

| Shape of the flow | Surface |
| --- | --- |
| One stage | `SlideOut` |
| Two stages, no branching | `SlideOut`, optionally with a lightweight step indicator |
| Three or more stages | Dedicated view + `Stepper` + `StepperNavFooter` |
| Any branching, at any stage count | Dedicated view + `Stepper` + `StepperNavFooter` |

`StepperNavFooter` is a page-level component. It never appears inside a `SlideOut`.

### Test 1 is a declared property, not a list

Test 1 never enumerates object types. The object type **declares** whether it owns a workspace; the cascade reads the declaration.

Today workflows and agents declare one. Anything that gains a builder later declares it too, and this rule does not change. An enumerated list would need editing every time the platform grows — and the platform grows faster than its documentation.

### There is no volume threshold, deliberately

An earlier draft sent creates with six or more mandatory fields to a dedicated view. It was removed. Recorded here so it does not get reintroduced by reflex:

- The number was inherited from a rule about **modals**, which are fixed boxes with no escape. `SlideOut` is not that.
- Counting mandatory fields measures quantity, not effort. Six short text fields are easier than three fields where one is a long text, one a relationship search, and one a list.
- Mandatory-field counts are configured per tenant in Helix Data Studio, so the same action would resolve to different surfaces at different tenants.
- `SlideOut` already scales: 350px → 450px → half screen → full screen. A container that grows with its content does not need a rule that routes around it.

A dedicated view is earned by **what the object is** (test 1) or **how the flow is shaped** (test 2). Never by how much typing it takes.

### Why every input is observable

Each test can be answered without knowing what the object is, which is the requirement for an agent to run this unaided.

| Input | How it is observed |
| --- | --- |
| Owns a workspace | Declared by the object type |
| Branches / stage count | The flow definition |
| Creatable from a single field | Declared by the object type |
| A list of the same type is on screen | The current view |

**Dependency.** Test 3 requires the object type to declare whether it supports single-field creation. This is a boolean flag, not a field count — a lighter ask than the earlier draft made. → open question for Edgardo.

### Tie-breaking

Steps are ordered by irreversibility of the surface choice, strongest first. A case that appears to satisfy two steps resolves to the lower-numbered one, because evaluation stops at the first yes. If a real case needs an exception, **the cascade is wrong and gets rewritten** — exceptions are not granted.

**A case must never arrive at step 4 by elimination alone.** Step 4 has its own positive definition; if a case reaches it without matching that definition, the cascade has a hole and the hole gets named, not patched.

---

## 4 · Second output — is a confirmation required?

Independent of the container. Never merged into the cascade above.

| Condition | Confirmation |
| --- | --- |
| The user can undo the creation themselves — delete or archive, no external effect | **None.** Save directly. |
| The creation cannot be undone, has tenant-wide scope, or triggers effects outside the tenant | **`ModalDialog variant="confirmation"`** before saving |
| Assisted create (§2) | Always ends in a success `ModalDialog` |

Follow the existing `ModalDialog` composition rules in `CLAUDE.md`: `tone` matched to severity, title framed as a question, description stating the consequence, `ctaSecondary` always `Cancel`.

**Grounding.** NN/g is explicit that confirmation dialogs lose their protective value through repetition — *"if you cry wolf too many times, people will stop paying attention."* A confirmation on a routine create is worse than no confirmation at all.

**Open question for Edgardo:** does the Council intervene in create actions, or only in agent actions directed outside the tenant? If it intervenes, a fourth row is needed here for `ESCALATE`.

---

## 5 · Third output — where the user lands afterwards

Derived from the container. Not a separate decision.

| Surface | After create |
| --- | --- |
| Inline create row | Stays in place. The new row appears in the list, ready to create the next one. |
| `SlideOut` | Closes. The user returns to where they were; the new object appears in context. |
| Dedicated view | Navigates to the created object. |
| Assisted create | Success modal → view the object, or create another. |

---

## 6 · Entry points

Create is **always contextual** in v1. There is no global create affordance.

| Entry point | Component |
| --- | --- |
| List view | `Header` `primaryAction`, `variant="main"` — max one per screen |
| Empty state | `EmptyState` CTA — *"Create your first [Entity]"* |
| Inside a record | Widget-level action, `variant="primary"` |

**Not in v1:** a global `+` in the `Topbar`. The `Topbar` accepts a maximum of three actions and all three are occupied. Adding one is a change to the app shell, not to this pattern.

---

## 7 · Stress test

| # | Case | Path | Surface |
| --- | --- | --- | --- |
| 1a | Create a note, notes list visible in an Overview widget | Step 3 | Inline create row |
| 1b | Create a note, no notes list on screen | Step 4 | `SlideOut` — it attaches to the record |
| 2 | Create an entity record from its own list view, 4 fields | Step 5 | `ModalDialog variant="content"` |
| 2b | Create an entity record from its own list view, 9 fields | Step 5 | Dedicated view |
| 2c | Create a secondary entity from inside its parent's profile | Step 4 | `SlideOut` |
| 2d | Create an entity record, two stages, no branching, contextual | Step 4 | `SlideOut` with step indicator |
| 3 | Create a governance policy | Step 2 | Dedicated view + `Stepper`, **+ confirmation** |
| 4 | Create a workflow | Step 1 | Dedicated view → lands in the canvas |
| 4b | Create an agent | Step 1 | Dedicated view → lands in its workspace |
| 5 | Add a node to the canvas | **Gate 0** | Rejected — this is Configure |
| 6 | Add a template from the marketplace, template fully defines the object | Gate 1 — from a source | `ModalDialog variant="content"` → created |
| 6b | Add a template from the marketplace, fields remain | Gate 1 → Step 4 | Catalogue modal → `SlideOut` pre-filled |
| 7 | Create with AI | Gate 1 — assisted | Chat `ModalDialog` → success modal |

All five resolve. No exception required.

Cases 1a and 1b resolve differently on purpose: the surface follows the entry point. That is the intended behaviour, not an ambiguity — whether a list of the same type is on screen is observable at the moment the action fires.

---

## 8 · Consequences for the component inventory

| Surface in the cascade | Status |
| --- | --- |
| Dedicated view | Exists — `ScreenLayout` + `Header` composition |
| Dedicated view + Stepper | Exists — `Stepper` + `StepperNavFooter` |
| `SlideOut` | Exists. A create panel uses `type="full-slot"` — no entity header, no filters layout. This closes an open gap: no existing source stated which `type` a create flow should use. |
| `ModalDialog variant="confirmation"` | Exists |
| `ModalDialog variant="content"` — catalogue slot, 900px max-width | Exists. The `slot` prop already accepts arbitrary content; the catalogue itself is composed inside it. |
| **Inline create row** | **Does not exist → build in `experimental/`** |
| Popover / quick create | **Not emitted by the cascade → do not build** |
| Chat component (assisted create) | Exists in Figma, not in repo → `DS-GAP`, documented only |

The cascade never selects a popover. Test 4 covers the single-field case, the default covers 2–5 fields, and `SlideOut size="m"` opens at 350px — approximately the width a popover would have. Building one would produce a component no screen imports, which fails the repo's zero-import check.

---

## 9 · Industry grounding

| Source | What it supports |
| --- | --- |
| [NN/g — Modal & Nonmodal Dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/) | *"If it requires multiple steps to begin with, it probably justifies dedicating a full page to it."* Supports tests 1–3. Also: never use a modal for decisions needing information unavailable inside it. |
| [NN/g — Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/) | Confirmations only for serious or irreversible actions; overuse destroys their value. Supports §4. |
| [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Supports staging a branching flow rather than presenting all fields at once. |

### Divergence from market practice, stated deliberately

[Salesforce](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-quick-action-panel.html) creates records in a modal — its Quick Action Panel is a modal by definition. [Atlassian](https://atlassian.design/components/drawer) is deprecating its Drawer component in favour of Modal.

AIMS OS diverges: `ModalDialog` is reserved for actions the user must stop for, and never contains a create form. This is a conscious choice, backed by NN/g and already implemented across the design system. It is recorded here so that nobody later mistakes it for an oversight.

---

## 10 · Assumptions and open questions

### Assumptions made in this draft

- Create is always contextual in v1 — confirmed.
- The rule is mandatory in v1; exceptions are not granted. To be revisited only with evidence of a legitimate case that does not fit.
- The Council does not intervene in create actions. **Unverified.**
- Nested creation — a create that requires creating another object first — does not exist. **Unverified.**

### Open questions

**For Edgardo**

1. Can an object type declare whether it supports single-field creation? Test 3 needs that boolean. It does **not** need a mandatory-field count — the volume threshold was removed.
2. Can a create action require another object to be created first? Nested creation breaks the `SlideOut` container.
3. Are there objects that cannot be created from the UI at all — ingestion or agent only?
4. Does the Council intervene in create, or only in agent actions directed outside the tenant?

**For Thom**

5. Assisted create is confirmed as in scope. Which object types will offer a `Create with AI` affordance in v1?
6. Does the success modal for assisted create differ from a standard confirmation, beyond its two exits?

---

## 11 · Reconciliation required

The audit in `docs/patterns/create-audit.md` found seven conflicts across four sources. This rule resolves them as follows.

| Audit finding | Resolved by |
| --- | --- |
| C1 — multi-step create: `SlideOut` or full-page wizard? | §3 "Staged flows". Two stages without branching stay in a `SlideOut`; three or more, or any branching, go to a dedicated view. |
| C2 — patterns-forms contradicts its own worked example | Steps 4 and 5. The example creates a standalone record, so it was never a `SlideOut` case. Whether it should be a modal or a dedicated view now depends on its field count. |
| C3 — `SidePanel` invisible in three of four sources | Gate 0. `SidePanel` belongs to Configure and never appears in Create. Stated once, here. |
| C4 — three separately maintained copies of "modal vs SlideOut" | §2b becomes the single statement for Create. The other copies get pointers. |
| C5 — no rule covers 6–8 field, single-step, non-destructive forms | Step 5. Standalone and over five fields is a dedicated view. |
| C6 — no source separates create from edit | This document. Create is now its own axis. |
| C7 — no stated `SlideOut.type` for a create flow | §8. `type="full-slot"`. |

**Not yet audited.** `patterns-slideout` and `patterns-panel-content` were outside the audit's scope but are likely to restate surface rules. They need the same pass before this rule ships.

### Page-level actions

| Source | Action |
| --- | --- |
| `patterns-forms` doc page | Remove the Form Context Decision Table; replace with a pointer. Keep spacing, validation, and anatomy — that content is about composing a form, not choosing a surface. |
| `patterns-overlay` doc page | Fully absorbed. Nothing exclusive remains. Remove from the sidebar. |
| `CLAUDE.md` — "Overlays" and "Panel overlays" sections | Fold into the cascade table. Keep the `SlideOut` vs `SidePanel` distinction, which belongs to Configure and stays valid. |
| `CLAUDE.md` — anti-pattern *"Opening a Modal for non-destructive/non-blocking content"* | **Needs a precision edit.** As written it forbids two legitimate surfaces: the catalogue modal and the assisted-create chat modal. Neither is destructive, and both are correctly blocking. Rewrite the anti-pattern around the real test — *can the user ignore it and keep working?* — rather than around destructiveness. |
