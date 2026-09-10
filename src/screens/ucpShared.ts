/**
 * UCP — Unified Contact Profile: shared types + mock data.
 *
 * Same role `adminShared.ts` plays for the Admin Console screens: one place
 * for the record shapes and the fixtures, so the list screen and the profile
 * screen can't drift apart on what a contact is.
 *
 * Three AIMS OS concepts are modelled here rather than invented:
 *   - Knowledge planes (Truth 100% / Sandbox ~80% / Sources ~60%) — the same
 *     three planes a TruthPack is built from. The Snapshot tab is this record's
 *     facts organised by plane, so "how sure are we" is readable at a glance.
 *   - Source Drives — drives, folders or documents attached from the company
 *     catalog. This is what the profile's Drives tab lists (it replaces the
 *     generic "Documents" tab a CRM would have).
 *   - The Entity Header content model (Figma 19815-101547) — visual, title,
 *     source, state badge, signal and classification tags, secondary metadata.
 *     Every field below maps to a named slot in that spec; nothing is a
 *     convenience field invented for this screen.
 */

import { hasScope } from "./viewerScopes"
import type { AiInsight } from "@/components/experimental/ai-summary-widget"

/**
 * These three shapes used to be imported from a pair of components in
 * `experimental/`. Those components are gone — RecordHeader absorbed both jobs —
 * so the fixtures own their shapes now. They are fixture vocabulary, not design
 * system types: the screens map them onto whatever the components ask for.
 */
export interface UcpTag {
  label:     string
  role:      "signal" | "classification"
  tone?:     "error" | "alert" | "neutral"
  severity?: number
  tooltip?:  string
}

export interface UcpMetaItem {
  iconName: string
  label:    string
  tooltip:  string
}

/** What the engine proposes for a record. `null` on a record with nothing to do. */
export interface UcpNextBestAction {
  title:     string
  timestamp: string
  rationale?: string
  variant?:  "view-details" | "accept"
}

// ── Entity ────────────────────────────────────────────────────────────────────

/**
 * The entity types this tenant publishes.
 *
 * Three of them are people-shaped and three are not, which is the point: an
 * entity type is whatever Helix Data Studio publishes, and the roster cannot
 * assume they are all contacts. What each type declares about itself lives in
 * ucpTypeModel; what they all share is this file.
 */
export type UcpEntityType =
  | "person" | "employee" | "company"
  | "policy" | "asset"

/** Types whose records are PEOPLE. Connections, coworkers and initials only
 *  make sense for these — a repair order has no colleagues and no initials. */
export const PEOPLE_TYPES: UcpEntityType[] = ["person", "employee"]

/** An avatar needs a face or a brand. Everything else is an icon, and a
 *  record titled with a code — RO-48291 — can only ever be an icon: there are
 *  no initials in a code. Straight from the Entity Header's own rule. */
export const AVATAR_TYPES: UcpEntityType[] = ["person", "employee", "company"]
export type UcpStatus     = "Active" | "Inactive" | "Archived"

/** A study either returned data, returned nothing, or failed. */
export type StudyState = "loaded" | "empty" | "error"

export type TagVariantLite = "success" | "error" | "alert" | "informative" | "neutral"

/**
 * One read. `category` is the area — "Renewal", "Governance", "Service" — and
 * `destination` is where in the platform to act on it, when there is such a
 * place. Both are the tenant's vocabulary, not the platform's.
 */
export interface UcpInsight {
  id:           string
  category:     string
  headline:     string
  detail:       string
  confidence:   number
  /** A section of the platform, or one of this record's own tabs. */
  destination?: string
}

export interface UcpContact {
  id:              string
  type:            UcpEntityType
  name:            string
  /** One line of "who is this" — role · department, or industry · size · HQ. */
  subtitle:        string
  email:           string
  phone:           string
  company:         string
  owner:           string
  /** Lifecycle, and what the list filters on. */
  status:          UcpStatus
  /**
   * The Entity Header's state badge — exactly one, and the most blocking status
   * wins. Defaults to `status`; set it only when something more blocking is
   * true of the record, in which case the lifecycle value moves to a tag.
   */
  stateBadge?:     { label: string; variant: TagVariantLite }
  /**
   * The system this record was pulled from. One item, never two — a job title,
   * a location or a category is not a source. Omitted when the entity was
   * created in the platform itself; the slot is removed, never refilled.
   */
  source:          { label: string; iconName: string }
  /**
   * The entitlement scope a viewer must hold to read this record's governed
   * values. Undefined means the record carries nothing scope-gated beyond the
   * access that got the viewer to the list. This is a property of the VIEWER's
   * relationship to the record, not of the record: the same row renders in full
   * for someone who holds the scope.
   */
  requiredScope?:  string
  /**
   * Signals, and any classification BEYOND the entity's own type — "Buyer",
   * "Enterprise", "Manager". The type's own tag is not stored here: the header
   * derives it from TYPE_LABEL, which is the same map the roster chip reads,
   * so a record cannot be a "Customer" in the list and a "Person" in its own
   * header. The component sorts and caps what it is given.
   */
  tags:            UcpTag[]
  /** Max 6, aim for four. Every item carries a tooltip naming its field. */
  meta:            UcpMetaItem[]
  lastInteraction: string
  /** AIMS OS is agent-first — every record has one assigned concierge. */
  agent:           { id: string; name: string }
  /**
   * Declared relationships to other records. Coworkers are derived from
   * `company` and never written here; this is for the ones no derivation can
   * reach — a family tie, most of all.
   */
  relations?:      UcpRelation[]
  /**
   * The engine's proposal, rendered as its own card BELOW the header — never
   * inside it. null when there is nothing to do: no action, no card.
   */
  nba:             UcpNextBestAction | null
  /** The agent's read on this record, shown as the Overview AI widget. */
  /**
   * The agent's reads on this record — one or many, each about a different
   * AREA. The Overview widget carousels them and names the area, so a reader
   * knows where a read is pointing before deciding to act on it.
   *
   * They are AUTHORED, never derived from the studies on the same page: a
   * sentence generated from a number the reader can already see is not an
   * interpretation, and putting a confidence on it would be inventing one.
   * A record with a single read is the normal case, and the widget's pager
   * only appears from two.
   */
  insights:        UcpInsight[]
  governance:      StudyState
  risk:            StudyState
  connections:     StudyState
}

/**
 * The display label for each type. `person` reads as "Customer": these records
 * are contacts at customer and prospect accounts, and "Person" said what the
 * row was rather than what the record is. The internal discriminator stays
 * `person` so the type union does not churn.
 */
export const TYPE_LABEL: Record<UcpEntityType, string> = {
  person:         "Customer",
  employee:       "Employee",
  company:        "Company",
  policy:         "Policy",
  asset:          "Asset",
}

/** The plural, for a tab and for an empty state. Derived labels read wrong
 *  ("Policys"), so each type says its own. */
export const TYPE_PLURAL: Record<UcpEntityType, string> = {
  person:         "Customers",
  employee:       "Employees",
  company:        "Companies",
  policy:         "Policies",
  asset:          "Assets",
}

export const TYPE_ICON: Record<UcpEntityType, string> = {
  person:         "UserRound",
  employee:       "IdCard",
  company:        "Building2",
  policy:         "FileCheck2",
  asset:          "Truck",
}

export const TYPE_TAG: Record<UcpEntityType, "informative" | "purple" | "lightBlue"> = {
  person:         "informative",
  employee:       "purple",
  company:        "lightBlue",
  policy:         "purple",
  asset:          "lightBlue",
}

export const STATUS_TAG: Record<UcpStatus, TagVariantLite> = {
  Active:   "success",
  Inactive: "neutral",
  Archived: "error",
}

/**
 * All three types here are entities with a real-world visual identity — a face
 * or a brand — so all three use an avatar. That is also why each carries a
 * classification tag: an avatar cannot communicate what kind of thing this is,
 * where a highlight icon would.
 */
export function entityState(c: UcpContact): { label: string; variant: TagVariantLite } {
  return c.stateBadge ?? { label: c.status, variant: STATUS_TAG[c.status] }
}

/**
 * The one definition of a panel body's spacing, for every SlideOut in this
 * prototype — the same constant the DS keeps in App.tsx under the same name.
 *
 * 16px between sections and NO horizontal padding: SlideOut's own `aside` is
 * already `32px / 24px` and SidePanel's body `24px`, so a panel body that adds
 * its own 20px lands the content at 44 while the header and the footer stay at
 * 24. Each half looks right on its own, which is why every panel here had it.
 */
export const PANEL_CONTENT_CLASS = "flex flex-col gap-[16px]"

// ── Entitlements ──────────────────────────────────────────────────────────────

/**
 * The scopes the signed-in viewer holds. Hardcoded here because the prototype
 * has no identity provider — in the product this comes from the session, and
 * nothing else about the code below changes.
 *
 * Thomas is a PM: he can read contacts and HR records, and he cannot read
 * finance. That last omission is the point — it is what makes the Entity
 * Header's Restricted state reachable from a real rule instead of a mock flag.
 *
 * The scopes themselves live in `viewerScopes.ts` — one owner, because the
 * entity registry asks the same question about types and the profile asks it
 * about individual fields.
 */

/**
 * Restricted is a state, not a failure, and the copy has to say so. It never
 * suggests the viewer did something wrong and never implies the record is
 * broken: the fields exist, they are governed, and here is the scope that opens
 * them. The record itself stays visible — hiding it would tell the viewer
 * something untrue about what the tenant holds.
 *
 * Returns null when the viewer holds what the record needs.
 */
export function restrictionFor(c: UcpContact): { scope: string; note: string } | null {
  if (!c.requiredScope || hasScope(c.requiredScope)) return null
  return {
    scope: c.requiredScope,
    note: `These values are governed by ${c.requiredScope}, which your role does not hold. The record exists and is intact — request the scope to read it.`,
  }
}
/**
 * Short badge label for a source system — "Salesforce" → "SF". RecordHeader
 * renders the abbreviation inline and keeps the full name for the Tooltip, so
 * both have to be real; a badge that says "SAL" helps nobody.
 */
const SYSTEM_ABBR: Record<string, string> = {
  Salesforce:  "SF",
  Workday:     "WD",
  NetSuite:    "NS",
  HubSpot:     "HS",
  "CDK Global": "CDK",
  Epic:        "EP",
}

/**
 * The record's fields in the shape RecordHeader's RECORD zone wants.
 *
 * Two things this shape gets right that the flat metadata row did not:
 *
 *   1 · Provenance is per FIELD, not per record. A contact's role comes from
 *       the CRM and their verified-fact count comes from the knowledge system;
 *       one `source` on the whole record was a simplification that stopped
 *       being true the moment two fields disagreed about where they came from.
 *
 *   2 · Masking is a STATE of a field, not the absence of one. A viewer without
 *       the scope sees the same field list, the same labels and the same
 *       provenance badges — only the values are withheld. That is the honest
 *       rendering of "the fields exist and are governed", and it is what the
 *       component means by `state: "masked"`: the same field in a different
 *       entitlement state, never a different field.
 *
 * `masked` is decided by the caller against the viewer, per the component's own
 * rule — RecordHeader never resolves entitlements itself.
 */
export interface UcpRecordField {
  label:        string
  iconName:     string
  value:        string
  system:       string
  systemAbbr:   string
  modelVersion: string
  syncedAgo:    string
  masked:       boolean
}

export function getRecordFields(c: UcpContact): UcpRecordField[] {
  const restricted = restrictionFor(c) !== null
  const abbr = SYSTEM_ABBR[c.source.label] ?? c.source.label.slice(0, 2).toUpperCase()

  // The system of record for identity-shaped fields is the one the record was
  // ingested from; anything the platform derived carries the platform instead.
  const fromSource = (label: string, iconName: string, value: string) => ({
    label, iconName, value,
    system: c.source.label, systemAbbr: abbr,
    modelVersion: c.type === "employee" ? "UEP v2.3" : "UCP v2.1",
    syncedAgo: "2h ago",
    masked: restricted,
  })
  const fromPlatform = (label: string, iconName: string, value: string) => ({
    label, iconName, value,
    system: "Helix Data Studio", systemAbbr: "HX",
    modelVersion: "Knowledge v1.4",
    syncedAgo: "18m ago",
    // Counts are structural, not personal: how many facts exist is not a
    // governed value, and hiding it would misrepresent what the tenant holds.
    masked: false,
  })

  return [
    fromSource(c.type === "company" ? "Profile" : "Role", "Info", c.subtitle),
    fromSource("Account owner", "UserRound", c.owner),
    fromSource("Last interaction", "Clock", c.lastInteraction),
    fromPlatform(
      "Verified facts",
      "ShieldCheck",
      `${getFacts(c).filter(f => f.plane === "truth").length} on the Truth plane`,
    ),
    fromPlatform("Source Drives", "HardDrive", `${getDrives(c).length} attached`),
  ]
}

// ── Knowledge planes ──────────────────────────────────────────────────────────

export type KnowledgePlane = "truth" | "sandbox" | "sources"

export const PLANE_META: Record<KnowledgePlane, {
  label:      string
  confidence: string
  tag:        TagVariantLite
  blurb:      string
}> = {
  truth:   { label: "Truth",   confidence: "100%", tag: "success",     blurb: "Verified facts. Agents treat these as absolute truth." },
  sandbox: { label: "Sandbox", confidence: "~80%", tag: "alert",       blurb: "Unverified claims and drafts. Likely true, not guaranteed." },
  sources: { label: "Sources", confidence: "~60%", tag: "informative", blurb: "Raw documents and reference material, used for lookup and citation." },
}

export const PLANE_ORDER: KnowledgePlane[] = ["truth", "sandbox", "sources"]

/**
 * ── The Governance vocabulary ──────────────────────────────────────────────
 *
 * Read off the real Governance views on 2026-09-10 (Fuentes/Drive, Plano de
 * verdad, Sandbox), not invented for this prototype. Michael's instruction was
 * to take the FILTER INFORMATION and leave their UI alone, so these are the
 * option sets, translated to the language this screen is in:
 *
 *   Drives       Modificar → All · Today · Yesterday · Last 7 days ·
 *                Last 30 days · Older     +  Todos los departamentos
 *   Truth Plane  Estado → Verified · Pending review · Due to expire
 *                Nivel de riesgo → Low · Medium · High
 *                Atención requerida → Due to expire · Needs review ·
 *                Has proposals
 *   Sandbox      Todos los estados → Active · Archived
 *                Todos los ámbitos → Private · Shared · Workspace ·
 *                Department · System
 *
 * ONE DIFFERENCE WORTH KNOWING: in Governance these filter a list of PLANES —
 * "BK Ramos 08-07-26 · Hechos: 6 · Propuestas: 244 · Riesgo bajo". Here the
 * shelves list the facts and claims of ONE record, so the same vocabulary is
 * applied one level down, to the items themselves. The words are theirs; the
 * scope is this record's.
 */
export const DRIVE_MODIFIED_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Older"]
export const TRUTH_STATUSES         = ["Verified", "Pending review", "Due to expire"]
export const RISK_LEVELS            = ["Low", "Medium", "High"]
export const ATTENTION_FLAGS        = ["Due to expire", "Needs review", "Has proposals"]
export const SANDBOX_STATES         = ["Active", "Archived"]
export const SANDBOX_SCOPES         = ["Private", "Shared", "Workspace", "Department", "System"]

export interface UcpFact {
  id:         string
  label:      string
  value:      string
  plane:      KnowledgePlane
  source:     string
  verifiedAt: string
  /** Governance's own three axes, filled by `getFacts` — see `governFact`. */
  status:     string
  risk:       string
  attention:  string[]
  /** Sandbox's two: what state the claim is in and how far it reaches. */
  state:      string
  scope:      string
}

// ── Activity ──────────────────────────────────────────────────────────────────

/**
 * ── What an Activity row can be ────────────────────────────────────────────
 *
 * Michael's taxonomy, 2026-09-10:
 *
 *   Communications   email, SMS, calls — and meetings, see below
 *   Notes            what somebody wrote down
 *   Events           workflows that fired
 *   Tasks            work to do, tied to the next best action
 *
 * The channel is the LEAF; `CHANNEL_GROUP` says which of the four it belongs
 * to. Two levels rather than one flat list because a flat row of seven chips
 * plus "All" is a filter nobody reads — the four groups are the chips, and
 * the communication kinds are a dropdown that only appears while
 * Communications is the selected group.
 *
 * MEETINGS ARE A COMMUNICATION, and they are the one kind Michael's list did
 * not name. The fixtures carry a QBR and a security working session: a
 * meeting is not a workflow that fired and it is not a note, so filing it
 * under Events would have been false and deleting it would have been worse.
 * It joins email, SMS and calls rather than displacing any of them.
 */
export type ActivityChannel =
  | "call" | "email" | "sms" | "meeting"
  | "note" | "event" | "task"

export type ActivityGroup = "communication" | "note" | "event" | "task"

export const ACTIVITY_GROUPS: { id: ActivityGroup; label: string }[] = [
  { id: "communication", label: "Communications" },
  { id: "note",          label: "Notes"          },
  { id: "event",         label: "Events"         },
  { id: "task",          label: "Tasks"          },
]

export const CHANNEL_GROUP: Record<ActivityChannel, ActivityGroup> = {
  call: "communication", email: "communication", sms: "communication", meeting: "communication",
  note: "note", event: "event", task: "task",
}

export const CHANNEL_META: Record<ActivityChannel, { label: string; icon: string }> = {
  call:    { label: "Calls",    icon: "Phone"        },
  email:   { label: "Email",    icon: "Mail"         },
  sms:     { label: "SMS",      icon: "MessageSquare"},
  meeting: { label: "Meetings", icon: "Users"        },
  note:    { label: "Notes",    icon: "StickyNote"   },
  event:   { label: "Events",   icon: "Zap"          },
  task:    { label: "Tasks",    icon: "ListChecks"   },
}

/** The communication kinds, for the dropdown that refines that group. */
export const COMMUNICATION_CHANNELS: ActivityChannel[] =
  (Object.keys(CHANNEL_GROUP) as ActivityChannel[]).filter(ch => CHANNEL_GROUP[ch] === "communication")

export interface UcpActivity {
  id:        string
  channel:   ActivityChannel
  title:     string
  meta:      string
  timestamp: string
  state:     { label: string; variant: TagVariantLite }
  /** Written by the record's assigned agent — rendered as EntityList's aiInsight. */
  aiSummary?: string
}

/**
 * ── Elapsed time, for the Activity list ────────────────────────────────────
 *
 * The fixtures carry timestamps in three shapes, because that is what a real
 * feed looks like: relative for anything recent ("30m ago", "3d ago"), the
 * word Today for the same day at a known hour ("Today, 08:12"), and an
 * absolute date once it stops being recent ("Aug 18, 2026 · 07:55"). One
 * parser reads all three so the grouping cannot disagree with the label the
 * row itself shows.
 *
 * `now` is injected rather than read from the clock inside these functions —
 * a list that regroups itself mid-render because a minute ticked over is a
 * bug, and a caller that memoises on `now` gets a stable list.
 */
export function parseActivityAt(timestamp: string, now: Date): Date | null {
  const rel = timestamp.match(/^(\d+)\s*([mhd])\s+ago$/i)
  if (rel) {
    const n = Number(rel[1])
    const ms = rel[2].toLowerCase() === "m" ? 60_000 : rel[2].toLowerCase() === "h" ? 3_600_000 : 86_400_000
    return new Date(now.getTime() - n * ms)
  }
  const today = timestamp.match(/^Today,\s*(\d{1,2}):(\d{2})/i)
  if (today) {
    const d = new Date(now)
    d.setHours(Number(today[1]), Number(today[2]), 0, 0)
    return d
  }
  // "Aug 18, 2026 · 07:55" — the date half is what matters for grouping.
  const parsed = new Date(timestamp.split("·")[0].trim())
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Whole days between two instants, by calendar day rather than by 24h blocks:
 *  something logged at 23:00 yesterday is YESTERDAY at 08:00 today, not today. */
function daysBetween(then: Date, now: Date): number {
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

/**
 * The separator label for a row's age — ALL CAPS, because that is what the
 * DS's own date-group label is (Notification Center: "TODAY / YESTERDAY /
 * EARLIER", Caption S Bold) and because Caption S Bold is documented as
 * all-caps only.
 *
 * The ladder is deliberately coarse at the far end: past a couple of months
 * nobody is counting weeks, and a separator per month would out-number the
 * rows it separates.
 */
export function elapsedGroupLabel(at: Date | null, now: Date): string {
  if (!at) return "UNDATED"
  const days = daysBetween(at, now)
  if (days <= 0)   return "TODAY"
  if (days === 1)  return "YESTERDAY"
  if (days < 7)    return "EARLIER THIS WEEK"
  if (days < 14)   return "A WEEK AGO"
  if (days < 30)   return `${Math.floor(days / 7)} WEEKS AGO`
  if (days < 60)   return "A MONTH AGO"
  if (days < 365)  return `${Math.round(days / 30)} MONTHS AGO`
  if (days < 730)  return "A YEAR AGO"
  return `${Math.floor(days / 365)} YEARS AGO`
}

/** The options the Activity period filter offers, and what each one means.
 *  Kept together so the label a user picks and the window it applies are one
 *  fact rather than two that can drift. */
export const ACTIVITY_PERIODS: { label: string; days: number }[] = [
  { label: "Today",        days: 0   },
  { label: "Last 7 days",  days: 7   },
  { label: "Last 30 days", days: 30  },
  { label: "Last 90 days", days: 90  },
]

export function withinPeriod(at: Date | null, periodLabel: string | undefined, now: Date): boolean {
  if (!periodLabel) return true
  const period = ACTIVITY_PERIODS.find(p => p.label === periodLabel)
  if (!period) return true
  if (!at) return false
  return daysBetween(at, now) <= period.days
}

// ── Source Drives ─────────────────────────────────────────────────────────────

export interface UcpDrive {
  id:       string
  name:     string
  /** Governance's "Todos los departamentos" filter runs on this. */
  department: string
  kind:     "Drive" | "Folder" | "Document"
  provider: string
  items:    string
  owner:    string
  lastSync: string
  scope:    string
  state:    { label: string; variant: TagVariantLite }
}

// ── Connections ───────────────────────────────────────────────────────────────

export interface UcpConnection {
  id:       string
  name:     string
  relation: string
  icon:     string
  /** Why this person is on the record. Shown on hover and on focus. */
  tooltip:  string
}

/**
 * A relationship the tenant recorded explicitly — family, and anything else a
 * derivation cannot know. It points at ANOTHER RECORD by id, never at a name:
 * a relation to somebody who is not a record in AIMS has no data behind it, so
 * `getConnections` drops it rather than rendering the label on its own.
 */
export interface UcpRelation {
  id:       string
  relation: string
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export const CONTACTS: UcpContact[] = [
  {
    id: "ORG-0023", type: "company", name: "Meridian Corp",
    subtitle: "Financial Services · 2,400 employees · New York",
    email: "accounts@meridian.com", phone: "+1 (212) 555-0142", company: "Meridian Corp",
    owner: "Priya Nair", status: "Active", lastInteraction: "Aug 22, 2026",
    source: { label: "Salesforce", iconName: "Cloud" },
    tags: [
      { label: "Renewal at risk", role: "signal", tone: "alert", severity: 3, tooltip: "Health dropped to 61 · renews Sep 5" },
      { label: "Enterprise",      role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "11 facts",     tooltip: "Verified facts · 5 on the Truth plane, 6 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "3 open",       tooltip: "Open items · 3 support escalations, oldest opened Jul 14." },
      { iconName: "HardDrive",   label: "6 drives",     tooltip: "Source Drives · 6 attached, 1 failing to sync since Aug 26." },
      { iconName: "Bot",         label: "Tier 1",       tooltip: "Assigned agent · Meridian Concierge, tier 1. Handling this account since Mar 3." },
    ],
    agent: { id: "AGT-01", name: "Meridian Concierge" },
    nba: {
      title: "Run the renewal outreach workflow",
      timestamp: "2h ago",
      rationale: "Usage grew 18% but three escalations are open and no proposal has been sent. The master agreement renews in 12 days.",
    },
    insights: [
      {
        id: "read-1", category: "Renewal", destination: "Workflows",
        headline: "Renewal at risk — usage is up, sentiment is down.",
        detail: "Seat usage grew 18% this quarter but three support escalations opened since July, all routing through the same integration. Sandra Torres has asked twice about the migration timeline without a written answer. The renewal call is the place to close that gap.",
        confidence: 82,
      },
      {
        id: "read-2", category: "Governance", destination: "Knowledge",
        headline: "The integration is the common thread in all three escalations.",
        detail: "Every escalation since July routes through the same integration, and the DPA on file predates it. Governance has one open review; closing it removes the blocker the renewal call would otherwise inherit.",
        confidence: 74,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "loaded",
  },
  {
    id: "PER-0091", type: "person", name: "Sarah Chen",
    subtitle: "Head of Compliance · Legal · Meridian Corp",
    email: "sarah.chen@meridian.com", phone: "+1 (212) 555-0188", company: "Meridian Corp",
    owner: "Priya Nair", status: "Active", lastInteraction: "Aug 28, 2026",
    source: { label: "Salesforce", iconName: "Cloud" },
    tags: [
      { label: "Awaiting review", role: "signal", tone: "neutral", severity: 1, tooltip: "Governance addendum sent Aug 28 · no response due yet" },
      { label: "Evaluator",       role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts", tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "1 open",   tooltip: "Open items · governance addendum awaiting her review." },
      { iconName: "Calendar",    label: "Since Jun", tooltip: "First interaction · June 9, 2026, via the account expansion." },
      { iconName: "Bot",         label: "Tier 1",   tooltip: "Assigned agent · Deal Concierge, tier 1. Handling this contact since Jun 9." },
    ],
    agent: { id: "AGT-02", name: "Deal Concierge" },
    relations: [{ id: "PER-0128", relation: "Family · sister" }],
    nba: null,
    insights: [
      {
        id: "read-1", category: "Deal", destination: "Knowledge",
        headline: "Technical evaluator, not the economic buyer.",
        detail: "Sarah has driven every compliance question on the Meridian expansion and cleared the data-residency review herself. She has never discussed price. Route commercial terms to Sandra Torres and keep Sarah on audit evidence.",
        confidence: 76,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "EMP-00412", type: "employee", name: "James Ortega",
    subtitle: "Senior Operations Lead · Operations · Phoenix, AZ",
    email: "james.ortega@acme.com", phone: "+1 (602) 555-0100", company: "Acme Corp",
    owner: "Lisa Park", status: "Active", lastInteraction: "Sep 1, 2026",
    source: { label: "Workday", iconName: "Building" },
    tags: [
      { label: "Review overdue", role: "signal", tone: "alert", severity: 3, tooltip: "Mid-year review with Lisa Park since Aug 20 · 12 days open" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "9 facts",   tooltip: "Verified facts · 5 on the Truth plane, 4 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "1 open",    tooltip: "Open items · mid-year performance review awaiting approval." },
      { iconName: "KeyRound",    label: "Standard",  tooltip: "Access role · Standard, Operations scope. Unchanged since Aug 14." },
      { iconName: "Calendar",    label: "4y 8m",     tooltip: "Tenure · started Jan 12, 2022." },
      { iconName: "Bot",         label: "Tier 2",    tooltip: "Assigned agent · People Concierge, tier 2." },
    ],
    agent: { id: "AGT-03", name: "People Concierge" },
    relations: [{ id: "PER-0091", relation: "Family · sister" }],
    nba: {
      title: "Escalate the overdue performance review",
      timestamp: "6h ago",
      rationale: "The mid-year review has sat with Lisa Park for 12 days and blocks his promotion cycle, which closes at the end of the month.",
    },
    insights: [
      {
        id: "read-1", category: "People", destination: "Workflows",
        headline: "Consistent operator, overdue on one approval.",
        detail: "James has closed every quarterly governance check on time for six quarters. The one open item is his mid-year review, waiting on Lisa Park since Aug 20. Nothing else on this record needs attention.",
        confidence: 91,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "error",
  },
  {
    id: "ORG-0031", type: "company", name: "Northwind Health",
    subtitle: "Healthcare · 5,100 employees · Phoenix, AZ",
    email: "partnerships@northwindhealth.org", phone: "+1 (602) 555-0177", company: "Northwind Health",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Aug 30, 2026",
    source: { label: "Epic", iconName: "Cross" },
    tags: [
      { label: "Sync pending", role: "signal", tone: "alert", severity: 2, tooltip: "2 of 5 new clinic sites have not completed network sync" },
      { label: "Enterprise",   role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "11 facts",  tooltip: "Verified facts · 5 on the Truth plane, 6 across Sandbox and Sources." },
      { iconName: "MapPin",      label: "5 sites",   tooltip: "Locations · 5 clinics added under the Aug 30 expansion." },
      { iconName: "HardDrive",   label: "6 drives",  tooltip: "Source Drives · 6 attached, all syncing." },
      { iconName: "Bot",         label: "Tier 1",    tooltip: "Assigned agent · Northwind Concierge, tier 1." },
    ],
    agent: { id: "AGT-04", name: "Northwind Concierge" },
    nba: {
      title: "Finish network sync for two clinic sites",
      timestamp: "1d ago",
      rationale: "Two of the five clinics added on Aug 30 are still unsynced, so their staff cannot reach the platform and the expansion is not fully live.",
    },
    insights: [
      {
        id: "read-1", category: "Expansion",
        headline: "Healthy account, expanding on its own initiative.",
        detail: "Northwind added five clinic sites without a discount request. Two of the five have not completed network sync, which is an onboarding task rather than a commercial risk.",
        confidence: 88,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "loaded",
  },
  {
    id: "PER-0104", type: "person", name: "Sandra Torres",
    subtitle: "VP of Operations · Meridian Corp",
    email: "sandra.torres@meridian.com", phone: "+1 (212) 555-0155", company: "Meridian Corp",
    owner: "Priya Nair", status: "Active", lastInteraction: "Sep 2, 2026",
    source: { label: "Salesforce", iconName: "Cloud" },
    tags: [
      { label: "Awaiting us", role: "signal", tone: "error", severity: 4, tooltip: "Migration timeline asked twice · still unanswered since Aug 18" },
      { label: "Buyer",       role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts",  tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "1 open",    tooltip: "Open items · migration timeline request, unanswered for 15 days." },
      { iconName: "Briefcase",   label: "$480K",     tooltip: "Deal value · Enterprise Renewal 2026, closes Sep 5." },
      { iconName: "Bot",         label: "Tier 1",    tooltip: "Assigned agent · Deal Concierge, tier 1." },
    ],
    agent: { id: "AGT-02", name: "Deal Concierge" },
    nba: {
      title: "Send the migration timeline she asked for",
      timestamp: "30m ago",
      rationale: "She has raised it on the last two calls without a written answer, and she owns the budget line on a renewal that closes in 12 days.",
      variant: "accept",
    },
    insights: [
      {
        id: "read-1", category: "Renewal", destination: "Workflows",
        headline: "Economic buyer on the Meridian renewal.",
        detail: "Sandra owns the budget line and has raised the migration timeline in the last two calls without getting a written answer. That single open question is the strongest predictor of how the renewal lands.",
        confidence: 84,
      },
      {
        id: "read-2", category: "Governance", destination: "Knowledge",
        headline: "Her budget authority is recorded, not inferred.",
        detail: "The Truth plane carries her as the approver on the Meridian expansion, sourced from the countersigned contract. Nothing needs to be verified before treating her as the decision point.",
        confidence: 88,
      },
    ],
    governance: "empty", risk: "loaded", connections: "loaded",
  },
  {
    id: "EMP-00518", type: "employee", name: "Lisa Park",
    subtitle: "Director of Operations · Operations · Phoenix, AZ",
    email: "lisa.park@acme.com", phone: "+1 (602) 555-0121", company: "Acme Corp",
    owner: "Marcus Webb", status: "Active", lastInteraction: "Sep 1, 2026",
    source: { label: "Workday", iconName: "Building" },
    tags: [
      { label: "3 approvals due", role: "signal", tone: "alert", severity: 3, tooltip: "Oldest has been queued for 12 days" },
      { label: "Manager",         role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "9 facts",  tooltip: "Verified facts · 5 on the Truth plane, 4 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "3 open",   tooltip: "Open items · 3 reviews queued for her approval." },
      { iconName: "Users",       label: "9 reports", tooltip: "Direct reports · 9 across Operations." },
      { iconName: "KeyRound",    label: "Manager",  tooltip: "Access role · Manager, Operations scope." },
    ],
    agent: { id: "AGT-03", name: "People Concierge" },
    relations: [{ id: "PER-0112", relation: "Family · sibling" }],
    nba: {
      title: "Clear the three reviews in her queue",
      timestamp: "4h ago",
      rationale: "Three reviews are waiting on her approval and the oldest has been open 12 days, which is holding up two promotion cycles.",
    },
    insights: [
      {
        id: "read-1", category: "People", destination: "Workflows",
        headline: "Approval queue is the bottleneck, not her workload.",
        detail: "Lisa manages nine reports and has three reviews queued, the oldest open 12 days. Her own governance and policy items are all current.",
        confidence: 79,
      },
      {
        id: "read-2", category: "Risk",
        headline: "The queue is a process problem, not a capacity one.",
        detail: "Her open items are all approvals waiting on her, while her own workload sits at the team median. The bottleneck is the routing rule, which is why adding headcount would not move it.",
        confidence: 77,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "PER-0112", type: "person", name: "David Park",
    subtitle: "IT Director · Meridian Corp",
    email: "david.park@meridian.com", phone: "+1 (212) 555-0163", company: "Meridian Corp",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Aug 19, 2026",
    source: { label: "Salesforce", iconName: "Cloud" },
    tags: [
      { label: "Technical", role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts", tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "CheckCheck",  label: "Cleared",  tooltip: "Reviews · signed off SSO and data residency in July. Nothing open." },
      { iconName: "Bot",         label: "Tier 1",   tooltip: "Assigned agent · Deal Concierge, tier 1." },
    ],
    agent: { id: "AGT-02", name: "Deal Concierge" },
    relations: [{ id: "EMP-00518", relation: "Family · sibling" }],
    nba: null,
    insights: [
      {
        id: "read-1", category: "Deal", destination: "Knowledge",
        headline: "Technical gatekeeper, currently unblocked.",
        detail: "David signed off on the SSO and data-residency reviews in July. No open questions since. He is the right contact if the migration timeline turns into an implementation plan.",
        confidence: 71,
      },
      {
        id: "read-2", category: "Service", destination: "Workflows",
        headline: "Unblocked now, but he owns both remaining gates.",
        detail: "The data-residency review cleared last week and the two open technical gates are both assigned to him. If he goes quiet, nothing behind him moves.",
        confidence: 73,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "ORG-0044", type: "company", name: "Kestrel Logistics",
    subtitle: "Transportation · 890 employees · Dallas, TX",
    email: "hello@kestrellogistics.com", phone: "+1 (214) 555-0190", company: "Kestrel Logistics",
    owner: "Daniel Ruiz", status: "Inactive", lastInteraction: "Jun 14, 2026",
    stateBadge: { label: "Dormant", variant: "alert" },
    source: { label: "HubSpot", iconName: "Magnet" },
    tags: [
      { label: "80d no contact", role: "signal", tone: "error", severity: 4, tooltip: "Last interaction Jun 14, when the pilot closed" },
      { label: "Inactive",       role: "signal", tone: "neutral", severity: 1, tooltip: "Lifecycle · moved to inactive Jul 1" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "11 facts", tooltip: "Verified facts · 5 on the Truth plane, 6 across Sandbox and Sources." },
      { iconName: "CircleCheck", label: "Pilot ok", tooltip: "Pilot outcome · completed Jun 14 with all success criteria met." },
      { iconName: "Bot",         label: "Tier 3",   tooltip: "Assigned agent · Kestrel Concierge, tier 3 since the account went dormant." },
    ],
    agent: { id: "AGT-05", name: "Kestrel Concierge" },
    nba: {
      title: "Open a re-engagement on the closed pilot",
      timestamp: "3d ago",
      rationale: "The pilot met every success criterion and then contact stopped without a churn signal, which usually means a sponsor change rather than a loss.",
    },
    insights: [
      {
        id: "read-1", category: "Retention", destination: "Activity",
        headline: "Dormant since the pilot closed, no stated reason.",
        detail: "The pilot completed with all success criteria met, then contact stopped. No churn signal was ever recorded, which usually means a sponsor change rather than a lost deal.",
        confidence: 64,
      },
    ],
    governance: "empty", risk: "loaded", connections: "empty",
  },
  {
    id: "EMP-00623", type: "employee", name: "Marcus Webb",
    subtitle: "VP of Operations · Operations · Remote",
    email: "marcus.webb@acme.com", phone: "+1 (602) 555-0134", company: "Acme Corp",
    owner: "Elena Fischer", status: "Active", lastInteraction: "Aug 27, 2026",
    source: { label: "Workday", iconName: "Building" },
    tags: [
      { label: "Manager",  role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "9 facts",  tooltip: "Verified facts · 5 on the Truth plane, 4 across Sandbox and Sources." },
      { iconName: "CheckCheck",  label: "Cleared",  tooltip: "Approval queue · cleared Aug 27, nothing pending." },
      { iconName: "FileCheck2",  label: "12 of 12", tooltip: "Policies signed · all 12, latest Data Handling v2.1." },
      { iconName: "KeyRound",    label: "Exec",     tooltip: "Access role · Executive, Operations scope." },
    ],
    agent: { id: "AGT-03", name: "People Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "People",
        headline: "Clear queue, current on every policy.",
        detail: "Marcus cleared his approval queue on Aug 27 and has all twelve policies signed. Nothing on this record needs a decision this week.",
        confidence: 86,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "loaded",
  },
  {
    id: "PER-0128", type: "person", name: "Amy Chen",
    subtitle: "CFO · Meridian Corp",
    email: "amy.chen@meridian.com", phone: "+1 (212) 555-0171", company: "Meridian Corp",
    owner: "Priya Nair", status: "Inactive", lastInteraction: "Apr 3, 2026",
    stateBadge: { label: "Superseded", variant: "neutral" },
    source: { label: "Salesforce", iconName: "Cloud" },
    // The only scope-gated record in the set: she is the CFO, so her values sit
    // behind finance.read, which the PM viewing this prototype does not hold.
    requiredScope: "finance.read",
    tags: [
      { label: "Inactive", role: "signal", tone: "neutral", severity: 1, tooltip: "Lifecycle · marked inactive Apr 3" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts",  tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "FileText",    label: "2024 MSA",  tooltip: "Contract history · approved the original Meridian agreement in 2024." },
      { iconName: "UserRound",   label: "S. Torres", tooltip: "Superseded by · Sandra Torres, finance approvals since April." },
    ],
    agent: { id: "AGT-02", name: "Deal Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "Governance", destination: "Knowledge",
        headline: "Superseded as the finance contact.",
        detail: "Amy approved the original Meridian contract in 2024. Finance approvals have routed through Sandra Torres since April. Keep the record for contract history.",
        confidence: 69,
      },
    ],
    governance: "empty", risk: "empty", connections: "loaded",
  },
  {
    id: "ORG-0052", type: "company", name: "Halden Manufacturing",
    subtitle: "Industrial · 1,600 employees · Cleveland, OH",
    email: "ops@halden-mfg.com", phone: "+1 (216) 555-0118", company: "Halden Manufacturing",
    owner: "Elena Fischer", status: "Active", lastInteraction: "Aug 25, 2026",
    stateBadge: { label: "Under review", variant: "informative" },
    source: { label: "NetSuite", iconName: "Boxes" },
    tags: [
      { label: "2 checks open", role: "signal", tone: "alert", severity: 2, tooltip: "Network segmentation evidence and sub-processor list · target Sep 12" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "11 facts", tooltip: "Verified facts · 5 on the Truth plane, 6 across Sandbox and Sources." },
      { iconName: "ClipboardList", label: "4 of 6", tooltip: "Security review · 4 of 6 checks cleared, target Sep 12." },
      { iconName: "HardDrive",   label: "6 drives", tooltip: "Source Drives · 6 attached, 1 failing to sync." },
      { iconName: "Bot",         label: "Tier 2",   tooltip: "Assigned agent · Halden Concierge, tier 2." },
    ],
    agent: { id: "AGT-06", name: "Halden Concierge" },
    nba: {
      title: "Send the two open security-review items",
      timestamp: "1d ago",
      rationale: "Four of six checks have cleared and the remaining two sit with Halden, who have answered every prior request within two business days.",
    },
    insights: [
      {
        id: "read-1", category: "Governance", destination: "Knowledge",
        headline: "Mid-review, on schedule.",
        detail: "Four of six security checks have cleared. The two open items are network segmentation evidence and the sub-processor list, both assigned to Halden's side.",
        confidence: 74,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "empty",
  },
  {
    id: "PER-0133", type: "person", name: "Tomás Ferreira",
    subtitle: "Head of Data Platform · Halden Manufacturing",
    email: "tomas.ferreira@halden-mfg.com", phone: "+1 (216) 555-0126", company: "Halden Manufacturing",
    owner: "Elena Fischer", status: "Active", lastInteraction: "Aug 25, 2026",
    source: { label: "NetSuite", iconName: "Boxes" },
    tags: [
      { label: "Owns 2 blockers", role: "signal", tone: "alert", severity: 3, tooltip: "Network segmentation evidence and sub-processor list · target Sep 12" },
      { label: "Technical",      role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts", tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "Inbox",       label: "2 open",   tooltip: "Open items · both remaining security-review checks." },
      { iconName: "Clock",       label: "2d reply", tooltip: "Responsiveness · has answered every prior request within two business days." },
      { iconName: "Bot",         label: "Tier 2",   tooltip: "Assigned agent · Halden Concierge, tier 2." },
    ],
    agent: { id: "AGT-06", name: "Halden Concierge" },
    nba: {
      title: "Send Tomás the remaining checklist items",
      timestamp: "1d ago",
      rationale: "He owns both open checks and replies within two business days, so a checklist is likely enough to close the review before Sep 12.",
      variant: "accept",
    },
    insights: [
      {
        id: "read-1", category: "Service", destination: "Workflows",
        headline: "Single owner of both blockers.",
        detail: "Tomás owns network segmentation evidence and the sub-processor list. He has answered every prior request within two business days, so a checklist is likely enough.",
        confidence: 80,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "EMP-00701", type: "employee", name: "Elena Fischer",
    subtitle: "Account Director · Revenue · Chicago, IL",
    email: "elena.fischer@acme.com", phone: "+1 (312) 555-0149", company: "Acme Corp",
    owner: "Marcus Webb", status: "Active", lastInteraction: "Sep 2, 2026",
    source: { label: "Workday", iconName: "Building" },
    tags: [
      { label: "Revenue",  role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "9 facts",  tooltip: "Verified facts · 5 on the Truth plane, 4 across Sandbox and Sources." },
      { iconName: "Briefcase",   label: "2 accts",  tooltip: "Owned accounts · Halden Manufacturing and Kestrel Logistics." },
      { iconName: "KeyRound",    label: "Standard", tooltip: "Access role · Standard, Revenue scope." },
      { iconName: "Calendar",    label: "4y 8m",    tooltip: "Tenure · started Jan 12, 2022." },
    ],
    agent: { id: "AGT-03", name: "People Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "People", destination: "Workflows",
        headline: "Owns two accounts mid-review, no personnel items open.",
        detail: "Elena carries Halden and Kestrel. Both have open account-side work, but nothing on her own employee record requires a decision.",
        confidence: 83,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "PER-0147", type: "person", name: "Grace Okafor",
    subtitle: "Chief Nursing Officer · Northwind Health",
    email: "grace.okafor@northwindhealth.org", phone: "+1 (602) 555-0182", company: "Northwind Health",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Aug 30, 2026",
    source: { label: "Epic", iconName: "Cross" },
    tags: [
      { label: "Sponsor",  role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts", tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "MapPin",      label: "5 sites",  tooltip: "Sponsored expansion · 5 clinic sites signed Aug 30." },
      { iconName: "Bot",         label: "Tier 1",   tooltip: "Assigned agent · Northwind Concierge, tier 1." },
    ],
    agent: { id: "AGT-04", name: "Northwind Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "Expansion", destination: "Activity",
        headline: "Executive sponsor of the expansion.",
        detail: "Grace drove the five-clinic expansion internally and signed without a discount request. Two clinics still need network sync — an onboarding task her team can close.",
        confidence: 87,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
  {
    id: "ORG-0067", type: "company", name: "Riverbend Auto Group",
    subtitle: "Automotive Retail · 640 employees · Tampa, FL",
    email: "ops@riverbendauto.com", phone: "+1 (813) 555-0164", company: "Riverbend Auto Group",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Sep 1, 2026",
    source: { label: "CDK Global", iconName: "Car" },
    tags: [
      { label: "Service backlog", role: "signal", tone: "alert", severity: 2, tooltip: "41 repair orders open past their promised date across 4 stores" },
      { label: "Multi-site",     role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "11 facts",  tooltip: "Verified facts · 5 on the Truth plane, 6 across Sandbox and Sources." },
      { iconName: "Store",       label: "4 stores",  tooltip: "Locations · 4 dealerships under one master agreement." },
      { iconName: "Wrench",      label: "41 open",   tooltip: "Open repair orders · 41 past their promised date, oldest 9 days." },
      { iconName: "Bot",         label: "Tier 1",    tooltip: "Assigned agent · Riverbend Concierge, tier 1." },
    ],
    agent: { id: "AGT-07", name: "Riverbend Concierge" },
    nba: {
      title: "Rebalance the service load across four stores",
      timestamp: "5h ago",
      rationale: "Tampa North holds 26 of the 41 late repair orders while Brandon runs at 60% bay capacity, so the backlog is routing, not headcount.",
    },
    insights: [
      {
        id: "read-1", category: "Service", destination: "Workflows",
        headline: "Healthy group, one store carrying the backlog.",
        detail: "Riverbend runs four dealerships on one master agreement. Tampa North holds 26 of the 41 late repair orders while Brandon sits at 60% bay capacity — the backlog is a routing problem, not a staffing one, and it is the only thing hurting CSI scores this quarter.",
        confidence: 79,
      },
      {
        id: "read-2", category: "Governance", destination: "Knowledge",
        headline: "Four stores, one master agreement.",
        detail: "The group signs centrally, so a service commitment made for Tampa North applies to all four. The agreement in Drives is the one that governs the backlog conversation.",
        confidence: 71,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "loaded",
  },
  {
    id: "PER-0158", type: "person", name: "Marcus Delgado",
    subtitle: "Fixed Operations Director · Riverbend Auto Group",
    email: "marcus.delgado@riverbendauto.com", phone: "+1 (813) 555-0171", company: "Riverbend Auto Group",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Sep 1, 2026",
    source: { label: "CDK Global", iconName: "Car" },
    tags: [
      { label: "Owns the backlog", role: "signal", tone: "alert", severity: 3, tooltip: "Accountable for service throughput across all four stores" },
      { label: "Operator",        role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "10 facts", tooltip: "Verified facts · 5 on the Truth plane, 5 across Sandbox and Sources." },
      { iconName: "Wrench",      label: "41 open",  tooltip: "Open repair orders · every one of them rolls up to him." },
      { iconName: "Clock",       label: "Same day", tooltip: "Responsiveness · replies same day, and prefers a phone call to email." },
      { iconName: "Bot",         label: "Tier 1",   tooltip: "Assigned agent · Riverbend Concierge, tier 1." },
    ],
    agent: { id: "AGT-07", name: "Riverbend Concierge" },
    nba: {
      title: "Walk Marcus through the routing proposal",
      timestamp: "5h ago",
      rationale: "He owns service throughput for all four stores and replies same day, so the rebalance needs his sign-off before it reaches store managers.",
      variant: "accept",
    },
    insights: [
      {
        id: "read-1", category: "Service", destination: "Workflows",
        headline: "Accountable for the one metric that is slipping.",
        detail: "Marcus owns service throughput across all four Riverbend stores, which makes him the decision point on the backlog. He replies same day and prefers a call to email — the routing proposal should reach him by phone, not in writing.",
        confidence: 81,
      },
      {
        id: "read-2", category: "People",
        headline: "He is the only accountable owner across the four stores.",
        detail: "No second name appears on service throughput in any Riverbend record. A routing change he does not agree to has nobody else to escalate to.",
        confidence: 69,
      },
    ],
    governance: "loaded", risk: "empty", connections: "loaded",
  },
// ── Types that are not people ─────────────────────────────────────────────
  // Three of them, two records each, added 2026-09-09 so the roster can be
  // seen at seven types instead of three. They are deliberately NOT
  // person-shaped: a repair order is titled with a code and has no initials,
  // a policy has no company, an asset has a custodian rather than an owner.
  // Everything the screen assumed about contacts shows up here as a bug or as
  // a slot that goes empty, which is the point of having them.
  {
    id: "POL-0114", type: "policy", name: "Data retention — customer records",
    subtitle: "Tenant-wide · Reviewed quarterly · Effective Jan 2026",
    email: "governance@acme.com", phone: "—", company: "Acme Corp",
    owner: "Elena Fischer", status: "Active", lastInteraction: "Aug 30, 2026",
    stateBadge: { label: "Under review", variant: "informative" },
    source: { label: "Helix Data Studio", iconName: "Database" },
    tags: [
      { label: "Review due 12d", role: "signal", tone: "alert", severity: 2, tooltip: "Quarterly review opens Sep 21 and no evidence has been attached yet" },
      { label: "Tenant-wide",    role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "9 facts",     tooltip: "Verified facts · 7 on the Truth plane, 2 on Sources." },
      { iconName: "Users",       label: "4 studios",   tooltip: "Scope · applies to Agentic, Data, Governance and Comms studios." },
      { iconName: "FileCheck2",  label: "3 documents", tooltip: "Canon Plane documents · the policy, its DPIA and the last audit note." },
      { iconName: "Bot",         label: "Tier 1",      tooltip: "Assigned agent · Governance Concierge, tier 1." },
    ],
    agent: { id: "AGT-10", name: "Governance Concierge" },
    nba: {
      title: "Attach the evidence for the September review",
      timestamp: "1d ago",
      rationale: "The review opens Sep 21 and the last two cycles were signed off late because evidence was gathered in the week of the review.",
    },
    insights: [
      {
        id: "read-1", category: "Governance", destination: "Knowledge",
        headline: "Applies to every studio, evidenced in one.",
        detail: "The policy is tenant-wide but the only attached evidence comes from the Data studio. The other three have nothing on file, which is what made the last two reviews run late.",
        confidence: 76,
      },
    ],
    governance: "loaded", risk: "loaded", connections: "empty",
  },
  {
    id: "POL-0121", type: "policy", name: "Agent escalation to a human",
    subtitle: "Agentic studio · Reviewed monthly · Effective Jul 2026",
    email: "governance@acme.com", phone: "—", company: "Acme Corp",
    owner: "Marcus Webb", status: "Active", lastInteraction: "Sep 2, 2026",
    source: { label: "Helix Data Studio", iconName: "Database" },
    tags: [
      { label: "Agentic studio", role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "7 facts",     tooltip: "Verified facts · 6 on the Truth plane, 1 on Sandbox." },
      { iconName: "Workflow",    label: "11 workflows", tooltip: "Bound workflows · 11 route through this policy before acting." },
      { iconName: "Bot",         label: "Tier 1",      tooltip: "Assigned agent · Governance Concierge, tier 1." },
    ],
    agent: { id: "AGT-10", name: "Governance Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "Governance", destination: "Workflows",
        headline: "Eleven workflows depend on this one policy.",
        detail: "Every agent action that reaches a customer passes through this escalation rule. A change here is not a policy edit — it is a change to eleven live workflows, which is why it reviews monthly rather than quarterly.",
        confidence: 84,
      },
    ],
    governance: "loaded", risk: "empty", connections: "empty",
  },
  {
    id: "AST-2290", type: "asset", name: "AST-2290",
    subtitle: "Service loaner · Tampa North · Acquired Mar 2024",
    email: "fleet@riverbendauto.com", phone: "—", company: "Riverbend Auto Group",
    owner: "Daniel Ruiz", status: "Active", lastInteraction: "Sep 4, 2026",
    source: { label: "CDK Global", iconName: "Car" },
    tags: [
      { label: "Service due", role: "signal", tone: "alert", severity: 2, tooltip: "42,000 km service was due at 40,000 — 2,000 km over" },
      { label: "Loaner",      role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "5 facts",    tooltip: "Verified facts · 4 on the Truth plane, 1 on Sources." },
      { iconName: "Store",       label: "Tampa North", tooltip: "Assigned site · Tampa North." },
      { iconName: "Gauge",       label: "42,000 km",  tooltip: "Odometer · 42,000 km at the last check-in, Sep 4." },
      { iconName: "Bot",         label: "Tier 3",     tooltip: "Assigned agent · Fleet Concierge, tier 3." },
    ],
    agent: { id: "AGT-11", name: "Fleet Concierge" },
    nba: {
      title: "Book the overdue 40,000 km service",
      timestamp: "6h ago",
      rationale: "It is 2,000 km past the interval and the vehicle is still going out as a loaner, which moves the liability to us.",
    },
    insights: [
      {
        id: "read-1", category: "Service", destination: "Workflows",
        headline: "Still in rotation while overdue for service.",
        detail: "The 40,000 km service is 2,000 km late and the vehicle has been issued to three customers since. It is the only loaner in the Tampa North pool in that state.",
        confidence: 83,
      },
    ],
    governance: "empty", risk: "loaded", connections: "empty",
  },
  {
    id: "AST-2314", type: "asset", name: "AST-2314",
    subtitle: "Diagnostic rig · Brandon · Acquired Nov 2025",
    email: "fleet@riverbendauto.com", phone: "—", company: "Riverbend Auto Group",
    owner: "Daniel Ruiz", status: "Inactive", lastInteraction: "Jul 18, 2026",
    stateBadge: { label: "In storage", variant: "neutral" },
    source: { label: "CDK Global", iconName: "Car" },
    tags: [
      { label: "Equipment", role: "classification" },
    ],
    meta: [
      { iconName: "ShieldCheck", label: "4 facts",   tooltip: "Verified facts · 3 on the Truth plane, 1 on Sources." },
      { iconName: "Store",       label: "Brandon",   tooltip: "Assigned site · Brandon, in storage since Jul 18." },
      { iconName: "Bot",         label: "Tier 3",    tooltip: "Assigned agent · Fleet Concierge, tier 3." },
    ],
    agent: { id: "AGT-11", name: "Fleet Concierge" },
    nba: null,
    insights: [
      {
        id: "read-1", category: "Service",
        headline: "Idle since July, and nothing is waiting on it.",
        detail: "No repair order has requested this rig since Jul 18. It is in storage at Brandon and no workflow references it, so nothing breaks while it sits.",
        confidence: 74,
      },
    ],
    governance: "empty", risk: "empty", connections: "empty",
  },
]// ── Per-record collections ────────────────────────────────────────────────────
// Built from the contact itself so every profile reads as that record's own
// data rather than one shared fixture repeated 14 times.

const COMPANY_SIZE = (c: UcpContact) => c.subtitle.split(" · ")[1] ?? "—"
const FIRST_FIELD  = (c: UcpContact) => c.subtitle.split(" · ")[0] ?? "—"

/**
 * Governance's three axes, applied to one fact.
 *
 * DERIVED, and only from things the fact already says about itself — its plane
 * and when it was last verified. That is the honest version: a Truth fact
 * verified last month is verified; one that has gone stale is due to expire;
 * a Sandbox claim has not been reviewed yet. Nothing here is a number somebody
 * made up to fill a filter.
 *
 * The staleness window is 60 days, which is the same order as the Risk study's
 * own "older than 90 days" freshness rule on this record.
 */
const KNOWLEDGE_NOW = new Date("2026-09-10")

function governFact(f: Omit<UcpFact, "status" | "risk" | "attention" | "state" | "scope">): UcpFact {
  const verified = new Date(f.verifiedAt)
  const days = Number.isNaN(verified.getTime())
    ? 0
    : Math.round((KNOWLEDGE_NOW.getTime() - verified.getTime()) / 86_400_000)
  const stale = days > 60

  const status = f.plane === "truth" ? (stale ? "Due to expire" : "Verified")
    : f.plane === "sandbox" ? "Pending review"
    : "Verified"

  const risk = f.plane === "truth" ? (stale ? "Medium" : "Low")
    : f.plane === "sandbox" ? (stale ? "High" : "Medium")
    : "Low"

  const attention = [
    ...(stale ? ["Due to expire"] : []),
    ...(f.plane === "sandbox" ? ["Needs review"] : []),
    // A claim whose source is a document has something to promote FROM, which
    // is what a proposal is in Governance's sense.
    ...(f.source.startsWith("Shared Drive") || f.source.includes("Studio") ? ["Has proposals"] : []),
  ]

  return {
    ...f,
    status, risk, attention,
    state: "Active",
    // Where the claim reaches. A fact sourced from a shared drive or a studio
    // is workspace-wide; anything read off this record's own traffic is
    // private to it.
    scope: f.source.startsWith("Shared Drive") || f.source.includes("Studio") ? "Workspace"
      : f.source.includes("CRM") || f.source.includes("Workday") || f.source.includes("Billing") ? "Department"
      : "Private",
  }
}

export function getFacts(c: UcpContact): UcpFact[] {
  if (c.type === "company") {
    return ([
      { id: "f1", label: "Legal entity",        value: `${c.name}, Inc.`,           plane: "truth",   source: "Contract · countersigned",            verifiedAt: "Aug 4, 2026"  },
      { id: "f2", label: "Industry",            value: FIRST_FIELD(c),              plane: "truth",   source: "Account record · CRM sync",           verifiedAt: "Aug 4, 2026"  },
      { id: "f3", label: "Headcount",           value: COMPANY_SIZE(c),             plane: "truth",   source: "Account record · CRM sync",           verifiedAt: "Aug 4, 2026"  },
      { id: "f4", label: "Account owner",       value: c.owner,                     plane: "truth",   source: "Territory assignment",                verifiedAt: "Jul 1, 2026"  },
      { id: "f5", label: "Billing contact",     value: c.email,                     plane: "truth",   source: "Billing system",                      verifiedAt: "Aug 4, 2026"  },
      { id: "f6", label: "Budget cycle",        value: "Calendar year, locked in Q4", plane: "sandbox", source: "Call notes — Aug 22",               verifiedAt: "Aug 22, 2026" },
      { id: "f7", label: "Competing evaluation", value: "Evaluated one other vendor in 2024", plane: "sandbox", source: "Discovery notes",          verifiedAt: "Jun 9, 2026"  },
      { id: "f8", label: "Expansion appetite",  value: "Open to adding sites without a new RFP", plane: "sandbox", source: "Email thread — Aug 18", verifiedAt: "Aug 18, 2026" },
      { id: "f9", label: "Master agreement",    value: `MSA_${c.name.split(" ")[0]}_2026.pdf`, plane: "sources", source: "Shared Drive · Legal",     verifiedAt: "Aug 4, 2026"  },
      { id: "f10", label: "Security questionnaire", value: "SIG Lite, 214 responses", plane: "sources", source: "Shared Drive · Security",           verifiedAt: "Jul 28, 2026" },
      { id: "f11", label: "Org chart",          value: "Slide deck, 3 levels deep",  plane: "sources", source: "Shared Drive · Accounts",            verifiedAt: "May 12, 2026" },
    ] as Omit<UcpFact, "status" | "risk" | "attention" | "state" | "scope">[]).map(governFact)
  }
  if (c.type === "employee") {
    return ([
      { id: "f1", label: "Full name",       value: c.name,                    plane: "truth",   source: "Workday · HRIS sync",        verifiedAt: "Sep 1, 2026"  },
      { id: "f2", label: "Role",            value: FIRST_FIELD(c),            plane: "truth",   source: "Workday · HRIS sync",        verifiedAt: "Sep 1, 2026"  },
      { id: "f3", label: "Work email",      value: c.email,                   plane: "truth",   source: "Identity provider · SSO",    verifiedAt: "Sep 1, 2026"  },
      { id: "f4", label: "Manager",         value: c.owner,                   plane: "truth",   source: "Workday · HRIS sync",        verifiedAt: "Sep 1, 2026"  },
      { id: "f5", label: "Access role",     value: "Standard · Operations",   plane: "truth",   source: "Identity provider · SSO",    verifiedAt: "Aug 14, 2026" },
      { id: "f6", label: "Career interest", value: "Mentioned interest in a platform role", plane: "sandbox", source: "1:1 notes — Aug 5", verifiedAt: "Aug 5, 2026"  },
      { id: "f7", label: "Working pattern", value: "Prefers async review over live meetings", plane: "sandbox", source: "Team retro — Jul 22", verifiedAt: "Jul 22, 2026" },
      { id: "f8", label: "Signed policies", value: "12 of 12, latest Data Handling v2.1", plane: "sources", source: "Governance Studio",  verifiedAt: "Aug 6, 2026"  },
      { id: "f9", label: "Review history",  value: "6 quarters, all completed on time",  plane: "sources", source: "Shared Drive · People", verifiedAt: "Jul 20, 2026" },
    ] as Omit<UcpFact, "status" | "risk" | "attention" | "state" | "scope">[]).map(governFact)
  }
  return ([
    { id: "f1", label: "Full name",        value: c.name,                     plane: "truth",   source: "Account record · CRM sync",   verifiedAt: "Aug 28, 2026" },
    { id: "f2", label: "Title",            value: FIRST_FIELD(c),             plane: "truth",   source: "Account record · CRM sync",   verifiedAt: "Aug 28, 2026" },
    { id: "f3", label: "Company",          value: c.company,                  plane: "truth",   source: "Account record · CRM sync",   verifiedAt: "Aug 28, 2026" },
    { id: "f4", label: "Email",            value: c.email,                    plane: "truth",   source: "Verified reply — inbound",    verifiedAt: "Aug 28, 2026" },
    { id: "f5", label: "Direct line",      value: c.phone,                    plane: "truth",   source: "Email signature",             verifiedAt: "Aug 19, 2026" },
    { id: "f6", label: "Decision role",    value: "Evaluator, not budget owner", plane: "sandbox", source: "Call notes — Aug 28",      verifiedAt: "Aug 28, 2026" },
    { id: "f7", label: "Stated priority",  value: "Auditability ahead of speed", plane: "sandbox", source: "Call notes — Aug 12",      verifiedAt: "Aug 12, 2026" },
    { id: "f8", label: "Channel preference", value: "Responds fastest to email before 9am ET", plane: "sandbox", source: "Interaction history", verifiedAt: "Aug 28, 2026" },
    { id: "f9", label: "Governance addendum", value: "Addendum_v3_redlined.pdf", plane: "sources", source: "Shared Drive · Legal",     verifiedAt: "Aug 28, 2026" },
    { id: "f10", label: "Meeting transcripts", value: "4 calls, Jun–Aug 2026",  plane: "sources", source: "Communication Hub",        verifiedAt: "Aug 28, 2026" },
  ] as Omit<UcpFact, "status" | "risk" | "attention" | "state" | "scope">[]).map(governFact)
}

export function getActivity(c: UcpContact): UcpActivity[] {
  const who   = c.name.split(" ")[0]
  const agent = c.agent.name
  return [
    /**
     * A TASK, and it is the record's next best action — the two are the same
     * object seen from two places (Michael, 2026-09-10: "Tareas: relacionadas
     * con Next Best Action"). It exists only when the engine has something to
     * recommend, which is why this is spread rather than listed: a record with
     * nothing to do has no open task, and inventing one to fill the group
     * would be inventing work.
     */
    ...(c.nba ? [{
      id: "a0", channel: "task" as ActivityChannel, title: c.nba.title,
      meta: `Owner · ${c.owner} · from the next best action`, timestamp: c.nba.timestamp,
      state: { label: "Open", variant: "alert" as TagVariantLite },
      aiSummary: c.nba.rationale,
    }] : []),
    {
      id: "a1", channel: "event", title: `${agent} refreshed the record snapshot`,
      meta: "4 facts promoted to Truth plane · 1 claim expired", timestamp: "Today, 08:12",
      state: { label: "Completed", variant: "success" },
      aiSummary: `Re-verified ${who}'s contact fields against the CRM sync and promoted four Sandbox claims after a matching source appeared. One claim about budget timing expired without corroboration and was dropped back to Sandbox.`,
    },
    {
      id: "a2", channel: "call", title: `Outbound call · ${c.phone}`,
      meta: `${c.owner} · 18:24 · Discovery follow-up`, timestamp: "Sep 2, 2026 · 14:05",
      state: { label: "Positive", variant: "success" },
      aiSummary: `${who} confirmed the evaluation is still funded and asked for a written migration timeline. No pricing objection was raised. The timeline is the one open commitment from this call.`,
    },
    {
      id: "a2b", channel: "note", title: `Note · ${c.owner}`,
      meta: "After the discovery follow-up", timestamp: "Sep 2, 2026 · 14:40",
      state: { label: "Saved", variant: "neutral" },
      aiSummary: `Wrote up the call while it was fresh: the timeline is the only open commitment, and ${who} asked for it in writing rather than on a call.`,
    },
    {
      id: "a3", channel: "email", title: "Governance addendum sent for review",
      meta: `${c.owner} → ${c.email} · 1 attachment`, timestamp: "Aug 28, 2026 · 09:40",
      state: { label: "Opened", variant: "informative" },
    },
    {
      id: "a4", channel: "meeting", title: "Quarterly business review",
      meta: `${c.owner}, ${who} · 52 min · 6 attendees`, timestamp: "Aug 22, 2026 · 11:00",
      state: { label: "Completed", variant: "success" },
      aiSummary: `Usage and roadmap were covered in full. Two escalations from July were raised again without a resolution date, which is the thread most likely to carry into the next conversation.`,
    },
    {
      id: "a5", channel: "event", title: "Record merged from duplicate",
      meta: `${c.id} absorbed a duplicate created by the inbound form`, timestamp: "Aug 19, 2026 · 16:20",
      state: { label: "Completed", variant: "success" },
    },
    {
      id: "a5b", channel: "sms", title: `SMS · ${c.phone}`,
      meta: `${c.owner} · delivered`, timestamp: "Aug 18, 2026 · 17:12",
      state: { label: "Delivered", variant: "success" },
    },
    {
      id: "a6", channel: "email", title: "Migration timeline requested",
      meta: `${c.email} → ${c.owner}`, timestamp: "Aug 18, 2026 · 07:55",
      state: { label: "Awaiting reply", variant: "alert" },
    },
    {
      id: "a7", channel: "task", title: `${agent} drafted a follow-up`,
      meta: "Draft held for review · not sent", timestamp: "Aug 18, 2026 · 08:02",
      state: { label: "Needs review", variant: "alert" },
      aiSummary: `A reply to the timeline request was drafted but held, because the delivery date it referenced was not confirmed anywhere in the Truth plane.`,
    },
    {
      id: "a8", channel: "call", title: `Inbound call · ${c.phone}`,
      meta: `${agent} · 6:41 · Routed to ${c.owner}`, timestamp: "Aug 12, 2026 · 10:42",
      state: { label: "Resolved", variant: "success" },
      aiSummary: `${who} called about audit evidence and was routed after the agent confirmed identity. The requested evidence pack was sent the same day.`,
    },
    {
      id: "a9", channel: "meeting", title: "Security review working session",
      meta: `${who} · 45 min · 4 attendees`, timestamp: "Jul 28, 2026 · 15:30",
      state: { label: "Completed", variant: "success" },
    },
    {
      id: "a10", channel: "event", title: "Source Drive attached",
      meta: "Legal · shared folder connected to this record", timestamp: "Jul 28, 2026 · 15:58",
      state: { label: "Completed", variant: "success" },
    },
    {
      id: "a11", channel: "email", title: "Evidence pack delivered",
      meta: `${c.owner} → ${c.email} · 3 attachments`, timestamp: "Jul 22, 2026 · 12:10",
      state: { label: "Opened", variant: "informative" },
    },
    {
      id: "a12", channel: "event", title: `${agent} flagged a stale fact`,
      meta: "Budget cycle claim older than 90 days", timestamp: "Jul 20, 2026 · 06:00",
      state: { label: "Resolved", variant: "success" },
      aiSummary: `The budget-cycle claim passed its freshness window. It was re-confirmed on the Aug 22 review call and returned to the Sandbox plane with a new timestamp.`,
    },
    {
      id: "a12b", channel: "note", title: `Note · ${c.owner}`,
      meta: "Before the security review", timestamp: "Jul 26, 2026 · 11:20",
      state: { label: "Saved", variant: "neutral" },
    },
    {
      id: "a13", channel: "call", title: `Outbound call · ${c.phone}`,
      meta: `${c.owner} · 9:03 · No answer, voicemail left`, timestamp: "Jul 14, 2026 · 09:15",
      state: { label: "No answer", variant: "neutral" },
    },
    {
      id: "a14", channel: "event", title: "Record created",
      meta: `${c.id} · ingested from the account sync`, timestamp: "Jun 9, 2026 · 08:00",
      state: { label: "Completed", variant: "success" },
    },
  ]
}

export function getDrives(c: UcpContact): UcpDrive[] {
  const slug = c.company.split(" ")[0]
  return [
    {
      id: "d1", department: "Legal", name: `${slug} — Legal`, kind: "Folder", provider: "Google Drive",
      items: "24 documents", owner: "Legal Ops", lastSync: "Today, 06:00",
      scope: "Shared with 3 networks", state: { label: "Synced", variant: "success" },
    },
    {
      id: "d2", department: "Security", name: `${slug} — Security & Compliance`, kind: "Folder", provider: "SharePoint",
      items: "61 documents", owner: "Security", lastSync: "Today, 06:00",
      scope: "Shared with 2 networks", state: { label: "Synced", variant: "success" },
    },
    {
      id: "d3", department: "Legal", name: `MSA_${slug}_2026.pdf`, kind: "Document", provider: "Google Drive",
      items: "1 document", owner: "Legal Ops", lastSync: "Aug 4, 2026",
      scope: "Attached to this record only", state: { label: "Synced", variant: "success" },
    },
    {
      id: "d4", department: "Communications", name: `${slug} — Meeting transcripts`, kind: "Folder", provider: "Communication Hub",
      items: "18 transcripts", owner: c.owner, lastSync: "Sep 2, 2026",
      scope: "Attached to this record only", state: { label: "Synced", variant: "success" },
    },
    {
      id: "d5", department: "Revenue Ops", name: "Revenue — Account plans", kind: "Drive", provider: "Box",
      items: "412 documents", owner: "Revenue Ops", lastSync: "Aug 30, 2026",
      scope: "Shared with 6 networks", state: { label: "Partial access", variant: "alert" },
    },
    {
      id: "d6", department: "Legal", name: `${slug} — Archive 2024`, kind: "Folder", provider: "SharePoint",
      items: "137 documents", owner: "Legal Ops", lastSync: "Failed Aug 26, 2026",
      scope: "Shared with 1 network", state: { label: "Sync failed", variant: "error" },
    },
  ]
}

export function getConnections(c: UcpContact): UcpConnection[] {
  /**
   * Related CONTACTS — people, and only people.
   *
   * Michael (2026-09-09): "ese card es de contactos relacionados. Por ejemplo:
   * familia, compañero de trabajo, etc, pero solo si están dentro del ambiente
   * de AIMS y se tienen datos."
   *
   * So every row here resolves to a record in this roster. A deal, an
   * organization, a team and the assigned agent were all in this list before
   * and none of them is a contact: the company is a FIELD on the record (the
   * Organization widget shows it), the agent is in secondary metadata, and a
   * deal is not a person. An account owner who is not a record in AIMS — Priya
   * Nair, Daniel Ruiz — stays a field too, for the same reason: there is
   * nothing to open.
   *
   * Three sources, in this order, deduped by record:
   *   1. declared relations (family) — the only ones written down
   *   2. coworkers, derived from `company`
   *   3. the manager or account owner, when they are a record themselves
   */
  const out: UcpConnection[] = []
  const seen = new Set<string>([c.id])
  const push = (p: UcpContact, relation: string, tooltip: string) => {
    if (seen.has(p.id)) return
    seen.add(p.id)
    out.push({ id: p.id, name: p.name, relation, icon: TYPE_ICON[p.type], tooltip })
  }

  // 1. Declared — a relation pointing at a record that does not exist is
  //    dropped here, which is what keeps "only if it is in AIMS" structural.
  for (const r of c.relations ?? []) {
    const p = CONTACTS.find(x => x.id === r.id)
    if (p) push(p, r.relation, `${r.relation} · ${p.name}. ${TYPE_LABEL[p.type]} record in AIMS, so their own profile opens from here.`)
  }

  // A repair order has no colleagues. Types that are not people or the company
  // they work for get no derived connections at all — the widget shows its
  // empty state, which is true, rather than the account's staff, which would
  // be a different record's data on this one.
  if (!PEOPLE_TYPES.includes(c.type) && c.type !== "company") return out

  // 2. Coworkers — same company, derived. A company's own connections are the
  //    people who work there, which is the same rule read from the other side.
  const coworkers = CONTACTS.filter(x => x.type !== "company" && x.company === (c.type === "company" ? c.name : c.company))
  for (const p of coworkers) {
    const role = p.subtitle.split("·")[0].trim()
    push(p, c.type === "company" ? `${role} · ${TYPE_LABEL[p.type].toLowerCase()}` : `Coworker · ${role}`,
      c.type === "company"
        ? `Works at ${c.name} · ${role}. One of ${coworkers.length} people on this account.`
        : `Coworker at ${c.company} · ${role}. Same account, so activity on one can explain the other.`)
  }

  // 3. The manager or the account owner, only when AIMS holds a record for
  //    them. `owner` is a name rather than an id in these fixtures, so it is
  //    matched by name and skipped when there is no match.
  const owner = CONTACTS.find(x => x.name === c.owner && x.type !== "company")
  if (owner) {
    push(owner, c.type === "employee" ? "Manager" : "Account owner",
      c.type === "employee"
        ? `Manager · ${owner.name}. Reporting line inside the tenant.`
        : `Account owner · ${owner.name}. Holds this relationship on our side.`)
  }

  return out
}

/**
 * Governance and Risk studies.
 *
 * THE COLOUR COMES FROM THE VALUE, not from the row. Michael (2026-09-09):
 * "en Risk que los estados negativos usen las variables semánticas de manera
 * correcta — risk error debería ser rojo." Every variant below is computed
 * from what the number actually says, so a risk score of 78 is red wherever it
 * appears and a score of 18 is green, rather than each row carrying a colour
 * somebody typed once.
 *
 * EVERY ROW CARRIES A TOOLTIP. A counter says the number; the tooltip says
 * what is happening — which is the difference between "0" and "no flags have
 * been raised since the last scan".
 */
/** The semantic range a metric can carry. One union, so the profile's field
 *  widgets and its study widgets cannot drift into two vocabularies. */
export type MetricVariant = "success" | "alert" | "informative" | "neutral" | "error"

export interface StudyRow {
  label:   string
  value:   string
  icon:    string
  variant: MetricVariant
  tooltip: string
}

/**
 * How exposed this record is, derived from what it already says about itself.
 * A record carrying an `error` signal is not low-risk, and the study saying so
 * while a tag says otherwise is the screen contradicting itself. Before this,
 * getRisk ignored its argument and every record read 18 / 100.
 */
function riskLevel(c: UcpContact): "high" | "medium" | "low" {
  if (c.tags.some(t => t.tone === "error"))  return "high"
  if (c.tags.some(t => t.tone === "alert"))  return "medium"
  return "low"
}

export function getRisk(c: UcpContact): StudyRow[] {
  const level = riskLevel(c)
  const score = level === "high" ? 78 : level === "medium" ? 54 : 18
  const flags = level === "high" ? 3  : level === "medium" ? 1  : 0
  const prior = level === "high" ? 54 : level === "medium" ? 48 : 24
  const rising = score > prior

  return [
    {
      label: "Risk score", value: `${score} / 100`,
      icon: rising ? "TrendingUp" : "TrendingDown",
      variant: score >= 70 ? "error" : score >= 40 ? "alert" : "success",
      tooltip: `Risk score · ${score} of 100. ${
        score >= 70 ? "Above the intervention threshold — this record needs an owner this week."
        : score >= 40 ? "Elevated. Worth watching, not yet blocking."
        : "Within the normal band for this account type."}`,
    },
    {
      label: "Open flags", value: String(flags),
      icon: "Flag",
      variant: flags === 0 ? "neutral" : flags >= 3 ? "error" : "alert",
      tooltip: flags === 0
        ? "Open flags · none. Nothing has been raised since the last scan."
        : `Open flags · ${flags}. Raised by the risk study and still unresolved.`,
    },
    {
      label: "Trend", value: `${prior} → ${score}`,
      icon: rising ? "ArrowUpRight" : "ArrowDownRight",
      variant: rising ? (score >= 70 ? "error" : "alert") : "success",
      tooltip: `Trend · ${prior} to ${score} since the previous scan. ${
        rising ? "Moving the wrong way." : "Improving."}`,
    },
    {
      label: "Last scan", value: "Aug 27, 2026",
      icon: "ScanLine", variant: "informative",
      tooltip: "Last scan · Aug 27, 2026. The risk study runs weekly; anything after this date is not reflected above.",
    },
  ]
}

export function getGovernance(c: UcpContact): StudyRow[] {
  const openReviews = c.status === "Active" ? 1 : 0
  const reviewRow: StudyRow = {
    label: "Open reviews", value: String(openReviews),
    icon: "ClipboardList",
    variant: openReviews === 0 ? "neutral" : "alert",
    tooltip: openReviews === 0
      ? "Open reviews · none. Nothing is waiting on a governance decision."
      : `Open reviews · ${openReviews}. Waiting on a governance decision before it can proceed.`,
  }

  return c.type === "employee"
    ? [
        { label: "Policies signed",  value: "12 of 12",     icon: "FileCheck2",    variant: "success",
          tooltip: "Policies signed · 12 of 12. Every policy this role requires is signed and current." },
        reviewRow,
        { label: "Training current", value: "Yes",          icon: "GraduationCap", variant: "success",
          tooltip: "Training current · yes. No mandatory course is overdue for this role." },
        { label: "Last audit",       value: "Aug 10, 2026", icon: "CalendarCheck", variant: "informative",
          tooltip: "Last audit · Aug 10, 2026. Governance audits this record quarterly." },
      ]
    : [
        { label: "Compliance score", value: "94 / 100",     icon: "ShieldCheck",   variant: "success",
          tooltip: "Compliance score · 94 of 100. Computed from signed agreements, retention settings and open reviews." },
        reviewRow,
        { label: "DPA signed",       value: "Yes · v3",     icon: "FileCheck2",    variant: "success",
          tooltip: "Data Processing Agreement · v3 signed. Personal data on this record may be processed by agents." },
        { label: "Last audit",       value: "Aug 10, 2026", icon: "CalendarCheck", variant: "informative",
          tooltip: "Last audit · Aug 10, 2026. Governance audits this record quarterly." },
      ]
}

/**
 * The record's reads, in the shape the AI Summary widget takes.
 *
 * ONE mapper for every surface that shows them — the profile's Overview
 * canvas and the roster's preview panel — so the two cannot drift into
 * different anatomies again. `onOpenDestination` is wired by the caller
 * because only the caller knows how to get there; without it the destination
 * button is omitted rather than rendered dead.
 */
export function toAiInsights(
  c: UcpContact,
  opts?: { onOpenDestination?: (destination: string) => void },
): AiInsight[] {
  const facts = getFacts(c)
  const drawnFrom = PLANE_ORDER
    .map(plane => ({
      label:   `${PLANE_META[plane].label} · ${facts.filter(f => f.plane === plane).length}`,
      variant: PLANE_META[plane].tag as TagVariantLite,
      count:   facts.filter(f => f.plane === plane).length,
    }))
    .filter(d => d.count > 0)
    .map(({ label, variant }) => ({ label, variant }))

  return c.insights.map(r => ({
    id:         r.id,
    agent:      c.agent.name,
    category:   r.category,
    headline:   r.headline,
    detail:     r.detail,
    confidence: r.confidence,
    drawnFrom,
    destination: r.destination && opts?.onOpenDestination
      ? { label: `Open in ${r.destination}`, onOpen: () => opts.onOpenDestination!(r.destination!) }
      : undefined,
  }))
}

// ── Concierge chat ────────────────────────────────────────────────────────────

export interface ConciergeTurn {
  id:      string
  from:    "agent" | "user"
  text:    string
  /** Which facts the answer leaned on — the plane is what makes it auditable. */
  sources?: { label: string; plane: KnowledgePlane }[]
}

export function getConciergeOpening(c: UcpContact): ConciergeTurn[] {
  return [
    {
      id: "t1", from: "agent",
      text: `I'm the concierge for ${c.name}. I answer from this record's Truth, Sandbox and Sources planes, and I show you which one each answer came from.`,
    },
    {
      id: "t2", from: "agent",
      text: c.insights[0].detail,
      sources: [
        { label: "Interaction history",    plane: "truth"   },
        { label: "Call notes — Aug 22",    plane: "sandbox" },
        { label: "Shared Drive · Legal",   plane: "sources" },
      ],
    },
  ]
}

export const CONCIERGE_PROMPTS = [
  "What changed on this record this week?",
  "What do we still owe them?",
  "Which facts are unverified?",
]
