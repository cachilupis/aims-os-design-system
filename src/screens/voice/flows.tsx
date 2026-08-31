import { useMemo, useState, useEffect } from "react"
import { Phone, Search, Check, Bot, MapPin, Globe, CreditCard } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { SlideOut } from "@/components/ui/slide-out"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { CardContainer } from "@/components/ui/card-container"
import { Tabs } from "@/components/ui/tabs"
import type { PhoneNumber, VoiceAgent, NumberType, Capability } from "./data"

// ──────────────────────────────────────────────────────────────────────────────
// Buy Number wizard — 3-step flow to purchase a new phone number
// ──────────────────────────────────────────────────────────────────────────────

type NumberClass = "local" | "toll-free" | "mobile"
type Country     = "US" | "CA" | "MX"

const COUNTRIES: { id: Country; label: string; dial: string; flag: string }[] = [
  { id: "US", label: "United States", dial: "+1", flag: "🇺🇸" },
  { id: "CA", label: "Canada",        dial: "+1", flag: "🇨🇦" },
  { id: "MX", label: "Mexico",        dial: "+52", flag: "🇲🇽" },
]

const LOCAL_AREA_CODES: Record<Country, { code: string; city: string }[]> = {
  US: [
    { code: "305", city: "Miami, FL" },
    { code: "786", city: "Miami-Dade, FL" },
    { code: "954", city: "Fort Lauderdale, FL" },
    { code: "407", city: "Orlando, FL" },
    { code: "212", city: "Manhattan, NY" },
    { code: "415", city: "San Francisco, CA" },
    { code: "310", city: "Los Angeles, CA" },
    { code: "512", city: "Austin, TX" },
  ],
  CA: [
    { code: "416", city: "Toronto, ON" },
    { code: "604", city: "Vancouver, BC" },
    { code: "514", city: "Montréal, QC" },
    { code: "403", city: "Calgary, AB" },
  ],
  MX: [
    { code: "55",  city: "Ciudad de México" },
    { code: "81",  city: "Monterrey, NL" },
    { code: "33",  city: "Guadalajara, JAL" },
  ],
}

const TOLL_FREE_PREFIXES = [
  { code: "800", label: "800 · classic" },
  { code: "888", label: "888" },
  { code: "877", label: "877" },
  { code: "866", label: "866" },
]

const PRICING: Record<NumberClass, { setup: number; monthly: number }> = {
  local:       { setup: 0, monthly: 2  },
  "toll-free": { setup: 0, monthly: 3  },
  mobile:      { setup: 0, monthly: 4  },
}

const CLASS_LABEL: Record<NumberClass, string> = {
  local:       "Local",
  "toll-free": "Toll-free",
  mobile:      "Mobile",
}

interface BuyNumberModalProps {
  isOpen:  boolean
  onClose: () => void
  agents:  VoiceAgent[]
  onBuy:   (num: PhoneNumber, assignToAgentId: string | null) => void
  nextId:  number
}

export function BuyNumberModal({ isOpen, onClose, agents, onBuy, nextId }: BuyNumberModalProps) {
  const [step,     setStep]     = useState(1)
  const [country,  setCountry]  = useState<Country>("US")
  const [numClass, setNumClass] = useState<NumberClass>("local")
  const [area,     setArea]     = useState<string>("305")
  const [type,     setType]     = useState<Exclude<NumberType, null>>("both")
  const [caps,     setCaps]     = useState<Capability[]>(["Voice"])
  const [label,    setLabel]    = useState("")
  const [assignTo, setAssignTo] = useState<string | null>(null)
  const [picked,   setPicked]   = useState<string | null>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1); setCountry("US"); setNumClass("local"); setArea("305")
      setType("both"); setCaps(["Voice"])
      setLabel(""); setAssignTo(null); setPicked(null)
    }
  }, [isOpen])

  // When country changes, reset area code to first option for that country
  useEffect(() => {
    if (numClass === "local") setArea(LOCAL_AREA_CODES[country][0].code)
    else if (numClass === "toll-free") setArea(TOLL_FREE_PREFIXES[0].code)
    else setArea(LOCAL_AREA_CODES[country][0].code)
    setPicked(null)
  }, [country, numClass])

  const dial = COUNTRIES.find(c => c.id === country)?.dial ?? "+1"
  const price = PRICING[numClass]

  // Deterministic "search results" per (country, class, area)
  const suggestions = useMemo(() => {
    if (!area) return []
    const seed = (country.charCodeAt(0) + numClass.length + area.charCodeAt(0)) % 997
    return Array.from({ length: 6 }, (_, i) => {
      const mid  = String(200 + (seed * 13 + i * 37) % 800).padStart(3, "0")
      const last = String((seed * 7919 + i * 1234) % 10000).padStart(4, "0")
      return `${dial} (${area}) ${mid}-${last}`
    })
  }, [country, numClass, area, dial])

  const areaOptions = numClass === "toll-free"
    ? TOLL_FREE_PREFIXES.map(p => ({ code: p.code, city: p.label }))
    : LOCAL_AREA_CODES[country]

  const toggleCap = (c: Capability) =>
    setCaps(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  function confirm() {
    if (!picked) return
    const num: PhoneNumber = {
      id:           nextId,
      number:       picked,
      label:        label.trim() || null,
      type,
      status:       assignTo ? "active" : "unassigned",
      agent:        assignTo
        ? {
            name: agents.find(a => a.id === assignTo)?.name ?? "",
            kind: "agent",
          }
        : null,
      capabilities: caps,
      calls:        0,
    }
    onBuy(num, assignTo)
    onClose()
  }

  const canAdvance =
    step === 1 ? !!country && !!numClass && !!area && caps.length > 0 :
    step === 2 ? !!picked :
    true

  const cityLabel = areaOptions.find(a => a.code === area)?.city ?? ""

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      variant="content"
      tone="default"
      iconName="Phone"
      title="Buy a phone number"
      description={
        step === 1 ? "Step 1 of 3 · Country, number class and capabilities" :
        step === 2 ? "Step 2 of 3 · Pick an available number" :
                     "Step 3 of 3 · Configure, assign and confirm"
      }
      slot={
        <div className="flex flex-col gap-4 min-h-[360px]">

          {step === 1 && (
            <>
              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Country
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCountry(c.id)}
                      className="text-left"
                      style={{
                        padding: "10px 12px",
                        border: `1px solid ${country === c.id ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                        borderRadius: 8,
                        background: country === c.id ? "var(--color-surface-primary-more-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{c.flag}</span>
                      <div className="flex-1">
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{c.label}</div>
                        <div className="font-mono" style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{c.dial}</div>
                      </div>
                      {country === c.id && <Check size={14} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Number class
                </label>
                <Tabs
                  items={[
                    { id: "local",     label: `Local · $${PRICING.local.monthly}/mo`           },
                    { id: "toll-free", label: `Toll-free · $${PRICING["toll-free"].monthly}/mo` },
                    { id: "mobile",    label: `Mobile · $${PRICING.mobile.monthly}/mo`          },
                  ]}
                  activeId={numClass}
                  onChange={(id) => setNumClass(id as NumberClass)}
                  size="s"
                />
                <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 6 }}>
                  {numClass === "local"
                    ? "Local numbers use a regional area code — customers see a familiar prefix."
                    : numClass === "toll-free"
                      ? "Toll-free numbers are free to call from within the country. Best for support hotlines."
                      : "Mobile numbers support SMS by default and are perceived as personal reachouts."}
                </p>
              </section>

              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  {numClass === "toll-free" ? "Toll-free prefix" : "Area code"}
                </label>
                <div className="grid grid-cols-2 gap-2" style={{ maxHeight: 180, overflowY: "auto" }}>
                  {areaOptions.map(ac => (
                    <button
                      key={ac.code}
                      onClick={() => setArea(ac.code)}
                      className="text-left"
                      style={{
                        padding: "10px 12px",
                        border: `1px solid ${area === ac.code ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                        borderRadius: 8,
                        background: area === ac.code ? "var(--color-surface-primary-more-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={13} style={{ color: area === ac.code ? "var(--primary)" : "var(--color-icon-neutral-default)" }} />
                      <div className="flex-1">
                        <div className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>{dial} ({ac.code})</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{ac.city}</div>
                      </div>
                      {area === ac.code && <Check size={14} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Direction
                </label>
                <Tabs
                  items={[
                    { id: "both",     label: "Inbound + Outbound" },
                    { id: "inbound",  label: "Inbound only"       },
                    { id: "outbound", label: "Outbound only"      },
                  ]}
                  activeId={type}
                  onChange={(id) => setType(id as typeof type)}
                  size="s"
                />
              </section>

              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Capabilities
                </label>
                <div className="flex gap-2">
                  {(["Voice", "SMS"] as Capability[]).map(c => (
                    <Tag
                      key={c}
                      variant={caps.includes(c) ? "informative" : "secondary"}
                      size="default"
                    >
                      <button
                        onClick={() => toggleCap(c)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        {caps.includes(c) && <Check size={12}/>}
                        {c}
                      </button>
                    </Tag>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 6 }}>
                  Voice is required. Add SMS to allow text messaging on this line.
                </p>
              </section>
            </>
          )}

          {step === 2 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  {CLASS_LABEL[numClass]} numbers · <span className="font-mono">{dial} ({area})</span> · {cityLabel}
                </label>
                <Tag variant="informative" size="sm">${price.monthly}/mo per number</Tag>
              </div>
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Search size={28} style={{ color: "var(--color-icon-neutral-default)", margin: "0 auto 8px", display: "block" }}/>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>No numbers available for this prefix</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>Try a different area code or number class.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {suggestions.map(n => (
                    <button
                      key={n}
                      onClick={() => setPicked(n)}
                      className="text-left"
                      style={{
                        padding: "12px 14px",
                        border: `1px solid ${picked === n ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                        borderRadius: 8,
                        background: picked === n ? "var(--color-surface-primary-more-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Phone size={14} style={{ color: picked === n ? "var(--primary)" : "var(--color-icon-primary-default)" }} />
                      <span className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-title)", flex: 1 }}>{n}</span>
                      {caps.map(c => <Tag key={c} variant={picked === n ? "informative" : "secondary"} size="sm">{c}</Tag>)}
                      {picked === n && <Check size={16} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={11}/> Numbers are provisioned instantly. Cancel any time — you'll be billed pro-rated.
              </p>
            </section>
          )}

          {step === 3 && (
            <>
              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Label <span style={{ fontWeight: 400, color: "var(--color-text-caption)" }}>(optional)</span>
                </label>
                <Input
                  placeholder="e.g. Service Desk, VIP Hotline…"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  size="default"
                />
              </section>

              <section>
                <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Assign to Voice Agent <span style={{ fontWeight: 400, color: "var(--color-text-caption)" }}>(optional)</span>
                </label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setAssignTo(null)}
                    className="text-left"
                    style={{
                      padding: "10px 12px",
                      border: `1px solid ${assignTo === null ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                      borderRadius: 8,
                      background: assignTo === null ? "var(--color-surface-primary-more-subtle)" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--color-surface-neutral-more-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot size={13} style={{ color: "var(--color-icon-neutral-default)" }}/>
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>Unassigned</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>Assign later from the number's config</div>
                    </div>
                    {assignTo === null && <Check size={14} style={{ color: "var(--primary)" }} />}
                  </button>
                  {agents.filter(a => a.status !== "paused").map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAssignTo(a.id)}
                      className="text-left"
                      style={{
                        padding: "10px 12px",
                        border: `1px solid ${assignTo === a.id ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                        borderRadius: 8,
                        background: assignTo === a.id ? "var(--color-surface-primary-more-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--color-surface-informative-more-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--primary)" }}>
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{a.role} · {a.voiceModel}</div>
                      </div>
                      {assignTo === a.id && <Check size={14} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Order summary — replaces the plain informational card with a real receipt */}
              <CardContainer variant="primary" size="default">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} style={{ color: "var(--primary)" }}/>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-title)" }}>Order summary</div>
                </div>
                <div className="flex flex-col gap-2" style={{ fontSize: 12 }}>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Number</span>
                    <span className="font-mono" style={{ color: "var(--color-text-title)", fontWeight: 600 }}>{picked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Class</span>
                    <span style={{ color: "var(--color-text-title)" }}>{CLASS_LABEL[numClass]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Direction</span>
                    <span style={{ color: "var(--color-text-title)" }}>{type === "both" ? "Inbound + Outbound" : type[0].toUpperCase()+type.slice(1)+" only"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Capabilities</span>
                    <span style={{ color: "var(--color-text-title)" }}>{caps.join(" + ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Label</span>
                    <span style={{ color: "var(--color-text-title)" }}>{label || <em style={{ color: "var(--color-text-caption)" }}>None</em>}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-caption)" }}>Assign to</span>
                    <span style={{ color: "var(--color-text-title)" }}>{assignTo ? agents.find(a=>a.id===assignTo)?.name : <em style={{ color: "var(--color-text-caption)" }}>Unassigned</em>}</span>
                  </div>
                  <div style={{ height: 1, background: "var(--color-border-neutral-default)", margin: "4px 0" }}/>
                  <div className="flex justify-between" style={{ fontWeight: 700 }}>
                    <span style={{ color: "var(--color-text-title)" }}>Monthly total</span>
                    <span style={{ color: "var(--primary)" }}>${price.monthly}.00 · USD</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-caption)", textAlign: "right" }}>
                    Billed to your workspace default payment method.
                  </div>
                </div>
              </CardContainer>
            </>
          )}
        </div>
      }
      ctaSecondary={{
        label:   step === 1 ? "Cancel" : "Back",
        onClick: step === 1 ? onClose : () => setStep(step - 1),
      }}
      ctaPrimary={{
        label:    step === 3 ? "Buy Number" : "Continue",
        disabled: !canAdvance,
        onClick:  step === 3 ? confirm : () => setStep(step + 1),
      }}
    />
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Number Config Slide-out — edit a purchased number
// ──────────────────────────────────────────────────────────────────────────────

interface NumberConfigSlideOutProps {
  number:  PhoneNumber | null
  agents:  VoiceAgent[]
  open:    boolean
  onClose: () => void
  onSave:  (num: PhoneNumber) => void
  onRelease: (id: number) => void
}

export function NumberConfigSlideOut({ number, agents, open, onClose, onSave, onRelease }: NumberConfigSlideOutProps) {
  const [draft, setDraft] = useState<PhoneNumber | null>(number)

  useEffect(() => { setDraft(number) }, [number])

  if (!draft) return null

  const toggleCap = (c: Capability) => setDraft({
    ...draft,
    capabilities: draft.capabilities.includes(c)
      ? draft.capabilities.filter(x => x !== c)
      : [...draft.capabilities, c],
  })

  function setAgent(id: string | null) {
    if (!draft) return
    if (id === null) {
      setDraft({ ...draft, agent: null, status: "unassigned" })
    } else {
      const a = agents.find(x => x.id === id)
      if (!a) return
      setDraft({ ...draft, agent: { name: a.name, kind: "agent" }, status: "active" })
    }
  }

  return (
    <SlideOut
      open={open}
      onClose={onClose}
      type="with-variants"
      size="m"
      title={draft.number}
      subtitle={draft.label ?? "No label"}
      iconContent={<Phone size={18}/>}
      showStatus={true}
      statusLabel={draft.status === "active" ? "Active" : "Unassigned"}
      showTabs={false}
      showChips={false}
      showSearchBar={false}
      showCta={true}
      ctaPrimaryLabel="Save changes"
      ctaSecondaryLabel="Cancel"
      onCtaPrimary={() => { onSave(draft); onClose() }}
      onCtaSecondary={onClose}
    >
      <div className="flex flex-col gap-5 px-6 py-4">

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Label
          </label>
          <Input
            placeholder="e.g. Service Desk"
            value={draft.label ?? ""}
            onChange={e => setDraft({ ...draft, label: e.target.value || null })}
            size="default"
          />
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Number type
          </label>
          <Tabs
            items={[
              { id: "both",     label: "In + Out"     },
              { id: "inbound",  label: "Inbound only" },
              { id: "outbound", label: "Outbound only"},
            ]}
            activeId={draft.type ?? "both"}
            onChange={(id) => setDraft({ ...draft, type: id as NumberType })}
            size="s"
          />
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Capabilities
          </label>
          <div className="flex gap-2">
            {(["Voice", "SMS"] as Capability[]).map(c => (
              <Tag
                key={c}
                variant={draft.capabilities.includes(c) ? "informative" : "secondary"}
                size="default"
              >
                <button
                  onClick={() => toggleCap(c)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {draft.capabilities.includes(c) && <Check size={12}/>}
                  {c}
                </button>
              </Tag>
            ))}
          </div>
        </section>

        <section>
          <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)" }}>
            Assigned Voice Agent
          </label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setAgent(null)}
              className="text-left"
              style={{
                padding: "10px 12px",
                border: `1px solid ${draft.agent === null ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                borderRadius: 8,
                background: draft.agent === null ? "var(--color-surface-primary-more-subtle)" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--color-surface-neutral-more-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={13} style={{ color: "var(--color-icon-neutral-default)" }}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", flex: 1 }}>Unassigned</div>
              {draft.agent === null && <Check size={14} style={{ color: "var(--primary)" }} />}
            </button>
            {agents.map(a => (
              <button
                key={a.id}
                onClick={() => setAgent(a.id)}
                className="text-left"
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${draft.agent?.name === a.name ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                  borderRadius: 8,
                  background: draft.agent?.name === a.name ? "var(--color-surface-primary-more-subtle)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--color-surface-informative-more-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--primary)" }}>
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-caption)" }}>{a.role}</div>
                </div>
                {draft.agent?.name === a.name && <Check size={14} style={{ color: "var(--primary)" }} />}
              </button>
            ))}
          </div>
        </section>

        <CardContainer variant="default" size="sm">
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 2 }}>
                Release number
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                Return this number to the provider. This is permanent.
              </div>
            </div>
            <Button variant="warning" size="sm" onClick={() => { onRelease(draft.id); onClose() }}>
              Release
            </Button>
          </div>
        </CardContainer>

      </div>
    </SlideOut>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Assign Number Slide-out — pick from unassigned pool to assign to an agent
// ──────────────────────────────────────────────────────────────────────────────

interface AssignNumberSlideOutProps {
  open:          boolean
  onClose:       () => void
  agentName:     string
  numbers:       PhoneNumber[]         // full list; component filters unassigned
  onAssign:      (numberIds: number[]) => void
}

export function AssignNumberSlideOut({ open, onClose, agentName, numbers, onAssign }: AssignNumberSlideOutProps) {
  const [query,    setQuery]    = useState("")
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) { setSelected(new Set()); setQuery("") }
  }, [open])

  const available = useMemo(() => {
    return numbers
      .filter(n => n.status === "unassigned")
      .filter(n => !query || n.number.toLowerCase().includes(query.toLowerCase()))
  }, [numbers, query])

  const toggle = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      tone="default"
      iconName="Phone"
      title="Assign numbers"
      description={`Pick unassigned numbers to route to ${agentName}`}
      slot={
        <div className="flex flex-col gap-3 min-h-[300px]">
          <Input
            placeholder="Search available numbers…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            leftIcon={<Search size={14}/>}
            size="default"
          />

          {available.length === 0 ? (
            <div className="text-center py-10">
              <Phone size={32} style={{ color: "var(--color-icon-neutral-default)", margin: "0 auto 8px", display: "block" }}/>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>No unassigned numbers</div>
              <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
                Buy a new number from Voice → Numbers first.
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                {available.length} available · {selected.size} selected
              </div>
              <div className="flex flex-col gap-1" style={{ maxHeight: 320, overflowY: "auto" }}>
                {available.map(n => {
                  const isSel = selected.has(n.id)
                  return (
                    <button
                      key={n.id}
                      onClick={() => toggle(n.id)}
                      className="text-left"
                      style={{
                        padding: "10px 12px",
                        border: `1px solid ${isSel ? "var(--primary)" : "var(--color-border-neutral-default)"}`,
                        borderRadius: 8,
                        background: isSel ? "var(--color-surface-primary-more-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={13} style={{ color: isSel ? "var(--primary)" : "var(--color-icon-primary-default)" }}/>
                      <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-title)", flex: 1 }}>{n.number}</span>
                      {n.capabilities.map(c => (
                        <Tag key={c} variant={isSel ? "informative" : "secondary"} size="sm">{c}</Tag>
                      ))}
                      {isSel && <Check size={14} style={{ color: "var(--primary)" }}/>}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      }
      ctaSecondary={{ label: "Cancel", onClick: onClose }}
      ctaPrimary={{
        label:    selected.size === 0 ? "Assign" : `Assign ${selected.size}`,
        disabled: selected.size === 0,
        onClick:  () => { onAssign(Array.from(selected)); onClose() },
      }}
    />
  )
}
