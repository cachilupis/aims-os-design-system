/**
 * Widgets saved by the Widget Builder, so the Widget Library can show them.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The two screens are separate prototype pages and the builder leaves with a
 * full page load, so no React state survives the trip. Without something
 * carrying the widget across, saving said "it is in the catalog" and the
 * catalog had never heard of it — the one seam in the flow you could see from
 * the outside.
 *
 * `sessionStorage`, not `localStorage`, on purpose: it survives the navigation
 * and dies with the tab, so tomorrow's demo never opens on yesterday's
 * leftovers. Nothing here is a persistence design — it is the smallest thing
 * that closes the loop for a prototype, and the day these screens share a real
 * store it should be deleted rather than migrated.
 */

const KEY = "aims.widget-builder.saved"

export type SavedWidget = {
  id: string
  name: string
  /** Where the data comes from — the entity or dataset the builder chose. */
  source: string
  /** The widget type's human label, or null when it never picked one. */
  skeleton: string | null
  /** The builder's own type id, so the library previews exactly what was built. */
  previewTypeId?: string
  status: "published" | "draft"
  /** Only on a draft: what it still needs, in the builder's own words. */
  missing?: string
}

function read(): SavedWidget[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedWidget[]) : []
  } catch {
    // A private window, a blocked store, a half-written value — none of them
    // are worth breaking a screen over. An empty library is the honest answer.
    return []
  }
}

/** Newest first, which is where the library puts them. */
export function savedWidgets(): SavedWidget[] {
  return read()
}

export function saveWidget(w: Omit<SavedWidget, "id">): SavedWidget {
  const entry: SavedWidget = { ...w, id: `saved-${Date.now()}` }
  try {
    sessionStorage.setItem(KEY, JSON.stringify([entry, ...read()]))
  } catch {
    // Same reasoning: the save is a prototype nicety, not the point of the flow.
  }
  return entry
}
