// ────────────────────────────────────────────────────────────────────────
// Single source of truth for the Configuration tab's section list — used by
// PlaybookDetail's Sections nav (Prompts 5–10) and CreatePlaybookPage's
// "What You'll Define" popover (Prompt 11), so the wizard's step list can
// never drift out of sync with the sections it actually steps through.
// ────────────────────────────────────────────────────────────────────────

export type ConfigSectionId =
  | "basics" | "knowledge" | "moment" | "hard-gates"
  | "objective-success" | "phases-actions" | "trust-controls"

export const CONFIG_SECTIONS: { id: ConfigSectionId; label: string; icon: string }[] = [
  { id: "basics",            label: "Basics",             icon: "FileText" },
  { id: "knowledge",         label: "Knowledge",          icon: "BookOpen" },
  { id: "moment",            label: "Moment",             icon: "Radio" },
  { id: "hard-gates",        label: "Hard Gates",         icon: "ShieldCheck" },
  { id: "objective-success", label: "Objective & Success", icon: "Target" },
  { id: "phases-actions",    label: "Phases & Actions",   icon: "ListOrdered" },
  { id: "trust-controls",    label: "Trust Controls",     icon: "Zap" },
]

export const CONFIG_SECTION_LABELS: string[] = CONFIG_SECTIONS.map(s => s.label)
