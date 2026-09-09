import { useState, useMemo, type ReactElement } from "react"
import { createPortal } from "react-dom"
import { useFilterDropdown } from "./voice-channel/shared"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Tag }          from "@/components/ui/tag"
import { AvatarCircle } from "@/components/ui/avatar"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Tooltip }      from "@/components/ui/tooltip"
import { AlertBanner }  from "@/components/ui/alert-banner"
import { Tabs }         from "@/components/ui/tabs"
import { Table, type TableColumn } from "@/components/ui/table"
import { InformativeCard, type InformativeCardState } from "@/components/ui/informative-card"
import { TagInput }     from "@/components/ui/tag-input"
import { Radio }        from "@/components/ui/radio"
import { Checkbox }     from "@/components/ui/checkbox"
import { Textarea }     from "@/components/ui/textarea"
import { SlideOut }     from "@/components/ui/slide-out"
import { Filters }     from "@/components/ui/filters"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Chip }        from "@/components/ui/chip"
import { Toggle }      from "@/components/ui/toggle"
import { Stepper, type StepItem } from "@/components/ui/stepper"
import { StepperNavFooter } from "@/components/ui/stepper-nav-footer"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = "active" | "invited" | "suspended"
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
}

interface Role {
  id: string; label: string; system: boolean; color: string; desc: string; memberIds: string[]
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
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Member",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",               department: "Risk & Compliance", mfaEnabled: true,  mfaMethod: "sms",   mfaEnrolledAt: "2025-09-15T00:00:00Z", sessions: [] },
  { id: "ms",  name: "Marcus Silva",     email: "marcus.silva@avance.com",     role: "Member",        status: "suspended", lastActive: "2026-06-30T08:00:00Z", joinedAt: "2025-10-01T00:00:00Z", initials: "MS", avatarColor: "var(--muted-foreground)", title: "Data Scientist",        department: "Analytics",        mfaEnabled: false, sessions: [] },
]

// ─── Permission tree fixture ──────────────────────────────────────────────────

const PERM_TREE: Record<string, PermNode[]> = {
  governance: [
    { id:"gov-drives", label:"Drives", code:"governance.drive", desc:"Manage files and folders within governance drives", state:"g-inh", role:"Manager", scope:"Tenant", locked:true, children:[
      { id:"gov-drives-view",   label:"View Drives",    desc:"Browse and read files within authorized drives",          code:"governance.drive.view",          state:"g-inh",  scope:"Tenant", locked:true },
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
  { id: "workspace-admin",    label: "Workspace Admin",    system: true,  color: "#6366f1", desc: "Full control over workspace settings, members, studios, and billing",                     memberIds: ["tg", "mg", "es"] },  // audit-ignore: prototype fixture data
  { id: "developer",          label: "Developer",          system: true,  color: "#10b981", desc: "Build and deploy integrations, agents, and custom workflows",                            memberIds: ["es", "sb", "dp"] },  // audit-ignore: prototype fixture data
  { id: "viewer",             label: "Viewer",             system: true,  color: "#64748b", desc: "Read-only access across all non-sensitive studio content",                               memberIds: ["at", "fw"] },  // audit-ignore: prototype fixture data
  { id: "agent-builder",      label: "Agent Builder",      system: false, color: "#f97316", desc: "Create and manage AI workers, agentic networks, and workflow definitions",              memberIds: ["sb", "dp"] },  // audit-ignore: prototype fixture data
  { id: "data-steward",       label: "Data Steward",       system: false, color: "#8b5cf6", desc: "Manage model definitions, governance policies, and data lineage graphs",                memberIds: ["mg"] },  // audit-ignore: prototype fixture data
  { id: "compliance-auditor", label: "Compliance Auditor", system: false, color: "#0ea5e9", desc: "Read-only access to audit logs, governance events, data lineage, and access settings", memberIds: [] },  // audit-ignore: prototype fixture data
]

const ROLE_PERM_COUNTS: Record<string, { governance: number; datastudio: number; agentic: number; admin: number; total: number }> = {
  "workspace-admin":    { governance: 6, datastudio: 5, agentic: 7, admin: 10, total: 28 },
  "developer":          { governance: 0, datastudio: 4, agentic: 6, admin: 2,  total: 11 },
  "viewer":             { governance: 2, datastudio: 2, agentic: 1, admin: 2,  total: 8  },
  "agent-builder":      { governance: 0, datastudio: 0, agentic: 7, admin: 0,  total: 7  },
  "data-steward":       { governance: 3, datastudio: 3, agentic: 0, admin: 1,  total: 7  },
  "compliance-auditor": { governance: 2, datastudio: 2, agentic: 1, admin: 3,  total: 8  },
}

const ROLE_COLORS = [
  "#6366f1", "#10b981", "#f97316", "#0ea5e9", // audit-ignore: preset color swatches for role form
  "#8b5cf6", "#ef4444", "#f59e0b", "#64748b", // audit-ignore: preset color swatches for role form
]

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


// ─── Display helpers ──────────────────────────────────────────────────────────

// Tag carries the colour now. A status is a state, so it gets the semantic
// range — except Suspended, which is NEUTRAL and not error: a suspended
// account is a decision someone made, not a failure.
const STATUS_TAG: Record<MemberStatus, "success" | "informative" | "neutral"> = {
  active:    "success",
  invited:   "informative",
  suspended: "neutral",
}
const STATUS_LABEL: Record<MemberStatus, string> = {
  active:    "Active",
  invited:   "Invited",
  suspended: "Suspended",
}
// Graded by reach, not by risk: the more a type can do, the louder the tag.
const USER_TYPE_TAG: Record<UserType, "error" | "alert" | "neutral"> = {
  "Owner":  "error",
  "Admin":  "alert",
  "Member": "neutral",
}

// Studios are categories, not states, so they take the non-status variants —
// success or alert would read as "this studio is healthy", which is not a
// thing a studio can be.
const STUDIO_TAG: Record<string, "limeGreen" | "purple" | "lightBlue" | "informative"> = {
  governance: "limeGreen",
  datastudio: "purple",
  agentic:    "lightBlue",
  admin:      "informative",
}
// HighlightIcon carries the same categorical colour as the studio's Tag, so a
// studio reads the same whether it appears as an icon or as a tag.
const STUDIO_HI: Record<string, "lime" | "purple" | "light-blue" | "informative"> = {
  governance: "lime",
  datastudio: "purple",
  agentic:    "light-blue",
  admin:      "informative",
}
// A role is a category, not a status — so it takes the non-semantic palette.
// The semantic range stays reserved for actual state (see STATUS_TAG).
const ROLE_HI: Record<string, "informative" | "lime" | "neutral" | "yellow" | "purple" | "light-blue"> = {
  "workspace-admin":    "informative",
  "developer":          "lime",
  "viewer":             "neutral",
  "agent-builder":      "yellow",
  "data-steward":       "purple",
  "compliance-auditor": "light-blue",
}
// A CardContainer that wraps a TABLE must not glow on hover — the rows own the
// hover feedback, and an outer shadow on a table reads as the whole table
// being hoverable. Cancels the variant's hover border-width, colour and shadow.
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
        background: "none", border: "none", cursor: "pointer",
        padding: "4px 0", marginBottom: 4,
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

function DetailTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: "flex", marginBottom: 0, overflowX: "auto", scrollbarWidth: "none" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          style={{
            padding: "8px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
            border: "none", background: "none", cursor: "pointer",
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


function PermTreeNode({ node, depth = 0 }: { node: PermNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const hasChildren = (node.children?.length ?? 0) > 0

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
            {node.role && (
              <Tooltip side="cursor" content={`Inherited from the ${node.role} role, not granted directly`}>
                <Tag variant="neutral" size="sm">via {node.role}</Tag>
              </Tooltip>
            )}
            {node.scope && (
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {node.scope}</span>
            )}
          </div>
          {node.desc && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{node.desc}</div>
          )}
        </div>
        <Toggle checked disabled size="sm" />
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <PermTreeNode key={child.id} node={child} depth={depth + 1} />
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

function RolePermissionsPanel({ role }: { role: Role }) {
  const [mode, setMode] = useState<PermMode>("audit")
  const [studio, setStudio] = useState("governance")
  const [overrides, setOverrides] = useState<PermOverrides>({})
  const [scopeOverrides, setScopeOverrides] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [savedSummary, setSavedSummary] = useState<{ total: number; pinned: number; added: number; removed: number } | null>(null)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [saveStep, setSaveStep] = useState<null | 0 | 1>(null)

  const nodes = buildRoleNodes(studio, role.id)
  const isDirty = Object.keys(overrides).length > 0 || Object.keys(scopeOverrides).length > 0
  const canEdit = !role.system

  function changeScopeOverride(id: string, scope: string) {
    setScopeOverrides(prev => ({ ...prev, [id]: scope }))
    setSaved(false)
  }

  function togglePermission(id: string, on: boolean) {
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
        const target = findNode(nodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) {
          if (node.state === "g-direct") delete copy[node.id]
          else copy[node.id] = "g-direct"
        }
      } else {
        const target = findNode(nodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) delete copy[node.id]
      }
      return copy
    })
    setSaved(false)
  }

  function confirmDiscard() {
    setShowDiscardModal(false); setOverrides({}); setScopeOverrides({}); setMode("audit"); setSaved(false)
  }
  function confirmSave() {
    // Counts are captured BEFORE the reset — after it there is nothing to count,
    // and a confirmation that cannot say what changed is not a confirmation.
    setSavedSummary({ total: changedNodes.length, pinned: 0, added: addedNodes.length, removed: removedNodes.length })
    setSaveStep(null); setOverrides({}); setScopeOverrides({}); setMode("audit"); setSaved(true)
  }

  const allNodes   = nodes.flatMap(n => [n, ...(n.children ?? [])])
  const changedNodes  = allNodes.filter(n => overrides[n.id] !== undefined && overrides[n.id] !== n.state)
  const addedNodes   = changedNodes.filter(n => GRANTED_STATES.includes(overrides[n.id]!))
  const removedNodes = changedNodes.filter(n => !GRANTED_STATES.includes(overrides[n.id]!))
  const allGranted   = allNodes.filter(n => GRANTED_STATES.includes(n.state))
  const visibleNodes = mode === "audit" ? filterGrantedTree(nodes) : nodes

  const saveSteps: StepItem[] = [
    { label: "Review changes", state: saveStep === 0 ? "active" : saveStep === 1 ? "completed" : "default" },
    { label: "Confirm",        state: saveStep === 1 ? "active" : "default" },
  ]

  return (
    <div style={{ paddingBottom: mode === "edit" ? 80 : 0 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {STUDIO_TABS.map(s => (
            <button key={s.id} onClick={() => setStudio(s.id)} style={{
              padding: "4px 10px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer",
              color: studio === s.id ? "var(--foreground)" : "var(--muted-foreground)",
              borderBottom: studio === s.id ? "2px solid var(--primary)" : "2px solid transparent",
            }}>
              {s.label}
            </button>
          ))}
        </div>
        {mode === "audit" && canEdit && (
          <Button variant="secondary" size="sm" onClick={() => setMode("edit")}>
            <Icons.Pencil size={13} style={{ marginRight: 4 }} />
            Edit permissions
          </Button>
        )}
        {mode === "audit" && !canEdit && (
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Lock size={11} /> System role · read only
          </span>
        )}
      </div>

      {/* Applying permissions is a governed write, so it is confirmed
          explicitly and the confirmation stays until it is dismissed. */}
      {saved && savedSummary && (
        <div style={{ marginBottom: 16 }}>
          <AlertBanner
            state="success"
            title={`${savedSummary.total} permission${savedSummary.total === 1 ? "" : "s"} updated`}
            description={[
              savedSummary.added   > 0 ? `${savedSummary.added} granted`   : null,
              savedSummary.removed > 0 ? `${savedSummary.removed} revoked` : null,
            ].filter(Boolean).join(" · ") + ". Takes effect on the next action in this role."}
            onClose={() => { setSaved(false); setSavedSummary(null) }}
          />
        </div>
      )}

      {/* Stats row — only in tree view */}
      {saveStep === null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Chip variant="secondary" size="s">{allGranted.length} granted</Chip>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {allGranted.length} permission{allGranted.length !== 1 ? "s" : ""} this role grants
          </span>
          {mode === "audit" && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Eye size={11} /> View only
            </span>
          )}
        </div>
      )}

      {/* Tree */}
      {saveStep === null && (
        <div>
          {mode === "audit"
            ? visibleNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
            : visibleNodes.map(n => <EditablePermTreeNode key={n.id} node={n} depth={0} overrides={overrides} onToggle={togglePermission} mode={mode} scopeOverrides={scopeOverrides} onScopeChange={changeScopeOverride} />)
          }
          {visibleNodes.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "20px 0", textAlign: "center" }}>
              {mode === "audit" ? "This role grants no permissions yet." : "No permissions available."}
            </div>
          )}
        </div>
      )}

      {/* Inline save review */}
      {saveStep !== null && (() => {
        const effectiveScope = (n: PermNode) => scopeOverrides[n.id] ?? n.scope ?? "Own"
        function renderDiffSection(
          items: PermNode[], header: string, bgMix: string, icon: ReactElement
        ) {
          if (items.length === 0) return null
          const itemIds = new Set(items.map(n => n.id))
          type DiffGroup = { parent: PermNode; parentInItems: boolean; children: PermNode[] }
          const groups: DiffGroup[] = []
          for (const root of nodes) {
            const pi = itemIds.has(root.id)
            const ci = (root.children ?? []).filter(c => itemIds.has(c.id))
            if (pi || ci.length > 0) groups.push({ parent: root, parentInItems: pi, children: ci })
          }
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {icon}
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-title)", textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {header}
                </span>
                <Tag variant="neutral" size="sm">{items.length}</Tag>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {groups.map(({ parent, parentInItems, children }) => (
                  <div key={parent.id}>
                    {parentInItems ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: bgMix }}>
                        {icon}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{parent.label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {effectiveScope(parent)}</span>
                      </div>
                    ) : (
                      <div style={{ padding: "4px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>{parent.label}</span>
                      </div>
                    )}
                    {children.map(child => (
                      <div key={child.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 28px", borderRadius: 6, marginTop: 2, background: bgMix }}>
                        <Icons.CornerDownRight size={10} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                        {icon}
                        <span style={{ fontSize: 12, color: "var(--foreground)" }}>{child.label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {effectiveScope(child)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ marginBottom: 20 }}><Stepper steps={saveSteps} /></div>
            {saveStep === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {renderDiffSection(addedNodes, "New access", "color-mix(in srgb, #22c55e 8%, transparent)" /* audit-ignore */, <Icons.Plus size={11} color="var(--color-text-success, #22c55e)" /* audit-ignore */ />)}
                {renderDiffSection(removedNodes, "Access removed", "color-mix(in srgb, #ef4444 8%, transparent)" /* audit-ignore */, <Icons.Minus size={11} color="var(--error, #ef4444)" /* audit-ignore */ />)}
                {changedNodes.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", padding: "16px 0" }}>No changes to review.</div>
                )}
              </div>
            )}
            {saveStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <Icons.ShieldCheck size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                      {changedNodes.length} permission{changedNodes.length !== 1 ? "s" : ""} will change
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {addedNodes.length > 0 && `${addedNodes.length} new`}
                      {addedNodes.length > 0 && removedNodes.length > 0 && " · "}
                      {removedNodes.length > 0 && `${removedNodes.length} removed`}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "4px 2px" }}>
                  Changes apply to all members assigned this role. They take effect immediately.
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* StepperNavFooter portal */}
      {mode === "edit" && createPortal(
        <div style={{
          position: "fixed", bottom: 0, left: 56, right: 0, zIndex: 200,
          background: "var(--step-nav-footer-bg, var(--canvas))",
          borderTop: "1px solid var(--step-nav-footer-separator, var(--border))",
        }}>
          <StepperNavFooter
            variant={saveStep === null || saveStep === 0 ? "cancel-next" : "back-next"}
            cancelLabel={saveStep === null ? "Discard" : "Keep editing"}
            onCancel={saveStep === null ? () => setShowDiscardModal(true) : () => setSaveStep(null)}
            onBack={() => setSaveStep(0)}
            nextLabel={saveStep === null ? "Save changes" : saveStep === 0 ? "Review & confirm" : "Apply changes"}
            nextDisabled={saveStep === null ? !isDirty : changedNodes.length === 0}
            onNext={saveStep === null ? () => setSaveStep(0) : saveStep === 0 ? () => setSaveStep(1) : confirmSave}
          />
        </div>,
        document.body
      )}

      {/* Discard modal */}
      <ModalDialog
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        tone="warning"
        iconName="AlertTriangle"
        title="Discard changes?"
        description="Your permission edits will be lost. This can't be undone."
        ctaPrimary={{ label: "Discard changes", destructive: true, onClick: confirmDiscard }}
        ctaSecondary={{ label: "Keep editing", onClick: () => setShowDiscardModal(false) }}
      />
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

const ACTION_TAG: Record<AuditAction, "informative" | "lightBlue" | "limeGreen" | "yellow" | "purple" | "neutral"> = {
  Login:      "informative",
  Update:     "lightBlue",
  Create:     "limeGreen",
  Delete:     "yellow",
  Permission: "purple",
  Group:      "neutral",
  Export:     "neutral",
}

const ACTION_FILTERS: Array<AuditAction | "All"> = ["All", "Login", "Update", "Create", "Permission", "Group"]
const RESULT_FILTERS: Array<AuditResult | "All"> = ["All", "Success", "Failed"]

function AuditUserAvatar({ name }: { name: string }) {
  // AvatarCircle hashes the name to a token colour, so a person keeps the same
  // avatar colour here as everywhere else in the product.
  const initials = name === "System" ? "SY" : name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  return <AvatarCircle name={name} initials={initials} sizeKey="md" />
}

function AuditRow({ ev, isLast }: { ev: AuditEvent; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "grid", gridTemplateColumns: "20px 150px 160px 104px 130px 1fr 96px 60px",
          padding: "10px 8px", cursor: "pointer", gap: 10, alignItems: "center",
          background: expanded ? "var(--table-row-hover-bg)" : "transparent",
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "var(--table-row-hover-bg)" }}
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
        {/* Action */}
        <Tag variant={ACTION_TAG[ev.action] ?? "neutral"} size="sm" className="w-fit">{ev.action}</Tag>
        {/* Resource */}
        <span style={{ fontSize: 11, color: "var(--foreground)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.resource}</span>
        {/* Description */}
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.description}</span>
        {/* Result — the one genuinely semantic column, so it keeps success/error */}
        <Tag
          variant={ev.result === "Success" ? "success" : "error"}
          size="sm"
          className="w-fit"
          leadingIcon={ev.result === "Success" ? <Icons.Check size={11} /> : <Icons.X size={11} />}
        >
          {ev.result}
        </Tag>
        {/* Source */}
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", textAlign: "right" }}>
          {ev.source === "UI" ? <><Icons.Monitor size={11} style={{ display: "inline", marginRight: 3 }} />UI</>
           : ev.source === "API" ? <><Icons.Code size={11} style={{ display: "inline", marginRight: 3 }} />API</>
           : "System"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--border)", padding: "14px 8px 16px 38px" }}>
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
      {/* Toolbar — Filters owns the search, the two slots and their menus.
          The two raw <select>s this replaces are exactly what the component
          exists to stop: a select is three lines and works, which is why
          screens keep reaching for it. */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Filters
            showSearch
            searchPlaceholder="Search events, resources…"
            searchValue={search}
            onSearchChange={setSearch}
            slots={[
              {
                placeholder: "Action",
                value:   actionFilter === "All" ? undefined : actionFilter,
                options: ACTION_FILTERS as string[],
                onSelect: v => setActionFilter(v as AuditAction | "All"),
                onRemove: actionFilter === "All" ? undefined : () => setActionFilter("All"),
              },
              {
                placeholder: "Result",
                value:   resultFilter === "All" ? undefined : resultFilter,
                options: RESULT_FILTERS as string[],
                onSelect: v => setResultFilter(v as AuditResult | "All"),
                onRemove: resultFilter === "All" ? undefined : () => setResultFilter("All"),
              },
            ]}
            showClearFilters={actionFilter !== "All" || resultFilter !== "All" || search !== ""}
            onClearFilters={() => { setActionFilter("All"); setResultFilter("All"); setSearch("") }}
            // An audit log is chronological and has one view. Filters turns
            // these on by default; leaving them would put three controls in the
            // bar that do nothing.
            showAllFilters={false}
            showSort={false}
            showViewToggle={false}
          />
        </div>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
        <Button variant="secondary" size="default"><Icons.Download size={13} />Export</Button>
      </div>

      {/* Table */}
      <CardContainer className={`!p-0 overflow-hidden ${TABLE_CARD}`}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "20px 150px 160px 104px 130px 1fr 96px 60px",
          padding: "10px 8px", gap: 10,
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
      </CardContainer>
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
                {!confirmReset ? (
                  <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>Reset MFA enrollment</Button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--badge-error)", fontWeight: 600 }}>
                      Remove their MFA device? They'll re-enroll on next login.
                    </span>
                    <Button variant="warning" size="sm" onClick={() => { onUpdate({ ...member, mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined }); setConfirmReset(false) }}>Yes, reset</Button>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
                  </div>
                )}
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

const USER_TYPE_OPTIONS: UserType[] = ["Owner", "Admin", "Member"]

function MemberDetailPage({
  member, onBack, onToggleSuspend, onRemove, onUpdate,
}: {
  member: Member
  onBack: () => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (m: Member) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
    >
      <BackBreadcrumb onBack={onBack} />

      {/* Removing a member is irreversible and the answer is yes or no — that is
          a ModalDialog, not a panel the page can scroll past. `warning`, not
          `error`: the person still exists, they lose access to this workspace. */}
      <ModalDialog
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        tone="warning"
        iconName="UserMinus"
        title={`Remove ${member.name} from the workspace?`}
        description={`${member.name} will immediately lose access to every studio, role and group in Avance Financial. Their audit history is kept.`}
        informativeCard="This cannot be undone. Re-adding them requires a new invitation."
        ctaPrimary={{ label: "Remove member", destructive: true, onClick: () => { setConfirmRemove(false); onRemove(member.id); onBack() } }}
        ctaSecondary={{ label: "Cancel", onClick: () => setConfirmRemove(false) }}
      />

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginTop: 16, alignItems: "start" }}>

        {/* Left: identity card — sticky so it stays readable while the
            right-hand column scrolls. top = header zone + breathing room. */}
        <CardContainer className="!p-0 overflow-hidden sticky top-[16px] self-start">
          {/* Avatar + name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "28px 24px 20px",
          }}>
            <div style={{ opacity: member.status === "suspended" ? 0.6 : 1 }}>
              <AvatarCircle name={member.name} initials={member.initials} sizeKey="xxl"
                avatarStyle={isActive ? "text" : "empty"} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                {member.name}
              </div>
              {(member.title || member.department) && (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>
                  {member.title}{member.title && member.department ? " · " : ""}{member.department}
                </div>
              )}
              <Tag variant={isActive ? "success" : member.status === "suspended" ? "alert" : "secondary"}>
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

            {/* User Type — read-only */}
            <InfoRow icon={<Icons.ShieldCheck size={14} />} label="User Type" value={member.role} />
          </div>

          {/* Divider after info */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Action buttons */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {isInvited ? (
              <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => alert(`Invite resent to ${member.email}`)}>
                <Icons.RefreshCw size={13} /> Resend invite
              </Button>
            ) : (
              <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { onToggleSuspend(member.id); onBack() }}>
                {isActive ? <><Icons.UserX size={13} /> Suspend access</> : <><Icons.UserCheck size={13} /> Reactivate account</>}
              </Button>
            )}
            <Button variant="warning" size="sm" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setConfirmRemove(true)}>
              <Icons.Trash2 size={13} /> Remove from workspace
            </Button>
          </div>
        </CardContainer>

        {/* Right: tabs */}
        <div>
          <DetailTabs
            tabs={["Apps", "Roles", "Groups", "Permissions", "Resources", "Security", "Activity"]}
            active={activeTab}
            onChange={setActiveTab}
          />
          <div style={{ marginTop: 20 }}>
            {activeTab === 0 && <AppsPanel member={member} />}
            {activeTab === 1 && <MemberRolesPanel member={member} />}
            {activeTab === 2 && <MemberGroupsPanel member={member} />}
            {activeTab === 3 && <MemberPermissionsPanel member={member} />}
            {activeTab === 4 && <ResourcesPanel member={member} />}
            {activeTab === 5 && <SecurityPanel member={member} onUpdate={onUpdate} />}
            {activeTab === 6 && <ActivityPanel />}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}


// ─── Apps tab ─────────────────────────────────────────────────────────────────

function StudioPermissionsView({ studioId, onBack }: { studioId: string; onBack: () => void }) {
  const meta = STUDIO_META[studioId]
  const nodes = PERM_TREE[studioId] ?? []
  const granted = filterGrantedTree(nodes)
  const directCount = granted.flatMap(n => [n, ...(n.children ?? [])]).filter(n => n.state === "g-direct").length
  const inhCount = granted.flatMap(n => [n, ...(n.children ?? [])]).filter(n => n.state === "g-inh").length

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Button variant="secondary" size="sm" onClick={onBack}>
          <Icons.ChevronLeft size={13} /> Apps
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HighlightIcon size="sm" variant={STUDIO_HI[studioId] ?? "neutral"} icon={meta?.icon} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{meta?.label} — Permissions</span>
        </div>
      </div>
      <CardContainer size="sm" className="flex gap-[16px] mb-[14px]">
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <strong style={{ color: "var(--foreground)" }}>{directCount}</strong> direct
        </span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <strong style={{ color: "var(--foreground)" }}>{inhCount}</strong> via role
        </span>
      </CardContainer>
      {granted.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--muted-foreground)" }}>
          No permissions granted in this studio.
        </div>
      ) : (
        <CardContainer className="!p-0 overflow-hidden">
          {granted.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)}
        </CardContainer>
      )}
    </div>
  )
}

function AppsPanel({ member }: { member: Member }) {
  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))
  const studioSet = new Set<string>(member.role === "Owner" || member.role === "Admin" ? Object.keys(STUDIO_META) : [])
  memberGroups.forEach(g => g.studios.forEach(s => studioSet.add(s)))
  const [studios, setStudios] = useState(Array.from(studioSet))
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null)
  const [grantOpen, setGrantOpen] = useState(false)
  const [removingStudio, setRemovingStudio] = useState<string | null>(null)

  const allAssigned = studios.length >= Object.keys(STUDIO_META).length
  const available = Object.entries(STUDIO_META).filter(([id]) => !studios.includes(id))

  function confirmRemove() {
    if (removingStudio) {
      setStudios(p => p.filter(id => id !== removingStudio))
      setRemovingStudio(null)
    }
  }

  const removingMeta = removingStudio ? STUDIO_META[removingStudio] : null

  // ── Remove confirmation modal ─────────────────────────────────────────────
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

  // ── Grant access modal (DS ModalDialog, content variant) ──────────────────
  const grantModal = (
    <ModalDialog
      isOpen={grantOpen}
      onClose={() => setGrantOpen(false)}
      variant="content"
      tone="default"
      iconName="KeyRound"
      title="Grant studio access"
      description="Select a studio to give this member access. You can configure individual permissions after granting."
      showClose
      slot={
        available.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", padding: "8px 0" }}>
            Member already has access to all available studios.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {available.map(([id, meta]) => (
              <CardContainer key={id} size="sm" className="flex items-center gap-[12px]">
                <HighlightIcon size="md" variant={STUDIO_HI[id] ?? "neutral"} icon={meta.icon} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{meta.desc}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setStudios(p => [...p, id]); setGrantOpen(false) }}
                >
                  Grant
                </Button>
              </CardContainer>
            ))}
          </div>
        )
      }
    />
  )

  if (selectedStudio) {
    return (
      <>
        <StudioPermissionsView studioId={selectedStudio} onBack={() => setSelectedStudio(null)} />
        {removeModal}
      </>
    )
  }

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
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <Icons.AppWindow size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No studio access</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Grant access to a studio to configure this member's permissions.</div>
        </div>
      </>
    )
  }

  return (
    <>
      {removeModal}
      {grantModal}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Only show Grant access when there are still studios left to add */}
        {!allAssigned && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <Button variant="secondary" size="sm" onClick={() => setGrantOpen(true)}>
              <Icons.Plus size={13} /> Grant access
            </Button>
          </div>
        )}
        {studios.map(s => {
          const meta = STUDIO_META[s]
          if (!meta) return null
          const via = memberGroups.filter(g => g.studios.includes(s)).map(g => g.name)
          return (
            <CardContainer
              key={s}
              size="sm"
              onClick={() => setSelectedStudio(s)}
              className="flex items-center gap-[16px]"
            >
              <HighlightIcon size="md" variant={STUDIO_HI[s] ?? "neutral"} icon={meta.icon} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{meta.desc}</div>
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <Tooltip side="cursor" content={`${member.name} has active access to ${meta.label}`}>
                  <Tag variant="success" size="sm">Active</Tag>
                </Tooltip>
                {via.length > 0 && (
                  <div style={{ display: "flex", gap: "8px 4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {via.slice(0, 2).map(v => (
                      <Tooltip key={v} side="cursor" content={`Access granted through the ${v} group, not directly`}>
                        <Tag variant="neutral" size="sm">via {v}</Tag>
                      </Tooltip>
                    ))}
                    {via.length > 2 && (
                      <Tooltip side="cursor" content={via.slice(2).join(" · ")}>
                        <Tag variant="neutral" size="sm">+{via.length - 2} more</Tag>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <Tooltip side="cursor" content={`Remove access to ${meta.label}`}>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={e => { e.stopPropagation(); setRemovingStudio(s) }}
                    aria-label={`Remove access to ${meta.label}`}
                  >
                    <Icons.Trash2 size={12} />
                  </Button>
                </Tooltip>
                <Icons.ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
              </div>
            </CardContainer>
          )
        })}
        {/* Footer note when all studios are assigned */}
        {allAssigned && (
          <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: "var(--muted-foreground)" }}>
            This member has access to all available studios.
          </div>
        )}
      </div>
    </>
  )
}

// ─── Roles tab ────────────────────────────────────────────────────────────────

function MemberRolesPanel({ member }: { member: Member }) {
  const assignedRoles = ROLES.filter(r => r.memberIds.includes(member.id))

  if (assignedRoles.length === 0) {
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
        <Icons.Shield size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No roles assigned</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Permissions are inherited from the member's user type only.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {assignedRoles.map(role => {
        const perms = ROLE_PERM_COUNTS[role.id] ?? { total: 0 }
        return (
          <CardContainer key={role.id} size="sm" className="flex items-center gap-[14px]">
            <HighlightIcon size="md" variant={ROLE_HI[role.id] ?? "neutral"} iconName="Shield" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{role.label}</span>
                {role.system && <Tag variant="neutral" size="sm">System</Tag>}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{role.desc}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                {perms.total} permission{perms.total !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                Assigned by Admin · 14 days ago
              </div>
            </div>
          </CardContainer>
        )
      })}
    </div>
  )
}

// ─── Groups tab ───────────────────────────────────────────────────────────────

function MemberGroupsPanel({ member }: { member: Member }) {
  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))

  if (memberGroups.length === 0) {
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
        <Icons.Users size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Not in any groups</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Groups define shared studio access and can be used to batch-assign permissions.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {memberGroups.map(group => (
        <CardContainer key={group.id} size="sm" className="flex items-center gap-[14px]">
          {/* A group is a group of people — avatar, not an icon (CLAUDE.md visual rule) */}
          <AvatarCircle name={group.name} initials={group.name.slice(0, 2).toUpperCase()} sizeKey="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""} · {group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}
            </div>
          </div>
          {/* Studio tags run along the row, not down it. The 180px cap forced
              three tags into three lines and left the rest of the row empty. */}
          <div style={{ display: "flex", gap: "8px 4px", flexShrink: 1, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
            {group.studios.slice(0, 3).map(s => (
              <Tag key={s} variant={STUDIO_TAG[s] ?? "neutral"} size="sm">{STUDIO_META[s]?.label ?? s}</Tag>
            ))}
            {group.studios.length > 3 && (
              <Tag variant="neutral" size="sm">+{group.studios.length - 3}</Tag>
            )}
          </div>
        </CardContainer>
      ))}
    </div>
  )
}

// ─── Permissions tab (dual-mode: Audit / Edit) ───────────────────────────────

const GRANTED_STATES: PermState[] = ["g-direct", "g-inh"]
const SCOPE_ITEMS: Array<{ id: string; label: string }> = [
  { id: "Own",    label: "Own" },
  { id: "Team",   label: "Team" },
  { id: "Tenant", label: "Tenant" },
]

function filterGrantedTree(nodes: PermNode[]): PermNode[] {
  return nodes.flatMap(n => {
    const grantedChildren = n.children ? filterGrantedTree(n.children) : []
    const isGranted = GRANTED_STATES.includes(n.state)
    if (!isGranted && grantedChildren.length === 0) return []
    return [{ ...n, children: grantedChildren }]
  })
}

type PermMode = "audit" | "edit"
type PermOverrides = Record<string, PermState>

function EditablePermTreeNode({ node, depth, overrides, onToggle, mode, scopeOverrides, onScopeChange }: {
  node: PermNode; depth: number; overrides: PermOverrides; onToggle: (id: string, on: boolean) => void
  mode: PermMode; scopeOverrides: Record<string, string>; onScopeChange: (id: string, scope: string) => void
}) {
  const effective = overrides[node.id] !== undefined ? overrides[node.id] : node.state
  // Toggle = "is directly granted?" — g-inh alone does NOT turn the toggle ON
  const isDirect      = effective === "g-direct"
  const isInheritedOnly = node.state === "g-inh" && effective !== "g-direct"
  const isPinned      = node.state === "g-inh" && effective === "g-direct"
  const hasOverride   = overrides[node.id] !== undefined && overrides[node.id] !== node.state
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren   = node.children && node.children.length > 0

  // Row background: pinned/override → primary tint; inherited-only → blue-ish surface hint
  const rowBg = isPinned || (hasOverride && !isInheritedOnly)
    ? "color-mix(in srgb, var(--primary) 4%, transparent)"
    : isInheritedOnly
      ? "color-mix(in srgb, var(--primary) 2%, transparent)"
      : "transparent"
  const rowBgHover = isPinned || (hasOverride && !isInheritedOnly)
    ? "color-mix(in srgb, var(--primary) 6%, transparent)"
    : isInheritedOnly
      ? "color-mix(in srgb, var(--primary) 4%, transparent)"
      : "var(--accent)"

  return (
    <div>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: `8px 16px 8px ${16 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          cursor: hasChildren ? "pointer" : "default",
          background: rowBg,
        }}
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = rowBgHover }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg }}
      >
        <div style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 3 }}>
          {hasChildren
            ? expanded
              ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" />
              : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />
            : null}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: depth === 0 ? 600 : 400, color: "var(--foreground)" }}>{node.label}</span>
            {node.role && (
              <Tooltip side="cursor" content={`Inherited from the ${node.role} role, not granted directly`}>
                <Tag variant="neutral" size="sm">via {node.role}</Tag>
              </Tooltip>
            )}
            {/* Static scope badge — audit mode only; edit mode shows SwitchTab below */}
            {node.scope && mode !== "edit" && (
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {node.scope}</span>
            )}
            {isPinned && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Pinned</span>
            )}
            {hasOverride && !isPinned && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Modified</span>
            )}
          </div>
          {node.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{node.desc}</div>}
          {isInheritedOnly && (
            <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1, fontStyle: "italic" }}>
              Inherited via role · toggle to confirm direct access
            </div>
          )}
        </div>

        {/* Control cluster — scope, then a hairline, then the toggle. The scope
            chips used to sit under the label, which added ~26px to every row
            and left the entire right half of the tree empty. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, paddingTop: 1 }}>
          {mode === "edit" && (
            <>
              <div
                role="group"
                aria-label={`Scope for ${node.label}`}
                style={{ display: "flex", gap: 4, opacity: isDirect ? 1 : 0.35, pointerEvents: isDirect ? "auto" : "none" }}
                onClick={e => e.stopPropagation()}
              >
                {SCOPE_ITEMS.map(item => {
                  const active = (scopeOverrides[node.id] ?? node.scope ?? "Own") === item.id
                  return (
                    <Chip
                      key={item.id}
                      size="s"
                      variant={active ? "primary" : "secondary"}
                      onClick={() => onScopeChange(node.id, item.id)}
                    >
                      {item.label}
                    </Chip>
                  )
                })}
              </div>
              <span aria-hidden style={{ width: 1, height: 20, background: "var(--field-border)", flexShrink: 0 }} />
            </>
          )}
          <span onClick={e => e.stopPropagation()}>
            <Toggle
              checked={isDirect}
              disabled={node.locked && node.state !== "g-inh"}
              size="sm"
              onChange={on => { onToggle(node.id, on) }}
            />
          </span>
        </div>
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <EditablePermTreeNode key={child.id} node={child} depth={depth + 1} overrides={overrides} onToggle={onToggle}
          mode={mode} scopeOverrides={scopeOverrides} onScopeChange={onScopeChange} />
      ))}
    </div>
  )
}

// Prototype: current session user is Platform Owner → can edit any member's permissions.
// In production this would come from the authenticated user's role/scope check.
const CURRENT_USER_CAN_EDIT_PERMISSIONS = true

function MemberPermissionsPanel({ member: _member }: { member: Member }) {
  const [mode, setMode] = useState<PermMode>("audit")
  const [studio, setStudio] = useState("governance")
  const [overrides, setOverrides] = useState<PermOverrides>({})
  const [scopeOverrides, setScopeOverrides] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [savedSummary, setSavedSummary] = useState<{ total: number; pinned: number; added: number; removed: number } | null>(null)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [saveStep, setSaveStep] = useState<null | 0 | 1>(null)

  const nodes = PERM_TREE[studio] ?? []
  const isDirty = Object.keys(overrides).length > 0 || Object.keys(scopeOverrides).length > 0

  function changeScopeOverride(id: string, scope: string) {
    setScopeOverrides(prev => ({ ...prev, [id]: scope }))
    setSaved(false)
  }

  function togglePermission(id: string, on: boolean) {
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
        // Grant: set this node + all descendants to g-direct.
        // If a descendant is already natively g-direct, clear its override instead.
        const target = findNode(nodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) {
          if (node.state === "g-direct") {
            delete copy[node.id]
          } else {
            copy[node.id] = "g-direct"
          }
        }
      } else {
        // Revoke: clear this node + all descendants' overrides (cascade off).
        const target = findNode(nodes, id)
        const affected = target ? descendants(target) : [{ id, state: "" } as PermNode]
        for (const node of affected) {
          delete copy[node.id]
        }
      }

      return copy
    })
    setSaved(false)
  }

  function confirmDiscard() {
    setShowDiscardModal(false); setOverrides({}); setScopeOverrides({}); setMode("audit"); setSaved(false)
  }
  function confirmSave() {
    // Counts are captured BEFORE the reset — after it there is nothing to count,
    // and a confirmation that cannot say what changed is not a confirmation.
    setSavedSummary({ total: changedNodes.length, pinned: pinnedNodes.length, added: addedNodes.length, removed: removedNodes.length })
    setSaveStep(null); setOverrides({}); setScopeOverrides({}); setMode("audit"); setSaved(true)
  }

  // Compute changed permissions for the Review step
  const allNodes    = nodes.flatMap(n => [n, ...(n.children ?? [])])
  const changedNodes  = allNodes.filter(n => overrides[n.id] !== undefined && overrides[n.id] !== n.state)
  // Pinned: base was g-inh, now promoted to g-direct
  const pinnedNodes  = changedNodes.filter(n => n.state === "g-inh" && overrides[n.id] === "g-direct")
  // New direct grants (base was "")
  const addedNodes   = changedNodes.filter(n => n.state !== "g-inh" && GRANTED_STATES.includes(overrides[n.id]!))
  const removedNodes = changedNodes.filter(n => !GRANTED_STATES.includes(overrides[n.id]!))

  const allGranted = nodes.flatMap(n => [n, ...(n.children ?? [])]).filter(n => GRANTED_STATES.includes(n.state))
  const directCount = allGranted.filter(n => n.state === "g-direct").length
  const inhCount    = allGranted.filter(n => n.state === "g-inh").length
  const visibleNodes = mode === "audit" ? filterGrantedTree(nodes) : nodes

  const saveSteps: StepItem[] = [
    { label: "Review changes", state: saveStep === 0 ? "active" : saveStep === 1 ? "completed" : "default" },
    { label: "Confirm",        state: saveStep === 1 ? "active" : "default" },
  ]

  return (
    <div style={{ paddingBottom: mode === "edit" ? 80 : 0 }}>
      {/* Header row: studio sub-tabs + action button */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {STUDIO_TABS.map(s => (
            <button key={s.id} onClick={() => setStudio(s.id)} style={{
              padding: "4px 10px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer",
              color: studio === s.id ? "var(--foreground)" : "var(--muted-foreground)",
              borderBottom: studio === s.id ? "2px solid var(--primary)" : "2px solid transparent",
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {mode === "audit" && CURRENT_USER_CAN_EDIT_PERMISSIONS && (
          <Button variant="secondary" size="sm" onClick={() => setMode("edit")}>
            <Icons.Pencil size={13} style={{ marginRight: 4 }} />
            Edit permissions
          </Button>
        )}
      </div>

      {/* Applying permissions is a governed write, so it is confirmed
          explicitly and the confirmation stays until it is dismissed. */}
      {saved && savedSummary && (
        <div style={{ marginBottom: 16 }}>
          <AlertBanner
            state="success"
            title={`${savedSummary.total} permission${savedSummary.total === 1 ? "" : "s"} updated`}
            description={[
              savedSummary.added   > 0 ? `${savedSummary.added} granted`   : null,
              savedSummary.removed > 0 ? `${savedSummary.removed} revoked` : null,
              savedSummary.pinned  > 0 ? `${savedSummary.pinned} pinned`   : null,
            ].filter(Boolean).join(" · ") + ". Takes effect on the member's next action."}
            onClose={() => { setSaved(false); setSavedSummary(null) }}
          />
        </div>
      )}

      {/* Lightweight stats row — only in tree view */}
      {saveStep === null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Chip variant="secondary" size="s">{allGranted.length} granted</Chip>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{directCount} direct · {inhCount} via role</span>
          {mode === "audit" && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Eye size={11} /> View only
            </span>
          )}
        </div>
      )}

      {/* Tree (hidden during save review steps) */}
      {saveStep === null && (
        <div>
          {mode === "audit"
            ? visibleNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
            : visibleNodes.map(n => <EditablePermTreeNode key={n.id} node={n} depth={0} overrides={overrides} onToggle={togglePermission} mode={mode} scopeOverrides={scopeOverrides} onScopeChange={changeScopeOverride} />)
          }
          {visibleNodes.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "20px 0", textAlign: "center" }}>
              {mode === "audit" ? "No permissions granted in this studio." : "No permissions available."}
            </div>
          )}
        </div>
      )}

      {/* ── Inline save review (replaces tree when saveStep !== null) ─────── */}
      {saveStep !== null && (() => {
        const effectiveScope = (n: PermNode) => scopeOverrides[n.id] ?? n.scope ?? "Own"

        function renderDiffSection(
          items: PermNode[],
          header: string,
          bgMix: string,
          icon: ReactElement
        ) {
          if (items.length === 0) return null
          const itemIds = new Set(items.map(n => n.id))
          type DiffGroup = { parent: PermNode; parentInItems: boolean; children: PermNode[] }
          const groups: DiffGroup[] = []
          for (const root of nodes) {
            const pi = itemIds.has(root.id)
            const ci = (root.children ?? []).filter(c => itemIds.has(c.id))
            if (pi || ci.length > 0) groups.push({ parent: root, parentInItems: pi, children: ci })
          }
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {icon}
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-title)", textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {header}
                </span>
                <Tag variant="neutral" size="sm">{items.length}</Tag>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {groups.map(({ parent, parentInItems, children }) => (
                  <div key={parent.id}>
                    {parentInItems ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: bgMix }}>
                        {icon}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{parent.label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {effectiveScope(parent)}</span>
                        {parent.role && <span style={{ fontSize: 10, color: "var(--muted-foreground)", marginLeft: "auto" }}>via {parent.role}</span>}
                      </div>
                    ) : (
                      <div style={{ padding: "4px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>{parent.label}</span>
                      </div>
                    )}
                    {children.map(child => (
                      <div key={child.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 28px", borderRadius: 6, marginTop: 2, background: bgMix }}>
                        <Icons.CornerDownRight size={10} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                        {icon}
                        <span style={{ fontSize: 12, color: "var(--foreground)" }}>{child.label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {effectiveScope(child)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Stepper */}
            <div style={{ marginBottom: 20 }}>
              <Stepper steps={saveSteps} />
            </div>

            {/* Step 0: Review diff */}
            {saveStep === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {renderDiffSection(pinnedNodes, "Pinned — stays if role is removed", "color-mix(in srgb, var(--primary) 8%, transparent)", <Icons.Pin size={11} color="var(--primary)" />)}
                {renderDiffSection(addedNodes, "New access", "color-mix(in srgb, #22c55e 8%, transparent)" /* audit-ignore */, <Icons.Plus size={11} color="var(--color-text-success, #22c55e)" /* audit-ignore */ />)}
                {renderDiffSection(removedNodes, "Access removed", "color-mix(in srgb, #ef4444 8%, transparent)" /* audit-ignore */, <Icons.Minus size={11} color="var(--error, #ef4444)" /* audit-ignore */ />)}
                {changedNodes.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", padding: "16px 0" }}>
                    No changes to review.
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Confirm */}
            {saveStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
                  background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <Icons.ShieldCheck size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                      {changedNodes.length} permission{changedNodes.length !== 1 ? "s" : ""} will change
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {pinnedNodes.length > 0 && `${pinnedNodes.length} pinned`}
                      {pinnedNodes.length > 0 && (addedNodes.length > 0 || removedNodes.length > 0) && " · "}
                      {addedNodes.length > 0 && `${addedNodes.length} new`}
                      {addedNodes.length > 0 && removedNodes.length > 0 && " · "}
                      {removedNodes.length > 0 && `${removedNodes.length} removed`}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "4px 2px" }}>
                  Access updates take effect immediately. The member will see changes on their next action.
                </div>
              </div>
            )}

          </div>
        )
      })()}

      {/* ── StepperNavFooter portal — renders at full-screen bottom ──────── */}
      {mode === "edit" && createPortal(
        <div style={{
          position: "fixed", bottom: 0, left: 56, right: 0, zIndex: 200,
          background: "var(--step-nav-footer-bg, var(--canvas))",
          borderTop: "1px solid var(--step-nav-footer-separator, var(--border))",
        }}>
          <StepperNavFooter
            variant={saveStep === null || saveStep === 0 ? "cancel-next" : "back-next"}
            cancelLabel={saveStep === null ? "Discard" : "Keep editing"}
            onCancel={saveStep === null ? () => setShowDiscardModal(true) : () => setSaveStep(null)}
            onBack={() => setSaveStep(0)}
            nextLabel={saveStep === null ? "Save changes" : saveStep === 0 ? "Review & confirm" : "Apply changes"}
            nextDisabled={saveStep === null ? !isDirty : changedNodes.length === 0}
            onNext={saveStep === null ? () => setSaveStep(0) : saveStep === 0 ? () => setSaveStep(1) : confirmSave}
          />
        </div>,
        document.body
      )}

      {/* ── Discard confirmation modal ─────────────────────────────────────── */}
      <ModalDialog
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        tone="warning"
        iconName="AlertTriangle"
        title="Discard changes?"
        description="Your permission edits will be lost. This can't be undone."
        ctaPrimary={{ label: "Discard changes", destructive: true, onClick: confirmDiscard }}
        ctaSecondary={{ label: "Keep editing", onClick: () => setShowDiscardModal(false) }}
      />

    </div>
  )
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

  // Warnings in priority order. Each one is its own InformativeCard rather than
  // a shared block: they carry different severities, and a single card cannot
  // be red and green at once.
  const warnings: Array<{ state: InformativeCardState; text: string }> = []

  if (isSystem) {
    warnings.push({ state: "neutral", text: "This access is managed by the system and cannot be removed manually." })
  } else if (resource.criticalAccess) {
    warnings.push({ state: "error", text: `Removing Owner access to ${resource.name} may break ${memberName}'s ability to manage or share this resource.` })
  }
  if (isViaGroup && !isSystem) {
    warnings.push({ state: "alert", text: `This access comes from the ${resource.groupName} group (${resource.groupMemberCount} members). Removing it here removes access for the entire group, not just this member.` })
  }
  if (isViaRole && !isSystem) {
    warnings.push({ state: "alert", text: `This access is inherited from the ${resource.roleName} role. Removing it will revoke all permissions granted by that role on this resource.` })
  }
  if (resource.lastPath && !isSystem) {
    warnings.push({ state: "error", text: `${memberName} has no other access path to this resource. After removal, they will lose access completely.` })
  }
  if (resource.dualPath && !isSystem) {
    warnings.push({ state: "success", text: `Safe to remove — ${memberName} will still be able to access ${resource.name} via another path.` })
  }

  return (
    <ModalDialog
      isOpen
      onClose={onCancel}
      variant="content"
      tone={isSystem ? "default" : "warning"}
      iconName={isSystem ? "Lock" : "ShieldOff"}
      showClose
      title={isSystem ? "Access is system-managed" : "Remove resource access?"}
      description={isSystem
        ? "This access cannot be changed from here."
        : `You're about to remove ${memberName}'s access to the resource below.`}
      slotUnstyled
      slot={
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* One card, one resource — the dialog's subject */}
          <CardContainer size="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0 }}>
                {RESOURCE_TYPE_ICON[resource.type] ?? <Icons.Layers size={16} />}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", fontFamily: "monospace" }}>{resource.name}</span>
              <Tag variant={RESOURCE_TYPE_TAG[resource.type] ?? "neutral"} size="sm">{resource.type}</Tag>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px" }}>
              {[
                { label: "ACCESS",  value: resource.access    },
                { label: "SOURCE",  value: resource.source    },
                { label: "GRANTED", value: resource.grantedAt },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--foreground)" }}>{value}</div>
                </div>
              ))}
            </div>
          </CardContainer>

          {warnings.map((w, i) => (
            <InformativeCard key={i} state={w.state} size="sm" title={w.text} />
          ))}
        </div>
      }
      ctaSecondary={{ label: "Cancel", onClick: onCancel }}
      ctaPrimary={isSystem ? undefined : {
        label: isViaGroup ? `Remove from ${resource.groupName}` : "Remove access",
        destructive: true,
        onClick: onConfirm,
      }}
    />
  )
}

// Columns live outside the panel so the header and the cells are one
// definition — the pair that used to be two matching gridTemplateColumns.
const RESOURCE_COLUMNS = (onRemove: (r: MemberResource) => void): TableColumn<MemberResource>[] => [
  {
    key: "name", header: "Resource",
    render: r => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0 }}>
          {RESOURCE_TYPE_ICON[r.type] ?? <Icons.Layers size={13} />}
        </span>
        <span style={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
        {r.removable === false && (
          <Tooltip side="cursor" content="System-managed — this access cannot be removed by hand">
            <Icons.Lock size={11} color="var(--muted-foreground)" />
          </Tooltip>
        )}
        {r.dualPath && (
          <Tooltip side="cursor" content="Also reachable through another access path">
            <Icons.GitMerge size={11} color="var(--badge-success)" />
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    key: "type", header: "Type", width: "110px",
    render: r => <Tag variant={RESOURCE_TYPE_TAG[r.type] ?? "neutral"} size="sm">{r.type}</Tag>,
  },
  { key: "access", header: "Access", width: "100px" },
  {
    key: "grantedBy", header: "Granted by", width: "150px",
    render: r => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{r.grantedBy}</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>{r.source}</span>
      </div>
    ),
  },
  { key: "grantedAt", header: "When", width: "110px" },
  {
    key: "actions", header: "", width: "56px", align: "right",
    render: r => {
      const isSystem = r.removable === false
      return (
        <Tooltip side="cursor" content={isSystem ? "System-managed — cannot be removed" : `Remove access to ${r.name}`}>
          <Button
            variant="tertiary"
            size="sm"
            disabled={isSystem}
            aria-label={isSystem ? "System-managed" : `Remove access to ${r.name}`}
            onClick={e => { e.stopPropagation(); onRemove(r) }}
          >
            {isSystem ? <Icons.Lock size={12} /> : <Icons.Trash2 size={13} />}
          </Button>
        </Tooltip>
      )
    },
  },
]

function ResourcesPanel({ member }: { member: Member }) {
  const initialResources = MEMBER_RESOURCES[member.id] ?? []
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [pendingRemove, setPendingRemove] = useState<MemberResource | null>(null)
  const [justRemoved, setJustRemoved] = useState<string | null>(null)

  const allResources = initialResources.filter(r => !removedIds.has(r.id))
  const types = ["All", ...Array.from(new Set(initialResources.map(r => r.type)))]
  const [activeType, setActiveType] = useState("All")

  const resources = activeType === "All" ? allResources : allResources.filter(r => r.type === activeType)

  function handleRemoveConfirm() {
    if (!pendingRemove) return
    setRemovedIds(prev => new Set(prev).add(pendingRemove.id))
    setJustRemoved(pendingRemove.name)
    setPendingRemove(null)
    setTimeout(() => setJustRemoved(null), 3000)
  }

  if (allResources.length === 0 && removedIds.size === 0) {
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
        <Icons.Package size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No resources assigned</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Resources are datasets, models, and event buses this member can access.</div>
      </div>
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

      {/* Success toast */}
      {justRemoved && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 10200,
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", // audit-ignore: toast shadow
          animation: "tab-indicator-in 180ms ease-out both",
        }}>
          <Icons.CheckCircle size={15} style={{ color: "var(--badge-success)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
            Access to <strong>{justRemoved}</strong> removed
          </span>
        </div>
      )}

      {/* Empty state after removing all */}
      {allResources.length === 0 && removedIds.size > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <Icons.ShieldOff size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No resources remaining</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>All resource access has been removed for this member.</div>
        </div>
      )}

      {allResources.length > 0 && (
        <>
          {/* Type filter — Chip is the DS's selected/unselected control */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            {types.map(t => (
              <Chip key={t} size="s" variant={activeType === t ? "primary" : "secondary"} onClick={() => setActiveType(t)}>
                {t}
              </Chip>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted-foreground)" }}>
              {resources.length} resource{resources.length !== 1 ? "s" : ""}
              {removedIds.size > 0 && <span style={{ color: "var(--badge-error)", marginLeft: 6 }}>· {removedIds.size} removed</span>}
            </span>
          </div>

          {/* The DS Table, not a hand-rolled grid — it owns the header, the row
              hover, the sizes and the empty state, and its columns cannot drift
              out of step with its header because there is only one definition. */}
          <Table
            size="sm"
            columns={RESOURCE_COLUMNS(setPendingRemove)}
            data={resources}
            rowKey={r => r.id}
          />
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

function RoleDetailPage({ role, onBack, onDelete, onMemberClick }: {
  role: Role; onBack: () => void
  onDelete?: () => void
  onMemberClick?: (m: Member) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [draftName, setDraftName] = useState(role.label)
  const [draftDesc, setDraftDesc] = useState(role.desc)
  const [savedName, setSavedName] = useState(role.label)
  const [savedDesc, setSavedDesc] = useState(role.desc)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
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

      {/* Deleting a role is a real delete, so tone="error" per the confirmation
          table in CLAUDE.md — unlike removing a member from the workspace,
          which is warning because the person still exists. */}
      <ModalDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        tone="error"
        iconName="Trash2"
        title={`Delete "${role.label}"?`}
        description="Members who had this role will lose any permissions it granted."
        informativeCard="This role is removed permanently. This cannot be undone."
        ctaPrimary={{ label: "Delete role", destructive: true, onClick: () => { setConfirmDelete(false); onDelete?.() } }}
        ctaSecondary={{ label: "Cancel", onClick: () => setConfirmDelete(false) }}
      />

      {/* Role identity card — DS composition: CardContainer + Tag + Button */}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div style={{ borderRadius: 12, overflow: "hidden" }}>
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
                <Tag variant={role.system ? "neutral" : "purple"} size="sm">
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
          <CardContainer className="!p-0 overflow-hidden">
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
                    display: "flex", alignItems: "center", gap: 14, padding: "10px 24px",
                    borderBottom: "1px solid var(--border)",
                    cursor: onMemberClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <AvatarCircle name={m.name} initials={m.initials} sizeKey="lg"
                    avatarStyle={m.status === "active" ? "text" : "empty"} />

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
                  <div style={{ minWidth: 72, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <Tag variant={USER_TYPE_TAG[m.role]} size="sm">{m.role}</Tag>
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
                  <Tooltip side="cursor" content={m.mfaEnabled ? "MFA enabled" : "MFA not enabled"}>
                    <Tag
                      variant={m.mfaEnabled ? "success" : "alert"}
                      size="sm"
                      leadingIcon={m.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
                    >
                      MFA
                    </Tag>
                  </Tooltip>

                  {/* Status */}
                  <div style={{ minWidth: 76, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                  </div>

                  {/* Unassign button — system roles are read-only */}
                  {!role.system ? (
                    <button
                      title="Unassign from role"
                      onClick={e => e.stopPropagation()}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
                    >
                      <Icons.X size={14} />
                    </button>
                  ) : (
                    <div style={{ width: 26, flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </CardContainer>
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

function GroupDetailPage({ group: initialGroup, onBack, onMemberClick }: { group: Group; onBack: () => void; onMemberClick?: (m: Member) => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const [group, setGroup] = useState(initialGroup)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(initialGroup.name)
  const [savedName, setSavedName] = useState(initialGroup.name)
  const [editingDesc, setEditingDesc] = useState(false)
  const [draftDesc, setDraftDesc] = useState(initialGroup.desc)
  const [savedDesc, setSavedDesc] = useState(initialGroup.desc)
  const groupMembers = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const allStudios = ["governance", "datastudio", "agentic", "admin"]

  function toggleStudio(s: string) {
    setGroup(g => ({
      ...g,
      studios: g.studios.includes(s)
        ? g.studios.filter(x => x !== s)
        : [...g.studios, s],
    }))
  }

  function removeMember(id: string) {
    setGroup(g => ({ ...g, memberIds: g.memberIds.filter(x => x !== id) }))
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
        <div style={{ borderRadius: 12, overflow: "hidden" }}>
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
                  <Tag key={s} variant={STUDIO_TAG[s] ?? "neutral"} size="sm">{STUDIO_META[s].label}</Tag>
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

      <DetailTabs tabs={["Members", "Settings", "Activity"]} active={activeTab} onChange={setActiveTab} />

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
                    display: "flex", alignItems: "center", gap: 14, padding: "10px 24px",
                    borderBottom: "1px solid var(--border)",
                    cursor: onMemberClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--el-row-hover)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <AvatarCircle name={m.name} initials={m.initials} sizeKey="lg"
                    avatarStyle={m.status === "active" ? "text" : "empty"} />

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
                  <div style={{ minWidth: 72, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <Tag variant={USER_TYPE_TAG[m.role]} size="sm">{m.role}</Tag>
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
                  <Tooltip side="cursor" content={m.mfaEnabled ? "MFA enabled" : "MFA not enabled"}>
                    <Tag
                      variant={m.mfaEnabled ? "success" : "alert"}
                      size="sm"
                      leadingIcon={m.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
                    >
                      MFA
                    </Tag>
                  </Tooltip>

                  {/* Status */}
                  <div style={{ minWidth: 76, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <Tag variant={STATUS_TAG[m.status]} size="sm">{STATUS_LABEL[m.status]}</Tag>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={e => { e.stopPropagation(); removeMember(m.id) }}
                    title="Remove from group"
                    style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
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

        {/* Settings */}
        {activeTab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Studio access */}
            <CardContainer>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 14 }}>
                Studio access
              </div>
              {/* A studio toggle is selected/unselected, which is exactly what
                  Chip is for. The per-studio hex is gone: Chip has no lime or
                  informative variant, and CLAUDE.md forbids arbitrary per-item
                  colour anyway — the label carries the identity here. */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {allStudios.map(s => {
                  const active = group.studios.includes(s)
                  return (
                    <Chip
                      key={s}
                      size="m"
                      variant={active ? "primary" : "secondary"}
                      onClick={() => toggleStudio(s)}
                    >
                      {STUDIO_META[s]?.label ?? s}
                    </Chip>
                  )
                })}
              </div>
            </CardContainer>

            {/* Danger zone */}
            <div style={{ border: "1px solid color-mix(in srgb, var(--badge-error) 30%, transparent)", borderRadius: 12, padding: "20px 24px", background: "color-mix(in srgb, var(--badge-error) 5%, transparent)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--badge-error)", marginBottom: 8 }}>
                Danger zone
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
                Deleting this group removes it permanently. Members are not removed from the workspace.
              </div>
              {!confirmDelete ? (
                <Button variant="warning" size="sm" onClick={() => setConfirmDelete(true)}>Delete group</Button>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--badge-error)", marginBottom: 10 }}>Are you sure? This cannot be undone.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="warning" size="sm" onClick={onBack}>Delete</Button>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity */}
        {activeTab === 2 && <ActivityPanel />}
      </div>
    </ScreenLayout>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

type MemberAction = "reset-password" | "reset-mfa" | "suspend" | "unsuspend" | "deactivate" | "update"

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
          padding: "10px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 14,
          background: hovered ? "var(--el-row-hover)" : "transparent",
          cursor: "pointer", transition: "background 0.1s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar */}
        <div style={{ flexShrink: 0, opacity: member.status === "suspended" ? 0.5 : 1 }}>
          <AvatarCircle name={member.name} initials={member.initials} sizeKey="lg"
            avatarStyle={member.status === "active" ? "text" : "empty"} />
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", opacity: member.status === "suspended" ? 0.5 : 1, marginBottom: 1 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {member.email}
          </div>
        </div>

        {/* Department */}
        <div style={{ minWidth: 120, fontSize: 12, color: "var(--muted-foreground)", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member.department ?? "—"}
        </div>

        {/* User type badge */}
        <div style={{ minWidth: 72, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Tag variant={USER_TYPE_TAG[member.role]} size="sm">{member.role}</Tag>
        </div>

        {/* Last active */}
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 88 }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 1 }}>
            {member.status === "invited" ? "Invite sent" : member.status === "suspended" ? "Suspended" : "Last active"}
          </div>
          {member.lastActive ? (
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{formatRelative(member.lastActive)}</div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
              {member.status === "invited" ? formatRelative(member.joinedAt) : "—"}
            </div>
          )}
        </div>

        {/* MFA */}
        <div style={{ minWidth: 60, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Tooltip
            side="cursor"
            content={member.mfaEnabled
              ? `MFA enabled${member.mfaMethod ? ` · ${MFA_METHOD_LABEL[member.mfaMethod]}` : ""}`
              : "MFA not enabled"}
          >
            <Tag
              variant={member.mfaEnabled ? "success" : "alert"}
              size="sm"
              leadingIcon={member.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
            >
              MFA
            </Tag>
          </Tooltip>
        </div>

        {/* Status */}
        <div style={{ minWidth: 76, display: "flex", justifyContent: "center", flexShrink: 0 }}>
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
            {[
              { key: "reset-password", label: "Reset password", icon: Icons.KeyRound },
              { key: "reset-mfa",      label: "Reset MFA",       icon: Icons.ShieldOff },
              { key: member.status === "suspended" ? "unsuspend" : "suspend",
                label: member.status === "suspended" ? "Unsuspend access" : "Suspend access",
                icon: member.status === "suspended" ? Icons.UserCheck : Icons.UserX,
              },
              { key: "deactivate", label: "Deactivate user", icon: Icons.Ban, danger: true },
            ].map(({ key, label, icon: Icon, danger }) => (
              <button key={key} onClick={e => {
                e.stopPropagation()
                setMenuOpen(false)
                onAction?.(member, key as MemberAction)
              }} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "8px 14px", border: "none", background: "none",
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

function RoleCard({ role, onSelect }: { role: Role; onSelect: (r: Role) => void }) {
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Color accent top bar */}
      <CardContainer size="default" variant="default" onClick={() => onSelect(role)} className="flex-1 flex flex-col">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
          <Tag variant={role.system ? "neutral" : "purple"} size="sm">
            {role.system ? "System" : "Custom"}
          </Tag>
        </div>
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {role.desc}
        </p>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div key={m.id} title={m.name} style={{
                borderRadius: "50%", border: "2px solid var(--surface)", display: "flex",
                marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                position: "relative", zIndex: visible.length - i,
              }}>
                <AvatarCircle name={m.name} initials={m.initials} sizeKey="md"
                  avatarStyle={m.status === "active" ? "text" : "empty"} />
              </div>
            ))}
            {overflow > 0 && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "var(--surface-raised)", border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)",
                marginLeft: -6, flexShrink: 0,
              }}>+{overflow}</div>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
          <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
            <Button variant="secondary" size="sm" onClick={() => onSelect(role)}>
              View role
            </Button>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onSelect }: { group: Group; onSelect: (g: Group) => void }) {
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Color accent top bar */}
      <CardContainer size="default" variant="default" onClick={() => onSelect(group)} className="flex-1 flex flex-col">
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{group.name}</div>
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 12px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {group.desc}
        </p>
        {/* Studio chips — Tag DS (read-only identity attributes) */}
        <div style={{ display: "flex", gap: "8px 5px", flexWrap: "wrap", marginBottom: 12, minHeight: 22 }}>
          {group.studios.length === 0 ? (
            <Tag variant="secondary" size="sm">No studios</Tag>
          ) : group.studios.map(s => (
            <Tag key={s} variant={STUDIO_TAG[s] ?? "neutral"} size="sm">{STUDIO_META[s].label}</Tag>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div key={m.id} title={m.name} style={{
                borderRadius: "50%", border: "2px solid var(--surface)", display: "flex",
                marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                position: "relative", zIndex: visible.length - i,
              }}>
                <AvatarCircle name={m.name} initials={m.initials} sizeKey="md"
                  avatarStyle={m.status === "active" ? "text" : "empty"} />
              </div>
            ))}
            {overflow > 0 && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "var(--surface-raised)", border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)",
                marginLeft: -6, flexShrink: 0,
              }}>+{overflow}</div>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
          <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
            <Button variant="secondary" size="sm" onClick={() => onSelect(group)}>
              Manage group
            </Button>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

const INVITE_STUDIO_OPTIONS = [
  { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={13} /> },
  { id: "datastudio", label: "Data Studio",        icon: <Icons.Database size={13} /> },
  { id: "agentic",    label: "Agentic Studio",     icon: <Icons.Bot size={13} /> },
  { id: "admin",      label: "Admin Console",      icon: <Icons.Settings size={13} /> },
]

function InviteModal({ onClose, onSend }: {
  onClose: () => void
  onSend: (emails: string[], role: MemberRole) => void
}) {
  const [emails, setEmails]           = useState<string[]>([])
  const [role, setRole]               = useState<MemberRole>("Member")
  const [studios, setStudios]         = useState<string[]>(["governance"])
  const [groupIds, setGroupIds]       = useState<string[]>([])
  const [note, setNote]               = useState("")
  const [done, setDone]               = useState(false)

  const recipientCount = emails.length

  function toggleStudio(id: string) {
    setStudios(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function toggleGroup(id: string) {
    setGroupIds(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  }

  function submit() {
    if (emails.length === 0) return
    onSend(emails, role)
    setDone(true)
    setTimeout(() => onClose(), 2200)
  }

  const inviteeCount = emails.length

  // ── Sections. The dialog is 900px wide (the DS modal width) and does not
  //    scroll itself, so the form scrolls inside the slot. The 12px gutter is
  //    the same one PermissionsBreakdown needs: CardContainer's hover halo has
  //    to land somewhere, and a scroll container clips it flat.
  const SectionLabel = ({ children, hint, optional }: { children: React.ReactNode; hint?: string; optional?: boolean }) => (
    <div style={{ marginBottom: hint ? 8 : 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>
        {children}{optional && <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}> (optional)</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>{hint}</div>}
    </div>
  )

  if (done) return (
    <ModalDialog
      isOpen
      onClose={onClose}
      tone="success"
      iconName="MailCheck"
      title={`${recipientCount} invitation${recipientCount !== 1 ? "s" : ""} sent`}
      description={`${recipientCount === 1 ? "They'll" : "They'll each"} receive an email with a link to join Avance Financial. Invitations expire in 7 days.`}
      ctaPrimary={{ label: "Done", onClick: onClose }}
    />
  )

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      variant="content"
      tone="default"
      iconName="UserPlus"
      showClose
      title="Invite to Avance Financial"
      description="Invitations are sent by email and expire after 7 days."
      slotUnstyled
      slot={
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: "min(58vh, 560px)", overflowY: "auto", paddingInline: 16, marginInline: -16 }}>

          {/* 1 · Emails — TagInput is the DS field for exactly this */}
          <div>
            <SectionLabel hint="Press Enter after each address.">Email addresses</SectionLabel>
            <TagInput
              tags={emails}
              onAddTag={v => { const t = v.trim().toLowerCase(); if (t) setEmails(e => e.includes(t) ? e : [...e, t]) }}
              onRemoveTag={v => setEmails(e => e.filter(x => x !== v))}
              placeholder="name@company.com"
              showAddButton={false}
            />
          </div>

          {/* 2 · Role — one card per option. The title never turns blue: the
                 card's selected border is what says "chosen", and a coloured
                 label on top of it says it twice. */}
          <div>
            <SectionLabel>Role</SectionLabel>
            <div role="radiogroup" aria-label="Role" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["Member", "Admin", "Owner"] as MemberRole[]).map(r => (
                <CardContainer key={r} size="sm" selected={role === r} onClick={() => setRole(r)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Radio value={r} checked={role === r} onChange={() => setRole(r)} size="sm" hideLabel label={r} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-title)" }}>{r}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.45 }}>
                    {r === "Owner" ? "Full admin + transferable ownership"
                      : r === "Admin" ? "Manage members, studios & billing"
                      : "Access assigned studios only"}
                  </div>
                </CardContainer>
              ))}
            </div>
          </div>

          {/* 3 · Studio access (Member only) */}
          {role === "Member" && (
            <div>
              <SectionLabel hint="Select which studios this member can access. Admins and Owners get all studios automatically.">
                Studio access
              </SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {INVITE_STUDIO_OPTIONS.map(st => {
                  const on = studios.includes(st.id)
                  return (
                    <CardContainer key={st.id} size="sm" selected={on} onClick={() => toggleStudio(st.id)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Checkbox size="sm" checked={on} onChange={() => toggleStudio(st.id)} id={`studio-${st.id}`} />
                        <label htmlFor={`studio-${st.id}`} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 0 }}>
                          <span style={{ color: "var(--muted-foreground)", display: "flex", flexShrink: 0 }}>{st.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-title)" }}>{st.label}</span>
                        </label>
                      </div>
                    </CardContainer>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4 · Groups */}
          <div>
            <SectionLabel optional hint="Group membership grants additional studio access and permissions.">
              Add to groups
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GROUPS.map(g => {
                const on = groupIds.includes(g.id)
                return (
                  <CardContainer key={g.id} size="sm" selected={on} onClick={() => toggleGroup(g.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Checkbox size="sm" checked={on} onChange={() => toggleGroup(g.id)} id={`group-${g.id}`} />
                      <AvatarCircle name={g.name} initials={g.name.slice(0, 2).toUpperCase()} sizeKey="md" />
                      <label htmlFor={`group-${g.id}`} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>{g.name}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 6 }}>
                          {g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""}
                        </span>
                      </label>
                      <div style={{ display: "flex", gap: "8px 4px", flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 1, minWidth: 0 }}>
                        {g.studios.map(st => (
                          <Tag key={st} variant={STUDIO_TAG[st] ?? "neutral"} size="sm">
                            {st === "governance" ? "Gov" : st === "datastudio" ? "Data" : st === "agentic" ? "Agentic" : "Admin"}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </CardContainer>
                )
              })}
            </div>
          </div>

          {/* 5 · Personal note — no label prop, this is a desktop screen */}
          <div>
            <SectionLabel optional>Personal note</SectionLabel>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Welcome to AIMS-OS! We're excited to have you on the team…"
              rows={2}
            />
          </div>

          {/* What is about to be sent, stated before the CTA rather than in a
              footer bar the dialog does not have. */}
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {inviteeCount} recipient{inviteeCount !== 1 ? "s" : ""}
            {role === "Member" && studios.length > 0 && <span> · {studios.length} studio{studios.length !== 1 ? "s" : ""}</span>}
            {groupIds.length > 0 && <span> · {groupIds.length} group{groupIds.length !== 1 ? "s" : ""}</span>}
          </div>
        </div>
      }
      ctaSecondary={{ label: "Cancel", onClick: onClose }}
      ctaPrimary={{
        label: inviteeCount > 1 ? `Send ${inviteeCount} invitations` : "Send invitation",
        disabled: inviteeCount === 0,
        onClick: submit,
      }}
    />
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
            border: "none", background: "none", cursor: "pointer",
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

function MemberPreview({
  member, onRoleChange, onToggleSuspend,
}: {
  member: Member
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
}) {
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
        <PreviewTabBar tabs={["Overview", "Permissions", "Actions"]} active={tab} onChange={setTab} />
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

        {/* Actions */}
        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isInvited && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Change user type</div>
                <select
                  value={member.role}
                  onChange={e => onRoleChange(member.id, e.target.value as UserType)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", outline: "none", cursor: "pointer" }}
                >
                  {USER_TYPE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            {isInvited ? (
              <Button variant="secondary" size="sm" onClick={() => alert(`Invite resent to ${member.email}`)}>Resend invite</Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onToggleSuspend(member.id)}>{isActive ? "Suspend access" : "Reactivate account"}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type StudioPermRow = { id: string; label: string; value: number; max: number; names: string[] }

/** Per-studio permission counts for a role, from the studio's own tree. */
export function studioPermRows(counts: Record<string, number>): StudioPermRow[] {
  return STUDIO_TABS.map(studio => {
    const value = counts[studio.id] ?? 0
    const leaves = (PERM_TREE[studio.id] ?? []).flatMap(n => n.children?.length ? n.children : [n])
    return {
      id: studio.id,
      label: studio.label,
      value,
      max: Math.max(leaves.length, value, 1),
      names: leaves.slice(0, value).map(n => n.label),
    }
  })
}

/**
 * Permissions breakdown — the canonical way to show per-studio permission
 * counts. Use this anywhere the same data appears; do not redraw it.
 *
 * The cards keep the full content width. CardContainer's dark hover shadow is
 * `0 0 4px 1px` white/40 plus `0 0 14px` white/15, so the halo paints OUTSIDE
 * the card — and inside a 350px SlideOut the content column is 302px, exactly
 * the card's width. Every scroller between the card and the panel therefore has
 * to widen its clip boundary instead of the card giving up width: ScrollArea
 * does it by default now (`crossAxisClipMargin`), and this preview's own
 * scroller does the same below.
 */
export function PermissionsBreakdown({ rows }: { rows: StudioPermRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(row => <StudioPermBreakdownRow key={row.id} row={row} />)}
    </div>
  )
}

// One studio's share of a role's permissions, and — on expand — exactly which
// ones. Michael asked for hover OR a chevron; it is a chevron, because a
// tooltip cannot hold ten permission names and cannot be read on a touch
// device, and this list runs to ten.
function StudioPermBreakdownRow({ row }: {
  row: StudioPermRow
}) {
  const [open, setOpen] = useState(false)
  const empty = row.value === 0
  const pct = Math.min((row.value / row.max) * 100, 100)

  return (
    <CardContainer size="sm" onClick={empty ? undefined : () => setOpen(o => !o)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {!empty && (open
            ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
            : <Icons.ChevronRight size={12} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />)}
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{row.label}</span>
        </div>
        <Tag variant={empty ? "neutral" : (STUDIO_TAG[row.id] ?? "neutral")} size="sm">{row.value}</Tag>
      </div>

      {/* The bar takes the studio's own categorical colour, so a studio reads
          the same here as in its tag and its HighlightIcon. --hi-*-icon, not
          --tag-*-fg: the informative tag's foreground is White/80, which would
          have drawn the Admin bar white. */}
      <div style={{ height: 3, borderRadius: 2, background: "var(--field-border)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 2, transition: "width 0.3s",
          background: empty ? "transparent" : `var(--hi-${(STUDIO_HI[row.id] ?? "neutral").replace("-", "")}-icon)`,
        }} />
      </div>

      {open && row.names.length > 0 && (
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
}

function RolePreview({ role, onMemberClick }: { role: Role; onMemberClick?: (m: Member) => void }) {
  const [tab, setTab] = useState(0)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  // A bar that only says "6" cannot be acted on — you have to open the role to
  // learn WHICH six.
  const permRows = studioPermRows(perms as unknown as Record<string, number>)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "0 0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <HighlightIcon size="lg" variant={ROLE_HI[role.id] ?? "neutral"} iconName="Shield" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{role.label}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Tag variant={role.system ? "neutral" : "purple"} size="sm">
                {role.system ? "System" : "Custom"}
              </Tag>
              <Tag variant="neutral" size="sm">{perms.total} permissions</Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingInline: 16, marginInline: -16 }}>
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.55, margin: 0 }}>{role.desc}</p>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 2 }}>
              Permissions breakdown
            </div>
            <PermissionsBreakdown rows={permRows} />
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
                <AvatarCircle name={m.name} initials={m.initials} sizeKey="lg"
                  avatarStyle={m.status === "active" ? "text" : "empty"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <Tag variant={STATUS_TAG[m.status]} size="sm" className="shrink-0">{STATUS_LABEL[m.status]}</Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupPreview({ group, onMemberClick }: { group: Group; onMemberClick?: (m: Member) => void }) {
  const [tab, setTab] = useState(0)
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "0 0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <HighlightIcon size="lg" variant="informative" iconName="Users" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{group.name}</div>
            <div style={{ display: "flex", gap: "8px 5px", flexWrap: "wrap" }}>
              {/* Counts, not statuses — both neutral. The blue one read as a link. */}
              <Tag variant="neutral" size="sm">{members.length} member{members.length !== 1 ? "s" : ""}</Tag>
              <Tag variant="neutral" size="sm">{group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}</Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingInline: 16, marginInline: -16 }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Same card shell as the permissions breakdown, and the
                      studio's colour comes from its HighlightIcon instead of a
                      raw hex dot — the same way a studio is drawn in Apps. */}
                  {group.studios.map(s => (
                    <CardContainer key={s} size="sm" className="flex items-center gap-[8px]">
                      <HighlightIcon size="sm" variant={STUDIO_HI[s] ?? "neutral"} icon={STUDIO_META[s]?.icon} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-title)" }}>
                        {STUDIO_META[s]?.label ?? s}
                      </span>
                    </CardContainer>
                  ))}
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
                <AvatarCircle name={m.name} initials={m.initials} sizeKey="lg"
                  avatarStyle={m.status === "active" ? "text" : "empty"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <Tag variant={STATUS_TAG[m.status]} size="sm" className="shrink-0">{STATUS_LABEL[m.status]}</Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Role form modal (create / edit) ─────────────────────────────────────────

function RoleFormModal({ role, onSave, onClose }: {
  role: Role | null
  onSave: (saved: Role) => void
  onClose: () => void
}) {
  const isEdit = role !== null
  const [name, setName]   = useState(role?.label ?? "")
  const [desc, setDesc]   = useState(role?.desc ?? "")
  const [color, setColor] = useState(role?.color ?? ROLE_COLORS[0])
  const [done, setDone]   = useState(false)

  function handleSave() {
    if (!name.trim()) return
    const saved: Role = {
      id: role?.id ?? name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      label: name.trim(),
      system: false,
      color,
      desc: desc.trim(),
      memberIds: role?.memberIds ?? [],
    }
    onSave(saved)
    setDone(true)
    setTimeout(onClose, 1600)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10002,
      background: "rgba(0,0,0,0.45)", // audit-ignore: scrim overlay
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, width: 480, maxWidth: "95vw",
        boxShadow: "var(--shadow-elevation-3, 0 16px 48px rgba(0,0,0,.22))", // audit-ignore: rgba fallback
        overflow: "hidden",
      }}>
        {done ? (
          <div style={{ padding: "48px 40px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
              background: "color-mix(in srgb, var(--color-text-success) 12%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icons.CheckCircle2 size={26} style={{ color: "var(--color-text-success)" }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
              Role {isEdit ? "updated" : "created"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              "{name.trim()}" is {isEdit ? "now updated" : "ready to assign to members"}.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>
                  {isEdit ? "Edit role" : "New role"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                  {isEdit ? "Update this custom role's name, description, and color." : "Create a custom role to bundle permissions for specific team members."}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, borderRadius: 6 }}
              >
                <Icons.X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px 24px 8px" }}>
              {/* Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Role name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Risk Analyst"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "9px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--background)",
                    color: "var(--foreground)", fontSize: 14, fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="What does this role allow members to do?"
                  rows={3}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "9px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--background)",
                    color: "var(--foreground)", fontSize: 14, fontFamily: "inherit",
                    resize: "vertical", outline: "none", lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Color picker */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Role color
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {ROLE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      style={{
                        width: 30, height: 30, borderRadius: "50%", background: c,
                        border: color === c ? "3px solid var(--foreground)" : "3px solid transparent",
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2, cursor: "pointer", flexShrink: 0,
                        transition: "outline 0.12s, border 0.12s",
                      }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 6,
                    background: `${color}22`, color: color, border: `1px solid ${color}55`,
                  }}>
                    {name.trim() || "Role name"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>preview</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 24px 20px",
              display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
              <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                variant="primary" size="sm"
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {isEdit ? "Save changes" : "Create role"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [mainTab, setMainTab]           = useState<"members" | "roles" | "groups">("members")
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all")
  const [query, setQuery]               = useState("")
  const [rolesQuery, setRolesQuery]     = useState("")
  const [groupsQuery, setGroupsQuery]   = useState("")
  const [members, setMembers]           = useState<Member[]>(MEMBERS)
  const [roles, setRoles]               = useState<Role[]>(ROLES)
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
  const [roleForm, setRoleForm]         = useState<{ role: Role | null } | null>(null)

  function handleRoleSave(saved: Role) {
    setRoles(prev => {
      const exists = prev.some(r => r.id === saved.id)
      return exists ? prev.map(r => r.id === saved.id ? saved : r) : [...prev, saved]
    })
    setDetailView(dv => dv?.type === "role" && dv.role.id === saved.id ? { type: "role", role: saved } : dv)
    setRoleForm(null)
  }

  const counts = useMemo(() => ({
    all:       members.length,
    active:    members.filter(m => m.status === "active").length,
    invited:   members.filter(m => m.status === "invited").length,
    suspended: members.filter(m => m.status === "suspended").length,
  }), [members])

  const { containerRef: statusContainerRef, slot: statusSlot, menu: statusMenu } = useFilterDropdown({
    placeholder:  "Status",
    value:        statusFilter,
    defaultValue: "all" as const,
    options: [
      { id: "all",       label: "All members", count: counts.all       },
      { id: "active",    label: "Active",      count: counts.active    },
      { id: "invited",   label: "Invited",     count: counts.invited   },
      { id: "suspended", label: "Suspended",   count: counts.suspended },
    ],
    onChange: (id) => setStatusFilter(id as "all" | MemberStatus),
  })

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
    if (!q) return GROUPS
    return GROUPS.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  }, [groupsQuery])

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, role } : m))
    setDetailView(d => d?.type === "member" && d.member.id === id ? { ...d, member: { ...d.member, role } } : d)
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

  // Detail pages
  if (detailView?.type === "member") {
    return (
      <MemberDetailPage
        member={detailView.member}
        onBack={() => setDetailView(null)}
        onToggleSuspend={handleToggleSuspend}
        onRemove={handleRemove}
        onUpdate={handleMemberUpdate}
      />
    )
  }
  if (detailView?.type === "role") {
    const dRole = detailView.role
    return (
      <>
        <RoleDetailPage
          role={dRole}
          onBack={() => setDetailView(null)}
          onDelete={!dRole.system ? () => { setRoles(prev => prev.filter(r => r.id !== dRole.id)); setDetailView(null) } : undefined}
          onMemberClick={m => setDetailView({ type: "member", member: m })}
        />
      </>
    )
  }
  if (detailView?.type === "group") {
    return <GroupDetailPage group={detailView.group} onBack={() => setDetailView(null)} onMemberClick={m => setDetailView({ type: "member", member: m })} />
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
              ? { label: "New role",      icon: Icons.ShieldPlus, onClick: () => setRoleForm({ role: null }) }
              : { label: "New group",     icon: Icons.FolderPlus }
          }
        />
      )}
    >
      {/* Main tab switcher */}
      <Tabs
        items={[
          { id: "members", label: `Members (${counts.all})` },
          { id: "roles",   label: `Roles (${roles.length})`  },
          { id: "groups",  label: `Groups (${GROUPS.length})` },
        ]}
        activeId={mainTab}
        onChange={v => setMainTab(v as "members" | "roles" | "groups")}
        size="m"
      />

      {/* Filters row */}
      {mainTab === "members" && (
        <div ref={statusContainerRef} style={{ position: "relative", marginTop: 24, marginBottom: 24 }}>
          <Filters
            showSearch
            searchPlaceholder="Search members…"
            searchValue={query}
            onSearchChange={setQuery}
            slots={[statusSlot]}
            showAllFilters={false}
            showSort={false}
            showViewToggle={false}
          />
          {statusMenu}
        </div>
      )}

      {/* Members view */}
      {mainTab === "members" && (
        <>
          <CardContainer className={`!p-0 overflow-hidden ${TABLE_CARD}`}>
            <div style={{
              padding: "10px 20px 10px 68px", display: "flex", alignItems: "center", gap: 14,
              background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
              fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              <span style={{ flex: 1 }}>Member</span>
              <span style={{ minWidth: 120 }}>Department</span>
              <span style={{ minWidth: 72, textAlign: "center" }}>User Type</span>
              <span style={{ minWidth: 88, textAlign: "right" }}>Last active</span>
              <span style={{ minWidth: 60, textAlign: "center" }}>MFA</span>
              <span style={{ minWidth: 76, textAlign: "center" }}>Status</span>
              <span style={{ width: 28 }} />
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
          <div style={{ marginTop: 24, marginBottom: 24 }}>
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
          <div style={{ marginTop: 24, marginBottom: 24 }}>
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
          <MemberPreview
            member={previewItem.member}
            onRoleChange={handleRoleChange}
            onToggleSuspend={id => { handleToggleSuspend(id); setPreviewItem(null) }}
          />
        )}
        {previewItem?.type === "role" && (
          <RolePreview
            role={previewItem.role}
            onMemberClick={m => { setPreviewItem(null); setDetailView({ type: "member", member: m }) }}
          />
        )}
        {previewItem?.type === "group" && (
          <GroupPreview
            group={previewItem.group}
            onMemberClick={m => { setPreviewItem(null); setDetailView({ type: "member", member: m }) }}
          />
        )}
      </SlideOut>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSend={(emails, role) => {
            const newMembers: Member[] = emails.map((email, i) => ({
              id: `new-${Date.now()}-${i}`,
              name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
              email,
              role,
              status: "invited",
              lastActive: null,
              joinedAt: new Date().toISOString(),
              initials: email.slice(0, 2).toUpperCase(),
              avatarColor: "var(--muted)",
              mfaEnabled: false,
            }))
            setMembers(ms => [...ms, ...newMembers])
          }}
        />
      )}

      {roleForm !== null && (
        <RoleFormModal role={roleForm.role} onSave={handleRoleSave} onClose={() => setRoleForm(null)} />
      )}
    </ScreenLayout>
  )
}
