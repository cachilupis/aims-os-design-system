import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
import type { PhoneNumberRecord } from "./data"

// ─────────────────────────────────────────────────────────────────────
// AddPhoneNumberModal — port of `modal-add-number-voice` from
// voice-channel-ux.html (source lines 2643-2679).
//
// Opens from the Configure Voice slide-out's "Add Number" button.
// Shows every workspace number that is NOT already assigned to this
// agent's Voice channel, with checkboxes; the primary CTA appends
// the selected ids to the channel's numberIds.
// ─────────────────────────────────────────────────────────────────────

interface AddPhoneNumberModalProps {
  open:          boolean
  onClose:       () => void
  /** Every workspace number. */
  numbers:       PhoneNumberRecord[]
  /** Numbers already on this channel — excluded from the list. */
  assignedIds:   string[]
  /** Called with the ids the user picked when they hit Add. */
  onAdd:         (numberIds: string[]) => void
}

export function AddPhoneNumberModal({
  open, onClose, numbers, assignedIds, onAdd,
}: AddPhoneNumberModalProps) {
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Reset every time the modal reopens — no stale checks.
  useEffect(() => {
    if (open) { setSearch(""); setSelected(new Set()) }
  }, [open])

  // Numbers available to add = every workspace number NOT already assigned
  // to this channel. Search matches phone number OR label.
  const available = useMemo(() => {
    const q = search.trim().toLowerCase()
    return numbers
      .filter(n => !assignedIds.includes(n.id))
      .filter(n => !q
        || n.number.toLowerCase().includes(q)
        || (n.label && n.label.toLowerCase().includes(q))
      )
  }, [numbers, assignedIds, search])

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const confirm = () => {
    if (selected.size === 0) return
    onAdd(Array.from(selected))
    onClose()
  }

  const count      = selected.size
  const ctaLabel   = count === 0
    ? "Add selected"
    : `Add ${count} number${count === 1 ? "" : "s"}`

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      title="Add phone number"
      description="Select a number from your workspace to add to this configuration."
      showIcon={false}
      slotUnstyled={true}
      slot={
        <div className="flex flex-col gap-3" style={{ minWidth: 420 }}>
          {/* Search */}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search numbers or labels…"
            aria-label="Search numbers or labels"
            size="sm"
            leftIcon={<Search size={13}/>}
          />

          {/* List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 260,
              overflowY: "auto",
              padding: 2,
            }}
          >
            {available.length === 0 ? (
              <div style={{
                padding: 24,
                fontSize: 13,
                color: "var(--color-text-caption)",
                textAlign: "center",
                fontStyle: "italic",
              }}>
                {search
                  ? `No available numbers match "${search}".`
                  : "Every workspace number is already assigned to this channel."}
              </div>
            ) : (
              available.map(n => {
                const isSelected = selected.has(n.id)
                return (
                  <label
                    key={n.id}
                    onClick={() => toggle(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: isSelected ? "var(--color-surface-primary-more-subtle)" : "var(--field-bg)",
                      border: `1px solid ${isSelected ? "var(--primary)" : "var(--field-border)"}`,
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "all 120ms ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(n.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 16, height: 16,
                        accentColor: "var(--primary)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      aria-label={`Select ${n.number}`}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 13, fontWeight: 700,
                          color: "var(--color-text-title)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.number}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>
                        {n.label || "No label"} · {n.type}
                        {n.status === "suspended" && " · Suspended"}
                      </div>
                    </div>
                    <Tag variant={n.status === "active" ? "success" : "alert"} size="sm">
                      {n.status === "active" ? "Available" : "Suspended"}
                    </Tag>
                  </label>
                )
              })
            )}
          </div>
        </div>
      }
      ctaSecondary={{ label: "Cancel",   onClick: onClose }}
      ctaPrimary={{   label: ctaLabel,   onClick: confirm, disabled: count === 0 }}
    />
  )
}
