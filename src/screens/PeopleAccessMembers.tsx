import { useState, useMemo } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Input }        from "@/components/ui/input"
import { SwitchTab }    from "@/components/ui/switch-tab"
import { SlideOut }     from "@/components/ui/slide-out"
import type { SidebarItem } from "@/components/ui/sidebar"

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SIDEBAR: SidebarItem[] = [
  { id: "overview",      label: "Overview",        icon: "LayoutDashboard" },
  { id: "people",        label: "People & Access", icon: "Users"           },
  { id: "studios",       label: "Studios",         icon: "Box"             },
  { id: "integrations",  label: "Integrations",    icon: "Plug"            },
  { id: "security",      label: "Security",        icon: "Shield"          },
  { id: "audit",         label: "Audit Log",       icon: "ClipboardList"   },
  { id: "billing",       label: "Billing",         icon: "CreditCard"      },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = "active" | "invited" | "suspended"
type MemberRole   = "Super Admin" | "Tenant Admin" | "Member" | "Viewer" | "Billing Admin"
type PermState    = "g-direct" | "g-inh" | "g-denied" | ""

interface PermNode {
  id: string; label: string; desc: string; code: string
  state: PermState; scope?: string; locked?: boolean; role?: string
  children?: PermNode[]
}

interface Member {
  id: string; name: string; email: string; role: MemberRole
  status: MemberStatus; lastActive: string | null; joinedAt: string
  initials: string; avatarColor: string; department?: string; title?: string
}

// ─── Members fixture ──────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "tg",  name: "Thomas Gonzalez",  email: "thomas.gonzalez@aimsos.ai",   role: "Super Admin",   status: "active",    lastActive: "2026-08-26T09:10:00Z", joinedAt: "2025-01-15T00:00:00Z", initials: "TG", avatarColor: "var(--badge-info)",       title: "Platform Owner",       department: "AIMS OS"           },
  { id: "mg",  name: "Maria García",     email: "maria.garcia@avance.com",     role: "Tenant Admin",  status: "active",    lastActive: "2026-08-26T08:45:00Z", joinedAt: "2025-03-02T00:00:00Z", initials: "MG", avatarColor: "var(--badge-success)",    title: "IT Director",           department: "IT"                },
  { id: "es",  name: "Eduardo Suárez",   email: "eduardo.suarez@avance.com",   role: "Member",        status: "active",    lastActive: "2026-08-25T17:30:00Z", joinedAt: "2025-04-10T00:00:00Z", initials: "ES", avatarColor: "var(--badge-alert)",      title: "Data Analyst",          department: "Analytics"         },
  { id: "sb",  name: "Sarah Brown",      email: "sarah.brown@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-25T14:00:00Z", joinedAt: "2025-05-18T00:00:00Z", initials: "SB", avatarColor: "var(--badge-error)",      title: "Risk Manager",          department: "Risk & Compliance" },
  { id: "dp",  name: "Diana Pérez",      email: "diana.perez@avance.com",      role: "Member",        status: "active",    lastActive: "2026-08-24T11:20:00Z", joinedAt: "2025-06-01T00:00:00Z", initials: "DP", avatarColor: "var(--badge-info)",       title: "Operations Lead",       department: "Operations"        },
  { id: "jp",  name: "James Park",       email: "james.park@avance.com",       role: "Billing Admin", status: "active",    lastActive: "2026-08-23T09:00:00Z", joinedAt: "2025-07-07T00:00:00Z", initials: "JP", avatarColor: "var(--badge-success)",    title: "Finance Manager",       department: "Finance"           },
  { id: "at",  name: "Ana Torres",       email: "ana.torres@avance.com",       role: "Viewer",        status: "active",    lastActive: "2026-08-22T16:45:00Z", joinedAt: "2025-08-01T00:00:00Z", initials: "AT", avatarColor: "var(--badge-alert)",      title: "Business Analyst",      department: "Analytics"         },
  { id: "lr",  name: "Leo Ramírez",      email: "leo.ramirez@avance.com",      role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-20T00:00:00Z", initials: "LR", avatarColor: "var(--muted-foreground)", title: "Data Engineer",         department: "Engineering"       },
  { id: "cn",  name: "Clara Nakamura",   email: "clara.nakamura@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-21T00:00:00Z", initials: "CN", avatarColor: "var(--muted-foreground)", title: "Product Manager",       department: "Product"           },
  { id: "rv",  name: "Roberto Vargas",   email: "roberto.vargas@avance.com",   role: "Member",        status: "invited",   lastActive: null,                   joinedAt: "2026-08-22T00:00:00Z", initials: "RV", avatarColor: "var(--muted-foreground)", title: "Solutions Architect",   department: "Engineering"       },
  { id: "fw",  name: "Fiona Walsh",      email: "fiona.walsh@avance.com",      role: "Viewer",        status: "suspended", lastActive: "2026-07-14T10:00:00Z", joinedAt: "2025-09-10T00:00:00Z", initials: "FW", avatarColor: "var(--muted-foreground)", title: "Analyst",               department: "Risk & Compliance" },
  { id: "ms",  name: "Marcus Silva",     email: "marcus.silva@avance.com",     role: "Member",        status: "suspended", lastActive: "2026-06-30T08:00:00Z", joinedAt: "2025-10-01T00:00:00Z", initials: "MS", avatarColor: "var(--muted-foreground)", title: "Data Scientist",        department: "Analytics"         },
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
      { id:"ds-models-view",      label:"View models",      desc:"Read data model definitions, entities, and attributes",                            code:"datastudio.models.view",      state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-author",    label:"Author models",    desc:"Create and edit data model drafts",                                               code:"datastudio.models.author",    state:"g-inh", scope:"Tenant", locked:true },
      { id:"ds-models-publish",   label:"Publish models",   desc:"Promote a model from Draft to Published state",                                   code:"datastudio.models.publish",   state:"" },
      { id:"ds-models-deprecate", label:"Deprecate models", desc:"Mark a published model as deprecated so consumers can migrate",                   code:"datastudio.models.deprecate", state:"" },
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
      { id:"ag-wf-view",   label:"View workflows",   desc:"Browse workflow definitions and their execution logs",    code:"agentic.workflows.view",   state:"" },
      { id:"ag-wf-manage", label:"Manage workflows", desc:"Create, edit, and delete workflow step configurations",   code:"agentic.workflows.manage", state:"" },
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
      { id:"adm-int-view",   label:"View integrations",       desc:"List configured third-party integrations and their status", code:"admin.integrations.view",   state:"" },
      { id:"adm-int-manage", label:"Manage integrations",     desc:"Add, configure, or remove integration connections",         code:"admin.integrations.manage", state:"" },
    ]},
    { id:"adm-audit", label:"Audit & Compliance", code:"admin.audit", desc:"Review and export a tamper-evident log of platform activity", state:"", children:[
      { id:"adm-audit-view",   label:"View audit log",    desc:"Read the chronological log of admin and user actions",   code:"admin.audit.view",   state:"" },
      { id:"adm-audit-export", label:"Export audit log",  desc:"Download a copy of the audit trail as CSV or JSON",       code:"admin.audit.export", state:"" },
    ]},
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

// ─── Permission state icon ────────────────────────────────────────────────────

function PermIcon({ state }: { state: PermState }) {
  if (state === "g-direct") {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--primary)",
        background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icons.Check size={10} color="#fff" strokeWidth={2.5} />
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

// ─── Permission tree node ─────────────────────────────────────────────────────

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
          padding: `7px 14px 7px ${14 + depth * 20}px`,
          borderBottom: "1px solid var(--border)",
          cursor: hasChildren ? "pointer" : "default",
          background: "transparent",
        }}
        onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
      >
        {/* Expand toggle */}
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
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
              {node.label}
            </span>
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
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>· {node.scope}</span>
            )}
          </div>
          {depth === 0 && hasChildren && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
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

// ─── Permissions tab ──────────────────────────────────────────────────────────

const STUDIO_TABS = [
  { id: "governance", label: "Governance" },
  { id: "datastudio",  label: "Data Studio" },
  { id: "agentic",    label: "Agentic" },
  { id: "admin",      label: "Admin" },
]

function PermissionsTab() {
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
    <div>
      {/* Studio tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
        {STUDIO_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setStudio(t.id)}
            style={{
              flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600,
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
        padding: "10px 14px", borderBottom: "1px solid var(--border)",
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
              width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
              fontSize: 12, border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--surface)", color: "var(--foreground)", outline: "none",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{grantedCount}</span>
          <span> / {totalCount} granted</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 12, padding: "8px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
      }}>
        {[
          { state: "g-direct" as PermState, label: "Direct" },
          { state: "g-inh"    as PermState, label: "Via role" },
          { state: "g-denied" as PermState, label: "Denied" },
          { state: ""         as PermState, label: "None" },
        ].map(l => (
          <div key={l.state} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PermIcon state={l.state} />
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 12 }}>
            No permissions match "{filter}"
          </div>
        ) : (
          filteredNodes.map(n => <PermTreeNode key={n.id} node={n} depth={0} />)
        )}
      </div>
    </div>
  )
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

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
  auth:  <Icons.LogIn size={13} />,
  edit:  <Icons.FileEdit size={13} />,
  group: <Icons.Users size={13} />,
  role:  <Icons.ShieldCheck size={13} />,
  check: <Icons.CheckCircle size={13} />,
}

function ActivityTab() {
  return (
    <div style={{ padding: "4px 0" }}>
      {ACTIVITY_LOG.map((ev, i) => (
        <div
          key={i}
          style={{
            display: "flex", gap: 12, padding: "10px 16px",
            borderBottom: "1px solid var(--border)", alignItems: "flex-start",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "var(--surface-raised)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted-foreground)",
          }}>
            {ACTIVITY_ICON[ev.type]}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>{ev.msg}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{ev.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Member SlideOut ──────────────────────────────────────────────────────────

const ROLE_OPTIONS: MemberRole[] = ["Super Admin", "Tenant Admin", "Billing Admin", "Member", "Viewer"]

function MemberDetail({
  member, onClose, onRoleChange, onToggleSuspend, onRemove,
}: {
  member: Member
  onClose: () => void
  onRoleChange: (id: string, role: MemberRole) => void
  onToggleSuspend: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const statusColor = STATUS_COLOR[member.status]
  const isActive  = member.status === "active"
  const isInvited = member.status === "invited"

  return (
    <SlideOut
      open
      onClose={onClose}
      size="m"
      title={member.name}
      subtitle=""
      showIcon={false}
      showStatus={false}
      showTopButton={false}
      showChips={false}
      showCta={false}
      showTabs
      tabLabels={["Profile", "Permissions", "Activity"]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── TAB 0: Profile ── */}
      {activeTab === 0 && (
        <>
          {/* Identity block */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: isActive ? member.avatarColor : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
              color: isActive ? "#fff" : "var(--muted-foreground)",
              opacity: member.status === "suspended" ? 0.6 : 1,
            }}>
              {member.initials}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 3 }}>
                {member.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>
                {member.title && <span>{member.title} · </span>}{member.department}
              </div>
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

          {/* Info rows */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div style={{ margin: "0 24px 24px", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
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
                onClick={() => { onToggleSuspend(member.id); onClose() }}
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
              <div style={{ padding: "12px 14px", background: "color-mix(in srgb, var(--badge-error) 8%, transparent)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--badge-error)", marginBottom: 6 }}>
                  Remove {member.name}?
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10 }}>
                  They will lose all access immediately. This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { onRemove(member.id); onClose() }}
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
        </>
      )}

      {/* ── TAB 1: Permissions ── */}
      {activeTab === 1 && <PermissionsTab />}

      {/* ── TAB 2: Activity ── */}
      {activeTab === 2 && <ActivityTab />}
    </SlideOut>
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
        color: member.status === "active" ? "#fff" : "var(--muted-foreground)",
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

// ─── Main screen ──────────────────────────────────────────────────────────────

export function PeopleAccessMembersScreen() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [query, setQuery]               = useState("")
  const [members, setMembers]           = useState<Member[]>(MEMBERS)
  const [selected, setSelected]         = useState<Member | null>(null)

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
    setSelected(s => s?.id === id ? { ...s, role } : s)
  }
  function handleToggleSuspend(id: string) {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, status: m.status === "suspended" ? "active" : "suspended" } : m))
  }
  function handleRemove(id: string) {
    setMembers(ms => ms.filter(m => m.id !== id))
  }

  return (
    <>
      <ScreenLayout
        workspaceName="Avance Financial"
        userName="Thomas Gonzalez"
        userEmail="thomas.gonzalez@aimsos.ai"
        sidebarItems={SIDEBAR}
        activeSidebarId="people"
        header={(isScrolled) => (
          <Header
            size={isScrolled ? "compress" : "size-l"}
            title="People & Access"
            description={`${counts.all} members · Avance Financial workspace`}
            primaryAction={
              <Button variant="primary" size="sm">
                <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
                Invite member
              </Button>
            }
          />
        )}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <SwitchTab
            items={[
              { id: "all",       label: `All (${counts.all})`             },
              { id: "active",    label: `Active (${counts.active})`       },
              { id: "invited",   label: `Invited (${counts.invited})`     },
              { id: "suspended", label: `Suspended (${counts.suspended})` },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            size="s"
          />
          <div style={{ marginLeft: "auto", width: 240 }}>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search members…" />
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
          <div style={{
            padding: "10px 20px 10px 68px", display: "flex", alignItems: "center", gap: 14,
            background: "var(--surface-raised)", borderBottom: "1px solid var(--border)",
            fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            <span style={{ flex: 1 }}>Member</span>
            <span style={{ minWidth: 88, textAlign: "right" }}>Last active</span>
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
            filtered.map(m => <MemberRow key={m.id} member={m} onSelect={setSelected} />)
          )}
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)", textAlign: "right" }}>
            Showing {filtered.length} of {members.length} members
          </div>
        )}
      </ScreenLayout>

      {selected && (
        <MemberDetail
          member={selected}
          onClose={() => setSelected(null)}
          onRoleChange={handleRoleChange}
          onToggleSuspend={handleToggleSuspend}
          onRemove={handleRemove}
        />
      )}
    </>
  )
}
