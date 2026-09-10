/**
 * UCP — Contacts list.
 *
 * The entry point into the Unified Contact Profile. One roster for the three
 * record types AIMS OS keeps profiles for — People, Employees and Companies —
 * because the profile behind them is the same surface either way.
 *
 * Records arrive through ingestion and account sync, and can also be created
 * here. The Header's primary CTA names the entity type of the active tab —
 * Create New Contact on All, then Person / Employee / Company — because a
 * generic "Create" on a roster of three types does not say what it will make.
 *
 * A record created here has no `source`: source is the system a record was
 * pulled FROM, and per the Entity Header spec the slot is removed rather than
 * refilled when the entity was created in the platform itself.
 *
 * Navigation: Tabs (record type) → Filters. Cards are the only layout in this
 * version — the DS's SwitchTab is not shown by default and a table view is not
 * in scope yet. Row click opens the profile; the Eye opens a preview without
 * leaving the list.
 */

import { useMemo, useRef, useState } from "react"
import { ScreenLayout }      from "@/components/layouts/screen-layout"
import { Header }            from "@/components/ui/header"
import { Tabs }              from "@/components/ui/tabs"
import { Filters }           from "@/components/ui/filters"
import { FiltersSlideout }   from "@/components/ui/filters-slideout"
import { Menu, MenuItem }    from "@/components/ui/menu-item"
import { Button }            from "@/components/ui/button"
import { CardContainer }     from "@/components/ui/card-container"
import { EntityList }        from "@/components/ui/entity-list"
import type { EntityListItemData } from "@/components/ui/entity-list"
import { EmptyState }        from "@/components/ui/empty-state"
import { Pagination }        from "@/components/ui/pagination"
import { SlideOut }          from "@/components/ui/slide-out"
import { ModalDialog }       from "@/components/ui/modal-dialog"
import { HighlightIcon }     from "@/components/ui/highlight-icon"
import { Tooltip }           from "@/components/ui/tooltip"
import { Checkbox }          from "@/components/ui/checkbox"
import { AiSummaryWidget }   from "@/components/experimental/ai-summary-widget"
import { Input }             from "@/components/ui/input"
import { Select }            from "@/components/ui/select"
import { RadioGroup }        from "@/components/ui/radio"
import { InformativeCard }   from "@/components/ui/informative-card"
import { useToast }          from "@/components/ui/toast"
import { Chip }              from "@/components/ui/chip"
import { anchorFromEvent, useDropdownPosition } from "@/lib/dropdown-anchor"
import type { DropdownAnchor } from "@/lib/dropdown-anchor"
import { Plus, Lock, Trash2, Contact as ContactIcon } from "lucide-react"
import { UcpProfileView, UCP_SIDEBAR_ITEMS } from "./pm-thomas-ucp-profile"
import { facetsForType, facetValue, facetOptions } from "./ucpTypeModel"
import {
  PANEL_CONTENT_CLASS, toAiInsights,
  CONTACTS, PEOPLE_TYPES,
  TYPE_ICON, TYPE_LABEL, TYPE_PLURAL, TYPE_TAG, entityState, restrictionFor,
  getActivity, getDrives, getFacts,
  matchExistingRecords, CREATE_LOCATIONS, CREATE_OWNERS,
} from "./ucpShared"
import type { CreateMatch, UcpContact, UcpEntityType } from "./ucpShared"

const PAGE_SIZE = 10

/**
 * ── The tab bar at seven entity types ──────────────────────────────────────
 *
 * Tabs work while there are few types and stop working when there are many,
 * and "many" arrives on its own: an entity type is whatever Helix Data Studio
 * publishes, so this roster starts at Customers / Employees / Companies and
 * ends up with repair orders, policies and assets beside them.
 *
 * The answer is the one Salesforce, HubSpot and Notion all landed on: the bar
 * shows a SUBSET the user chooses, and a `+` adds the rest. Salesforce calls
 * it "Add More Items", HubSpot caps pinned views and puts the rest behind a
 * menu, Notion gives each tab a `···`. None of them tries to show everything.
 *
 * Two rules make it safe rather than clever:
 *   · the picker IS the manager — one checkbox list does show AND hide, so
 *     there is no second "remove tab" flow to find
 *   · the tab you are on is never hidden, and the bar never empties
 *
 * The cap is 6, HubSpot's mechanic: past it, adding asks you to remove. A bar
 * that wraps to a second line is not a bar any more, and unlimited tabs is how
 * every one of these products ended up needing a picker in the first place.
 *
 * Past ~12 types this stops being enough and the type belongs in the Sidebar,
 * with the tabs left as the user's own shortlist. That threshold is a decision
 * to take when it arrives, not to build for now.
 */
const ALL_TYPE_TABS: { id: string; label: string; type: UcpEntityType | "all" }[] = [
  // "All" is not a type. It works today because the first three are all
  // person-shaped records that share columns and filters; a repair order beside
  // a person is where it stops meaning anything, and its replacement is the
  // global search rather than a wider table.
  { id: "all", label: "All", type: "all" },
  ...(["person", "employee", "company", "policy", "asset"] as UcpEntityType[])
    .map(t => ({ id: t, label: TYPE_PLURAL[t], type: t })),
]

/** What a new user sees. Not alphabetical — the types most people work in. */
const DEFAULT_TAB_IDS = ["all", "person", "employee", "company"]

/** Six visible at most, including All. */
const MAX_VISIBLE_TABS = 6

/**
 * The create CTA names what it will make, so it tracks the active tab. On All
 * the roster is mixed, so the label falls back to the module's own noun and the
 * form asks for the type.
 */
const CREATE_LABEL: Record<string, string> = {
  all: "Create New Contact",
  ...Object.fromEntries(
    (["person", "employee", "company", "policy", "asset"] as UcpEntityType[])
      .map(t => [t, `Create New ${TYPE_LABEL[t]}`]),
  ),
}

/**
 * ── Which fields the create form asks for, per type ────────────────────────
 *
 * FIVE, AND FIVE IS NOT A COINCIDENCE. The Create pattern's cascade ends at
 * step 5 with a threshold: a standalone create of five fields or fewer is a
 * `ModalDialog variant="content"`, and above that it is a full-page form. The
 * contact fields Michael specified come to exactly five — name, email, phone,
 * location, owner — so the modal is what the pattern gives it, and the other
 * four types are kept at five so that one roster does not open two different
 * surfaces depending on which tab you were standing on.
 *
 * Trimming was the price of that, and each cut went to a field the record
 * gets somewhere better: an employee's access role is set in People & Access,
 * a company's primary contact is a link you make once both records exist, and
 * headcount is a number that arrives from the sync rather than from a form.
 *
 * `optional` is real, not decorative: the primary CTA unlocks without it. A
 * phone nobody has yet and an owner nobody has decided are both normal states
 * for a record created the moment somebody appears in an inbox.
 */
type CreateFieldKind = "text" | "select" | "phones"

interface CreateField {
  key:       string
  label:     string
  kind:      CreateFieldKind
  optional?: boolean
  options?:  string[]
}

const CREATE_FIELDS: Record<UcpEntityType, CreateField[]> = {
  person: [
    { key: "name",     label: "Full name",     kind: "text"                                        },
    { key: "email",    label: "Email",         kind: "text"                                        },
    { key: "phones",   label: "Phone",         kind: "phones", optional: true                      },
    { key: "location", label: "Location",      kind: "select", options: CREATE_LOCATIONS           },
    { key: "owner",    label: "Account owner", kind: "select", options: CREATE_OWNERS, optional: true },
  ],
  employee: [
    { key: "name",       label: "Full name",  kind: "text"                                  },
    { key: "email",      label: "Work email", kind: "text"                                  },
    { key: "phones",     label: "Phone",      kind: "phones", optional: true                },
    { key: "department", label: "Department", kind: "text"                                  },
    { key: "location",   label: "Location",   kind: "select", options: CREATE_LOCATIONS     },
  ],
  company: [
    { key: "name",     label: "Legal name",    kind: "text"                                        },
    { key: "email",    label: "Account email", kind: "text"                                        },
    { key: "phones",   label: "Phone",         kind: "phones", optional: true                      },
    { key: "location", label: "Headquarters",  kind: "select", options: CREATE_LOCATIONS           },
    { key: "owner",    label: "Account owner", kind: "select", options: CREATE_OWNERS, optional: true },
  ],
  // A create form asks what the OBJECT needs, never what the pattern needs.
  // Nothing about these two is person-shaped, and that is the whole reason
  // they are in this prototype — no email, no phone, so no duplicate check
  // either: there is no field here this data treats as unique.
  policy: [
    { key: "name",   label: "Policy name",    kind: "text"                              },
    { key: "scope",  label: "Scope",          kind: "text"                              },
    { key: "owner",  label: "Owner",          kind: "select", options: CREATE_OWNERS    },
    { key: "from",   label: "Effective date", kind: "text"                              },
    { key: "cycle",  label: "Review cycle",   kind: "text",   optional: true            },
  ],
  asset: [
    { key: "name",      label: "Asset code",   kind: "text"                              },
    { key: "kind",      label: "Type",         kind: "text"                              },
    { key: "location",  label: "Assigned site", kind: "select", options: CREATE_LOCATIONS },
    { key: "acquired",  label: "Acquired",     kind: "text"                              },
    { key: "custodian", label: "Custodian",    kind: "select", options: CREATE_OWNERS, optional: true },
  ],
}

type SortKey = "recent" | "name" | "owner"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Last interaction" },
  { key: "name",   label: "Name A\u2192Z"     },
  { key: "owner",  label: "Owner"             },
]


// The roster concierge lived here — a SlideOut chat opened by an `Ask` button
// in the page Header. Michael took the button out (2026-09-10), and the panel
// went with it: nothing else could open it, so keeping it would have left an
// unreachable surface in the file and an unused import behind it. The record's
// own concierge is untouched — it opens from the Entity Header's `Ask`, which
// is a different thing: that one answers about one record from its own planes.
// ── Create ────────────────────────────────────────────────────────────────────
/**
 * A MODAL, AND THIS USED TO BE A SLIDEOUT. The comment it replaces read "a
 * create form is non-destructive, so it is a SlideOut and not a ModalDialog",
 * and destructiveness is explicitly NOT the test — the Create pattern's test
 * is whether the user can ignore the surface and keep working in the
 * background. Filling in a name, an email and a location needs nothing from
 * the roster behind it, so they cannot. Running the cascade:
 *
 *   1  Does a contact declare a workspace of its own?          no
 *   2  Does the flow branch, or have two or more stages?        no
 *   3  Creatable from a single field, beside a list of them?    no
 *   4  Does it attach to something visible on screen?           no — a roster
 *      is a list of siblings, not the new record's parent
 *   5  More than five fields?                                   no, exactly 5
 *      → ModalDialog variant="content"
 *
 * `slotUnstyled`, because the fields sit directly on the modal. The default
 * slot wraps content in the grey `--modal-slot-bg` surface, which is for a
 * card of content inside a dialog, not for the dialog's own form.
 *
 * No `label` prop on Input — placeholder is the only field hint on desktop.
 */
function CreateModal({
  open, onClose, lockedType, onCreate, onOpenRecord,
}: {
  open:        boolean
  onClose:     () => void
  /** Set when a type tab is active; null on All, where the user picks. */
  lockedType:  UcpEntityType | null
  onCreate:    (type: UcpEntityType, name: string) => void
  /** The duplicate card's way out: open the record that already exists. */
  onOpenRecord: (id: string) => void
}) {
  const [type,   setType]   = useState<UcpEntityType>(lockedType ?? "person")
  const [values, setValues] = useState<Record<string, string>>({})
  const [tried,  setTried]  = useState(false)
  /** One entry per phone row. Starts as a single empty row — an optional field
   *  still shows one line, or nobody discovers it is there. */
  const [phones, setPhones] = useState<string[]>([""])
  const [primary, setPrimary] = useState(0)
  /** Which Select has its Menu open, and where to anchor it. One at a time. */
  const [openSel, setOpenSel] = useState<string | null>(null)
  const [selAnchor, setSelAnchor] = useState<DropdownAnchor | null>(null)
  const selDrop = useDropdownPosition(selAnchor)

  const activeType = lockedType ?? type
  const fields     = CREATE_FIELDS[activeType]

  const reset = () => {
    setValues({}); setPhones([""]); setPrimary(0); setTried(false); setOpenSel(null)
  }

  /**
   * The duplicate check, and it runs on every keystroke rather than on blur.
   * Blur is the tempting choice — fewer lookups, no card flickering mid-word —
   * and it is the wrong one here: the card that matters most appears when the
   * email is COMPLETE, and by then a blur-triggered check has let the user
   * move on to the next field and start filling in a record that will not be
   * created. Telling them while their cursor is still in the field is the
   * difference between a warning and an interruption.
   */
  const match: CreateMatch | null = useMemo(() => {
    // Policies and assets have no unique field to collide on.
    if (activeType === "policy" || activeType === "asset") return null
    return matchExistingRecords({
      name:   values.name,
      email:  values.email,
      phones,
    })
  }, [activeType, values.name, values.email, phones])

  const required = fields.filter(f => !f.optional)
  const missing  = required.filter(f =>
    f.kind === "phones"
      ? phones.every(p => p.trim() === "")
      : (values[f.key] ?? "").trim() === "",
  )
  const complete = missing.length === 0
  const blocked  = match?.blocks === true

  const setPhone = (i: number, v: string) =>
    setPhones(list => list.map((p, j) => (j === i ? v : p)))

  const removePhone = (i: number) => {
    setPhones(list => list.filter((_, j) => j !== i))
    // The primary moves with the list, and never past its end. Deleting the
    // primary promotes the row that took its place.
    setPrimary(pi => (i < pi ? pi - 1 : Math.min(pi, phones.length - 2)))
  }

  const field = (f: CreateField) => {
    const invalid = tried && !f.optional && missing.includes(f)

    if (f.kind === "phones") {
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
            {f.label} <span style={{ fontWeight: 500, color: "var(--field-supporting)" }}>· optional</span>
          </span>
          {/*
            THE PRIMARY IS A RADIO, AND IT ONLY EXISTS FROM THE SECOND ROW ON.
            One phone is the primary by definition, and a radio group of one is
            a control that cannot be used — it renders a selected dot the user
            can neither change nor understand. It appears when there is a
            choice to make. A radio and not a Chip because these are mutually
            exclusive: selecting one deselects the rest, which is the one thing
            a Chip row does not promise.
          */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {phones.map((value, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {phones.length > 1 && (
                  <RadioGroup
                    legend={`Primary phone ${i + 1}`}
                    hideLegend
                    size="sm"
                    value={primary === i ? "on" : ""}
                    onChange={() => setPrimary(i)}
                    options={[{ value: "on", label: "" }]}
                    name={`primary-phone-${i}`}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder={i === 0 ? "+1 (555) 000-0000" : "Another number"}
                    value={value}
                    onChange={e => setPhone(i, e.target.value)}
                  />
                </div>
                {phones.length > 1 && (
                  <Tooltip content="Remove this number" side="cursor">
                    <Button variant="tertiary" size="sm" onClick={() => removePhone(i)} aria-label="Remove this number">
                      <Trash2 size={14} />
                    </Button>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Button variant="tertiary" size="sm" className="self-start" onClick={() => setPhones(l => [...l, ""])}>
              <Plus size={12} /> Add another number
            </Button>
            {phones.length > 1 && (
              <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>
                {phones[primary]?.trim() ? `${phones[primary].trim()} is primary` : "Pick the primary number"}
              </span>
            )}
          </div>
        </div>
      )
    }

    if (f.kind === "select") {
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
            {f.label}
            {f.optional && <span style={{ fontWeight: 500, color: "var(--field-supporting)" }}> · optional</span>}
          </span>
          {/* Select is a trigger only — the options come from the DS Menu,
              positioned by dropdown-anchor. The same mechanism Filters uses,
              which is why there is no second implementation in this file. */}
          <div onClickCapture={e => setSelAnchor(anchorFromEvent(e))}>
            <Select
              placeholder={f.label}
              value={values[f.key] ?? ""}
              state={invalid ? "error" : undefined}
              open={openSel === f.key}
              onClick={() => setOpenSel(k => (k === f.key ? null : f.key))}
              onClear={values[f.key] ? () => setValues(v => ({ ...v, [f.key]: "" })) : undefined}
            />
          </div>
        </div>
      )
    }

    return (
      <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
          {f.label}
          {f.optional && <span style={{ fontWeight: 500, color: "var(--field-supporting)" }}> · optional</span>}
        </span>
        <Input
          placeholder={f.label}
          value={values[f.key] ?? ""}
          state={invalid ? "error" : undefined}
          onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
        />
      </div>
    )
  }

  const selField = fields.find(f => f.key === openSel && f.kind === "select")

  return (
    <>
      <ModalDialog
        isOpen={open}
        onClose={() => { onClose(); reset() }}
        variant="content"
        iconName={TYPE_ICON[activeType]}
        iconVariant="informative"
        title={`New ${TYPE_LABEL[activeType]}`}
        description={`A record created here has no source system — its facts start on the Sandbox plane and are promoted as they are verified.`}
        slotUnstyled
        slot={
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!lockedType && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>What are you creating?</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(Object.keys(CREATE_FIELDS) as UcpEntityType[]).map(t => (
                    <Chip
                      key={t}
                      size="s"
                      variant={activeType === t ? "primary" : "secondary"}
                      onClick={() => { setType(t); reset() }}
                    >
                      {TYPE_LABEL[t]}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* The edge case, stated before the CTA is reached rather than
                after it is pressed. One card, strongest signal — the ordering
                and the reasoning live in matchExistingRecords. */}
            {match && <DuplicateCard match={match} onOpenRecord={id => { onOpenRecord(id); onClose(); reset() }} />}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {fields.map(field)}
            </div>

            {tried && !complete && (
              <span style={{ fontSize: 12, color: "var(--field-text-error)" }}>
                {missing.length === 1
                  ? `${missing[0].label} is still empty.`
                  : `${missing.length} required fields are still empty: ${missing.map(f => f.label).join(", ")}.`}
              </span>
            )}
          </div>
        }
        ctaPrimary={{
          label: `Create ${TYPE_LABEL[activeType]}`,
          // Disabled ONLY for the two email cases. A phone or a name match is
          // a warning, and a form that refuses a real second person at the
          // same company has stopped being a safeguard.
          disabled: blocked,
          onClick: () => {
            if (!complete) { setTried(true); return }
            onCreate(activeType, (values.name ?? "").trim())
            reset()
          },
        }}
        ctaSecondary={{ label: "Cancel", onClick: () => { onClose(); reset() } }}
      />

      {openSel && selAnchor && selField && (
        <div ref={selDrop.ref} style={{ position: "fixed", zIndex: 10001, ...selDrop.style }}>
          <Menu>
            {(selField.options ?? []).map(opt => (
              <MenuItem
                key={opt}
                size="sm"
                label={opt}
                onClick={() => { setValues(v => ({ ...v, [selField.key]: opt })); setOpenSel(null) }}
              />
            ))}
          </Menu>
        </div>
      )}
    </>
  )
}

/**
 * ── What an existing record looks like, before you make a second one ───────
 *
 * The card is an `InformativeCard` — its state carries the severity, and the
 * records themselves are listed underneath it as real `EntityList` rows, with
 * the datum that collided in the meta line. That last part is the whole point:
 * "this email already exists" tells the reader nothing they can act on, while
 * "sandra.torres@meridian.com · Sandra Torres · Active · owned by Priya Nair"
 * tells them whether they are about to duplicate a record or whether somebody
 * else's typo is standing in their way.
 */
const MATCH_COPY: Record<CreateMatch["kind"], {
  state: "error" | "alert" | "informative"
  title: (on: string, n: number) => string
  body:  (on: string, n: number) => string
}> = {
  "email-active": {
    state: "error",
    title: () => "This email is already on a record",
    body:  on => `${on} belongs to the record below. Open it instead of creating a second one — a duplicate has to be merged later, and a merge is a governance event.`,
  },
  "email-archived": {
    state: "alert",
    title: () => "This email is on an archived record",
    body:  on => `${on} belongs to a record that was archived, not deleted. Its facts and drives are still there. Restore it rather than starting again.`,
  },
  phone: {
    state: "alert",
    title: (_, n) => (n === 1 ? "Another record has this number" : `${n} records have this number`),
    body:  on => `${on} is already on file with a different email. That is normal for a switchboard or a shared line — check it is not the same person before you continue.`,
  },
  name: {
    state: "informative",
    title: (_, n) => (n === 1 ? "A record already has this name" : `${n} records already have this name`),
    body:  (_, n) => `The email and phone are different, so ${n === 1 ? "this is" : "these are"} probably not the same person. Worth a look before you create it.`,
  },
  domain: {
    state: "informative",
    title: on => `${on} is already on file`,
    body:  (_, n) => `${n} record${n === 1 ? "" : "s"} share this domain. The new contact will be linked to it, so you do not have to come back and do it by hand.`,
  },
}

function DuplicateCard({ match, onOpenRecord }: { match: CreateMatch; onOpenRecord: (id: string) => void }) {
  const copy = MATCH_COPY[match.kind]
  const n    = match.records.length
  const head = match.records[0]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <InformativeCard
        state={copy.state}
        size="sm"
        title={copy.title(match.on, n)}
        description={copy.body(match.on, n)}
        /* The way out is on the card, next to the reason for it — not a
           separate button further down the form, where it reads as an
           unrelated action. Only the two blocking cases get one: a phone or
           name match already has its answer, which is to keep typing. */
        cta={match.blocks
          ? { label: match.kind === "email-archived" ? `Restore ${head.name}` : `Open ${head.name}`, onClick: () => onOpenRecord(head.id) }
          : undefined}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {match.records.slice(0, 3).map(c => (
          <CardContainer key={c.id} size="sm" className="!p-0 overflow-hidden">
            <EntityList
              items={[{
                id:          c.id,
                title:       c.name,
                /* A person gets an avatar and everything else an icon — the
                   same rule the Entity Header states, and the same one this
                   roster's own rows already follow. */
                ...(PEOPLE_TYPES.includes(c.type)
                  ? { avatarName: c.name }
                  : { iconName: TYPE_ICON[c.type], iconVariant: "neutral" as const }),
                /* The collided datum first — it is the reason this row is on
                   screen. Then who owns it, which is who to ask. */
                primaryMeta:   [{ iconName: "Mail",  label: c.email }],
                secondaryMeta: [{ iconName: "Phone", label: c.phone }, { iconName: "User", label: c.owner }],
                state:       { label: c.status, variant: entityState(c).variant },
                actions:     [{ label: "Open", variant: "tertiary", icon: "ArrowRight", onClick: () => onOpenRecord(c.id) }],
              }]}
            />
          </CardContainer>
        ))}
        {n > 3 && (
          <span style={{ fontSize: 11, color: "var(--field-supporting)" }}>
            {`and ${n - 3} more on this domain.`}
          </span>
        )}
      </div>
    </div>
  )
}


// ── Screen ────────────────────────────────────────────────────────────────────

export default function PMThomasUcpContactsScreen() {
  const toast = useToast()
  const [openId,     setOpenId]     = useState<string | null>(null)
  const [tab,        setTab]        = useState("all")
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(PAGE_SIZE)
  const [search,     setSearch]     = useState("")

  // Draft vs. applied — a chip never appears before Apply.
  // One bag keyed by facet id, not a named useState per filter. The facets are
  // published by the type now, so the screen cannot know their names ahead of
  // time — and a `status`/`owner` pair would have to grow a variable every time
  // a type publishes a field.
  const [applied,    setApplied]    = useState<Record<string, string>>({})
  /** Set when a tab change dropped filters, so the reset is explained. */
  const [clearedOn,  setClearedOn]  = useState<string | null>(null)
  const [slideOpen,  setSlideOpen]  = useState(false)

  const [sortKey,    setSortKey]    = useState<SortKey>("recent")
  const [openSlot,   setOpenSlot]   = useState<string | null>(null)
  const [anchor,     setAnchor]     = useState<DropdownAnchor | null>(null)
  const dropdown = useDropdownPosition(anchor)

  // ── Which types are tabs ──────────────────────────────────────────────────
  // Per user, so it survives a reload. In the product this is a user
  // preference like any other; localStorage is the prototype's stand-in and is
  // wrapped because a private window throws on read.
  const [tabIds, setTabIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ucp.tabIds")
      const parsed = saved ? (JSON.parse(saved) as string[]) : null
      // Anything saved that is no longer a type is dropped, so removing a type
      // from the platform cannot leave a tab pointing at nothing.
      const valid = parsed?.filter(id => ALL_TYPE_TABS.some(t => t.id === id)) ?? []
      return valid.length > 0 ? valid : DEFAULT_TAB_IDS
    } catch { return DEFAULT_TAB_IDS }
  })
  const persistTabs = (ids: string[]) => {
    setTabIds(ids)
    try { localStorage.setItem("ucp.tabIds", JSON.stringify(ids)) } catch { /* private window */ }
  }
  // THE TAB YOU ARE ON IS ALWAYS VISIBLE, even when it is not in the set —
  // arriving on a record type through search or a link should not hide the tab
  // you are standing on. It leaves the bar when you leave it.
  const visibleTabs = useMemo(
    () => ALL_TYPE_TABS.filter(t => tabIds.includes(t.id) || t.id === tab),
    [tabIds, tab],
  )
  const [typeAnchor, setTypeAnchor] = useState<DropdownAnchor | null>(null)
  const typeDropdown    = useDropdownPosition(typeAnchor)
  const typePendingAnchor = useRef<DropdownAnchor | null>(null)

  const toggleTab = (id: string) => {
    const on = tabIds.includes(id)
    // NEVER ZERO TABS: the last one cannot be turned off. And at the cap,
    // adding asks you to remove first rather than silently dropping someone
    // else's choice — HubSpot's mechanic for pinned views.
    if (on && tabIds.length === 1) return
    if (!on && tabIds.length >= MAX_VISIBLE_TABS) return
    const next = on ? tabIds.filter(x => x !== id) : [...tabIds, id]
    persistTabs(next)
    // Turning off the tab you are on sends you to the first one that is left,
    // rather than leaving the list showing a type with no tab.
    if (on && id === tab) {
      const fallback = ALL_TYPE_TABS.find(t => next.includes(t.id))
      if (fallback) { setTab(fallback.id); setApplied({}); resetPage() }
    }
  }

  const [preview,    setPreview]    = useState<UcpContact | null>(null)
  // El anchor y el "abrir" tienen que cambiar en el MISMO commit. useDropdownPosition
  // mide el panel en useLayoutEffect y sale temprano si todavía no está montado;
  // si el anchor se fija en la fase de captura y el panel recién aparece cuando
  // el onMenuClick burbujea, el efecto ya corrió contra un ref nulo y el flip
  // nunca se recalcula — el menú se sale por la derecha en vez de alinearse por
  // el otro borde. Por eso un solo estado lleva las dos cosas, que además es el
  // uso que documenta el propio helper: el panel se gatea SOLO por el anchor.
  const pendingAnchor = useRef<DropdownAnchor | null>(null)
  const [kebab, setKebab] = useState<{ contact: UcpContact; anchor: DropdownAnchor } | null>(null)
  const kebabDropdown = useDropdownPosition(kebab?.anchor ?? null)
  const [archiving,  setArchiving]  = useState<UcpContact | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const activeType = ALL_TYPE_TABS.find(t => t.id === tab)?.type ?? "all"

  const facets = useMemo(() => facetsForType(activeType), [activeType])

  /** The tab's rows before any facet is applied — the pool the counts run on. */
  const inType = useMemo(
    () => CONTACTS.filter(c => activeType === "all" || c.type === activeType),
    [activeType],
  )

  const filtered = useMemo(() => inType.filter(c => {
    for (const [fid, val] of Object.entries(applied)) {
      if (val && facetValue(c, fid) !== val) return false
    }
    if (search) {
      const q = search.toLowerCase()
      if (![c.name, c.subtitle, c.email, c.company, c.owner, c.id].some(f => f.toLowerCase().includes(q))) return false
    }
    return true
  }), [inType, applied, search])

  /**
   * How many rows an option would leave, with every OTHER facet still applied.
   * Zero disables the option rather than removing it: if picking "Inactive"
   * made Owner vanish because no inactive record is Priya's, the viewer would
   * lose the way back out. The count is the honest version of that — it says
   * the combination is empty without hiding the road.
   */
  const countFor = (facetId: string, option: string): number => {
    let base = inType
    for (const [fid, val] of Object.entries(applied)) {
      if (fid !== facetId && val) base = base.filter(c => facetValue(c, fid) === val)
    }
    return base.filter(c => facetValue(c, facetId) === option).length
  }

  const sorted = useMemo(() => {
    const rows = [...filtered]
    if (sortKey === "name")   return rows.sort((a, b) => a.name.localeCompare(b.name))
    if (sortKey === "owner")  return rows.sort((a, b) => a.owner.localeCompare(b.owner) || a.name.localeCompare(b.name))
    return rows.sort((a, b) => Date.parse(b.lastInteraction) - Date.parse(a.lastInteraction))
  }, [filtered, sortKey])

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const resetPage = () => setPage(1)
  const hasFilters = Boolean(Object.values(applied).some(Boolean) || search)

  const clearAll = () => {
    setApplied({})
    setSearch("")
    setClearedOn(null)
    resetPage()
  }

  const closeSlot = () => { setOpenSlot(null); setAnchor(null) }

  const pickSlot = (facetId: string, value: string) => {
    setApplied(a => ({ ...a, [facetId]: value }))
    setClearedOn(null)
    resetPage()
    closeSlot()
  }

  const pickSort = (key: SortKey) => {
    setSortKey(key)
    resetPage()
    closeSlot()
  }

  // ── Profile view takes over the whole screen ──
  const open = CONTACTS.find(c => c.id === openId)
  if (open) {
    return (
      <UcpProfileView
        contact={open}
        onBack={() => setOpenId(null)}
        onSidebarItemClick={id => { if (id === "contacts") setOpenId(null) }}
        // A company's People tab opens one of its records. Navigation stays
        // here rather than in the profile: the roster owns which record is open.
        onOpenRecord={c => setOpenId(c.id)}
      />
    )
  }

  const toItem = (c: UcpContact): EntityListItemData => ({
    id:    c.id,
    title: c.name,
    // Una persona lleva avatar; una compañía lleva icono. La pregunta es si la
    // entidad tiene identidad visual propia — una cara o una marca. Customers y
    // employees son personas con nombre, y sus iniciales dicen más que un
    // glifo repetido en diez filas iguales: el icono de tipo era el mismo para
    // todos los employees, así que no distinguía nada. La clasificación sigue
    // visible en el tag de la derecha, que es donde vive.
    //
    // Las compañías se quedan con el HighlightIcon: no hay logo en el modelo,
    // y unas iniciales derivadas de una razón social se leen como una persona.
    //
    // Correction (2026-09-09): the test is the TYPE, not "is it a company".
    // With repair orders, policies and assets in the roster, `avatarName` was
    // deriving initials from a code — "RO-48307" came out as "R" — which is
    // the same bug the Entity Header had and the same rule fixes both: only
    // people carry initials here. Everything that is not a person gets its
    // type's icon, which is also the one place the type is visible for a
    // record whose title is a code.
    ...(PEOPLE_TYPES.includes(c.type)
      ? { avatarName: c.name }
      : { iconName: TYPE_ICON[c.type], iconVariant: "light-blue" as const }),
    // Top row is context plus identifier: the source (one item, always visible,
    // per the shared content model) and the record ID.
    primaryMeta: [
      {
        iconName: c.source.iconName,
        label:    c.source.label,
        tooltip:  `Source · ${c.source.label}. The system this record was pulled from.`,
      },
      { iconName: "Hash", label: c.id, tooltip: `Record ID · ${c.id}` },
      // Only on a record the viewer cannot read through. It belongs on the row
      // rather than only inside the profile: finding out that a record is
      // governed after opening it is the version of this that wastes a click.
      ...(restrictionFor(c)
        ? [{
            iconName: "Lock",
            label:    "Restricted",
            tooltip:  `Restricted · needs the ${restrictionFor(c)!.scope} scope, which your role does not hold.`,
          }]
        : []),
    ],
    // Secondary metadata. Four items, values only — no field labels on the row,
    // because the tooltip is what names the field. The spec puts a job title and
    // a parent company here explicitly ("NOT A SOURCE… they belong in tags or in
    // secondary metadata"), and qualifies the rest by whether someone could act
    // on it or governance needs it visible.
    secondaryMeta: [
      {
        iconName: "Info",
        label:    c.subtitle,
        tooltip:  `${c.type === "company" ? "Profile" : "Role"} · ${c.subtitle}`,
      },
      {
        iconName: "UserRound",
        label:    c.owner,
        tooltip:  `Account owner · ${c.owner}. Last interaction ${c.lastInteraction}.`,
      },
      {
        iconName: "ShieldCheck",
        label:    `${getFacts(c).filter(f => f.plane === "truth").length} verified`,
        tooltip:  `Verified facts · ${getFacts(c).filter(f => f.plane === "truth").length} on the Truth plane of ${getFacts(c).length} total.`,
      },
      // The spec names the assigned agent as qualifying metadata, and AIMS OS
      // is agent-first, so every record has one. An open-items count would sit
      // better here, but it is only modelled on 7 of the 16 records — printing
      // "None open" for the other 9 would be false on several of them, so that
      // number needs a real field before it can go on the row.
      {
        iconName: "Bot",
        label:    c.agent.name,
        tooltip:  `Assigned agent · ${c.agent.name}. Opens a chat scoped to this record.`,
      },
    ],
    // The row carries the record's Next Best Action, not the agent's summary.
    // A roster is scanned to decide what to open next, and the recommendation is
    // what answers that; the agent's read still lives in the Overview widget and
    // in the Eye preview, where there is room for it.
    //
    // The block renders the same purple family the Next Best Action card uses on
    // the profile, so the row and the card speak the same language. Title,
    // when, and why — without the rationale it would be an order, not a
    // proposal. It collapses past 80 characters and View more opens the record,
    // which is the card's own default path.
    //
    // No action, no block: "there is nothing to say when there is nothing to
    // do." The absence is the signal — a reader scans for purple to find the
    // records that want a decision.
    //
    // `showAiPrefix: false` — EntityList's label is `AI {action}` by default,
    // which is right when `action` names a category of output ("AI Summary",
    // "AI Impact"). The Next Best Action is a product concept with a name of its
    // own, so the prefix renames it: "AI Next Best Action" is a different thing
    // from what the card below the profile header calls itself. The prefix is
    // opted out; the label keeps its own styling.
    //
    // One short line, so the block neither collapses nor stretches. EntityList
    // sizes this container from its own content: past `detailThreshold` (80 by
    // default) it treats the text as long, goes full width and grows a chevron
    // to expand; under it, the block takes `self-start` and hugs. Every
    // recommendation here fits in 54 characters or fewer, so the row gets the
    // hugging card and no disclosure — matching the block inside RecordHeader
    // on the profile, which carries no chevron either.
    //
    // The rationale is deliberately not here. A roster is scanned to decide what
    // to open next, and the proposal plus its timestamp answers that; the "why"
    // is a paragraph, and it belongs on the record, where the same
    // recommendation renders with its full description.
    aiInsight: c.nba
      ? {
          action:       "Next Best Action",
          showAiPrefix: false,
          detail:       `${c.nba.title} · ${c.nba.timestamp}`,
        }
      : undefined,
    tags:  [{ label: TYPE_LABEL[c.type] }],
    state: entityState(c),
    showMenu:    true,
    onMenuClick: () => {},
    actions: [{ label: "Preview", variant: "tertiary", icon: "Eye", onClick: () => setPreview(c) }],
    onClick: () => setOpenId(c.id),
  })

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas González"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={UCP_SIDEBAR_ITEMS}
      activeSidebarId="contacts"
      header={isScrolled => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Contacts"
          description="Every person, employee and company AIMS OS keeps a unified profile for."
          primaryAction={{
            label:   CREATE_LABEL[tab] ?? CREATE_LABEL.all,
            icon:    Plus,
            onClick: () => setCreateOpen(true),
          }}
        />
      )}
      pagination={
        filtered.length > pageSize
          ? (
              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                itemsPerPage={pageSize}
                onPageChange={setPage}
                onItemsPerPageChange={n => { setPageSize(n); resetPage() }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            )
          : undefined
      }
    >
      {/* The bar and its `+` share a row. Tabs takes no trailing slot, and it
          does not need one for this — a Button beside it in the same flex row
          is the whole composition. If a second screen ever wants the same
          affordance, THEN it is a prop on Tabs. */}
      <div className="flex items-end justify-between gap-[12px] mb-[24px]">
        <Tabs
          activeId={tab}
          onChange={id => {
            // Facets are published per type, so carrying them across a tab change
            // would keep a filter the new tab cannot answer. They clear — and the
            // screen says so, because a list that silently resets reads as broken
            // rather than reset.
            const had = Object.values(applied).filter(Boolean).length
            setTab(id)
            setApplied({})
            setClearedOn(had > 0 ? (ALL_TYPE_TABS.find(t => t.id === id)?.label ?? null) : null)
            resetPage()
          }}
          items={visibleTabs.map(t => ({ id: t.id, label: t.label }))}
        />
        <div onClickCapture={e => { typePendingAnchor.current = anchorFromEvent(e) }}>
          {/* `side="cursor"` because this trigger sits at the right edge of the
              content column: `side="top"` centres the bubble on the trigger and
              a 274px bubble on a trigger 44px from the edge loses half of
              itself off-screen (measured). Cursor mode portals it and picks the
              side that fits, which is what the component documents it for.

              The copy carries the count as well as the verb — the tooltip is
              the only place that says how many types exist, which is the thing
              a user cannot see from a bar showing five of them. */}
          <Tooltip
            side="cursor"
            content={`Choose which entity types show as tabs — ${tabIds.length} of ${ALL_TYPE_TABS.length} showing`}
          >
            <Button
              variant="tertiary" size="sm" iconPosition="alone"
              icon={<Plus size={16} strokeWidth={1.75} />}
              aria-label="Choose which entity types show as tabs"
              onClick={() => { if (typePendingAnchor.current) setTypeAnchor(typePendingAnchor.current) }}
            />
          </Tooltip>
        </div>
      </div>

      <div className="mb-[24px]" onClickCapture={e => setAnchor(anchorFromEvent(e))}>
        <Filters
          showSearch
          searchPlaceholder="Search by name, company, owner or ID…"
          searchValue={search}
          onSearchChange={v => { setSearch(v); resetPage() }}
          // Which facets are visible is the type's call, not the screen's. The
          // rest live behind All filters, exactly the layering FILTERS_SPEC
          // describes — visible is for high frequency, not for importance.
          slots={facets.filter(f => f.inline).map(f => ({
            placeholder: f.label,
            value: applied[f.id],
            onOpen: () => setOpenSlot(f.id),
            onRemove: () => {
              setApplied(a => { const n = { ...a }; delete n[f.id]; return n })
              resetPage()
            },
          }))}
          showAllFilters
          onAllFiltersClick={() => setSlideOpen(true)}
          showClearFilters={hasFilters}
          onClearFilters={clearAll}
          showSort
          sortLabel={SORT_OPTIONS.find(o => o.key === sortKey)?.label}
          onSortClick={() => setOpenSlot("sort")}
          showViewToggle={false}
        />
      </div>

      {clearedOn && (
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--field-supporting)" }}>
          <HighlightIcon size="sm" variant="neutral" iconName="Info" />
          {`Filters cleared — ${clearedOn} publishes a different set of facets.`}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ContactIcon}
          title={hasFilters ? "No contacts found" : "No contacts yet"}
          description={hasFilters
            ? "Try adjusting your filters or search term."
            : "Records arrive through account sync and ingestion, or you can create the first one here."
          }
          ctaLabel={hasFilters ? "Clear filters" : (CREATE_LABEL[tab] ?? CREATE_LABEL.all)}
          onCta={hasFilters ? clearAll : () => setCreateOpen(true)}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paged.map(c => (
            <div key={c.id} onClickCapture={e => { pendingAnchor.current = anchorFromEvent(e) }}>
              <CardContainer size="sm" className="!p-0 overflow-hidden">
                <EntityList items={[{ ...toItem(c), onMenuClick: () => {
                  if (pendingAnchor.current) setKebab({ contact: c, anchor: pendingAnchor.current })
                } }]} />
              </CardContainer>
            </div>
          ))}
        </div>
      )}

      {/*
        The type picker. One checkbox list that both adds and removes, which is
        why there is no `···` per tab: two affordances for one job is how a
        tab bar ends up with a hidden second way to do the same thing.

        No search field: at seven types it would be furniture. Past ~10 it
        stops being optional — that is the threshold, not a preference.
      */}
      {typeAnchor && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={() => setTypeAnchor(null)} />
          <div ref={typeDropdown.ref} style={{ position: "fixed", zIndex: 10001, ...typeDropdown.style }}>
            <Menu>
              {ALL_TYPE_TABS.map(t => {
                const on      = tabIds.includes(t.id)
                const atCap   = !on && tabIds.length >= MAX_VISIBLE_TABS
                const isLast  = on && tabIds.length === 1
                const count   = t.type === "all" ? CONTACTS.length : CONTACTS.filter(c => c.type === t.type).length
                return (
                  <MenuItem
                    key={t.id}
                    size="sm"
                    label={t.label}
                    subtext={
                      atCap  ? `${count} records · remove one to add this`
                      : isLast ? `${count} records · the last tab stays`
                      : `${count} records`
                    }
                    state={atCap || isLast ? "disabled" : "default"}
                    checkbox={<Checkbox size="sm" checked={on} onChange={() => toggleTab(t.id)} />}
                    leadingIcon={<HighlightIcon size="sm" variant="neutral" iconName={t.type === "all" ? "LayoutGrid" : TYPE_ICON[t.type]} />}
                    onClick={() => toggleTab(t.id)}
                  />
                )
              })}
            </Menu>
          </div>
        </>
      )}

      {/* ── Filter slot dropdowns ── */}
      {openSlot && anchor && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={closeSlot} />
          <div ref={dropdown.ref} style={{ position: "fixed", zIndex: 10001, ...dropdown.style }}>
            <Menu>
              {openSlot === "sort"
                ? SORT_OPTIONS.map(option => (
                    <MenuItem
                      key={option.key}
                      size="sm"
                      label={option.label}
                      state={sortKey === option.key ? "focus" : "default"}
                      onClick={() => pickSort(option.key)}
                    />
                  ))
                : facetOptions(inType, openSlot).map(option => {
                    const n = countFor(openSlot, option)
                    return (
                      <MenuItem
                        key={option}
                        size="sm"
                        label={`${option} · ${n}`}
                        state={n === 0 ? "disabled" : applied[openSlot] === option ? "focus" : "default"}
                        onClick={() => { if (n > 0) pickSlot(openSlot, option) }}
                      />
                    )
                  })
              }
            </Menu>
          </div>
        </>
      )}

      {/* ── Row kebab — Archive + Duplicate are the DS defaults ── */}
      {kebab && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={() => setKebab(null)} />
          <div ref={kebabDropdown.ref} style={{ position: "fixed", zIndex: 10001, ...kebabDropdown.style }}>
            <Menu>
              <MenuItem size="sm" label="Archive"   leadingIcon={<HighlightIcon size="sm" variant="neutral" iconName="Archive" />}  onClick={() => { setArchiving(kebab.contact); setKebab(null) }} />
              <MenuItem size="sm" label="Duplicate" leadingIcon={<HighlightIcon size="sm" variant="neutral" iconName="Copy" />}     onClick={() => setKebab(null)} />
            </Menu>
          </div>
        </>
      )}

      {/* ── All filters ── */}
      <FiltersSlideout
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        onApply={() => { resetPage(); setSlideOpen(false) }}
        onClearAll={clearAll}
        activeFilters={facets
          .filter(f => applied[f.id])
          .map(f => ({
            label: f.label,
            value: applied[f.id],
            onRemove: () => {
              setApplied(a => { const n = { ...a }; delete n[f.id]; return n })
              resetPage()
            },
          }))}
      />

      {/* ── Row preview — the profile without leaving the list ── */}
      <SlideOut
        open={preview !== null}
        onClose={() => setPreview(null)}
        type="with-variants"
        size="m"
        title={preview?.name ?? ""}
        subtitle={preview ? `${TYPE_LABEL[preview.type]} · ${preview.company}` : ""}
        showIcon
        /* The entity's own icon, the same glyph and tint the roster row shows.
           It was a Sparkle on every preview, which is the AI mark — it says
           "an agent produced this", not "this is a customer". */
        iconContent={preview ? <HighlightIcon size="sm" variant={TYPE_TAG[preview.type] === "purple" ? "purple" : TYPE_TAG[preview.type] === "lightBlue" ? "light-blue" : "informative"} iconName={TYPE_ICON[preview.type]} /> : undefined}
        showStatus
        statusLabel={preview?.status}
        showTopButton={false}
      showTabs={false}
      showSearchBar={false}
      showChips={false}
      showCta={false}
      >
        {preview && (
          <div className={PANEL_CONTENT_CLASS}>

            {/* The same gate as the profile, applied here too. A preview that
                prints the agent's read, the email and the fact counts of a
                record whose profile says the values are governed would make the
                restriction decorative — the panel is the easier door, so it has
                to be the same door. What survives is directory-level: who owns
                the record and where it came from. */}
            {restrictionFor(preview) ? (
              <div
                style={{
                  background: "var(--card-primary-bg)", border: "1px solid var(--field-border)",
                  borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  <Lock size={13} />
                  Governed by {restrictionFor(preview)!.scope}
                </span>
                <span style={{ fontSize: 12, color: "var(--field-supporting)", lineHeight: 1.6 }}>
                  {restrictionFor(preview)!.note}
                </span>
              </div>
            ) : (
              // The same component the profile's Overview widget uses, so the
              // agent's read looks like one object in both places. It carousels
              // here too when the record has more than one, and it carries the
              // area each read is about. No `onAsk`: the concierge opens from
              // the profile, not from a preview of it.
              <AiSummaryWidget items={toAiInsights(preview)} />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(restrictionFor(preview)
                ? [
                    { label: "Record ID", value: preview.id            },
                    { label: "Owner",     value: preview.owner         },
                    { label: "Source",    value: preview.source.label  },
                  ]
                : [
                { label: "Record ID",        value: preview.id                                       },
                { label: "Owner",            value: preview.owner                                    },
                { label: "Email",            value: preview.email                                    },
                { label: "Last interaction", value: preview.lastInteraction                          },
                { label: "Verified facts",   value: `${getFacts(preview).filter(f => f.plane === "truth").length} on the Truth plane` },
                { label: "Activity",         value: `${getActivity(preview).length} events`          },
                { label: "Drives attached",  value: `${getDrives(preview).length} sources`           },
              ]).map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--field-supporting)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="self-start"
              onClick={() => { setOpenId(preview.id); setPreview(null) }}
            >
              Open full profile
            </Button>
          </div>
        )}
      </SlideOut>

      <ModalDialog
        isOpen={archiving !== null}
        onClose={() => setArchiving(null)}
        tone="warning"
        iconName="Archive"
        title={`Archive ${archiving?.name ?? "this contact"}?`}
        description="The record moves out of active views and its assigned agent stops acting on it. Facts and drives are kept, and you can restore it later."
        ctaPrimary={{ label: "Archive", onClick: () => setArchiving(null) }}
        ctaSecondary={{ label: "Cancel", onClick: () => setArchiving(null) }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        lockedType={activeType === "all" ? null : activeType}
        onOpenRecord={setOpenId}
        /* Every create ends in a toast — the Create pattern is explicit that a
           visible landing is not confirmation on its own, because "it appeared
           in the list" only reads as confirmation to someone who knows what
           the list looked like a second ago. The toast says what happened; the
           roster says where it went. */
        onCreate={(t, name) => {
          setCreateOpen(false)
          toast.success(`${TYPE_LABEL[t]} \u201c${name}\u201d created`, {
            description: "Its facts start on the Sandbox plane and are promoted as they are verified.",
          })
        }}
      />

    </ScreenLayout>
  )
}
