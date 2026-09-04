import { useState, useMemo } from "react"
import { useFilterDropdown } from "./voice-channel/shared"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { SwitchTab }    from "@/components/ui/switch-tab"
import { SlideOut }     from "@/components/ui/slide-out"
import { Filters }     from "@/components/ui/filters"

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

const GROUP_ACTIVITY: Record<string, Array<{ type: string; msg: string; time: string }>> = {
  engineering: [
    { type: "role",   msg: "Eduardo Suárez added to this group",         time: "Aug 9, 2026"  },
    { type: "edit",   msg: "Studio access updated — removed \"admin\"",  time: "Aug 3, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Mar 1, 2025"  },
  ],
  "ai-ops": [
    { type: "role",   msg: "Diana Pérez added to this group",            time: "Aug 10, 2026" },
    { type: "edit",   msg: "Studio access updated — added \"helix\"",    time: "Aug 5, 2026"  },
    { type: "create", msg: "Group created by Maria García",              time: "Jun 15, 2025" },
  ],
  "data-team": [
    { type: "role",   msg: "Maria García added to this group",           time: "Aug 5, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Apr 2, 2025"  },
  ],
  leadership: [
    { type: "edit",   msg: "Eduardo Suárez added to this group",         time: "Aug 1, 2026"  },
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Jan 15, 2025" },
  ],
  compliance: [
    { type: "create", msg: "Group created by Maria García",              time: "May 10, 2025" },
  ],
  external: [
    { type: "create", msg: "Group created by Thomas Gonzalez",           time: "Jul 22, 2025" },
  ],
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const STATUS_COLOR: Record<MemberStatus, string> = {
  active:    "var(--badge-success)",
  invited:   "var(--badge-light-blue)",
  suspended: "var(--muted-foreground)",
}
const STATUS_LABEL: Record<MemberStatus, string> = {
  active:    "Active",
  invited:   "Invited",
  suspended: "Suspended",
}
const USER_TYPE_COLOR: Record<UserType, string> = {
  "Owner":  "var(--badge-error)",
  "Admin":  "var(--badge-alert)",
  "Member": "var(--muted-foreground)",
}
// Keep alias for any legacy references in this file
const ROLE_COLOR = USER_TYPE_COLOR
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

function BackBreadcrumb({ label, onBack }: { label: string; onBack: () => void }) {
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
      People & Access / <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{label}</span>
    </button>
  )
}

function DetailTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 0, overflowX: "auto", scrollbarWidth: "none" }}>
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

function PermIcon({ state }: { state: PermState }) {
  if (state === "g-direct") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--primary)",
        background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icons.Check size={10} color={"#fff" /* audit-ignore: prototype fixture data */} strokeWidth={2.5} />

      </div>
    )
  }
  if (state === "g-inh") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--primary)",
        background: "color-mix(in srgb, var(--primary) 15%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--primary)", opacity: 0.8 }} />
      </div>
    )
  }
  if (state === "g-denied") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--badge-error)",
        background: "color-mix(in srgb, var(--badge-error) 12%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icons.X size={10} color="var(--badge-error)" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <div style={{
      width: 16, height: 16, borderRadius: 4,
      border: "1.5px solid var(--border)", flexShrink: 0,
    }} />
  )
}

function PermTreeNode({ node, depth = 0 }: { node: PermNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const hasChildren = (node.children?.length ?? 0) > 0
  const grantedChildren = node.children?.filter(c => c.state !== "").length ?? 0

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
        <PermIcon state={node.state} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{node.label}</span>
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
          {depth === 0 && hasChildren && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
              {grantedChildren} of {node.children?.length} permissions granted
            </div>
          )}
        </div>
        {node.locked && (
          <Icons.Lock size={11} color="var(--muted-foreground)" style={{ flexShrink: 0, opacity: 0.5 }} />
        )}
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

function PermissionsPanel() {
  const [studio, setStudio] = useState("governance")
  const [filter, setFilter] = useState("")
  const nodes = PERM_TREE[studio] ?? []

  const grantedCount = nodes.reduce((n, nd) => {
    let c = nd.state !== "" ? 1 : 0
    nd.children?.forEach(ch => { if (ch.state !== "") c++ })
    return n + c
  }, 0)
  const totalCount = nodes.reduce((n, nd) => n + 1 + (nd.children?.length ?? 0), 0)

  const filteredNodes = filter.trim()
    ? nodes.map(nd => ({
        ...nd,
        children: nd.children?.filter(ch =>
          ch.label.toLowerCase().includes(filter.toLowerCase()) ||
          ch.code.toLowerCase().includes(filter.toLowerCase())
        ),
      })).filter(nd =>
        nd.label.toLowerCase().includes(filter.toLowerCase()) ||
        (nd.children?.length ?? 0) > 0
      )
    : nodes

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Studio tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
        {STUDIO_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setStudio(t.id)}
            style={{
              flex: 1, padding: "10px 4px", fontSize: 12, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: studio === t.id ? "var(--primary)" : "var(--muted-foreground)",
              borderBottom: studio === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary + search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Icons.Search size={12} style={{
            position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
            color: "var(--muted-foreground)", pointerEvents: "none",
          }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter permissions…"
            style={{
              width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
              fontSize: 13, border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--surface)", color: "var(--foreground)", outline: "none",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{grantedCount}</span>
          <span> / {totalCount} granted</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, padding: "8px 16px",
        borderBottom: "1px solid var(--border)", background: "var(--surface-raised)",
      }}>
        {[
          { state: "g-direct" as PermState, label: "Direct" },
          { state: "g-inh"    as PermState, label: "Via role" },
          { state: "g-denied" as PermState, label: "Denied" },
          { state: ""         as PermState, label: "None" },
        ].map(l => (
          <div key={l.state} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PermIcon state={l.state} />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
            No permissions match "{filter}"
          </div>
        ) : (
          filteredNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
        )}
      </div>
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
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--border)",
          background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.ShieldCheck size={15} color={member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)"} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
              Multi-Factor Authentication
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 15%, transparent)" : "color-mix(in srgb, var(--badge-alert) 15%, transparent)",
            color: member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
            border: `1px solid ${member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 35%, transparent)" : "color-mix(in srgb, var(--badge-alert) 35%, transparent)"}`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
            {member.mfaEnabled ? "Enabled" : "Not enabled"}
          </div>
        </div>

        {member.mfaEnabled && member.mfaMethod ? (
          <div style={{ padding: "16px 20px" }}>
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
                  <button
                    onClick={() => setConfirmReset(true)}
                    style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-raised)", color: "var(--foreground)", cursor: "pointer" }}
                  >
                    Reset MFA enrollment
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--badge-error)", fontWeight: 600 }}>
                      Remove their MFA device? They'll re-enroll on next login.
                    </span>
                    <button
                      onClick={() => { onUpdate({ ...member, mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined }); setConfirmReset(false) }}
                      style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--badge-error)", color: "var(--badge-error)", background: "transparent", cursor: "pointer" }}
                    >
                      Yes, reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "transparent", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "16px 20px" }}>
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
                <button
                  onClick={() => alert(`Enrollment email sent to ${member.email}`)}
                  style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--primary)", color: "var(--primary)", background: "transparent", cursor: "pointer", flexShrink: 0, marginLeft: 16 }}
                >
                  Send reminder
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active sessions */}
      {!isInvited && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
          <div style={{
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.Monitor size={15} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Active sessions</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted-foreground)",
              }}>{sessions.length}</span>
            </div>
            {sessions.filter(s => !s.current).length > 0 && (
              <button
                onClick={revokeAllOthers}
                style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", border: "none", background: "none", cursor: "pointer" }}
              >
                Revoke all other sessions
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
              No active sessions
            </div>
          ) : sessions.map((s, i) => (
            <div
              key={s.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)",
              }}>
                {s.device.toLowerCase().includes("iphone") || s.device.toLowerCase().includes("ipad")
                  ? <Icons.Smartphone size={16} />
                  : s.device.toLowerCase().includes("macbook") || s.device.toLowerCase().includes("laptop")
                    ? <Icons.Laptop size={16} />
                    : <Icons.Monitor size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{s.device}</span>
                  {s.current && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                      background: "color-mix(in srgb, var(--badge-success) 15%, transparent)",
                      color: "var(--badge-success)", border: "1px solid color-mix(in srgb, var(--badge-success) 30%, transparent)",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>Current</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  {s.browser} · {s.location} · {formatRelative(s.lastActive)}
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--badge-error)"; e.currentTarget.style.color = "var(--badge-error)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Member detail page ───────────────────────────────────────────────────────

const USER_TYPE_OPTIONS: UserType[] = ["Owner", "Admin", "Member"]
const ROLE_OPTIONS = USER_TYPE_OPTIONS

function MemberDetailPage({
  member, onBack, onRoleChange, onToggleSuspend, onRemove, onUpdate,
}: {
  member: Member
  onBack: () => void
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (m: Member) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const statusColor = STATUS_COLOR[member.status]
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      header={() => (
        <Header
          size="compress"
          title={member.name}
          description={`${member.title ?? ""}${member.title && member.department ? " · " : ""}${member.department ?? ""}`}
        />
      )}
    >
      <BackBreadcrumb label={member.name} onBack={onBack} />

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginTop: 16, alignItems: "start" }}>

        {/* Left: identity card */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
          {/* Avatar + name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "28px 24px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface-raised)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: isActive ? member.avatarColor : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700,
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
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                {STATUS_LABEL[member.status]}
              </div>
            </div>
          </div>

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

            {/* Role picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)" }}>
                <Icons.ShieldCheck size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</span>
              </div>
              <select
                value={member.role}
                onChange={e => onRoleChange(member.id, e.target.value as MemberRole)}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--foreground)", cursor: "pointer", outline: "none",
                }}
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ margin: "0 16px 16px", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{
              padding: "8px 14px",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
              color: "var(--muted-foreground)", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
            }}>
              Actions
            </div>
            {!isInvited && (
              <DangerRow
                icon={isActive ? <Icons.UserX size={14} /> : <Icons.UserCheck size={14} />}
                label={isActive ? "Suspend access" : "Reactivate account"}
                desc={isActive ? "Block login and API access immediately" : "Restore login access for this member"}
                onClick={() => { onToggleSuspend(member.id); onBack() }}
              />
            )}
            {isInvited && (
              <DangerRow
                icon={<Icons.RefreshCw size={14} />}
                label="Resend invite"
                desc="Send a new invitation email to this address"
                onClick={() => alert(`Invite resent to ${member.email}`)}
              />
            )}
            {!confirmRemove ? (
              <DangerRow
                icon={<Icons.Trash2 size={14} />}
                label="Remove from workspace"
                desc="Permanently removes access. Cannot be undone."
                destructive
                onClick={() => setConfirmRemove(true)}
              />
            ) : (
              <div style={{ padding: "14px", background: "color-mix(in srgb, var(--badge-error) 8%, transparent)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--badge-error)", marginBottom: 6 }}>
                  Remove {member.name}?
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
                  They will lose all access immediately. This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { onRemove(member.id); onBack() }}
                    style={{ flex: 1, padding: "7px 0", border: "1px solid var(--badge-error)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--badge-error)", background: "none", cursor: "pointer" }}
                  >
                    Yes, remove
                  </button>
                  <button
                    onClick={() => setConfirmRemove(false)}
                    style={{ flex: 1, padding: "7px 0", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "var(--foreground)", background: "var(--surface)", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: tabs */}
        <div>
          <DetailTabs
            tabs={["Overview", "Apps", "Roles", "Groups", "Permissions", "Resources", "Security", "Activity"]}
            active={activeTab}
            onChange={setActiveTab}
          />
          <div style={{ marginTop: 20 }}>
            {activeTab === 0 && <OverviewPanel member={member} />}
            {activeTab === 1 && <AppsPanel member={member} />}
            {activeTab === 2 && <MemberRolesPanel member={member} />}
            {activeTab === 3 && <MemberGroupsPanel member={member} />}
            {activeTab === 4 && <MemberPermissionsPanel member={member} />}
            {activeTab === 5 && <ResourcesPanel member={member} />}
            {activeTab === 6 && <SecurityPanel member={member} onUpdate={onUpdate} />}
            {activeTab === 7 && <ActivityPanel />}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

type StudioUsage = {
  id: string
  label: string
  icon: React.ReactNode
  role: string
  lastUsed: string
  tokensMonth: number
  tokensLimit: number
  status: "active" | "idle" | "none"
}

const STUDIO_USAGE_FIXTURE: Record<string, StudioUsage[]> = {
  tg: [
    { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={15} />, role: "Owner", lastUsed: "Today",     tokensMonth: 142000, tokensLimit: 200000, status: "active" },
    { id: "datastudio", label: "Data Studio",        icon: <Icons.Database size={15} />,    role: "Owner", lastUsed: "Yesterday", tokensMonth: 87500,  tokensLimit: 200000, status: "active" },
    { id: "agentic",    label: "Agentic Studio",     icon: <Icons.Bot size={15} />,          role: "Owner", lastUsed: "3d ago",    tokensMonth: 34200,  tokensLimit: 200000, status: "idle" },
    { id: "admin",      label: "Admin Console",      icon: <Icons.Settings size={15} />,     role: "Owner", lastUsed: "Today",     tokensMonth: 12800,  tokensLimit: 200000, status: "active" },
  ],
  mg: [
    { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={15} />, role: "Admin", lastUsed: "Today",  tokensMonth: 98000, tokensLimit: 150000, status: "active" },
    { id: "datastudio", label: "Data Studio",        icon: <Icons.Database size={15} />,    role: "Admin", lastUsed: "2d ago", tokensMonth: 41000, tokensLimit: 150000, status: "idle" },
    { id: "admin",      label: "Admin Console",      icon: <Icons.Settings size={15} />,     role: "Admin", lastUsed: "Today",  tokensMonth: 6200,  tokensLimit: 150000, status: "active" },
  ],
}

const DEFAULT_STUDIO_USAGE: StudioUsage[] = [
  { id: "governance", label: "Governance Studio", icon: <Icons.ShieldCheck size={15} />, role: "Viewer", lastUsed: "5d ago", tokensMonth: 12000, tokensLimit: 80000, status: "idle" },
]

function TokenBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const color = pct >= 90 ? "var(--badge-error, #ef4444)" : pct >= 70 ? "var(--badge-alert)" : "var(--badge-success)" // audit-ignore: hex is CSS var fallback
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap", minWidth: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {(used / 1000).toFixed(0)}K / {(limit / 1000).toFixed(0)}K
      </span>
    </div>
  )
}

function OverviewPanel({ member }: { member: Member }) {
  const studios = STUDIO_USAGE_FIXTURE[member.id] ?? DEFAULT_STUDIO_USAGE
  const totalTokens = studios.reduce((s, u) => s + u.tokensMonth, 0)
  const totalLimit  = studios.reduce((s, u) => s + u.tokensLimit, 0)
  const activeCount = studios.filter(u => u.status === "active").length

  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))
  const permCount = (PERM_TREE["governance"] ?? []).flatMap(n => [n, ...(n.children ?? [])]).filter(n => n.state === "g-direct" || n.state === "g-inh").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Active studios",  value: activeCount,           icon: <Icons.LayoutDashboard size={14} />, color: "var(--primary)" },
          { label: "Groups",          value: memberGroups.length,   icon: <Icons.Users size={14} />,           color: "var(--badge-info)" },
          { label: "Permissions",     value: permCount,             icon: <Icons.ShieldCheck size={14} />,    color: "var(--badge-success)" },
          { label: "Tokens this month", value: `${(totalTokens / 1000).toFixed(0)}K`, icon: <Icons.Zap size={14} />, color: "var(--badge-alert)" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color }}>{icon}</span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Active Studios */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Studio access</span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{studios.length} studio{studios.length !== 1 ? "s" : ""}</span>
        </div>
        {studios.map((s, i) => (
          <div key={s.id} style={{
            display: "grid", gridTemplateColumns: "28px 1fr 80px 90px 8px",
            padding: "11px 16px", gap: 12, alignItems: "center",
            borderBottom: i < studios.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: "color-mix(in srgb, var(--primary) 12%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)",
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>Role: {s.role} · Last used: {s.lastUsed}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 4 }}>Token usage</div>
              <TokenBar used={s.tokensMonth} limit={s.tokensLimit} />
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                background: s.status === "active"
                  ? "color-mix(in srgb, var(--badge-success) 14%, transparent)"
                  : "color-mix(in srgb, var(--muted-foreground) 12%, transparent)",
                color: s.status === "active" ? "var(--badge-success)" : "var(--muted-foreground)",
                border: s.status === "active"
                  ? "1px solid color-mix(in srgb, var(--badge-success) 28%, transparent)"
                  : "1px solid var(--border)",
              }}>
                {s.status === "active" ? "Active" : "Idle"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Token usage summary */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>Token usage — September 2026</span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{Math.round((totalTokens / totalLimit) * 100)}% of total allocation</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {studios.map(s => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--muted-foreground)" }}>{s.icon}</span>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.label.replace(" Studio", "").replace(" Console", "")}</span>
              </div>
              <TokenBar used={s.tokensMonth} limit={s.tokensLimit} />
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>Total</span>
            <TokenBar used={totalTokens} limit={totalLimit} />
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Apps tab ─────────────────────────────────────────────────────────────────

function AppsPanel({ member }: { member: Member }) {
  const memberGroups = GROUPS.filter(g => g.memberIds.includes(member.id))
  const studioSet = new Set<string>(member.role === "Owner" || member.role === "Admin" ? Object.keys(STUDIO_META) : [])
  memberGroups.forEach(g => g.studios.forEach(s => studioSet.add(s)))
  const studios = Array.from(studioSet)

  if (studios.length === 0) {
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
        <Icons.AppWindow size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>No apps assigned</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Add this member to a group with studio access, or assign a role that includes studio permissions.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {studios.map(s => {
        const meta = STUDIO_META[s]
        if (!meta) return null
        const via = memberGroups.filter(g => g.studios.includes(s)).map(g => g.name)
        return (
          <div key={s} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 18px", border: "1px solid var(--border)", borderRadius: 10,
            background: "var(--surface)",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "var(--surface-raised)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)",
            }}>{meta.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{meta.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{meta.desc}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--badge-success)", marginBottom: 3 }}>Active</div>
              {via.length > 0 && (
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                  via {via.slice(0, 2).join(", ")}{via.length > 2 ? ` +${via.length - 2}` : ""}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
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
          <div key={role.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", border: "1px solid var(--border)", borderRadius: 10,
            background: "var(--surface)",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: role.color,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{role.label}</span>
                {role.system && (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "var(--surface-raised)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>System</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{role.desc}</div>
            </div>
            <div style={{ flexShrink: 0, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
              {perms.total} permission{perms.total !== 1 ? "s" : ""}
            </div>
          </div>
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
          <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 180 }}>
            {group.studios.slice(0, 3).map(s => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: "var(--surface-raised)", color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}>{STUDIO_META[s]?.label ?? s}</span>
            ))}
            {group.studios.length > 3 && (
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>+{group.studios.length - 3}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Permissions tab (dual-mode: Audit / Edit) ───────────────────────────────

const GRANTED_STATES: PermState[] = ["g-direct", "g-inh"]

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
const PERM_CYCLE: PermState[] = ["", "g-direct", "g-denied"]

function EditPermIcon({ base, override, locked, onCycle }: {
  base: PermState; override: PermState | undefined; locked?: boolean; onCycle: () => void
}) {
  const effective = override !== undefined ? override : base
  if (locked) return <PermIcon state={effective} />
  return (
    <button onClick={e => { e.stopPropagation(); onCycle() }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <PermIcon state={effective} />
      {override !== undefined && override !== base && (
        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.3 }}>OVERRIDE</span>
      )}
    </button>
  )
}

function EditablePermTreeNode({ node, depth, overrides, onCycle }: {
  node: PermNode; depth: number; overrides: PermOverrides; onCycle: (id: string, current: PermState) => void
}) {
  const effective = overrides[node.id] !== undefined ? overrides[node.id] : node.state
  const [expanded, setExpanded] = useState(depth === 0 && (node.state === "g-inh" || node.state === "g-direct"))
  const hasChildren = node.children && node.children.length > 0
  return (
    <div>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 6px", paddingLeft: depth * 20, cursor: hasChildren ? "pointer" : "default", borderRadius: 6 }}
      >
        {hasChildren ? (
          <span style={{ fontSize: 10, color: "var(--muted-foreground)", width: 12, textAlign: "center" }}>{expanded ? "▾" : "▸"}</span>
        ) : (
          <span style={{ width: 12 }} />
        )}
        <EditPermIcon base={node.state} override={overrides[node.id]} locked={node.locked} onCycle={() => onCycle(node.id, effective)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: depth === 0 ? 600 : 400, color: "var(--foreground)" }}>{node.label}</div>
          {node.desc && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{node.desc}</div>}
        </div>
        {node.role && <span style={{ fontSize: 10, color: "var(--muted-foreground)", flexShrink: 0 }}>via {node.role}</span>}
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <EditablePermTreeNode key={child.id} node={child} depth={depth + 1} overrides={overrides} onCycle={onCycle} />
      ))}
    </div>
  )
}

function MemberPermissionsPanel({ member: _member }: { member: Member }) {
  const [mode, setMode] = useState<PermMode>("audit")
  const [studio, setStudio] = useState("governance")
  const [filter, setFilter] = useState("")
  const [overrides, setOverrides] = useState<PermOverrides>({})
  const [saved, setSaved] = useState(false)

  const nodes = PERM_TREE[studio] ?? []
  const isDirty = Object.keys(overrides).length > 0

  function cyclePermission(id: string, current: PermState) {
    const idx = PERM_CYCLE.indexOf(current)
    const next = PERM_CYCLE[(idx + 1) % PERM_CYCLE.length]
    setOverrides(prev => {
      const allNodes = nodes.flatMap(n => [n, ...(n.children ?? [])])
      const node = allNodes.find(n => n.id === id)
      if (node && next === node.state) {
        const copy = { ...prev }; delete copy[id]; return copy
      }
      return { ...prev, [id]: next }
    })
    setSaved(false)
  }

  function handleDiscard() { setOverrides({}); setSaved(false) }
  function handleSave() {
    setOverrides({}); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const filterLower = filter.toLowerCase()
  const baseNodes = mode === "audit" ? filterGrantedTree(nodes) : nodes
  const visibleNodes = filter
    ? baseNodes.filter(n => n.label.toLowerCase().includes(filterLower) || n.children?.some(c => c.label.toLowerCase().includes(filterLower)))
    : baseNodes

  return (
    <div>
      {/* Mode toggle + Save/Discard */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", background: "var(--muted)", borderRadius: 6, padding: 2 }}>
          {(["audit", "edit"] as PermMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m === "audit") handleDiscard() }}
              style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 5, cursor: "pointer",
                background: mode === m ? "var(--background)" : "transparent",
                color: mode === m ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {m === "audit" ? "Audit" : "Edit"}
            </button>
          ))}
        </div>
        {mode === "edit" && isDirty && (
          <>
            <button onClick={handleSave} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, cursor: "pointer", background: "var(--primary)", color: "#fff" /* audit-ignore */ }}>Save</button>
            <button onClick={handleDiscard} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "none", color: "var(--foreground)" }}>Discard</button>
          </>
        )}
        {saved && <span style={{ fontSize: 12, color: "var(--success, #22c55e)" /* audit-ignore */ }}>Saved</span>}
      </div>

      {/* Studio sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {STUDIO_TABS.map(s => (
          <button key={s.id} onClick={() => setStudio(s.id)} style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer",
            color: studio === s.id ? "var(--foreground)" : "var(--muted-foreground)",
            borderBottom: studio === s.id ? "2px solid var(--primary)" : "2px solid transparent", marginBottom: -9 }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter permissions…"
          style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)", color: "var(--foreground)", boxSizing: "border-box" }} />
      </div>

      {/* Tree */}
      <div>
        {mode === "audit"
          ? visibleNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
          : visibleNodes.map(n => <EditablePermTreeNode key={n.id} node={n} depth={0} overrides={overrides} onCycle={cyclePermission} />)
        }
        {visibleNodes.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "20px 0", textAlign: "center" }}>No permissions match "{filter}"</div>
        )}
      </div>
    </div>
  )
}

// ─── Resources tab ────────────────────────────────────────────────────────────

type MemberResource = { name: string; type: string; scope: string; access: string; source: string }

const MEMBER_RESOURCES: Record<string, MemberResource[]> = {
  tg: [
    { name: "customer_360",        type: "Dataset",   scope: "Tenant",    access: "Owner",       source: "Direct" },
    { name: "fraud_signals_v2",    type: "Model",     scope: "Tenant",    access: "Owner",       source: "Direct" },
    { name: "platform_events",     type: "Event Bus", scope: "Tenant",    access: "Owner",       source: "Direct" },
    { name: "governance_audit_log",type: "Dataset",   scope: "Tenant",    access: "Read",        source: "via Leadership" },
    { name: "sandbox_env_prod",    type: "Sandbox",   scope: "Own",       access: "Manager",     source: "via Leadership" },
  ],
  mg: [
    { name: "employee_directory",  type: "Dataset",   scope: "IT",        access: "Manager",     source: "Direct" },
    { name: "access_audit_log",    type: "Dataset",   scope: "IT",        access: "Read",        source: "via IT Admin" },
    { name: "hr_events_stream",    type: "Event Bus", scope: "IT",        access: "Read",        source: "via IT Admin" },
  ],
  es: [
    { name: "revenue_pipeline",    type: "Model",     scope: "Analytics", access: "Contributor", source: "Direct" },
    { name: "churn_predictions",   type: "Model",     scope: "Analytics", access: "Read",        source: "via Analytics" },
    { name: "user_events",         type: "Event Bus", scope: "Analytics", access: "Read",        source: "via Analytics" },
  ],
  sb: [
    { name: "risk_scoring_v3",     type: "Model",     scope: "Risk",      access: "Read",        source: "Direct" },
    { name: "compliance_reports",  type: "Dataset",   scope: "Risk",      access: "Read",        source: "via Compliance" },
  ],
  dp: [
    { name: "ops_metrics",         type: "Dataset",   scope: "Ops",       access: "Contributor", source: "Direct" },
    { name: "ops_events",          type: "Event Bus", scope: "Ops",       access: "Read",        source: "via Operations" },
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

function ResourcesPanel({ member }: { member: Member }) {
  const allResources = MEMBER_RESOURCES[member.id] ?? []
  const types = ["All", ...Array.from(new Set(allResources.map(r => r.type)))]
  const [activeType, setActiveType] = useState("All")

  const resources = activeType === "All" ? allResources : allResources.filter(r => r.type === activeType)

  if (allResources.length === 0) {
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
      {/* Type filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setActiveType(t)} style={{
            padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 20,
            border: "1px solid", cursor: "pointer",
            background: activeType === t ? "var(--primary)" : "transparent",
            color: activeType === t ? "#fff" /* audit-ignore */ : "var(--muted-foreground)",
            borderColor: activeType === t ? "var(--primary)" : "var(--border)",
          }}>{t}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted-foreground)", alignSelf: "center" }}>
          {resources.length} resource{resources.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 90px 90px 100px 100px",
          padding: "9px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)",
        }}>
          <span>Resource</span><span>Type</span><span>Scope</span><span>Access</span><span>Source</span>
        </div>
        {resources.map((r, i) => {
          const typeColor = RESOURCE_TYPE_COLOR[r.type] ?? "var(--muted-foreground)"
          const typeIcon  = RESOURCE_TYPE_ICON[r.type] ?? <Icons.Layers size={13} />
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 90px 100px 100px",
              padding: "11px 16px", borderBottom: i < resources.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: typeColor, display: "flex", flexShrink: 0 }}>{typeIcon}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", fontFamily: "monospace" }}>{r.name}</span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
                color: typeColor, border: `1px solid color-mix(in srgb, ${typeColor} 28%, transparent)`,
                width: "fit-content",
              }}>{r.type}</span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{r.scope}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{r.access}</span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: r.source.startsWith("via") ? "italic" : "normal" }}>{r.source}</span>
            </div>
          )
        })}
      </div>
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

function DangerRow({ icon, label, desc, destructive, onClick }: {
  icon: React.ReactNode; label: string; desc: string; destructive?: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
        background: hov ? (destructive ? "color-mix(in srgb, var(--badge-error) 8%, transparent)" : "var(--accent)") : "transparent",
        border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.1s",
      }}
    >
      <div style={{ color: destructive ? "var(--badge-error)" : "var(--muted-foreground)", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: destructive ? "var(--badge-error)" : "var(--foreground)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{desc}</div>
      </div>
    </button>
  )
}

// ─── Role detail page ─────────────────────────────────────────────────────────

function RoleDetailPage({ role, onBack }: { role: Role; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="people"
      header={() => (
        <Header
          size="compress"
          title={role.label}
          description={role.desc}
          primaryAction={!role.system ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">Edit role</Button>
              <Button variant="secondary" size="sm">Delete role</Button>
            </div>
          ) : undefined}
        />
      )}
    >
      <BackBreadcrumb label={role.label} onBack={onBack} />

      {/* Color accent + identity row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginTop: 16, marginBottom: 24,
        padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 12,
        background: "var(--surface)", borderLeft: `4px solid ${role.color}`,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
              background: role.system ? "var(--surface-raised)" : `${role.color}22`,
              color: role.system ? "var(--muted-foreground)" : role.color,
              border: `1px solid ${role.system ? "var(--border)" : role.color + "55"}`,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {role.system ? "System" : "Custom"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>{role.desc}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{members.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>members</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{perms.total}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>permissions</div>
          </div>
        </div>
      </div>

      <DetailTabs tabs={["Overview", "Members", "Permissions"]} active={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 20 }}>
        {/* Overview */}
        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {([
              { label: "Governance",  value: perms.governance, color: "#8b5cf6" },  // audit-ignore: prototype fixture data
              { label: "Data Studio", value: perms.datastudio, color: "#10b981" },  // audit-ignore: prototype fixture data
              { label: "Agentic",     value: perms.agentic,    color: "#f97316" },  // audit-ignore: prototype fixture data
              { label: "Admin",       value: perms.admin,      color: "#6366f1" },  // audit-ignore: prototype fixture data
            ] as const).map(s => (
              <div key={s.label} style={{
                padding: "20px 24px", borderRadius: 12,
                background: "var(--surface)", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.value > 0 ? "var(--foreground)" : "var(--muted-foreground)", opacity: s.value > 0 ? 1 : 0.4, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                  permission{s.value !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members */}
        {activeTab === 1 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid var(--border)",
              background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <b style={{ color: "var(--foreground)" }}>{members.length}</b> member{members.length !== 1 ? "s" : ""} assigned this role
              </span>
              {!role.system && (
                <button style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", border: "none", background: "none", cursor: "pointer" }}>
                  + Assign members
                </button>
              )}
            </div>
            {members.length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.Users size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No members assigned</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Assign members to grant them this role's permissions</div>
              </div>
            ) : members.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: m.status === "active" ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
                }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status] }}>
                  {STATUS_LABEL[m.status]}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Permissions */}
        {activeTab === 2 && <PermissionsPanel />}
      </div>
    </ScreenLayout>
  )
}

// ─── Group detail page ────────────────────────────────────────────────────────

const ACTIVITY_TYPE_ICON_GROUP: Record<string, React.ReactNode> = {
  role:   <Icons.UserPlus size={14} />,
  edit:   <Icons.Settings size={14} />,
  create: <Icons.PlusCircle size={14} />,
  remove: <Icons.UserMinus size={14} />,
}

function GroupDetailPage({ group: initialGroup, onBack }: { group: Group; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const [group, setGroup] = useState(initialGroup)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const groupMembers = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const log = GROUP_ACTIVITY[group.id] ?? []
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
      header={() => (
        <Header
          size="compress"
          title={group.name}
          description={group.desc}
          primaryAction={
            <Button variant="primary" size="sm">
              <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
              Add member
            </Button>
          }
        />
      )}
    >
      <BackBreadcrumb label={group.name} onBack={onBack} />

      {/* Group identity bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginTop: 16, marginBottom: 24,
        padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 12,
        background: "var(--surface)", borderLeft: `4px solid ${group.color}`,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{group.name}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {group.studios.length === 0 ? (
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", opacity: 0.6 }}>No studios</span>
            ) : group.studios.map(s => {
              const meta = STUDIO_META[s]
              return (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                  background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}44`,
                }}>
                  {meta.label}
                </span>
              )
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{groupMembers.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>members</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>{group.studios.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>studios</div>
          </div>
        </div>
      </div>

      <DetailTabs tabs={["Members", "Settings", "Activity"]} active={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 20 }}>
        {/* Members */}
        {activeTab === 0 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid var(--border)",
              background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <b style={{ color: "var(--foreground)" }}>{groupMembers.length}</b> member{groupMembers.length !== 1 ? "s" : ""}
              </span>
              <button style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", border: "none", background: "none", cursor: "pointer" }}>
                + Add member
              </button>
            </div>
            {groupMembers.length === 0 ? (
              <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                <Icons.Users size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No members yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Add members to this group to grant them shared access</div>
              </div>
            ) : groupMembers.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: m.status === "active" ? m.avatarColor : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: m.status === "active" ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
                }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}{m.title && m.department ? " · " : ""}{m.department}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status], flexShrink: 0 }}>
                  {STATUS_LABEL[m.status]}
                </div>
                <button
                  onClick={() => removeMember(m.id)}
                  title="Remove from group"
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6, flexShrink: 0, borderRadius: 6 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--badge-error)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
                >
                  <Icons.X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Studio access */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", background: "var(--surface)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 14 }}>
                Studio access
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {allStudios.map(s => {
                  const meta = STUDIO_META[s]
                  const active = group.studios.includes(s)
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStudio(s)}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: `1px solid ${active ? meta.color : "var(--border)"}`,
                        background: active ? `${meta.color}1a` : "transparent",
                        color: active ? meta.color : "var(--muted-foreground)",
                        display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                      }}
                    >
                      {active
                        ? <Icons.Check size={12} strokeWidth={2.5} />
                        : <div style={{ width: 8, height: 8, borderRadius: "50%", background: `${meta.color}66` }} />}
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ border: "1px solid color-mix(in srgb, var(--badge-error) 30%, transparent)", borderRadius: 12, padding: "20px 24px", background: "color-mix(in srgb, var(--badge-error) 5%, transparent)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--badge-error)", marginBottom: 8 }}>
                Danger zone
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
                Deleting this group removes it permanently. Members are not removed from the workspace.
              </div>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--badge-error)", color: "var(--badge-error)", background: "transparent", cursor: "pointer" }}
                >
                  Delete group
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--badge-error)", marginBottom: 10 }}>Are you sure? This cannot be undone.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onBack} style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--badge-error)", color: "#fff", /* audit-ignore: prototype fixture data */ background: "var(--badge-error)", cursor: "pointer" }}>
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--surface)", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity */}
        {activeTab === 2 && (
          log.length === 0 ? (
            <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: 12 }}>
              No activity yet
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {log.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 20px", borderBottom: i < log.length - 1 ? "1px solid var(--border)" : "none", alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "var(--surface-raised)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)",
                  }}>
                    {ACTIVITY_TYPE_ICON_GROUP[ev.type] ?? <Icons.Circle size={14} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.4 }}>{ev.msg}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
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
  const statusColor = STATUS_COLOR[member.status]

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    const btn = (e.currentTarget as HTMLElement)
    const rect = btn.getBoundingClientRect()
    setMenuAnchor({ top: rect.bottom + 4, left: rect.left + rect.width / 2 })
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
            transform: "translateX(-50%)", zIndex: 10001,
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

function RoleCard({ role, onSelect }: { role: Role; onSelect: (r: Role) => void }) {
  const [hovered, setHovered] = useState(false)
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div
      onClick={() => onSelect(role)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
        background: hovered ? "var(--accent)" : "var(--surface)",
        cursor: "pointer", transition: "background 0.1s, box-shadow 0.1s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.08)" : "none",  // audit-ignore: prototype fixture data
      }}
    >
      <div style={{ height: 5, background: role.color }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
            background: role.system ? "var(--surface-raised)" : `${role.color}22`,
            color: role.system ? "var(--muted-foreground)" : role.color,
            border: `1px solid ${role.system ? "var(--border)" : role.color + "44"}`,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {role.system ? "System" : "Custom"}
          </span>
        </div>
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {role.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div key={m.id} title={m.name} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: m.status === "active" ? m.avatarColor : "var(--muted)",
                border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
                marginLeft: i > 0 ? -6 : 0, flexShrink: 0, position: "relative",
                zIndex: visible.length - i,
              }}>{m.initials}</div>
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
            <button
              onClick={() => onSelect(role)}
              style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", cursor: "pointer" }}
            >
              {role.system ? "View" : "Edit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onSelect }: { group: Group; onSelect: (g: Group) => void }) {
  const [hovered, setHovered] = useState(false)
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const visible = members.slice(0, 5)
  const overflow = members.length - visible.length

  return (
    <div
      onClick={() => onSelect(group)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
        background: hovered ? "var(--accent)" : "var(--surface)",
        cursor: "pointer", transition: "background 0.1s, box-shadow 0.1s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.08)" : "none",  // audit-ignore: prototype fixture data
      }}
    >
      <div style={{ height: 5, background: group.color }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{group.name}</div>
        <p style={{
          fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 12px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {group.desc}
        </p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, minHeight: 22 }}>
          {group.studios.length === 0 ? (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.5 }}>No studios</span>
          ) : group.studios.map(s => {
            const meta = STUDIO_META[s]
            return (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}44`,
              }}>
                {meta.label}
              </span>
            )
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
              <div key={m.id} title={m.name} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: m.status === "active" ? m.avatarColor : "var(--muted)",
                border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
                marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                position: "relative", zIndex: visible.length - i,
              }}>{m.initials}</div>
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
            <button
              onClick={() => onSelect(group)}
              style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", cursor: "pointer" }}
            >
              Manage
            </button>
          </div>
        </div>
      </div>
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
  const [emailInput, setEmailInput]   = useState("")
  const [emails, setEmails]           = useState<string[]>([])
  const [role, setRole]               = useState<MemberRole>("Member")
  const [studios, setStudios]         = useState<string[]>(["governance"])
  const [groupIds, setGroupIds]       = useState<string[]>([])
  const [note, setNote]               = useState("")
  const [done, setDone]               = useState(false)

  const recipientCount = emails.length + (emailInput.trim() ? 1 : 0)

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase()
    if (trimmed && !emails.includes(trimmed)) setEmails(e => [...e, trimmed])
    setEmailInput("")
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail() }
    if (e.key === "Backspace" && !emailInput && emails.length) setEmails(e => e.slice(0, -1))
  }

  function toggleStudio(id: string) {
    setStudios(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function toggleGroup(id: string) {
    setGroupIds(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  }

  function submit() {
    const all = emailInput.trim() ? [...emails, emailInput.trim().toLowerCase()] : emails
    if (all.length === 0) return
    onSend(all, role)
    setDone(true)
    setTimeout(() => onClose(), 2200)
  }

  const inviteeCount = emails.length + (emailInput.trim() ? 1 : 0)

  const Backdrop = (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,  // audit-ignore
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget && !done) onClose() }} />
  )

  if (done) return (
    <>
      {Backdrop}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10000,
        width: 420, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "40px 32px", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",  // audit-ignore
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
          background: "color-mix(in srgb, var(--badge-success) 15%, transparent)",
          border: "2px solid color-mix(in srgb, var(--badge-success) 30%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--badge-success)",
        }}>
          <Icons.Check size={24} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
          {recipientCount} invitation{recipientCount !== 1 ? "s" : ""} sent
        </div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          {recipientCount === 1 ? "They'll" : "They'll each"} receive an email with a link to join Avance Financial. Invitations expire in 7 days.
        </div>
      </div>
    </>
  )

  return (
    <>
      {Backdrop}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10000,
        width: 560, maxHeight: "90vh", overflowY: "auto",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",  // audit-ignore
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12, position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "color-mix(in srgb, var(--primary) 15%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
          }}>
            <Icons.UserPlus size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>Invite to Avance Financial</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Invitations are sent by email and expire after 7 days.</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
          ><Icons.X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* 1 · Emails */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>Email addresses</label>
            <div style={{
              minHeight: 44, border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px",
              display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
              background: "var(--surface-raised)", cursor: "text",
            }} onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
              {emails.map(em => (
                <span key={em} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 8px 2px 10px", borderRadius: 100,
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                  fontSize: 12, color: "var(--primary)", fontWeight: 500,
                }}>
                  {em}
                  <button onClick={ev => { ev.stopPropagation(); setEmails(e => e.filter(x => x !== em)) }}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "var(--primary)", padding: 0, lineHeight: 1 }}>
                    <Icons.X size={11} />
                  </button>
                </span>
              ))}
              <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={handleKey} onBlur={addEmail}
                placeholder={emails.length === 0 ? "name@company.com, another@company.com" : "Add another…"}
                style={{ flex: 1, minWidth: 180, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--foreground)" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>Press Enter or comma to add multiple addresses.</div>
          </div>

          {/* 2 · Role */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 8 }}>Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["Member", "Admin", "Owner"] as MemberRole[]).map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: "10px 12px", border: `1px solid ${role === r ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 8, background: role === r ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-raised)",
                  cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${role === r ? "var(--primary)" : "var(--border)"}`,
                      background: role === r ? "var(--primary)" : "transparent",
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: role === r ? "var(--primary)" : "var(--foreground)" }}>{r}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                    {r === "Owner" ? "Full admin + transferable ownership" : r === "Admin" ? "Manage members, studios & billing" : "Access assigned studios only"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3 · Studio access (shown for Member role) */}
          {role === "Member" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 4 }}>
                Studio access
              </label>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 8 }}>
                Select which studios this member can access. Admins and Owners get all studios automatically.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {INVITE_STUDIO_OPTIONS.map(s => {
                  const on = studios.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleStudio(s.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                      border: `1px solid ${on ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 8,
                      background: on ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-raised)",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                        border: `2px solid ${on ? "var(--primary)" : "var(--border)"}`,
                        background: on ? "var(--primary)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {on && <Icons.Check size={8} color="var(--background)" />}
                      </div>
                      <span style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }}>{s.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: on ? "var(--primary)" : "var(--foreground)" }}>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4 · Groups */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 4 }}>
              Add to groups <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>(optional)</span>
            </label>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 8 }}>
              Group membership grants additional studio access and permissions.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {GROUPS.map(g => {
                const on = groupIds.includes(g.id)
                return (
                  <button key={g.id} onClick={() => toggleGroup(g.id)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    border: `1px solid ${on ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: 8,
                    background: on ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface-raised)",
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                      border: `2px solid ${on ? "var(--primary)" : "var(--border)"}`,
                      background: on ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {on && <Icons.Check size={8} color="var(--background)" />}
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--primary)" : "var(--foreground)" }}>{g.name}</span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 6 }}>{g.memberIds.length} members</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {g.studios.map(s => (
                        <span key={s} style={{ fontSize: 10, color: "var(--muted-foreground)", padding: "1px 5px", border: "1px solid var(--border)", borderRadius: 4 }}>
                          {s === "governance" ? "Gov" : s === "datastudio" ? "Data" : s === "agentic" ? "Agentic" : "Admin"}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5 · Personal note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
              Personal note <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>(optional)</span>
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Welcome to AIMS-OS! We're excited to have you on the team…"
              rows={2}
              style={{
                width: "100%", border: "1px solid var(--border)", borderRadius: 8,
                padding: "10px 12px", background: "var(--surface-raised)", color: "var(--foreground)",
                fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "var(--surface-raised)", position: "sticky", bottom: 0,
        }}>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {inviteeCount} recipient{inviteeCount !== 1 ? "s" : ""}
            {role === "Member" && studios.length > 0 && (
              <span> · {studios.length} studio{studios.length !== 1 ? "s" : ""}</span>
            )}
            {groupIds.length > 0 && (
              <span> · {groupIds.length} group{groupIds.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="main" size="sm" onClick={submit} >
              Send {inviteeCount > 1 ? `${inviteeCount} invitations` : "invitation"}
            </Button>
          </div>
        </div>
      </div>
    </>
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
  member, onViewFull, onRoleChange, onToggleSuspend,
}: {
  member: Member
  onViewFull: () => void
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
}) {
  const [tab, setTab] = useState(0)
  const statusColor = STATUS_COLOR[member.status]
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  const permSummary = useMemo(() => {
    return Object.entries(PERM_TREE).map(([studio, nodes]) => {
      const total   = nodes.reduce((n, nd) => n + 1 + (nd.children?.length ?? 0), 0)
      const granted = nodes.reduce((n, nd) => {
        let c = nd.state !== "" ? 1 : 0
        nd.children?.forEach(ch => { if (ch.state !== "") c++ })
        return n + c
      }, 0)
      return { studio, granted, total }
    })
  }, [])

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 10px", fontSize: 12,
    border: "1px solid var(--border)", borderRadius: 7,
    background: "var(--surface)", color: "var(--foreground)", outline: "none",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: isActive ? member.avatarColor : "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700,
            color: isActive ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
            opacity: member.status === "suspended" ? 0.55 : 1,
          }}>
            {member.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 2 }}>{member.name}</div>
            {(member.title || member.department) && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.title}{member.title && member.department ? " · " : ""}{member.department}
              </div>
            )}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100, background: `${ROLE_COLOR[member.role]}22`, color: ROLE_COLOR[member.role], border: `1px solid ${ROLE_COLOR[member.role]}44` }}>
                {member.role}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                {STATUS_LABEL[member.status]}
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
          View full profile
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px" }}>
        <PreviewTabBar tabs={["Overview", "Permissions", "Actions"]} active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

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
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                  background: member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 12%, transparent)" : "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
                  color: member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
                  border: `1px solid ${member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 30%, transparent)" : "color-mix(in srgb, var(--badge-alert) 30%, transparent)"}`,
                }}>
                  {member.mfaEnabled ? <Icons.ShieldCheck size={10} /> : <Icons.ShieldAlert size={10} />}
                  {member.mfaEnabled ? (member.mfaMethod ? `Enabled · ${MFA_METHOD_LABEL[member.mfaMethod]}` : "Enabled") : "Not enabled"}
                </div>
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
            {permSummary.map(({ studio, granted, total }) => {
              const meta = STUDIO_META[studio]
              if (!meta) return null
              const pct = total > 0 ? (granted / total) * 100 : 0
              return (
                <div key={studio} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{meta.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      <span style={{ fontWeight: 700, color: granted > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>{granted}</span> / {total}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 0 ? "var(--primary)" : "transparent", borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                </div>
              )
            })}
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
              <button
                onClick={() => alert(`Invite resent to ${member.email}`)}
                style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
              >
                Resend invite
              </button>
            ) : (
              <button
                onClick={() => onToggleSuspend(member.id)}
                style={{
                  width: "100%", padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  borderRadius: 7, border: "1px solid var(--border)", textAlign: "left",
                  background: "transparent",
                  color: isActive ? "var(--badge-alert)" : "var(--badge-success)",
                }}
              >
                {isActive ? "Suspend access" : "Reactivate account"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RolePreview({ role, onViewFull }: { role: Role; onViewFull: () => void }) {
  const members = role.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]
  const perms = ROLE_PERM_COUNTS[role.id] ?? { governance: 0, datastudio: 0, agentic: 0, admin: 0, total: 0 }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ height: 4, background: role.color }} />
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{role.label}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
            background: role.system ? "var(--surface-raised)" : `${role.color}22`,
            color: role.system ? "var(--muted-foreground)" : role.color,
            border: `1px solid ${role.system ? "var(--border)" : role.color + "44"}`,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {role.system ? "System" : "Custom"}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5, margin: "0 0 12px" }}>{role.desc}</p>
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

      {/* Permission stats */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>
          Permissions · <span style={{ color: "var(--primary)" }}>{perms.total}</span> total
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            { label: "Governance",  value: perms.governance, color: "#8b5cf6" },  // audit-ignore: prototype fixture data
            { label: "Data Studio", value: perms.datastudio, color: "#10b981" },  // audit-ignore: prototype fixture data
            { label: "Agentic",     value: perms.agentic,    color: "#f97316" },  // audit-ignore: prototype fixture data
            { label: "Admin",       value: perms.admin,      color: "#6366f1" },  // audit-ignore: prototype fixture data
          ] as const).map(s => (
            <div key={s.label} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.value > 0 ? "var(--foreground)" : "var(--muted-foreground)", opacity: s.value > 0 ? 1 : 0.35 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>
          Members · {members.length}
        </div>
        {members.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted-foreground)", fontSize: 12 }}>
            No members assigned to this role
          </div>
        ) : members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: m.status === "active" ? m.avatarColor : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
            }}>{m.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupPreview({ group, onViewFull }: { group: Group; onViewFull: () => void }) {
  const members = group.memberIds.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean) as Member[]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Identity header */}
      <div style={{ height: 4, background: group.color }} />
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{group.name}</div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5, margin: "0 0 10px" }}>{group.desc}</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {group.studios.length === 0 ? (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.5 }}>No studio access</span>
          ) : group.studios.map(s => {
            const meta = STUDIO_META[s]
            return (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}44`,
              }}>
                {meta.label}
              </span>
            )
          })}
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
          Manage group
        </button>
      </div>

      {/* Members */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>
          Members · {members.length}
        </div>
        {members.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted-foreground)", fontSize: 12 }}>
            No members in this group yet
          </div>
        ) : members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
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
              background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status], border: `1px solid ${STATUS_COLOR[m.status]}44`,
            }}>
              {STATUS_LABEL[m.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [mainTab, setMainTab]           = useState<"members" | "roles" | "groups">("members")
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all")
  const [query, setQuery]               = useState("")
  const [members, setMembers]           = useState<Member[]>(MEMBERS)
  const [detailView, setDetailView]     = useState<DetailView>(null)
  const [previewItem, setPreviewItem]   = useState<DetailView>(null)
  const [showInvite, setShowInvite]     = useState(false)

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
        onRoleChange={handleRoleChange}
        onToggleSuspend={handleToggleSuspend}
        onRemove={handleRemove}
        onUpdate={handleMemberUpdate}
      />
    )
  }
  if (detailView?.type === "role") {
    return <RoleDetailPage role={detailView.role} onBack={() => setDetailView(null)} />
  }
  if (detailView?.type === "group") {
    return <GroupDetailPage group={detailView.group} onBack={() => setDetailView(null)} />
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
            : mainTab === "roles"  ? `${ROLES.length} roles · ${ROLES.filter(r => !r.system).length} custom`
            : `${GROUPS.length} groups · manage shared access across the workspace`
          }
          primaryAction={
            mainTab === "members" ? (
              <Button variant="main" size="sm" onClick={() => setShowInvite(true)}>
                <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
                Invite member
              </Button>
            ) : mainTab === "roles" ? (
              <Button variant="primary" size="sm">
                <Icons.ShieldPlus size={14} style={{ marginRight: 4 }} />
                New role
              </Button>
            ) : (
              <Button variant="primary" size="sm">
                <Icons.FolderPlus size={14} style={{ marginRight: 4 }} />
                New group
              </Button>
            )
          }
        />
      )}
    >
      {/* Main tab switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <SwitchTab
          items={[
            { id: "members", label: `Members (${counts.all})` },
            { id: "roles",   label: `Roles (${ROLES.length})`  },
            { id: "groups",  label: `Groups (${GROUPS.length})` },
          ]}
          value={mainTab}
          onChange={v => setMainTab(v as "members" | "roles" | "groups")}
          size="s"
        />

        {mainTab === "members" && (
          <div ref={statusContainerRef} style={{ flex: 1, minWidth: 0, position: "relative" }}>
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
      </div>

      {/* Members view */}
      {mainTab === "members" && (
        <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
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
          </div>
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
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
              System roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {ROLES.filter(r => r.system).length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {ROLES.filter(r => r.system).map(r => (
                <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
              Custom roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {ROLES.filter(r => !r.system).length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {ROLES.filter(r => !r.system).map(r => (
                <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Groups view */}
      {mainTab === "groups" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {GROUPS.map(g => (
            <GroupCard key={g.id} group={g} onSelect={group => setPreviewItem({ type: "group", group })} />
          ))}
        </div>
      )}

      {/* Preview slide-out */}
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
        showCta={false}
        resizable={false}
      >
        {previewItem?.type === "member" && (
          <MemberPreview
            member={previewItem.member}
            onViewFull={() => { setPreviewItem(null); setDetailView(previewItem) }}
            onRoleChange={handleRoleChange}
            onToggleSuspend={id => { handleToggleSuspend(id); setPreviewItem(null) }}
          />
        )}
        {previewItem?.type === "role" && (
          <RolePreview
            role={previewItem.role}
            onViewFull={() => { setPreviewItem(null); setDetailView(previewItem) }}
          />
        )}
        {previewItem?.type === "group" && (
          <GroupPreview
            group={previewItem.group}
            onViewFull={() => { setPreviewItem(null); setDetailView(previewItem) }}
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
    </ScreenLayout>
  )
}
