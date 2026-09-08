// ────────────────────────────────────────────────────────────────────────
// Voice Agent — Knowledge data (Data Access tab).
// 1:1 port of voice-channel-ux.html's KNOWLEDGE_PACKS, DRIVES_DATA and
// UPLOADED_FILES seeds. Kept in its own module so the schema evolves
// independently from the AI-agent core (voice-agents-data.ts).
// ────────────────────────────────────────────────────────────────────────

export type PackPlaneId = "truth" | "sandbox" | "sources"

export interface PackPlane {
  id:    PackPlaneId
  label: string          // "Truth Plane"
  short: string          // "Truth" (chip label)
  color: string          // dot color; safe DS-adjacent hex per source
}

export const PACK_PLANES: PackPlane[] = [
  { id: "truth",   label: "Truth Plane",   short: "Truth",   color: "#93C5FD" }, // audit-ignore: prototype fixture — matches source prototype plane accent
  { id: "sandbox", label: "Sandbox Plane", short: "Sandbox", color: "#C4B5FD" }, // audit-ignore: prototype fixture — matches source prototype plane accent
  { id: "sources", label: "Sources Plane", short: "Sources", color: "#86EFAC" }, // audit-ignore: prototype fixture — matches source prototype plane accent
]

// ── Knowledge Packs ────────────────────────────────────────────────────

export type PackCategory =
  | "Customer Service"
  | "Sales & Revenue"
  | "Legal"
  | "Operations"

export interface KnowledgePack {
  id:        string
  name:      string
  desc:      string
  version:   string
  docs:      number
  sources:   number
  snippets:  number
  updated:   string
  agents:    number
  networks:  number
  cat:       PackCategory
  planes:    PackPlaneId[]         // planes active by default
}

export const KNOWLEDGE_PACKS: KnowledgePack[] = [
  { id: "kp-svc-proc", name: "Service procedures",         desc: "Standard repair and maintenance procedures for common vehicle issues.", version: "v1.4", docs: 47,  sources: 3, snippets: 12, updated: "2 days ago",     agents: 8,  networks: 3, cat: "Customer Service", planes: ["truth", "sources"] },
  { id: "kp-spa-obj",  name: "Spanish objection handling", desc: "Sales and service objection responses in neutral Latin American Spanish.", version: "v2.0", docs: 23,  sources: 1, snippets: 34, updated: "5 days ago",     agents: 4,  networks: 1, cat: "Sales & Revenue",  planes: ["truth", "sandbox"] },
  { id: "kp-vehicle",  name: "Vehicle catalog",            desc: "2024–2026 model specs, trims, and pricing for currently sold vehicles.",  version: "v3.2", docs: 128, sources: 2, snippets: 0,  updated: "1 hour ago",     agents: 12, networks: 5, cat: "Sales & Revenue",  planes: ["truth", "sources"] },
  { id: "kp-sox",      name: "SOX compliance rules",       desc: "Compliance scripts and disclosures required for financial transactions.",  version: "v1.0", docs: 14,  sources: 0, snippets: 8,  updated: "3 weeks ago",    agents: 2,  networks: 1, cat: "Legal",             planes: ["truth"] },
  { id: "kp-warranty", name: "Warranty terms",             desc: "Warranty coverage, exclusions, and claim procedures by manufacturer.",     version: "v1.1", docs: 31,  sources: 1, snippets: 6,  updated: "1 week ago",     agents: 5,  networks: 2, cat: "Legal",             planes: ["truth", "sources"] },
  { id: "kp-faqs",     name: "Customer FAQs",              desc: "Top 200 customer questions with vetted responses and escalation paths.",   version: "v4.7", docs: 89,  sources: 2, snippets: 18, updated: "4 days ago",     agents: 18, networks: 7, cat: "Customer Service", planes: ["truth", "sandbox"] },
  { id: "kp-rouce",    name: "Roadside assistance",        desc: "24/7 roadside protocol, dispatch flow, and partner network details.",     version: "v1.2", docs: 18,  sources: 1, snippets: 4,  updated: "2 weeks ago",    agents: 3,  networks: 1, cat: "Operations",        planes: ["truth", "sources"] },
  { id: "kp-promos",   name: "Active promotions",          desc: "Current incentives, lease deals, and special offers (auto-synced).",       version: "v8.5", docs: 52,  sources: 4, snippets: 11, updated: "15 minutes ago", agents: 9,  networks: 3, cat: "Sales & Revenue",  planes: ["sandbox", "sources"] },
]

// Which packs are already attached to this agent (defaults for Sammy)
export const DEFAULT_ATTACHED_PACK_IDS: string[] = ["kp-svc-proc", "kp-spa-obj", "kp-faqs", "kp-promos"]

// ── Shared Drives ──────────────────────────────────────────────────────

export type DriveCategory =
  | "Governance" | "Product" | "Sales" | "Legal" | "HR" | "Finance"

export interface SharedDrive {
  id:       string
  name:     string
  desc:     string
  cat:      DriveCategory
  docs:     number
  updated:  string
  agents:   number
  networks: number
}

export const SHARED_DRIVES: SharedDrive[] = [
  { id: "drv-svc-policy", name: "Service Policy Drive",  desc: "Standard operating procedures, warranty rules, and shop manuals.",  cat: "Governance", docs: 412,  updated: "1 day ago",     agents: 14, networks: 6 },
  { id: "drv-product",    name: "Vehicle Product Drive", desc: "Model specifications, brochures, MSRP sheets, and feature catalogs.", cat: "Product",   docs: 1240, updated: "3 days ago",    agents: 18, networks: 8 },
  { id: "drv-sales-gtm",  name: "Sales & GTM Playbooks", desc: "Pitch decks, scripts, objection guides, and incentive grids.",       cat: "Sales",     docs: 218,  updated: "2 hours ago",   agents: 11, networks: 5 },
  { id: "drv-legal",      name: "Legal & Disclosures",   desc: "Required disclosures, consent forms, and regulatory templates.",     cat: "Legal",     docs: 64,   updated: "2 weeks ago",   agents: 7,  networks: 3 },
  { id: "drv-hr",         name: "HR Onboarding",         desc: "Employee handbook, benefits, and onboarding documentation.",         cat: "HR",        docs: 38,   updated: "1 month ago",   agents: 2,  networks: 1 },
  { id: "drv-finance",    name: "Finance & F&I",         desc: "Lease grids, F&I product menus, payment calculators.",                cat: "Finance",   docs: 127,  updated: "5 days ago",    agents: 6,  networks: 2 },
]

export const DEFAULT_ATTACHED_DRIVE_IDS: string[] = ["drv-svc-policy", "drv-product"]

// ── Own Documents (uploaded files) ─────────────────────────────────────

export type FileType = "PDF" | "DOCX" | "TXT" | "PNG"

export interface UploadedFile {
  id:       string
  name:     string
  size:     string
  type:     FileType
  uploaded: string
}

export const UPLOADED_FILES: UploadedFile[] = [
  { id: "f1", name: "Service intake script Q2 2026.pdf", size: "124 KB", type: "PDF",  uploaded: "3 days ago"  },
  { id: "f2", name: "Vehicle warranty FAQ.docx",         size: "48 KB",  type: "DOCX", uploaded: "1 week ago"  },
  { id: "f3", name: "Holiday hours notice.txt",          size: "2 KB",   type: "TXT",  uploaded: "2 weeks ago" },
  { id: "f4", name: "Manager escalation flow.png",       size: "312 KB", type: "PNG",  uploaded: "1 month ago" },
]
