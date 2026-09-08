import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
import { AVAILABLE_EMAIL_ADDRESSES, type EmailAddress } from "./voice-agents-data"

// ─────────────────────────────────────────────────────────────────────
// AddEmailAddressModal — sibling of AddPhoneNumberModal for the Email
// channel. Same shape, but rows are AVAILABLE_EMAIL_ADDRESSES entries.
//
// The set of workspace email addresses is small (2 in the seed), so
// the picker is effectively a two-row check-list. Kept the modal
// shape identical to the phone-number picker so consumers (and the
// user) don't have to learn two flows.
// ─────────────────────────────────────────────────────────────────────

interface AddEmailAddressModalProps {
  open:        boolean
  onClose:     () => void
  /** Address ids already on this channel — excluded from the list. */
  assignedIds: string[]
  /** Called with the ids the user picked when they hit Add. */
  onAdd:       (addressIds: string[]) => void
}

export function AddEmailAddressModal({
  open, onClose, assignedIds, onAdd,
}: AddEmailAddressModalProps) {
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) { setSearch(""); setSelected(new Set()) }
  }, [open])

  const available = useMemo<EmailAddress[]>(() => {
    const q = search.trim().toLowerCase()
    return AVAILABLE_EMAIL_ADDRESSES
      .filter(a => !assignedIds.includes(a.id))
      .filter(a => !q
        || a.email.toLowerCase().includes(q)
        || a.label.toLowerCase().includes(q)
      )
  }, [assignedIds, search])

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

  const count    = selected.size
  const ctaLabel = count === 0
    ? "Add selected"
    : `Add ${count} address${count === 1 ? "" : "es"}`

  return (
    <ModalDialog
      isOpen={open}
      onClose={onClose}
      variant="content"
      title="Add email address"
      description="Select an email address from your workspace to add to this configuration."
      showIcon={false}
      slotUnstyled={true}
      slot={
        <div className="flex flex-col gap-3" style={{ minWidth: 420 }}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search addresses or labels…"
            aria-label="Search email addresses"
            size="sm"
            leftIcon={<Search size={13}/>}
          />

          <div
            style={{
              display: "flex", flexDirection: "column", gap: 6,
              maxHeight: 260, overflowY: "auto", padding: 2,
            }}
          >
            {available.length === 0 ? (
              <div style={{
                padding: 24, fontSize: 13,
                color: "var(--color-text-caption)",
                textAlign: "center", fontStyle: "italic",
              }}>
                {search
                  ? `No available addresses match "${search}".`
                  : "Every workspace address is already assigned to this channel."}
              </div>
            ) : (
              available.map(a => {
                const isSelected = selected.has(a.id)
                return (
                  <label
                    key={a.id}
                    onClick={() => toggle(a.id)}
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
                      onChange={() => toggle(a.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 16, height: 16,
                        accentColor: "var(--primary)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      aria-label={`Select ${a.email}`}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--color-text-title)",
                      }}>
                        {a.email}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-caption)", marginTop: 2 }}>
                        {a.label}
                      </div>
                    </div>
                    <Tag variant="success" size="sm">Available</Tag>
                  </label>
                )
              })
            )}
          </div>
        </div>
      }
      ctaSecondary={{ label: "Cancel",  onClick: onClose }}
      ctaPrimary={{   label: ctaLabel,  onClick: confirm, disabled: count === 0 }}
    />
  )
}
