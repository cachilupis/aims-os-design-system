import { useState, useMemo } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Input }        from "@/components/ui/input"
import { Tabs }         from "@/components/ui/tabs"
import { Chip }         from "@/components/ui/chip"
import { SlideOut }     from "@/components/ui/slide-out"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = "active" | "invited" | "suspended"
type MemberRole   = "Super Admin" | "Tenant Admin" | "Member" | "Viewer" | "Billing Admin"
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
  { id: "tg",  name: "Thomas Gonzalez",  email: "thomas.gonzalez@aimsos.ai",   role: "Super Admin",   status: "active",    lastActive: "2026-08-26T09:10:00Z", joinedAt: "2025-01-15T00:00:00Z", initials: "TG", avatarColor: "var(--badge-info)",       title: "Platform Owner",       department: "AIMS OS",          mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-01-15T00:00:00Z", sessions: [
    { id: "s1", device: "MacBook Pro",    browser: "Chrome 125",  location: "San Francisco, CA", lastActive: "2026-08-26T09:10:00Z", current: true  },
    { id: "s2", device: "iPhone 15 Pro",  browser: "Safari 17",   location: "San Francisco, CA", lastActive: "2026-08-25T21:00:00Z", current: false },
  ]},
  { id: "mg",  name: "Maria García",     email: "maria.garcia@avance.com",     role: "Tenant Admin",  status: "active",    lastActive: "2026-08-26T08:45:00Z", joinedAt: "2025-03-02T00:00:00Z", initials: "MG", avatarColor: "var(--badge-success)",    title: "IT Director",           department: "IT",               mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-03-02T00:00:00Z", sessions: [
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
  { id: "jp",  name: "James Park",       email: "james.park@avance.com",       role: "Billing Admin", status: "active",    lastActive: "2026-08-23T09:00:00Z", joinedAt: "2025-07-07T00:00:00Z", initials: "JP", avatarColor: "var(--badge-success)",    title: "Finance Manager",       department: "Finance",          mfaEnabled: true,  mfaMethod: "totp",  mfaEnrolledAt: "2025-07-08T00:00:00Z", sessions: [
    { id: "s9", device: "MacBook Pro",    browser: "Safari 17",   location: "Chicago, IL",       lastActive: "2026-08-23T09:00:00Z", current: true  },
  ]},
  { id: "at",  name: "Ana Torres",       email: "ana.torres@avance.com",       role: "Viewer",        status: "active",    lastActive: "2026-08-22T16:45:00Z", joinedAt: "2025-08-01T00:00:00Z", initials: "AT", avatarColor: "var(--badge-alert)",      title: "Business Analyst",      department: "Analytics",        mfaEnabled: false, mfaMethod: undefined, mfaEnrolledAt: undefined, sessions: [
    { id: "s10", device: "Windows Laptop", browser: "Edge 124",  location: "Guadalajara, MX",   lastActive: "2026-08-22T16:45:00Z", current: true  },
  ]},
  { id: "lr",  name: "Leo Ramírez",      email: "leo.ramirez@avance.com",      role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-20T00:00:00Z", initials: "LR", avatarColor: "var(--muted-foreground)", title: "Data Engineer",         department: "Engineering",      mfaEnabled: false, sessions: [] },
  { id: "cn",  name: "Clara Nakamura",   email: "clara.nakamura@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-21T00:00:00Z", initials: "CN", avatarColor: "var(--muted-foreground)", title: "Product Manager",       department: "Product",          mfaEnabled: false, sessions: [] },
  { id: "rv",  name: "Roberto Vargas",   email: "roberto.vargas@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-22T00:00:00Z", initials: "RV", avatarColor: "var(--muted-foreground)", title: "Solutions Architect",   department: "Engineering",      mfaEnabled: false, sessions: [] },
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Viewer",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",               department: "Risk & Compliance", mfaEnabled: true,  mfaMethod: "sms",   mfaEnrolledAt: "2025-09-15T00:00:00Z", sessions: [] },
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
    { id:"gov-packs", label:"Promotion Packs", code:"governance.packs", desc:"Bundle content changes for review and approval", state:"g-direct", scope:"Tenant", children:[
      { id:"gov-packs-view",   label:"View packs",   desc:"Browse promotion packets and their review status", code:"governance.packs.view", state:"g-direct", scope:"Tenant" },
      { id:"gov-packs-create", label:"Create packs", desc:"Assemble new promotion packets for approval",      code:"governance.packs.create", state:"", children:[
        { id:"gov-packs-create-draft",  label:"Save as draft",     desc:"Save an in-progress packet without submitting it for review", code:"governance.packs.create.draft",  state:"" },
        { id:"gov-packs-create-submit", label:"Submit for review", desc:"Submit a completed packet into the review queue",             code:"governance.packs.create.submit", state:"" },
      ]},
      { id:"gov-packs-review", label:"Review packs", desc:"Evaluate submitted promotion packets from other authors", code:"governance.packs.review", state:"", children:[
        { id:"gov-packs-rev-view",    label:"View submissions", desc:"See all packets pending review and their current status", code:"governance.packs.review.view", state:"" },
        { id:"gov-packs-rev-comment", label:"Add comments",     desc:"Annotate a packet with structured feedback",             code:"governance.packs.review.comment", state:"", children:[
          { id:"gov-packs-rev-comment-suggest", label:"Suggest changes", desc:"Request edits without blocking the promotion",             code:"governance.packs.review.comment.suggest", state:"" },
          { id:"gov-packs-rev-comment-block",   label:"Block promotion", desc:"Flag a packet as ineligible until critical issues are resolved", code:"governance.packs.review.comment.block", state:"" },
        ]},
        { id:"gov-packs-rev-approve", label:"Approve packets", desc:"Grant domain-level or cross-domain sign-off on a promotion packet", code:"governance.packs.review.approve", state:"", children:[
          { id:"gov-packs-rev-approve-domain", label:"Domain approval",       desc:"Sign off on packets that affect only your governance domain",  code:"governance.packs.review.approve.domain", state:"" },
          { id:"gov-packs-rev-approve-cross",  label:"Cross-domain approval", desc:"Approve packets that span multiple governance domains",        code:"governance.packs.review.approve.cross", state:"", children:[
            { id:"gov-packs-rev-approve-cross-final", label:"Final sign-off", desc:"Issue the binding final approval that releases a packet to the truth plane", code:"governance.packs.review.approve.cross.final", state:"" },
          ]},
        ]},
      ]},
    ]},
    { id:"gov-resolution", label:"Resolution Requests", code:"governance.resolution", desc:"Raise and resolve disputes over facts, claims, or governance decisions", state:"", children:[
      { id:"gov-res-view",    label:"View requests",   desc:"Browse open and closed resolution requests across all domains", code:"governance.resolution.view",    state:"" },
      { id:"gov-res-submit",  label:"Submit request",  desc:"Open a new resolution request disputing a fact or decision",   code:"governance.resolution.submit",  state:"" },
      { id:"gov-res-resolve", label:"Resolve request", desc:"Act on a resolution request as the assigned reviewer",         code:"governance.resolution.resolve", state:"", children:[
        { id:"gov-res-resolve-accept",   label:"Accept",             desc:"Close the request by accepting the disputed change",           code:"governance.resolution.resolve.accept",   state:"" },
        { id:"gov-res-resolve-reject",   label:"Reject with reason", desc:"Close the request by rejecting the dispute with a rationale", code:"governance.resolution.resolve.reject",   state:"" },
        { id:"gov-res-resolve-escalate", label:"Escalate",           desc:"Forward the request to the cross-domain review board",        code:"governance.resolution.resolve.escalate", state:"" },
      ]},
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

const STUDIO_META: Record<string, { label: string; color: string }> = {
  governance: { label: "Governance",  color: "#10b981" },  // audit-ignore: prototype fixture data
  datastudio:  { label: "Data Studio", color: "#8b5cf6" },  // audit-ignore: prototype fixture data
  agentic:    { label: "Agentic",     color: "#06b6d4" },  // audit-ignore: prototype fixture data
  admin:      { label: "Admin",       color: "#6366f1" },  // audit-ignore: prototype fixture data
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
const ROLE_COLOR: Record<MemberRole, string> = {
  "Super Admin":   "var(--badge-error)",
  "Tenant Admin":  "var(--badge-alert)",
  "Billing Admin": "var(--badge-info)",
  "Member":        "var(--muted-foreground)",
  "Viewer":        "var(--muted-foreground)",
}
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
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          style={{
            padding: "10px 20px", fontSize: 13, fontWeight: 600,
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

// ─── Permission scope options ─────────────────────────────────────────────────

const SCOPE_OPTS = [
  { id: "Company",      label: "Company",       desc: "All workspaces in your organization"   },
  { id: "Tenant",       label: "Tenant",        desc: "This workspace only"                   },
  { id: "Teams/Groups", label: "Teams / Groups",desc: "Members of the same group(s)"          },
  { id: "Shared",       label: "Shared with me",desc: "Resources explicitly shared with you"  },
  { id: "Own",          label: "My own",        desc: "Only resources you created"            },
]

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

function PermTreeNode({
  node, depth = 0, overrides, onOverride,
}: {
  node: PermNode
  depth?: number
  overrides: Record<string, { state: PermState; scope: string }>
  onOverride: (id: string, state: PermState, scope: string) => void
}) {
  const override       = overrides[node.id]
  const effectiveState: PermState = override?.state ?? node.state
  const effectiveScope = override?.scope ?? node.scope ?? "Tenant"
  const isEditable     = !node.locked

  const [expanded, setExpanded] = useState(
    depth === 0 && (effectiveState === "g-inh" || effectiveState === "g-direct")
  )
  const [hovered, setHovered] = useState(false)
  const [scopeOpen, setScopeOpen] = useState(false)
  const [scopeAnchor, setScopeAnchor] = useState<{ left: number; top: number } | null>(null)

  const hasChildren     = (node.children?.length ?? 0) > 0
  const grantedChildren = node.children?.filter(c => {
    const ov = overrides[c.id]
    return (ov?.state ?? c.state) !== ""
  }).length ?? 0

  const showToggle      = isEditable && (hovered || !!override)
  const showScopePicker = isEditable && effectiveState === "g-direct"
  const currentScopeOpt = SCOPE_OPTS.find(s => s.id === effectiveScope) ?? SCOPE_OPTS[1]

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `8px 16px 8px ${16 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          background: hovered ? "var(--accent)" : "transparent",
          transition: "background 0.1s",
        }}
      >
        {/* Chevron */}
        <div
          onClick={() => hasChildren && setExpanded(e => !e)}
          style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: hasChildren ? "pointer" : "default" }}
        >
          {hasChildren
            ? expanded
              ? <Icons.ChevronDown size={12} color="var(--muted-foreground)" />
              : <Icons.ChevronRight size={12} color="var(--muted-foreground)" />
            : null}
        </div>

        {/* State icon */}
        <div onClick={() => hasChildren && setExpanded(e => !e)} style={{ cursor: hasChildren ? "pointer" : "default" }}>
          <PermIcon state={effectiveState} />
        </div>

        {/* Label */}
        <div
          onClick={() => hasChildren && setExpanded(e => !e)}
          style={{ flex: 1, minWidth: 0, cursor: hasChildren ? "pointer" : "default" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{node.label}</span>
            {node.role && !override && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              }}>
                via {node.role}
              </span>
            )}
            {override && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                background: "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
                color: "var(--badge-alert)", border: "1px solid color-mix(in srgb, var(--badge-alert) 30%, transparent)",
              }}>
                overridden
              </span>
            )}
          </div>
          {depth === 0 && hasChildren && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
              {grantedChildren} of {node.children?.length} permissions granted
            </div>
          )}
          {!hasChildren && node.desc && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1, lineHeight: 1.4 }}>
              {node.desc}
            </div>
          )}
        </div>

        {/* Scope dropdown — shown when directly granted */}
        {showScopePicker && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={e => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                const dropdownW = 240
                const left = rect.right - dropdownW < 8 ? Math.max(8, rect.left) : rect.right - dropdownW
                setScopeAnchor({ left, top: rect.bottom })
                setScopeOpen(o => !o)
                e.stopPropagation()
              }}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "3px 8px", fontSize: 11, fontWeight: 600, borderRadius: 6,
                border: "1px solid var(--primary)",
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)", cursor: "pointer",
              }}
            >
              {currentScopeOpt.label}
              <Icons.ChevronDown size={10} />
            </button>

            {scopeOpen && scopeAnchor && (
              <>
                {/* backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 10000 }}
                  onClick={() => setScopeOpen(false)}
                />
                {/* dropdown */}
                <div style={{
                  position: "fixed",
                  left: scopeAnchor.left,
                  top: scopeAnchor.top + 4,
                  zIndex: 10001,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)", // audit-ignore: elevation shadow, no token available
                  width: 240,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "8px 12px 4px",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                    color: "var(--muted-foreground)", textTransform: "uppercase",
                  }}>
                    Select scope
                    <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: 0, textTransform: "none", marginTop: 1 }}>
                      How broadly this permission applies
                    </div>
                  </div>
                  {SCOPE_OPTS.map(s => {
                    const selected = effectiveScope === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          onOverride(node.id, "g-direct", s.id)
                          setScopeOpen(false)
                        }}
                        style={{
                          width: "100%", textAlign: "left", display: "flex", alignItems: "center",
                          gap: 10, padding: "8px 12px",
                          background: selected ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                          border: "none", cursor: "pointer",
                          borderTop: "1px solid var(--border)",
                        }}
                        onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
                        onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: selected ? "var(--primary)" : "var(--foreground)" }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{s.desc}</div>
                        </div>
                        {selected && <Icons.Check size={13} color="var(--primary)" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3-state toggle: None | Grant | Deny */}
        {showToggle && !showScopePicker && (
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {([
              { s: "" as PermState,         label: "None",  icon: <Icons.Minus size={10} />,  tip: "No access"                },
              { s: "g-direct" as PermState, label: "Grant", icon: <Icons.Check size={10} />,  tip: "Grant direct access"      },
              { s: "g-denied" as PermState, label: "Deny",  icon: <Icons.X size={10} />,      tip: "Explicitly deny access"   },
            ] as const).map(opt => {
              const active = effectiveState === opt.s
              return (
                <button
                  key={opt.s}
                  title={opt.tip}
                  onClick={() => onOverride(node.id, opt.s, effectiveScope)}
                  style={{
                    display: "flex", alignItems: "center", gap: 3,
                    padding: "2px 7px", fontSize: 10, fontWeight: 600, borderRadius: 4,
                    border: `1px solid ${active ? (opt.s === "g-denied" ? "var(--badge-error)" : opt.s === "g-direct" ? "var(--primary)" : "var(--border)") : "var(--border)"}`,
                    background: active
                      ? opt.s === "g-denied" ? "color-mix(in srgb, var(--badge-error) 15%, transparent)"
                      : opt.s === "g-direct" ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                      : "var(--muted)"
                      : "transparent",
                    color: active
                      ? opt.s === "g-denied" ? "var(--badge-error)"
                      : opt.s === "g-direct" ? "var(--primary)"
                      : "var(--foreground)"
                      : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}
                >
                  {opt.icon}{opt.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Scope label — non-editable nodes */}
        {!isEditable && node.scope && (
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>· {node.scope}</span>
        )}

        {node.locked && (
          <Icons.Lock size={11} color="var(--muted-foreground)" style={{ flexShrink: 0, opacity: 0.5 }} />
        )}
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <PermTreeNode key={child.id} node={child} depth={depth + 1} overrides={overrides} onOverride={onOverride} />
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
  const [studio, setStudio]       = useState("governance")
  const [filter, setFilter]       = useState("")
  const [overrides, setOverrides] = useState<Record<string, { state: PermState; scope: string }>>({})
  const [saveOpen, setSaveOpen]   = useState(false)
  const [saved, setSaved]         = useState(false)

  const nodes = PERM_TREE[studio] ?? []
  const overrideCount = Object.keys(overrides).length

  function collectIds(node: PermNode): string[] {
    return [node.id, ...(node.children ?? []).flatMap(c => collectIds(c))]
  }
  function findNode(nodeList: PermNode[], id: string): PermNode | null {
    for (const n of nodeList) {
      if (n.id === id) return n
      const found = findNode(n.children ?? [], id)
      if (found) return found
    }
    return null
  }

  function handleOverride(id: string, state: PermState, scope: string) {
    const node = findNode(PERM_TREE[studio] ?? [], id)
    if (node && (node.children?.length ?? 0) > 0) {
      // Parent: cascade state to all descendants
      const ids = collectIds(node)
      setOverrides(prev => {
        const next = { ...prev }
        ids.forEach(did => { next[did] = { state, scope } })
        return next
      })
    } else {
      // Leaf: only set self, never touches parent
      setOverrides(prev => ({ ...prev, [id]: { state, scope } }))
    }
  }

  function countGranted(nodeList: PermNode[]): number {
    return nodeList.reduce((n, nd) => {
      const ov = overrides[nd.id]
      const eff = ov?.state ?? nd.state
      let c = eff !== "" ? 1 : 0
      if (nd.children) c += countGranted(nd.children)
      return n + c
    }, 0)
  }
  function countTotal(nodeList: PermNode[]): number {
    return nodeList.reduce((n, nd) => n + 1 + countTotal(nd.children ?? []), 0)
  }
  const grantedCount = countGranted(nodes)
  const totalCount   = countTotal(nodes)

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
      {/* Studio tabs — DS Tabs */}
      <div style={{ padding: "0 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
        <Tabs
          items={STUDIO_TABS}
          activeId={studio}
          onChange={id => { setStudio(id); setFilter(""); setOverrides({}) }}
          size="s"
        />
      </div>

      {/* Summary + search + save row */}
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
        {overrideCount > 0 && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Button size="sm" variant="secondary" onClick={() => setOverrides({})}>Reset</Button>
            <Button size="sm" variant="main" onClick={() => setSaveOpen(true)}>Save changes</Button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, padding: "8px 16px",
        borderBottom: "1px solid var(--border)", background: "var(--surface-raised)",
      }}>
        {([
          { state: "g-direct" as PermState, label: "Direct" },
          { state: "g-inh"    as PermState, label: "Via role" },
          { state: "g-denied" as PermState, label: "Denied" },
          { state: ""         as PermState, label: "None" },
        ] as const).map(l => (
          <div key={l.state} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PermIcon state={l.state} />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l.label}</span>
          </div>
        ))}
        {overrideCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--badge-alert)" }} />
            <span style={{ fontSize: 11, color: "var(--badge-alert)", fontWeight: 600 }}>{overrideCount} overridden</span>
          </div>
        )}
      </div>

      {/* Tree */}
      <div>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
            No permissions match "{filter}"
          </div>
        ) : (
          filteredNodes.map(n => (
            <PermTreeNode key={n.id} node={n} depth={0} overrides={overrides} onOverride={handleOverride} />
          ))
        )}
      </div>

      {/* ── Save changes modal ─────────────────────────────────────── */}
      {saveOpen && (() => {
        // Collect every change across all studios with path context
        const STATE_LABEL: Record<string, string> = { "g-direct": "Granted", "g-denied": "Denied", "": "Removed" }

        function findWithPath(nodeList: PermNode[], id: string, path: string[] = []): { node: PermNode; path: string[] } | null {
          for (const n of nodeList) {
            if (n.id === id) return { node: n, path }
            const found = findWithPath(n.children ?? [], id, [...path, n.label])
            if (found) return found
          }
          return null
        }

        const changes: { id: string; label: string; path: string[]; studioLabel: string; state: PermState; scope: string }[] = []
        const studioLabels: Record<string, string> = { governance: "Governance", datastudio: "Data Studio", agentic: "Agentic", admin: "Admin" }

        Object.entries(overrides).forEach(([id, ov]) => {
          for (const [stKey, stNodes] of Object.entries(PERM_TREE)) {
            const result = findWithPath(stNodes, id)
            if (result) {
              changes.push({ id, label: result.node.label, path: result.path, studioLabel: studioLabels[stKey] ?? stKey, state: ov.state, scope: ov.scope })
              break
            }
          }
        })

        const grouped = changes.reduce<Record<string, typeof changes>>((acc, c) => {
          ;(acc[c.studioLabel] ??= []).push(c)
          return acc
        }, {})

        return (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10010, background: "rgba(0,0,0,0.5)" }} // audit-ignore: modal backdrop scrim, no token
              onClick={() => setSaveOpen(false)}
            />
            <div style={{
              position: "fixed", zIndex: 10011,
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 480, maxHeight: "80vh",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, boxShadow: "0 24px 48px rgba(0,0,0,0.28)", // audit-ignore: modal elevation, no token
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>Save permission changes</span>
                  <button onClick={() => setSaveOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}>
                    <Icons.X size={16} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{changes.length} change{changes.length !== 1 ? "s" : ""}</span> to Thomas Gonzalez's permissions
                </div>
              </div>

              {/* Change list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                {Object.entries(grouped).map(([studioLabel, rows]) => (
                  <div key={studioLabel}>
                    <div style={{ padding: "6px 24px 4px", fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {studioLabel}
                    </div>
                    {rows.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 24px", borderTop: "1px solid var(--border)" }}>
                        <PermIcon state={c.state} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {c.path.length > 0 && (
                            <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 1 }}>
                              {c.path.join(" › ")}
                            </div>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{c.label}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100,
                            background: c.state === "g-direct" ? "color-mix(in srgb, var(--badge-success) 15%, transparent)"
                              : c.state === "g-denied" ? "color-mix(in srgb, var(--badge-error) 15%, transparent)"
                              : "var(--muted)",
                            color: c.state === "g-direct" ? "var(--badge-success)"
                              : c.state === "g-denied" ? "var(--badge-error)"
                              : "var(--muted-foreground)",
                          }}>
                            {STATE_LABEL[c.state]}
                          </span>
                          {c.state === "g-direct" && (
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>· {c.scope}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                <Button size="sm" variant="secondary" onClick={() => setSaveOpen(false)}>Cancel</Button>
                <Button size="sm" variant="main" onClick={() => {
                  setOverrides({})
                  setSaveOpen(false)
                  setSaved(true)
                  setTimeout(() => setSaved(false), 3000)
                }}>
                  Confirm changes
                </Button>
              </div>
            </div>

            {/* Success toast */}
            {saved && (
              <div style={{
                position: "fixed", bottom: 24, right: 24, zIndex: 10020,
                background: "var(--badge-success)", color: "#fff", // audit-ignore: white text on success green, no token for #fff
                padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)", // audit-ignore: toast shadow, no token
              }}>
                <Icons.CheckCircle size={15} /> Changes saved
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}

// ─── Activity panel ───────────────────────────────────────────────────────────

const ACTIVITY_LOG = [
  { msg: "Signed in from Chrome on macOS",          time: "2 hours ago",          type: "auth"  },
  { msg: "Updated Data Studio model configuration", time: "Yesterday at 2:34 PM", type: "edit"  },
  { msg: "Added to Engineering group by Admin",     time: "Aug 20 at 9:15 AM",    type: "group" },
  { msg: "Role updated: Viewer → Member",           time: "Aug 18 at 4:10 PM",    type: "role"  },
  { msg: "Approved promotion packet GV-2200",       time: "Aug 15 at 11:30 AM",   type: "check" },
  { msg: "Signed in from Safari on macOS",          time: "Aug 12 at 8:05 AM",    type: "auth"  },
  { msg: "Uploaded 3 files to Governance Drives",   time: "Aug 10 at 3:20 PM",    type: "edit"  },
  { msg: "Created sandbox SB-2026-08",              time: "Aug 8 at 10:05 AM",    type: "edit"  },
]

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  auth:  <Icons.LogIn size={14} />,
  edit:  <Icons.FileEdit size={14} />,
  group: <Icons.Users size={14} />,
  role:  <Icons.ShieldCheck size={14} />,
  check: <Icons.CheckCircle size={14} />,
}

function ActivityPanel({ log = ACTIVITY_LOG }: { log?: typeof ACTIVITY_LOG }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      {log.map((ev, i) => (
        <div
          key={i}
          style={{
            display: "flex", gap: 14, padding: "14px 20px",
            borderBottom: i < log.length - 1 ? "1px solid var(--border)" : "none",
            alignItems: "flex-start",
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "var(--surface-raised)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted-foreground)",
          }}>
            {ACTIVITY_ICON[ev.type] ?? <Icons.Circle size={14} />}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.4 }}>{ev.msg}</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>{ev.time}</div>
          </div>
        </div>
      ))}
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

const ROLE_OPTIONS: MemberRole[] = ["Super Admin", "Tenant Admin", "Billing Admin", "Member", "Viewer"]

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
          <DetailTabs tabs={["Permissions", "Activity", "Security"]} active={activeTab} onChange={setActiveTab} />
          <div style={{ marginTop: 20 }}>
            {activeTab === 0 && <PermissionsPanel />}
            {activeTab === 1 && <ActivityPanel />}
            {activeTab === 2 && <SecurityPanel member={member} onUpdate={onUpdate} />}
          </div>
        </div>
      </div>
    </ScreenLayout>
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

function MemberRow({ member, onSelect }: { member: Member; onSelect: (m: Member) => void }) {
  const [hovered, setHovered] = useState(false)
  const statusColor = STATUS_COLOR[member.status]

  return (
    <div
      onClick={() => onSelect(member)}
      style={{
        padding: "12px 20px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 14,
        background: hovered ? "var(--accent)" : "transparent",
        cursor: "pointer", transition: "background 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: member.status === "active" ? member.avatarColor : "var(--muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        color: member.status === "active" ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
        opacity: member.status === "suspended" ? 0.5 : 1,
      }}>{member.initials}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", opacity: member.status === "suspended" ? 0.5 : 1 }}>
            {member.name}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 100, background: `${ROLE_COLOR[member.role]}22`, color: ROLE_COLOR[member.role], border: `1px solid ${ROLE_COLOR[member.role]}44` }}>
            {member.role}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member.email}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 88 }}>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>
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

      {/* MFA badge */}
      <div
        title={member.mfaEnabled ? `MFA enabled (${member.mfaMethod ?? ""})` : "MFA not enabled"}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, flexShrink: 0,
          background: member.mfaEnabled
            ? "color-mix(in srgb, var(--badge-success) 12%, transparent)"
            : "color-mix(in srgb, var(--badge-alert) 12%, transparent)",
          color: member.mfaEnabled ? "var(--badge-success)" : "var(--badge-alert)",
          border: `1px solid ${member.mfaEnabled ? "color-mix(in srgb, var(--badge-success) 30%, transparent)" : "color-mix(in srgb, var(--badge-alert) 30%, transparent)"}`,
        }}
      >
        {member.mfaEnabled
          ? <Icons.ShieldCheck size={11} />
          : <Icons.ShieldAlert size={11} />}
        MFA
      </div>

      <div style={{
        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
        minWidth: 76, textAlign: "center", flexShrink: 0,
      }}>
        {STATUS_LABEL[member.status]}
      </div>

      <div style={{ color: "var(--muted-foreground)", flexShrink: 0, opacity: hovered ? 0.5 : 0, transition: "opacity 0.1s" }}>
        <Icons.ChevronRight size={15} />
      </div>
    </div>
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

const ALL_ROLES: MemberRole[] = ["Super Admin", "Tenant Admin", "Member", "Viewer", "Billing Admin"]

// Role-based permission preview states for InviteModal step 2
const ROLE_PERM_PREVIEW: Record<MemberRole, Record<string, PermState>> = {
  "Super Admin":   { "gov-drives":"g-direct","gov-sandbox":"g-direct","gov-truth":"g-direct","gov-packs":"g-direct","gov-resolution":"g-direct","ds-models":"g-direct","ds-lineage":"g-direct","ds-connectors":"g-direct","ag-workers":"g-direct","ag-hitl":"g-direct","ag-networks":"g-direct","ag-workflows":"g-direct","adm-members":"g-direct","adm-roles":"g-direct","adm-integrations":"g-direct","adm-audit":"g-direct" },
  "Tenant Admin":  { "gov-drives":"g-direct","gov-sandbox":"g-direct","gov-packs":"g-direct","ds-models":"g-direct","ds-lineage":"g-direct","ag-workers":"g-direct","ag-hitl":"g-direct","ag-workflows":"g-direct","adm-members":"g-direct","adm-roles":"g-direct","adm-integrations":"g-direct" },
  "Member":        { "gov-drives":"g-inh","gov-sandbox":"g-inh","ds-models":"g-inh","ag-workers":"g-inh","ag-hitl":"g-direct" },
  "Viewer":        { "gov-drives":"g-inh","ds-models":"g-inh","ds-lineage":"g-direct","ag-workers":"g-inh" },
  "Billing Admin": { "adm-members":"g-inh" },
}

function InviteModal({ onClose, onSend }: {
  onClose: () => void
  onSend: (emails: string[], role: MemberRole) => void
}) {
  const [step, setStep]             = useState<1 | 2>(1)
  const [emailInput, setEmailInput] = useState("")
  const [emails, setEmails]         = useState<string[]>([])
  const [role, setRole]             = useState<MemberRole>("Member")
  const [note, setNote]             = useState("")
  const [permOverrides, setPermOverrides] = useState<Record<string, { state: PermState; scope: string }>>({})
  const [previewStudio, setPreviewStudio] = useState("governance")

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase()
    if (trimmed && !emails.includes(trimmed)) setEmails(e => [...e, trimmed])
    setEmailInput("")
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail() }
    if (e.key === "Backspace" && !emailInput && emails.length) setEmails(e => e.slice(0, -1))
  }

  function goNext() {
    const all = emailInput.trim() ? [...emails, emailInput.trim()] : emails
    if (all.length === 0) return
    if (emailInput.trim()) { addEmail() }
    setStep(2)
  }

  function submit() {
    const all = emailInput.trim() ? [...emails, emailInput.trim()] : emails
    if (all.length === 0) return
    onSend(all, role)
    onClose()
  }

  // Build preview nodes for selected studio, merging role defaults + overrides
  const previewNodes = (PERM_TREE[previewStudio] ?? []).map(n => {
    const roleState = ROLE_PERM_PREVIEW[role][n.id] ?? ""
    const ov = permOverrides[n.id]
    return { ...n, state: (ov?.state ?? roleState) as PermState, scope: ov?.scope ?? n.scope }
  })

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,  // audit-ignore: prototype fixture data
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: 520, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)",  // audit-ignore: prototype fixture data
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "color-mix(in srgb, var(--primary) 15%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--primary)",
          }}>
            <Icons.UserPlus size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>Invite to Avance Financial</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
              Invitations are sent by email and expire after 7 days
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "10px 24px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
          {(["Details", "Permissions"] as const).map((label, i) => {
            const idx = i + 1
            const active = step === idx
            const done   = step > idx
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: done ? "var(--badge-success)" : active ? "var(--primary)" : "var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    color: (done || active) ? "#fff" : "var(--muted-foreground)",  // audit-ignore: prototype fixture data
                  }}>
                    {done ? <Icons.Check size={10} /> : idx}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                </div>
                {i < 1 && <div style={{ width: 32, height: 1, background: "var(--border)", margin: "0 8px" }} />}
              </div>
            )
          })}
        </div>

        {step === 1 ? (
          /* ── Step 1: Details ── */
          <>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Email chips input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
                  Email addresses
                </label>
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
                      <button
                        onClick={ev => { ev.stopPropagation(); setEmails(e => e.filter(x => x !== em)) }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--primary)", padding: 0, lineHeight: 1 }}
                      >
                        <Icons.X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={handleKey}
                    onBlur={addEmail}
                    placeholder={emails.length === 0 ? "name@company.com, another@company.com" : "Add another…"}
                    style={{
                      flex: 1, minWidth: 180, border: "none", outline: "none", background: "transparent",
                      fontSize: 13, color: "var(--foreground)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 5 }}>
                  Press Enter or comma to add multiple addresses
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
                  Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ALL_ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      style={{
                        padding: "10px 14px", border: `1px solid ${role === r ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: 8, background: role === r ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-raised)",
                        cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0, border: `2px solid ${role === r ? "var(--primary)" : "var(--border)"}`,
                        background: role === r ? "var(--primary)" : "transparent",
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: role === r ? "var(--primary)" : "var(--foreground)" }}>{r}</div>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1 }}>
                          {r === "Super Admin" ? "Full platform access" : r === "Tenant Admin" ? "Manage members & settings" : r === "Member" ? "Access assigned studios" : r === "Viewer" ? "Read-only access" : "Billing & seats only"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
                  Personal note <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Welcome to AIMS-OS! We're excited to have you…"
                  rows={3}
                  style={{
                    width: "100%", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "10px 12px", background: "var(--surface-raised)", color: "var(--foreground)",
                    fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: "14px 24px", borderTop: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "var(--surface-raised)",
            }}>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {emails.length + (emailInput.trim() ? 1 : 0)} recipient{(emails.length + (emailInput.trim() ? 1 : 0)) !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
                <Button
                  variant="main"
                  size="sm"
                  onClick={goNext}
                  disabled={(emails.length + (emailInput.trim() ? 1 : 0)) === 0}
                >
                  Review permissions
                  <Icons.ChevronRight size={13} style={{ marginLeft: 4 }} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ── Step 2: Permission preview ── */
          <>
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Context banner */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                borderRadius: 8, background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
              }}>
                <Icons.Info size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>
                  The <strong>{role}</strong> role grants the permissions below.
                  Hover any row to add a direct override before sending.
                </div>
              </div>

              {/* Studio tabs */}
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
                {STUDIO_TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPreviewStudio(t.id)}
                    style={{
                      padding: "6px 12px", fontSize: 12, fontWeight: 600,
                      border: "none", background: "none", cursor: "pointer",
                      color: previewStudio === t.id ? "var(--primary)" : "var(--muted-foreground)",
                      borderBottom: previewStudio === t.id ? "2px solid var(--primary)" : "2px solid transparent",
                      marginBottom: -1,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 12 }}>
                {([
                  { state: "g-direct" as PermState, label: "Direct" },
                  { state: "g-inh"    as PermState, label: "Via role" },
                  { state: ""         as PermState, label: "None" },
                ] as const).map(l => (
                  <div key={l.state} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <PermIcon state={l.state} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Permission tree preview */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                {previewNodes.map(n => (
                  <PermTreeNode
                    key={n.id}
                    node={n}
                    depth={0}
                    overrides={permOverrides}
                    onOverride={(id, state, scope) => setPermOverrides(prev => ({ ...prev, [id]: { state, scope } }))}
                  />
                ))}
              </div>

              {Object.keys(permOverrides).length > 0 && (
                <div style={{ fontSize: 11, color: "var(--badge-alert)", fontWeight: 600 }}>
                  {Object.keys(permOverrides).length} permission override{Object.keys(permOverrides).length !== 1 ? "s" : ""} added
                </div>
              )}
            </div>

            <div style={{
              padding: "14px 24px", borderTop: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "var(--surface-raised)",
            }}>
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                <Icons.ChevronLeft size={13} style={{ marginRight: 4 }} />
                Back
              </Button>
              <Button variant="main" size="sm" onClick={submit}>
                Send {emails.length > 1 ? `${emails.length} invitations` : "invitation"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
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
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Change role</div>
                <select
                  value={member.role}
                  onChange={e => onRoleChange(member.id, e.target.value as MemberRole)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)", outline: "none", cursor: "pointer" }}
                >
                  {(["Super Admin", "Tenant Admin", "Billing Admin", "Member", "Viewer"] as MemberRole[]).map(r => (
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter]     = useState<"all" | "system" | "custom">("all")
  const [groupFilter, setGroupFilter]   = useState<"all" | "with-members" | "empty">("all")
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
      <div style={{ marginBottom: 20 }}>
        <Tabs
          items={[
            { id: "members", label: `Members (${counts.all})` },
            { id: "roles",   label: `Roles (${ROLES.length})`  },
            { id: "groups",  label: `Groups (${GROUPS.length})` },
          ]}
          activeId={mainTab}
          onChange={v => setMainTab(v as "members" | "roles" | "groups")}
          size="s"
        />

        {mainTab === "members" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            {([
              { id: "all",       label: `All (${counts.all})`             },
              { id: "active",    label: `Active (${counts.active})`       },
              { id: "invited",   label: `Invited (${counts.invited})`     },
              { id: "suspended", label: `Suspended (${counts.suspended})` },
            ] as const).map(f => (
              <Chip
                key={f.id}
                size="s"
                variant={statusFilter === f.id ? "primary" : "secondary"}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </Chip>
            ))}
            <div style={{ marginLeft: "auto", width: 240 }}>
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search members…" />
            </div>
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
              <span style={{ minWidth: 88, textAlign: "right" }}>Last active</span>
              <span style={{ minWidth: 60, textAlign: "center" }}>MFA</span>
              <span style={{ minWidth: 76, textAlign: "center" }}>Status</span>
              <span style={{ width: 15 }} />
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
      {mainTab === "roles" && (() => {
        const filteredRoles = ROLES.filter(r =>
          roleFilter === "all" ? true : roleFilter === "system" ? r.system : !r.system
        )
        const systemRoles = filteredRoles.filter(r => r.system)
        const customRoles = filteredRoles.filter(r => !r.system)
        return (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              {([
                { id: "all",    label: `All (${ROLES.length})`                          },
                { id: "system", label: `System (${ROLES.filter(r => r.system).length})` },
                { id: "custom", label: `Custom (${ROLES.filter(r => !r.system).length})` },
              ] as const).map(f => (
                <Chip
                  key={f.id}
                  size="s"
                  variant={roleFilter === f.id ? "primary" : "secondary"}
                  onClick={() => setRoleFilter(f.id)}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
            {systemRoles.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
                  System roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {systemRoles.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {systemRoles.map(r => (
                    <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
                  ))}
                </div>
              </div>
            )}
            {customRoles.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 10 }}>
                  Custom roles <span style={{ fontWeight: 400, opacity: 0.6 }}>· {customRoles.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {customRoles.map(r => (
                    <RoleCard key={r.id} role={r} onSelect={role => setPreviewItem({ type: "role", role })} />
                  ))}
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* Groups view */}
      {mainTab === "groups" && (() => {
        const filteredGroups = GROUPS.filter(g =>
          groupFilter === "all" ? true : groupFilter === "with-members" ? g.memberIds.length > 0 : g.memberIds.length === 0
        )
        return (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              {([
                { id: "all",          label: `All (${GROUPS.length})`                                       },
                { id: "with-members", label: `Has members (${GROUPS.filter(g => g.memberIds.length > 0).length})` },
                { id: "empty",        label: `Empty (${GROUPS.filter(g => g.memberIds.length === 0).length})` },
              ] as const).map(f => (
                <Chip
                  key={f.id}
                  size="s"
                  variant={groupFilter === f.id ? "primary" : "secondary"}
                  onClick={() => setGroupFilter(f.id)}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filteredGroups.map(g => (
                <GroupCard key={g.id} group={g} onSelect={group => setPreviewItem({ type: "group", group })} />
              ))}
            </div>
          </>
        )
      })()}

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
