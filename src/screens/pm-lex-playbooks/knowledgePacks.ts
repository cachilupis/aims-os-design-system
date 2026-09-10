// ────────────────────────────────────────────────────────────────────────
// Playbooks — Knowledge Pack catalog.
// Referenced by Playbook.knowledgePackIds in playbooks-data.ts. Kept in its
// own module since the pack catalog is shared across playbooks rather than
// owned by any single one.
// ────────────────────────────────────────────────────────────────────────

export type KnowledgePackStatus = "Active" | "Draft"
export type KnowledgePackUsage  = "High" | "Medium" | "Low"

export interface KnowledgePack {
  id:          string
  name:        string
  status:      KnowledgePackStatus
  stale?:      boolean   // flags a pack whose source facts are known out of date
  factCount:   number
  category:    string
  scope:       string
  usage:       KnowledgePackUsage
  tags:        string[]
  description: string
}

// PKG-006 does not exist in the source catalog — gap kept as-is rather than
// inventing a filler pack.
//
// `description` added in the Configuration-tab prompt (Knowledge section
// card needs one) — additive field, not present when this file was first
// written.
export const KNOWLEDGE_PACKS: KnowledgePack[] = [
  { id: "PKG-001", name: "Enterprise Contract Standards", status: "Active", factCount: 24, category: "Legal",         scope: "Enterprise",         usage: "High",   tags: ["contracts", "SLA", "payments"],           description: "Standard terms, SLAs, and payment clauses for enterprise contracts." },
  { id: "PKG-002", name: "GDPR Compliance Pack",           status: "Active", factCount: 11, category: "Compliance",   scope: "Global",              usage: "High",   tags: ["GDPR", "data-residency", "EU"],           description: "Data residency and processing rules required for EU customer data." },
  { id: "PKG-003", name: "Sales Playbook Facts",           status: "Active", factCount: 18, category: "Sales",        scope: "SMB + Enterprise",    usage: "Medium", tags: ["pricing", "sales", "ICP"],                description: "Pricing tiers, ideal customer profile, and objection-handling facts." },
  { id: "PKG-004", name: "Vendor SLA Registry",            status: "Draft",  factCount: 7,  category: "Procurement",  scope: "Vendor Management",   usage: "Low",    tags: ["vendors", "SLA", "procurement"],          description: "Vendor SLA commitments and escalation paths for procurement decisions." },
  { id: "PKG-005", name: "AI Governance Baseline",         status: "Active", stale: true, factCount: 32, category: "Technology", scope: "All AI Systems", usage: "High", tags: ["AI", "governance", "baseline", "safety"], description: "Baseline safety and governance rules that apply across every AI system." },
  { id: "PKG-007", name: "Partner Onboarding Terms",       status: "Draft",  factCount: 0,  category: "Partnerships", scope: "Channel Partners",    usage: "Low",    tags: ["partners", "onboarding", "eligibility"], description: "Eligibility criteria and onboarding terms for channel partners." },
]
