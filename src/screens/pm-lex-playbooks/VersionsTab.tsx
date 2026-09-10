// ────────────────────────────────────────────────────────────────────────
// Detail shell → Versions tab.
//
// playbooks-data.ts's VersionEntry ({version, date, note}) has no per-entry
// author — every version in the timeline is shown as authored by the
// playbook's owner, the closest real stand-in the data model has, rather
// than inventing a name with no source.
// ────────────────────────────────────────────────────────────────────────

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import { AvatarCircle } from "@/components/ui/avatar"
import { ModalDialog } from "@/components/ui/modal-dialog"
import type { Playbook, VersionEntry } from "./playbooks-data"

const SUB = "var(--field-supporting)"
const TXT = "var(--foreground)"

export function VersionsTab({ playbook }: { playbook: Playbook }) {
  const [restoreTarget, setRestoreTarget] = useState<VersionEntry | null>(null)
  const newestFirst = [...playbook.versions].reverse()

  // TODO(future prompt): actually swap the active configuration to this
  // version's snapshot. The data model doesn't carry a per-version config
  // snapshot yet (only {version, date, note}) — stub for now, same pattern
  // as Archive in Prompt 3.
  function confirmRestore() {
    setRestoreTarget(null)
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TXT }}>Version History</div>
          <div style={{ fontSize: 12, color: SUB, marginTop: 2 }}>
            {playbook.versions.length} saved versions · current is {playbook.version}
          </div>
        </div>
        <Tag variant="neutral" size="sm">Auto-saved on publish</Tag>
      </div>

      <div className="flex flex-col">
        {newestFirst.map((v, i) => {
          const isCurrent = v.version === playbook.version
          const isLast = i === newestFirst.length - 1
          return (
            <div key={v.version} className="flex gap-[12px]">
              {/* ── Timeline rail ── */}
              <div className="flex flex-col items-center" style={{ width: 12, flexShrink: 0 }}>
                <div
                  style={{
                    width: 10, height: 10, borderRadius: "50%", marginTop: 4,
                    background: isCurrent ? "var(--primary)" : "var(--field-border)",
                    border: isCurrent ? "none" : "1px solid var(--field-supporting)",
                  }}
                />
                {!isLast && <div style={{ flex: 1, width: 1, background: "var(--field-border)", marginTop: 4 }} />}
              </div>

              {/* ── Entry ── */}
              <div style={{ paddingBottom: 20, flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-[8px]">
                  <span style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{v.version}</span>
                  {isCurrent && <Tag variant="success" size="sm">Current</Tag>}
                </div>
                <div className="flex items-center gap-[6px]" style={{ marginTop: 4 }}>
                  <AvatarCircle name={playbook.owner.name} sizeKey="xs" />
                  <span style={{ fontSize: 12, color: SUB }}>{playbook.owner.name} · {v.date}</span>
                </div>
                <p style={{ fontSize: 13, color: TXT, margin: "6px 0 0", lineHeight: 1.5 }}>{v.note}</p>
                {!isCurrent && (
                  <Button variant="secondary" size="sm" icon={<RotateCcw size={13} />} onClick={() => setRestoreTarget(v)} style={{ marginTop: 8 }}>
                    Restore
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ModalDialog
        isOpen={restoreTarget !== null}
        onClose={() => setRestoreTarget(null)}
        variant="confirmation"
        tone="warning"
        iconName="RotateCcw"
        title={restoreTarget ? `Restore ${restoreTarget.version}?` : "Restore version?"}
        description="Restoring creates a new draft revision from this version — it does not delete or overwrite your current work."
        ctaPrimary={{ label: "Restore version", onClick: confirmRestore }}
        ctaSecondary={{ label: "Cancel" }}
      />
    </div>
  )
}
