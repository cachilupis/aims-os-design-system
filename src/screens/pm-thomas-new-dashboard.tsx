import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { ScreenLayout } from "@/components/layouts/screen-layout"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContainer } from "@/components/ui/card-container"
import type { SidebarItem } from "@/components/ui/sidebar"

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfileTypeId = "Company" | "Contact" | "Employee" | "Deal"
type AudType       = "global" | "role" | "team" | "individual"
type Surface       = "profile" | "report" | "home"
type HomeScope     = "personal" | "team" | "workspace"
type StartMode     = "blank" | "template"

// ── Data ─────────────────────────────────────────────────────────────────────

const PROFILE_TYPES: { id: ProfileTypeId; label: string; tabs: string[] }[] = [
  { id: "Company",  label: "Company",  tabs: ["Overview", "Activity", "Contacts", "Deals", "Documents"] },
  { id: "Contact",  label: "Contact",  tabs: ["Overview", "Activity", "Deals", "Documents"] },
  { id: "Employee", label: "Employee", tabs: ["Overview", "Activity", "Performance", "Documents"] },
  { id: "Deal",     label: "Deal",     tabs: ["Overview", "Activity", "Timeline", "Documents"] },
]

const AUDIENCE_TYPES: { id: AudType; label: string }[] = [
  { id: "global",     label: "Everyone" },
  { id: "role",       label: "By role" },
  { id: "team",       label: "By team" },
  { id: "individual", label: "Specific user" },
]

const AUDIENCE_TARGETS: Record<string, string[]> = {
  role:       ["Sales Agent", "Account Manager", "Support Rep", "Manager", "Executive", "Admin"],
  team:       ["Sales", "Customer Success", "Operations", "Marketing", "Finance", "HR"],
  individual: ["Thomas G.", "Alex R.", "Maria C.", "Sam L.", "Jordan K."],
}

const REPORT_COLLECTIONS = ["Sales Reports", "Finance Reports", "Operations Reports", "HR Reports", "Marketing Reports", "Executive Reports"]

const HOME_SCOPES: { id: HomeScope; label: string }[] = [
  { id: "personal",  label: "My home" },
  { id: "team",      label: "Team home" },
  { id: "workspace", label: "Workspace home" },
]

const DASHBOARD_TEMPLATES = [
  { id: "t-account-360",    name: "Account 360",       desc: "Overview, activity, open deals, and contacts for any company profile." },
  { id: "t-sales-pipeline", name: "Sales Pipeline",    desc: "Pipeline funnel, deal velocity, and rep leaderboard." },
  { id: "t-support-health", name: "Support Health",    desc: "Ticket volume, CSAT, SLA breaches, and open escalations." },
  { id: "t-exec-revenue",   name: "Executive Revenue", desc: "Revenue KPIs, forecast vs. actuals, and win/loss breakdown." },
  { id: "t-team-home",      name: "Team Home",         desc: "Work queue, pending HTL items, recent activity, and quick actions." },
]

const STEPS = ["Placement", "Start point"]

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home",          label: "Home",          icon: "Home" },
  { id: "dashboards",    label: "My Dashboards", icon: "LayoutDashboard" },
  { id: "widget-library",label: "Widget Library",icon: "Library" },
  { id: "marketplace",   label: "Marketplace",   icon: "Store" },
]

// ── DS-GAP Components ─────────────────────────────────────────────────────────

// DS-GAP: SectionChip — toggleable pill chip for form option selection. Closest DS component: Chip.
function SectionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32, padding: "0 12px", borderRadius: 16, border: `1px solid ${active ? "var(--primary)" : "var(--field-border)"}`,
        background: active ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
        color: active ? "var(--primary)" : "var(--color-text-subtitle)",
        fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const,
        display: "inline-flex", alignItems: "center", transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  )
}

// DS-GAP: OptionCard — large selectable card with icon, title, description. Closest DS component: CardContainer.
function OptionCard({ selected, onClick, iconName, title, desc }: {
  selected: boolean; onClick: () => void; iconName: string; title: string; desc: string
}) {
  const Icon = (LucideIcons as Record<string, unknown>)[iconName] as React.FC<{ size?: number; style?: React.CSSProperties }>
  return (
    <div style={{ cursor: "pointer" }} onClick={onClick}>
      <CardContainer selected={selected} className="h-full">
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <Icon size={20} style={{ color: "var(--primary)" }} />
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-title)" }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", lineHeight: 1.5 }}>{desc}</div>
        </div>
      </CardContainer>
    </div>
  )
}

// DS-GAP: StepIndicator — linear progress dots with step labels. Closest DS component: none.
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: i <= current ? "var(--primary)" : "var(--field-border)",
              color: i <= current ? "var(--canvas)" : "var(--color-text-subtitle)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === current ? 600 : 400, color: i === current ? "var(--color-text-title)" : "var(--color-text-subtitle)", whiteSpace: "nowrap" as const }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: "var(--field-border)", margin: "0 12px" }} />}
        </div>
      ))}
    </div>
  )
}

// DS-GAP: FieldLabel — section label for form groups. Closest DS component: none.
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", marginBottom: 8 }}>{children}</div>
}

function FormSection({ children }: { children: React.ReactNode }) {
  return (
    <CardContainer className="flex flex-col gap-4">
      {children}
    </CardContainer>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PMThomasNewDashboardScreen() {
  // Wizard step
  const [step, setStep] = useState(0)

  // Placement form state
  const [kind, setKind]             = useState<"profile" | "global">("profile")
  const [surface, setSurface]       = useState<Surface>("profile")
  const [profileType, setProfileType] = useState<ProfileTypeId>("Company")
  const [scope, setScope]           = useState<"all" | "entity">("all")
  const [entityName, setEntityName] = useState("")
  const [tab, setTab]               = useState("Overview")
  const [reportCollection, setReportCollection] = useState(REPORT_COLLECTIONS[0])
  const [homeScope, setHomeScope]   = useState<HomeScope>("personal")
  const [audType, setAudType]       = useState<AudType>("global")
  const [audTarget, setAudTarget]   = useState(AUDIENCE_TARGETS.role[0])
  const [dashName, setDashName]     = useState("")

  // Start point state
  const [startMode, setStartMode]   = useState<StartMode>("template")
  const [templateId, setTemplateId] = useState(DASHBOARD_TEMPLATES[0].id)

  // Created state (replaces router navigation)
  const [created, setCreated]       = useState(false)

  // ── Derived values ──

  const profileTabs = PROFILE_TYPES.find(t => t.id === profileType)?.tabs ?? ["Overview"]

  const audLabel = audType === "global" ? "Everyone" : audTarget

  const suggestedName = surface === "profile"
    ? `${audLabel} — ${profileType} 360`
    : surface === "report"
    ? reportCollection
    : HOME_SCOPES.find(h => h.id === homeScope)?.label ?? "Home"

  const destinationLabel = surface === "profile"
    ? `${scope === "all" ? `All ${profileType} profiles` : entityName.trim() || `Specific ${profileType}`} · ${tab} tab`
    : surface === "report"
    ? reportCollection
    : HOME_SCOPES.find(h => h.id === homeScope)?.label ?? "Home"

  const placementValid = surface === "profile"
    ? !!tab && (scope === "all" || !!entityName.trim())
    : surface === "report" ? !!reportCollection : !!homeScope

  const canNext0 = dashName.trim().length > 0 && placementValid
  const canCreate = startMode === "blank" || !!templateId

  const blockingHint = step === 0 && !canNext0
    ? dashName.trim() === "" ? "Name your dashboard to continue" : "Complete placement settings to continue"
    : ""

  // ── Handlers ──

  function selectKind(k: "profile" | "global") {
    setKind(k)
    setSurface(k === "profile" ? "profile" : "report")
    setScope("all"); setEntityName("")
  }

  function selectProfileType(id: ProfileTypeId) {
    setProfileType(id)
    setScope("all"); setEntityName("")
    setTab(PROFILE_TYPES.find(t => t.id === id)?.tabs[0] ?? "Overview")
  }

  function selectAudType(id: AudType) {
    setAudType(id)
    if (id !== "global") setAudTarget(AUDIENCE_TARGETS[id]?.[0] ?? "")
  }

  function handleCreate() {
    setCreated(true)
  }

  const MapPinIcon = LucideIcons.MapPin as React.FC<{ size?: number; style?: React.CSSProperties }>
  const CheckIcon  = LucideIcons.Check  as React.FC<{ size?: number; style?: React.CSSProperties }>
  const ChevronLeftIcon  = LucideIcons.ChevronLeft  as React.FC<{ size?: number }>
  const ChevronRightIcon = LucideIcons.ChevronRight as React.FC<{ size?: number }>

  const stepTitles       = ["New dashboard", "Choose a starting point"]
  const stepDescriptions = [
    "Choose where this dashboard lives and who it's for.",
    "Start from a blank canvas or jump-start with a pre-built layout.",
  ]

  return (
    <ScreenLayout
      workspaceName="Acme Corp"
      userName="Thomas G."
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR_ITEMS}
      activeSidebarId="dashboards"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title={created ? "Dashboard created" : stepTitles[step]}
          description={created ? "Your new dashboard is ready to build." : stepDescriptions[step]}
        />
      )}
    >
      {/* ── Created success state ── */}
      {created && (
        <div style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" as const }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckIcon size={28} style={{ color: "var(--canvas)" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 8 }}>{dashName || "Untitled dashboard"}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-subtitle)", marginBottom: 24 }}>
            {destinationLabel} · Audience: {audLabel}
          </div>
          <Button variant="primary" onClick={() => { setCreated(false); setStep(0); setDashName("") }}>
            Create another
          </Button>
        </div>
      )}

      {/* ── Wizard ── */}
      {!created && (
        <div style={{ maxWidth: 672, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <StepIndicator steps={STEPS} current={step} />

          {/* ── Step 0: Placement ── */}
          {step === 0 && (
            <>
              {/* Dashboard kind */}
              <div>
                <FieldLabel>What kind of dashboard?</FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <OptionCard selected={kind === "profile"} onClick={() => selectKind("profile")} iconName="UserSquare" title="Profile dashboard" desc="Shows on a contact, account, or employee record — lives in that profile's tabs." />
                  <OptionCard selected={kind === "global"} onClick={() => selectKind("global")} iconName="LayoutGrid" title="Standalone dashboard" desc="A report, home, or workspace page — not tied to any single record." />
                </div>
              </div>

              {/* Profile surface details */}
              {kind === "profile" && (
                <FormSection>
                  <div>
                    <FieldLabel>Profile type</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                      {PROFILE_TYPES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => selectProfileType(t.id)}
                          style={{
                            padding: "8px 12px", borderRadius: 8, border: `1px solid ${profileType === t.id ? "var(--primary)" : "var(--field-border)"}`,
                            background: profileType === t.id ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                            color: profileType === t.id ? "var(--primary)" : "var(--color-text-subtitle)",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left" as const,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Apply to</FieldLabel>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      <SectionChip active={scope === "all"} onClick={() => { setScope("all"); setEntityName("") }}>
                        Every {profileType} profile
                      </SectionChip>
                      <SectionChip active={scope === "entity"} onClick={() => setScope("entity")}>
                        A specific {profileType}
                      </SectionChip>
                    </div>
                    {scope === "entity" && (
                      <div style={{ marginTop: 10 }}>
                        {/* DS-GAP: EntityRecordPicker — autocomplete for specific entity records. Using plain Input here. */}
                        <Input placeholder={`Search for a ${profileType}…`} value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                      </div>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Tab</FieldLabel>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {profileTabs.map(t => (
                        <SectionChip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</SectionChip>
                      ))}
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Standalone surface type */}
              {kind === "global" && (
                <div>
                  <FieldLabel>Where should it live?</FieldLabel>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    <SectionChip active={surface === "report"} onClick={() => setSurface("report")}>Report collection</SectionChip>
                    <SectionChip active={surface === "home"}   onClick={() => setSurface("home")}>Home / Workspace</SectionChip>
                  </div>
                </div>
              )}

              {kind === "global" && surface === "report" && (
                <FormSection>
                  <div>
                    <FieldLabel>Report collection</FieldLabel>
                    <select
                      value={reportCollection}
                      onChange={(e) => setReportCollection(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--field-border)", background: "var(--surface)", color: "var(--color-text-title)", fontSize: 13 }}
                    >
                      {REPORT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </FormSection>
              )}

              {kind === "global" && surface === "home" && (
                <FormSection>
                  <div>
                    <FieldLabel>Home for</FieldLabel>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {HOME_SCOPES.map(h => (
                        <SectionChip key={h.id} active={homeScope === h.id} onClick={() => setHomeScope(h.id)}>{h.label}</SectionChip>
                      ))}
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Audience */}
              <div>
                <FieldLabel>Audience</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {AUDIENCE_TYPES.map(t => (
                      <SectionChip key={t.id} active={audType === t.id} onClick={() => selectAudType(t.id)}>{t.label}</SectionChip>
                    ))}
                  </div>
                  {audType !== "global" && (
                    <select
                      value={audTarget}
                      onChange={(e) => setAudTarget(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--field-border)", background: "var(--surface)", color: "var(--color-text-title)", fontSize: 13 }}
                    >
                      {(AUDIENCE_TARGETS[audType] ?? []).map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  )}
                  {audType === "global" && (
                    <p style={{ fontSize: 12, color: "var(--color-text-subtitle)", margin: 0 }}>Anyone with workspace access can see this dashboard.</p>
                  )}
                </div>
              </div>

              {/* Dashboard name */}
              <div>
                <FieldLabel>Dashboard name</FieldLabel>
                <Input
                  placeholder={suggestedName || "e.g. Sales — Account 360"}
                  value={dashName}
                  onChange={(e) => setDashName(e.target.value)}
                />
                {dashName === "" && suggestedName && (
                  <button
                    onClick={() => setDashName(suggestedName)}
                    style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Use "{suggestedName}"
                  </button>
                )}
              </div>

              {/* Destination summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--canvas)" }}>
                <MapPinIcon size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>Destination: </span>
                  {destinationLabel} · {audLabel}
                </span>
              </div>
            </>
          )}

          {/* ── Step 1: Start point ── */}
          {step === 1 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <OptionCard selected={startMode === "blank"} onClick={() => setStartMode("blank")} iconName="LayoutGrid" title="Blank canvas" desc="Start empty and place widgets yourself." />
                <OptionCard selected={startMode === "template"} onClick={() => setStartMode("template")} iconName="Sparkles" title="From an AIMS template" desc="Start from a pre-built layout you can adjust." />
              </div>

              {startMode === "template" && (
                <div>
                  <FieldLabel>Pick a template</FieldLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DASHBOARD_TEMPLATES.map(t => (
                      <div key={t.id} onClick={() => setTemplateId(t.id)} style={{ cursor: "pointer" }}>
                        <CardContainer selected={templateId === t.id} className="hover:opacity-90">
                          <div style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-title)" }}>{t.name}</div>
                            <div style={{ fontSize: 12, color: "var(--color-text-subtitle)", marginTop: 2 }}>{t.desc}</div>
                          </div>
                        </CardContainer>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--field-border)", background: "var(--canvas)" }}>
                <MapPinIcon size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--color-text-subtitle)" }}>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>Will be created in: </span>
                  {destinationLabel}
                </span>
              </div>
            </>
          )}

          {/* ── Footer nav ── */}
          <div style={{ borderTop: "1px solid var(--field-border)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button variant="secondary" onClick={() => { if (step === 0) { /* back to list */ } else setStep(0) }}>
              <ChevronLeftIcon size={16} />
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {step === 0 ? (
                <Button variant="primary" disabled={!canNext0} onClick={() => setStep(1)}>
                  Next: Start point
                  <ChevronRightIcon size={16} />
                </Button>
              ) : (
                <Button variant="primary" disabled={!canCreate} onClick={handleCreate}>
                  <CheckIcon size={16} style={{ color: "inherit" }} />
                  Create dashboard
                </Button>
              )}
              {blockingHint && (
                <p style={{ fontSize: 11, color: "var(--color-text-subtitle)", margin: 0 }}>{blockingHint}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </ScreenLayout>
  )
}
