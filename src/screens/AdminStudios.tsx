import { useState } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"
import { Tabs }         from "@/components/ui/tabs"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupAccess { id: string; name: string; members: number; access: boolean }
interface RoleAccess  { id: string; name: string; access: "full" | "limited" | "none" }
interface StudioToggle { id: string; label: string; description: string; value: boolean }

interface Studio {
  id: string; name: string; icon: string; accentColor: string
  description: string; status: "active" | "disabled"
  membersWithAccess: number; totalMembers: number
  stats: { label: string; value: string }[]
  groups: GroupAccess[]
  roles: RoleAccess[]
  settings: StudioToggle[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STUDIOS: Studio[] = [
  {
    id: "governance",
    name: "Governance Studio",
    icon: "Layers",
    accentColor: "#10b981",  // audit-ignore: prototype fixture data
    description: "Manages AI content authoring, domain governance, and promotion workflows.",
    status: "active",
    membersWithAccess: 28,
    totalMembers: 50,
    stats: [
      { label: "Active sandboxes",     value: "3"  },
      { label: "Content bundles",      value: "15" },
      { label: "Promotion packets",    value: "8"  },
      { label: "Resolution requests",  value: "2"  },
    ],
    groups: [
      { id: "g1", name: "Risk & Compliance", members: 8,  access: true  },
      { id: "g2", name: "Engineering",       members: 12, access: true  },
      { id: "g3", name: "Data",              members: 6,  access: true  },
      { id: "g4", name: "Finance",           members: 5,  access: false },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",    access: "full"    },
      { id: "r2", name: "Tenant Admin",   access: "full"    },
      { id: "r3", name: "Member",         access: "limited" },
      { id: "r4", name: "Viewer",         access: "limited" },
      { id: "r5", name: "Billing Admin",  access: "none"    },
    ],
    settings: [
      { id: "s1", label: "Require promotion approval",     description: "Packets must be approved by a Tenant Admin before reaching the Truth plane.", value: true  },
      { id: "s2", label: "Truth plane lock",               description: "Prevent direct edits to Truth plane records without a promotion packet.",      value: true  },
      { id: "s3", label: "Sandbox auto-expiry",            description: "Automatically expire sandboxes after 90 days of inactivity.",                  value: false },
      { id: "s4", label: "Audit all sandbox reads",        description: "Log every read of sandbox records to the workspace audit log.",               value: false },
      { id: "s5", label: "Allow Member-level authoring",   description: "Members can create and edit content in sandboxes (not Truth plane).",         value: true  },
    ],
  },
  {
    id: "datastudio",
    name: "Data Studio",
    icon: "FlaskConical",
    accentColor: "#8b5cf6",  // audit-ignore: prototype fixture data
    description: "Data modeling, lineage tracking, entity management, and governed schema publication.",
    status: "active",
    membersWithAccess: 35,
    totalMembers: 50,
    stats: [
      { label: "Published models", value: "14" },
      { label: "Draft models",     value: "22" },
      { label: "Deprecated",       value: "6"  },
      { label: "Domains",          value: "5"  },
    ],
    groups: [
      { id: "g1", name: "Engineering",       members: 12, access: true  },
      { id: "g2", name: "Data",              members: 6,  access: true  },
      { id: "g3", name: "Risk & Compliance", members: 8,  access: true  },
      { id: "g4", name: "Finance",           members: 5,  access: true  },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",   access: "full"    },
      { id: "r2", name: "Tenant Admin",  access: "full"    },
      { id: "r3", name: "Member",        access: "full"    },
      { id: "r4", name: "Viewer",        access: "limited" },
      { id: "r5", name: "Billing Admin", access: "none"    },
    ],
    settings: [
      { id: "s1", label: "Lineage visible to Viewers",    description: "Allow Viewer-role members to browse the data lineage graph.",                  value: true  },
      { id: "s2", label: "Schema validation on publish",  description: "Enforce schema compatibility checks before a model can be published.",          value: true  },
      { id: "s3", label: "Model versioning",              description: "Automatically version models on each publish (v1, v2, …).",                    value: true  },
      { id: "s4", label: "Require peer review to publish","description": "A second author must approve a model before it transitions to Published.",     value: false },
      { id: "s5", label: "Auto-deprecate on replace",     description: "Automatically mark the previous version as Deprecated when a new one publishes.", value: false },
    ],
  },
  {
    id: "agentic",
    name: "Agentic Studio",
    icon: "Bot",
    accentColor: "#06b6d4",  // audit-ignore: prototype fixture data
    description: "Manages AI workers, multi-agent workflows, human review handoffs, and run history.",
    status: "active",
    membersWithAccess: 22,
    totalMembers: 50,
    stats: [
      { label: "Active workers",    value: "7"  },
      { label: "Networks",          value: "3"  },
      { label: "HITL queue",        value: "4"  },
      { label: "Runs today",        value: "19" },
    ],
    groups: [
      { id: "g1", name: "Engineering",       members: 12, access: true  },
      { id: "g2", name: "Data",              members: 6,  access: true  },
      { id: "g3", name: "Risk & Compliance", members: 8,  access: false },
      { id: "g4", name: "Finance",           members: 5,  access: false },
      { id: "g5", name: "Executives",        members: 4,  access: false },
      { id: "g6", name: "Operations",        members: 7,  access: false },
    ],
    roles: [
      { id: "r1", name: "Super Admin",   access: "full"    },
      { id: "r2", name: "Tenant Admin",  access: "full"    },
      { id: "r3", name: "Member",        access: "limited" },
      { id: "r4", name: "Viewer",        access: "none"    },
      { id: "r5", name: "Billing Admin", access: "none"    },
    ],
    settings: [
      { id: "s1", label: "HITL required for high-risk decisions", description: "Workers flagged as high-risk must pause and request a human decision.", value: true  },
      { id: "s2", label: "Audit all worker runs",                 description: "Log inputs, outputs, and token usage for every worker invocation.",    value: true  },
      { id: "s3", label: "Auto-shutdown idle workers",            description: "Suspend workers with no runs in the last 7 days.",                     value: false },
      { id: "s4", label: "Require governance binding",            description: "Workers must be bound to a Governance Studio domain before deploying.", value: false },
      { id: "s5", label: "Allow scheduled runs",                  description: "Enable cron-triggered worker runs in addition to on-demand.",          value: true  },
    ],
  },
]

// ─── Shared toggle ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: checked ? "var(--primary)" : "var(--border)",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",  // audit-ignore: prototype fixture data
      }} />
    </button>
  )
}

// ─── Detail page ──────────────────────────────────────────────────────────────

function StudioDetailPage({ studio }: { studio: Studio }) {
  const [tab, setTab]       = useState("access")
  const [groups, setGroups] = useState<GroupAccess[]>(studio.groups)
  const [toggles, setToggles] = useState<StudioToggle[]>(studio.settings)

  function flipGroup(id: string) {
    setGroups(g => g.map(x => x.id === id ? { ...x, access: !x.access } : x))
  }
  function flipToggle(id: string) {
    setToggles(t => t.map(x => x.id === id ? { ...x, value: !x.value } : x))
  }

  const ACCESS_COLOR: Record<RoleAccess["access"], string> = {
    full:    "var(--badge-success)",
    limited: "var(--badge-alert)",
    none:    "var(--muted-foreground)",
  }

  const IC = Icons[studio.icon as keyof typeof Icons] as React.ElementType

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Identity + stats row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: `${studio.accentColor}18`, border: `1px solid ${studio.accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: studio.accentColor,
        }}>
          {IC ? <IC size={22} /> : null}
        </div>
        <div style={{ flex: 1, fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          {studio.description}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {studio.stats.map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
            padding: "12px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: studio.accentColor }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <Tabs
          items={[
            { id: "access",   label: "Access"   },
            { id: "settings", label: "Settings" },
          ]}
          activeId={tab}
          onChange={setTab}
          size="s"
        />
      </div>

      {/* Tab body */}
      {tab === "access" && (
        <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Groups</span>
            </div>
            {groups.map((g, i) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < groups.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: g.access ? `${studio.accentColor}18` : "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: g.access ? studio.accentColor : "var(--muted-foreground)",
                }}>
                  <Icons.Users size={13} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{g.members} members</div>
                </div>
                <Toggle checked={g.access} onChange={() => flipGroup(g.id)} />
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Roles</span>
            </div>
            {studio.roles.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < studio.roles.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--foreground)" }}>{r.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                  background: `${ACCESS_COLOR[r.access]}18`, color: ACCESS_COLOR[r.access],
                  border: `1px solid ${ACCESS_COLOR[r.access]}30`,
                }}>
                  {r.access === "full" ? "Full access" : r.access === "limited" ? "Limited" : "No access"}
                </span>
              </div>
            ))}
          </div>

          <div><Button variant="secondary" size="sm">Save access changes</Button></div>
        </>
      )}

      {tab === "settings" && (
        <>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            {toggles.map((t, i) => (
              <div key={t.id} style={{ padding: "14px 16px", borderBottom: i < toggles.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>{t.description}</div>
                </div>
                <div style={{ paddingTop: 2 }}>
                  <Toggle checked={t.value} onChange={() => flipToggle(t.id)} />
                </div>
              </div>
            ))}
          </div>
          <div><Button variant="main" size="sm">Save settings</Button></div>
        </>
      )}
    </div>
  )
}

// ─── Studio card ──────────────────────────────────────────────────────────────

function StudioCard({ studio, selected, onClick }: {
  studio: Studio; selected: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  const accessPct = Math.round((studio.membersWithAccess / studio.totalMembers) * 100)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer",
        background: selected ? "color-mix(in srgb, var(--primary) 8%, transparent)"
          : hov ? "var(--accent)" : "transparent",
        borderLeft: selected ? `3px solid ${studio.accentColor}` : "3px solid transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: `${studio.accentColor}18`, border: `1px solid ${studio.accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: studio.accentColor,
        }}>
          {(() => { const IC = Icons[studio.icon as keyof typeof Icons] as React.ElementType; return IC ? <IC size={22} /> : null })()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{studio.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100,
              background: "var(--badge-success)15", color: "var(--badge-success)",
            }}>
              Active
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 10, lineHeight: 1.4 }}>
            {studio.description}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16 }}>
            {studio.stats.map(s => (
              <div key={s.label}>
                <span style={{ fontSize: 15, fontWeight: 800, color: studio.accentColor }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Access bar */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--border)" }}>
              <div style={{ height: "100%", width: `${accessPct}%`, borderRadius: 2, background: studio.accentColor }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
              {studio.membersWithAccess} / {studio.totalMembers} members have access
            </span>
          </div>
        </div>

        <Icons.ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 14 }} />
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminStudiosScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [detailView, setDetailView] = useState<Studio | null>(null)

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="studios"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => detailView ? (
        <Header
          size={isScrolled ? "compress" : "size-m"}
          title={detailView.name}
          description="Studios"
          onBack={() => setDetailView(null)}
          primaryAction={
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">
                <Icons.Settings size={14} style={{ marginRight: 4 }} />
                Configure
              </Button>
              <Button variant={detailView.status === "active" ? "secondary" : "main"} size="sm">
                {detailView.status === "active" ? "Disable studio" : "Enable studio"}
              </Button>
            </div>
          }
        />
      ) : (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Studios"
          description="Manage studio access, settings, and usage across the workspace"
        />
      )}
    >
      {/* Detail page */}
      {detailView && (
        <StudioDetailPage key={detailView.id} studio={detailView} />
      )}

      {/* Studio list */}
      {!detailView && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Studios
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{STUDIOS.filter(s => s.status === "active").length} of {STUDIOS.length} active</span>
          </div>
          {STUDIOS.map(studio => (
            <StudioCard
              key={studio.id}
              studio={studio}
              selected={false}
              onClick={() => setDetailView(studio)}
            />
          ))}
        </div>
      )}
    </ScreenLayout>
  )
}
