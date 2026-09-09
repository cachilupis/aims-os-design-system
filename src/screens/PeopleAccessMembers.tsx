import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { useFilterDropdown } from "./voice-channel/shared"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Tag }          from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { Tabs }         from "@/components/ui/tabs"
import { SlideOut }     from "@/components/ui/slide-out"
import { Filters }     from "@/components/ui/filters"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Chip }        from "@/components/ui/chip"
import { Toggle }      from "@/components/ui/toggle"
import { SwitchTab } from "@/components/ui/switch-tab"
import { Stepper, type StepItem } from "@/components/ui/stepper"
import { StepperNavFooter } from "@/components/ui/stepper-nav-footer"
import { AvatarCircle, nameToAvatarColor } from "@/components/ui/avatar"
import { HighlightIcon } from "@/components/ui/highlight-icon"

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
  suspended: "neutral",
}
const STATUS_LABEL: Record<MemberStatus, string> = {
  active:    "Active",
  invited:   "Invited",
  suspended: "Suspended",
}
const STATUS_COLOR: Record<MemberStatus, string> = {
  active:    "var(--badge-success)",
  invited:   "var(--badge-light-blue)",
  suspended: "var(--muted-foreground)",
}
const USER_TYPE_COLOR: Record<UserType, string> = {
  "Owner":  "var(--badge-error)",
  "Admin":  "var(--badge-alert)",
  "Member": "var(--muted-foreground)",
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
const STUDIO_HI: Record<string, "lime" | "purple" | "light-blue" | "informative"> = {
  governance: "lime",
  datastudio: "purple",
  agentic:    "light-blue",
  admin:      "informative",
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
          border: "1px solid var(--background)", background: "transparent",
          color: "var(--background)",
        }}
      >Undo</button>
      <button
        onClick={onDismiss}
        style={{ marginLeft: 4, border: "none", background: "none", color: "var(--background)", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
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


function PermTreeNode({ node, depth = 0, isEditing = false }: { node: PermNode; depth?: number; isEditing?: boolean }) {
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const [checked, setChecked] = useState(node.state === "g-direct" || node.state === "g-inh")
  const hasChildren = (node.children?.length ?? 0) > 0
  const isInherited = node.state === "g-inh"

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
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
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
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              }}>
                via {node.role}
              </span>
            )}
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
        <PermTreeNode key={child.id} node={child} depth={depth + 1} isEditing={isEditing} />
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
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--error, #ef4444)", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}
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
          display: "grid", gridTemplateColumns: "20px 150px 160px 90px 130px 1fr 70px 60px",
          padding: "11px 14px", cursor: "pointer", gap: 10, alignItems: "center",
          background: expanded ? "var(--accent)" : "transparent",
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
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
        <div style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--border)", padding: "14px 44px 16px" }}>
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
        <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "none", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 5 }}>
          <Icons.Download size={12} />Export
        </button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "20px 150px 160px 90px 130px 1fr 70px 60px",
          padding: "8px 14px", gap: 10,
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

// USER_TYPE_OPTIONS kept for future invite flow use

function MemberDetailPage({
  member, onBack, onToggleSuspend, onRemove, onUpdate,
  allGroups, allRoles, onRemoveFromGroup, onAddToGroup, onRemoveFromRole,
  onNavigateToRole, onAssignRole, onNavigateToGroup,
}: {
  member: Member
  onBack: () => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (m: Member) => void
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

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginTop: 16, alignItems: "start" }}>

        {/* Left: identity card */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Avatar + name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "28px 24px 20px",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: isActive ? member.avatarColor : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700,
              color: isActive ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
              opacity: member.status === "suspended" ? 0.6 : 1,
            }}>
              {member.initials}
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
            {!isInvited && (
              <>
                <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => alert(`Password reset email sent to ${member.email}`)}>
                  <Icons.KeyRound size={13} /> Reset password
                </Button>
                <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => alert(`MFA enrollment reset for ${member.name}`)}>
                  <Icons.ShieldOff size={13} /> Reset MFA
                </Button>
              </>
            )}
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
            {!confirmRemove ? (
              <Button variant="warning" size="sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setConfirmRemove(true)}>
                <Icons.Trash2 size={13} /> Remove from workspace
              </Button>
            ) : (
              <div style={{ padding: "12px", border: "1px solid var(--badge-error)", borderRadius: 8, background: "color-mix(in srgb, var(--badge-error) 6%, transparent)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", marginBottom: 4 }}>Remove {member.name}?</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 10 }}>This cannot be undone.</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="warning" size="sm" style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => { onRemove(member.id); onBack() }}>Confirm</Button>
                  <Button variant="secondary" size="sm" style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setConfirmRemove(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
  onSave?: () => void
  onCancel?: () => void
  onRemove?: () => void
}) {
  const nodes = PERM_TREE[studioId] ?? []
  const granted = filterGrantedTree(nodes)
  const directCount = granted.flatMap(n => [n, ...(n.children ?? [])]).filter(n => n.state === "g-direct").length
  const inhCount = granted.flatMap(n => [n, ...(n.children ?? [])]).filter(n => n.state === "g-inh").length

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
          <div style={{ padding: "8px 0 12px", fontSize: 12, color: "var(--muted-foreground)" }}>
            No permissions granted in this app.
          </div>
        ) : (
          <div style={{ border: `1px solid ${isEditing ? "color-mix(in srgb, var(--primary) 30%, var(--border))" : "var(--border)"}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            {granted.map(n => <PermTreeNode key={n.id} node={n} depth={0} isEditing={isEditing} />)}
          </div>
        )}
        {isEditing && (
          <div style={{ display: "flex", gap: 8, paddingBottom: 12, alignItems: "center" }}>
            <Button variant="primary" size="sm" onClick={onSave}>Save changes</Button>
            <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <div style={{ flex: 1 }} />
            <button
              onClick={onRemove}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                borderRadius: 6, border: "1px solid var(--badge-error)",
                background: "color-mix(in srgb, var(--badge-error) 6%, transparent)",
                color: "var(--badge-error)", cursor: "pointer", fontSize: 12, fontWeight: 500,
              }}
            >
              <Icons.Trash2 size={11} /> Remove access
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AppsPanel({ member }: { member: Member }) {
  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))
  const studioSet = new Set<string>(member.role === "Owner" || member.role === "Admin" ? Object.keys(STUDIO_META) : [])
  memberGroups.forEach(g => g.studios.forEach(s => studioSet.add(s)))
  const [studios, setStudios] = useState(Array.from(studioSet))
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null)
  const [editingStudio, setEditingStudio] = useState<string | null>(null)
  const [grantOpen, setGrantOpen] = useState(false)
  const [removingStudio, setRemovingStudio] = useState<string | null>(null)
  const [fullReviewOpen, setFullReviewOpen] = useState(false)
  const [reviewStudio, setReviewStudio] = useState(studios[0] ?? "governance")

  const allAssigned = studios.length >= Object.keys(STUDIO_META).length
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
              <div key={id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 9,
                background: "var(--surface)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "var(--surface-raised)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
                }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{meta.desc}</div>
                </div>
                <Button variant="primary" size="sm" onClick={() => { setStudios(p => [...p, id]); setGrantOpen(false) }}>
                  Grant
                </Button>
              </div>
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {studios.map(s => {
              const m = STUDIO_META[s]
              if (!m) return null
              return (
                <button key={s}
                  onClick={() => setReviewStudio(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                    borderRadius: 7, border: `1px solid ${reviewStudio === s ? "var(--primary)" : "var(--border)"}`,
                    background: reviewStudio === s ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface)",
                    color: reviewStudio === s ? "var(--primary)" : "var(--foreground)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {m.icon} {m.label}
                </button>
              )
            })}
          </div>
          {reviewNodes.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--muted-foreground)" }}>
              No permissions granted in this app.
            </div>
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
      {fullReviewModal}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={() => setFullReviewOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 11px",
            fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 7,
            background: "var(--surface)", color: "var(--muted-foreground)", cursor: "pointer",
          }}
        >
          <Icons.ShieldCheck size={13} /> Full Permission Review
        </button>
        {!allAssigned && (
          <Button variant="secondary" size="sm" onClick={() => setGrantOpen(true)}>
            <Icons.Plus size={13} /> Grant access
          </Button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {studios.map(s => {
          const meta = STUDIO_META[s]
          if (!meta) return null
          const via = memberGroups.filter(g => g.studios.includes(s)).map(g => g.name)
          const isExpanded = expandedStudio === s
          const isEditingThis = editingStudio === s
          return (
            <div key={s} style={{
              border: `1px solid ${isEditingThis ? "var(--primary)" : isExpanded ? "color-mix(in srgb, var(--primary) 40%, var(--border))" : "var(--border)"}`,
              borderRadius: 10, background: "var(--surface)", overflow: "hidden",
              transition: "border-color 0.15s",
            }}>
              <div
                onClick={() => { if (!isEditingThis) setExpandedStudio(isExpanded ? null : s) }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "13px 18px", cursor: isEditingThis ? "default" : "pointer",
                  background: isExpanded ? "color-mix(in srgb, var(--primary) 3%, transparent)" : "transparent",
                }}
                onMouseEnter={e => { if (!isExpanded && !isEditingThis) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isExpanded ? "color-mix(in srgb, var(--primary) 3%, transparent)" : "transparent" }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "var(--surface-raised)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
                }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 3 }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{meta.desc}</div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Chip variant="success-secondary" size="s">Active</Chip>
                  {via.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {via.slice(0, 2).map(v => (
                        <Chip key={v} variant="secondary" size="s">via {v}</Chip>
                      ))}
                      {via.length > 2 && <Chip variant="secondary" size="s">+{via.length - 2} more</Chip>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                  {!isEditingThis && (
                    <button
                      onClick={e => { e.stopPropagation(); setEditingStudio(s); setExpandedStudio(s) }}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                        borderRadius: 6, border: "1px solid var(--border)",
                        background: "var(--surface-raised)", color: "var(--foreground)",
                        cursor: "pointer", fontSize: 12, fontWeight: 500,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)" }}
                    >
                      <Icons.Pencil size={11} /> Edit
                    </button>
                  )}
                  {isExpanded
                    ? <Icons.ChevronDown size={14} style={{ color: "var(--primary)" }} />
                    : <Icons.ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />}
                </div>
              </div>
              {isExpanded && (
                <AppPermissionsInline
                  studioId={s}
                  isEditing={isEditingThis}
                  onSave={() => { setEditingStudio(null); setExpandedStudio(null) }}
                  onCancel={() => { setEditingStudio(null); setExpandedStudio(null) }}
                  onRemove={() => { setEditingStudio(null); setRemovingStudio(s) }}
                />
              )}
            </div>
          )
        })}
        {allAssigned && (
          <div style={{ textAlign: "center", padding: "6px 0", fontSize: 12, color: "var(--muted-foreground)" }}>
            This member has access to all available studios.
          </div>
        )}
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

      {/* Assign Role modal */}
      {assignOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, width: 400, maxHeight: 520, display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Assign Role</div>
              <button onClick={() => setAssignOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}><Icons.X size={16} /></button>
            </div>
            <div style={{ padding: "12px 20px 8px" }}>
              <div style={{ position: "relative" }}>
                <Icons.Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                <input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search roles…"
                  style={{ width: "100%", boxSizing: "border-box", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", outline: "none" }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
              {filteredUnassigned.length === 0 && (
                <div style={{ padding: "24px 8px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                  {roleSearch.trim() ? "No roles match your search" : "All roles are already assigned"}
                </div>
              )}
              {filteredUnassigned.map(role => (
                <button key={role.id} onClick={() => { onAssignRole(role.id); setAssignOpen(false); setRoleSearch("") }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", border: "none", borderRadius: 8, background: "transparent", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: role.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{role.label}</div>
                    {role.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{role.desc}</div>}
                  </div>
                  {role.system && <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "var(--surface-raised)", color: "var(--muted-foreground)", border: "1px solid var(--border)", flexShrink: 0 }}>System</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {assignedRoles.length} role{assignedRoles.length !== 1 ? "s" : ""} assigned
        </span>
        <button onClick={() => setAssignOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12, fontWeight: 600,
          border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--foreground)", cursor: "pointer",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          <Icons.Plus size={13} /> Assign Role
        </button>
      </div>

      {assignedRoles.length === 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <Icons.Shield size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No roles assigned</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Permissions are inherited from the member's user type only.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assignedRoles.map(role => {
          const perms = ROLE_PERM_COUNTS[role.id] ?? { total: 0 }
          const blocked = isLastAdminInRole(member.id, role.id, allRoles)
          const isEditingThis = editingRole === role.id
          return (
            <div key={role.id} style={{
              border: `1px solid ${isEditingThis ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 10, background: "var(--surface)", overflow: "hidden",
              transition: "border-color 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: role.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{role.label}</span>
                    {role.system && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "var(--surface-raised)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>System</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{role.desc}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right", marginRight: 4 }}>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>
                    {perms.total} permission{perms.total !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Assigned by Admin · 14 days ago</div>
                </div>
                <button
                  title="Go to role"
                  onClick={() => onNavigateToRole(role.id)}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
                >
                  <Icons.ExternalLink size={13} />
                </button>
                {!isEditingThis && (
                  <button
                    onClick={() => setEditingRole(role.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                      borderRadius: 6, border: "1px solid var(--border)",
                      background: "var(--surface-raised)", color: "var(--foreground)",
                      cursor: "pointer", fontSize: 12, fontWeight: 500,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)" }}
                  >
                    <Icons.Pencil size={11} /> Edit
                  </button>
                )}
              </div>
              {isEditingThis && (
                <div style={{
                  borderTop: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))",
                  background: "color-mix(in srgb, var(--primary) 3%, transparent)",
                  padding: "12px 18px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Button variant="secondary" size="sm" onClick={() => setEditingRole(null)}>Done</Button>
                  <div style={{ flex: 1 }} />
                  {blocked ? (
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                      Cannot remove — last admin in this role
                    </span>
                  ) : (
                    <button
                      onClick={() => { setEditingRole(null); setPendingRemove(role) }}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                        borderRadius: 6, border: "1px solid var(--badge-error)",
                        background: "color-mix(in srgb, var(--badge-error) 6%, transparent)",
                        color: "var(--badge-error)", cursor: "pointer", fontSize: 12, fontWeight: 500,
                      }}
                    >
                      <Icons.Trash2 size={11} /> Remove from role
                    </button>
                  )}
                </div>
              )}
            </div>
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

  function handleUndo() {
    if (!undoState) return
    clearTimeout(undoState.timer)
    onAddToGroup(undoState.group.id)
    setUndoState(null)
  }

  if (memberGroups.length === 0 && !undoState) {
    return (
      <>
        {/* Assign Group modal — shown even on empty state */}
        {assignOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, width: 400, maxHeight: 520, display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Assign Group</div>
                <button onClick={() => setAssignOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}><Icons.X size={16} /></button>
              </div>
              <div style={{ padding: "12px 20px 8px" }}>
                <div style={{ position: "relative" }}>
                  <Icons.Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                  <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)} placeholder="Search groups…"
                    style={{ width: "100%", boxSizing: "border-box", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", outline: "none" }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
                {filteredUnassigned.length === 0 && (
                  <div style={{ padding: "24px 8px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                    {groupSearch.trim() ? "No groups match your search" : "Member is already in all groups"}
                  </div>
                )}
                {filteredUnassigned.map(g => (
                  <button key={g.id} onClick={() => { onAddToGroup(g.id); setAssignOpen(false); setGroupSearch("") }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", border: "none", borderRadius: 8, background: "transparent", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${g.color}22`, border: `1px solid ${g.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: g.color, fontWeight: 700, fontSize: 11 }}>
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{g.memberIds.length} members · {g.studios.length} studios</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setAssignOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12, fontWeight: 600,
            border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--foreground)", cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
          >
            <Icons.Plus size={13} /> Assign Group
          </button>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <Icons.Users size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Not in any groups</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Groups define shared studio access and can be used to batch-assign permissions.</div>
        </div>
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
      {/* Assign Group modal */}
      {assignOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, width: 400, maxHeight: 520, display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Assign Group</div>
              <button onClick={() => setAssignOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}><Icons.X size={16} /></button>
            </div>
            <div style={{ padding: "12px 20px 8px" }}>
              <div style={{ position: "relative" }}>
                <Icons.Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)} placeholder="Search groups…"
                  style={{ width: "100%", boxSizing: "border-box", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", outline: "none" }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
              {filteredUnassigned.length === 0 && (
                <div style={{ padding: "24px 8px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                  {groupSearch.trim() ? "No groups match your search" : "Member is already in all groups"}
                </div>
              )}
              {filteredUnassigned.map(g => (
                <button key={g.id} onClick={() => { onAddToGroup(g.id); setAssignOpen(false); setGroupSearch("") }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", border: "none", borderRadius: 8, background: "transparent", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${g.color}22`, border: `1px solid ${g.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: g.color, fontWeight: 700, fontSize: 11 }}>
                    {g.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{g.memberIds.length} members · {g.studios.length} studios</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
        <button onClick={() => setAssignOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12, fontWeight: 600,
          border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--foreground)", cursor: "pointer",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          <Icons.Plus size={13} /> Assign Group
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {memberGroups.map(group => (
          <div key={group.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", border: "1px solid var(--border)", borderRadius: 10,
            background: "var(--surface)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: `${group.color}22`, border: `1px solid ${group.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: group.color, fontWeight: 700, fontSize: 12,
            }}>
              {group.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""} · {group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 140 }}>
              {group.studios.slice(0, 2).map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                  background: "var(--surface-raised)", color: "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                }}>{STUDIO_META[s]?.label ?? s}</span>
              ))}
              {group.studios.length > 2 && (
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>+{group.studios.length - 2}</span>
              )}
            </div>
            <button
              title="Go to group"
              onClick={() => onNavigateToGroup(group.id)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              <Icons.ExternalLink size={13} />
            </button>
            <button
              title="Remove from group"
              onClick={() => handleRemoveClick(group)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              <Icons.X size={14} />
            </button>
          </div>
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
          {hasChildren ? (expanded ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" /> : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />) : null}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: depth === 0 ? 600 : 400, color: "var(--foreground)" }}>{node.label}</span>
            {node.role && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              }}>via {node.role}</span>
            )}
            {node.scope && mode !== "edit" && <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {node.scope}</span>}
            {isPinned && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Pinned</span>}
            {hasOverride && !isPinned && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.4, textTransform: "uppercase" }}>Modified</span>}
          </div>
          {node.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{node.desc}</div>}
          {isInheritedOnly && <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1, fontStyle: "italic" }}>Inherited via role · toggle to confirm direct access</div>}
          {mode === "edit" && (
            <div style={{ marginTop: 6, opacity: isDirect ? 1 : 0.35, pointerEvents: isDirect ? "auto" : "none" }} onClick={e => e.stopPropagation()}>
              <SwitchTab size="s" items={SCOPE_ITEMS} value={scopeOverrides[node.id] ?? node.scope ?? "Own"} onChange={scope => onScopeChange(node.id, scope)} aria-label={`Scope for ${node.label}`} />
            </div>
          )}
        </div>
        <span onClick={e => e.stopPropagation()} style={{ paddingTop: 2 }}>
          <Toggle checked={isDirect} disabled={node.locked && node.state !== "g-inh"} size="sm" onChange={on => { onToggle(node.id, on) }} />
        </span>
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

const RESOURCE_TYPE_COLOR: Record<string, string> = {
  Dataset:    "var(--badge-info)",
  Model:      "var(--badge-success)",
  "Event Bus":"var(--badge-alert)",
  Sandbox:    "var(--muted-foreground)",
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
  const typeColor = RESOURCE_TYPE_COLOR[resource.type] ?? "var(--muted-foreground)"
  const isViaGroup = resource.grantPath === "via-group"
  const isViaRole  = resource.grantPath === "via-role"
  const isSystem   = resource.removable === false

  // Warnings in priority order
  const warnings: Array<{ icon: React.ReactNode; color: string; text: React.ReactNode }> = []

  if (isSystem) {
    warnings.push({
      icon: <Icons.Lock size={14} />,
      color: "var(--muted-foreground)",
      text: "This access is managed by the system and cannot be removed manually.",
    })
  } else if (resource.criticalAccess) {
    warnings.push({
      icon: <Icons.AlertTriangle size={14} />,
      color: "var(--badge-error)",
      text: <>Removing <strong>Owner</strong> access to <strong>{resource.name}</strong> may break {memberName}'s ability to manage or share this resource.</>,
    })
  }

  if (isViaGroup && !isSystem) {
    warnings.push({
      icon: <Icons.Users size={14} />,
      color: "var(--badge-alert)",
      text: <>This access comes from the <strong>{resource.groupName}</strong> group ({resource.groupMemberCount} members). Removing it here removes access for the <strong>entire group</strong>, not just this member.</>,
    })
  }

  if (isViaRole && !isSystem) {
    warnings.push({
      icon: <Icons.Shield size={14} />,
      color: "var(--badge-alert)",
      text: <>This access is inherited from the <strong>{resource.roleName}</strong> role. Removing it will revoke all permissions granted by that role on this resource.</>,
    })
  }

  if (resource.lastPath && !isSystem) {
    warnings.push({
      icon: <Icons.AlertCircle size={14} />,
      color: "var(--badge-error)",
      text: <>{memberName} has <strong>no other access path</strong> to this resource. After removal, they will lose access completely.</>,
    })
  }

  if (resource.dualPath && !isSystem) {
    warnings.push({
      icon: <Icons.CheckCircle size={14} />,
      color: "var(--badge-success)",
      text: <>Safe to remove — {memberName} will still be able to access <strong>{resource.name}</strong> via another path.</>,
    })
  }

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 10100, background: "rgba(0,0,0,0.5)" }} // audit-ignore: scrim
        onClick={onCancel}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        zIndex: 10101, width: 480, maxWidth: "90vw",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", // audit-ignore: modal shadow
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            {isSystem ? "Access is system-managed" : "Remove resource access?"}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {isSystem
              ? "This access cannot be changed from here."
              : `You're about to remove ${memberName}'s access to the resource below.`}
          </div>
        </div>

        {/* Resource card */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: typeColor, display: "flex", flexShrink: 0 }}>
              {RESOURCE_TYPE_ICON[resource.type] ?? <Icons.Layers size={16} />}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", fontFamily: "monospace" }}>{resource.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, marginLeft: 4,
              background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
              color: typeColor, border: `1px solid color-mix(in srgb, ${typeColor} 28%, transparent)`,
            }}>{resource.type}</span>
          </div>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px" }}>
            {[
              { label: "ACCESS",     value: resource.access    },
              { label: "SOURCE",     value: resource.source    },
              { label: "GRANTED",    value: resource.grantedAt },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--foreground)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
            {warnings.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: w.color, flexShrink: 0, marginTop: 1 }}>{w.icon}</span>
                <span style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.55 }}>{w.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={{
            padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8,
            border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer",
          }}>Cancel</button>
          {!isSystem && (
            <button onClick={onConfirm} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8,
              border: "none", cursor: "pointer",
              background: isViaGroup ? "var(--badge-alert)" : "var(--badge-error)",
              color: "#fff", // audit-ignore: white text on colored button
            }}>
              {isViaGroup ? `Remove from ${resource.groupName}` : "Remove access"}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function ResourcesPanel({ member }: { member: Member }) {
  const initialResources = MEMBER_RESOURCES[member.id] ?? []
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [pendingRemove, setPendingRemove] = useState<MemberResource | null>(null)
  const [justRemoved, setJustRemoved] = useState<string | null>(null)
  const [activeType, setActiveType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  const allResources = initialResources.filter(r => !removedIds.has(r.id))
  const uniqueTypes = Array.from(new Set(initialResources.map(r => r.type)))

  const { containerRef: typeContainerRef, slot: typeSlot, menu: typeMenu } = useFilterDropdown({
    placeholder: "Type",
    value: activeType,
    defaultValue: "all" as const,
    options: [
      { id: "all", label: "All types", count: allResources.length },
      ...uniqueTypes.map(t => ({ id: t, label: t, count: allResources.filter(r => r.type === t).length })),
    ],
    onChange: (id) => { setActiveType(id); setPage(1) },
  })

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
          {/* Filters row */}
          <div ref={typeContainerRef} style={{ position: "relative", marginBottom: 16 }}>
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
            {typeMenu}
          </div>

          {/* Table */}
          {resources.length === 0 && searchQuery.trim() && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
              No resources match "<strong>{searchQuery}</strong>"
            </div>
          )}
          {resources.length > 0 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 90px 100px 140px 100px 36px",
              padding: "9px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)",
            }}>
              <span>Resource</span><span>Type</span><span>Access</span><span>Granted by</span><span>When</span><span />
            </div>
            {pageResources.map((r, i) => {
              const typeColor = RESOURCE_TYPE_COLOR[r.type] ?? "var(--muted-foreground)"
              const typeIcon  = RESOURCE_TYPE_ICON[r.type] ?? <Icons.Layers size={13} />
              const isSystem  = r.removable === false
              return (
                <div key={r.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 90px 100px 140px 100px 36px",
                  padding: "10px 16px", borderBottom: i < resources.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: typeColor, display: "flex", flexShrink: 0 }}>{typeIcon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", fontFamily: "monospace" }}>{r.name}</span>
                    {isSystem && (
                      <span title="System-managed" style={{ display: "flex", color: "var(--muted-foreground)" }}>
                        <Icons.Lock size={11} />
                      </span>
                    )}
                    {r.dualPath && (
                      <span title="Accessible via another path" style={{ display: "flex", color: "var(--badge-success)" }}>
                        <Icons.GitMerge size={11} />
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                    background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
                    color: typeColor, border: `1px solid color-mix(in srgb, ${typeColor} 28%, transparent)`,
                    width: "fit-content",
                  }}>{r.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{r.access}</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "var(--foreground)" }}>{r.grantedBy}</span>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>{r.source}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.grantedAt}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setPendingRemove(r) }}
                    title={isSystem ? "System-managed — cannot be removed" : "Remove access"}
                    disabled={isSystem}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: isSystem ? "not-allowed" : "pointer",
                      color: isSystem ? "var(--muted-foreground)" : "var(--badge-error)",
                      opacity: isSystem ? 0.35 : 0.7,
                    }}
                    onMouseEnter={e => { if (!isSystem) (e.currentTarget as HTMLElement).style.opacity = "1" }}
                    onMouseLeave={e => { if (!isSystem) (e.currentTarget as HTMLElement).style.opacity = "0.7" }}
                  >
                    {isSystem ? <Icons.Lock size={12} /> : <Icons.Trash2 size={13} />}
                  </button>
                </div>
              )
            })}
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, resources.length)} of {resources.length}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                    background: "transparent", cursor: safePage === 1 ? "not-allowed" : "pointer",
                    color: safePage === 1 ? "var(--muted-foreground)" : "var(--foreground)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: safePage === 1 ? 0.4 : 1,
                  }}
                ><Icons.ChevronLeft size={14} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid",
                    borderColor: p === safePage ? "var(--primary)" : "var(--border)",
                    background: p === safePage ? "var(--primary)" : "transparent",
                    color: p === safePage ? "#fff" /* audit-ignore */ : "var(--foreground)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{p}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                    background: "transparent", cursor: safePage === totalPages ? "not-allowed" : "pointer",
                    color: safePage === totalPages ? "var(--muted-foreground)" : "var(--foreground)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: safePage === totalPages ? 0.4 : 1,
                  }}
                ><Icons.ChevronRight size={14} /></button>
              </div>
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
              const statusColor = STATUS_COLOR[m.status]
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
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--accent)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: m.status === "active" ? m.avatarColor : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff",  // audit-ignore: white on colored avatar
                  }}>{m.initials}</div>

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
                  <div style={{
                    minWidth: 72, textAlign: "center", flexShrink: 0,
                    padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: `${USER_TYPE_COLOR[m.role]}22`, color: USER_TYPE_COLOR[m.role],
                    border: `1px solid ${USER_TYPE_COLOR[m.role]}44`,
                  }}>
                    {m.role}
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
                  <div
                    title={m.mfaEnabled ? `MFA enabled (${m.mfaMethod ?? ""})` : "MFA not enabled"}
                    style={{
                      display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
                      padding: "3px 7px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      background: m.mfaEnabled
                        ? "color-mix(in srgb, var(--badge-success) 12%, transparent)"
                        : "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
                      color: m.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
                      border: `1px solid ${m.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 30%, transparent)" : "color-mix(in srgb, var(--badge-alert) 30%, transparent)"}`,
                    }}
                  >
                    {m.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
                    MFA
                  </div>

                  {/* Status */}
                  <div style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
                    minWidth: 76, textAlign: "center", flexShrink: 0,
                  }}>
                    {STATUS_LABEL[m.status]}
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
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center" }}
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
              const statusColor = STATUS_COLOR[m.status]
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
                  onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--accent)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: m.status === "active" ? m.avatarColor : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff",  // audit-ignore: white on colored avatar
                  }}>{m.initials}</div>

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
                  <div style={{
                    minWidth: 72, textAlign: "center", flexShrink: 0,
                    padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: `${USER_TYPE_COLOR[m.role]}22`, color: USER_TYPE_COLOR[m.role],
                    border: `1px solid ${USER_TYPE_COLOR[m.role]}44`,
                  }}>
                    {m.role}
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
                  <div
                    title={m.mfaEnabled ? `MFA enabled (${m.mfaMethod ?? ""})` : "MFA not enabled"}
                    style={{
                      display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
                      padding: "3px 7px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      background: m.mfaEnabled
                        ? "color-mix(in srgb, var(--badge-success) 12%, transparent)"
                        : "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
                      color: m.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
                      border: `1px solid ${m.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 30%, transparent)" : "color-mix(in srgb, var(--badge-alert) 30%, transparent)"}`,
                    }}
                  >
                    {m.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
                    MFA
                  </div>

                  {/* Status */}
                  <div style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
                    minWidth: 76, textAlign: "center", flexShrink: 0,
                  }}>
                    {STATUS_LABEL[m.status]}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={e => { e.stopPropagation(); handleRemoveMemberClick(m) }}
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
  const statusColor = STATUS_COLOR[member.status]

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
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: member.status === "active" ? member.avatarColor : "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
          color: member.status === "active" ? "#fff" : "var(--muted-foreground)",  // audit-ignore
          opacity: member.status === "suspended" ? 0.5 : 1,
        }}>{member.initials}</div>

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
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100,
            background: `${USER_TYPE_COLOR[member.role]}22`,
            color: USER_TYPE_COLOR[member.role],
            border: `1px solid ${USER_TYPE_COLOR[member.role]}44`,
          }}>
            {member.role}
          </span>
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
        <div
          title={member.mfaEnabled ? `MFA enabled (${member.mfaMethod ?? ""})` : "MFA not enabled"}
          style={{
            display: "flex", alignItems: "center", gap: 4, minWidth: 60, justifyContent: "center",
            padding: "3px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, flexShrink: 0,
            background: member.mfaEnabled
              ? "color-mix(in srgb, var(--badge-success) 12%, transparent)"
              : "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
            color: member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
            border: `1px solid ${member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 30%, transparent)" : "color-mix(in srgb, var(--badge-alert) 30%, transparent)"}`,
          }}
        >
          {member.mfaEnabled ? <Icons.ShieldCheck size={11} /> : <Icons.ShieldAlert size={11} />}
          MFA
        </div>

        {/* Status */}
        <div style={{
          padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
          background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
          minWidth: 76, textAlign: "center", flexShrink: 0,
        }}>
          {STATUS_LABEL[member.status]}
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
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
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
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--surface-raised)", border: "1.5px solid var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 7, fontWeight: 700, color: "var(--muted-foreground)",
          marginLeft: -4, flexShrink: 0,
        }}>+{overflow}</div>
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

// ─── Invite slide-out ─────────────────────────────────────────────────────────

const INVITE_STUDIOS = [
  { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={14} />, desc: "Policy management, data lineage and compliance" },
  { id: "datastudio", label: "Data Studio",       icon: <Icons.Database size={14} />,    desc: "Model authoring, datasets and schema design" },
  { id: "agentic",    label: "Agentic Studio",    icon: <Icons.Bot size={14} />,         desc: "AI worker configuration and agentic networks" },
  { id: "admin",      label: "Admin Console",     icon: <Icons.Settings size={14} />,    desc: "Platform settings, members, billing and integrations" },
]

const USER_TYPE_CARDS: Array<{ id: MemberRole; title: string; desc: string; icon: React.ReactNode }> = [
  { id: "Member", title: "Member", desc: "Access to assigned studios only",    icon: <Icons.User size={15} /> },
  { id: "Admin",  title: "Admin",  desc: "Manage members, studios & billing", icon: <Icons.ShieldCheck size={15} /> },
  { id: "Owner",  title: "Owner",  desc: "Full admin + transferable ownership", icon: <Icons.Crown size={15} /> },
]

function InviteSlideOut({ onClose, onSend }: {
  onClose: () => void
  onSend: (member: Member) => void
}) {
  const TOTAL_STEPS = 5
  const [step, setStep] = useState(0)

  // Step 0 – Identity
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [userType, setUserType] = useState<MemberRole>("Member")

  // Step 1 – Apps
  const [studios, setStudios] = useState<string[]>([])

  // Step 2 – Roles (optional)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  // Step 3 – Groups
  const [groupIds,    setGroupIds]    = useState<string[]>([])
  const [groupSearch, setGroupSearch] = useState("")

  // Step 4 – Review
  const [sendEmail, setSendEmail] = useState(true)

  const canNext = step === 0 ? email.trim().includes("@") : true

  const stepItems: StepItem[] = [
    { label: "Identity", state: step === 0 ? "active" : step > 0 ? "completed" : "default" },
    { label: "Apps",     state: step === 1 ? "active" : step > 1 ? "completed" : "default" },
    { label: "Roles",    state: step === 2 ? "active" : step > 2 ? "completed" : "default" },
    { label: "Groups",   state: step === 3 ? "active" : step > 3 ? "completed" : "default" },
    { label: "Review",   state: step === 4 ? "active" : "default" },
  ]

  function goNext() { if (step < TOTAL_STEPS - 1) setStep(s => s + 1); else sendInvite() }
  function goBack() { setStep(s => s - 1) }

  function sendInvite() {
    const displayName = name.trim() || email.split("@")[0]
    const parts = displayName.split(/\s+/).filter(Boolean)
    const initials = parts.slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?"
    const member: Member = {
      id: `inv-${Date.now()}`,
      name: displayName,
      email: email.trim().toLowerCase(),
      role: userType,
      status: "invited",
      lastActive: null,
      joinedAt: new Date().toISOString(),
      initials,
      avatarColor: nameToAvatarColor(displayName),
      title: "", department: "",
      mfaEnabled: false,
      sessions: [],
    }
    onSend(member)
    onClose()
  }

  const selectedRole = selectedRoleId ? (ROLES.find(r => r.id === selectedRoleId) ?? null) : null

  return createPortal(
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--background)",
      zIndex: 9000,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Page header */}
      <div style={{
        padding: "20px 32px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, borderRadius: 6, display: "flex" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          <Icons.ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>Invite member</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Step {step + 1} of {TOTAL_STEPS}</div>
        </div>
      </div>

      {/* Page-level Stepper */}
      <div style={{ padding: "20px 32px 0", flexShrink: 0 }}>
        <Stepper steps={stepItems} />
      </div>

      {/* Scrollable step content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {step === 0 && <InviteStepIdentity name={name} setName={setName} email={email} setEmail={setEmail} userType={userType} setUserType={setUserType} />}
        {step === 1 && <InviteStepApps studios={studios} setStudios={setStudios} />}
        {step === 2 && <InviteStepRoles selectedRoleId={selectedRoleId} setSelectedRoleId={setSelectedRoleId} />}
        {step === 3 && <InviteStepGroups groupIds={groupIds} setGroupIds={setGroupIds} groupSearch={groupSearch} setGroupSearch={setGroupSearch} />}
        {step === 4 && <InviteStepReview name={name} email={email} userType={userType} selectedRole={selectedRole} studios={studios} groupIds={groupIds} sendEmail={sendEmail} setSendEmail={setSendEmail} />}
      </div>

      {/* Page-level StepperNavFooter */}
      <StepperNavFooter
        variant={step === 0 ? "cancel-next" : "back-next"}
        cancelLabel="Cancel"
        onCancel={onClose}
        onBack={goBack}
        nextLabel={step === TOTAL_STEPS - 1 ? "Send invitation" : "Continue"}
        nextDisabled={!canNext}
        onNext={goNext}
      />
    </div>,
    document.body
  )
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────

function InviteStepIdentity({
  name, setName, email, setEmail, userType, setUserType,
}: {
  name: string; setName: (v: string) => void
  email: string; setEmail: (v: string) => void
  userType: MemberRole; setUserType: (v: MemberRole) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>Full name <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>(optional)</span></label>
        <input
          value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria García"
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", background: "var(--surface)", color: "var(--foreground)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>Work email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com"
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", background: "var(--surface)", color: "var(--foreground)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 8 }}>User type</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {USER_TYPE_CARDS.map(card => {
            const sel = userType === card.id
            return (
              <button key={card.id} onClick={() => setUserType(card.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left",
                background: sel ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface)",
              }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${sel ? "var(--primary)" : "var(--border)"}`, background: sel ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: sel ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: sel ? "var(--primary)" : "var(--foreground)" }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{card.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Apps ──────────────────────────────────────────────────────────────

function InviteStepApps({ studios, setStudios }: {
  studios: string[]; setStudios: (v: string[]) => void
}) {
  function toggleStudio(id: string) {
    setStudios(studios.includes(id) ? studios.filter(s => s !== id) : [...studios, id])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
        Select which apps this member can access. <span style={{ color: "var(--foreground)" }}>Optional.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {INVITE_STUDIOS.map(studio => {
          const sel = studios.includes(studio.id)
          return (
            <button
              key={studio.id}
              onClick={() => toggleStudio(studio.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left",
                background: sel ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "var(--surface)",
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${sel ? "var(--primary)" : "var(--border)"}`, background: sel ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sel && <Icons.Check size={10} color="white" />}
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: sel ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? "var(--primary)" : "var(--muted-foreground)" }}>
                {studio.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: sel ? "var(--primary)" : "var(--foreground)" }}>{studio.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{studio.desc}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 2: Roles ─────────────────────────────────────────────────────────────

function InviteStepRoles({ selectedRoleId, setSelectedRoleId }: {
  selectedRoleId: string | null
  setSelectedRoleId: (v: string | null) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
        Assign a role to grant a preset of permissions. <span style={{ color: "var(--foreground)" }}>Optional.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* No role option */}
        <div
          onClick={() => setSelectedRoleId(null)}
          style={{
            border: `1.5px solid ${selectedRoleId === null ? "var(--primary)" : "var(--border)"}`,
            background: selectedRoleId === null ? "color-mix(in srgb, var(--primary) 6%, var(--surface))" : "var(--surface)",
            borderRadius: 10, padding: 12, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6,
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: selectedRoleId === null ? "var(--primary)" : "var(--foreground)", flex: 1 }}>No role</span>
            <Tag variant="secondary" size="sm">None</Tag>
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: "18px", margin: 0 }}>Member gets access via groups or direct permissions only.</p>
        </div>
        {ROLES.map(role => {
          const sel = selectedRoleId === role.id
          const counts = ROLE_PERM_COUNTS[role.id]
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              style={{
                border: `1.5px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                background: sel ? "color-mix(in srgb, var(--primary) 6%, var(--surface))" : "var(--surface)",
                borderRadius: 10, padding: 12, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6,
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: sel ? "var(--primary)" : "var(--foreground)", flex: 1, minWidth: 0 }}>{role.label}</span>
                <Tag variant={role.system ? "secondary" : "informative"} size="sm">
                  {role.system ? "System" : "Custom"}
                </Tag>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-body)", lineHeight: "18px", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {role.desc}
              </p>
              {counts && (
                <div style={{ fontSize: 11, fontWeight: 500, color: sel ? "var(--primary)" : "var(--muted-foreground)", marginTop: "auto" }}>
                  {counts.total} permissions
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3: Groups ────────────────────────────────────────────────────────────

function InviteStepGroups({
  groupIds, setGroupIds, groupSearch, setGroupSearch,
}: {
  groupIds: string[]; setGroupIds: (v: string[]) => void
  groupSearch: string; setGroupSearch: (v: string) => void
}) {
  const filtered = GROUPS.filter(g => {
    const q = groupSearch.toLowerCase()
    return !q || g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setGroupIds(groupIds.includes(id) ? groupIds.filter(g => g !== id) : [...groupIds, id])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
        Group membership grants shared studio access and permissions. <span style={{ color: "var(--foreground)" }}>Optional.</span>
      </div>
      <div style={{ position: "relative" }}>
        <Icons.Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
        <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)} placeholder="Search groups…"
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px 8px 30px", background: "var(--surface)", color: "var(--foreground)", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(g => {
          const sel = groupIds.includes(g.id)
          return (
            <button key={g.id} onClick={() => toggle(g.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 8, cursor: "pointer", textAlign: "left",
              background: sel ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface)",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${sel ? "var(--primary)" : "var(--border)"}`, background: sel ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sel && <Icons.Check size={10} color="white" />}
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: sel ? "var(--primary)" : "var(--foreground)" }}>{g.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1, lineHeight: 1.3 }}>{g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""} · {g.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                {g.studios.slice(0, 2).map(s => (
                  <span key={s} style={{ fontSize: 10, color: "var(--muted-foreground)", padding: "1px 5px", border: "1px solid var(--border)", borderRadius: 4 }}>
                    {s === "governance" ? "Gov" : s === "datastudio" ? "Data" : s === "agentic" ? "Agentic" : "Admin"}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: "var(--muted-foreground)" }}>No groups match your search.</div>
        )}
      </div>
    </div>
  )
}

// ── Step 4 (was 5): Review ────────────────────────────────────────────────────

function InviteStepReview({
  name, email, userType, selectedRole, studios, groupIds, sendEmail, setSendEmail,
}: {
  name: string; email: string; userType: MemberRole
  selectedRole: Role | null
  studios: string[]; groupIds: string[]
  sendEmail: boolean; setSendEmail: (v: boolean) => void
}) {
  const displayName = name.trim() || email.split("@")[0]
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?"
  const selectedGroups = GROUPS.filter(g => groupIds.includes(g.id))

  function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 1 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13, color: "var(--foreground)" }}>{value}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--surface-raised)", borderRadius: 10, marginBottom: 16, border: "1px solid var(--border)" }}>
        <AvatarCircle name={displayName} initials={initials} colorKey={nameToAvatarColor(displayName)} sizeKey="lg" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>{displayName}</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{email}</div>
        </div>
        <div style={{ marginLeft: "auto" }}><Chip variant="secondary" size="s">{userType}</Chip></div>
      </div>

      <SummaryRow
        icon={<Icons.Shield size={14} />}
        label="Role"
        value={
          userType !== "Member"
            ? `${userType} — full workspace access`
            : selectedRole
              ? <span><span style={{ fontWeight: 600 }}>{selectedRole.label}</span>{` · ${ROLE_PERM_COUNTS[selectedRole.id]?.total ?? 0} permissions`}</span>
              : <span style={{ color: "var(--muted-foreground)" }}>No role assigned</span>
        }
      />
      <SummaryRow
        icon={<Icons.LayoutGrid size={14} />}
        label="Apps"
        value={
          studios.length === 0
            ? <span style={{ color: "var(--muted-foreground)" }}>No apps selected</span>
            : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {studios.map(id => (
                  <span key={id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "color-mix(in srgb, var(--primary) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", color: "var(--primary)", fontWeight: 500 }}>
                    {STUDIO_META[id]?.label ?? id}
                  </span>
                ))}
              </div>
            )
        }
      />
      <SummaryRow
        icon={<Icons.Users size={14} />}
        label="Groups"
        value={
          selectedGroups.length === 0
            ? <span style={{ color: "var(--muted-foreground)" }}>No groups selected</span>
            : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {selectedGroups.map(g => (
                  <span key={g.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: g.color, marginRight: 4, verticalAlign: "middle" }} />{g.name}
                  </span>
                ))}
              </div>
            )
        }
      />

      <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: sendEmail ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icons.Mail size={14} style={{ color: sendEmail ? "var(--primary)" : "var(--muted-foreground)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Send invitation email</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1, lineHeight: 1.4 }}>
            {sendEmail ? `An invite link will be sent to ${email}. Expires in 7 days.` : "Member will be created in a pending state with no email sent."}
          </div>
        </div>
        <Toggle checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} />
      </div>
    </div>
  )
}

// ─── Permissions breakdown ────────────────────────────────────────────────────

export type StudioPermRow = { id: string; label: string; value: number; max: number; names: string[] }

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

export function PermissionsBreakdown({ rows }: { rows: StudioPermRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(row => <StudioPermBreakdownRow key={row.id} row={row} />)}
    </div>
  )
}

function StudioPermBreakdownRow({ row }: { row: StudioPermRow }) {
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
        <Tag variant={empty ? "secondary" : (STUDIO_TAG[row.id] ?? "secondary")} size="sm">{row.value}</Tag>
      </div>
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
  member,
}: {
  member: Member
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
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
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
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
                border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
              }}>
                {perms.total} permissions
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onViewFull}
          style={{
            width: "100%", padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: "1px solid var(--border)", borderRadius: 8,
            background: "var(--surface-raised)", color: "var(--foreground)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <Icons.ExternalLink size={12} />
          {role.system ? "View role" : "Edit role"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px", flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
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
                onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--accent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
                }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100, flexShrink: 0,
                  background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status],
                  border: `1px solid ${STATUS_COLOR[m.status]}44`,
                }}>
                  {STATUS_LABEL[m.status]}
                </span>
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
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
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
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100,
                background: "color-mix(in srgb, var(--muted-foreground) 12%, transparent)",
                color: "var(--muted-foreground)",
                border: "1px solid color-mix(in srgb, var(--muted-foreground) 25%, transparent)",
              }}>
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
                border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
              }}>
                {group.studios.length} studio{group.studios.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px", flexShrink: 0 }}>
        <PreviewTabBar tabs={["Overview", "Members"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
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
                onMouseEnter={e => { if (onMemberClick) (e.currentTarget as HTMLDivElement).style.background = "var(--accent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
                }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100, flexShrink: 0,
                  background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status],
                  border: `1px solid ${STATUS_COLOR[m.status]}44`,
                }}>
                  {STATUS_LABEL[m.status]}
                </span>
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
  const [groups, setGroups]             = useState<Group[]>(GROUPS)
  const [detailView, setDetailView]     = useState<DetailView>(null)
  const [previewItem, setPreviewItem]   = useState<DetailView>(null)

  // The preview panel's footer CTA. One SlideOut hosts three preview types, so
  // the label and the destination are resolved from whichever is open — a
  // preview component no longer renders its own "open the full thing" button.
  const previewCta =
    previewItem?.type === "member" ? { label: "View full profile", onClick: () => { setDetailView(previewItem); setPreviewItem(null) } }
  : previewItem?.type === "role"   ? { label: previewItem.role.system ? "View role" : "Edit role", onClick: () => { setDetailView(previewItem); setPreviewItem(null) } }
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
    if (!q) return groups
    return groups.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  }, [groups, groupsQuery])

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
        <div ref={statusContainerRef} style={{ position: "relative", marginTop: 16, marginBottom: 16 }}>
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
          <MemberPreview
            member={previewItem.member}
          />
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

      {/* Invite slide-out */}
      {showInvite && (
        <InviteSlideOut
          onClose={() => setShowInvite(false)}
          onSend={member => setMembers(ms => [...ms, member])}
        />
      )}

      {roleForm !== null && (
        <RoleFormModal role={roleForm.role} onSave={handleRoleSave} onClose={() => setRoleForm(null)} />
      )}
    </ScreenLayout>
  )
}
