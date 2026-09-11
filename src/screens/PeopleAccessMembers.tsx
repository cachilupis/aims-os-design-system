import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Tag }          from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { Tabs }         from "@/components/ui/tabs"
import { Radio }        from "@/components/ui/radio"
import { Checkbox }     from "@/components/ui/checkbox"
import { Textarea }     from "@/components/ui/textarea"
import { Input }        from "@/components/ui/input"
import { Table, type TableColumn } from "@/components/ui/table"
import { Pagination }   from "@/components/ui/pagination"
import { EmptyState }   from "@/components/ui/empty-state"
import { EntityList, type EntityListItemData } from "@/components/ui/entity-list"
import { useToast }     from "@/components/ui/toast"
import { SlideOut }     from "@/components/ui/slide-out"
import { Filters }     from "@/components/ui/filters"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Chip }        from "@/components/ui/chip"
import { Toggle }      from "@/components/ui/toggle"
import { Stepper, type StepItem } from "@/components/ui/stepper"
import { StepperNavFooter } from "@/components/ui/stepper-nav-footer"
import { AvatarCircle, nameToAvatarColor } from "@/components/ui/avatar"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Tooltip } from "@/components/ui/tooltip"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * `pending` is a person who exists but has never been invited — the invite
 * wizard's "Send invitation email" toggle turned off. It is NOT `invited`
 * with the mail still in flight: nothing was sent and nothing will be until
 * somebody sends it from the profile.
 */
type MemberStatus = "active" | "invited" | "pending" | "suspended"
type UserType     = "Admin" | "Owner" | "Member"
// Legacy alias kept only to avoid cascading rename inside fixture data until full refactor
type MemberRole   = UserType
type PermState    = "g-direct" | "g-inh" | "g-denied" | ""

interface PermNode {
  id: string; label: string; desc: string; code: string
  state: PermState; scope?: string; locked?: boolean; role?: string
  children?: PermNode[]
}

type MfaMethod = "totp" | "sms" | "email"

interface MfaSession {
  id: string; device: string; browser: string; location: string
  lastActive: string; current: boolean
}

interface Member {
  id: string; name: string; email: string; role: MemberRole
  status: MemberStatus; lastActive: string | null; joinedAt: string
  initials: string; avatarColor: string; department?: string; title?: string
  mfaEnabled: boolean; mfaMethod?: MfaMethod; mfaEnrolledAt?: string
  sessions?: MfaSession[]
  /**
   * Studios granted to this person directly, rather than through a group.
   * Until the invite wizard existed, a member's studio access could ONLY come
   * from a group, so the invite modal's "Studio access" section chose
   * something the data had nowhere to put. AppsPanel unions this with the
   * group-derived set.
   */
  studios?: string[]
}

interface Role {
  id: string; label: string; system: boolean; desc: string; memberIds: string[]
  color?: string
  /** Studios this role can grant permissions in. Empty = not scoped yet. */
  studios?: string[]
}

interface Group {
  id: string; name: string; color: string; desc: string; memberIds: string[]
  studios: string[]
}

type DetailView =
  | { type: "member"; member: Member }
  | { type: "role";   role: Role }
  | { type: "group";  group: Group }
  | null

// ─── Members fixture ──────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "tg",  name: "Thomas Gonzalez",  email: "thomas.gonzalez@aimsos.ai",   role: "Owner",   status: "active",    lastActive: "2026-08-26T09:10:00Z", joinedAt: "2025-01-15T00:00:00Z", initials: "TG", avatarColor: "var(--badge-info)",       title: "Platform Owner",       department: "AIMS OS",          mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-01-15T00:00:00Z", sessions: [
    { id: "s1", device: "MacBook Pro",    browser: "Chrome 125",  location: "San Francisco, CA", lastActive: "2026-08-26T09:10:00Z", current: true  },
    { id: "s2", device: "iPhone 15 Pro",  browser: "Safari 17",   location: "San Francisco, CA", lastActive: "2026-08-25T21:00:00Z", current: false },
  ]},
  { id: "mg",  name: "Maria García",     email: "maria.garcia@avance.com",     role: "Admin",  status: "active",    lastActive: "2026-08-26T08:45:00Z", joinedAt: "2025-03-02T00:00:00Z", initials: "MG", avatarColor: "var(--badge-success)",    title: "IT Director",           department: "IT",               mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-03-02T00:00:00Z", sessions: [
    { id: "s3", device: "Windows PC",     browser: "Edge 124",    location: "Mexico City, MX",   lastActive: "2026-08-26T08:45:00Z", current: true  },
  ]},
  { id: "es",  name: "Eduardo Suárez",   email: "eduardo.suarez@avance.com",   role: "Member",        status: "active",    lastActive: "2026-08-25T17:30:00Z", joinedAt: "2025-04-10T00:00:00Z", initials: "ES", avatarColor: "var(--badge-alert)",      title: "Data Analyst",          department: "Analytics",        mfaEnabled: true,  mfaMethod: "sms",   mfaEnrolledAt: "2025-04-12T00:00:00Z", sessions: [
    { id: "s4", device: "MacBook Air",    browser: "Firefox 127", location: "Monterrey, MX",     lastActive: "2026-08-25T17:30:00Z", current: true  },
    { id: "s5", device: "iPad Pro",       browser: "Safari 17",   location: "Monterrey, MX",     lastActive: "2026-08-24T10:00:00Z", current: false },
    { id: "s6", device: "Windows Laptop", browser: "Chrome 125",  location: "Guadalajara, MX",   lastActive: "2026-08-20T09:00:00Z", current: false },
  ]},
  { id: "sb",  name: "Sarah Brown",      email: "sarah.brown@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-25T14:00:00Z", joinedAt: "2025-05-18T00:00:00Z", initials: "SB", avatarColor: "var(--badge-error)",      title: "Risk Manager",          department: "Risk & Compliance", mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined, sessions: [
    { id: "s7", device: "MacBook Pro",    browser: "Chrome 125",  location: "New York, NY",      lastActive: "2026-08-25T14:00:00Z", current: true  },
  ]},
  { id: "dp",  name: "Diana Pérez",      email: "diana.perez@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-24T11:20:00Z", joinedAt: "2025-06-01T00:00:00Z", initials: "DP", avatarColor: "var(--badge-info)",       title: "Operations Lead",       department: "Operations",       mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined, sessions: [
    { id: "s8", device: "Windows PC",     browser: "Chrome 125",  location: "Mexico City, MX",   lastActive: "2026-08-24T11:20:00Z", current: true  },
  ]},
  { id: "jp",  name: "James Park",       email: "james.park@avance.com",       role: "Member", status: "active",    lastActive: "2026-08-23T09:00:00Z", joinedAt: "2025-07-07T00:00:00Z", initials: "JP", avatarColor: "var(--badge-success)",    title: "Finance Manager",       department: "Finance",          mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-07-08T00:00:00Z", sessions: [
    { id: "s9", device: "MacBook Pro",    browser: "Safari 17",   location: "Chicago, IL",       lastActive: "2026-08-23T09:00:00Z", current: true  },
  ]},
  { id: "at",  name: "Ana Torres",       email: "ana.torres@avance.com",       role: "Member",        status: "active",    lastActive: "2026-08-22T16:45:00Z", joinedAt: "2025-08-01T00:00:00Z", initials: "AT", avatarColor: "var(--badge-alert)",      title: "Business Analyst",      department: "Analytics",        mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined, sessions: [
    { id: "s10", device: "Windows Laptop", browser: "Edge 124",  location: "Guadalajara, MX",   lastActive: "2026-08-22T16:45:00Z", current: true  },
  ]},
  { id: "lr",  name: "Leo Ramírez",      email: "leo.ramirez@avance.com",      role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-20T00:00:00Z", initials: "LR", avatarColor: "var(--muted-foreground)", title: "Data Engineer",         department: "Engineering",      mfaEnabled: false, sessions: [] },
  { id: "cn",  name: "Clara Nakamura",   email: "clara.nakamura@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-21T00:00:00Z", initials: "CN", avatarColor: "var(--muted-foreground)", title: "Product Manager",       department: "Product",          mfaEnabled: false, sessions: [] },
  { id: "rv",  name: "Roberto Vargas",   email: "roberto.vargas@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-22T00:00:00Z", initials: "RV", avatarColor: "var(--muted-foreground)", title: "Solutions Architect",   department: "Engineering",      mfaEnabled: false, sessions: [] },
  { id: "nk",  name: "natalia.kim",      email: "natalia.kim@avance.com",      role: "Member",        status: "pending",   lastActive: null,                   joinedAt: "2026-08-25T00:00:00Z", initials: "NK", avatarColor: "var(--muted-foreground)", title: "",                      department: "",                 mfaEnabled: false, sessions: [] },
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Member",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",               department: "Risk & Compliance", mfaEnabled: true,  mfaMethod: "sms",   mfaEnrolledAt: "2025-09-15T00:00:00Z", sessions: [] },
  { id: "ms",  name: "Marcus Silva",     email: "marcus.silva@avance.com",     role: "Member",        status: "suspended", lastActive: "2026-06-30T08:00:00Z", joinedAt: "2025-10-01T00:00:00Z", initials: "MS", avatarColor: "var(--muted-foreground)", title: "Data Scientist",        department: "Analytics",        mfaEnabled: false, sessions: [] },
]

// ─── Permission tree fixture ──────────────────────────────────────────────────

const PERM_TREE: Record<string, PermNode[]> = {
  governance: [
    { id:"gov-drives", label:"Drives", code:"governance.drive", desc:"Manage files and folders within governance drives", state:"g-inh", role:"Manager", scope:"Tenant", locked:true, children:[
      { id:"gov-drives-view",   label:"View Drives",    desc:"Browse and read files within authorized drives",          code:"governance.drive.view",          state:"g-inh",  scope:"Tenant", locked:true, children:[
        { id:"gov-drives-view-shared",   label:"Shared drives",    desc:"Access drives shared across the organization",             code:"governance.drive.view.shared",        state:"g-inh",  scope:"Tenant", children:[
          { id:"gov-drives-view-shared-ext", label:"External shared", desc:"Access drives shared with external partners outside the org", code:"governance.drive.view.shared.ext", state:"",       scope:"Tenant" },
        ]},
        { id:"gov-drives-view-private",  label:"Private drives",   desc:"Access drives visible only to the owner",                 code:"governance.drive.view.private",       state:"",       scope:"Own" },
      ]},
      { id:"gov-drives-up",     label:"Upload files",   desc:"Add new files and documents to governance drives",        code:"governance.drive.upload",        state:"g-inh",  scope:"Tenant", locked:true },
      { id:"gov-drives-folder", label:"Create folders", desc:"Organize content by creating folder structures",          code:"governance.drive.folder.create", state:"g-inh",  scope:"Tenant", locked:true },
    ]},
    { id:"gov-sandbox", label:"Sandboxes", code:"governance.sandbox", desc:"Work within isolated environments before promoting", state:"g-inh", role:"Manager", scope:"Own", locked:true, children:[
      { id:"gov-sb-view",    label:"View Sandboxes",    desc:"List and browse available sandbox environments",          code:"governance.sandbox.view",    state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-det",     label:"Sandbox details",   desc:"Access configuration and metadata for a sandbox",        code:"governance.sandbox.details", state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-claims",  label:"View claims",       desc:"See the knowledge claims stored in a sandbox",           code:"governance.sandbox.claims",  state:"g-inh",    scope:"Own", locked:true },
      { id:"gov-sb-bundles", label:"Manage bundles",    desc:"Create and edit content bundles within a sandbox",       code:"governance.sandbox.bundles", state:"g-direct", scope:"Own" },
      { id:"gov-sb-sources", label:"Connect sources",   desc:"Link external data sources to a sandbox",                code:"governance.sandbox.sources", state:"",         scope:"Own" },
      { id:"gov-sb-promo",   label:"Promote sandboxes", desc:"Move validated content from sandbox to truth plane",     code:"governance.sandbox.promote", state:"",         scope:"Own" },
    ]},
    { id:"gov-truth", label:"Truth Plane", code:"governance.truthplane", desc:"Access the authoritative knowledge base", state:"", children:[
      { id:"gov-truth-view",  label:"View truth plane", desc:"Read facts and claims in the production truth plane", code:"governance.truthplane.view",  state:"" },
      { id:"gov-truth-facts", label:"Manage facts",     desc:"Edit, approve, or retire facts in the truth plane",  code:"governance.truthplane.facts", state:"" },
    ]},
    { id:"gov-packs", label:"Promotion Packs", code:"governance.packs", desc:"Bundle content changes for review and approval", state:"", children:[
      { id:"gov-packs-view",   label:"View packs",   desc:"Browse promotion packets and their review status", code:"governance.packs.view",   state:"g-direct" },
      { id:"gov-packs-create", label:"Create packs", desc:"Assemble new promotion packets for approval",      code:"governance.packs.create", state:"" },
    ]},
  ],
  datastudio: [
    { id:"ds-models", label:"Data Models", code:"datastudio.models", desc:"Browse and manage entity schemas and data model definitions", state:"g-inh", role:"Data Steward", scope:"Tenant", locked:true, children:[
      { id:"ds-models-view",      label:"View models",      desc:"Read data model definitions, entities, and attributes",    code:"datastudio.models.view",      state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-author",    label:"Author models",    desc:"Create and edit data model drafts",                        code:"datastudio.models.author",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-publish",   label:"Publish models",   desc:"Promote a model from Draft to Published state",            code:"datastudio.models.publish",   state:"" },
      { id:"ds-models-deprecate", label:"Deprecate models", desc:"Mark a published model as deprecated",                    code:"datastudio.models.deprecate", state:"" },
    ]},
    { id:"ds-lineage", label:"Lineage", code:"datastudio.lineage", desc:"Explore how data flows between entities and sources", state:"g-direct", scope:"Tenant", children:[
      { id:"ds-lineage-view",  label:"View lineage graph",  desc:"See the full dependency graph for data models and pipelines", code:"datastudio.lineage.view",  state:"g-direct", scope:"Tenant" },
      { id:"ds-lineage-trace", label:"Trace relationships", desc:"Follow data lineage from a specific field back to its origin", code:"datastudio.lineage.trace", state:"" },
    ]},
    { id:"ds-connectors", label:"Connectors", code:"datastudio.connectors", desc:"Configure connections to external data sources", state:"", children:[
      { id:"ds-conn-view",   label:"View connectors",   desc:"List configured source connections and their status",       code:"datastudio.connectors.view",   state:"" },
      { id:"ds-conn-manage", label:"Manage connectors", desc:"Add, edit, or remove data source connections",             code:"datastudio.connectors.manage", state:"" },
      { id:"ds-conn-test",   label:"Test connections",  desc:"Run a connectivity test against a configured data source", code:"datastudio.connectors.test",   state:"" },
    ]},
  ],
  agentic: [
    { id:"ag-workers", label:"AI Workers", code:"agentic.workers", desc:"Control access to AI worker agents and their execution", state:"g-inh", role:"Data Steward", scope:"Tenant", locked:true, children:[
      { id:"ag-workers-view",   label:"View workers",   desc:"Browse AI workers and read their configurations and run history", code:"agentic.workers.view",   state:"g-inh", scope:"Tenant", locked:true },
      { id:"ag-workers-run",    label:"Run workers",    desc:"Trigger AI worker executions manually or on a schedule",          code:"agentic.workers.run",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"ag-workers-manage", label:"Manage workers", desc:"Edit worker configurations, prompts, and tool bindings",          code:"agentic.workers.manage", state:"" },
      { id:"ag-workers-deploy", label:"Deploy workers", desc:"Publish a worker to production so it can be invoked",             code:"agentic.workers.deploy", state:"" },
    ]},
    { id:"ag-hitl", label:"Human in the Loop", code:"agentic.hitl", desc:"Handle human review checkpoints within agentic workflows", state:"g-direct", scope:"Own", children:[
      { id:"ag-hitl-view",    label:"View handoffs",    desc:"See pending human-review tasks generated by AI workers",        code:"agentic.hitl.view",    state:"g-direct", scope:"Own" },
      { id:"ag-hitl-approve", label:"Approve handoffs", desc:"Accept or reject AI decisions that require human sign-off",    code:"agentic.hitl.approve", state:"g-direct", scope:"Own" },
      { id:"ag-hitl-config",  label:"Configure HITL",   desc:"Set the conditions under which a worker pauses for human review", code:"agentic.hitl.config",  state:"" },
    ]},
    { id:"ag-networks", label:"Agentic Networks", code:"agentic.networks", desc:"Manage multi-agent topologies and orchestration graphs", state:"", children:[
      { id:"ag-net-view",   label:"View networks",   desc:"Browse agentic network definitions and their connected workers", code:"agentic.networks.view",   state:"" },
      { id:"ag-net-manage", label:"Manage networks", desc:"Create and edit agentic network topologies",                   code:"agentic.networks.manage", state:"" },
    ]},
    { id:"ag-workflows", label:"Workflows", code:"agentic.workflows", desc:"Define and run multi-step automated task sequences", state:"", children:[
      { id:"ag-wf-view",   label:"View workflows",   desc:"Browse workflow definitions and their execution logs",  code:"agentic.workflows.view",   state:"" },
      { id:"ag-wf-manage", label:"Manage workflows", desc:"Create, edit, and delete workflow step configurations", code:"agentic.workflows.manage", state:"" },
    ]},
  ],
  admin: [
    { id:"adm-members", label:"Members", code:"admin.members", desc:"Manage who can access the workspace and their account status", state:"g-inh", role:"Workspace Admin", scope:"Tenant", locked:true, children:[
      { id:"adm-members-view",    label:"View members",    desc:"List all workspace members and their profile details",      code:"admin.members.view",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-invite",  label:"Invite members",  desc:"Send invitations to bring new users into the workspace",   code:"admin.members.invite",  state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-remove",  label:"Remove members",  desc:"Permanently remove a member from the workspace",           code:"admin.members.remove",  state:"g-inh", scope:"Tenant", locked:true },
      { id:"adm-members-suspend", label:"Suspend members", desc:"Temporarily disable a member account without removing it", code:"admin.members.suspend", state:"" },
    ]},
    { id:"adm-roles", label:"Roles & Permissions", code:"admin.roles", desc:"Define and assign permission bundles across the platform", state:"g-direct", scope:"Tenant", children:[
      { id:"adm-roles-view",   label:"View roles",   desc:"Browse role definitions and see which permissions each role grants", code:"admin.roles.view",   state:"g-direct", scope:"Tenant" },
      { id:"adm-roles-manage", label:"Manage roles", desc:"Create custom roles and modify the permissions they grant",         code:"admin.roles.manage", state:"" },
    ]},
    { id:"adm-integrations", label:"Integrations", code:"admin.integrations", desc:"Connect external services and manage third-party credentials", state:"", children:[
      { id:"adm-int-view",   label:"View integrations",   desc:"List configured third-party integrations and their status", code:"admin.integrations.view",   state:"" },
      { id:"adm-int-manage", label:"Manage integrations", desc:"Add, configure, or remove integration connections",         code:"admin.integrations.manage", state:"" },
    ]},
    { id:"adm-audit", label:"Audit & Compliance", code:"admin.audit", desc:"Review and export a tamper-evident log of platform activity", state:"", children:[
      { id:"adm-audit-view",   label:"View audit log",   desc:"Read the chronological log of admin and user actions", code:"admin.audit.view",   state:"" },
      { id:"adm-audit-export", label:"Export audit log", desc:"Download a copy of the audit trail as CSV or JSON",    code:"admin.audit.export", state:"" },
    ]},
  ],
}

// ─── Roles fixture ────────────────────────────────────────────────────────────

const ROLES: Role[] = [
  { id: "workspace-admin",    label: "Workspace Admin",    system: true, desc: "Full control over workspace settings, members, studios, and billing",                     memberIds: ["tg", "mg", "es"], studios: ["governance", "datastudio", "agentic", "admin"] },  // audit-ignore: prototype fixture data
  { id: "developer",          label: "Developer",          system: true, desc: "Build and deploy integrations, agents, and custom workflows",                            memberIds: ["es", "sb", "dp"], studios: ["agentic", "datastudio"] },  // audit-ignore: prototype fixture data
  { id: "viewer",             label: "Viewer",             system: true, desc: "Read-only access across all non-sensitive studio content",                               memberIds: ["at", "fw"], studios: ["governance", "datastudio", "agentic", "admin"] },  // audit-ignore: prototype fixture data
  { id: "agent-builder",      label: "Agent Builder",      system: false, desc: "Create and manage AI workers, agentic networks, and workflow definitions",              memberIds: ["sb", "dp"], studios: ["agentic"] },  // audit-ignore: prototype fixture data
  { id: "data-steward",       label: "Data Steward",       system: false, desc: "Manage model definitions, governance policies, and data lineage graphs",                memberIds: ["mg"], studios: ["datastudio", "governance"] },  // audit-ignore: prototype fixture data
  { id: "compliance-auditor", label: "Compliance Auditor", system: false, desc: "Read-only access to audit logs, governance events, data lineage, and access settings", memberIds: [], studios: ["governance", "admin"] },  // audit-ignore: prototype fixture data
]

const ROLE_PERM_COUNTS: Record<string, { governance: number; datastudio: number; agentic: number; admin: number; total: number }> = {
  "workspace-admin":    { governance: 6, datastudio: 5, agentic: 7, admin: 10, total: 28 },
  "developer":          { governance: 0, datastudio: 4, agentic: 6, admin: 2,  total: 11 },
  "viewer":             { governance: 2, datastudio: 2, agentic: 1, admin: 2,  total: 8  },
  "agent-builder":      { governance: 0, datastudio: 0, agentic: 7, admin: 0,  total: 7  },
  "data-steward":       { governance: 3, datastudio: 3, agentic: 0, admin: 1,  total: 7  },
  "compliance-auditor": { governance: 2, datastudio: 2, agentic: 1, admin: 3,  total: 8  },
}

// Per-role permission states: what each role directly grants
const ROLE_PERM_STATES: Record<string, Record<string, PermState>> = {
  "workspace-admin": {
    "gov-drives": "g-direct", "gov-drives-view": "g-direct", "gov-drives-up": "g-direct", "gov-drives-folder": "g-direct",
    "gov-sandbox": "g-direct", "gov-sb-view": "g-direct", "gov-sb-det": "g-direct", "gov-sb-claims": "g-direct", "gov-sb-bundles": "g-direct", "gov-sb-sources": "g-direct", "gov-sb-promo": "g-direct",
    "gov-truth": "g-direct", "gov-truth-view": "g-direct", "gov-truth-facts": "g-direct",
    "gov-packs": "g-direct", "gov-packs-view": "g-direct", "gov-packs-create": "g-direct",
    "ds-models": "g-direct", "ds-models-view": "g-direct", "ds-models-author": "g-direct", "ds-models-publish": "g-direct", "ds-models-deprecate": "g-direct",
    "ds-lineage": "g-direct", "ds-lineage-view": "g-direct", "ds-lineage-trace": "g-direct",
    "ds-connectors": "g-direct", "ds-conn-view": "g-direct", "ds-conn-manage": "g-direct", "ds-conn-test": "g-direct",
    "ag-workers": "g-direct", "ag-workers-view": "g-direct", "ag-workers-run": "g-direct", "ag-workers-manage": "g-direct", "ag-workers-deploy": "g-direct",
    "ag-hitl": "g-direct", "ag-hitl-view": "g-direct", "ag-hitl-approve": "g-direct", "ag-hitl-config": "g-direct",
    "ag-networks": "g-direct", "ag-net-view": "g-direct", "ag-net-manage": "g-direct",
    "ag-workflows": "g-direct", "ag-wf-view": "g-direct", "ag-wf-manage": "g-direct",
    "adm-members": "g-direct", "adm-members-view": "g-direct", "adm-members-invite": "g-direct", "adm-members-remove": "g-direct", "adm-members-suspend": "g-direct",
    "adm-roles": "g-direct", "adm-roles-view": "g-direct", "adm-roles-manage": "g-direct",
    "adm-integrations": "g-direct", "adm-int-view": "g-direct", "adm-int-manage": "g-direct",
    "adm-audit": "g-direct", "adm-audit-view": "g-direct", "adm-audit-export": "g-direct",
  },
  "developer": {
    "ds-models": "g-direct", "ds-models-view": "g-direct", "ds-models-author": "g-direct",
    "ds-connectors": "g-direct", "ds-conn-view": "g-direct", "ds-conn-manage": "g-direct", "ds-conn-test": "g-direct",
    "ag-workers": "g-direct", "ag-workers-view": "g-direct", "ag-workers-run": "g-direct", "ag-workers-manage": "g-direct", "ag-workers-deploy": "g-direct",
    "ag-networks": "g-direct", "ag-net-view": "g-direct", "ag-net-manage": "g-direct",
    "ag-workflows": "g-direct", "ag-wf-view": "g-direct", "ag-wf-manage": "g-direct",
    "adm-integrations": "g-direct", "adm-int-view": "g-direct", "adm-int-manage": "g-direct",
    "adm-audit-view": "g-direct",
  },
  "viewer": {
    "gov-drives-view": "g-direct",
    "gov-sb-view": "g-direct",
    "gov-truth-view": "g-direct",
    "gov-packs-view": "g-direct",
    "ds-models-view": "g-direct",
    "ds-lineage": "g-direct", "ds-lineage-view": "g-direct",
    "ag-workers-view": "g-direct",
    "ag-hitl-view": "g-direct",
    "adm-members-view": "g-direct",
    "adm-roles-view": "g-direct",
  },
  "agent-builder": {
    "ag-workers": "g-direct", "ag-workers-view": "g-direct", "ag-workers-run": "g-direct", "ag-workers-manage": "g-direct", "ag-workers-deploy": "g-direct",
    "ag-hitl": "g-direct", "ag-hitl-view": "g-direct", "ag-hitl-approve": "g-direct", "ag-hitl-config": "g-direct",
    "ag-networks": "g-direct", "ag-net-view": "g-direct", "ag-net-manage": "g-direct",
    "ag-workflows": "g-direct", "ag-wf-view": "g-direct", "ag-wf-manage": "g-direct",
  },
  "data-steward": {
    "gov-drives": "g-direct", "gov-drives-view": "g-direct", "gov-drives-up": "g-direct", "gov-drives-folder": "g-direct",
    "gov-sandbox": "g-direct", "gov-sb-view": "g-direct", "gov-sb-det": "g-direct", "gov-sb-claims": "g-direct", "gov-sb-bundles": "g-direct",
    "gov-packs": "g-direct", "gov-packs-view": "g-direct", "gov-packs-create": "g-direct",
    "ds-models": "g-direct", "ds-models-view": "g-direct", "ds-models-author": "g-direct", "ds-models-publish": "g-direct",
    "ds-lineage": "g-direct", "ds-lineage-view": "g-direct", "ds-lineage-trace": "g-direct",
    "adm-audit-view": "g-direct",
  },
  "compliance-auditor": {
    "gov-truth-view": "g-direct",
    "gov-packs-view": "g-direct",
    "ds-models-view": "g-direct",
    "ds-lineage-view": "g-direct",
    "ag-workers-view": "g-direct",
    "adm-members-view": "g-direct",
    "adm-roles-view": "g-direct",
    "adm-audit": "g-direct", "adm-audit-view": "g-direct", "adm-audit-export": "g-direct",
  },
}

// ─── Groups fixture ───────────────────────────────────────────────────────────

const GROUPS: Group[] = [
  { id: "engineering",  name: "Engineering",          color: "#10b981", desc: "Platform and product engineers building integrations and workflows.",    memberIds: ["es", "dp"],         studios: ["agentic", "datastudio", "governance"] },  // audit-ignore: prototype fixture data
  { id: "ai-ops",       name: "AI Ops",               color: "#06b6d4", desc: "Responsible for deploying and monitoring AI workers in production.",      memberIds: ["sb", "dp"],         studios: ["agentic"] },  // audit-ignore: prototype fixture data
  { id: "data-team",    name: "Data Team",             color: "#8b5cf6", desc: "Data engineers and stewards managing model governance and lineage.",     memberIds: ["mg"],               studios: ["datastudio", "governance"] },  // audit-ignore: prototype fixture data
  { id: "leadership",   name: "Leadership",            color: "#f97316", desc: "Executives and directors with read access across all studios.",           memberIds: ["tg", "mg", "es"],   studios: ["agentic", "governance", "datastudio"] },  // audit-ignore: prototype fixture data
  { id: "compliance",   name: "Compliance & Audit",   color: "#0ea5e9", desc: "Read-only access to audit logs and governance events.",                   memberIds: [],                   studios: ["governance"] },  // audit-ignore: prototype fixture data
  { id: "external",     name: "External Consultants", color: "#84cc16", desc: "Limited scoped access for contracted third-party consultants.",            memberIds: [],                   studios: [] },  // audit-ignore: prototype fixture data
]

const STUDIO_META: Record<string, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  governance: { label: "Governance Studio",  color: "#10b981", icon: <Icons.ShieldCheck size={16} />,  desc: "Policy management, data lineage, and compliance workflows" },  // audit-ignore
  datastudio:  { label: "Data Studio",        color: "#8b5cf6", icon: <Icons.Database size={16} />,     desc: "Model authoring, dataset management, and schema design" },     // audit-ignore
  agentic:    { label: "Agentic Studio",     color: "#06b6d4", icon: <Icons.Bot size={16} />,          desc: "AI worker configuration and agentic network management" },      // audit-ignore
  admin:      { label: "Admin Console",      color: "#6366f1", icon: <Icons.Settings size={16} />,     desc: "Platform settings, members, billing, and integrations" },       // audit-ignore
}


// ─── Impact helpers ───────────────────────────────────────────────────────────

function computeStudioLoss(member: Member, allGroups: Group[], removingGroupId: string): string[] {
  if (member.role === "Admin" || member.role === "Owner") return []
  const group = allGroups.find(g => g.id === removingGroupId)
  if (!group) return []
  const remainingStudios = new Set(
    allGroups
      .filter(g => g.memberIds.includes(member.id) && g.id !== removingGroupId)
      .flatMap(g => g.studios)
  )
  return group.studios.filter(s => !remainingStudios.has(s))
}

function isLastAdminInRole(memberId: string, roleId: string, allRoles: Role[]): boolean {
  if (roleId !== "workspace-admin") return false
  const role = allRoles.find(r => r.id === roleId)
  return !!role && role.memberIds.length === 1 && role.memberIds[0] === memberId
}

// ─── Display helpers ──────────────────────────────────────────────────────────

// Tag carries the colour now. A status is a state, so it gets the semantic
// range — except Suspended, which is NEUTRAL and not error: a suspended
// account is a decision someone made, not a failure.
const STATUS_TAG: Record<MemberStatus, "success" | "informative" | "neutral"> = {
  active:    "success",
  invited:   "informative",
  // Informative is for something in flight; nothing is outstanding on a
  // pending contact, so it reads neutral like Suspended does.
  pending:   "neutral",
  suspended: "neutral",
}
const STATUS_LABEL: Record<MemberStatus, string> = {
  active:    "Active",
  invited:   "Invited",
  pending:   "Pending",
  suspended: "Suspended",
}

const USER_TYPE_TAG: Record<UserType, "error" | "alert" | "neutral"> = {
  "Owner":  "error",
  "Admin":  "alert",
  "Member": "neutral",
}
const STUDIO_TAG: Record<string, "limeGreen" | "purple" | "lightBlue" | "informative"> = {
  governance: "limeGreen",
  datastudio: "purple",
  agentic:    "lightBlue",
  admin:      "informative",
}
/**
 * A role has no colour of its own in the fixture — `Role.color` is optional
 * and not one of the six sets it, so every `background: role.color` dot on
 * this screen has been rendering invisible. The identity comes from the
 * component instead, rotated across the palette so a column of roles does not
 * come out as six identical blue squares.
 */
const ROLE_HI_CYCLE = ["informative", "purple", "lime", "light-blue", "yellow", "neutral"] as const
/**
 * By POSITION in the catalogue, not by a hash of the id. A hash is stable but
 * it collides — four of the six roles came out the same blue — and the whole
 * point of varying the colour is that a column of roles reads as six things.
 * Position gives every role a different one for as long as the list is no
 * longer than the cycle, and repeats predictably after that.
 */
function roleHi(id: string): (typeof ROLE_HI_CYCLE)[number] {
  const i = ROLES.findIndex(r => r.id === id)
  return ROLE_HI_CYCLE[(i < 0 ? 0 : i) % ROLE_HI_CYCLE.length]
}

/**
 * A studio's identity colour lives on its HighlightIcon and its Tag, never a
 * raw hex dot — CLAUDE.md's rule, and the reason the four studios had drifted
 * into three different greens across this file.
 */
const STUDIO_HI: Record<string, "lime" | "purple" | "light-blue" | "informative"> = {
  governance: "lime",
  datastudio: "purple",
  agentic:    "light-blue",
  admin:      "informative",
}
const STUDIO_ICON_NAME: Record<string, string> = {
  governance: "ShieldCheck",
  datastudio: "Database",
  agentic:    "Bot",
  admin:      "Settings",
}

/** The four studios abbreviated for tight rows — one spelling, one place. */
const STUDIO_SHORT: Record<string, string> = {
  governance: "Gov",
  datastudio: "Data",
  agentic:    "Agentic",
  admin:      "Admin",
}
const TABLE_CARD = "hover:!border-[length:0.5px] hover:!border-[color:var(--card-default-border)] hover:![box-shadow:none]"
const PROTO_NOW = new Date("2026-08-26T10:00:00Z")

function formatRelative(iso: string): string {
  const diffH = Math.floor((PROTO_NOW.getTime() - new Date(iso).getTime()) / 3_600_000)
  if (diffH < 1)  return "Just now"
  if (diffH < 24) return `${diffH}h ago`
  const d = Math.floor(diffH / 24)
  if (d === 1)    return "Yesterday"
  if (d < 7)      return `${d}d ago`
  if (d < 30)     return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function BackBreadcrumb({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)",
        cursor: "pointer", padding: "4px 0", marginBottom: 4,
        transition: "color 0.1s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
    >
      <Icons.ChevronLeft size={14} />
      Back
    </button>
  )
}

// ─── Remove confirmation modal ────────────────────────────────────────────────

function RemoveConfirmModal({
  subject, from, fromType, studioLoss, willBeEmpty, onConfirm, onCancel,
}: {
  subject: string; from: string; fromType: "group" | "role"
  studioLoss: string[]; willBeEmpty: boolean
  onConfirm: () => void; onCancel: () => void
}) {
  return createPortal(
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 10200, background: "rgba(0,0,0,0.5)" }} // audit-ignore: modal scrim
        onClick={onCancel}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 10201, width: 420, maxWidth: "90vw",
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,.28)", // audit-ignore: modal shadow
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            Remove from "{from}"?
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            {subject} will be removed from this {fromType}.
          </div>
        </div>

        {(studioLoss.length > 0 || willBeEmpty) && (
          <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
            {studioLoss.length > 0 && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icons.AlertTriangle size={14} style={{ color: "var(--badge-error)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.55 }}>
                  <div style={{ marginBottom: 6 }}>{subject} will lose access to:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {studioLoss.map(s => {
                      const meta = STUDIO_META[s]
                      return (
                        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{meta.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {willBeEmpty && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icons.AlertCircle size={14} style={{ color: "var(--badge-alert)", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.55 }}>
                  "{from}" will have no members left after this action.
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="warning" size="sm" onClick={onConfirm}>
            Remove {fromType === "group" ? "from group" : "from role"}
          </Button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ─── Undo toast ───────────────────────────────────────────────────────────────

function UndoToast({ message, onUndo, onDismiss }: { message: string; onUndo: () => void; onDismiss: () => void }) {
  return createPortal(
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 10300, display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px 10px 20px", borderRadius: 10,
      background: "var(--foreground)", color: "var(--background)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)", // audit-ignore: toast shadow
      fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      <Icons.Check size={14} />
      {message}
      <button
        onClick={onUndo}
        style={{
          marginLeft: 4, padding: "3px 10px", borderRadius: 6,
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          color: "var(--background)", textDecoration: "underline",
        }}
      >Undo</button>
      <button
        onClick={onDismiss}
        style={{ marginLeft: 4, color: "var(--background)", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
      >
        <Icons.X size={12} />
      </button>
    </div>,
    document.body
  )
}

function DetailTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: "flex", marginBottom: 0, overflowX: "auto", scrollbarWidth: "none" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          style={{
            padding: "8px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
            cursor: "pointer",
            color: active === i ? "var(--foreground)" : "var(--muted-foreground)",
            borderBottom: active === i ? "2px solid var(--primary)" : "2px solid transparent",
            marginBottom: -1, transition: "color 0.15s",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

// ─── Permission state icon ────────────────────────────────────────────────────


/**
 * `granted` / `onToggle` make this controlled. Uncontrolled it keeps its own
 * checkbox state, which is all a read-only tree ever needed — but an editor
 * built on that could only ever turn things OFF, because the caller never saw
 * the change and the list it was handed only contained what was already on.
 * The editor passes both and owns the answer.
 */
function PermTreeNode({ node, depth = 0, isEditing = false, granted, onToggle }: {
  node: PermNode
  depth?: number
  isEditing?: boolean
  granted?: (id: string) => boolean
  onToggle?: (id: string, on: boolean) => void
}) {
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const [localChecked, setLocalChecked] = useState(node.state === "g-direct" || node.state === "g-inh")
  const hasChildren = (node.children?.length ?? 0) > 0
  const isInherited = node.state === "g-inh"
  const checked = granted ? granted(node.id) : localChecked
  const setChecked = onToggle ? (on: boolean) => onToggle(node.id, on) : setLocalChecked

  return (
    <div>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `8px 16px 8px ${16 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          cursor: hasChildren ? "pointer" : "default",
          background: "transparent",
        }}
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = "var(--el-row-hover)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
      >
        <div style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasChildren
            ? expanded
              ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" />
              : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />
            : null}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: depth === 0 ? 600 : 400, color: "var(--foreground)" }}>{node.label}</span>
            {/* A pill with a label in it is a Tag — this one was hand-drawn
                with its own radius, its own tint and its own border. */}
            {node.role && <Tag variant="informative" size="sm">via {node.role}</Tag>}
            {node.scope && (
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {node.scope}</span>
            )}
          </div>
          {node.desc && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{node.desc}</div>
          )}
        </div>
        <div onClick={e => e.stopPropagation()}>
          <Toggle
            checked={checked}
            disabled={!isEditing || isInherited}
            size="sm"
            onChange={isEditing && !isInherited ? setChecked : undefined}
          />
        </div>
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <PermTreeNode key={child.id} node={child} depth={depth + 1} isEditing={isEditing}
          granted={granted} onToggle={onToggle} />
      ))}
    </div>
  )
}

// ─── Permissions panel ────────────────────────────────────────────────────────

const STUDIO_TABS = [
  { id: "governance", label: "Governance" },
  { id: "datastudio",  label: "Data Studio" },
  { id: "agentic",    label: "Agentic" },
  { id: "admin",      label: "Admin" },
]

// ─── Role Permissions Panel ───────────────────────────────────────────────────

function buildRoleNodes(studioKey: string, roleId: string): PermNode[] {
  const states = ROLE_PERM_STATES[roleId] ?? {}
  return (PERM_TREE[studioKey] ?? []).map(n => ({
    ...n,
    state: (states[n.id] ?? "") as PermState,
    locked: false,
    role: undefined,
    children: n.children?.map(c => ({
      ...c,
      state: (states[c.id] ?? "") as PermState,
      locked: false,
      role: undefined,
    })),
  }))
}

const PERM_STUDIOS = [
  { id: "governance", label: "Governance Studio", icon: "ShieldCheck", description: "Policy management, data lineage, and compliance workflows" },
  { id: "data-studio", label: "Data Studio", icon: "Database", description: "Model authoring, dataset management, and schema design" },
  { id: "agentic", label: "Agentic Studio", icon: "Bot", description: "AI worker configuration and agentic network management" },
  { id: "admin", label: "Admin Console", icon: "Settings", description: "Platform settings, members, billing, and integrations" },
] as const

function RolePermissionsPanel({ role }: { role: Role }) {
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null)
  const [editingStudio, setEditingStudio] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<PermOverrides>({})
  const [scopeOverrides, setScopeOverrides] = useState<Record<string, string>>({})
  const [savedStudio, setSavedStudio] = useState<string | null>(null)
  const [removedStudios, setRemovedStudios] = useState<Set<string>>(new Set())

  const canEdit = !role.system

  function changeScopeOverride(id: string, scope: string) {
    setScopeOverrides(prev => ({ ...prev, [id]: scope }))
  }

  function togglePermission(studioId: string, id: string, on: boolean) {
    const studioNodes = buildRoleNodes(studioId, role.id)
    setOverrides(prev => {
      function findNode(list: PermNode[], targetId: string): PermNode | undefined {
        for (const n of list) {
          if (n.id === targetId) return n
          const found = findNode(n.children ?? [], targetId)
          if (found) return found
        }
      }
      function descendants(node: PermNode): PermNode[] {
        return [node, ...(node.children ?? []).flatMap(descendants)]
      }
      const copy = { ...prev }
      if (on) {
        const target = findNode(studioNodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) {
          if (node.state === "g-direct") delete copy[node.id]
          else copy[node.id] = "g-direct"
        }
      } else {
        const target = findNode(studioNodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) delete copy[node.id]
      }
      return copy
    })
  }

  function handleSave(studioId: string) {
    setOverrides({}); setScopeOverrides({}); setEditingStudio(null); setExpandedStudio(null)
    setSavedStudio(studioId)
    setTimeout(() => setSavedStudio(null), 2500)
  }

  function handleDiscard() {
    setOverrides({}); setScopeOverrides({}); setEditingStudio(null); setExpandedStudio(null)
  }

  function handleRemoveStudio(studioId: string) {
    setRemovedStudios(prev => new Set([...prev, studioId]))
    setExpandedStudio(null)
    setSavedStudio(studioId)
    setTimeout(() => setSavedStudio(null), 2500)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {!canEdit && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted-foreground)", marginBottom: 4 }}>
          <Icons.Lock size={11} /> System role · read only
        </div>
      )}

      {PERM_STUDIOS.map(studio => {
        const nodes = buildRoleNodes(studio.id, role.id)
        const allNodes = nodes.flatMap(n => [n, ...(n.children ?? [])])
        const isRemoved = removedStudios.has(studio.id)
        const grantedNodes = isRemoved ? [] : allNodes.filter(n => GRANTED_STATES.includes(n.state))
        const isExpanded = expandedStudio === studio.id
        const isEditing = editingStudio === studio.id
        const justSaved = savedStudio === studio.id
        const isOpen = (isExpanded || isEditing) && !isRemoved
        const IconEl = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>>)[studio.icon]

        return (
          <div key={studio.id} style={{
            border: `1px solid ${isEditing ? "color-mix(in srgb, var(--primary) 30%, var(--border))" : "var(--border)"}`,
            borderRadius: 10,
            overflow: "hidden",
          }}>
            {/* Editing banner */}
            {isEditing && (
              <div style={{ padding: "8px 16px", background: "color-mix(in srgb, var(--primary) 6%, transparent)", borderBottom: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--primary)" }}>
                <Icons.Pencil size={12} /> Editing permissions · Changes apply to all members with this role
              </div>
            )}

            {/* Card header — clickable to expand/collapse */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (isEditing) return
                setExpandedStudio(isExpanded ? null : studio.id)
              }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: isEditing ? "default" : "pointer" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {IconEl && <IconEl size={17} color="var(--primary)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{studio.label}</span>
                  {grantedNodes.length > 0 && (
                    <Chip variant="secondary" size="s">{grantedNodes.length} granted</Chip>
                  )}
                  {justSaved && (
                    <span style={{ fontSize: 11, color: "var(--color-text-success, #22c55e)" /* audit-ignore */, display: "flex", alignItems: "center", gap: 3 }}>
                      <Icons.CheckCircle size={11} /> Saved
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{studio.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                {!isEditing && canEdit && (
                  <Button variant="secondary" size="sm" onClick={() => {
                    setOverrides({}); setScopeOverrides({}); setEditingStudio(studio.id); setExpandedStudio(null)
                  }}>
                    <Icons.Pencil size={12} style={{ marginRight: 4 }} />Edit
                  </Button>
                )}
                {!isEditing && !canEdit && (
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icons.Eye size={11} /> View only
                  </span>
                )}
                {!isEditing && (
                  <Icons.ChevronRight size={15} color="var(--muted-foreground)" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
                )}
              </div>
            </div>

            {/* Tree — read-only when expanded, editable when editing */}
            {isOpen && (
              <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px" }}>
                {isEditing
                  ? nodes.map(n => (
                      <EditablePermTreeNode
                        key={n.id} node={n} depth={0}
                        overrides={overrides}
                        onToggle={(id, on) => togglePermission(studio.id, id, on)}
                        mode="edit"
                        scopeOverrides={scopeOverrides}
                        onScopeChange={changeScopeOverride}
                      />
                    ))
                  : (() => {
                      const visible = filterGrantedTree(nodes)
                      return visible.length > 0
                        ? visible.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
                        : <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "8px 0" }}>No permissions granted for this studio.</div>
                    })()
                }
                {isEditing && (
                  <div style={{ display: "flex", gap: 8, paddingTop: 12, paddingBottom: 4, alignItems: "center", borderTop: "1px solid var(--border)", marginTop: 8 }}>
                    <Button variant="primary" size="sm" onClick={() => handleSave(studio.id)}>Save changes</Button>
                    <Button variant="secondary" size="sm" onClick={handleDiscard}>Discard</Button>
                    <div style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => handleRemoveStudio(studio.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--error)", cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        <Icons.Trash2 size={13} /> Remove access
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Activity / Audit Log panel ───────────────────────────────────────────────

type AuditAction = "Login" | "Update" | "Create" | "Delete" | "Permission" | "Group" | "Export"
type AuditResult = "Success" | "Failed"
type AuditSource = "UI" | "API" | "System"

type AuditEvent = {
  timestamp: string   // "Sep 4, 2026 20:14:02 UTC"
  relative: string    // "2h ago"
  user: string
  userId: string
  action: AuditAction
  resource: string
  description: string
  result: AuditResult
  source: AuditSource
  roleAtEvent: string
  ip: string
  sessionId: string
  resourcePath: string
  diff?: { before: string; after: string }
}

const AUDIT_LOG: AuditEvent[] = [
  {
    timestamp: "Sep 4, 2026 14:02:18 UTC", relative: "2h ago",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Login",
    resource: "platform", description: "Signed in successfully.",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F12", resourcePath: "avance-corp / platform / session",
  },
  {
    timestamp: "Sep 3, 2026 10:17:44 UTC", relative: "Yesterday",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Permission",
    resource: "governance.sandbox.connect_sources",
    description: "Permission override applied — connect_sources granted.",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F11", resourcePath: "avance-corp / Governance Studio / sandbox / connect_sources",
    diff: { before: '{ "state": "" }', after: '{ "state": "g-direct" }' },
  },
  {
    timestamp: "Sep 2, 2026 16:34:05 UTC", relative: "2d ago",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Update",
    resource: "customer_360_v2", description: "Updated model configuration.",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F10", resourcePath: "avance-corp / Data Studio / models / customer_360_v2",
    diff: { before: '{ "retention_days": 30 }', after: '{ "retention_days": 90 }' },
  },
  {
    timestamp: "Aug 20, 2026 09:15:00 UTC", relative: "Aug 20",
    user: "Maria García", userId: "usr_mg002", action: "Group",
    resource: "Leadership", description: "Added Thomas Gonzalez to Leadership group.",
    result: "Success", source: "UI", roleAtEvent: "Admin",
    ip: "10.0.0.5", sessionId: "sess-MG401", resourcePath: "avance-corp / People & Access / groups / Leadership",
  },
  {
    timestamp: "Aug 18, 2026 16:10:33 UTC", relative: "Aug 18",
    user: "Maria García", userId: "usr_mg002", action: "Update",
    resource: "role assignment", description: "Role changed from Viewer to Owner.",
    result: "Success", source: "UI", roleAtEvent: "Admin",
    ip: "10.0.0.5", sessionId: "sess-MG400", resourcePath: "avance-corp / People & Access / members / usr_tg001 / role",
    diff: { before: '{ "role": "Viewer" }', after: '{ "role": "Owner" }' },
  },
  {
    timestamp: "Aug 15, 2026 11:30:20 UTC", relative: "Aug 15",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Update",
    resource: "GV-2200", description: "Promotion packet GV-2200 approved.",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F09", resourcePath: "avance-corp / Governance Studio / promotion-packets / GV-2200",
  },
  {
    timestamp: "Aug 10, 2026 15:20:44 UTC", relative: "Aug 10",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Create",
    resource: "governance_drives", description: "Uploaded 3 files to Governance Drives.",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F08", resourcePath: "avance-corp / Governance Studio / drives / governance_drives",
  },
  {
    timestamp: "Aug 1, 2026 09:00:00 UTC", relative: "Aug 1",
    user: "Thomas Gonzalez", userId: "usr_tg001", action: "Update",
    resource: "mfa_device", description: "MFA device enrolled — Authenticator app (TOTP).",
    result: "Success", source: "UI", roleAtEvent: "Owner",
    ip: "192.168.1.42", sessionId: "sess-A9F05", resourcePath: "avance-corp / platform / security / mfa",
  },
  {
    timestamp: "Jul 28, 2026 14:40:11 UTC", relative: "Jul 28",
    user: "Maria García", userId: "usr_mg002", action: "Permission",
    resource: "datastudio.models.publish", description: "Permission denial removed — publish cleared.",
    result: "Success", source: "UI", roleAtEvent: "Admin",
    ip: "10.0.0.5", sessionId: "sess-MG390", resourcePath: "avance-corp / Data Studio / permissions / models.publish",
    diff: { before: '{ "state": "g-denied" }', after: '{ "state": "" }' },
  },
  {
    timestamp: "Jan 14, 2025 09:00:00 UTC", relative: "Jan 14, 2025",
    user: "System", userId: "sys", action: "Create",
    resource: "workspace_membership", description: "Workspace invitation accepted.",
    result: "Success", source: "System", roleAtEvent: "—",
    ip: "—", sessionId: "—", resourcePath: "avance-corp / People & Access / members / usr_tg001",
  },
]

const ACTION_COLOR: Record<AuditAction, string> = {
  Login:      "var(--badge-info)",
  Update:     "var(--primary)",
  Create:     "var(--badge-success)",
  Delete:     "var(--badge-error, #ef4444)", // audit-ignore: hex is CSS var fallback
  Permission: "var(--badge-alert)",
  Group:      "var(--muted-foreground)",
  Export:     "var(--muted-foreground)",
}

const ACTION_FILTERS: Array<AuditAction | "All"> = ["All", "Login", "Update", "Create", "Permission", "Group"]
const RESULT_FILTERS: Array<AuditResult | "All"> = ["All", "Success", "Failed"]

function AuditUserAvatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name === "System" ? "SY" : name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue}, 55%, 42%)`, /* audit-ignore */
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", /* audit-ignore */
      letterSpacing: 0.3,
    }}>{initials}</div>
  )
}

function AuditRow({ ev, isLast }: { ev: AuditEvent; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const actionColor = ACTION_COLOR[ev.action]

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "grid", gridTemplateColumns: "20px 150px 160px 104px 130px 1fr 96px 60px",
          padding: "10px 16px", cursor: "pointer", gap: 10, alignItems: "center",
          background: expanded ? "var(--table-row-hover-bg)" : "transparent",
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "var(--el-row-hover)" }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "transparent" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)" }}>
          {expanded ? <Icons.ChevronDown size={12} /> : <Icons.ChevronRight size={12} />}
        </div>
        {/* Timestamp */}
        <div>
          <div style={{ fontSize: 12, color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>{ev.timestamp.split(" ").slice(0, 2).join(" ")}</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{ev.relative}</div>
        </div>
        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
          <AuditUserAvatar name={ev.user} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.user}</span>
        </div>
        {/* Action badge */}
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
          background: `color-mix(in srgb, ${actionColor} 14%, transparent)`,
          color: actionColor, border: `1px solid color-mix(in srgb, ${actionColor} 28%, transparent)`,
          width: "fit-content",
        }}>{ev.action}</span>
        {/* Resource */}
        <span style={{ fontSize: 11, color: "var(--foreground)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.resource}</span>
        {/* Description */}
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.description}</span>
        {/* Result */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {ev.result === "Success"
            ? <><Icons.Check size={11} color="var(--badge-success)" /><span style={{ fontSize: 11, color: "var(--badge-success)", fontWeight: 600 }}>Success</span></>
            : <><Icons.X size={11} color="var(--badge-error, #ef4444)" /><span style={{ fontSize: 11, color: "var(--badge-error, #ef4444)", fontWeight: 600 }}>Failed</span></> // audit-ignore: hex is CSS var fallback
          }
        </div>
        {/* Source */}
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", textAlign: "right" }}>
          {ev.source === "UI" ? <><Icons.Monitor size={11} style={{ display: "inline", marginRight: 3 }} />UI</>
           : ev.source === "API" ? <><Icons.Code size={11} style={{ display: "inline", marginRight: 3 }} />API</>
           : "System"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--border)", padding: "14px 16px 16px 46px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px 20px", marginBottom: 12 }}>
            {[
              { label: "USER ID",        value: ev.userId },
              { label: "ROLE AT EVENT",  value: ev.roleAtEvent },
              { label: "IP ADDRESS",     value: ev.ip },
              { label: "SESSION ID",     value: ev.sessionId },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--foreground)", fontFamily: "monospace" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: ev.diff ? 12 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 3 }}>RESOURCE PATH</div>
            <div style={{ fontSize: 12, color: "var(--foreground)", fontFamily: "monospace" }}>{ev.resourcePath}</div>
          </div>
          {ev.diff && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 6 }}>CHANGE DIFF</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontSize: 12, fontFamily: "monospace" }}>
                <div style={{ padding: "8px 14px", background: "color-mix(in srgb, var(--badge-error, #ef4444) 8%, transparent)", borderBottom: "1px solid var(--border)" }}> {/* audit-ignore: hex is CSS var fallback */}
                  <span style={{ color: "var(--muted-foreground)", marginRight: 8 }}>before</span>{ev.diff.before}
                </div>
                <div style={{ padding: "8px 14px", background: "color-mix(in srgb, var(--badge-success) 8%, transparent)" }}>
                  <span style={{ color: "var(--muted-foreground)", marginRight: 8 }}>after &nbsp;</span>{ev.diff.after}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActivityPanel() {
  const [actionFilter, setActionFilter] = useState<AuditAction | "All">("All")
  const [resultFilter, setResultFilter] = useState<AuditResult | "All">("All")
  const [search, setSearch] = useState("")

  const filtered = AUDIT_LOG.filter(ev => {
    if (actionFilter !== "All" && ev.action !== actionFilter) return false
    if (resultFilter !== "All" && ev.result !== resultFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return ev.description.toLowerCase().includes(q) || ev.resource.toLowerCase().includes(q) || ev.user.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, resources…"
          style={{ flex: 1, minWidth: 160, padding: "5px 10px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)", color: "var(--foreground)" }} />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value as AuditAction | "All")}
          style={{ padding: "5px 8px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)", color: "var(--foreground)", cursor: "pointer" }}>
          {ACTION_FILTERS.map(f => <option key={f} value={f}>{f === "All" ? "Action: All" : f}</option>)}
        </select>
        <select value={resultFilter} onChange={e => setResultFilter(e.target.value as AuditResult | "All")}
          style={{ padding: "5px 8px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)", color: "var(--foreground)", cursor: "pointer" }}>
          {RESULT_FILTERS.map(f => <option key={f} value={f}>{f === "All" ? "Result: All" : f}</option>)}
        </select>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
        <Button variant="secondary" size="sm"><Icons.Download size={12} />Export</Button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "20px 150px 160px 104px 130px 1fr 96px 60px",
          padding: "10px 16px", gap: 10,
          background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)",
        }}>
          <span />
          <span>Timestamp</span><span>User</span><span>Action</span><span>Resource</span>
          <span>Description</span><span>Result</span><span style={{ textAlign: "right" }}>Source</span>
        </div>
        {filtered.map((ev, i) => (
          <AuditRow key={i} ev={ev} isLast={i === filtered.length - 1} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", fontSize: 13, color: "var(--muted-foreground)" }}>
            No events match the current filters
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Security / MFA panel ────────────────────────────────────────────────────

const MFA_METHOD_LABEL: Record<MfaMethod, string> = {
  totp:  "Authenticator app (TOTP)",
  sms:   "SMS text message",
  email: "Email one-time code",
}
const MFA_METHOD_ICON: Record<MfaMethod, React.ReactNode> = {
  totp:  <Icons.Smartphone size={15} />,
  sms:   <Icons.MessageSquare size={15} />,
  email: <Icons.Mail size={15} />,
}

function SecurityPanel({ member, onUpdate }: { member: Member; onUpdate: (m: Member) => void }) {
  const [sessions, setSessions] = useState<MfaSession[]>(member.sessions ?? [])
  const [confirmReset, setConfirmReset] = useState(false)

  function revokeSession(id: string) {
    setSessions(s => s.filter(x => x.id !== id))
  }
  function revokeAllOthers() {
    setSessions(s => s.filter(x => x.current))
  }

  const isInvited = member.status === "invited"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* MFA status card */}
      <CardContainer className="!p-0 overflow-hidden">
        <div style={{
          padding: "12px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.ShieldCheck size={15} color={member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)"} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
              Multi-Factor Authentication
            </span>
          </div>
          <Tag variant={member.mfaEnabled ? "success" : "alert"} size="sm">
            {member.mfaEnabled ? "Enabled" : "Not enabled"}
          </Tag>
        </div>

        {member.mfaEnabled && member.mfaMethod ? (
          <div style={{ padding: "16px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InfoRow
                icon={MFA_METHOD_ICON[member.mfaMethod]}
                label="Method"
                value={MFA_METHOD_LABEL[member.mfaMethod]}
              />
              {member.mfaEnrolledAt && (
                <InfoRow
                  icon={<Icons.CalendarCheck size={14} />}
                  label="Enrolled"
                  value={formatDate(member.mfaEnrolledAt)}
                />
              )}
            </div>

            {!isInvited && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                {/* Same question, same component, same copy as the profile
                    card's Reset MFA — this used to be an inline row of
                    buttons, which is a confirmation UI invented by hand. */}
                <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>Reset MFA enrollment</Button>
                <ModalDialog
                  isOpen={confirmReset}
                  onClose={() => setConfirmReset(false)}
                  tone="warning"
                  iconName="ShieldOff"
                  title={`Reset MFA for ${member.name}?`}
                  description={`Their current ${member.mfaMethod ? MFA_METHOD_LABEL[member.mfaMethod] : "second factor"} stops working immediately. They will be asked to enrol a new one the next time they sign in.`}
                  ctaPrimary={{ label: "Reset MFA", destructive: true, onClick: () => {
                    onUpdate({ ...member, mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined })
                    setConfirmReset(false)
                  } }}
                  ctaSecondary={{ label: "Cancel", onClick: () => setConfirmReset(false) }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "16px 24px" }}>
            {isInvited ? (
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
                MFA setup is not available for pending invitations. The member will be prompted to enroll when they accept the invitation.
              </p>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 4px", lineHeight: 1.5 }}>
                    This member has not enrolled a second factor.
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0, opacity: 0.7 }}>
                    Send an enrollment reminder or require MFA for their role.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => alert(`Enrollment email sent to ${member.email}`)}>Send reminder</Button>
              </div>
            )}
          </div>
        )}
      </CardContainer>

      {/* Active sessions */}
      {!isInvited && (
        <CardContainer className="!p-0 overflow-hidden">
          <div style={{
            padding: "12px 24px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.Monitor size={15} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Active sessions</span>
              <Tag variant="neutral" size="sm">{sessions.length}</Tag>
            </div>
            {sessions.filter(s => !s.current).length > 0 && (
              <Button variant="tertiary" size="sm" onClick={revokeAllOthers}>Revoke all other sessions</Button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
              No active sessions
            </div>
          ) : sessions.map((s, i) => (
            <div
              key={s.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <HighlightIcon
                size="md"
                variant="neutral"
                icon={
                  s.device.toLowerCase().includes("iphone") || s.device.toLowerCase().includes("ipad")
                    ? <Icons.Smartphone size={16} />
                    : s.device.toLowerCase().includes("macbook") || s.device.toLowerCase().includes("laptop")
                      ? <Icons.Laptop size={16} />
                      : <Icons.Monitor size={16} />
                }
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{s.device}</span>
                  {s.current && (
                    <Tag variant="success" size="sm">Current</Tag>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  {s.browser} · {s.location} · {formatRelative(s.lastActive)}
                </div>
              </div>
              {!s.current && (
                <Button variant="secondary" size="sm" onClick={() => revokeSession(s.id)}>Revoke</Button>
              )}
            </div>
          ))}
        </CardContainer>
      )}
    </div>
  )
}

// ─── Member detail page ───────────────────────────────────────────────────────

function MemberDetailPage({
member, onBack, onToggleSuspend, onRemove, onUpdate, onSendInvite,
  allGroups, allRoles, onRemoveFromGroup, onAddToGroup, onRemoveFromRole,
  onNavigateToRole, onAssignRole, onNavigateToGroup,
}: {
  member: Member
  onBack: () => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (m: Member) => void
  onSendInvite: (id: string) => void
  allGroups: Group[]
  allRoles: Role[]
  onRemoveFromGroup: (groupId: string) => void
  onAddToGroup: (groupId: string) => void
  onRemoveFromRole: (roleId: string) => void
  onNavigateToRole: (roleId: string) => void
  onAssignRole: (roleId: string) => void
  onNavigateToGroup: (groupId: string) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [confirmResetMfa, setConfirmResetMfa] = useState(false)
  const toast = useToast()
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"
  const isPending = member.status === "pending"
  /**
   * Somebody who has never signed in has no password to reset and no MFA
   * device to clear, so those two controls are not "disabled" for them —
   * they do not apply at all, and a greyed-out button would invite the
   * question anyway. The Security tab already hides its own MFA reset on the
   * same test.
   */
  const hasSignedIn = isActive || member.status === "suspended"

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
    >
      <BackBreadcrumb onBack={onBack} />

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginTop: 16, alignItems: "start" }}>

        {/* Left: identity card. `CardContainer` owns the surface, the border
            and the radius — the hand-drawn box this used to be carried its own
            copy of all three and drifted from every other card on the page. */}
        <CardContainer className="!p-0 overflow-hidden">
          {/* Avatar + name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "28px 24px 20px",
          }}>
            {/* AvatarCircle hashes its own colour from the name and has an
                `empty` style for somebody who is not active yet — which is
                exactly the case the hand-rolled circle was faking with a grey
                background and a white hex. */}
            <AvatarCircle
              name={member.name}
              initials={member.initials}
              sizeKey="xxl"
              avatarStyle={isActive ? "text" : "empty"}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
                {member.name}
              </div>
              {(member.title || member.department) && (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>
                  {member.title}{member.title && member.department ? " · " : ""}{member.department}
                </div>
              )}
              {/* A status is a Tag, and at this size it is the S one — the
                  card is 300px wide and the name above it is the headline. */}
              <Tag size="sm" variant={STATUS_TAG[member.status]}>
                {STATUS_LABEL[member.status]}
              </Tag>
            </div>
          </div>

          {/* Divider after active tag */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Info fields */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <InfoRow icon={<Icons.Mail size={14} />}     label="Email"       value={member.email} />
            <InfoRow icon={<Icons.Calendar size={14} />} label="Joined"      value={formatDate(member.joinedAt)} />
            {member.lastActive && (
              <InfoRow icon={<Icons.Clock size={14} />}  label="Last active" value={formatRelative(member.lastActive)} />
            )}
            {isInvited && (
              <InfoRow icon={<Icons.Send size={14} />}   label="Invite sent" value={formatRelative(member.joinedAt)} />
            )}
            {isPending && (
              <InfoRow icon={<Icons.MailX size={14} />}  label="Invitation"  value="Not sent" />
            )}

            {/* User Type — read-only */}
            <InfoRow icon={<Icons.ShieldCheck size={14} />} label="User Type" value={member.role} />
          </div>

          {/* Divider after info */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Clearing somebody's second factor locks them out until they
              enrol again, so it is a question — and the DS answer to a
              question is ModalDialog, not an inline row of buttons. */}
          <ModalDialog
            isOpen={confirmResetMfa}
            onClose={() => setConfirmResetMfa(false)}
            tone="warning"
            iconName="ShieldOff"
            title={`Reset MFA for ${member.name}?`}
            description={`Their current ${member.mfaMethod ? MFA_METHOD_LABEL[member.mfaMethod] : "second factor"} stops working immediately. They will be asked to enrol a new one the next time they sign in.`}
            ctaPrimary={{ label: "Reset MFA", destructive: true, onClick: () => {
              onUpdate({ ...member, mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined })
              setConfirmResetMfa(false)
              toast.success("MFA reset", { description: `${member.name} will enrol a new device on next sign-in.` })
            } }}
            ctaSecondary={{ label: "Cancel", onClick: () => setConfirmResetMfa(false) }}
          />

          {/* Action buttons */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {hasSignedIn && (
              <>
                <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => toast.success("Password reset link sent", {
                    description: `${member.email} has one hour to use it.`,
                  })}>
                  <Icons.KeyRound size={13} /> Reset password
                </Button>
                {/* When there is nothing to reset the button stays, disabled, and
                    explains itself. `triggerClassName` is what stops Tooltip
                    being inline-flex — without it the wrapper shrinks to the
                    label and this button comes out narrower than its three
                    neighbours. The button is pointer-transparent so the hover
                    reaches that wrapper: a disabled button fires no mouse
                    events, so the tooltip would never open otherwise. */}
                {member.mfaEnabled ? (
                  <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setConfirmResetMfa(true)}>
                    <Icons.ShieldOff size={13} /> Reset MFA
                  </Button>
                ) : (
                  <Tooltip
                    side="cursor"
                    triggerClassName="block w-full"
                    content={`${member.name} has no MFA enrolled, so there is nothing to reset.`}
                  >
                    <Button variant="secondary" size="sm" disabled
                      className="pointer-events-none"
                      style={{ width: "100%", justifyContent: "center" }}>
                      <Icons.ShieldOff size={13} /> Reset MFA
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
            {/* A contact created with the wizard's email toggle off has never
                been written to. This is where that gets finished — one click,
                which is the whole point of having been able to defer it. */}
            {isPending ? (
              <Button variant="primary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onSendInvite(member.id)}>
                <Icons.Send size={13} /> Send invitation
              </Button>
            ) : isInvited ? (
              <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => alert(`Invite resent to ${member.email}`)}>
                <Icons.RefreshCw size={13} /> Resend invite
              </Button>
            ) : null}
            {/* Reset password and Reset MFA are ABOVE, under `hasSignedIn`.
                They used to be repeated here too, so an active member who had
                signed in got each button twice — the pair above with a toast
                and a confirmation, the pair here with an alert(). Suspend is
                the only action this branch actually owns. */}
            {!isInvited && !isPending && (
              <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { onToggleSuspend(member.id); onBack() }}>
                {isActive ? <><Icons.UserX size={13} /> Suspend access</> : <><Icons.UserCheck size={13} /> Reactivate account</>}
              </Button>
            )}
            {/* Removing somebody from the workspace is a question, and the DS
                answer to a question is ModalDialog — not a red box that grows
                inside the card and pushes the rest of it down. */}
            <Button variant="warning" size="sm" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setConfirmRemove(true)}>
              <Icons.Trash2 size={13} /> Remove from workspace
            </Button>
            <ModalDialog
              isOpen={confirmRemove}
              onClose={() => setConfirmRemove(false)}
              tone="error"
              iconName="Trash2"
              title={`Remove ${member.name} from the workspace?`}
              description="They lose every studio, role and group immediately, and any direct permissions go with them. This cannot be undone."
              ctaPrimary={{ label: "Remove", destructive: true, onClick: () => { onRemove(member.id); onBack() } }}
              ctaSecondary={{ label: "Cancel", onClick: () => setConfirmRemove(false) }}
            />
          </div>
        </CardContainer>

        {/* Right: tabs */}
        <div>
          <DetailTabs
            tabs={["Apps", "Roles", "Groups", "Resources", "Security", "Activity"]}
            active={activeTab}
            onChange={setActiveTab}
          />
          <div style={{ marginTop: 20 }}>
            {activeTab === 0 && <AppsPanel member={member} />}
            {activeTab === 1 && <MemberRolesPanel member={member} allRoles={allRoles} onRemoveFromRole={onRemoveFromRole} onNavigateToRole={onNavigateToRole} onAssignRole={onAssignRole} />}
            {activeTab === 2 && <MemberGroupsPanel member={member} allGroups={allGroups} onRemoveFromGroup={onRemoveFromGroup} onAddToGroup={onAddToGroup} onNavigateToGroup={onNavigateToGroup} />}
            {activeTab === 3 && <ResourcesPanel member={member} />}
            {activeTab === 4 && <SecurityPanel member={member} onUpdate={onUpdate} />}
            {activeTab === 5 && <ActivityPanel />}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}


// ─── Apps tab ─────────────────────────────────────────────────────────────────

function AppPermissionsInline({ studioId, isEditing = false, onSave, onCancel, onRemove }: {
  studioId: string
  isEditing?: boolean
  onSave?: (changed: number) => void
  onCancel?: () => void
  onRemove?: () => void
}) {
  const nodes = PERM_TREE[studioId] ?? []

  /**
   * What the user has changed in this editing session, by permission id.
   * Empty means "exactly what the role and the direct grants say".
   */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const flat = useMemo(() => nodes.flatMap(n => [n, ...(n.children ?? [])]), [nodes])
  const isOn = (id: string) => {
    if (overrides[id] !== undefined) return overrides[id]
    const n = flat.find(x => x.id === id)
    return n ? n.state === "g-direct" || n.state === "g-inh" : false
  }
  const isInherited = (id: string) => flat.find(x => x.id === id)?.state === "g-inh"

  /**
   * Reading mode shows only what is granted — a list of what this person can
   * do. EDITING shows the whole tree, because you cannot grant a permission
   * that is not on screen, and "edit" that only ever removes is a revoke
   * button with extra steps. This is the fix Michael asked for.
   */
  const granted = isEditing ? nodes : filterGrantedTree(nodes)

  const onIds      = flat.filter(n => isOn(n.id)).map(n => n.id)
  const inhCount   = onIds.filter(isInherited).length
  const directCount = onIds.length - inhCount
  const changedCount = Object.keys(overrides).filter(id => {
    const n = flat.find(x => x.id === id)
    return n ? overrides[id] !== (n.state === "g-direct" || n.state === "g-inh") : false
  }).length

  return (
    <div style={{ borderTop: `1px solid ${isEditing ? "var(--primary)" : "var(--border)"}` }}>
      {isEditing && (
        <div style={{
          padding: "8px 18px", background: "color-mix(in srgb, var(--primary) 6%, transparent)",
          display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
        }}>
          <Icons.Pencil size={12} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>Editing permissions</span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· Inherited permissions (via role) cannot be changed here</span>
        </div>
      )}
      <div style={{ padding: "12px 18px 4px" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)" }}>{directCount}</strong> direct
          </span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)" }}>{inhCount}</strong> via role
          </span>
        </div>
        {granted.length === 0 ? (
          <EmptyState
            bare
            compact
            icon={Icons.ShieldOff}
            title="Nothing granted here yet"
            description="Use Edit to turn on the permissions this member needs in this app."
          />
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            {granted.map(n => (
              <PermTreeNode key={n.id} node={n} depth={0} isEditing={isEditing}
                granted={isEditing ? isOn : undefined}
                onToggle={isEditing ? (id, on) => setOverrides(o => ({ ...o, [id]: on })) : undefined} />
            ))}
          </div>
        )}
        {isEditing && (
          <div style={{ display: "flex", gap: 8, paddingBottom: 12, alignItems: "center" }}>
            <Button variant="primary" size="sm" disabled={changedCount === 0}
              onClick={() => { onSave?.(changedCount); setOverrides({}) }}>
              {changedCount === 0 ? "Save changes" : `Save ${changedCount} change${changedCount === 1 ? "" : "s"}`}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setOverrides({}); onCancel?.() }}>Cancel</Button>
            <div style={{ flex: 1 }} />
            <Button variant="warning" size="sm" onClick={onRemove}><Icons.Trash2 size={11} /> Remove access</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function AppsPanel({ member }: { member: Member }) {
  const toast = useToast()
  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))
  const studioSet = new Set<string>(
    member.role === "Owner" || member.role === "Admin" ? Object.keys(STUDIO_META) : member.studios ?? [],
  )
  memberGroups.forEach(g => g.studios.forEach(s => studioSet.add(s)))
  const [studios, setStudios] = useState(Array.from(studioSet))
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null)
  const [editingStudio, setEditingStudio] = useState<string | null>(null)
  const [grantOpen, setGrantOpen] = useState(false)
  const [removingStudio, setRemovingStudio] = useState<string | null>(null)
  const [fullReviewOpen, setFullReviewOpen] = useState(false)
  const [reviewStudio, setReviewStudio] = useState(studios[0] ?? "governance")

  const available = Object.entries(STUDIO_META).filter(([id]) => !studios.includes(id))

  function confirmRemove() {
    if (removingStudio) {
      setStudios(p => p.filter(id => id !== removingStudio))
      if (expandedStudio === removingStudio) setExpandedStudio(null)
      setRemovingStudio(null)
    }
  }

  const removingMeta = removingStudio ? STUDIO_META[removingStudio] : null

  const removeModal = (
    <ModalDialog
      isOpen={!!removingStudio}
      onClose={() => setRemovingStudio(null)}
      tone="error"
      iconName="ShieldOff"
      title={`Remove access to ${removingMeta?.label ?? "this studio"}?`}
      description={`${member.name} will immediately lose all permissions in ${removingMeta?.label ?? "this studio"} and won't be able to access any of its features or data.`}
      informativeCard="This action removes all permissions for this studio. If the member needs access again, it must be granted manually."
      ctaPrimary={{ label: "Remove access", destructive: true, onClick: confirmRemove }}
      ctaSecondary={{ label: "Keep access", onClick: () => setRemovingStudio(null) }}
    />
  )

  const grantModal = (
    <ModalDialog
      isOpen={grantOpen}
      onClose={() => setGrantOpen(false)}
      variant="content"
      tone="default"
      iconName="KeyRound"
      title="Grant studio access"
      description={available.length === 0
        ? "There is nothing to grant."
        : "Select a studio to give this member access. You can configure individual permissions after granting."}
      showClose
      slotUnstyled
      slot={
        available.length === 0 ? (
          /* The case Michael asked for by name: there is nothing to grant, and
             the modal has to say why rather than showing an empty box. Bare,
             because ModalDialog is already the surface. */
          <EmptyState
            bare
            icon={Icons.ShieldCheck}
            title="Nothing left to grant"
            description={`${member.name} already has access to all ${Object.keys(STUDIO_META).length} studios in this workspace. To change what they can do inside one, edit its permissions instead.`}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {available.map(([id, meta]) => (
              <CardContainer key={id} size="sm">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <HighlightIcon size="md" variant={STUDIO_HI[id] ?? "neutral"} iconName={STUDIO_ICON_NAME[id] ?? "AppWindow"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{meta.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{meta.desc}</div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => { setStudios(p => [...p, id]); setGrantOpen(false) }}>
                    Grant
                  </Button>
                </div>
              </CardContainer>
            ))}
          </div>
        )
      }
    />
  )

  // Full Permission Review modal — view-only tree across apps
  const reviewNodes = filterGrantedTree(PERM_TREE[reviewStudio] ?? [])
  const fullReviewModal = (
    <ModalDialog
      isOpen={fullReviewOpen}
      onClose={() => setFullReviewOpen(false)}
      variant="content"
      tone="default"
      iconName="ShieldCheck"
      title="Full Permission Review"
      description="All permissions granted to this member — from roles and direct assignments."
      showClose
      slot={
        <div>
          {/* Picking which studio to look at is a selection, not an action —
              that is a Chip. As Buttons these read as four things to do. */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {studios.map(s => {
              const m = STUDIO_META[s]
              if (!m) return null
              return (
                <Chip key={s} size="s" variant={reviewStudio === s ? "primary" : "secondary"} onClick={() => setReviewStudio(s)}>
                  {m.label}
                </Chip>
              )
            })}
          </div>
          {reviewNodes.length === 0 ? (
            <EmptyState
              bare
              icon={Icons.ShieldOff}
              title="No permissions in this app"
              description={`${member.name} can open ${STUDIO_META[reviewStudio]?.label ?? "this studio"} but has not been granted anything inside it yet.`}
            />
          ) : (
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {reviewNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)}
            </div>
          )}
        </div>
      }
    />
  )

  if (studios.length === 0) {
    return (
      <>
        {removeModal}
        {grantModal}

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setGrantOpen(true)}>
            <Icons.Plus size={13} /> Grant access
          </Button>
        </div>
        <EmptyState
          icon={Icons.AppWindow}
          title="No studio access"
          description="Grant access to a studio to configure what this member can do inside it."
          ctaLabel="Grant access"
          onCta={() => setGrantOpen(true)}
        />
      </>
    )
  }

  return (
    <>
      {removeModal}
      {grantModal}
      {fullReviewModal}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Button variant="secondary" size="sm" onClick={() => setFullReviewOpen(true)}>
          <Icons.ShieldCheck size={13} /> Full Permission Review
        </Button>
        {/* The button stays when there is nothing left to grant. Hiding it
            left the user with no way to find out WHY, which is the case the
            modal's empty state exists to answer. */}
        <Button variant="secondary" size="sm" onClick={() => setGrantOpen(true)}>
          <Icons.Plus size={13} /> Grant access
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {studios.map(s => {
          const meta = STUDIO_META[s]
          if (!meta) return null
          const via = memberGroups.filter(g => g.studios.includes(s)).map(g => g.name)
          const isExpanded = expandedStudio === s
          const isEditingThis = editingStudio === s
          return (
            /* The card owns the surface, the border and the selected state.
               `selected` is what says "this one is open" — the row used to
               paint its own blue-tinted border and a 3% background on top of a
               hand-drawn box, which is three ways of saying the same thing and
               none of them the DS's. */
            <CardContainer key={s} size="sm" className="!p-0 overflow-hidden" selected={isExpanded || isEditingThis}>
              <div
                onClick={() => { if (!isEditingThis) setExpandedStudio(isExpanded ? null : s) }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "13px 18px", cursor: isEditingThis ? "default" : "pointer",
                }}
              >
                {/* A tinted square with an icon in it is HighlightIcon — and
                    it is what keeps a studio the same colour here, in the
                    grant modal and in the permissions breakdown. */}
                <HighlightIcon size="md" variant={STUDIO_HI[s] ?? "neutral"} iconName={STUDIO_ICON_NAME[s] ?? "AppWindow"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 3 }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{meta.desc}</div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {/* Active is a state, so it is a Tag. A Chip is something
                      you can select, and nobody selects "Active". */}
                  <Tag variant="success" size="sm">Active</Tag>
                  {via.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {via.slice(0, 2).map(v => (
                        <Tag key={v} variant="neutral" size="sm">via {v}</Tag>
                      ))}
                      {via.length > 2 && <Tag variant="neutral" size="sm">+{via.length - 2} more</Tag>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                  {!isEditingThis && (
                    <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); setEditingStudio(s); setExpandedStudio(s) }}>
                      <Icons.Pencil size={11} /> Edit
                    </Button>
                  )}
                  {isExpanded
                    ? <Icons.ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
                    : <Icons.ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />}
                </div>
              </div>
              {isExpanded && (
                <AppPermissionsInline
                  studioId={s}
                  isEditing={isEditingThis}
                  onSave={changed => {
                    setEditingStudio(null); setExpandedStudio(null)
                    toast.success("Permissions updated", {
                      description: `${changed} permission${changed === 1 ? "" : "s"} changed in ${meta.label} for ${member.name}.`,
                    })
                  }}
                  onCancel={() => { setEditingStudio(null); setExpandedStudio(null) }}
                  onRemove={() => { setEditingStudio(null); setRemovingStudio(s) }}
                />
              )}
            </CardContainer>
          )
        })}

      </div>
    </>
  )
}

// ─── Roles tab ────────────────────────────────────────────────────────────────

function MemberRolesPanel({ member, allRoles, onRemoveFromRole, onNavigateToRole, onAssignRole }: {
  member: Member
  allRoles: Role[]
  onRemoveFromRole: (roleId: string) => void
  onNavigateToRole: (roleId: string) => void
  onAssignRole: (roleId: string) => void
}) {
  const assignedRoles = allRoles.filter(r => r.memberIds.includes(member.id))
  const unassignedRoles = allRoles.filter(r => !r.memberIds.includes(member.id))
  const [pendingRemove, setPendingRemove] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [roleSearch, setRoleSearch] = useState("")

  const filteredUnassigned = roleSearch.trim()
    ? unassignedRoles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()))
    : unassignedRoles

  return (
    <>
      {pendingRemove && (
        <RemoveConfirmModal
          subject={member.name}
          from={pendingRemove.label}
          fromType="role"
          studioLoss={[]}
          willBeEmpty={pendingRemove.memberIds.length === 1}
          onConfirm={() => { onRemoveFromRole(pendingRemove.id); setPendingRemove(null) }}
          onCancel={() => setPendingRemove(null)}
        />
      )}

      {/* Assign Role — a ModalDialog, not a hand-built overlay with its own
          scrim, its own shadow, a raw <input> and rows made of <button>. */}
      <ModalDialog
        isOpen={assignOpen}
        onClose={() => { setAssignOpen(false); setRoleSearch("") }}
        variant="content"
        tone="default"
        iconName="ShieldCheck"
        title="Assign a role"
        description={`A role is a preset of permissions. ${member.name} keeps everything they already have and gains what the role grants.`}
        showClose
        slotUnstyled
        slot={
          <div>
            <div style={{ marginBottom: 10 }}>
              <Input value={roleSearch} onChange={e => setRoleSearch(e.target.value)}
                placeholder="Search roles…" size="sm" leftIcon={<Icons.Search />} />
            </div>
            {filteredUnassigned.length === 0 ? (
              <EmptyState
                bare
                icon={Icons.ShieldCheck}
                title={roleSearch.trim() ? "No roles match" : "Every role is already assigned"}
                description={roleSearch.trim()
                  ? "Try a different search term."
                  : `${member.name} already holds all ${allRoles.length} roles in this workspace.`}
                {...(roleSearch.trim() ? { ctaLabel: "Clear search", onCta: () => setRoleSearch("") } : {})}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 4 * 72, overflowY: "auto", paddingInline: 16, marginInline: -16 }}>
                {filteredUnassigned.map(role => (
                  <CardContainer key={role.id} size="sm"
                    onClick={() => { onAssignRole(role.id); setAssignOpen(false); setRoleSearch("") }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
                      <HighlightIcon size="md" variant={roleHi(role.id)} iconName="ShieldCheck" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{role.label}</div>
                        {role.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{role.desc}</div>}
                      </div>
                      <Tag variant={role.system ? "secondary" : "informative"} size="sm">
                        {role.system ? "System" : "Custom"}
                      </Tag>
                    </div>
                  </CardContainer>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {assignedRoles.length} role{assignedRoles.length !== 1 ? "s" : ""} assigned
        </span>
        <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
          <Icons.Plus size={13} /> Assign Role
        </Button>
      </div>

      {assignedRoles.length === 0 && (
        <EmptyState
          icon={Icons.Shield}
          title="No roles assigned"
          description="Permissions come from this member's user type and direct grants only."
          ctaLabel="Assign a role"
          onCta={() => setAssignOpen(true)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assignedRoles.map(role => {
          const perms = ROLE_PERM_COUNTS[role.id] ?? { total: 0 }
          const blocked = isLastAdminInRole(member.id, role.id, allRoles)
          const isEditingThis = editingRole === role.id
          return (
            <CardContainer key={role.id} size="sm" className="!p-0 overflow-hidden" selected={isEditingThis}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                <HighlightIcon size="md" variant={roleHi(role.id)} iconName="ShieldCheck" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{role.label}</span>
                    <Tag variant={role.system ? "secondary" : "informative"} size="sm">
                      {role.system ? "System" : "Custom"}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{role.desc}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right", marginRight: 4 }}>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                    {perms.total} permission{perms.total !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Assigned by Admin · 14 days ago</div>
                </div>
                {/* An icon-only control needs a Tooltip — `title` is slow,
                    unstyled and invisible to touch. */}
                <Tooltip content={`Open ${role.label}`}>
                  <Button variant="tertiary" size="sm" aria-label={`Open ${role.label}`}
                    onClick={() => onNavigateToRole(role.id)}>
                    <Icons.ExternalLink size={13} />
                  </Button>
                </Tooltip>
                {!isEditingThis && (
                  <Button variant="secondary" size="sm" onClick={() => setEditingRole(role.id)}>
                    <Icons.Pencil size={11} /> Edit
                  </Button>
                )}
              </div>
              {isEditingThis && (
                <div style={{
                  borderTop: "1px solid var(--border)",
                  padding: "12px 18px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Button variant="secondary" size="sm" onClick={() => setEditingRole(null)}>Done</Button>
                  <div style={{ flex: 1 }} />
                  {blocked ? (
                    <Tooltip content="Every role needs at least one admin. Assign somebody else first.">
                      <span style={{ display: "inline-block" }}>
                        <Button variant="warning" size="sm" disabled className="pointer-events-none">
                          <Icons.Trash2 size={11} /> Remove from role
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button variant="warning" size="sm" onClick={() => { setEditingRole(null); setPendingRemove(role) }}>
                      <Icons.Trash2 size={11} /> Remove from role
                    </Button>
                  )}
                </div>
              )}
            </CardContainer>
          )
        })}
      </div>
    </>
  )
}

// ─── Groups tab ───────────────────────────────────────────────────────────────

function MemberGroupsPanel({ member, allGroups, onRemoveFromGroup, onAddToGroup, onNavigateToGroup }: {
  member: Member
  allGroups: Group[]
  onRemoveFromGroup: (groupId: string) => void
  onAddToGroup: (groupId: string) => void
  onNavigateToGroup: (groupId: string) => void
}) {
  const memberGroups = allGroups.filter(g => g.memberIds.includes(member.id))
  const unassignedGroups = allGroups.filter(g => !g.memberIds.includes(member.id))
  const [pendingRemove, setPendingRemove] = useState<Group | null>(null)
  const [undoState, setUndoState] = useState<{ group: Group; timer: ReturnType<typeof setTimeout> } | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [groupSearch, setGroupSearch] = useState("")

  const filteredUnassigned = groupSearch.trim()
    ? unassignedGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
    : unassignedGroups

  function handleRemoveClick(group: Group) {
    const loss = computeStudioLoss(member, allGroups, group.id)
    const willBeEmpty = group.memberIds.length === 1
    if (loss.length === 0 && !willBeEmpty) {
      onRemoveFromGroup(group.id)
      if (undoState) clearTimeout(undoState.timer)
      const timer = setTimeout(() => setUndoState(null), 5000)
      setUndoState({ group, timer })
    } else {
      setPendingRemove(group)
    }
  }

  /**
   * One modal, defined once. It was written out twice — once for the empty
   * state and once for the populated one — which is how the two copies had
   * already started to differ (`backgroundColor` in one, `background` in the
   * other) before either could be fixed.
   */
  const assignGroupModal = (
    <ModalDialog
      isOpen={assignOpen}
      onClose={() => { setAssignOpen(false); setGroupSearch("") }}
      variant="content"
      tone="default"
      iconName="Users"
      title="Add to a group"
      description="A group grants its studio access and permissions to everyone in it."
      showClose
      slotUnstyled
      slot={
        <div>
          <div style={{ marginBottom: 10 }}>
            <Input value={groupSearch} onChange={e => setGroupSearch(e.target.value)}
              placeholder="Search groups…" size="sm" leftIcon={<Icons.Search />} />
          </div>
          {filteredUnassigned.length === 0 ? (
            <EmptyState
              bare
              icon={Icons.Users}
              title={groupSearch.trim() ? "No groups match" : "Already in every group"}
              description={groupSearch.trim()
                ? "Try a different search term."
                : `${member.name} belongs to all ${allGroups.length} groups in this workspace.`}
              {...(groupSearch.trim() ? { ctaLabel: "Clear search", onCta: () => setGroupSearch("") } : {})}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 4 * 72, overflowY: "auto", paddingInline: 16, marginInline: -16 }}>
              {filteredUnassigned.map(g => (
                <CardContainer key={g.id} size="sm"
                  onClick={() => { onAddToGroup(g.id); setAssignOpen(false); setGroupSearch("") }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
                    {/* A group is a set of people, so it gets an avatar — the
                        tinted initials square it used to draw was AvatarCircle
                        with a hex tint bolted on. */}
                    <AvatarCircle name={g.name} initials={g.name.slice(0, 2).toUpperCase()} sizeKey="lg" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {g.studios.map(st => (
                        <Tag key={st} variant={STUDIO_TAG[st] ?? "neutral"} size="sm">{STUDIO_SHORT[st] ?? st}</Tag>
                      ))}
                    </div>
                  </div>
                </CardContainer>
              ))}
            </div>
          )}
        </div>
      }
    />
  )

  function handleUndo() {
    if (!undoState) return
    clearTimeout(undoState.timer)
    onAddToGroup(undoState.group.id)
    setUndoState(null)
  }

  if (memberGroups.length === 0 && !undoState) {
    return (
      <>
      {assignGroupModal}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
            <Icons.Plus size={13} /> Assign Group
          </Button>
        </div>
        <EmptyState
          icon={Icons.Users}
          title="Not in any groups"
          description="Groups define shared studio access, and are how permissions get assigned to several people at once."
          ctaLabel="Add to a group"
          onCta={() => setAssignOpen(true)}
        />
      </>
    )
  }

  return (
    <>
      {pendingRemove && (
        <RemoveConfirmModal
          subject={member.name}
          from={pendingRemove.name}
          fromType="group"
          studioLoss={computeStudioLoss(member, allGroups, pendingRemove.id)}
          willBeEmpty={pendingRemove.memberIds.length === 1}
          onConfirm={() => { onRemoveFromGroup(pendingRemove.id); setPendingRemove(null) }}
          onCancel={() => setPendingRemove(null)}
        />
      )}
      {assignGroupModal}
      {undoState && (
        <UndoToast
          message={`Removed from "${undoState.group.name}"`}
          onUndo={handleUndo}
          onDismiss={() => { clearTimeout(undoState.timer); setUndoState(null) }}
        />
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {memberGroups.length} group{memberGroups.length !== 1 ? "s" : ""} assigned
        </span>
        <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
          <Icons.Plus size={13} /> Add to group
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {memberGroups.map(group => (
          <CardContainer key={group.id} size="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <AvatarCircle name={group.name} initials={group.name.slice(0, 2).toUpperCase()} sizeKey="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 2 }}>{group.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""} · {group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}
                </div>
              </div>
              {/* Studio tags keep the studio's own colour, so the same studio
                  reads the same here as it does in the Apps tab. */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 160 }}>
                {group.studios.slice(0, 2).map(s => (
                  <Tag key={s} variant={STUDIO_TAG[s] ?? "neutral"} size="sm">{STUDIO_SHORT[s] ?? s}</Tag>
                ))}
                {group.studios.length > 2 && (
                  <Tag variant="neutral" size="sm">+{group.studios.length - 2}</Tag>
                )}
              </div>
              <Tooltip content={`Open ${group.name}`}>
                <Button variant="tertiary" size="sm" aria-label={`Open ${group.name}`}
                  onClick={() => onNavigateToGroup(group.id)}>
                  <Icons.ExternalLink size={13} />
                </Button>
              </Tooltip>
              <Tooltip content={`Remove ${member.name} from ${group.name}`}>
                <Button variant="tertiary" size="sm" aria-label={`Remove from ${group.name}`}
                  onClick={() => handleRemoveClick(group)}>
                  <Icons.X size={14} />
                </Button>
              </Tooltip>
            </div>
          </CardContainer>
        ))}
      </div>
    </>
  )
}

// ─── Permissions tab (dual-mode: Audit / Edit) ───────────────────────────────

const GRANTED_STATES: PermState[] = ["g-direct", "g-inh"]

type PermMode = "audit" | "edit"
type PermOverrides = Record<string, PermState>

const SCOPE_ITEMS: { id: string; label: string }[] = [
  { id: "Own",    label: "Own" },
  { id: "Team",   label: "Team" },
  { id: "Tenant", label: "Tenant" },
]

function EditablePermTreeNode({ node, depth, overrides, onToggle, mode, scopeOverrides, onScopeChange }: {
  node: PermNode; depth: number; overrides: PermOverrides; onToggle: (id: string, on: boolean) => void
  mode: PermMode; scopeOverrides: Record<string, string>; onScopeChange: (id: string, scope: string) => void
}) {
  const effective = overrides[node.id] !== undefined ? overrides[node.id] : node.state
  const isDirect        = effective === "g-direct"
  const isInheritedOnly = node.state === "g-inh" && effective !== "g-direct"
  const isPinned        = node.state === "g-inh" && effective === "g-direct"
  const hasOverride     = overrides[node.id] !== undefined && overrides[node.id] !== node.state
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren     = node.children && node.children.length > 0

  const rowBg = isPinned || (hasOverride && !isInheritedOnly)
    ? "color-mix(in srgb, var(--primary) 4%, transparent)"
    : isInheritedOnly ? "color-mix(in srgb, var(--primary) 2%, transparent)" : "transparent"
  const rowBgHover = isPinned || (hasOverride && !isInheritedOnly)
    ? "color-mix(in srgb, var(--primary) 6%, transparent)"
    : isInheritedOnly ? "color-mix(in srgb, var(--primary) 4%, transparent)" : "var(--accent)"

  return (
    <div>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `8px 16px 8px ${16 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          cursor: hasChildren ? "pointer" : "default",
          background: rowBg,
        }}
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = rowBgHover }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg }}
      >
        <div style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasChildren ? (expanded ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" /> : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />) : null}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: depth === 0 ? 600 : 400, color: "var(--foreground)" }}>{node.label}</span>
            {node.role && <Tag variant="informative" size="sm">via {node.role}</Tag>}
            {node.scope && mode !== "edit" && <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {node.scope}</span>}
            {isPinned && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Pinned</span>}
            {hasOverride && !isPinned && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Modified</span>}
          </div>
          {node.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{node.desc}</div>}
          {isInheritedOnly && <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1, fontStyle: "italic" }}>Inherited via role · toggle to confirm direct access</div>}
        </div>

        {/*
          Scope and the on/off switch are the two controls on this row, so they
          sit together on the right with a hairline between them. The scope
          used to be a SwitchTab under the description — a second full-width
          band per permission, which made the row twice as tall and read as a
          sub-section rather than as a setting for the line it belongs to.

          Chips, because scope is a choice among three: selected/unselected is
          exactly what Chip is for. The divider is what stops the last chip
          reading as part of the toggle.
        */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}>
          {mode === "edit" && (
            <>
              <div style={{
                display: "flex", gap: 4,
                // Scope only means something once the permission is ON.
                opacity: isDirect ? 1 : 0.35,
                pointerEvents: isDirect ? "auto" : "none",
              }}>
                {SCOPE_ITEMS.map(sc => {
                  const active = (scopeOverrides[node.id] ?? node.scope ?? "Own") === sc.id
                  return (
                    <Chip key={sc.id} size="s" variant={active ? "primary" : "secondary"}
                      onClick={() => onScopeChange(node.id, sc.id)}
                      aria-label={`${sc.label} scope for ${node.label}`}>
                      {sc.label}
                    </Chip>
                  )
                })}
              </div>
              <div style={{ width: 1, alignSelf: "stretch", background: "var(--color-border-neutral-subtle)" }} />
            </>
          )}
          <Toggle checked={isDirect} disabled={node.locked && node.state !== "g-inh"} size="sm" onChange={on => { onToggle(node.id, on) }} />
        </div>
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <EditablePermTreeNode key={child.id} node={child} depth={depth + 1} overrides={overrides} onToggle={onToggle} mode={mode} scopeOverrides={scopeOverrides} onScopeChange={onScopeChange} />
      ))}
    </div>
  )
}

function filterGrantedTree(nodes: PermNode[]): PermNode[] {
  return nodes.flatMap(n => {
    const grantedChildren = n.children ? filterGrantedTree(n.children) : []
    const isGranted = GRANTED_STATES.includes(n.state)
    if (!isGranted && grantedChildren.length === 0) return []
    return [{ ...n, children: grantedChildren }]
  })
}


// ─── Resources tab ────────────────────────────────────────────────────────────

type ResourceGrantPath = "direct" | "via-role" | "via-group"

type MemberResource = {
  id: string
  name: string
  type: string
  scope: string
  access: string
  source: string
  grantedBy: string
  grantedAt: string
  grantPath: ResourceGrantPath
  groupName?: string
  groupMemberCount?: number
  roleName?: string
  removable?: boolean        // false = system-managed, cannot be manually removed
  criticalAccess?: boolean   // owner-level on critical resource → extra warning
  lastPath?: boolean         // removing this leaves the member with no access to this resource
  dualPath?: boolean         // resource is accessible via another path too — safe to remove this one
}

const MEMBER_RESOURCES: Record<string, MemberResource[]> = {
  tg: [
    // ── Direct grants (normal remove flow) ────────────────────────────────
    { id: "tg-r1",  name: "customer_360",         type: "Dataset",   scope: "Tenant",    access: "Owner",       source: "Direct",              grantedBy: "Thomas Gonzalez", grantedAt: "Jan 14, 2025", grantPath: "direct",    criticalAccess: true,  lastPath: true  },
    { id: "tg-r2",  name: "fraud_signals_v2",     type: "Model",     scope: "Tenant",    access: "Owner",       source: "Direct",              grantedBy: "Thomas Gonzalez", grantedAt: "Mar 2, 2025",  grantPath: "direct",    criticalAccess: true,  lastPath: true  },
    // ── Via group (removing here removes from the group) ──────────────────
    { id: "tg-r3",  name: "governance_audit_log", type: "Dataset",   scope: "Tenant",    access: "Read",        source: "via Leadership",      grantedBy: "Maria García",    grantedAt: "Aug 20, 2026", grantPath: "via-group", groupName: "Leadership",    groupMemberCount: 12, lastPath: true  },
    { id: "tg-r4",  name: "sandbox_env_prod",     type: "Sandbox",   scope: "Own",       access: "Manager",     source: "via Leadership",      grantedBy: "Maria García",    grantedAt: "Aug 20, 2026", grantPath: "via-group", groupName: "Leadership",    groupMemberCount: 12, lastPath: false, dualPath: true },
    // ── Via role ──────────────────────────────────────────────────────────
    { id: "tg-r5",  name: "platform_events",      type: "Event Bus", scope: "Tenant",    access: "Owner",       source: "via Workspace Admin", grantedBy: "System",          grantedAt: "Jan 14, 2025", grantPath: "via-role",  roleName: "Workspace Admin",  lastPath: false, dualPath: true },
    // ── Dual path: direct + group (safe to remove individual grant) ───────
    { id: "tg-r6",  name: "sandbox_env_prod",     type: "Sandbox",   scope: "Own",       access: "Owner",       source: "Direct",              grantedBy: "Thomas Gonzalez", grantedAt: "Feb 1, 2026",  grantPath: "direct",    dualPath: true, lastPath: false },
    // ── System-managed — not removable ────────────────────────────────────
    { id: "tg-r7",  name: "workspace_root",       type: "Dataset",   scope: "Tenant",    access: "Owner",       source: "System",              grantedBy: "System",          grantedAt: "Jan 14, 2025", grantPath: "direct",    removable: false },
    // ── Last resource of its type for this member ─────────────────────────
    { id: "tg-r8",  name: "billing_export",       type: "Dataset",   scope: "Tenant",    access: "Read",        source: "Direct",              grantedBy: "Maria García",    grantedAt: "Jul 5, 2026",  grantPath: "direct",    lastPath: true  },
    // ── Very old grant — might be stale ───────────────────────────────────
    { id: "tg-r9",  name: "legacy_crm_v1",        type: "Dataset",   scope: "Tenant",    access: "Contributor", source: "Direct",              grantedBy: "System",          grantedAt: "Jan 14, 2025", grantPath: "direct",    lastPath: true  },
  ],
  mg: [
    { id: "mg-r1",  name: "employee_directory",   type: "Dataset",   scope: "IT",        access: "Manager",     source: "Direct",              grantedBy: "Maria García",    grantedAt: "Feb 5, 2025",  grantPath: "direct",    lastPath: true  },
    { id: "mg-r2",  name: "access_audit_log",     type: "Dataset",   scope: "IT",        access: "Read",        source: "via IT Admin",        grantedBy: "Thomas Gonzalez", grantedAt: "Apr 1, 2025",  grantPath: "via-group", groupName: "IT Admin",      groupMemberCount: 5,  lastPath: true  },
    { id: "mg-r3",  name: "hr_events_stream",     type: "Event Bus", scope: "IT",        access: "Read",        source: "via IT Admin",        grantedBy: "Thomas Gonzalez", grantedAt: "Apr 1, 2025",  grantPath: "via-group", groupName: "IT Admin",      groupMemberCount: 5,  lastPath: false, dualPath: true },
    { id: "mg-r4",  name: "workspace_root",       type: "Dataset",   scope: "Tenant",    access: "Owner",       source: "System",              grantedBy: "System",          grantedAt: "Feb 5, 2025",  grantPath: "direct",    removable: false },
  ],
  es: [
    { id: "es-r1",  name: "revenue_pipeline",     type: "Model",     scope: "Analytics", access: "Contributor", source: "Direct",              grantedBy: "Maria García",    grantedAt: "Jun 10, 2025", grantPath: "direct",    lastPath: true  },
    { id: "es-r2",  name: "churn_predictions",    type: "Model",     scope: "Analytics", access: "Read",        source: "via Analytics",       grantedBy: "Thomas Gonzalez", grantedAt: "Jun 10, 2025", grantPath: "via-group", groupName: "Analytics",     groupMemberCount: 8,  lastPath: true  },
    { id: "es-r3",  name: "user_events",          type: "Event Bus", scope: "Analytics", access: "Read",        source: "via Analytics",       grantedBy: "Thomas Gonzalez", grantedAt: "Jun 10, 2025", grantPath: "via-group", groupName: "Analytics",     groupMemberCount: 8,  lastPath: false, dualPath: true },
  ],
  sb: [
    { id: "sb-r1",  name: "risk_scoring_v3",      type: "Model",     scope: "Risk",      access: "Read",        source: "Direct",              grantedBy: "Maria García",    grantedAt: "Jul 3, 2025",  grantPath: "direct",    lastPath: true  },
    { id: "sb-r2",  name: "compliance_reports",   type: "Dataset",   scope: "Risk",      access: "Read",        source: "via Compliance",      grantedBy: "Thomas Gonzalez", grantedAt: "Jul 3, 2025",  grantPath: "via-group", groupName: "Compliance",    groupMemberCount: 4,  lastPath: true  },
  ],
  dp: [
    { id: "dp-r1",  name: "ops_metrics",          type: "Dataset",   scope: "Ops",       access: "Contributor", source: "Direct",              grantedBy: "Maria García",    grantedAt: "May 20, 2025", grantPath: "direct",    lastPath: true  },
    { id: "dp-r2",  name: "ops_events",           type: "Event Bus", scope: "Ops",       access: "Read",        source: "via Operations",      grantedBy: "Thomas Gonzalez", grantedAt: "May 20, 2025", grantPath: "via-group", groupName: "Operations",    groupMemberCount: 6,  lastPath: true  },
  ],
}

/** A resource type is a category, not a status — Tag carries the tone, and
 *  HighlightIcon carries the same identity as a tile. These replace
 *  RESOURCE_TYPE_COLOR, whose raw token strings were being colour-mixed into
 *  borders and backgrounds by hand at three call sites. */
const RESOURCE_TYPE_HI: Record<string, "informative" | "purple" | "light-blue" | "neutral"> = {
  Dataset:     "informative",
  Model:       "purple",
  "Event Bus": "light-blue",
  Sandbox:     "neutral",
}
const RESOURCE_ICON_NAME: Record<string, string> = {
  Dataset:     "Database",
  Model:       "Cpu",
  "Event Bus": "Zap",
  Sandbox:     "Box",
}
/** A resource type is a category, not a status — Tag carries the tone. */
const RESOURCE_TYPE_TAG: Record<string, "informative" | "purple" | "lightBlue" | "neutral"> = {
  Dataset:     "informative",
  Model:       "purple",
  "Event Bus": "lightBlue",
  Sandbox:     "neutral",
}

const RESOURCE_TYPE_ICON: Record<string, React.ReactNode> = {
  Dataset:    <Icons.Database size={13} />,
  Model:      <Icons.Cpu size={13} />,
  "Event Bus":<Icons.Zap size={13} />,
  Sandbox:    <Icons.Box size={13} />,
}

// ─── Remove Access Modal ──────────────────────────────────────────────────────

function RemoveAccessModal({
  resource, memberName, onConfirm, onCancel,
}: {
  resource: MemberResource
  memberName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const isViaGroup = resource.grantPath === "via-group"
  const isViaRole  = resource.grantPath === "via-role"
  const isSystem   = resource.removable === false

  // Warnings in priority order
  const warnings: Array<{ iconName: string; variant: "neutral" | "error" | "alert" | "success"; text: React.ReactNode }> = []

  if (isSystem) {
    warnings.push({
      iconName: "Lock", variant: "neutral",
      text: "This access is managed by the system and cannot be removed manually.",
    })
  } else if (resource.criticalAccess) {
    warnings.push({
      iconName: "AlertTriangle", variant: "error",
      text: <>Removing <strong>Owner</strong> access to <strong>{resource.name}</strong> may break {memberName}'s ability to manage or share this resource.</>,
    })
  }

  if (isViaGroup && !isSystem) {
    warnings.push({
      iconName: "Users", variant: "alert",
      text: <>This access comes from the <strong>{resource.groupName}</strong> group ({resource.groupMemberCount} members). Removing it here removes access for the <strong>entire group</strong>, not just this member.</>,
    })
  }

  if (isViaRole && !isSystem) {
    warnings.push({
      iconName: "Shield", variant: "alert",
      text: <>This access is inherited from the <strong>{resource.roleName}</strong> role. Removing it will revoke all permissions granted by that role on this resource.</>,
    })
  }

  if (resource.lastPath && !isSystem) {
    warnings.push({
      iconName: "AlertCircle", variant: "error",
      text: <>{memberName} has <strong>no other access path</strong> to this resource. After removal, they will lose access completely.</>,
    })
  }

  if (resource.dualPath && !isSystem) {
    warnings.push({
      iconName: "CheckCircle", variant: "success",
      text: <>Safe to remove — {memberName} will still be able to access <strong>{resource.name}</strong> via another path.</>,
    })
  }

  return (
    <ModalDialog
      isOpen
      onClose={onCancel}
      variant="content"
      tone={isSystem ? "default" : "error"}
      iconName={isSystem ? "Lock" : "Trash2"}
      title={isSystem ? "Access is system-managed" : "Remove resource access?"}
      description={isSystem
        ? "This grant is maintained by the platform and cannot be changed from here."
        : `${memberName} will lose the access shown below.`}
      showClose
      slotUnstyled
      ctaPrimary={isSystem ? undefined : {
        label: isViaGroup ? `Remove from ${resource.groupName}` : "Remove access",
        destructive: true,
        onClick: onConfirm,
      }}
      ctaSecondary={{ label: isSystem ? "Close" : "Cancel", onClick: onCancel }}
      slot={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* The resource, as a card — it used to be a bare row with a
              hand-mixed border in the type's hex. */}
          <CardContainer size="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <HighlightIcon size="md" variant={RESOURCE_TYPE_HI[resource.type] ?? "neutral"}
                iconName={RESOURCE_ICON_NAME[resource.type] ?? "Layers"} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {resource.name}
              </span>
              <Tag variant={RESOURCE_TYPE_TAG[resource.type] ?? "neutral"} size="sm">{resource.type}</Tag>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px" }}>
              {[
                { label: "Access",  value: resource.access    },
                { label: "Source",  value: resource.source    },
                { label: "Granted", value: resource.grantedAt },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-title)" }}>{value}</div>
                </div>
              ))}
            </div>
          </CardContainer>

          {/* One card per consequence. The icon's tint is the severity —
              these were loose rows whose icon colour was the only signal. */}
          {warnings.map((w, i) => (
            <CardContainer key={i} size="sm">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <HighlightIcon size="sm" variant={w.variant} iconName={w.iconName} />
                <span style={{ fontSize: 12, color: "var(--color-text-title)", lineHeight: 1.55 }}>{w.text}</span>
              </div>
            </CardContainer>
          ))}
        </div>
      }
    />
  )
}

/**
 * The Resources table's columns. A function because the trash column needs
 * the panel's own `setPendingRemove`; everything else is static.
 */
const RESOURCE_COLUMNS = (onRemove: (r: MemberResource) => void): TableColumn<MemberResource>[] => [
  {
    key: "name", header: "Resource", width: "minmax(200px, 1fr)",
    render: r => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <HighlightIcon size="sm" variant={RESOURCE_TYPE_HI[r.type] ?? "neutral"}
          iconName={RESOURCE_ICON_NAME[r.type] ?? "Layers"} />
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.name}
        </span>
        {r.removable === false && (
          <Tooltip content="System-managed — this grant cannot be removed by hand">
            <span style={{ display: "flex", color: "var(--muted-foreground)" }}><Icons.Lock size={11} /></span>
          </Tooltip>
        )}
        {r.dualPath && (
          <Tooltip content="Also reachable by another path, so removing this one does not cut off access">
            <span style={{ display: "flex", color: "var(--badge-success)" }}><Icons.GitMerge size={11} /></span>
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    key: "type", header: "Type", width: "110px",
    // A resource type is a category — that is a Tag, in the type's own colour.
    render: r => <Tag variant={RESOURCE_TYPE_TAG[r.type] ?? "neutral"} size="sm">{r.type}</Tag>,
  },
  {
    key: "access", header: "Access", width: "110px",
    render: r => <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{r.access}</span>,
  },
  {
    key: "grantedBy", header: "Granted by", width: "minmax(140px, 0.8fr)",
    render: r => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <AvatarCircle name={r.grantedBy} sizeKey="md" colorKey={nameToAvatarColor(r.grantedBy)} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.grantedBy}</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.source}</div>
        </div>
      </div>
    ),
  },
  {
    key: "grantedAt", header: "When", width: "110px", align: "right",
    render: r => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.grantedAt}</span>,
  },
  {
    key: "remove", header: "", width: "48px", align: "center",
    render: r => r.removable === false ? (
      <Tooltip content="System-managed — cannot be removed">
        <span style={{ display: "inline-block" }}>
          <Button variant="tertiary" size="sm" disabled className="pointer-events-none" aria-label="System-managed">
            <Icons.Lock size={12} />
          </Button>
        </span>
      </Tooltip>
    ) : (
      <Tooltip content={`Remove access to ${r.name}`}>
        <Button variant="tertiary" size="sm" aria-label={`Remove access to ${r.name}`}
          onClick={e => { e.stopPropagation(); onRemove(r) }}>
          <Icons.Trash2 size={13} />
        </Button>
      </Tooltip>
    ),
  },
]

function ResourcesPanel({ member }: { member: Member }) {
  const initialResources = MEMBER_RESOURCES[member.id] ?? []
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [pendingRemove, setPendingRemove] = useState<MemberResource | null>(null)
  const toast = useToast()
  const [activeType, setActiveType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  const allResources = initialResources.filter(r => !removedIds.has(r.id))
  const uniqueTypes = Array.from(new Set(initialResources.map(r => r.type)))

  // Filters positions this menu itself — see the note on the members list.
  const TYPE_OPTIONS = [
    { id: "all", label: `All types · ${allResources.length}` },
    ...uniqueTypes.map(t => ({ id: t, label: `${t} · ${allResources.filter(r => r.type === t).length}` })),
  ]
  const typeSlot = {
    placeholder: "Type",
    value: activeType === "all" ? undefined : TYPE_OPTIONS.find(o => o.id === activeType)?.label,
    options: TYPE_OPTIONS.map(o => o.label),
    onSelect: (label: string) => { setActiveType(TYPE_OPTIONS.find(o => o.label === label)?.id ?? "all"); setPage(1) },
    onRemove: () => { setActiveType("all"); setPage(1) },
  }

  const typeFiltered = activeType === "all" ? allResources : allResources.filter(r => r.type === activeType)
  const resources = searchQuery.trim()
    ? typeFiltered.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : typeFiltered
  const totalPages = Math.max(1, Math.ceil(resources.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageResources = resources.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleRemoveConfirm() {
    if (!pendingRemove) return
    setRemovedIds(prev => new Set(prev).add(pendingRemove.id))
    // The screen used to draw its own fixed-position toast, shadow and all.
    toast.success("Resource access removed", {
      description: `${member.name} no longer has ${pendingRemove.access} access to ${pendingRemove.name}.`,
    })
    setPendingRemove(null)
  }

  if (allResources.length === 0 && removedIds.size === 0) {
    return (
      <EmptyState
        icon={Icons.Package}
        title="No resources assigned"
        description="Resources are the datasets, models, event buses and sandboxes this member can reach. Access comes from a role, a group, or a direct grant."
      />
    )
  }

  return (
    <div>
      {/* Remove modal */}
      {pendingRemove && (
        <RemoveAccessModal
          resource={pendingRemove}
          memberName={member.name}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setPendingRemove(null)}
        />
      )}

      {/* Empty state after removing all */}
      {allResources.length === 0 && removedIds.size > 0 && (
        <EmptyState
          icon={Icons.ShieldOff}
          title="No resources remaining"
          description="Every resource grant has been removed for this member."
        />
      )}

      {allResources.length > 0 && (
        <>
          {/* Filters row */}
          <div style={{ marginBottom: 16 }}>
            <Filters
              showSearch
              searchPlaceholder="Search resources…"
              searchValue={searchQuery}
              onSearchChange={v => { setSearchQuery(v); setPage(1) }}
              slots={[typeSlot]}
              showAllFilters={false}
              showSort={false}
              showViewToggle={false}
            />
          </div>

          {/* The DS Table, not a CSS grid pretending to be one. It owns the
              header row, the row hover, the dividers and the empty state —
              all four of which were hand-drawn here, which is how this table
              ended up with a hover the DS forbids and a header that could
              drift from its rows. */}
          <CardContainer className={`!p-0 overflow-hidden ${TABLE_CARD}`}>
            <Table
              size="sm"
              columns={RESOURCE_COLUMNS(setPendingRemove)}
              data={pageResources}
              rowKey={r => r.id}
              emptyIcon={Icons.Layers}
              emptyTitle={searchQuery.trim() ? `No resources match "${searchQuery}"` : "No resources"}
              emptyDescription={searchQuery.trim()
                ? "Try a different search term, or clear the type filter."
                : "This member has not been granted access to any resource."}
              {...(searchQuery.trim() ? { emptyCtaLabel: "Clear search", onEmptyCta: () => { setSearchQuery(""); setPage(1) } } : {})}
            />
          </CardContainer>

          {/* Pagination is a component too — the previous one was eleven
              hand-styled <button>s, one of which painted #fff on the active
              page. */}
          {resources.length > PAGE_SIZE && (
            <div style={{ marginTop: 12 }}>
              <Pagination
                currentPage={safePage}
                totalItems={resources.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ color: "var(--muted-foreground)", marginTop: 1, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--foreground)" }}>{value}</div>
      </div>
    </div>
  )
}


// ─── Role detail page ─────────────────────────────────────────────────────────

function RoleDetailPage({ role, onBack, onDelete, onMemberClick, allRoles, onRemoveMember }: {
  role: Role; onBack: () => void
  onDelete?: () => void
  onMemberClick?: (m: Member) => void
  allRoles: Role[]
  onRemoveMember?: (memberId: string) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [draftName, setDraftName] = useState(role.label)
  const [draftDesc, setDraftDesc] = useState(role.desc)
  const [savedName, setSavedName] = useState(role.label)
  const [savedDesc, setSavedDesc] = useState(role.desc)
  const [localMemberIds, setLocalMemberIds] = useState(role.memberIds)
  const [pendingRemoveMember, setPendingRemoveMember] = useState<Member | null>(null)
  const members = localMemberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]

  function handleRemoveMemberConfirm() {
    if (!pendingRemoveMember) return
    setLocalMemberIds(ids => ids.filter(id => id !== pendingRemoveMember.id))
    onRemoveMember?.(pendingRemoveMember.id)
    setPendingRemoveMember(null)
  }
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
    >
      <BackBreadcrumb onBack={onBack} />

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10002,
          background: "rgba(0,0,0,0.45)", // audit-ignore: scrim overlay
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "28px 32px", width: 400, maxWidth: "90vw",
            boxShadow: "var(--shadow-elevation-3, 0 16px 48px rgba(0,0,0,.22))", // audit-ignore: rgba fallback
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              Delete "{role.label}"?
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.6 }}>
              This role will be removed permanently. Members who had this role will lose any permissions it granted. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="warning" size="sm" onClick={() => { setConfirmDelete(false); onDelete?.() }}>Delete role</Button>
            </div>
          </div>
        </div>
      )}

      {pendingRemoveMember && (
        <RemoveConfirmModal
          subject={pendingRemoveMember.name}
          from={role.label}
          fromType="role"
          studioLoss={[]}
          willBeEmpty={localMemberIds.length === 1}
          onConfirm={handleRemoveMemberConfirm}
          onCancel={() => setPendingRemoveMember(null)}
        />
      )}

      {/* Role identity card — DS composition: CardContainer + Tag + Button */}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div style={{ borderLeft: `4px solid ${role.color}`, borderRadius: 12, overflow: "hidden" }}>
        <CardContainer size="default" variant="default">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {editingName && !role.system ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { setSavedName(draftName); setEditingName(false) }
                      if (e.key === "Escape") { setDraftName(savedName); setEditingName(false) }
                    }}
                    style={{
                      fontSize: 16, fontWeight: 700, color: "var(--foreground)",
                      background: "var(--surface-raised)", border: "1px solid var(--primary)",
                      borderRadius: 6, padding: "2px 8px", outline: "none", flex: 1, maxWidth: 280,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{savedName}</span>
                )}
                {/* System / Custom badge — read-only identity tag */}
                <Tag variant={role.system ? "secondary" : "informative"} size="sm">
                  {role.system ? "System" : "Custom"}
                </Tag>
                {!role.system && !editingName && (
                  <Button
                    variant="tertiary" size="sm" iconPosition="alone"
                    icon={<Icons.Pencil size={13} />}
                    aria-label="Edit name"
                    onClick={() => { setDraftName(savedName); setEditingName(true) }}
                  />
                )}
                {editingName && !role.system && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button variant="secondary" size="sm"
                      onClick={() => { setSavedName(draftName); setEditingName(false) }}>
                      Save
                    </Button>
                    <Button variant="tertiary" size="sm"
                      onClick={() => { setDraftName(savedName); setEditingName(false) }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Description row */}
              {editingDesc && !role.system ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <textarea
                    autoFocus
                    value={draftDesc}
                    onChange={e => setDraftDesc(e.target.value)}
                    rows={2}
                    style={{
                      fontSize: 13, color: "var(--foreground)", lineHeight: 1.5,
                      background: "var(--surface-raised)", border: "1px solid var(--primary)",
                      borderRadius: 6, padding: "4px 8px", outline: "none", resize: "vertical",
                      width: "100%", fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button variant="secondary" size="sm"
                      onClick={() => { setSavedDesc(draftDesc); setEditingDesc(false) }}>
                      Save
                    </Button>
                    <Button variant="tertiary" size="sm"
                      onClick={() => { setDraftDesc(savedDesc); setEditingDesc(false) }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>{savedDesc}</p>
                  {!role.system && (
                    <Button
                      variant="tertiary" size="sm" iconPosition="alone"
                      icon={<Icons.Pencil size={12} />}
                      aria-label="Edit description"
                      onClick={() => { setDraftDesc(savedDesc); setEditingDesc(true) }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Stats + delete */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{members.length}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>members</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{perms.total}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>permissions</div>
              </div>
              {!role.system && (
                <Button
                  variant="tertiary" size="sm" iconPosition="alone"
                  icon={<Icons.Trash2 size={14} />}
                  aria-label="Delete role"
                  onClick={() => setConfirmDelete(true)}
                />
              )}
            </div>
          </div>
        </CardContainer>
        </div>
      </div>

      <DetailTabs tabs={["Members", "Permissions", "Activity"]} active={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 20 }}>
        {/* Members */}
        {activeTab === 0 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "12px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <b style={{ color: "var(--foreground)" }}>{members.length}</b> member{members.length !== 1 ? "s" : ""}
              </span>
              {!role.system && (
                <Button variant="tertiary" size="sm">+ Assign members</Button>
              )}
            </div>
            {members.length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.Users size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No members assigned</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Assign members to grant them this role's permissions</div>
              </div>
            ) : members.map(m => {
              return (
                <div
                  key={m.id}
                  onClick={() => onMemberClick?.(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "10px 20px",
                    borderBottom: "1px solid var(--border)",
                    cursor: onMemberClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <AvatarCircle
                    name={m.name}
                    sizeKey="lg"
                    avatarStyle={m.status === "active" ? "text" : "empty"}
                  />

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                  </div>

                  {/* Department */}
                  <div style={{ minWidth: 120, fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {m.department}
                  </div>

                  {/* User type badge */}
                  <div style={{ minWidth: 72, textAlign: "center", flexShrink: 0 }}>
                    <Tag size="sm">{m.role}</Tag>
                  </div>

                  {/* Last active */}
                  <div style={{ minWidth: 88, textAlign: "right", flexShrink: 0 }}>
                    {m.status === "invited" ? (
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Invite sent</div>
                    ) : m.lastActive ? (
                      <>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 1 }}>Last active</div>
                        <div style={{ fontSize: 11, color: "var(--foreground)" }}>{formatRelative(m.lastActive)}</div>
                      </>
                    ) : null}
                  </div>

                  {/* MFA badge */}
                  <div title={m.mfaEnabled ? `MFA enabled (${m.mfaMethod ?? ""})` : "MFA not enabled"} style={{ display: "flex", flexShrink: 0 }}>
                    <Tag variant={m.mfaEnabled ? "success" : "alert"} size="sm">
                      {m.mfaEnabled ? <Icons.ShieldCheck size={10} /> : <Icons.ShieldAlert size={10} />}
                      MFA
                    </Tag>
                  </div>

                  {/* Status */}
                  <div style={{ minWidth: 76, textAlign: "center", flexShrink: 0 }}>
                    <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                  </div>

                  {/* Unassign button */}
                  {!role.system ? (
                    isLastAdminInRole(m.id, role.id, allRoles) ? (
                      <div
                        title="At least one Admin is required. Transfer admin access before removing."
                        style={{ border: "none", background: "none", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, display: "flex", alignItems: "center", opacity: 0.35, cursor: "not-allowed" }}
                      >
                        <Icons.X size={14} />
                      </div>
                    ) : (
                      <button
                        title="Remove from role"
                        onClick={e => { e.stopPropagation(); setPendingRemoveMember(m) }}
                        style={{ cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
                      >
                        <Icons.X size={14} />
                      </button>
                    )
                  ) : (
                    <div style={{ width: 26, flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Permissions */}
        {activeTab === 1 && <RolePermissionsPanel role={role} />}

        {/* Activity */}
        {activeTab === 2 && <ActivityPanel />}
      </div>
    </ScreenLayout>
  )
}

// ─── Group detail page ────────────────────────────────────────────────────────

function GroupDetailPage({ group: initialGroup, onBack, onMemberClick, allGroups, onRemoveMember }: {
  group: Group; onBack: () => void
  onMemberClick?: (m: Member) => void
  allGroups: Group[]
  onRemoveMember?: (memberId: string) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [group, setGroup] = useState(initialGroup)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(initialGroup.name)
  const [savedName, setSavedName] = useState(initialGroup.name)
  const [editingDesc, setEditingDesc] = useState(false)
  const [draftDesc, setDraftDesc] = useState(initialGroup.desc)
  const [savedDesc, setSavedDesc] = useState(initialGroup.desc)
  const [pendingRemoveMember, setPendingRemoveMember] = useState<Member | null>(null)
  const [undoMember, setUndoMember] = useState<{ member: Member; timer: ReturnType<typeof setTimeout> } | null>(null)
  const groupMembers = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]

  function handleRemoveMemberClick(m: Member) {
    const memberAsSeenByGroups = allGroups.map(g =>
      g.id === group.id ? group : g
    )
    const loss = computeStudioLoss(m, memberAsSeenByGroups, group.id)
    const willBeEmpty = group.memberIds.length === 1
    if (loss.length === 0 && !willBeEmpty) {
      setGroup(g => ({ ...g, memberIds: g.memberIds.filter(x => x !== m.id) }))
      onRemoveMember?.(m.id)
      if (undoMember) clearTimeout(undoMember.timer)
      const timer = setTimeout(() => setUndoMember(null), 5000)
      setUndoMember({ member: m, timer })
    } else {
      setPendingRemoveMember(m)
    }
  }

  function confirmRemoveMember() {
    if (!pendingRemoveMember) return
    setGroup(g => ({ ...g, memberIds: g.memberIds.filter(x => x !== pendingRemoveMember.id) }))
    onRemoveMember?.(pendingRemoveMember.id)
    setPendingRemoveMember(null)
  }

  function handleUndoRemove() {
    if (!undoMember) return
    clearTimeout(undoMember.timer)
    setGroup(g => ({ ...g, memberIds: [...g.memberIds, undoMember.member.id] }))
    setUndoMember(null)
  }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
    >
      <BackBreadcrumb onBack={onBack} />

      {/* Group identity card — DS composition: CardContainer + Tag + Button */}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div style={{ borderLeft: `4px solid ${group.color}`, borderRadius: 12, overflow: "hidden" }}>
        <CardContainer size="default" variant="default">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Editable name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {editingName ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { setSavedName(draftName); setGroup(g => ({ ...g, name: draftName })); setEditingName(false) }
                      if (e.key === "Escape") { setDraftName(savedName); setEditingName(false) }
                    }}
                    style={{
                      fontSize: 16, fontWeight: 700, color: "var(--foreground)",
                      background: "var(--surface-raised)", border: "1px solid var(--primary)",
                      borderRadius: 6, padding: "2px 8px", outline: "none", flex: 1, maxWidth: 280,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{savedName}</span>
                )}
                {!editingName && (
                  <Button
                    variant="tertiary" size="sm" iconPosition="alone"
                    icon={<Icons.Pencil size={13} />}
                    aria-label="Edit name"
                    onClick={() => { setDraftName(savedName); setEditingName(true) }}
                  />
                )}
                {editingName && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button variant="secondary" size="sm"
                      onClick={() => { setSavedName(draftName); setGroup(g => ({ ...g, name: draftName })); setEditingName(false) }}>
                      Save
                    </Button>
                    <Button variant="tertiary" size="sm"
                      onClick={() => { setDraftName(savedName); setEditingName(false) }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Editable description */}
              <div style={{ marginBottom: 12 }}>
                {editingDesc ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <textarea
                      autoFocus
                      value={draftDesc}
                      onChange={e => setDraftDesc(e.target.value)}
                      rows={2}
                      style={{
                        fontSize: 13, color: "var(--foreground)", lineHeight: 1.5,
                        background: "var(--surface-raised)", border: "1px solid var(--primary)",
                        borderRadius: 6, padding: "4px 8px", outline: "none", resize: "vertical",
                        width: "100%", fontFamily: "inherit",
                      }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button variant="secondary" size="sm"
                        onClick={() => { setSavedDesc(draftDesc); setEditingDesc(false) }}>
                        Save
                      </Button>
                      <Button variant="tertiary" size="sm"
                        onClick={() => { setDraftDesc(savedDesc); setEditingDesc(false) }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
                      {savedDesc || <span style={{ opacity: 0.5, fontStyle: "italic" }}>No description</span>}
                    </p>
                    <Button
                      variant="tertiary" size="sm" iconPosition="alone"
                      icon={<Icons.Pencil size={12} />}
                      aria-label="Edit description"
                      onClick={() => { setDraftDesc(savedDesc); setEditingDesc(true) }}
                    />
                  </div>
                )}
              </div>

              {/* Studio chips — Tag (read-only identity attribute, not Chip interactivo) */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {group.studios.length === 0 ? (
                  <Tag variant="secondary" size="sm">No studios</Tag>
                ) : group.studios.map(s => (
                  <Tag key={s} variant="secondary" size="sm">{STUDIO_META[s].label}</Tag>
                ))}
              </div>
            </div>

            {/* Stats + delete action */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{groupMembers.length}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>members</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{group.studios.length}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>studios</div>
              </div>
              <Button
                variant="tertiary" size="sm" iconPosition="alone"
                icon={<Icons.Trash2 size={14} />}
                aria-label="Delete group"
                onClick={() => setConfirmDelete(true)}
              />
            </div>
          </div>
        </CardContainer>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10002,
          background: "rgba(0,0,0,0.45)", // audit-ignore: scrim overlay
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "28px 32px", width: 400, maxWidth: "90vw",
            boxShadow: "var(--shadow-elevation-3, 0 16px 48px rgba(0,0,0,.22))", // audit-ignore: rgba fallback
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              Delete "{savedName}"?
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.6 }}>
              This group will be removed permanently. Members are not removed from the workspace.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="warning" size="sm" onClick={onBack}>Delete group</Button>
            </div>
          </div>
        </div>
      )}

      {pendingRemoveMember && (
        <RemoveConfirmModal
          subject={pendingRemoveMember.name}
          from={savedName}
          fromType="group"
          studioLoss={computeStudioLoss(
            pendingRemoveMember,
            allGroups.map(g => g.id === group.id ? group : g),
            group.id
          )}
          willBeEmpty={group.memberIds.length === 1}
          onConfirm={confirmRemoveMember}
          onCancel={() => setPendingRemoveMember(null)}
        />
      )}

      {undoMember && (
        <UndoToast
          message={`Removed ${undoMember.member.name} from group`}
          onUndo={handleUndoRemove}
          onDismiss={() => { clearTimeout(undoMember.timer); setUndoMember(null) }}
        />
      )}

      <DetailTabs tabs={["Members", "Resources"]} active={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 20 }}>
        {/* Members */}
        {activeTab === 0 && (
          <CardContainer className="!p-0 overflow-hidden">
            <div style={{
              padding: "12px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <b style={{ color: "var(--foreground)" }}>{groupMembers.length}</b> member{groupMembers.length !== 1 ? "s" : ""}
              </span>
              <Button variant="tertiary" size="sm">+ Add member</Button>
            </div>
            {groupMembers.length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.Users size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No members yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Add members to this group to grant them shared access</div>
              </div>
            ) : groupMembers.map(m => {
              return (
                <div
                  key={m.id}
                  onClick={() => onMemberClick?.(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "10px 20px",
                    borderBottom: "1px solid var(--border)",
                    cursor: onMemberClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <AvatarCircle
                    name={m.name}
                    sizeKey="lg"
                    avatarStyle={m.status === "active" ? "text" : "empty"}
                  />

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                  </div>

                  {/* Department */}
                  <div style={{ minWidth: 120, fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {m.department}
                  </div>

                  {/* User type badge */}
                  <div style={{ minWidth: 72, textAlign: "center", flexShrink: 0 }}>
                    <Tag size="sm">{m.role}</Tag>
                  </div>

                  {/* Last active */}
                  <div style={{ minWidth: 88, textAlign: "right", flexShrink: 0 }}>
                    {m.status === "invited" ? (
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Invite sent</div>
                    ) : m.lastActive ? (
                      <>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 1 }}>Last active</div>
                        <div style={{ fontSize: 11, color: "var(--foreground)" }}>{formatRelative(m.lastActive)}</div>
                      </>
                    ) : null}
                  </div>

                  {/* MFA badge */}
                  <div title={m.mfaEnabled ? `MFA enabled (${m.mfaMethod ?? ""})` : "MFA not enabled"} style={{ display: "flex", flexShrink: 0 }}>
                    <Tag variant={m.mfaEnabled ? "success" : "alert"} size="sm">
                      {m.mfaEnabled ? <Icons.ShieldCheck size={10} /> : <Icons.ShieldAlert size={10} />}
                      MFA
                    </Tag>
                  </div>

                  {/* Status */}
                  <div style={{ minWidth: 76, textAlign: "center", flexShrink: 0 }}>
                    <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={e => { e.stopPropagation(); handleRemoveMemberClick(m) }}
                    title="Remove from group"
                    style={{ cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
                  >
                    <Icons.X size={14} />
                  </button>
                </div>
              )
            })}
          </CardContainer>
        )}

        {/* Resources */}
        {activeTab === 1 && <GroupResourcesPanel groupId={group.id} />}
      </div>
    </ScreenLayout>
  )
}

function GroupResourcesPanel({ groupId }: { groupId: string }) {
  void groupId
  return (
    <div style={{
      padding: "56px 20px", textAlign: "center",
      color: "var(--muted-foreground)",
      border: "1px solid var(--border)", borderRadius: 12,
    }}>
      <Icons.FolderOpen size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>No resources yet</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        Resources shared with this group will appear here.
      </div>
    </div>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

/**
 * The members table's column tracks, in one place so the header and the rows
 * cannot drift apart.
 */
const MEMBER_COLUMNS = [
  { key: "member",     label: "Member",      flex: 3,   min: 200, align: "left"   as const },
  { key: "department", label: "Department",  flex: 2,   min: 110, align: "left"   as const },
  { key: "userType",   label: "User Type",   flex: 1,   min: 90,  align: "center" as const },
  { key: "lastActive", label: "Last active", flex: 1.4, min: 110, align: "right"  as const },
  { key: "mfa",        label: "MFA",         flex: 1,   min: 70,  align: "center" as const },
  { key: "status",     label: "Status",      flex: 1,   min: 90,  align: "center" as const },
]
const COL = Object.fromEntries(MEMBER_COLUMNS.map(c => [c.key, c])) as Record<string, typeof MEMBER_COLUMNS[number]>

type MemberAction = "reset-password" | "reset-mfa" | "suspend" | "unsuspend" | "deactivate" | "update" | "send-invite" | "resend-invite"

function MemberRow({
  member, onSelect, onAction,
}: {
  member: Member
  onSelect: (m: Member) => void
  onAction?: (m: Member, action: MemberAction) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null)
  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    const btn = (e.currentTarget as HTMLElement)
    const rect = btn.getBoundingClientRect()
    setMenuAnchor({ top: rect.bottom + 4, left: rect.right })
    setMenuOpen(true)
  }

  return (
    <>
      <div
        onClick={() => onSelect(member)}
        style={{
          padding: "10px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 14,
          background: hovered ? "var(--accent)" : "transparent",
          cursor: "pointer", transition: "background 0.1s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar */}
        <div style={{ opacity: member.status === "suspended" ? 0.5 : 1 }}>
          <AvatarCircle name={member.name} sizeKey="lg" avatarStyle={member.status === "active" ? "text" : "empty"} />
        </div>

        {/* Same tracks as the header — see MEMBER_COLUMNS. */}
        <div style={{ flex: COL.member.flex, minWidth: COL.member.min }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", opacity: member.status === "suspended" ? 0.5 : 1, marginBottom: 1 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {member.email}
          </div>
        </div>

        {/* Department */}
        <div style={{ flex: COL.department.flex, minWidth: COL.department.min, fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member.department ?? "—"}
        </div>

        {/* User type badge */}
        <div style={{ flex: COL.userType.flex, minWidth: COL.userType.min, display: "flex", justifyContent: "center" }}>
          <Tag variant={USER_TYPE_TAG[member.role]} size="sm">{member.role}</Tag>
        </div>

        {/* Last active / invite status */}
        <div style={{ flex: COL.lastActive.flex, minWidth: COL.lastActive.min, textAlign: "right" }}>
          {member.status === "pending" ? (
            <>
              <div style={{ fontSize: 11, color: "var(--badge-alert)", fontWeight: 600, marginBottom: 1 }}>Invite not sent</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Added {formatRelative(member.joinedAt)}</div>
            </>
          ) : member.status === "invited" ? (
            <>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 1 }}>Invite sent</div>
              <div style={{ fontSize: 11, color: "var(--foreground)" }}>{formatRelative(member.joinedAt)}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 1 }}>
                {member.status === "suspended" ? "Suspended" : "Last active"}
              </div>
              {member.lastActive ? (
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{formatRelative(member.lastActive)}</div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>—</div>
              )}
            </>
          )}
        </div>

        {/* MFA */}
        <div title={member.mfaEnabled ? `MFA enabled (${member.mfaMethod ?? ""})` : "MFA not enabled"}
          style={{ flex: COL.mfa.flex, minWidth: COL.mfa.min, display: "flex", justifyContent: "center" }}>
          <Tag variant={member.mfaEnabled ? "success" : "alert"} size="sm">
            {member.mfaEnabled ? <Icons.ShieldCheck size={10} /> : <Icons.ShieldAlert size={10} />}
            MFA
          </Tag>
        </div>

        {/* Status */}
        <div style={{ flex: COL.status.flex, minWidth: COL.status.min, display: "flex", justifyContent: "center" }}>
          <Tag variant={STATUS_TAG[member.status]} size="sm">{STATUS_LABEL[member.status]}</Tag>
        </div>

        {/* Kebab menu */}
        <button
          onClick={openMenu}
          onMouseEnter={() => setHovered(true)}
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            background: menuOpen ? "var(--accent)" : "transparent",
            color: "var(--muted-foreground)", cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered || menuOpen ? 1 : 0, transition: "opacity 0.1s",
          }}
          title="Member actions"
        >
          <Icons.MoreVertical size={14} />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && menuAnchor && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={() => setMenuOpen(false)} />
          <div style={{
            position: "fixed", top: menuAnchor.top, left: menuAnchor.left,
            transform: "translateX(-100%)", zIndex: 10001,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "4px 0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)", // audit-ignore
            minWidth: 200,
          }}>
            {(member.status === "pending"
              ? [
                  { key: "send-invite",  label: "Send invitation",      icon: Icons.Mail },
                  { key: "deactivate",   label: "Remove from workspace", icon: Icons.Trash2, danger: true },
                ]
              : member.status === "invited"
              ? [
                  { key: "resend-invite", label: "Resend invitation",     icon: Icons.Mail },
                  { key: "deactivate",    label: "Remove from workspace",  icon: Icons.Trash2, danger: true },
                ]
              : [
                  { key: "reset-password", label: "Reset password", icon: Icons.KeyRound },
                  { key: "reset-mfa",      label: "Reset MFA",       icon: Icons.ShieldOff },
                  { key: member.status === "suspended" ? "unsuspend" : "suspend",
                    label: member.status === "suspended" ? "Unsuspend access" : "Suspend access",
                    icon: member.status === "suspended" ? Icons.UserCheck : Icons.UserX,
                  },
                  { key: "deactivate", label: "Deactivate user", icon: Icons.Ban, danger: true },
                ]
            ).map(({ key, label, icon: Icon, danger }) => (
              <button key={key} onClick={e => {
                e.stopPropagation()
                setMenuOpen(false)
                onAction?.(member, key as MemberAction)
              }} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "8px 14px",
                cursor: "pointer", fontSize: 12, fontWeight: 500, textAlign: "left",
                color: danger ? "var(--badge-error)" : "var(--foreground)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--el-row-hover)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none" }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}

// ─── Role card ────────────────────────────────────────────────────────────────


function AvatarStack({ members, overflow }: { members: { id: string; name: string }[]; overflow: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {members.map((m, i) => (
        <div key={m.id} title={m.name} style={{ marginLeft: i > 0 ? -4 : 0, flexShrink: 0, position: "relative", zIndex: members.length - i }}>
          <AvatarCircle name={m.name} sizeKey="sm" colorKey={nameToAvatarColor(m.name)} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{ marginLeft: -4, flexShrink: 0 }}>
          <AvatarCircle name={`+${overflow}`} initials={`+${overflow}`} sizeKey="sm" avatarStyle="text" />
        </div>
      )}
    </div>
  )
}

function RoleCard({ role, onSelect }: { role: Role; onSelect: (r: Role) => void }) {
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <CardContainer
      variant="default"
      size="default"
      onClick={() => onSelect(role)}
      className="h-full flex flex-col"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1 }}>{role.label}</span>
        <Tag variant={role.system ? "secondary" : "informative"} size="sm">
          {role.system ? "System" : "Custom"}
        </Tag>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 500, color: "var(--color-text-body)", lineHeight: "20px", margin: "0 0 14px",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {role.desc}
      </p>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AvatarStack members={visible} overflow={overflow} />
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-body)" }}>
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
        <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => onSelect(role)}>
            {role.system ? "View role" : "Edit role"}
          </Button>
        </div>
      </div>
    </CardContainer>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onSelect }: { group: Group; onSelect: (g: Group) => void }) {
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <CardContainer
      variant="default"
      size="default"
      onClick={() => onSelect(group)}
      className="h-full flex flex-col"
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1, marginBottom: 6 }}>{group.name}</div>
      <p style={{
        fontSize: 12, fontWeight: 500, color: "var(--color-text-body)", lineHeight: "20px", margin: "0 0 12px",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {group.desc}
      </p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, minHeight: 22 }}>
        {group.studios.length === 0 ? (
          <Tag variant="secondary" size="sm">No studios</Tag>
        ) : group.studios.map(s => (
          <Tag key={s} variant="secondary" size="sm">{STUDIO_META[s].label}</Tag>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <AvatarStack members={visible} overflow={overflow} />
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-body)" }}>
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
        <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => onSelect(group)}>
            Manage group
          </Button>
        </div>
      </div>
    </CardContainer>
  )
}
// ── Step 1: Apps ──────────────────────────────────────────────────────────────

/**
 * Deliberately loose: something, an @, a domain with a dot. Anything stricter
 * starts rejecting addresses that are perfectly valid (plus-tags, new TLDs,
 * long subdomains) and the field's job here is to catch "josjosjdos", not to
 * be the authority on RFC 5322.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const isEmail = (v: string) => EMAIL_RE.test(v.trim())

const INVITE_STUDIO_OPTIONS = [
  { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={13} /> },
  { id: "datastudio", label: "Data Studio",        icon: <Icons.Database size={13} /> },
  { id: "agentic",    label: "Agentic Studio",     icon: <Icons.Bot size={13} /> },
  { id: "admin",      label: "Admin Console",      icon: <Icons.Settings size={13} /> },
]

/**
 * Inviting somebody is a create, it has three stages and it grants access — so
 * it takes the same surface New Role takes: a full page, a Stepper, and the
 * StepperNavFooter as the only way to finish. The Create pattern's staged-flows
 * table is explicit that a Stepper never lives inside a panel, and this used to
 * be a ModalDialog with five sections stacked in a 560px scroller.
 *
 * The third stage is not padding. An invitation leaves the product — it sends
 * mail to a person who is not here yet and hands them studio access — so what
 * is about to happen is stated in full before the button that does it.
 */
/**
 * Four rows of a `size="sm"` card, which is what a picker should show before
 * it starts scrolling: enough to compare against each other, short enough
 * that the CTA below stays on screen.
 *
 * `paddingInline` + an equal negative `marginInline` is the sanctioned fix
 * from CLAUDE.md — a scroll container clips at its PADDING box, so the
 * boundary moves out past the card's hover halo while the cards themselves do
 * not move. Shrinking the cards instead is the thing that looks right and is
 * wrong.
 */
function pickerScroller(rowHeight: number): React.CSSProperties {
  return {
    maxHeight: 4 * (rowHeight + 8),   // +8 is the grid gap between rows
    overflowY: "auto",
    paddingInline: 16,
    marginInline: -16,
    paddingBlock: 4,
  }
}

/** Two columns, because these items are short and comparing them is the task. */
const PICKER_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  alignContent: "start",
}

/**
 * Search plus quick filters, on one line. The field is capped at 280px on
 * purpose: stretched to the container it reads as the section's main control,
 * when the actual task is picking from the list underneath. The chips are
 * selected/unselected, which is precisely what `Chip` is for — a `Tag` here
 * would be a status nobody can click.
 */
function PickerToolbar({ query, onQuery, placeholder, filters, active, onFilter }: {
  query: string
  onQuery: (v: string) => void
  placeholder: string
  filters: readonly { id: string; label: string }[]
  active: string
  onFilter: (id: string) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
      <div style={{ width: 280, flexShrink: 0 }}>
        <Input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder={placeholder}
          size="sm"
          leftIcon={<Icons.Search />}
        />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {filters.map(f => (
          <Chip key={f.id} size="s" variant={active === f.id ? "primary" : "secondary"}
            onClick={() => onFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}

const GROUP_FILTERS = [
  { id: "all",        label: "All" },
  { id: "governance", label: "Governance" },
  { id: "datastudio", label: "Data" },
  { id: "agentic",    label: "Agentic" },
  { id: "admin",      label: "Admin" },
] as const

const ROLE_FILTERS = [
  { id: "all",    label: "All" },
  { id: "system", label: "System" },
  { id: "custom", label: "Custom" },
] as const

/**
 * The recipients field. Deliberately NOT a TagInput: this is an email box,
 * and a chip that accepts whatever was typed says "these are labels you are
 * inventing" when the truth is "this address either exists or it does not".
 * The field itself carries the verdict — success once the address is real and
 * free, error when it is malformed or already belongs to somebody — and the
 * accepted addresses become rows underneath, where each one can show its own
 * state. Michael, three times, and he was right each time.
 */
function EmailRecipients({ value, onChange, onDraftChange }: {
  value: string[]
  onChange: (next: string[]) => void
  onDraftChange: (draft: string) => void
}) {
  const [draft, setDraft] = useState("")
  /** Errors of FORM wait for a commit; errors of FACT do not — see below. */
  const [attempted, setAttempted] = useState(false)

  const trimmed      = draft.trim().toLowerCase()
  const existing     = trimmed ? MEMBERS.find(m => m.email.toLowerCase() === trimmed) : undefined
  const alreadyAdded = trimmed ? value.includes(trimmed) : false
  const valid        = isEmail(trimmed)
  const canAdd       = valid && !existing && !alreadyAdded

  /**
   * Two different kinds of wrong, and they surface at different moments.
   * "This is not an address" is a judgement on half-typed text, so it waits
   * until the user says they are done with it. "This address is already
   * somebody's" is a fact about the workspace that the user cannot deduce —
   * it shows the moment the address is complete enough to check, which is the
   * whole point of showing it at all.
   */
  const field: { state: "default" | "success" | "error" | "alert"; text: string } =
      !trimmed                 ? { state: "default", text: "Press Enter to add each address." }
    : existing                 ? { state: "error",   text: `${existing.name} is already ${STATUS_LABEL[existing.status].toLowerCase()} in this workspace — ${existing.email}.` }
    : alreadyAdded             ? { state: "alert",   text: "Already on this invitation." }
    : valid                    ? { state: "success", text: "Looks good. Press Enter to add." }
    : attempted                ? { state: "error",   text: `"${draft.trim()}" is not an email address.` }
    :                            { state: "default", text: "Press Enter to add each address." }

  function commit() {
    if (!trimmed) return
    if (!canAdd) { setAttempted(true); return }
    onChange([...value, trimmed])
    setDraft(""); onDraftChange(""); setAttempted(false)
  }

  return (
    <>
      <Input
        value={draft}
        state={field.state}
        supportingText={field.text}
        leftIcon={<Icons.Mail />}
        placeholder="name@company.com"
        onChange={e => { setDraft(e.target.value); onDraftChange(e.target.value); setAttempted(false) }}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit() } }}
        onBlur={commit}
      />

      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {value.map(addr => (
            <CardContainer key={addr} size="sm">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Nobody has a name yet — `empty` is the DS avatar for exactly
                    that, rather than initials invented from the local part. */}
                <AvatarCircle name={addr} avatarStyle="empty" sizeKey="lg" />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {addr}
                </span>
                <Tag variant="informative" size="sm">Will be invited</Tag>
                <Tooltip content={`Remove ${addr}`}>
                  <Button variant="tertiary" size="sm" aria-label={`Remove ${addr}`}
                    onClick={() => onChange(value.filter(x => x !== addr))}>
                    <Icons.X size={13} />
                  </Button>
                </Tooltip>
              </div>
            </CardContainer>
          ))}
        </div>
      )}
    </>
  )
}

function InviteWizard({ onCancel, onSend }: {
  onCancel: () => void
  onSend: (
    emails: string[], role: MemberRole, studios: string[], groupIds: string[],
    roleId: string | null, sendEmail: boolean,
  ) => void
}) {
  const [step, setStep]         = useState<0 | 1 | 2>(0)
  const [emails, setEmails]     = useState<string[]>([])
  /**
   * What is typed into the email field but not yet committed to a chip. Next
   * has to count it: somebody who types one address and reaches straight for
   * the button has filled the form as far as they can tell, and a CTA that
   * stays grey there looks broken. The field commits on blur, so the address
   * is a real recipient by the time the click lands.
   */
  const [emailDraft, setEmailDraft] = useState("")
  const [role, setRole]         = useState<MemberRole>("Member")
  const [studios, setStudios]   = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  /** A permission preset, not the user type above it. Optional by design. */
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [groupQuery, setGroupQuery]         = useState("")
  const [groupFilter, setGroupFilter]       = useState("all")
  const [roleQuery, setRoleQuery]           = useState("")
  const [roleFilter, setRoleFilter]         = useState("all")
  const [sendEmail, setSendEmail]           = useState(true)
  const [note, setNote]         = useState("")

  function toggleStudio(id: string) {
    setStudios(studios.includes(id) ? studios.filter(s => s !== id) : [...studios, id])
  }
  function toggleGroup(id: string) {
    setGroupIds(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  }

  const isMember = role === "Member"

  // An Admin or an Owner gets every studio by definition, so stage 2 has
  // nothing it can require of them. A Member invited with no studio and no
  // group would land in the workspace able to open nothing at all.
  const draftIsAddable = isEmail(emailDraft)
    && !MEMBERS.some(m => m.email.toLowerCase() === emailDraft.trim().toLowerCase())
    && !emails.includes(emailDraft.trim().toLowerCase())
  const canContinue = step === 0 ? emails.length > 0 || draftIsAddable
                    : step === 1 ? (!isMember || studios.length > 0 || groupIds.length > 0)
                    : true

  const steps: StepItem[] = [
    { label: "People", state: step === 0 ? "active" : step > 0 ? "completed" : "default" },
    { label: "Access", state: step === 1 ? "active" : step > 1 ? "completed" : "default" },
    { label: "Review", state: step === 2 ? "active" : "default" },
  ]

  const effectiveStudios = isMember ? studios : INVITE_STUDIO_OPTIONS.map(s => s.id)
  const chosenGroups     = GROUPS.filter(g => groupIds.includes(g.id))
  const selectedRole     = ROLES.find(r => r.id === selectedRoleId) ?? null

  const sendDescription = emails.length === 1
    ? `An invite link will be sent to ${emails[0]}. Expires in 7 days.`
    : `Invite links will be sent to all ${emails.length} recipients. Expire in 7 days.`
  const notSendingDescription =
    "Contact(s) will be created in a pending state. You can send the invitation later from their profile."

  const finishLabel = sendEmail
    ? (emails.length > 1 ? `Send invitations (${emails.length})` : "Send invitation")
    : (emails.length > 1 ? `Create contacts (${emails.length})`  : "Create contact")

  // Same filter the Groups tab runs, so the two behave identically — plus the
  // studio chips, which narrow by what the group actually grants.
  const shownGroups = (() => {
    const q = groupQuery.trim().toLowerCase()
    return GROUPS
      .filter(g => groupFilter === "all" || g.studios.includes(groupFilter))
      .filter(g => !q || g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  })()

  const shownRoles = (() => {
    const q = roleQuery.trim().toLowerCase()
    return ROLES
      .filter(r => roleFilter === "all" || (roleFilter === "system" ? r.system : !r.system))
      .filter(r => !q || r.label.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
  })()

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      hideSidebar
      stickyFooter
      header={() => (
        <Header
          size="size-l"
          title="Invite members"
          description="Invitations are sent by email and expire after 7 days."
          backButton
          onBack={onCancel}
        />
      )}
    >
      <div style={{ marginBottom: 24 }}>
        <Stepper steps={steps} />
      </div>

      {/* ── 1 · People ────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
          <div>
            <FormSectionLabel hint="Everyone here gets the same user type, the same role and the same access.">
              Email addresses
            </FormSectionLabel>
            <EmailRecipients value={emails} onChange={setEmails} onDraftChange={setEmailDraft} />
          </div>

          {/* One card per option. The title never turns blue: the card's
              selected border is what says "chosen", and a coloured label on
              top of it says it twice. */}
          <div>
            <FormSectionLabel hint="What these people are in the workspace. A role preset, chosen next, is a separate thing.">
              User type
            </FormSectionLabel>
            <div role="radiogroup" aria-label="User type" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["Member", "Admin", "Owner"] as MemberRole[]).map(r => (
                <CardContainer key={r} size="sm" selected={role === r} onClick={() => setRole(r)}>
                  <div style={{ pointerEvents: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Radio value={r} checked={role === r} size="sm" hideLabel label={r} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-title)" }}>{r}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.45 }}>
                      {r === "Owner" ? "Full admin + transferable ownership"
                        : r === "Admin" ? "Manage members, studios & billing"
                        : "Access assigned studios only"}
                    </div>
                  </div>
                </CardContainer>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2 · Access ────────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <FormSectionLabel hint={isMember
              ? "Select which studios these people can open."
              : `${role}s get every studio automatically — there is nothing to choose here.`}>
              Studio access
            </FormSectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {INVITE_STUDIO_OPTIONS.map(st => {
                const on = isMember ? studios.includes(st.id) : true
                return (
                  <CardContainer
                    key={st.id}
                    size="sm"
                    selected={on}
                    disabled={!isMember}
                    onClick={isMember ? () => toggleStudio(st.id) : undefined}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
                      <Checkbox size="sm" checked={on} disabled={!isMember} id={`inv-studio-${st.id}`} />
                      <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0 }}>{st.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-title)" }}>{st.label}</span>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
          </div>

          <div>
            <FormSectionLabel optional hint="Group membership grants additional studio access and permissions.">
              Add to groups
            </FormSectionLabel>
            <PickerToolbar
              query={groupQuery}
              onQuery={setGroupQuery}
              placeholder="Search groups…"
              filters={GROUP_FILTERS}
              active={groupFilter}
              onFilter={setGroupFilter}
            />
            {shownGroups.length === 0 ? (
              <EmptyState
                icon={Icons.Users}
                title="No groups found"
                description="Try a different search term, or clear the studio filter."
                ctaLabel="Clear filters"
                onCta={() => { setGroupQuery(""); setGroupFilter("all") }}
              />
            ) : (
            <div style={{ ...PICKER_GRID, ...pickerScroller(58) }}>
              {shownGroups.map(g => {
                const on = groupIds.includes(g.id)
                return (
                  <CardContainer key={g.id} size="sm" selected={on} onClick={() => toggleGroup(g.id)}>
                    {/* One line, tags on the right. Stacked underneath they
                        made every card ~30px taller for no extra information,
                        and a taller card is fewer groups per screen. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "none" }}>
                      <Checkbox size="sm" checked={on} id={`inv-group-${g.id}`} />
                      <AvatarCircle name={g.name} initials={g.name.slice(0, 2).toUpperCase()} sizeKey="lg" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {g.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          {g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {/* Wide enough for all four abbreviations on one line —
                          wrapping made two of the six cards taller than the
                          rest, which is the thing this change was undoing. */}
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, maxWidth: 200 }}>
                        {g.studios.map(st => (
                          <Tag key={st} variant={STUDIO_TAG[st] ?? "neutral"} size="sm">
                            {STUDIO_SHORT[st] ?? st}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
            )}
          </div>

          {/*
            A role is a preset of permissions, which is why it sits beside
            studios and groups rather than being a step of its own: all three
            answer "what can this person reach". Thom's spec had it as its own
            stage marked Optional — a stage nobody has to complete is a
            section.
          */}
          <div>
            <FormSectionLabel optional hint="Assign a role to grant a preset of permissions.">
              Assign a role
            </FormSectionLabel>
            <PickerToolbar
              query={roleQuery}
              onQuery={setRoleQuery}
              placeholder="Search roles…"
              filters={ROLE_FILTERS}
              active={roleFilter}
              onFilter={setRoleFilter}
            />
            {shownRoles.length === 0 ? (
              <EmptyState
                icon={Icons.ShieldCheck}
                title="No roles found"
                description="Try a different search term, or clear the System/Custom filter."
                ctaLabel="Clear filters"
                onCta={() => { setRoleQuery(""); setRoleFilter("all") }}
              />
            ) : (
            <div style={{ ...PICKER_GRID, ...pickerScroller(86) }}>
              {/* "No role" is a real choice, not the absence of one, so it is a
                  card like the others — and it stays put while the search
                  filters the rest, because searching must never strand the
                  user with nothing selectable. */}
              <CardContainer size="sm" selected={selectedRoleId === null} onClick={() => setSelectedRoleId(null)}>
                <div style={{ pointerEvents: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>No role</span>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.45 }}>
                    Member gets access via groups or direct permissions only.
                  </span>
                </div>
              </CardContainer>
              {shownRoles.map(r => {
                const on = selectedRoleId === r.id
                return (
                  <CardContainer key={r.id} size="sm" selected={on} onClick={() => setSelectedRoleId(r.id)}>
                    <div style={{ pointerEvents: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{r.label}</span>
                        <Tag variant={r.system ? "secondary" : "informative"} size="sm">
                          {r.system ? "System" : "Custom"}
                        </Tag>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.45 }}>{r.desc}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-subtitle)" }}>
                        {ROLE_PERM_COUNTS[r.id]?.total ?? 0} permissions
                      </span>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3 · Review ────────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
          <div>
            <FormSectionLabel hint="This is what leaves the product when you send.">
              Review
            </FormSectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <InviteReviewRow
                icon="Mail"
                variant="informative"
                label={`${emails.length} recipient${emails.length !== 1 ? "s" : ""}`}
              >
                {emails.map(e => <Tag key={e} variant="neutral" size="sm">{e}</Tag>)}
              </InviteReviewRow>

              <InviteReviewRow icon="UserCog" variant="neutral" label="User type">
                <Tag variant="neutral" size="sm">{role}</Tag>
              </InviteReviewRow>

              <InviteReviewRow icon="ShieldCheck" variant="informative" label="Role">
                {selectedRole
                  ? (
                    <Tag variant="neutral" size="sm">
                      {selectedRole.label} · {ROLE_PERM_COUNTS[selectedRole.id]?.total ?? 0} permissions
                    </Tag>
                  )
                  : (
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      No role — access comes from groups and direct permissions only
                    </span>
                  )}
              </InviteReviewRow>

              <InviteReviewRow
                icon="LayoutGrid"
                variant="lime"
                label={isMember ? "Studio access" : `Studio access · every studio, because ${role}s get all of them`}
              >
                {effectiveStudios.map(id => (
                  <Tag key={id} variant={STUDIO_TAG[id] ?? "neutral"} size="sm">
                    {INVITE_STUDIO_OPTIONS.find(s => s.id === id)?.label ?? id}
                  </Tag>
                ))}
              </InviteReviewRow>

              <InviteReviewRow icon="Users" variant="purple" label="Groups">
                {chosenGroups.length === 0
                  ? <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>None</span>
                  : chosenGroups.map(g => <Tag key={g.id} variant="neutral" size="sm">{g.name}</Tag>)}
              </InviteReviewRow>
            </div>
          </div>

          {/*
            Creating the person and inviting them are two different acts, and
            this is where they separate. Off means the contact exists in a
            pending state with nothing sent — a real requirement, not a
            preference, so the CTA below renames itself to match.
          */}
          <CardContainer size="sm">
            <Toggle
              checked={sendEmail}
              onChange={setSendEmail}
              label="Send invitation email"
              description={sendEmail ? sendDescription : notSendingDescription}
            />
          </CardContainer>

          {/* No label prop — this is a desktop screen. Nothing goes out when
              the toggle is off, so there is nowhere for a note to be read. */}
          {sendEmail && (
            <div>
              <FormSectionLabel optional>Personal note</FormSectionLabel>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Welcome to AIMS OS! We're excited to have you on the team…"
                rows={2}
              />
            </div>
          )}
        </div>
      )}

      {/* The flow completes here, never in the Header. */}
      {createPortal(
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "var(--step-nav-footer-bg, var(--canvas))",
          borderTop: "1px solid var(--step-nav-footer-separator, var(--border))",
        }}>
          <StepperNavFooter
            variant={step === 0 ? "cancel-next" : "back-next"}
            cancelLabel="Cancel"
            onCancel={onCancel}
            onBack={() => setStep(s => Math.max(0, s - 1) as 0 | 1 | 2)}
            nextLabel={step === 2 ? finishLabel : "Next"}
            nextDisabled={!canContinue}
            onNext={step === 2
              ? () => onSend(emails, role, effectiveStudios, groupIds, selectedRoleId, sendEmail)
              : () => setStep(s => Math.min(2, s + 1) as 0 | 1 | 2)}
          />
        </div>,
        document.body,
      )}
    </ScreenLayout>
  )
}

/** One reviewed fact: what it is on the left, the actual values on the right. */
function InviteReviewRow({ icon, variant, label, children }: {
  icon: string
  variant: React.ComponentProps<typeof HighlightIcon>["variant"]
  label: string
  children: React.ReactNode
}) {
  return (
    <CardContainer size="sm">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <HighlightIcon size="sm" variant={variant} iconName={icon} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{children}</div>
        </div>
      </div>
    </CardContainer>
  )
}

// ─── Preview slide-out contents ──────────────────────────────────────────────

function PreviewTabBar({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          style={{
            padding: "9px 16px", fontSize: 12, fontWeight: 600,
            cursor: "pointer",
            color: active === i ? "var(--foreground)" : "var(--muted-foreground)",
            borderBottom: active === i ? "2px solid var(--primary)" : "2px solid transparent",
            marginBottom: -1, transition: "color 0.15s",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

// ─── Permission summary types (used in MemberPreview + RolePreview) ─────────────

interface StudioPermRow {
  id: string
  label: string
  value: number
  max: number
  names: string[]
}

function PermissionsBreakdown({ rows }: { rows: StudioPermRow[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map(row => {
        const empty = row.value === 0
        const pct   = Math.min((row.value / row.max) * 100, 100)
        const isOpen = open === row.id
        return (
          <CardContainer key={row.id} size="sm" onClick={empty ? undefined : () => setOpen(o => o === row.id ? null : row.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                {!empty && (isOpen
                  ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                  : <Icons.ChevronRight size={12} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />)}
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{row.label}</span>
              </div>
              <Tag variant={empty ? "secondary" : (STUDIO_TAG[row.id] ?? "secondary")} size="sm">{row.value}</Tag>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "var(--field-border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, transition: "width 0.3s",
                background: empty ? "transparent" : "var(--primary)" }} />
            </div>
            {isOpen && row.names.length > 0 && (
              <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {row.names.map(name => (
                  <li key={name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted-foreground)" }}>
                    <Icons.Check size={11} color="var(--badge-success)" style={{ flexShrink: 0 }} />
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </CardContainer>
        )
      })}
    </div>
  )
}

/**
 * The preview is read-only. It used to carry an Actions tab with a raw
 * <select> for the user type and a suspend/invite button; Michael took it out
 * — those belong to the full profile, which the panel's own CTA opens, and a
 * raw <select> is not a DS control in the first place.
 */
function MemberPreview({ member }: { member: Member }) {
  const [tab, setTab] = useState(0)
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  // Same shape the role preview shows, so it is the same component — including
  // the expand, which this tab never had.
  const permSummary = useMemo<StudioPermRow[]>(() => {
    return STUDIO_TABS.map(({ id, label }) => {
      const nodes  = PERM_TREE[id] ?? []
      const flat   = nodes.flatMap(nd => [nd, ...(nd.children ?? [])])
      const granted = flat.filter(nd => nd.state !== "")
      return { id, label, value: granted.length, max: Math.max(flat.length, 1), names: granted.map(nd => nd.label) }
    })
  }, [])


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "0 0 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ flexShrink: 0, opacity: member.status === "suspended" ? 0.55 : 1 }}>
            <AvatarCircle name={member.name} initials={member.initials} sizeKey="xxl"
              avatarStyle={isActive ? "text" : "empty"} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 2 }}>{member.name}</div>
            {(member.title || member.department) && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.title}{member.title && member.department ? " · " : ""}{member.department}
              </div>
            )}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Tag variant={USER_TYPE_TAG[member.role]} size="sm">
                {member.role}
              </Tag>
              <Tag variant={STATUS_TAG[member.status]} size="sm">
                {STATUS_LABEL[member.status]}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <PreviewTabBar tabs={["Overview", "Permissions"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingInline: 16, marginInline: -16 }}>

        {/* Overview */}
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InfoRow icon={<Icons.Mail size={13} />} label="Email" value={member.email} />
            <InfoRow icon={<Icons.Calendar size={13} />} label="Joined" value={formatDate(member.joinedAt)} />
            {member.lastActive && (
              <InfoRow icon={<Icons.Clock size={13} />} label="Last active" value={formatRelative(member.lastActive)} />
            )}
            {isInvited && (
              <InfoRow icon={<Icons.Send size={13} />} label="Invite sent" value={formatRelative(member.joinedAt)} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
              <div style={{ color: "var(--muted-foreground)" }}><Icons.ShieldCheck size={13} /></div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 3 }}>MFA</div>
                <Tag
                  variant={member.mfaEnabled ? "success" : "alert"}
                  size="sm"
                  leadingIcon={member.mfaEnabled ? <Icons.ShieldCheck size={10} /> : <Icons.ShieldAlert size={10} />}
                >
                  {member.mfaEnabled ? (member.mfaMethod ? `Enabled · ${MFA_METHOD_LABEL[member.mfaMethod]}` : "Enabled") : "Not enabled"}
                </Tag>
              </div>
            </div>
            {!isInvited && (member.sessions?.length ?? 0) > 0 && (
              <InfoRow
                icon={<Icons.Monitor size={13} />}
                label="Active sessions"
                value={`${member.sessions!.length} session${member.sessions!.length !== 1 ? "s" : ""}`}
              />
            )}
          </div>
        )}

        {/* Permissions summary */}
        {tab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 4, lineHeight: 1.4 }}>
              Effective permissions across all studios. <span style={{ fontStyle: "italic" }}>Inherited via role.</span>
            </div>
            <PermissionsBreakdown rows={permSummary} />
          </div>
        )}

      </div>
    </div>
  )
}

function RolePreview({ role, onViewFull, onMemberClick }: { role: Role; onViewFull: () => void; onMemberClick?: (m: Member) => void }) {
  const [tab, setTab] = useState(0)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  const permRows = [
    { label: "Governance",  value: perms.governance, max: 10, color: "#8b5cf6" },  // audit-ignore: prototype fixture data
    { label: "Data Studio", value: perms.datastudio, max: 10, color: "#10b981" },  // audit-ignore: prototype fixture data
    { label: "Agentic",     value: perms.agentic,    max: 10, color: "#f97316" },  // audit-ignore: prototype fixture data
    { label: "Admin",       value: perms.admin,       max: 10, color: "#6366f1" },  // audit-ignore: prototype fixture data
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "20px 0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: role.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icons.Shield size={22} style={{ color: "#fff" }} /* audit-ignore: icon on colored bg, always white */ />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{role.label}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Tag variant={role.system ? "secondary" : "informative"} size="sm">
                {role.system ? "System" : "Custom"}
              </Tag>
              <Tag variant="informative" size="sm">{perms.total} permissions</Tag>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onViewFull} style={{ width: "100%", justifyContent: "center" }}>
          <Icons.ExternalLink size={12} />
          {role.system ? "View role" : "Edit role"}
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 20px" }}>
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.55, margin: 0 }}>{role.desc}</p>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 2 }}>
              Permissions breakdown
            </div>
            {permRows.map(s => (
              <div key={s.label} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    <span style={{ fontWeight: 700, color: s.value > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>{s.value}</span>
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((s.value / s.max) * 100, 100)}%`, background: s.value > 0 ? s.color : "transparent", borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div>
            {members.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted-foreground)", fontSize: 12 }}>
                No members assigned to this role
              </div>
            ) : members.map(m => (
              <div
                key={m.id}
                onClick={() => onMemberClick?.(m)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  cursor: onMemberClick ? "pointer" : "default",
                  transition: "background 0.1s", borderRadius: 6,
                }}
                onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
              >
                <AvatarCircle name={m.name} sizeKey="md" avatarStyle={m.status === "active" ? "text" : "empty"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupPreview({ group, onViewFull: _onViewFull, onMemberClick }: { group: Group; onViewFull: () => void; onMemberClick?: (m: Member) => void }) {
  const [tab, setTab] = useState(0)
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "20px 0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: group.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icons.Users size={22} style={{ color: "#fff" }} /* audit-ignore: icon on colored bg, always white */ />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{group.name}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Tag variant="neutral" size="sm">{members.length} member{members.length !== 1 ? "s" : ""}</Tag>
              <Tag variant="informative" size="sm">{group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}</Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 20px" }}>
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.55, margin: 0 }}>{group.desc}</p>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>
                Studio access
              </div>
              {group.studios.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>No studios assigned</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {group.studios.map(s => {
                    const meta = STUDIO_META[s]
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{meta.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            {members.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted-foreground)", fontSize: 12 }}>
                No members in this group yet
              </div>
            ) : members.map(m => (
              <div
                key={m.id}
                onClick={() => onMemberClick?.(m)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  cursor: onMemberClick ? "pointer" : "default",
                  transition: "background 0.1s", borderRadius: 6,
                }}
                onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
              >
                <AvatarCircle name={m.name} sizeKey="md" avatarStyle={m.status === "active" ? "text" : "empty"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Role form modal (create / edit) ─────────────────────────────────────────

/**
 * A form section's label, hoisted OUT of the modals that use it. Defined inline
 * it is a new component type on every render, so React throws the subtree away
 * and rebuilds it each keystroke — which is both wasteful and a real source of
 * lost state in the siblings around it.
 */
function FormSectionLabel({ children, hint, optional }: { children: React.ReactNode; hint?: string; optional?: boolean }) {
  return (
    <div style={{ marginBottom: hint ? 8 : 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>
        {children}{optional && <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}> (optional)</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

/**
 * Create a role — a full-page wizard, not a modal.
 *
 * Assigning members made it six field groups, and the Create cascade sends a
 * standalone create past five fields to a full-page form; adding stages on top
 * of that lands on "two or more stages → full-page wizard + Stepper +
 * StepperNavFooter". So the surface follows from the content, which is the
 * order the pattern insists on.
 *
 * The Sidebar is hidden for the duration (`hideSidebar`) — the pattern's own
 * rule for full-page create surfaces, and the reason `ScreenLayout` grew the
 * prop. `Header` carries the title and a backButton only: the flow completes in
 * the footer, never in a header CTA.
 *
 * Three stages, in the order the object needs them:
 *   1 Details      — what it is
 *   2 Permissions  — what it grants. Not optional and not deferred to a
 *                    "default scope": a role that grants nothing is not a role,
 *                    and scope is decided per permission, in the tree.
 *   3 Members      — who gets it. The stage that pushed this off a modal.
 */
function NewRoleWizard({ onCancel, onCreate }: {
  onCancel: () => void
  onCreate: (role: Role, memberIds: string[]) => void
}) {
  const [step, setStep]       = useState(0)
  const [name, setName]       = useState("")
  const [desc, setDesc]       = useState("")
  const [basedOn, setBasedOn] = useState<string | null>(null)
  const [studios, setStudios] = useState<string[]>([])
  const [activeStudio, setActiveStudio] = useState<string | null>(null)
  const [overrides, setOverrides]           = useState<PermOverrides>({})
  const [scopeOverrides, setScopeOverrides] = useState<Record<string, string>>({})
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [memberQuery, setMemberQuery] = useState("")

  // Picking a source role copies the studios it covers. It does NOT copy
  // permissions — the fixture holds one shared tree, not a grant list per role,
  // so claiming otherwise would be a lie the UI cannot back up.
  function chooseBase(id: string | null) {
    setBasedOn(id)
    const src = id ? ROLES.find(r => r.id === id) : null
    if (src) {
      setStudios(src.studios ?? [])
      setActiveStudio((src.studios ?? [])[0] ?? null)
    }
  }

  function toggleStudio(id: string) {
    setStudios(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setActiveStudio(cur => next.includes(cur ?? "") ? cur : next[0] ?? null)
      return next
    })
  }

  function togglePermission(id: string, on: boolean) {
    setOverrides(prev => {
      const copy = { ...prev }
      if (on) copy[id] = "g-direct"
      else delete copy[id]
      return copy
    })
  }

  const grantedCount = Object.values(overrides).filter(v => GRANTED_STATES.includes(v)).length
  const canContinue  = step === 0 ? name.trim().length > 0
                     : step === 1 ? studios.length > 0 && grantedCount > 0
                     : true

  const steps: StepItem[] = [
    { label: "Details",     state: step === 0 ? "active" : step > 0 ? "completed" : "default" },
    { label: "Permissions", state: step === 1 ? "active" : step > 1 ? "completed" : "default" },
    { label: "Members",     state: step === 2 ? "active" : "default" },
  ]

  function finish() {
    onCreate({
      id: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      label: name.trim(),
      system: false,
      desc: desc.trim(),
      memberIds,
      studios,
    }, memberIds)
  }

  const shownMembers = members_forWizard(memberQuery)

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      hideSidebar
      stickyFooter
      header={() => (
        <Header
          size="size-l"
          title="New role"
          description="A role bundles permissions so they can be granted to several people at once."
          backButton
          onBack={onCancel}
        />
      )}
    >
      <div style={{ marginBottom: 24 }}>
        <Stepper steps={steps} />
      </div>

      {/* ── 1 · Details ───────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
          <div>
            <FormSectionLabel>Role name</FormSectionLabel>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Risk Analyst" />
          </div>
          <div>
            <FormSectionLabel optional>Description</FormSectionLabel>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="What does this role allow members to do?" />
          </div>
          <div>
            <FormSectionLabel optional hint="Copies which studios that role covers. Permissions are chosen in the next step either way.">
              Start from
            </FormSectionLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Chip size="s" variant={basedOn === null ? "primary" : "secondary"} onClick={() => chooseBase(null)}>Blank</Chip>
              {ROLES.map(r => (
                <Chip key={r.id} size="s" variant={basedOn === r.id ? "primary" : "secondary"} onClick={() => chooseBase(r.id)}>
                  {r.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2 · Permissions ───────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <FormSectionLabel hint="Pick the studios first — the permissions below are the ones those studios define.">
              Studio access
            </FormSectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {INVITE_STUDIO_OPTIONS.map(st => {
                const on = studios.includes(st.id)
                return (
                  <CardContainer key={st.id} size="sm" selected={on} onClick={() => toggleStudio(st.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
                      <Checkbox size="sm" checked={on} id={`wiz-studio-${st.id}`} />
                      <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0 }}>{st.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-title)" }}>{st.label}</span>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
          </div>

          {studios.length === 0 ? (
            <EmptyState
              icon={Icons.ShieldQuestion}
              title="Pick a studio first"
              description="A role grants permissions inside a studio, so choose at least one above."
            />
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <FormSectionLabel>Permissions</FormSectionLabel>
                <Tag variant={grantedCount > 0 ? "success" : "neutral"} size="sm" className="ml-auto">
                  {grantedCount} granted
                </Tag>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {STUDIO_TABS.filter(t => studios.includes(t.id)).map(t => (
                  <Chip key={t.id} size="s" variant={activeStudio === t.id ? "primary" : "secondary"} onClick={() => setActiveStudio(t.id)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
              <CardContainer className="!p-0 overflow-hidden">
                {(PERM_TREE[activeStudio ?? ""] ?? []).map(n => (
                  <EditablePermTreeNode
                    key={n.id}
                    node={n}
                    depth={0}
                    overrides={overrides}
                    onToggle={togglePermission}
                    mode="edit"
                    scopeOverrides={scopeOverrides}
                    onScopeChange={(id, sc) => setScopeOverrides(prev => ({ ...prev, [id]: sc }))}
                  />
                ))}
              </CardContainer>
            </div>
          )}
        </div>
      )}

      {/* ── 3 · Members ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
          <FormSectionLabel optional hint="You can also assign this role later, from a member's profile.">
            Assign members
          </FormSectionLabel>
          <Input value={memberQuery} onChange={e => setMemberQuery(e.target.value)} placeholder="Search members…" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shownMembers.length === 0 ? (
              <EmptyState icon={Icons.UserSearch} title="No members found"
                description="Try a different name or email." />
            ) : shownMembers.map(m => {
              const on = memberIds.includes(m.id)
              return (
                <CardContainer key={m.id} size="sm" selected={on}
                  onClick={() => setMemberIds(prev => on ? prev.filter(x => x !== m.id) : [...prev, m.id])}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Checkbox size="sm" checked={on} id={`wiz-member-${m.id}`} className="pointer-events-none" />
                    <AvatarCircle name={m.name} initials={m.initials} sizeKey="md"
                      avatarStyle={m.status === "active" ? "text" : "empty"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{m.email}</div>
                    </div>
                    <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                  </div>
                </CardContainer>
              )
            })}
          </div>
        </div>
      )}

      {/* The flow completes here, never in the Header. */}
      {createPortal(
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "var(--step-nav-footer-bg, var(--canvas))",
          borderTop: "1px solid var(--step-nav-footer-separator, var(--border))",
        }}>
          <StepperNavFooter
            variant={step === 0 ? "cancel-next" : "back-next"}
            cancelLabel="Cancel"
            onCancel={onCancel}
            onBack={() => setStep(s => Math.max(0, s - 1) as 0 | 1 | 2)}
            nextLabel={step === 2 ? "Create role" : "Next"}
            nextDisabled={!canContinue}
            onNext={step === 2 ? finish : () => setStep(s => Math.min(2, s + 1) as 0 | 1 | 2)}
          />
        </div>,
        document.body,
      )}
    </ScreenLayout>
  )
}

/** Members the wizard offers, filtered by the search box. */
function members_forWizard(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return MEMBERS
  return MEMBERS.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
}

/**
 * Every resource any member holds, deduped by name — the catalogue a new group
 * can be granted from. Built off MEMBER_RESOURCES rather than a fixture of its
 * own, so the names here are the same ones the member Resources tab shows.
 */
const RESOURCE_CATALOG: MemberResource[] = (() => {
  const seen = new Map<string, MemberResource>()
  Object.values(MEMBER_RESOURCES).flat().forEach(r => {
    if (!seen.has(r.name)) seen.set(r.name, r)
  })
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
})()

/**
 * Create a group — a full-page wizard, same shell as New role and Invite.
 *
 * Three stages, not the five things Michael listed. Name and description are
 * two fields, not two stages. And ACTIVITY IS NOT A STAGE: a group that does
 * not exist yet has no history, so there is nothing to fill in — it is a tab
 * on the group once it exists, and creating one is its first entry.
 */
function CreateGroupWizard({ onCancel, onCreate }: {
  onCancel: () => void
  onCreate: (group: Group) => void
}) {
  const [step, setStep]         = useState<0 | 1 | 2>(0)
  const [name, setName]         = useState("")
  const [desc, setDesc]         = useState("")
  const [studios, setStudios]   = useState<string[]>([])
  const [memberIds, setMemberIds]     = useState<string[]>([])
  const [resourceIds, setResourceIds] = useState<string[]>([])
  const [memberQuery, setMemberQuery]     = useState("")
  const [resourceQuery, setResourceQuery] = useState("")

  const steps: StepItem[] = [
    { label: "Details",   state: step === 0 ? "active" : step > 0 ? "completed" : "default" },
    { label: "Members",   state: step === 1 ? "active" : step > 1 ? "completed" : "default" },
    { label: "Resources", state: step === 2 ? "active" : "default" },
  ]

  const canContinue = step === 0 ? name.trim().length > 0 : true

  const shownMembers = (() => {
    const q = memberQuery.trim().toLowerCase()
    if (!q) return MEMBERS
    return MEMBERS.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
  })()

  const shownResources = (() => {
    const q = resourceQuery.trim().toLowerCase()
    if (!q) return RESOURCE_CATALOG
    return RESOURCE_CATALOG.filter(r => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q))
  })()

  function finish() {
    onCreate({
      id: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      name: name.trim(),
      // `color` is never read anywhere — AvatarCircle hashes its own from the
      // name and the card colours come from STUDIO_TAG. It stays on the type
      // only because the fixture rows carry it.
      color: "var(--muted)",
      desc: desc.trim(),
      memberIds,
      studios,
    })
  }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      hideSidebar
      stickyFooter
      header={() => (
        <Header
          size="size-l"
          title="New group"
          description="A group bundles people so access and permissions can be granted to all of them at once."
          backButton
          onBack={onCancel}
        />
      )}
    >
      <div style={{ marginBottom: 24 }}>
        <Stepper steps={steps} />
      </div>

      {/* ── 1 · Details ───────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
          <div>
            <FormSectionLabel>Group name</FormSectionLabel>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Risk & Compliance" />
          </div>
          <div>
            <FormSectionLabel optional>Description</FormSectionLabel>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="What do the people in this group have in common?" />
          </div>
          <div>
            <FormSectionLabel optional hint="A group grants its studios to everyone in it. Leave it empty and the group organises people without granting anything.">
              Studio access
            </FormSectionLabel>
            {/* A studio here is selected/unselected, which is what Chip is for —
                the same call the group's own Settings tab already makes. */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STUDIO_TABS.map(t => {
                const on = studios.includes(t.id)
                return (
                  <Chip
                    key={t.id}
                    size="m"
                    variant={on ? "primary" : "secondary"}
                    onClick={() => setStudios(s => on ? s.filter(x => x !== t.id) : [...s, t.id])}
                  >
                    {t.label}
                  </Chip>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 2 · Members ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
          <FormSectionLabel optional hint="You can add people later, from the group or from their own profile.">
            Add members
          </FormSectionLabel>
          <Input value={memberQuery} onChange={e => setMemberQuery(e.target.value)} placeholder="Search members…" />
          {shownMembers.length === 0 ? (
            <EmptyState icon={Icons.UserSearch} title="No members found"
              description="Try a different name or email."
              ctaLabel="Clear search" onCta={() => setMemberQuery("")} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {shownMembers.map(m => {
                const on = memberIds.includes(m.id)
                return (
                  <CardContainer key={m.id} size="sm" selected={on}
                    onClick={() => setMemberIds(prev => on ? prev.filter(x => x !== m.id) : [...prev, m.id])}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Checkbox size="sm" checked={on} id={`grp-member-${m.id}`} className="pointer-events-none" />
                      <AvatarCircle name={m.name} initials={m.initials} sizeKey="md"
                        avatarStyle={m.status === "active" ? "text" : "empty"} />
                      <div style={{ flex: 1, minWidth: 0, pointerEvents: "none" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                      </div>
                      <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3 · Resources ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
          <FormSectionLabel optional hint="Everyone in the group gets these. Resources granted here show as “via {group}” on each member's own Resources tab.">
            Grant resources
          </FormSectionLabel>
          <Input value={resourceQuery} onChange={e => setResourceQuery(e.target.value)} placeholder="Search resources…" />
          {shownResources.length === 0 ? (
            <EmptyState icon={Icons.Layers} title="No resources found"
              description="Try a different name or type."
              ctaLabel="Clear search" onCta={() => setResourceQuery("")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shownResources.map(r => {
                const on = resourceIds.includes(r.id)
                return (
                  <CardContainer key={r.id} size="sm" selected={on}
                    onClick={() => setResourceIds(prev => on ? prev.filter(x => x !== r.id) : [...prev, r.id])}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Checkbox size="sm" checked={on} id={`grp-res-${r.id}`} className="pointer-events-none" />
                      <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0, pointerEvents: "none" }}>
                        {RESOURCE_TYPE_ICON[r.type] ?? <Icons.Layers size={13} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, fontFamily: "monospace", fontSize: 12, color: "var(--color-text-title)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pointerEvents: "none" }}>
                        {r.name}
                      </span>
                      <Tag variant={RESOURCE_TYPE_TAG[r.type] ?? "neutral"} size="sm">{r.type}</Tag>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* The fixed footer would otherwise sit on top of the last card. */}
      <div style={{ height: 96 }} aria-hidden />

      {/* The flow completes here, never in the Header. */}
      {createPortal(
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "var(--step-nav-footer-bg, var(--canvas))",
          borderTop: "1px solid var(--step-nav-footer-separator, var(--border))",
        }}>
          <StepperNavFooter
            variant={step === 0 ? "cancel-next" : "back-next"}
            cancelLabel="Cancel"
            onCancel={onCancel}
            onBack={() => setStep(s => Math.max(0, s - 1) as 0 | 1 | 2)}
            nextLabel={step === 2 ? "Create group" : "Next"}
            nextDisabled={!canContinue}
            onNext={step === 2 ? finish : () => setStep(s => Math.min(2, s + 1) as 0 | 1 | 2)}
          />
        </div>,
        document.body,
      )}
    </ScreenLayout>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [mainTab, setMainTab]           = useState<"members" | "roles" | "groups">("members")
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all")
  /**
   * Which shape the Members list takes. Filters' own toggle calls them
   * "grid" and "list"; here grid IS the table that has always been there,
   * so nothing moves for somebody who never touches the control.
   */
  const [membersView, setMembersView] = useState<"grid" | "list">("grid")
  const [query, setQuery]               = useState("")
  const [rolesQuery, setRolesQuery]     = useState("")
  const [groupsQuery, setGroupsQuery]   = useState("")
  const [members, setMembers]           = useState<Member[]>([...MEMBERS])
  const [roles, setRoles]               = useState<Role[]>(ROLES)
  const [groups, setGroups]             = useState<Group[]>(GROUPS)
  const [detailView, setDetailView]     = useState<DetailView>(null)
  const [previewItem, setPreviewItem]   = useState<DetailView>(null)

  // The preview panel's footer CTA. One SlideOut hosts three preview types, so
  // the label and the destination are resolved from whichever is open — a
  // preview component no longer renders its own "open the full thing" button.
  const previewCta =
    previewItem?.type === "member" ? { label: "View full profile", onClick: () => { setDetailView(previewItem); setPreviewItem(null) } }
  : previewItem?.type === "role"   ? { label: "View role", onClick: () => { setDetailView(previewItem); setPreviewItem(null) } }
  : previewItem?.type === "group"  ? { label: "Manage group", onClick: () => { setDetailView(previewItem); setPreviewItem(null) } }
  : undefined
  const [showInvite, setShowInvite]     = useState(false)
  const [creatingRole, setCreatingRole] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const toast = useToast()

  function handleRoleCreate(saved: Role, assigned: string[]) {
    setRoles(prev => [...prev, saved])
    setCreatingRole(false)
    // A wizard lands on the object it created (Create pattern), and the toast
    // confirms the write itself — top-right, gone in 3.5s.
    setDetailView({ type: "role", role: saved })
    toast.success(`Role "${saved.label}" created`, {
      description: assigned.length > 0
        ? `Assigned to ${assigned.length} member${assigned.length === 1 ? "" : "s"}.`
        : "Assign it to members from their profile whenever you are ready.",
    })
  }

  function handleInvite(
    emails: string[], role: MemberRole, studios: string[], groupIds: string[],
    roleId: string | null, sendEmail: boolean,
  ) {
    const stamp = Date.now()
    const invited: Member[] = emails.map((email, i) => ({
      id: `new-${stamp}-${i}`,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role,
      // Invited means a link is out there and can be accepted. Pending means
      // the person exists and nobody has been told yet.
      status: sendEmail ? "invited" : "pending",
      lastActive: null,
      joinedAt: new Date().toISOString(),
      initials: email.slice(0, 2).toUpperCase(),
      avatarColor: "var(--muted)",
      mfaEnabled: false,
      studios,
    }))
    setMembers(ms => [...ms, ...invited])

    // The chosen groups have to actually gain these people, or the review step
    // stated something that never happened. GROUPS is a module fixture read
    // directly by six call sites, so it is written in place rather than lifted
    // into state for this one flow — and the new people go into MEMBERS for the
    // same reason: GroupCard, GroupPreview and the role panels all resolve a
    // memberId against that fixture, so somebody who exists only in state is
    // silently dropped by their `.filter(Boolean)`.
    MEMBERS.push(...invited)
    GROUPS.forEach(g => {
      if (groupIds.includes(g.id)) g.memberIds = [...g.memberIds, ...invited.map(m => m.id)]
    })

    // A role chosen in the wizard has to actually hold these people, for the
    // same reason the groups do — the review step said so. The Role objects
    // are shared between the ROLES fixture and this screen's state, so
    // mutating one updates both; setRoles only forces the re-render.
    const assignedRole = roleId ? ROLES.find(r => r.id === roleId) : undefined
    if (assignedRole) {
      assignedRole.memberIds = [...assignedRole.memberIds, ...invited.map(m => m.id)]
      setRoles(rs => [...rs])
    }

    setShowInvite(false)
    setMainTab("members")
    setStatusFilter(sendEmail ? "invited" : "pending")

    const roleNote = assignedRole ? ` Role: ${assignedRole.label}.` : ""
    if (sendEmail) {
      toast.success(
        emails.length === 1 ? "Invitation sent" : `${emails.length} invitations sent`,
        {
          description: `${emails.length === 1 ? "It expires" : "They expire"} in 7 days.${roleNote} Filtered to Invited so you can see them.`,
        },
      )
    } else {
      toast.success(
        emails.length === 1 ? "Contact created" : `${emails.length} contacts created`,
        {
          description: `No invitation was sent — open ${emails.length === 1 ? "the contact" : "a contact"} and click Send invitation when ready.${roleNote} Filtered to Pending so you can see ${emails.length === 1 ? "it" : "them"}.`,
        },
      )
    }
  }

  /**
   * GROUPS is a module fixture read directly by half a dozen call sites, so a
   * new group is written into it rather than lifted into state — the same
   * reason handleInvite writes there. A wizard lands on what it created.
   */
  function handleGroupCreate(saved: Group) {
    GROUPS.push(saved)
    setCreatingGroup(false)
    setDetailView({ type: "group", group: saved })
    toast.success(`Group "${saved.name}" created`, {
      description: [
        saved.memberIds.length > 0 ? `${saved.memberIds.length} member${saved.memberIds.length === 1 ? "" : "s"}` : null,
        saved.studios.length > 0 ? `${saved.studios.length} studio${saved.studios.length === 1 ? "" : "s"}` : null,
      ].filter(Boolean).join(" · ") || "Add members and studios whenever you are ready.",
    })
  }

  const counts = useMemo(() => ({
    all:       members.length,
    active:    members.filter(m => m.status === "active").length,
    invited:   members.filter(m => m.status === "invited").length,
    pending:   members.filter(m => m.status === "pending").length,
    suspended: members.filter(m => m.status === "suspended").length,
  }), [members])

  /**
   * The Filters bar renders and positions this menu itself. It used to be
   * wired by hand with `useFilterDropdown` — a Menu plus dropdown-anchor
   * sitting beside the bar — which is the thing CLAUDE.md says not to do now
   * that `slots[].options` exists.
   */
  const STATUS_OPTIONS: { id: "all" | MemberStatus; label: string }[] = [
    { id: "all",       label: `All members · ${counts.all}`     },
    { id: "active",    label: `Active · ${counts.active}`       },
    { id: "invited",   label: `Invited · ${counts.invited}`     },
    { id: "pending",   label: `Pending · ${counts.pending}`     },
    { id: "suspended", label: `Suspended · ${counts.suspended}` },
  ]
  const statusSlot = {
    placeholder: "Status",
    value: statusFilter === "all" ? undefined : STATUS_OPTIONS.find(o => o.id === statusFilter)?.label,
    options: STATUS_OPTIONS.map(o => o.label),
    onSelect: (label: string) => setStatusFilter(STATUS_OPTIONS.find(o => o.label === label)?.id ?? "all"),
    onRemove: () => setStatusFilter("all"),
  }

  const filtered = useMemo(() => {
    let result = members
    if (statusFilter !== "all") result = result.filter(m => m.status === statusFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
      )
    }
    return result
  }, [members, statusFilter, query])

  const filteredRoles = useMemo(() => {
    const q = rolesQuery.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(r => r.label.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
  }, [roles, rolesQuery])

  const filteredGroups = useMemo(() => {
    const q = groupsQuery.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  }, [groups, groupsQuery])

  /**
   * One member in EntityList's shape. The table's six columns have to land
   * somewhere specific rather than all becoming meta:
   *
   *   avatar + title   the person — people get an avatar, never an icon tile
   *   primaryMeta      the email, always icon + text
   *   state            the status badge; STATUS_TAG already carries the tone
   *   timestamp        last active, or when the invitation went out
   *   secondaryMeta    department · user type · MFA
   *   tags             the groups they belong to
   *
   * EntityList renders `tags` as neutral chips by design, which is why the
   * GROUPS go there and the user type does not: a group name is a label,
   * while Owner/Admin/Member is graded by reach and would lose that grading
   * if it were forced neutral. It keeps its icon + text instead.
   */
  function memberAsEntity(m: Member): EntityListItemData {
    const groups = GROUPS.filter(g => g.memberIds.includes(m.id))
    const invitePending = m.status === "invited" || m.status === "pending"
    return {
      id: m.id,
      title: m.name,
      avatarName: m.name,
      primaryMeta: [{ iconName: "Mail", label: m.email, tooltip: `Email · ${m.email}` }],
      state: { label: STATUS_LABEL[m.status], variant: STATUS_TAG[m.status] },
      timestamp: m.lastActive
        ? formatRelative(m.lastActive)
        : invitePending ? formatRelative(m.joinedAt) : undefined,
      secondaryMeta: [
        ...(m.department ? [{ iconName: "Building2", label: m.department, tooltip: `Department · ${m.department}` }] : []),
        { iconName: "ShieldCheck", label: m.role, tooltip: `User type · ${m.role}` },
        {
          iconName: m.mfaEnabled ? "ShieldCheck" : "ShieldOff",
          label: m.mfaEnabled ? "MFA on" : "MFA off",
          tooltip: m.mfaEnabled
            ? `MFA enabled${m.mfaMethod ? ` · ${MFA_METHOD_LABEL[m.mfaMethod]}` : ""}`
            : "MFA not enabled",
        },
      ],
      tags: groups.map(g => ({ label: g.name })),
      // The DS rule for an entity row: the row itself opens the record, and
      // the Eye is the preview. The table's row-click opens the preview, so
      // the two views differ here on purpose.
      actions: [{ label: "Preview", variant: "tertiary", icon: "Eye",
                  onClick: () => setPreviewItem({ type: "member", member: m }) }],
      onClick: () => setDetailView({ type: "member", member: m }),
    }
  }

  /**
   * The second half of "create without inviting": the invitation that was
   * deferred goes out now. `joinedAt` doubles as the invite-sent stamp
   * everywhere this screen reads it, so it moves too — otherwise the row
   * would date the invite to when the contact was created.
   */
  function handleSendInvite(id: string) {
    const now = new Date().toISOString()
    const person = members.find(m => m.id === id)
    // The fixture holds its own copy, and the group and role member lists read
    // from it — leave it behind and they keep showing Pending forever.
    const fixtureCopy = MEMBERS.find(m => m.id === id)
    if (fixtureCopy) { fixtureCopy.status = "invited"; fixtureCopy.joinedAt = now }
    setMembers(ms => ms.map(m => m.id === id ? { ...m, status: "invited", joinedAt: now } : m))
    setDetailView(d => d?.type === "member" && d.member.id === id
      ? { type: "member", member: { ...d.member, status: "invited", joinedAt: now } }
      : d)
    setPreviewItem(p => p?.type === "member" && p.member.id === id
      ? { type: "member", member: { ...p.member, status: "invited", joinedAt: now } }
      : p)
    // Say where they went. Sending from a list filtered to Pending drops the
    // row out of view, and an empty list with no explanation reads as a bug.
    // The filter is the user's — the toast explains, it does not reset it.
    toast.success("Invitation sent", {
      description: `${person ? `${person.email} has` : "They have"} 7 days to accept. Moved to Invited.`,
    })
  }

  function handleToggleSuspend(id: string) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, status: m.status === "suspended" ? "active" : "suspended" } : m))
  }
  function handleRemove(id: string) {
    setMembers(ms => ms.filter(m => m.id !== id))
  }
  function handleMemberUpdate(updated: Member) {
    setMembers(ms => ms.map(m => m.id === updated.id ? updated : m))
    setDetailView(d => d?.type === "member" && d.member.id === updated.id ? { type: "member", member: updated } : d)
  }

  function handleRemoveMemberFromGroup(groupId: string, memberId: string) {
    setGroups(gs => gs.map(g => g.id === groupId
      ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
      : g))
  }

  function handleAddMemberToGroup(groupId: string, memberId: string) {
    setGroups(gs => gs.map(g => g.id === groupId
      ? { ...g, memberIds: [...g.memberIds, memberId] }
      : g))
  }

  function handleRemoveMemberFromRole(roleId: string, memberId: string) {
    setRoles(rs => rs.map(r => r.id === roleId
      ? { ...r, memberIds: r.memberIds.filter(id => id !== memberId) }
      : r))
  }

  // Detail pages
  if (creatingRole) {
    return <NewRoleWizard onCancel={() => setCreatingRole(false)} onCreate={handleRoleCreate} />
  }

  if (creatingGroup) {
    return <CreateGroupWizard onCancel={() => setCreatingGroup(false)} onCreate={handleGroupCreate} />
  }

  if (showInvite) {
    return <InviteWizard onCancel={() => setShowInvite(false)} onSend={handleInvite} />
  }

  if (detailView?.type === "member") {
    const liveMember = members.find(m => m.id === detailView.member.id) ?? detailView.member
    return (
      <MemberDetailPage
        member={liveMember}
        onBack={() => setDetailView(null)}
        onToggleSuspend={handleToggleSuspend}
        onRemove={handleRemove}
        onUpdate={handleMemberUpdate}
        allGroups={groups}
        allRoles={roles}
        onRemoveFromGroup={gid => handleRemoveMemberFromGroup(gid, liveMember.id)}
        onAddToGroup={gid => handleAddMemberToGroup(gid, liveMember.id)}
        onRemoveFromRole={rid => handleRemoveMemberFromRole(rid, liveMember.id)}
        onNavigateToRole={roleId => { setDetailView(null); setTimeout(() => setDetailView({ type: "role", role: roles.find(r => r.id === roleId)! }), 0) }}
        onAssignRole={roleId => setRoles(prev => prev.map(r => r.id === roleId ? { ...r, memberIds: [...r.memberIds, liveMember.id] } : r))}
        onNavigateToGroup={groupId => { setDetailView(null); setTimeout(() => setDetailView({ type: "group", group: groups.find(g => g.id === groupId)! }), 0) }}
        onSendInvite={handleSendInvite}
      />
    )
  }
  if (detailView?.type === "role") {
    const dRole = roles.find(r => r.id === detailView.role.id) ?? detailView.role
    return (
      <>
        <RoleDetailPage
          role={dRole}
          onBack={() => setDetailView(null)}
          onDelete={!dRole.system ? () => { setRoles(prev => prev.filter(r => r.id !== dRole.id)); setDetailView(null) } : undefined}
          onMemberClick={m => setDetailView({ type: "member", member: m })}
          allRoles={roles}
          onRemoveMember={mid => handleRemoveMemberFromRole(dRole.id, mid)}
        />
      </>
    )
  }
  if (detailView?.type === "group") {
    const dGroup = groups.find(g => g.id === detailView.group.id) ?? detailView.group
    return (
      <GroupDetailPage
        group={dGroup}
        onBack={() => setDetailView(null)}
        onMemberClick={m => setDetailView({ type: "member", member: m })}
        allGroups={groups}
        onRemoveMember={mid => handleRemoveMemberFromGroup(dGroup.id, mid)}
      />
    )
  }

  // List screen
  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="People & Access"
          description={
            mainTab === "members" ? `${counts.all} members · Avance Financial workspace`
            : mainTab === "roles"  ? `${roles.length} roles · ${roles.filter(r => !r.system).length} custom`
            : `${GROUPS.length} groups · manage shared access across the workspace`
          }
          // primaryAction takes an action object since #85 — Header picks the
          // variant itself, which is why no screen writes variant="main" any
          // more. Same three actions, same handlers.
          primaryAction={
            mainTab === "members"
              ? { label: "Invite member", icon: Icons.UserPlus,  onClick: () => setShowInvite(true) }
              : mainTab === "roles"
              ? { label: "New role",      icon: Icons.ShieldPlus, onClick: () => setCreatingRole(true) }
              : { label: "New group",     icon: Icons.FolderPlus, onClick: () => setCreatingGroup(true) }
          }
        />
      )}
    >
      {/* Main tab switcher */}
      <Tabs
        items={[
          // No counts in the label: a four-digit tenant pushes the tab past
          // its track and breaks the row, and the number is already on the
          // page — the header line says it and the list shows it.
          { id: "members", label: "Members" },
          { id: "roles",   label: "Roles"   },
          { id: "groups",  label: "Groups"  },
        ]}
        activeId={mainTab}
        onChange={v => setMainTab(v as "members" | "roles" | "groups")}
        size="m"
      />

      {/* Filters row */}
      {mainTab === "members" && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Filters
            showSearch
            searchPlaceholder="Search members…"
            searchValue={query}
            onSearchChange={setQuery}
            slots={[statusSlot]}
            showAllFilters={false}
            showSort={false}
            showViewToggle
            viewMode={membersView}
            onViewModeChange={setMembersView}
          />
        </div>
      )}

      {/* Members view — list */}
      {mainTab === "members" && membersView === "list" && (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Icons.UserSearch}
              title="No members found"
              description="Try adjusting your filters or search term."
              ctaLabel="Clear filters"
              onCta={() => { setQuery(""); setStatusFilter("all") }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(m => (
                <CardContainer key={m.id} size="sm" className="!p-0 overflow-hidden">
                  <EntityList items={[memberAsEntity(m)]} />
                </CardContainer>
              ))}
            </div>
          )}
          {filtered.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
              Showing {filtered.length} of {members.length} members
            </div>
          )}
        </>
      )}

      {/* Members view — grid (the table) */}
      {mainTab === "members" && membersView === "grid" && (
        <>
          <CardContainer className={`!p-0 overflow-hidden ${TABLE_CARD}`}>
            <div style={{
              padding: "10px 20px 10px 68px", display: "flex", alignItems: "center", gap: 14,
              background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
              fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              {/* EVERY column flexes. Making only Member flexible moved the gap
                  instead of removing it: the surplus then pooled between the
                  email and Department while the five columns after it stayed
                  clamped together on the right. Each track takes a share now,
                  so a wider screen widens the whole row evenly. Header and rows
                  read the same table, so they cannot drift. */}
              {MEMBER_COLUMNS.map(c => (
                <span key={c.key} style={{ flex: c.flex, minWidth: c.min, textAlign: c.align }}>{c.label}</span>
              ))}
              <span style={{ width: 28, flexShrink: 0 }} />
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.SearchX size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No members match</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try a different filter or search term</div>
              </div>
            ) : (
              filtered.map(m => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onSelect={member => setPreviewItem({ type: "member", member })}
                />
              ))
            )}
          </CardContainer>
          {filtered.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
              Showing {filtered.length} of {members.length} members
            </div>
          )}
        </>
      )}

      {/* Roles view */}
      {mainTab === "roles" && (
        <>
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Filters
              showSearch
              searchPlaceholder="Search roles…"
              searchValue={rolesQuery}
              onSearchChange={setRolesQuery}
              showAllFilters={false}
              showSort={false}
              showViewToggle={false}
            />
          </div>
          {filteredRoles.filter(r => r.system).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
                System roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {filteredRoles.filter(r => r.system).length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {filteredRoles.filter(r => r.system).map(r => (
                  <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
                ))}
              </div>
            </div>
          )}
          {filteredRoles.filter(r => !r.system).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
                Custom roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {filteredRoles.filter(r => !r.system).length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {filteredRoles.filter(r => !r.system).map(r => (
                  <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
                ))}
              </div>
            </div>
          )}
          {filteredRoles.length === 0 && (
            <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Icons.SearchX size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>No roles match</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</div>
            </div>
          )}
        </>
      )}

      {/* Groups view */}
      {mainTab === "groups" && (
        <>
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Filters
              showSearch
              searchPlaceholder="Search groups…"
              searchValue={groupsQuery}
              onSearchChange={setGroupsQuery}
              showAllFilters={false}
              showSort={false}
              showViewToggle={false}
            />
          </div>
          {filteredGroups.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filteredGroups.map(g => (
                <GroupCard key={g.id} group={g} onSelect={group => setPreviewItem({ type: "group", group })} />
              ))}
            </div>
          ) : (
            <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Icons.SearchX size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>No groups match</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</div>
            </div>
          )}
        </>
      )}

      {/* Preview slide-out. The panel's own footer carries the main action —
          it used to be a small secondary Button under each preview's title,
          which read as body content rather than as the panel's CTA. */}
      <SlideOut
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        type="full-slot"
        size="m"
        showClose
        showIcon={false}
        showStatus={false}
        showTopButton={false}
        showTabs={false}
        showSearchBar={false}
        showChips={false}
        resizable={false}
        showCta={!!previewCta}
        showCtaSecondary={false}
        ctaPrimaryLabel={previewCta?.label}
        onCtaPrimary={previewCta?.onClick}
      >
        {previewItem?.type === "member" && (
          <MemberPreview member={previewItem.member} />
        )}
        {previewItem?.type === "role" && (
          <RolePreview
            role={previewItem.role}
            onViewFull={() => { setPreviewItem(null); setDetailView(previewItem) }}
            onMemberClick={m => { setPreviewItem(null); setDetailView({ type: "member", member: m }) }}
          />
        )}
        {previewItem?.type === "group" && (
          <GroupPreview
            group={previewItem.group}
            onViewFull={() => { setPreviewItem(null); setDetailView(previewItem) }}
            onMemberClick={m => { setPreviewItem(null); setDetailView({ type: "member", member: m }) }}
          />
        )}
      </SlideOut>


    </ScreenLayout>
  )
}
