// ────────────────────────────────────────────────────────────────────────
// Voice module — shared types + mock data.
// Ported from the AIMS-OS HTML prototype (voice-channel-ux.html).
// ────────────────────────────────────────────────────────────────────────

export type NumberType = "inbound" | "outbound" | "both" | null
export type NumberStatus = "active" | "unassigned"
export type Capability = "Voice" | "SMS"

export interface AssignedAgent {
  name: string
  kind: "agent" | "network"
  extra?: number
  extraNames?: string[]
}

export interface PhoneNumber {
  id:           number
  number:       string          // "+1 (305) 200-1234"
  label:        string | null
  type:         NumberType
  status:       NumberStatus
  agent:        AssignedAgent | null
  capabilities: Capability[]
  calls:        number
}

export interface VoiceAgent {
  id:            string
  name:          string
  role:          string          // "Service Desk", "Sales BDC", …
  status:        "active" | "draft" | "paused"
  numbers:       string[]        // phone strings assigned
  callsToday:    number
  calls30d:      number          // rolling 30-day total
  successRate:   number          // 0..1 completion rate
  avgDuration:   string          // "3:42"
  voiceModel:    string          // "Rachel (ElevenLabs)"
  recording:     boolean
  scriptName:    string | null
  language:      string          // "English (US)", "Spanish (LATAM)"
  description:   string          // short one-liner (from the agent's prompt summary)
}

// ── Mock: 60 phone numbers ──────────────────────────────────────────────

const LABELS = [
  "Service Desk", "Sales BDC", "Overnight BDC", "Appt Reminders", "Spanish Line",
  "VIP Hotline", "Survey Outbound", "Tech Support L1", "Tech Support L2", "Renewals",
  "Win-back", "New Customer", "Service Center", "Lead Routing", "Demo Bookings",
  "Loyalty", "Collections", "Fleet Hotline", "Parts Desk", "Warranty Claims",
  "Roadside Assist", "Trade-in Desk", "Finance Desk", "Insurance Desk", "Body Shop",
  "Service Loaners", "Recall Outreach", "Owner Marketing", "Spanish Service", "French Service",
  "Reception", "Concierge", "24/7 Hotline", "Manager Direct", "Switchboard",
  "Backup Line", "Test Drive Line", "Internet Sales", "Phone Sales", "Lease Returns",
  "Used Car Desk", "Express Service", "Detail Pickup", "Parts Direct", "RV Service",
  "Marine Desk", "Pre-Owned", "Special Ops", "Outbound BDC", "Recall BDC",
]

const AGENTS_POOL: AssignedAgent[] = [
  { name: "Sammy",         kind: "agent",   extra: 4, extraNames: ["Alex", "Notify Bot", "Support AI", "Intake Bot"] },
  { name: "Alex",          kind: "agent" },
  { name: "BDC Network",   kind: "network" },
  { name: "Notify Bot",    kind: "agent" },
  { name: "Support AI",    kind: "agent",   extra: 2, extraNames: ["Sammy", "Notify Bot"] },
  { name: "Sales Squad",   kind: "network" },
  { name: "Intake Bot",    kind: "agent" },
  { name: "Service Net",   kind: "network" },
  { name: "Concierge AI",  kind: "agent" },
  { name: "Renewals AI",   kind: "agent" },
  { name: "Reactivation",  kind: "network" },
  { name: "Onboarding",    kind: "agent" },
]

const AREA_CODES = ["305", "786", "954", "407", "321", "561", "754", "239", "863", "727", "813", "850", "352", "386", "727"]
const TYPES: NumberType[] = ["both", "inbound", "outbound"]

export const NUMBERS: PhoneNumber[] = Array.from({ length: 60 }, (_, n) => {
  const ac         = AREA_CODES[n % AREA_CODES.length]
  const mid        = String(200 + (n * 37) % 800).padStart(3, "0")
  const last       = String((n * 7919 + 1234) % 10000).padStart(4, "0")
  const number     = `+1 (${ac}) ${mid}-${last}`
  const unassigned = (n % 11 === 9) || (n % 13 === 12)
  const type       = unassigned ? null : TYPES[n % 3]
  const label      = unassigned ? null : LABELS[n % LABELS.length]
  const agent      = unassigned ? null : AGENTS_POOL[n % AGENTS_POOL.length]
  const calls      = unassigned ? 0 : Math.floor(20 + (n * 1117) % 380)
  const caps: Capability[] =
    (n % 5 === 0 && !unassigned) || n % 7 === 0
      ? ["Voice", "SMS"]
      : ["Voice"]
  return {
    id:           n + 1,
    number,
    label,
    type,
    status:       unassigned ? "unassigned" : "active",
    agent,
    capabilities: caps,
    calls,
  }
})

// ── Mock: Voice Agents (subset of the agent pool with voice config) ─────

export const VOICE_AGENTS: VoiceAgent[] = [
  {
    id:          "sammy",
    name:        "Sammy",
    role:        "Service Desk",
    status:      "active",
    numbers:     ["+1 (305) 892-4710", "+1 (786) 558-1102"],
    callsToday:  143,
    calls30d:    3218,
    successRate: 0.94,
    avgDuration: "4:12",
    voiceModel:  "Rachel (ElevenLabs)",
    recording:   true,
    scriptName:  "Service Intake v3",
    language:    "English (US)",
    description: "Handles inbound service tickets, verifies vehicle info, books appointments.",
  },
  {
    id:          "alex",
    name:        "Alex",
    role:        "Sales BDC",
    status:      "active",
    numbers:     ["+1 (954) 274-7072"],
    callsToday:  87,
    calls30d:    2104,
    successRate: 0.71,
    avgDuration: "5:38",
    voiceModel:  "Adam (ElevenLabs)",
    recording:   true,
    scriptName:  "Outbound Discovery",
    language:    "English (US)",
    description: "Calls fresh leads, qualifies interest, books test drives.",
  },
  {
    id:          "concierge",
    name:        "Concierge AI",
    role:        "VIP Hotline",
    status:     "active",
    numbers:     ["+1 (561) 385-0829"],
    callsToday:  62,
    calls30d:    1462,
    successRate: 0.98,
    avgDuration: "6:22",
    voiceModel:  "Charlotte (ElevenLabs)",
    recording:   true,
    scriptName:  "VIP Welcome",
    language:    "English (US)",
    description: "Escalates VIP customers, warm-transfers to human when needed.",
  },
  {
    id:          "renewals",
    name:        "Renewals AI",
    role:        "Win-back",
    status:      "active",
    numbers:     ["+1 (321) 348-2910", "+1 (407) 311-4991"],
    callsToday:  51,
    calls30d:    1189,
    successRate: 0.62,
    avgDuration: "3:15",
    voiceModel:  "Bella (ElevenLabs)",
    recording:   false,
    scriptName:  "Renewal Reminder",
    language:    "English (US)",
    description: "Reaches lapsed customers with a policy renewal offer.",
  },
  {
    id:          "spanish",
    name:        "Spanish Line AI",
    role:        "Spanish Service",
    status:     "active",
    numbers:     ["+1 (321) 348-2910"],
    callsToday:  34,
    calls30d:    812,
    successRate: 0.89,
    avgDuration: "4:45",
    voiceModel:  "Sofia (ElevenLabs)",
    recording:   true,
    scriptName:  "Recepción General",
    language:    "Spanish (LATAM)",
    description: "Atiende llamadas en español, deriva a agente humano si el caso lo requiere.",
  },
  {
    id:          "intake",
    name:        "Intake Bot",
    role:        "Reception",
    status:      "draft",
    numbers:     [],
    callsToday:  0,
    calls30d:    0,
    successRate: 0,
    avgDuration: "—",
    voiceModel:  "Rachel (ElevenLabs)",
    recording:   false,
    scriptName:  null,
    language:    "English (US)",
    description: "General reception line — routes calls to the right department.",
  },
  {
    id:          "notify",
    name:        "Notify Bot",
    role:        "Appt Reminders",
    status:     "paused",
    numbers:     ["+1 (813) 200-1237"],
    callsToday:  0,
    calls30d:    412,
    successRate: 0.83,
    avgDuration: "1:02",
    voiceModel:  "Adam (ElevenLabs)",
    recording:   false,
    scriptName:  "Appointment Confirm",
    language:    "English (US)",
    description: "Places outbound appointment reminder calls the day before.",
  },
]

// ── Derived KPIs (used by header stat cards) ────────────────────────────

export function computeNumbersKpis() {
  const total       = NUMBERS.length
  const unassigned  = NUMBERS.filter(n => n.status === "unassigned").length
  const active      = total - unassigned
  const callsToday  = 487                     // static in prototype
  const avgDuration = "3:42"                  // static in prototype
  return { total, active, unassigned, callsToday, avgDuration }
}
