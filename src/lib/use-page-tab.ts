import { useEffect, useState } from "react"

/**
 * Syncs a DS component page's internal tab state (Overview/Playground/Reference,
 * etc.) with the `?tab=` URL query param, so a link like `?page=chip&tab=reference`
 * lands on the correct tab instead of always resetting to the page's default.
 *
 * Pairs with the `?page=`/`?proto=` sync already done once at the App root in
 * App.tsx (the `[active]` effect) — that effect owns `page`/`proto`, this hook
 * owns `tab`. Both read/write the same query string, so neither clobbers the
 * other's param.
 */
export function usePageTab<T extends string>(defaultTab: T, validTabs?: readonly T[]): [T, (t: T) => void] {
  const [tab, setTab] = useState<T>(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab") as T | null
    if (!fromUrl) return defaultTab
    // Guard against a stale ?tab= carried over from a different page whose tab
    // names don't overlap with this one (e.g. navigating Chip:reference → Home).
    if (validTabs && !validTabs.includes(fromUrl)) return defaultTab
    return fromUrl
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", tab)
    // Preserve #hash — see the matching comment in App.tsx's root URL-sync
    // effect for why this can't be omitted even though this effect doesn't
    // touch the hash itself.
    window.history.replaceState(null, "", `?${params.toString()}${window.location.hash}`)
  }, [tab])

  return [tab, setTab]
}

/**
 * Scrolls to `#hash` (if present in the URL and an element with that id exists)
 * once the given tab becomes active. Use for deep-linking to a specific section
 * within a tab (e.g. `?page=chip&tab=reference#tokens`).
 *
 * Call inside the page component, passing the tab that's currently rendered —
 * the hash target usually only exists in the DOM once its owning tab is shown.
 */
export function useScrollToHash(activeTab: string, dependsOnTab?: string) {
  useEffect(() => {
    if (dependsOnTab && activeTab !== dependsOnTab) return
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    // Wait a tick for the tab's content to mount before querying the DOM.
    const id = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
    return () => window.cancelAnimationFrame(id)
  }, [activeTab, dependsOnTab])
}
