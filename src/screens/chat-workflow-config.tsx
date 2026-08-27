import { useState, useRef, useEffect } from "react"
import * as Icons from "lucide-react"
import { ScreenLayout }   from "@/components/layouts/screen-layout"
import { Header }         from "@/components/ui/header"
import { Button }         from "@/components/ui/button"
import { Input }          from "@/components/ui/input"
import { Checkbox }       from "@/components/ui/checkbox"
import { SwitchTab }      from "@/components/ui/switch-tab"
import { Tag }            from "@/components/ui/tag"
import type { SidebarItem } from "@/components/ui/sidebar"

const SIDEBAR: SidebarItem[] = [
  { id: "home",       label: "Home",       icon: "Home"     },
  { id: "workflows",  label: "Workflows",  icon: "Zap"      },
  { id: "agents",     label: "Agents",     icon: "Bot"      },
  { id: "data",       label: "Data",       icon: "Database" },
  { id: "governance", label: "Governance", icon: "Shield"   },
  { id: "settings",   label: "Settings",   icon: "Settings" },
]

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const STRUCTURED_SOURCES = [
  { id: "crm",       name: "CRM Contacts",      system: "Salesforce",  desc: "Customer and prospect records" },
  { id: "gl",        name: "General Ledger",     system: "NetSuite",    desc: "Transaction and accounting data" },
  { id: "hr",        name: "Employee Directory", system: "Workday",     desc: "Org structure and headcount" },
  { id: "pipeline",  name: "Sales Pipeline",     system: "HubSpot",     desc: "Opportunity stages and forecasts" },
  { id: "inventory", name: "Inventory Records",  system: "SAP",         desc: "SKU stock levels and movements" },
  { id: "support",   name: "Support Tickets",    system: "Zendesk",     desc: "Customer issues and resolutions" },
  { id: "billing",   name: "Billing Records",    system: "Stripe",      desc: "Invoices, payments, subscriptions" },
]

const UNSTRUCTURED_SOURCES = [
  { id: "contracts", name: "Contracts Repository", dept: "Legal",            desc: "PDF agreements and amendments" },
  { id: "meetings",  name: "Meeting Notes",         dept: "Operations",       desc: "Call transcripts and summaries" },
  { id: "email",     name: "Email Archive",          dept: "Sales",           desc: "Customer communication threads" },
  { id: "policies",  name: "Policy Documents",       dept: "Compliance",      desc: "Internal policies and procedures" },
  { id: "kb",        name: "Knowledge Base",          dept: "Customer Success", desc: "Help articles and FAQs" },
]

// Deliberately missing: Shopify, Marketo, QuickBooks
const PROVISIONED_CONNECTORS = [
  "Salesforce", "NetSuite", "Workday", "HubSpot", "SAP",
  "Zendesk", "Stripe", "Slack", "Google Workspace",
]

// ─── Node Vocabulary Table — explicit, inspectable ────────────────────────────

type ClassificationKey = "solo_lectura" | "lectura_escritura" | "lectura_escritura_pii"

const NODE_VOCABULARY: Record<ClassificationKey, string[]> = {
  solo_lectura: [
    "trigger", "consulta", "filtro", "transformacion",
    "analisis", "resumen", "revision_humana",
  ],
  lectura_escritura: [
    "trigger", "consulta", "filtro", "transformacion", "analisis", "resumen",
    "revision_humana", "escritura_sistema", "notificacion", "correo", "creacion_registro",
  ],
  lectura_escritura_pii: [
    "trigger", "consulta", "filtro", "transformacion", "analisis", "resumen",
    "revision_humana", "escritura_sistema", "notificacion", "correo", "creacion_registro",
    "acceso_pii", "desidentificacion",
  ],
}

const NODE_LABELS: Record<string, string> = {
  trigger: "Trigger", consulta: "Data Query", filtro: "Filter",
  transformacion: "Transform", analisis: "Analyze", resumen: "Summarize",
  revision_humana: "Human Review", escritura_sistema: "Write to System",
  notificacion: "Notify", correo: "Send Email", creacion_registro: "Create Record",
  acceso_pii: "PII Access", desidentificacion: "De-identify",
}

const NODE_COLORS: Record<string, string> = {
  trigger:           "var(--primary)",
  consulta:          "var(--badge-light-blue)",
  filtro:            "var(--muted-foreground)",
  transformacion:    "var(--badge-purple)",
  analisis:          "var(--badge-lime-green)",
  resumen:           "var(--badge-lime-green)",
  revision_humana:   "var(--badge-alert)",
  escritura_sistema: "var(--badge-success)",
  notificacion:      "var(--badge-light-blue)",
  correo:            "var(--badge-light-blue)",
  creacion_registro: "var(--badge-success)",
  acceso_pii:        "var(--badge-error)",
  desidentificacion: "var(--badge-error)",
}

const WORKFLOW_CATEGORIES = [
  "Revenue Operations",
  "Sales",
  "Finance",
  "HR & People",
  "Compliance",
  "Customer Success",
  "Operations",
  "IT & Security",
]

const CLASSIFICATION_OPTIONS = [
  {
    key: "solo_lectura" as ClassificationKey,
    title: "Read-only",
    consequence: "This workflow can query and analyze information, but cannot write to any system or send communications.",
  },
  {
    key: "lectura_escritura" as ClassificationKey,
    title: "Read and write",
    consequence: "This workflow can query information and also update systems and send communications.",
  },
  {
    key: "lectura_escritura_pii" as ClassificationKey,
    title: "Read, write, and sensitive data",
    consequence: "Same as above, but can also access personal or restricted information, with additional controls.",
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceConfig = { truthOnly: boolean; requiresBridge: boolean }
type WorkflowNode = { id: string; type: string; label: string; description: string }
type WorkflowEdge = { from: string; to: string }
type WorkflowDraft = {
  intentSummary: string
  classification: ClassificationKey
  sources: Array<{ id: string; name: string } & SourceConfig>
  systems: Array<{ name: string; provisioned: boolean }>
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  envelope: { allowedNodeTypes: string[] }
  missingDependencies: string[]
}

type StageKey = "0" | "1" | "2" | "3"
type TimingData = {
  sessionStart: number
  stageEnter: Partial<Record<StageKey, number>>
  stageExit: Partial<Record<StageKey, number>>
  draftAt?: number
  turnsByStage: Partial<Record<StageKey, number>>
}

type Substage =
  | "intent-input" | "intent-confirm" | "classification"
  | "source-select" | "source-config" | "systems-input" | "systems-resolved" | "done"

// ─── Draft generator ──────────────────────────────────────────────────────────

function generateDraft(
  intent: string,
  cls: ClassificationKey,
  selectedSources: string[],
  sourceConfigs: Record<string, SourceConfig>,
  systemNames: string[],
): WorkflowDraft {
  const allowed = NODE_VOCABULARY[cls]
  const can = (t: string) => allowed.includes(t)
  const nodes: WorkflowNode[] = []
  const edges: WorkflowEdge[] = []

  const add = (type: string, label: string, description: string) => {
    if (!can(type)) return
    const id = `${type}-${nodes.length}`
    if (nodes.length > 0) edges.push({ from: nodes[nodes.length - 1].id, to: id })
    nodes.push({ id, type, label, description })
  }

  const allSrcs = [...STRUCTURED_SOURCES, ...UNSTRUCTURED_SOURCES]

  add("trigger", "Scheduled Trigger", "Initiates the workflow on schedule or event")

  const hasSensitive = selectedSources.some(id => ["hr", "billing", "email"].includes(id))
  if (hasSensitive) {
    add("acceso_pii", "PII Data Access", "Access controlled personal data with audit trail")
    add("desidentificacion", "De-identify PII", "Strip direct identifiers before processing")
  }

  if (selectedSources.length === 0) {
    add("consulta", "Data Query", "Retrieve relevant records from connected sources")
  } else {
    for (const sid of selectedSources) {
      const src = allSrcs.find(s => s.id === sid)
      if (!src) continue
      add("consulta", `Query: ${src.name}`, `Retrieve records from ${"system" in src ? src.system : src.dept}`)
      if (sourceConfigs[sid]?.requiresBridge) {
        add("filtro", "Bridge Filter", "Normalize via connector bridge")
      }
    }
  }

  add("transformacion", "Transform Data", "Normalize and reshape input records")
  add("analisis", "Analyze", "Apply business logic and compute derived metrics")
  add("resumen", "Summarize Results", "Prepare human-readable output")

  if (can("revision_humana") && cls !== "solo_lectura") {
    add("revision_humana", "Human Review", "Pause for authorized approval before output")
  }

  if (can("notificacion")) add("notificacion", "Notify Stakeholders", "Send internal notification to stakeholders")
  if (can("escritura_sistema")) add("escritura_sistema", "Write to System", "Update records in target system")
  if (can("correo")) add("correo", "Send Summary Email", "Deliver formatted report to recipients")

  const systems = systemNames.map(name => ({
    name: name.trim(),
    provisioned: PROVISIONED_CONNECTORS.some(c => c.toLowerCase() === name.trim().toLowerCase()),
  }))

  return {
    intentSummary: intent.trim(),
    classification: cls,
    sources: selectedSources.map(id => {
      const src = allSrcs.find(s => s.id === id)!
      return { id, name: src.name, ...(sourceConfigs[id] ?? { truthOnly: false, requiresBridge: false }) }
    }),
    systems,
    nodes,
    edges,
    envelope: { allowedNodeTypes: allowed },
    missingDependencies: systems.filter(s => !s.provisioned).map(s => `${s.name} — connector not provisioned`),
  }
}

// ─── Canvas graph ─────────────────────────────────────────────────────────────

function CanvasGraph({ draft }: { draft: WorkflowDraft }) {
  const NW = 300, NH = 72, GAP = 24, PX = 30, PY = 20
  const SVG_W = NW + PX * 2
  const SVG_H = draft.nodes.length * (NH + GAP) - GAP + PY * 2

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {draft.edges.map(e => {
            const fi = draft.nodes.findIndex(n => n.id === e.from)
            const ti = draft.nodes.findIndex(n => n.id === e.to)
            if (fi < 0 || ti < 0) return null
            const x = PX + NW / 2
            const y1 = PY + fi * (NH + GAP) + NH
            const y2 = PY + ti * (NH + GAP)
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 3" />
                <polygon points={`${x - 5},${y2 - 8} ${x + 5},${y2 - 8} ${x},${y2}`} fill="var(--border)" />
              </g>
            )
          })}
          {draft.nodes.map((node, idx) => {
            const x = PX, y = PY + idx * (NH + GAP)
            const color = NODE_COLORS[node.type] || "var(--muted-foreground)"
            return (
              <g key={node.id}>
                <rect x={x} y={y} width={NW} height={NH} rx={8} fill="var(--surface-raised)" stroke={color} strokeWidth={1.5} />
                <rect x={x + 1} y={y + 1} width={4} height={NH - 2} rx={4} fill={color} />
                <text x={x + 16} y={y + 22} fontSize={9} fill={color} fontWeight={700} fontFamily="inherit">
                  {(NODE_LABELS[node.type] || node.type).toUpperCase()}
                </text>
                <text x={x + 16} y={y + 44} fontSize={13} fill="var(--foreground)" fontWeight={500} fontFamily="inherit">
                  {node.label.length > 34 ? node.label.slice(0, 31) + "…" : node.label}
                </text>
                <text x={x + 16} y={y + 62} fontSize={10} fill="var(--muted-foreground)" fontFamily="inherit">
                  {node.description.length > 42 ? node.description.slice(0, 39) + "…" : node.description}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {draft.missingDependencies.length > 0 && (
        <div style={{
          margin: "16px 16px 0", border: "1px solid var(--badge-alert)", borderRadius: 8,
          padding: "12px 16px", background: "rgba(237,108,2,0.06)",  // audit-ignore: prototype fixture data
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--badge-alert)", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Icons.AlertTriangle size={13} />
            Blocking dependencies — activation is not possible until resolved
          </div>
          {draft.missingDependencies.map(dep => (
            <div key={dep} style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>• {dep}</div>
          ))}
        </div>
      )}
      {draft.missingDependencies.length === 0 && (
        <div style={{
          margin: "16px 16px 0", border: "1px solid var(--badge-success)", borderRadius: 8,
          padding: "10px 16px", background: "rgba(0,118,95,0.06)", display: "flex", alignItems: "center", gap: 8,  // audit-ignore: prototype fixture data
        }}>
          <Icons.CheckCircle2 size={13} color="var(--badge-success)" />
          <span style={{ fontSize: 12, color: "var(--badge-success)", fontWeight: 600 }}>All connectors provisioned — no blocking dependencies</span>
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}

// ─── Debug panel ──────────────────────────────────────────────────────────────

function DebugPanel({ classification }: { classification: ClassificationKey | null }) {
  if (!classification) {
    return (
      <div style={{ padding: 16, fontSize: 12, color: "var(--muted-foreground)" }}>
        Active vocabulary will appear here after Stage 1 (Classification) is complete.
      </div>
    )
  }
  const allowed = NODE_VOCABULARY[classification]
  const allTypes = NODE_VOCABULARY.lectura_escritura_pii
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Active vocabulary — {classification}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {allTypes.map(type => {
          const active = allowed.includes(type)
          return (
            <div key={type} style={{
              padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              background: active ? `${NODE_COLORS[type]}22` : "var(--muted)",
              color: active ? NODE_COLORS[type] : "var(--muted-foreground)",
              border: `1px solid ${active ? NODE_COLORS[type] : "transparent"}`,
              opacity: active ? 1 : 0.4,
            }}>
              {NODE_LABELS[type]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Instrumentation panel ────────────────────────────────────────────────────

function InstrumentationPanel({ timing, collapsed, onToggle, onExport }: {
  timing: TimingData; collapsed: boolean; onToggle: () => void; onExport: () => void
}) {
  const stages: { key: StageKey; label: string }[] = [
    { key: "0", label: "Intent" }, { key: "1", label: "Classification" },
    { key: "2", label: "Data Sources" }, { key: "3", label: "Systems" },
  ]
  return (
    <div style={{ borderTop: "1px solid var(--border)", fontSize: 12 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "8px 16px", cursor: "pointer", display: "flex",
          alignItems: "center", gap: 8, background: "none", border: "none",
          color: "var(--muted-foreground)", fontSize: 12,
        }}
      >
        <Icons.Activity size={12} />
        <span>Instrumentation</span>
        <span style={{ marginLeft: "auto" }}>{collapsed ? "▾" : "▴"}</span>
      </button>
      {!collapsed && (
        <div style={{ padding: "0 16px 12px" }}>
          {stages.map(s => {
            const enter = timing.stageEnter[s.key]
            const exit = timing.stageExit[s.key]
            const dur = enter && exit ? `${((exit - enter) / 1000).toFixed(1)}s` : enter ? "in progress" : "—"
            const turns = timing.turnsByStage[s.key] ?? 0
            return (
              <div key={s.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--muted-foreground)" }}>
                <span>{s.label}</span>
                <span style={{ color: "var(--foreground)" }}>{dur} · {turns} turn{turns !== 1 ? "s" : ""}</span>
              </div>
            )
          })}
          {timing.draftAt && (
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 4, fontWeight: 600 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Total to draft</span>
              <span style={{ color: "var(--primary)" }}>{((timing.draftAt - timing.sessionStart) / 1000).toFixed(1)}s</span>
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <Button variant="secondary" size="sm" onClick={onExport}>Export JSON</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ChatWorkflowConfigScreen() {
  const [substage, setSubstage] = useState<Substage>("intent-input")
  const [inputValue, setInputValue] = useState("")
  const [intentText, setIntentText] = useState("")
  const [classification, setClassification] = useState<ClassificationKey | null>(null)
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [sourceConfigs, setSourceConfigs] = useState<Record<string, SourceConfig>>({})
  const [systemsInput, setSystemsInput] = useState("")
  const [draft, setDraft] = useState<WorkflowDraft | null>(null)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowCategory, setWorkflowCategory] = useState(WORKFLOW_CATEGORIES[0])
  const [saveState, setSaveState] = useState<null | "draft" | "deployed">(null)

  const [view, setView] = useState<"conversation" | "canvas">("conversation")
  const [showDebug, setShowDebug] = useState(false)
  const [instrCollapsed, setInstrCollapsed] = useState(true)

  const [messages, setMessages] = useState<Array<{ role: "system" | "user"; text: string }>>([
    { role: "system", text: "Describe in one sentence what you want to build. I'll help you configure the governance gates before generating the workflow draft." },
  ])

  const timingRef = useRef<TimingData>({
    sessionStart: Date.now(),
    stageEnter: { "0": Date.now() },
    stageExit: {},
    turnsByStage: { "0": 0 },
  })
  const [timingSnap, setTimingSnap] = useState(timingRef.current)
  const tick = () => setTimingSnap({ ...timingRef.current })

  const chatBottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const stageNum = (): StageKey => {
    if (substage === "intent-input" || substage === "intent-confirm") return "0"
    if (substage === "classification") return "1"
    if (substage === "source-select" || substage === "source-config") return "2"
    return "3"
  }

  const addMsg = (role: "system" | "user", text: string) =>
    setMessages(prev => [...prev, { role, text }])

  const enterStage = (s: StageKey) => {
    timingRef.current.stageEnter[s] = Date.now()
    timingRef.current.turnsByStage[s] = 0
    tick()
  }
  const exitStage = (s: StageKey) => { timingRef.current.stageExit[s] = Date.now(); tick() }
  const incTurn = () => {
    const s = stageNum()
    timingRef.current.turnsByStage[s] = (timingRef.current.turnsByStage[s] ?? 0) + 1
    tick()
  }

  const delay = (fn: () => void) => setTimeout(fn, 350)

  // ── Stage 0: Intent ──

  const handleIntentSubmit = () => {
    if (!inputValue.trim()) return
    const text = inputValue.trim()
    setIntentText(text); setInputValue(""); incTurn()
    addMsg("user", text)
    delay(() => {
      addMsg("system", `Got it. Here's what I understood:\n\n"${text}"\n\nIs that right?`)
      setSubstage("intent-confirm")
    })
  }

  const handleConfirmYes = () => {
    incTurn(); addMsg("user", "Yes, that's right.")
    exitStage("0"); enterStage("1"); setSubstage("classification")
    delay(() => addMsg("system", "Choose how this workflow will interact with your systems. The option you pick determines what the workflow can and cannot do:"))
  }

  const handleRephrase = () => {
    incTurn(); addMsg("user", "Let me rephrase.")
    setSubstage("intent-input")
    delay(() => addMsg("system", "Sure — describe again what you want to build."))
  }

  // ── Stage 1: Classification ──

  const handleClassification = (key: ClassificationKey) => {
    setClassification(key); incTurn()
    const labels = { solo_lectura: "Read-only", lectura_escritura: "Read and write", lectura_escritura_pii: "Read, write, and sensitive data" }
    addMsg("user", labels[key])
    exitStage("1"); enterStage("2"); setSubstage("source-select")
    delay(() => addMsg("system", "Select the data sources this workflow will read from. You can pick multiple structured and unstructured sources."))
  }

  // ── Stage 2: Sources ──

  const toggleSource = (id: string) =>
    setSelectedSources(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const handleSourcesContinue = () => {
    incTurn()
    const names = [...selectedSources].map(id => [...STRUCTURED_SOURCES, ...UNSTRUCTURED_SOURCES].find(s => s.id === id)?.name ?? id)
    addMsg("user", selectedSources.size === 0 ? "No specific sources." : `Selected: ${names.join(", ")}.`)
    if (selectedSources.size > 0) {
      setSubstage("source-config")
      delay(() => addMsg("system", "For each selected source, specify how it should be treated:"))
    } else {
      exitStage("2"); enterStage("3"); setSubstage("systems-input")
      delay(() => addMsg("system", "Name the external systems this workflow will interact with — separate with commas."))
    }
  }

  const handleSourceConfigContinue = () => {
    incTurn()
    const parts = [...selectedSources].map(id => {
      const cfg = sourceConfigs[id] ?? { truthOnly: false, requiresBridge: false }
      const src = [...STRUCTURED_SOURCES, ...UNSTRUCTURED_SOURCES].find(s => s.id === id)!
      return `${src.name}: truth-only=${cfg.truthOnly ? "yes" : "no"}, bridge=${cfg.requiresBridge ? "yes" : "no"}`
    })
    addMsg("user", parts.join(" | "))
    exitStage("2"); enterStage("3"); setSubstage("systems-input")
    delay(() => addMsg("system", "Name the external systems this workflow will interact with — separate with commas."))
  }

  const toggleSourceCfg = (id: string, field: keyof SourceConfig) =>
    setSourceConfigs(prev => ({ ...prev, [id]: { ...(prev[id] ?? { truthOnly: false, requiresBridge: false }), [field]: !(prev[id]?.[field]) } }))

  // ── Stage 3: Systems ──

  const handleSystemsResolve = () => {
    if (!systemsInput.trim()) return
    incTurn(); addMsg("user", systemsInput)
    const names = systemsInput.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    const resolved = names.map(name => ({
      name, provisioned: PROVISIONED_CONNECTORS.some(c => c.toLowerCase() === name.toLowerCase()),
    }))
    const ok = resolved.filter(s => s.provisioned).map(s => s.name)
    const missing = resolved.filter(s => !s.provisioned).map(s => s.name)
    let msg = ""
    if (ok.length) msg += `Provisioned: ${ok.join(", ")}. `
    if (missing.length) msg += `Not provisioned (blocking): ${missing.join(", ")}. `
    msg += "\nReady to generate the workflow draft."
    delay(() => {
      addMsg("system", msg.trim())
      setSubstage("systems-resolved")
    })
  }

  const handleGenerateDraft = () => {
    incTurn()
    addMsg("user", "Generate the draft.")
    const names = systemsInput.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    const d = generateDraft(intentText, classification!, [...selectedSources], sourceConfigs, names)
    setDraft(d)
    timingRef.current.draftAt = Date.now()
    exitStage("3"); tick()
    setSubstage("done")
    delay(() => {
      addMsg("system", `Draft ready — ${d.nodes.length} nodes, ${d.sources.length} sources, ${d.systems.length} systems. ${d.missingDependencies.length ? `${d.missingDependencies.length} blocking dependencies.` : "No blocking dependencies."}`)
      setView("canvas")
    })
  }

  const handleExportInstrumentation = () => {
    const data = {
      sessionId: `session-${timingRef.current.sessionStart}`,
      ...timingRef.current,
      draft: draft ? { classification: draft.classification, nodeCount: draft.nodes.length, sourceCount: draft.sources.length, systemCount: draft.systems.length, missingDependencies: draft.missingDependencies } : null,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `wf-session-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveDraft = () => {
    if (!workflowName.trim()) return
    setSaveState("draft")
    setView("conversation")
    addMsg("system", `"${workflowName.trim()}" saved as draft in ${workflowCategory}. It won't run until you activate it — resolve any blocking connectors first.`)
  }

  const handleDeploy = () => {
    if (!workflowName.trim() || !draft || draft.missingDependencies.length > 0) return
    setSaveState("deployed")
    setView("conversation")
    addMsg("system", `"${workflowName.trim()}" is live in ${workflowCategory}. It will execute on its defined trigger. You can monitor it from the Workflows list.`)
  }

  const handleStartNew = () => {
    setSubstage("intent-input")
    setInputValue("")
    setIntentText("")
    setClassification(null)
    setSelectedSources(new Set())
    setSourceConfigs({})
    setSystemsInput("")
    setDraft(null)
    setWorkflowName("")
    setWorkflowCategory(WORKFLOW_CATEGORIES[0])
    setSaveState(null)
    setView("conversation")
    setMessages([{ role: "system", text: "Describe in one sentence what you want to build. I'll help you configure the governance gates before generating the workflow draft." }])
    timingRef.current = { sessionStart: Date.now(), stageEnter: { "0": Date.now() }, stageExit: {}, turnsByStage: { "0": 0 } }
    tick()
  }

  // ── Widget area ──

  const renderWidget = () => {
    switch (substage) {
      case "intent-input":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleIntentSubmit() }}
              placeholder="Describe what you want to automate…"
            />
            <Button onClick={handleIntentSubmit} disabled={!inputValue.trim()}>Send</Button>
          </div>
        )

      case "intent-confirm":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleConfirmYes}>Yes, continue</Button>
            <Button variant="secondary" onClick={handleRephrase}>Rephrase</Button>
          </div>
        )

      case "classification":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CLASSIFICATION_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => handleClassification(opt.key)}
                style={{
                  textAlign: "left", padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                  background: "var(--surface-raised)", border: "1px solid var(--border)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5 }}>{opt.consequence}</div>
              </button>
            ))}
          </div>
        )

      case "source-select": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Structured</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {STRUCTURED_SOURCES.map(src => (
                <button
                  key={src.id}
                  onClick={() => toggleSource(src.id)}
                  style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    background: selectedSources.has(src.id) ? "var(--accent)" : "var(--surface-raised)",
                    border: `1px solid ${selectedSources.has(src.id) ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{src.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{src.system}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Unstructured</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {UNSTRUCTURED_SOURCES.map(src => (
                <button
                  key={src.id}
                  onClick={() => toggleSource(src.id)}
                  style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    background: selectedSources.has(src.id) ? "var(--accent)" : "var(--surface-raised)",
                    border: `1px solid ${selectedSources.has(src.id) ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{src.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{src.dept}</div>
                </button>
              ))}
            </div>
            <Button onClick={handleSourcesContinue}>
              Continue {selectedSources.size > 0 ? `(${selectedSources.size} selected)` : "without sources"}
            </Button>
          </div>
        )
      }

      case "source-config":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...selectedSources].map(id => {
              const src = [...STRUCTURED_SOURCES, ...UNSTRUCTURED_SOURCES].find(s => s.id === id)!
              const cfg = sourceConfigs[id] ?? { truthOnly: false, requiresBridge: false }
              return (
                <div key={id} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-raised)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>{src.name}</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <Checkbox
                      checked={cfg.truthOnly}
                      onChange={() => toggleSourceCfg(id, "truthOnly")}
                      label="Truth-only (no writes)"
                      size="sm"
                    />
                    <Checkbox
                      checked={cfg.requiresBridge}
                      onChange={() => toggleSourceCfg(id, "requiresBridge")}
                      label="Requires bridge"
                      size="sm"
                    />
                  </div>
                </div>
              )
            })}
            <Button onClick={handleSourceConfigContinue}>Continue</Button>
          </div>
        )

      case "systems-input":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Input
              value={systemsInput}
              onChange={e => setSystemsInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSystemsResolve() }}
              placeholder="e.g. Salesforce, Shopify, Marketo"
            />
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Provisioned: {PROVISIONED_CONNECTORS.join(", ")}
            </div>
            <Button onClick={handleSystemsResolve} disabled={!systemsInput.trim()}>Resolve systems</Button>
          </div>
        )

      case "systems-resolved":
        return (
          <Button onClick={handleGenerateDraft} variant="primary">
            Generate workflow draft
          </Button>
        )

      default:
        return null
    }
  }

  // ── Render ──

  const STAGE_LABELS: Record<Substage, string> = {
    "intent-input": "Stage 0 — Intent", "intent-confirm": "Stage 0 — Intent",
    "classification": "Stage 1 — Classification",
    "source-select": "Stage 2 — Data sources", "source-config": "Stage 2 — Data sources",
    "systems-input": "Stage 3 — Systems", "systems-resolved": "Stage 3 — Systems",
    "done": "Done",
  }

  return (
    <ScreenLayout
      workspaceName="Avance Financial"
      userName="Thomas Gonzalez"
      userEmail="thomas.gonzalez@aimsos.ai"
      sidebarItems={SIDEBAR}
      activeSidebarId="workflows"
      header={(isScrolled) => (
        <Header
          size={isScrolled ? "compress" : "size-l"}
          title="Workflow configuration"
          description="Helix Agentic Studio · conversational governance gates"
          tag={<Tag variant="informative" size="sm">{STAGE_LABELS[substage]}</Tag>}
          primaryAction={
            <Button
              variant={showDebug ? "secondary" : "tertiary"}
              size="sm"
              onClick={() => setShowDebug(d => !d)}
            >
              <Icons.Bug size={14} style={{ marginRight: 4 }} />
              Debug
            </Button>
          }
        />
      )}
    >
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)", minHeight: 500 }}>

        {/* ── Left: chat + widget ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
          borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden",
          background: "var(--surface)",
        }}>
          {/* Tab bar */}
          <div style={{ padding: "12px 16px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SwitchTab
              items={[
                { id: "conversation", label: "Conversation" },
                { id: "canvas", label: "Canvas", icon: draft ? <Icons.CheckCircle2 size={12} /> : undefined },
              ]}
              value={view}
              onChange={id => setView(id as "conversation" | "canvas")}
              size="s"
            />
          </div>

          {view === "conversation" ? (
            <>
              {/* Chat history */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {messages.map((msg, i) => (
                  msg.role === "system" ? (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, maxWidth: "88%" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: "var(--primary)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                      }}>
                        <Icons.Zap size={13} color={"#fff" /* audit-ignore: prototype fixture data */} />

                      </div>
                      <div style={{
                        background: "var(--surface-raised)", border: "1px solid var(--border)",
                        borderRadius: "0 10px 10px 10px", padding: "10px 14px",
                        fontSize: 13, color: "var(--foreground)", lineHeight: 1.55, whiteSpace: "pre-wrap",
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                      <div style={{
                        background: "var(--primary)", borderRadius: "10px 10px 0 10px",
                        padding: "10px 14px", fontSize: 13, color: "#fff", maxWidth: "76%", lineHeight: 1.55,  // audit-ignore: prototype fixture data
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  )
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Current widget */}
              <div style={{ borderTop: "1px solid var(--border)", padding: 14 }}>
                {renderWidget()}
              </div>
            </>
          ) : (
            draft ? <CanvasGraph draft={draft} /> : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                The canvas will appear here once the draft is generated.
              </div>
            )
          )}
        </div>

        {/* ── Right: debug + instrumentation ── */}
        <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          {showDebug && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-raised)", flexShrink: 0 }}>
              <div style={{ padding: "12px 16px 0", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Vocabulary debug
              </div>
              <DebugPanel classification={classification} />
            </div>
          )}

          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-raised)", overflow: "hidden" }}>
            <InstrumentationPanel
              timing={timingSnap}
              collapsed={instrCollapsed}
              onToggle={() => setInstrCollapsed(c => !c)}
              onExport={handleExportInstrumentation}
            />
            {!instrCollapsed && draft && (
              <div style={{ padding: "0 16px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Draft summary</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  <div>Nodes: <span style={{ color: "var(--foreground)" }}>{draft.nodes.length}</span></div>
                  <div>Classification: <span style={{ color: "var(--foreground)" }}>{draft.classification}</span></div>
                  <div>Sources: <span style={{ color: "var(--foreground)" }}>{draft.sources.length}</span></div>
                  <div>Systems: <span style={{ color: "var(--foreground)" }}>{draft.systems.length}</span></div>
                  <div>Missing deps: <span style={{ color: draft.missingDependencies.length ? "var(--badge-error)" : "var(--badge-success)" }}>{draft.missingDependencies.length}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {substage === "done" && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-raised)", overflow: "hidden" }}>
            {saveState ? (
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Icons.CheckCircle2 size={16} color={saveState === "deployed" ? "var(--badge-success)" : "var(--primary)"} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: saveState === "deployed" ? "var(--badge-success)" : "var(--primary)" }}>
                    {saveState === "deployed" ? "Deployed" : "Saved as draft"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16, lineHeight: 1.5 }}>
                  <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{workflowName}</span> · {workflowCategory}
                </div>
                <Button size="sm" variant="secondary" onClick={handleStartNew} style={{ width: "100%" }}>
                  + Start new workflow
                </Button>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                  Save workflow
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Workflow name</label>
                  <Input
                    value={workflowName}
                    onChange={e => setWorkflowName(e.target.value)}
                    placeholder="e.g. Revenue sync — daily"
                    size="sm"
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Category</label>
                  <select
                    value={workflowCategory}
                    onChange={e => setWorkflowCategory(e.target.value)}
                    style={{
                      width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 13,
                      background: "var(--surface)", border: "1px solid var(--border)",
                      color: "var(--foreground)", outline: "none", cursor: "pointer",
                    }}
                  >
                    {WORKFLOW_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {draft && draft.missingDependencies.length > 0 && (
                  <div style={{
                    padding: "8px 10px", borderRadius: 8, marginBottom: 12,
                    background: "rgba(237,108,2,0.06)", border: "1px solid var(--badge-alert)",  // audit-ignore: prototype fixture data
                    fontSize: 11, color: "var(--badge-alert)", lineHeight: 1.5,
                    display: "flex", gap: 6, alignItems: "flex-start",
                  }}>
                    <Icons.AlertTriangle size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>Deploy blocked — {draft.missingDependencies.length} unresolved connector{draft.missingDependencies.length !== 1 ? "s" : ""}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={!workflowName.trim()}
                    style={{ flex: 1 }}
                  >
                    Save draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeploy}
                    disabled={!workflowName.trim() || (draft?.missingDependencies.length ?? 0) > 0}
                    style={{ flex: 1 }}
                  >
                    Deploy
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}
