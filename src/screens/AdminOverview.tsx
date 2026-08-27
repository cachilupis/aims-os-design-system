import { useState, useCallback } from "react"
import { ADMIN_SIDEBAR as SIDEBAR } from "./adminShared"
import * as Icons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header }       from "@/components/ui/header"
import { Button }       from "@/components/ui/button"

// ─── Sidebar ──────────────────────────────────────────────────────────────────


// ─── Tile ─────────────────────────────────────────────────────────────────────

function KpiTile({ icon, label, value, delta, deltaUp, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number
  delta?: string; deltaUp?: boolean; sub?: string; accent: string
}) {
  return (
    <div style={{
      padding: "18px 20px", border: "1px solid var(--border)", borderRadius: 12,
      background: "var(--surface)", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
        background: `${accent}18`, color: accent, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>{label}</div>
      </div>
      {(delta || sub) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          {delta && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: deltaUp ? "var(--badge-success)" : "var(--badge-error)",
              display: "flex", alignItems: "center", gap: 2,
            }}>
              {deltaUp ? <Icons.TrendingUp size={11} /> : <Icons.TrendingDown size={11} />}
              {delta}
            </span>
          )}
          {sub && <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

interface AlertBanner { id: string; severity: "error" | "warning" | "info"; title: string; detail: string; cta?: string }

const INITIAL_ALERTS: AlertBanner[] = [
  { id: "sf-sync", severity: "error",   title: "Salesforce CRM sync failed", detail: "OAuth token expired at 08:00 today. Re-authenticate to restore data sync.", cta: "Fix now" },
  { id: "mfa",     severity: "warning", title: "10 members have not enrolled in MFA", detail: "Your security policy recommends MFA for all active members.",          cta: "Review" },
]

const SEVERITY_META = {
  error:   { color: "var(--badge-error)",   bg: "color-mix(in srgb, var(--badge-error) 8%, transparent)",   icon: <Icons.AlertCircle size={15} /> },
  warning: { color: "var(--badge-alert)",   bg: "color-mix(in srgb, var(--badge-alert) 8%, transparent)",   icon: <Icons.AlertTriangle size={15} /> },
  info:    { color: "var(--badge-info)",    bg: "color-mix(in srgb, var(--badge-info) 8%, transparent)",    icon: <Icons.Info size={15} /> },
}

function AlertBanners({ alerts, onDismiss }: { alerts: AlertBanner[]; onDismiss: (id: string) => void }) {
  if (alerts.length === 0) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
      {alerts.map(a => {
        const meta = SEVERITY_META[a.severity]
        return (
          <div key={a.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            border: `1px solid ${meta.color}33`, borderRadius: 10,
            background: meta.bg, borderLeft: `3px solid ${meta.color}`,
          }}>
            <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{a.title}</span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginLeft: 8 }}>{a.detail}</span>
            </div>
            {a.cta && (
              <button style={{
                fontSize: 12, fontWeight: 700, color: meta.color, background: "none",
                border: `1px solid ${meta.color}44`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", flexShrink: 0,
              }}>
                {a.cta}
              </button>
            )}
            <button
              onClick={() => onDismiss(a.id)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              <Icons.X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Recent activity ──────────────────────────────────────────────────────────

interface ActivityItem {
  initials: string; color: string; name: string
  action: string; time: string; category: string; catColor: string
}

const ACTIVITY: ActivityItem[] = [
  { initials: "TG", color: "#6366f1", name: "Thomas Gonzalez", action: "granted permission to Eduardo Suárez — governance.sandbox.bundles", time: "09:12", category: "Access",      catColor: "#8b5cf6" },  // audit-ignore: prototype fixture data
  { initials: "TG", color: "#6366f1", name: "Thomas Gonzalez", action: "invited Leo Ramírez as Member",                                     time: "09:11", category: "Members",     catColor: "#10b981" },  // audit-ignore: prototype fixture data
  { initials: "MG", color: "#10b981", name: "Maria García",    action: "updated organization profile — support contact email",              time: "08:46", category: "Settings",    catColor: "#64748b" },  // audit-ignore: prototype fixture data
  { initials: "MG", color: "#10b981", name: "Maria García",    action: "changed role of Ana Torres → Viewer",                               time: "08:48", category: "Members",     catColor: "#10b981" },  // audit-ignore: prototype fixture data
  { initials: "ES", color: "#f97316", name: "Eduardo Suárez",  action: "triggered AI worker — Transaction Classifier (12 records, 4.2s)",   time: "17:42", category: "Agents",      catColor: "#06b6d4" },  // audit-ignore: prototype fixture data
  { initials: "ES", color: "#f97316", name: "Eduardo Suárez",  action: "created model draft — Transaction Entity v3",                       time: "17:30", category: "Content",     catColor: "#f97316" },  // audit-ignore: prototype fixture data
  { initials: "SB", color: "#ef4444", name: "Sarah Brown",     action: "submitted promotion packet GV-2200: Risk Model Update",             time: "14:12", category: "Governance",  catColor: "#10b981" },  // audit-ignore: prototype fixture data
  { initials: "SY", color: "#64748b", name: "System",          action: "integration sync failed — Salesforce CRM (OAuth token expired)",    time: "08:00", category: "Alert",       catColor: "#ef4444" },  // audit-ignore: prototype fixture data
]

function ActivityFeed() {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Recent activity</div>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Today · Aug 26, 2026</span>
      </div>
      {ACTIVITY.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 18px",
          borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: item.color, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff",  // audit-ignore: prototype fixture data
          }}>
            {item.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700 }}>{item.name}</span>
              {" "}
              <span style={{ color: "var(--muted-foreground)" }}>{item.action}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
              background: `${item.catColor}18`, color: item.catColor,
            }}>
              {item.category}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
              {item.time}
            </span>
          </div>
        </div>
      ))}
      <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-raised)", textAlign: "center" }}>
        <button style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          View full audit log →
        </button>
      </div>
    </div>
  )
}

// ─── Needs attention ──────────────────────────────────────────────────────────

interface AttentionItem {
  icon: React.ReactNode
  severity: "error" | "warning" | "info"
  title: string
  desc: string
  cta: string
}

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    icon: <Icons.Plug size={14} />,
    severity: "error",
    title: "Salesforce CRM disconnected",
    desc: "OAuth token expired — data sync paused since 08:00",
    cta: "Re-authenticate",
  },
  {
    icon: <Icons.ShieldAlert size={14} />,
    severity: "warning",
    title: "10 members without MFA",
    desc: "Your security policy requires MFA for all active members",
    cta: "Review",
  },
  {
    icon: <Icons.ShieldOff size={14} />,
    severity: "warning",
    title: "Security score: 50 / 100",
    desc: "2 of 4 security checks are failing",
    cta: "See checks",
  },
  {
    icon: <Icons.CreditCard size={14} />,
    severity: "info",
    title: "AI tokens at 42% of limit",
    desc: "4.2M of 10M tokens used — 8 days left in billing cycle",
    cta: "View usage",
  },
]

const ATTENTION_META = {
  error:   { color: "var(--badge-error)",   dot: "#ef4444" },  // audit-ignore: prototype fixture data
  warning: { color: "var(--badge-alert)",   dot: "#f97316" },  // audit-ignore: prototype fixture data
  info:    { color: "var(--badge-info)",    dot: "#6366f1" },  // audit-ignore: prototype fixture data
}

function NeedsAttention() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const visible = ATTENTION_ITEMS.filter(a => !dismissed.has(a.title))

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Needs attention</div>
        {visible.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 100,
            background: "var(--badge-error)15", color: "var(--badge-error)",
          }}>{visible.length}</span>
        )}
      </div>
      {visible.length === 0 ? (
        <div style={{ padding: "28px 18px", textAlign: "center" }}>
          <Icons.CheckCircle size={22} style={{ color: "var(--badge-success)", margin: "0 auto 8px" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>All clear</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>No pending items right now</div>
        </div>
      ) : (
        visible.map((item, i) => {
          const meta = ATTENTION_META[item.severity]
          return (
            <div key={item.title} style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 18px",
              borderBottom: i < visible.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: `${meta.dot}15`, color: meta.color,
                display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 1 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.4 }}>{item.desc}</div>
                <button style={{
                  marginTop: 6, fontSize: 11, fontWeight: 700, color: meta.color,
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                }}>
                  {item.cta} →
                </button>
              </div>
              <button
                onClick={() => setDismissed(s => new Set([...s, item.title]))}
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
              >
                <Icons.X size={12} />
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── System status ────────────────────────────────────────────────────────────

interface StatusItem { label: string; status: "operational" | "degraded" | "outage"; latency?: string }

const STATUS_ITEMS: StatusItem[] = [
  { label: "Governance Studio",  status: "operational", latency: "42ms"   },
  { label: "Agentic Studio",     status: "operational", latency: "68ms"   },
  { label: "Data Studio",        status: "operational", latency: "55ms"   },
  { label: "Salesforce CRM",     status: "degraded",    latency: "–"      },
  { label: "Databricks",         status: "operational", latency: "120ms"  },
  { label: "AI Inference",       status: "operational", latency: "310ms"  },
]

const STATUS_META = {
  operational: { color: "var(--badge-success)", label: "Operational"  },
  degraded:    { color: "var(--badge-alert)",   label: "Degraded"     },
  outage:      { color: "var(--badge-error)",   label: "Outage"       },
}

function SystemStatus() {
  const allOk = STATUS_ITEMS.every(s => s.status === "operational")
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>System status</div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
          background: allOk ? "var(--badge-success)15" : "var(--badge-alert)15",
          color: allOk ? "var(--badge-success)" : "var(--badge-alert)",
        }}>
          {allOk ? "All systems operational" : "1 service degraded"}
        </span>
      </div>
      {STATUS_ITEMS.map((item, i) => {
        const meta = STATUS_META[item.status]
        return (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
            borderBottom: i < STATUS_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)" }}>{item.label}</span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
              {item.latency}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>{meta.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ label, used, total, unit, color }: {
  label: string; used: number; total: number; unit: string; color: string
}) {
  const pct = Math.round((used / total) * 100)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          {used.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 3 }}>{pct}% used</div>
    </div>
  )
}

function UsageCard() {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden", marginBottom: 16 }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Usage this month</div>
        <Button variant="secondary" size="sm">View billing</Button>
      </div>
      <div style={{ padding: "16px 18px 4px" }}>
        <UsageBar label="AI output tokens"    used={4_180_000} total={10_000_000} unit="tokens"    color={"#6366f1" /* audit-ignore: prototype fixture data */} />
        <UsageBar label="Active AI workers"   used={7}          total={20}          unit="workers"   color={"#06b6d4" /* audit-ignore: prototype fixture data */} />
        <UsageBar label="Data Studio models"  used={14}         total={50}          unit="models"    color={"#8b5cf6" /* audit-ignore: prototype fixture data */} />
        <UsageBar label="Governance sandboxes" used={3}         total={10}          unit="sandboxes" color={"#10b981" /* audit-ignore: prototype fixture data */} />
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminOverviewScreen({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const [alerts, setAlerts] = useState<AlertBanner[]>(INITIAL_ALERTS)
  const dismissAlert = useCallback((id: string) => setAlerts(a => a.filter(x => x.id !== id)), [])

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="overview"
      onSidebarItemClick={onNavigate}
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Overview"
          description="Avance Financial · Enterprise plan · 50 members · US East"
          primaryAction={
            <Button variant="main" size="sm">
              <Icons.UserPlus size={14} style={{ marginRight: 4 }} />
              Invite member
            </Button>
          }
        />
      )}
    >
      {/* Alert banners */}
      <AlertBanners alerts={alerts} onDismiss={dismissAlert} />

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <KpiTile
          icon={<Icons.Users size={17} />}
          label="Active members"
          value={47}
          delta="+3 this month"
          deltaUp
          accent="#6366f1"  // audit-ignore: prototype fixture data
        />
        <KpiTile
          icon={<Icons.Plug size={17} />}
          label="Integrations connected"
          value={6}
          sub="1 sync issue"
          accent="#0ea5e9"  // audit-ignore: prototype fixture data
        />
        <KpiTile
          icon={<Icons.Bot size={17} />}
          label="AI workers running"
          value={7}
          delta="2 scheduled today"
          deltaUp
          accent="#06b6d4"  // audit-ignore: prototype fixture data
        />
        <KpiTile
          icon={<Icons.Shield size={17} />}
          label="Security score"
          value="50 / 100"
          sub="2 of 4 checks passing"
          accent="#f97316"  // audit-ignore: prototype fixture data
        />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* Left — activity feed */}
        <div>
          <ActivityFeed />
        </div>

        {/* Right — actions + status + usage */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <NeedsAttention />
          </div>
          <div style={{ marginBottom: 16 }}>
            <SystemStatus />
          </div>
          <UsageCard />
        </div>
      </div>
    </ScreenLayout>
  )
}
