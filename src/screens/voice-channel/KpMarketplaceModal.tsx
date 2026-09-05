import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { X, Search, Package, Check, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HighlightIcon } from "@/components/ui/highlight-icon"
import { NativeSelect } from "./configure-shared"
import { SidebarLabel, PillGroup, CheckRow } from "./marketplace-shared"
import {
  KNOWLEDGE_PACKS,
  PACK_PLANES,
  type KnowledgePack,
  type PackCategory,
  type PackPlaneId,
} from "./knowledge-data"

// ─────────────────────────────────────────────────────────────────────
// KpMarketplaceModal — port of the "Knowledge Pack Library" marketplace
// (`.kml-ov`) from voice-channel-ux.html.
//
// Layout is wider than the DS ModalDialog would allow (~1080px) so
// this uses a custom portal + backdrop + dialog rather than DS
// ModalDialog. Every surface still resolves through DS tokens
// (--slide-out-bg, --field-*, --color-surface-* etc.) so dark and
// light mode adapt automatically.
//
// State model matches the source: `pending: Set<string>` holds
// add-then-undo operations, plus "<id>:detach" pseudo-ids for already
// attached packs the user clicked to remove. `Done` commits pending
// as one batch; `Cancel` throws it away.
// ─────────────────────────────────────────────────────────────────────

type ShowFilter = "all" | "new" | "added"
type SortKey    = "name" | "content" | "recent"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name",    label: "Name A → Z"      },
  { value: "content", label: "Most documents"  },
  { value: "recent",  label: "Recently updated" },
]

const ALL_CATEGORIES: PackCategory[] = [
  "Customer Service",
  "Legal",
  "Operations",
  "Sales & Revenue",
]

interface KpMarketplaceModalProps {
  open:          boolean
  onClose:       () => void
  /** Ids currently attached to the agent's Knowledge Data Access. */
  attachedIds:   string[]
  /** Called on Done with the new attachedIds after applying pending. */
  onCommit:      (nextIds: string[]) => void
}

export function KpMarketplaceModal({
  open, onClose, attachedIds, onCommit,
}: KpMarketplaceModalProps) {
  const [show,    setShow]    = useState<ShowFilter>("all")
  const [sort,    setSort]    = useState<SortKey>("name")
  const [search,  setSearch]  = useState("")
  const [cats,    setCats]    = useState<Set<PackCategory>>(new Set())
  const [planes,  setPlanes]  = useState<Set<PackPlaneId>>(new Set())
  const [pending, setPending] = useState<Set<string>>(new Set())

  // Reset every time the modal reopens — no stale filter/pending state
  // carrying over from a previous session.
  useEffect(() => {
    if (open) {
      setShow("all"); setSort("name"); setSearch("")
      setCats(new Set()); setPlanes(new Set())
      setPending(new Set())
    }
  }, [open])

  // Lock body scroll while the modal is open — feels wrong when the
  // page underneath keeps scrolling on wheel.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Escape closes the modal (Cancel semantics — pending discarded).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // ── Filter + sort ───────────────────────────────────────────────
  const filtered = useMemo<KnowledgePack[]>(() => {
    let result = KNOWLEDGE_PACKS.slice()

    if (show === "new")   result = result.filter(p => !attachedIds.includes(p.id) && !pending.has(p.id))
    if (show === "added") result = result.filter(p => attachedIds.includes(p.id) || pending.has(p.id))
    if (cats.size > 0)    result = result.filter(p => cats.has(p.cat))
    if (planes.size > 0)  result = result.filter(p => p.planes.some(pl => planes.has(pl)))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q)
        || p.desc.toLowerCase().includes(q)
        || p.cat.toLowerCase().includes(q)
      )
    }

    if (sort === "name")    result.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === "content") result.sort((a, b) => b.docs - a.docs)
    if (sort === "recent")  result.sort((a, b) => a.updated.localeCompare(b.updated))

    return result
  }, [attachedIds, show, sort, cats, planes, search, pending])

  // Category counts across the full catalog (ignore other filters so
  // the sidebar remains a stable navigation surface).
  const catCounts = useMemo(() => {
    const counts: Record<PackCategory, number> = {
      "Customer Service": 0, "Legal": 0, "Operations": 0, "Sales & Revenue": 0,
    }
    for (const p of KNOWLEDGE_PACKS) counts[p.cat]++
    return counts
  }, [])

  // Row toggle: already attached → queue detach; not attached → queue add.
  const isEffectivelyAttached = (id: string) => {
    if (pending.has(id + ":detach")) return false
    if (pending.has(id))              return true
    return attachedIds.includes(id)
  }
  const toggleAdd = (id: string) => {
    setPending(prev => {
      const next    = new Set(prev)
      const isAttached = attachedIds.includes(id)
      if (isAttached) {
        // Toggle the detach marker.
        if (next.has(id + ":detach")) next.delete(id + ":detach")
        else                          next.add(id + ":detach")
      } else {
        if (next.has(id)) next.delete(id)
        else              next.add(id)
      }
      return next
    })
  }
  const toggleCat = (c: PackCategory) =>
    setCats(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n })
  const togglePlane = (pl: PackPlaneId) =>
    setPlanes(prev => { const n = new Set(prev); n.has(pl) ? n.delete(pl) : n.add(pl); return n })

  const attachedCount = attachedIds.length
  const pendingAdds   = Array.from(pending).filter(id => !id.endsWith(":detach") && !attachedIds.includes(id)).length
  const pendingRemoves = Array.from(pending).filter(id => id.endsWith(":detach")).length

  const commit = () => {
    let next = attachedIds.slice()
    pending.forEach(id => {
      if (id.endsWith(":detach")) {
        const real = id.replace(":detach", "")
        next = next.filter(x => x !== real)
      } else if (!next.includes(id)) {
        next.push(id)
      }
    })
    onCommit(next)
    onClose()
  }

  if (!open) return null

  // ── Render (portaled to body so it sits above SlideOut z-indices) ─
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Knowledge Pack Library"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        zIndex: 10060,
        background: "rgba(0,0,0,.72)", // audit-ignore: modal backdrop scrim — the DS has no dedicated overlay token; matches other portals
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 64px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 1080, maxHeight: "84vh",
          display: "flex", flexDirection: "column",
          background: "var(--surface-floating-default, var(--color-surface-neutral-white))",
          border: "1px solid var(--color-border-neutral-default)",
          borderRadius: "var(--radius-lg, 16px)",
          boxShadow: "var(--shadow-elevation-5, 0 20px 60px rgba(0,0,0,.5))", // audit-ignore: rgba is the CSS var fallback if --shadow-elevation-5 isn't defined
          overflow: "hidden",
        }}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border-neutral-default)",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <HighlightIcon icon={<Package size={20}/>} variant="purple" size="lg" iconColor="dark"/>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-title)" }}>
                Knowledge Pack Library
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-caption)", marginTop: 2 }}>
                Browse and add knowledge packs to this agent
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none",
              color: "var(--color-text-caption)", cursor: "pointer",
              borderRadius: "var(--radius-md)",
            }}
          >
            <X size={20}/>
          </button>
        </div>

        {/* ── Body: side rail + grid ─────────────────────────── */}
        <div className="flex flex-1" style={{ minHeight: 0, overflow: "hidden" }}>

          {/* Left rail — SHOW / SORT / CATEGORIES / PLANES */}
          <div
            style={{
              width: 220, flexShrink: 0,
              padding: 16,
              borderRight: "1px solid var(--color-border-neutral-default)",
              overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <SidebarLabel>Show</SidebarLabel>
            <PillGroup
              options={[
                { value: "all",   label: "All"       },
                { value: "new",   label: "Not added" },
                { value: "added", label: "Added"     },
              ]}
              value={show}
              onChange={(v) => setShow(v as ShowFilter)}
            />

            <SidebarLabel>Sort by</SidebarLabel>
            <NativeSelect
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              size="sm"
            />

            <div style={{ height: 1, background: "var(--color-border-neutral-default)", margin: "4px 0" }}/>

            <SidebarLabel>Categories</SidebarLabel>
            {ALL_CATEGORIES.map(c => (
              <CheckRow
                key={c}
                label={c}
                count={catCounts[c]}
                checked={cats.has(c)}
                onToggle={() => toggleCat(c)}
              />
            ))}

            <div style={{ height: 1, background: "var(--color-border-neutral-default)", margin: "4px 0" }}/>

            <SidebarLabel>Planes</SidebarLabel>
            {PACK_PLANES.map(pl => (
              <CheckRow
                key={pl.id}
                label={pl.label}
                dot={pl.color}
                checked={planes.has(pl.id)}
                onToggle={() => togglePlane(pl.id)}
              />
            ))}
          </div>

          {/* Right pane — search + grid */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

            {/* Search */}
            <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-neutral-default)", flexShrink: 0 }}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packs by name or topic…"
                size="sm"
                leftIcon={<Search size={13}/>}
                aria-label="Search knowledge packs"
              />
            </div>

            {/* Grid */}
            <div
              style={{
                flex: 1, minHeight: 0, overflowY: "auto",
                padding: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                alignContent: "start",
              }}
            >
              {filtered.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  padding: 40,
                  fontSize: 13,
                  color: "var(--color-text-caption)",
                  textAlign: "center",
                  fontStyle: "italic",
                }}>
                  No packs match the current filters.
                </div>
              ) : filtered.map(p => (
                <PackCard
                  key={p.id}
                  pack={p}
                  isAdded={isEffectivelyAttached(p.id)}
                  onToggle={() => toggleAdd(p.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--color-border-neutral-default)",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--color-text-caption)" }}>
            {pendingAdds > 0 || pendingRemoves > 0
              ? <>
                  {pendingAdds > 0 && <><strong style={{ color: "var(--color-text-title)" }}>+{pendingAdds}</strong> to add</>}
                  {pendingAdds > 0 && pendingRemoves > 0 && " · "}
                  {pendingRemoves > 0 && <><strong style={{ color: "var(--color-text-title)" }}>−{pendingRemoves}</strong> to remove</>}
                  {" · "}
                  {attachedCount} currently attached
                </>
              : <>{attachedCount} pack{attachedCount === 1 ? "" : "s"} currently attached</>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="default" onClick={onClose}>Cancel</Button>
            <Button variant="primary"   size="default" onClick={commit}>Done</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Pack card ──────────────────────────────────────────────────────

function PackCard({
  pack, isAdded, onToggle,
}: { pack: KnowledgePack; isAdded: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        padding: 14,
        background: "var(--color-surface-neutral-subtle)",
        border: "1px solid var(--color-border-neutral-default)",
        borderRadius: "var(--radius-md)",
        transition: "border-color 150ms ease",
      }}
    >
      {/* Header — icon + name + category */}
      <div className="flex items-start gap-3">
        <HighlightIcon icon={<Package size={16}/>} variant="purple" size="md" iconColor="dark"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-title)" }}>
            {pack.name}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--color-text-caption)",
            marginTop: 2,
          }}>
            {pack.cat}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: "var(--color-text-caption)", lineHeight: 1.5 }}>
        {pack.desc}
      </div>

      {/* Stats row: docs · version · plane dots */}
      <div className="flex items-center gap-3" style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
        <span>
          <strong style={{ color: "var(--color-text-title)" }}>{pack.docs}</strong> docs
        </span>
        <span>{pack.version}</span>
        <div className="flex items-center gap-1">
          {pack.planes.map(planeId => {
            const def = PACK_PLANES.find(pl => pl.id === planeId)
            return def ? (
              <span
                key={planeId}
                title={def.label}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: def.color,
                }}
              />
            ) : null
          })}
        </div>
      </div>

      {/* Footer — Updated + Add/Added toggle */}
      <div
        className="flex items-center justify-between"
        style={{ paddingTop: 8, borderTop: "1px solid var(--color-border-neutral-default)" }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-caption)" }}>
          Updated {pack.updated}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isAdded}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px",
            fontSize: 12, fontWeight: 600,
            color:      isAdded ? "var(--primary)" : "var(--color-text-title)",
            background: isAdded ? "var(--color-surface-primary-more-subtle)" : "var(--field-bg)",
            border: `1px solid ${isAdded ? "var(--primary)" : "var(--field-border)"}`,
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          {isAdded ? <Check size={12} strokeWidth={2.5}/> : <Plus size={12} strokeWidth={2.5}/>}
          {isAdded ? "Added" : "Add"}
        </button>
      </div>
    </div>
  )
}
