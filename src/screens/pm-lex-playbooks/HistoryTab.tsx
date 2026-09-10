// ────────────────────────────────────────────────────────────────────────
// Detail shell → History tab.
//
// Every category chip and every feed entry comes straight from
// playbook.history — HistoryCategory ("Published"|"Configuration"|
// "Trust & NBA"|"Gates"|"Phases") already IS the fixed category set, so the
// chips are generated from it, not a separately maintained list.
//
// Two things the data doesn't carry, both noted rather than silently
// invented:
//  - No per-entry author — every entry is shown as the playbook's owner
//    (same stand-in used in VersionsTab).
//  - No time-of-day, only a date string — "exact time" on the right reuses
//    the same date in a longer format; there's no clock time to show.
// ────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { AvatarCircle } from "@/components/ui/avatar"
import type { Playbook, HistoryCategory } from "./playbooks-data"

const SUB = "var(--field-supporting)"
const TXT = "var(--foreground)"

const CATEGORIES: HistoryCategory[] = ["Published", "Configuration", "Trust & NBA", "Gates", "Phases"]

function parseValueChange(description: string): { from: string; to: string } | null {
  const m = description.match(/from\s+(.+?)\s+to\s+(.+?)(?:\)|$)/i)
  if (!m) return null
  return { from: m[1], to: m[2] }
}

function formatLongDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatSectionHeader(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return "TODAY"
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
}

function formatRelative(dateStr: string, todayStr: string): string {
  const days = Math.round((new Date(`${todayStr}T00:00:00`).getTime() - new Date(`${dateStr}T00:00:00`).getTime()) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  const months = Math.round(days / 30)
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`
  const years = Math.round(months / 12)
  return years === 1 ? "1 year ago" : `${years} years ago`
}

export function HistoryTab({ playbook }: { playbook: Playbook }) {
  const [filter, setFilter] = useState<"All" | HistoryCategory>("All")

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: playbook.history.length }
    for (const cat of CATEGORIES) c[cat] = playbook.history.filter(h => h.category === cat).length
    return c
  }, [playbook.history])

  const todayStr = useMemo(
    () => playbook.history.reduce((max, h) => h.date > max ? h.date : max, playbook.history[0]?.date ?? ""),
    [playbook.history]
  )

  const visible = filter === "All" ? playbook.history : playbook.history.filter(h => h.category === filter)
  const newestFirst = [...visible].sort((a, b) => b.date.localeCompare(a.date))

  const groups = useMemo(() => {
    const byDate = new Map<string, typeof newestFirst>()
    for (const entry of newestFirst) {
      const list = byDate.get(entry.date) ?? []
      list.push(entry)
      byDate.set(entry.date, list)
    }
    return Array.from(byDate.entries())
  }, [newestFirst])

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-wrap gap-[8px]">
        <Chip variant={filter === "All" ? "primary" : "secondary"} size="m" onClick={() => setFilter("All")}>
          All {counts.All}
        </Chip>
        {CATEGORIES.map(cat => (
          <Chip key={cat} variant={filter === cat ? "primary" : "secondary"} size="m" onClick={() => setFilter(cat)}>
            {cat} {counts[cat]}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-[20px]">
        {groups.map(([date, entries]) => (
          <div key={date}>
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB, letterSpacing: "0.06em", marginBottom: 10 }}>
              {formatSectionHeader(date, todayStr)}
            </div>
            <div className="flex flex-col gap-[14px]">
              {entries.map((entry, i) => {
                const change = parseValueChange(entry.description)
                return (
                  <div key={i} className="flex items-start justify-between gap-[12px]">
                    <div className="flex items-start gap-[8px] min-w-0">
                      <AvatarCircle name={playbook.owner.name} sizeKey="xs" />
                      <div className="min-w-0">
                        <div style={{ fontSize: 12, color: SUB }}>
                          <span style={{ fontWeight: 600, color: TXT }}>{playbook.owner.name}</span> {entry.description}
                        </div>
                        {change && (
                          <div className="flex items-center gap-[6px]" style={{ marginTop: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "var(--tag-error-bg)", color: "var(--tag-error-fg)" }}>{change.from}</span>
                            <ArrowRight size={11} style={{ color: SUB }} />
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "var(--tag-success-bg)", color: "var(--tag-success-fg)" }}>{change.to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: TXT }}>{formatRelative(date, todayStr)}</div>
                      <div style={{ fontSize: 11, color: SUB }}>{formatLongDate(date)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
