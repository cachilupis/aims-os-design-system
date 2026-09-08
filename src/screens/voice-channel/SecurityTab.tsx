import { useState, useMemo } from "react"
import { Info, Plus, X, Shield, Globe, Gauge, Search, Check } from "lucide-react"
import { CardContainer } from "@/components/ui/card-container"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { NativeSelect } from "./configure-shared"
import { useToast } from "./toast"

// ─────────────────────────────────────────────────────────────────────
// SecurityTab — port of the Voice channel's "Security" tab from
// voice-channel-ux.html (source lines 1598-1669).
//
// Three cards in a 2-column grid + a workspace-level info banner:
//   1. Block List       — chips of blocked numbers/patterns + input
//   2. Geo Restrictions — toggle + multi-country picker
//   3. Rate Limiting    — toggle + number/window inputs
//
// State is workspace-wide (channel policies apply to every number)
// so it's held locally rather than threaded through voice-channel.tsx.
// ─────────────────────────────────────────────────────────────────────

const RATE_WINDOWS = ["minute", "hour", "day"] as const
type RateWindow = typeof RATE_WINDOWS[number]

const COUNTRY_CATALOG = [
  { code: "US", label: "🇺🇸 United States (+1)" },
  { code: "CA", label: "🇨🇦 Canada (+1)"        },
  { code: "MX", label: "🇲🇽 Mexico (+52)"       },
  { code: "GB", label: "🇬🇧 United Kingdom (+44)" },
  { code: "IE", label: "🇮🇪 Ireland (+353)"    },
  { code: "DE", label: "🇩🇪 Germany (+49)"     },
  { code: "FR", label: "🇫🇷 France (+33)"      },
  { code: "ES", label: "🇪🇸 Spain (+34)"       },
  { code: "IT", label: "🇮🇹 Italy (+39)"       },
  { code: "PT", label: "🇵🇹 Portugal (+351)"   },
  { code: "CO", label: "🇨🇴 Colombia (+57)"    },
  { code: "AR", label: "🇦🇷 Argentina (+54)"   },
  { code: "BR", label: "🇧🇷 Brazil (+55)"      },
  { code: "CL", label: "🇨🇱 Chile (+56)"       },
  { code: "AU", label: "🇦🇺 Australia (+61)"   },
  { code: "NZ", label: "🇳🇿 New Zealand (+64)" },
  { code: "JP", label: "🇯🇵 Japan (+81)"       },
]

export function SecurityTab() {
  const toast = useToast()

  const [blocklist,    setBlocklist]    = useState<string[]>(["+1-800-*", "Unknown / No ID"])
  const [blockInput,   setBlockInput]   = useState("")

  const [geoOn,        setGeoOn]        = useState(false)
  const [permitted,    setPermitted]    = useState<string[]>(["US"])

  const [rateOn,       setRateOn]       = useState(false)
  const [rateCount,    setRateCount]    = useState(100)
  const [rateWindow,   setRateWindow]   = useState<RateWindow>("minute")

  function addBlockEntry() {
    const v = blockInput.trim()
    if (!v || blocklist.includes(v)) return
    setBlocklist(prev => [...prev, v])
    setBlockInput("")
    toast.info(`Added ${v} to block list`)
  }
  function removeBlockEntry(v: string) {
    setBlocklist(prev => prev.filter(x => x !== v))
  }

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 960 }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-title)", marginBottom: 4 }}>
          Security
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-caption)" }}>
          Channel-wide policies that apply to all phone numbers assigned to the Voice channel.
        </div>
      </div>

      {/* Workspace-level info banner */}
      <div
        className="flex items-start gap-3"
        style={{
          padding: "12px 16px",
          background: "var(--color-surface-primary-more-subtle)",
          border: "1px solid var(--color-border-neutral-default)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <Info size={15} style={{ color: "var(--color-icon-primary-default)", flexShrink: 0, marginTop: 2 }}/>
        <div style={{ flex: 1, fontSize: 13, color: "var(--color-text-subtitle)", lineHeight: 1.5 }}>
          Bot &amp; spam detection is configured tenant-wide and applies to all channels.
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast.info("Workspace Settings → Security")}>
          View workspace policy →
        </Button>
      </div>

      {/* 2-column grid of policy cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Block List */}
        <CardContainer variant="default" size="default">
          <div className="flex items-start gap-3 mb-3">
            <HighlightIcon icon={<Shield size={16}/>} variant="alert" size="md" iconColor="dark"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)", marginBottom: 4 }}>
                Block List
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
                Numbers or patterns that are blocked for all inbound and outbound calls across this channel.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {blocklist.length === 0 ? (
              <span style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>
                No blocked numbers.
              </span>
            ) : blocklist.map(entry => (
              <span
                key={entry}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  fontSize: 12,
                  color: "var(--color-text-caption)",
                  background: "var(--color-surface-neutral-default)",
                  border: "1px solid var(--color-border-neutral-default)",
                  borderRadius: "999px",
                }}
              >
                <span className="font-mono">{entry}</span>
                <button
                  type="button"
                  onClick={() => removeBlockEntry(entry)}
                  aria-label={`Remove ${entry} from block list`}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    color: "inherit", opacity: 0.6, display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={12}/>
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <div style={{ flex: 1 }}>
              <Input
                value={blockInput}
                onChange={(e) => setBlockInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addBlockEntry() }}
                placeholder="e.g. +18005551234 or +1800*"
                size="sm"
                aria-label="Add number or pattern to block list"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={addBlockEntry} icon={<Plus size={12}/>}>
              Add
            </Button>
          </div>

          <p style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 8 }}>
            Accepts full numbers or prefix patterns using <span className="font-mono">*</span>. E.g.{" "}
            <span className="font-mono">+1800*</span> blocks all 1-800 numbers.
          </p>
        </CardContainer>

        {/* Geo Restrictions */}
        <CardContainer variant="default" size="default">
          <div className="flex items-start gap-3">
            <HighlightIcon icon={<Globe size={16}/>} variant="informative" size="md" iconColor="dark"/>
            <div style={{ flex: 1 }}>
              <div className="flex items-center justify-between mb-1">
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Geo Restrictions
                </div>
                <Toggle checked={geoOn} onChange={setGeoOn} size="sm"/>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
                Restrict calls to permitted countries only. All others are blocked.
              </div>

              {geoOn ? (
                <>
                  <CountryPicker value={permitted} onChange={setPermitted}/>
                  <p style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 8 }}>
                    Only calls from selected countries are permitted.
                  </p>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>
                  All countries permitted when disabled.
                </div>
              )}
            </div>
          </div>
        </CardContainer>

        {/* Rate Limiting */}
        <CardContainer variant="default" size="default">
          <div className="flex items-start gap-3">
            <HighlightIcon icon={<Gauge size={16}/>} variant="success" size="md" iconColor="dark"/>
            <div style={{ flex: 1 }}>
              <div className="flex items-center justify-between mb-1">
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-title)" }}>
                  Rate Limiting
                </div>
                <Toggle checked={rateOn} onChange={setRateOn} size="sm"/>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginBottom: 12 }}>
                Reject calls that exceed a maximum volume threshold per time window.
              </div>

              {rateOn ? (
                <>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 100 }}>
                      <Input
                        type="number"
                        value={String(rateCount)}
                        onChange={(e) => setRateCount(parseInt(e.target.value || "0", 10))}
                        min={1}
                        size="sm"
                        aria-label="Calls threshold"
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-text-caption)" }}>calls per</span>
                    <div style={{ width: 120 }}>
                      <NativeSelect
                        value={rateWindow}
                        onChange={(v) => setRateWindow(v as RateWindow)}
                        options={RATE_WINDOWS.map(w => ({ value: w, label: w }))}
                        size="sm"
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 8 }}>
                    Calls exceeding the limit are silently rejected.
                  </p>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--color-text-caption)", fontStyle: "italic" }}>
                  No rate limit applied when disabled.
                </div>
              )}
            </div>
          </div>
        </CardContainer>

      </div>
    </div>
  )
}

// ─── Country multi-select (chip pattern) ─────────────────────────────

function CountryPicker({
  value, onChange,
}: { value: string[]; onChange: (v: string[]) => void }) {
  const [search, setSearch] = useState("")
  const [open,   setOpen]   = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return COUNTRY_CATALOG.filter(c => !q || c.label.toLowerCase().includes(q))
  }, [search])

  const toggle = (code: string) =>
    onChange(value.includes(code) ? value.filter(x => x !== code) : [...value, code])

  return (
    <div style={{ position: "relative" }}>
      {/* Control — chips + caret. Clicking it toggles the panel. */}
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          minHeight: 32,
          padding: "4px 32px 4px 8px",
          background: "var(--field-bg)",
          border: "0.5px solid var(--field-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontSize: 12,
          position: "relative",
        }}
      >
        {value.length === 0 && (
          <span style={{ color: "var(--color-text-caption)" }}>Select countries…</span>
        )}
        {value.map(code => {
          const country = COUNTRY_CATALOG.find(c => c.code === code)
          if (!country) return null
          return (
            <span
              key={code}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                fontSize: 11,
                color: "var(--color-text-title)",
                background: "var(--color-surface-neutral-default)",
                border: "1px solid var(--color-border-neutral-default)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {country.label.split(" (")[0]}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(code) }}
                aria-label={`Remove ${country.label}`}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", opacity: 0.6 }}
              >
                <X size={10}/>
              </button>
            </span>
          )
        })}
      </div>

      {/* Panel */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0, right: 0,
            zIndex: 20,
            background: "var(--surface-floating-default, var(--color-surface-neutral-white))",
            border: "1px solid var(--color-border-neutral-default)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-elevation-3)",
            maxHeight: 240,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: 8,
              borderBottom: "1px solid var(--color-border-neutral-default)",
            }}
          >
            <Search size={12} style={{ color: "var(--color-text-caption)", flexShrink: 0 }}/>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search country…"
              aria-label="Search country"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 12,
                color: "var(--color-text-title)",
              }}
            />
          </div>
          <div style={{ overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 12, fontSize: 12, color: "var(--color-text-caption)", textAlign: "center" }}>
                No countries match "{search}".
              </div>
            ) : filtered.map(country => {
              const isSelected = value.includes(country.code)
              return (
                <div
                  key={country.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => { e.stopPropagation(); toggle(country.code) }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                    color: "var(--color-text-title)",
                    background: isSelected ? "var(--color-surface-primary-more-subtle)" : "transparent",
                  }}
                >
                  <span>{country.label}</span>
                  {isSelected && (
                    <Check size={12} strokeWidth={2.5} style={{ color: "var(--primary)" }}/>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
