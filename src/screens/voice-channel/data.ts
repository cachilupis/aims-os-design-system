// ────────────────────────────────────────────────────────────────────────
// Voice Channel — mock data, 1:1 port of aims-voice-prototype/index.html.
// Every field name, value, and structure preserved so the UX matches the
// prototype exactly.
// ────────────────────────────────────────────────────────────────────────

export type AgentStatus  = "online" | "busy" | "offline"
export type AgentRole    = "Primary" | "Backup" | "Overflow" | "AI"

export interface Agent {
  id:        string
  name:      string
  email:     string
  initials:  string
  color:     string           // brand color for the avatar disc
  status:    AgentStatus
  role:      AgentRole
  calls:     number           // rolling 30-day count
  sentiment: number           // 0..1
  /** AI agents are handled differently in the UI (badge, no HiL routing) */
  isAi?:     boolean
}

export type NumberType    = "Local" | "Toll-Free" | "Mobile"
export type NumberStatus  = "active" | "suspended"
export type Distribution  = "Round Robin" | "First Available" | "Least Load"

export interface PhoneNumberRecord {
  id:        string
  number:    string
  label:     string
  type:      NumberType
  status:    NumberStatus
  agents:    string[]         // Agent ids
  dist:      Distribution
  hil:       boolean          // Human-in-Loop enabled
  calls:     number           // rolling 30-day count
  cost:      number           // month-to-date, USD
  country:   string           // flag emoji
  sentiment: "Positive" | "Neutral" | "Negative" | null
}

export type CallDirection = "inbound" | "outbound"
export type CallSentiment = "positive" | "neutral" | "negative"

/** Per-call intelligence that populates the Call Detail sub-tabs.
 *  Optional — a call without any of these falls back to the generic
 *  mock transcript. Every UCP-linked call ships its own set so the
 *  clickthrough tells the same story as the UCP row. */
export interface CallIntel {
  transcript?:  TranscriptLine[]
  summary?:     string
  topics?:      string[]
  actionItems?: string[]
  aiTurns?:     number
  humanTurns?:  number
  timeToHandoff?: string      // e.g. "12 seconds"
  handoffReason?: string
  resolution?:  "Resolved" | "Escalated" | "Task Created" | "No Answer"
}

export interface Call {
  id:        string
  numberId:  string
  direction: CallDirection
  caller:    string
  agent:     string           // Agent id
  duration:  string           // "M:SS"
  sentiment: CallSentiment
  hil:       boolean
  cost:      number
  time:      string           // relative, e.g. "14 min ago"
  ts:        string           // clock, e.g. "10:41 AM"
  intel?:    CallIntel        // Per-call transcript + summary + metrics
}

export type TranscriptRole = "agent" | "caller" | "hil"

export interface TranscriptLine {
  role:      TranscriptRole
  text:      string
  t:         string
  divider?:  boolean
}

export interface AvailableNumber {
  number:  string
  region:  string
  country: string
  caps:    string[]
  price:   string
}

// ── AGENTS ─────────────────────────────────────────────────────────────

export const COLORS = [
  "#6c63ff", "#22d388", "#f5a623", "#3b8beb", "#f04e5e", // audit-ignore: prototype fixture data
  "#29c6e0", "#9b6bff", "#ff6b9d", // audit-ignore: prototype fixture data
]

export const AGENTS: Agent[] = [
  // AI agent — Sammy sits at the front of Service Desk before HiL escalation.
  // Rendered with its own AI role tag; not routable via HiL policies.
  { id: "sammy", name: "Sammy — Service Desk", email: "sammy@ai.acme", initials: "S", color: "#9b6bff", status: "online", role: "AI", calls: 421, sentiment: 0.76, isAi: true }, // audit-ignore: prototype fixture data
  { id: "a1", name: "Sam Rivera",  email: "sam@acme.com",    initials: "SR", color: "#6c63ff", status: "online",  role: "Primary",  calls: 48, sentiment: 0.72 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
  { id: "a2", name: "Jordan Kim",  email: "jordan@acme.com", initials: "JK", color: "#22d388", status: "busy",    role: "Backup",   calls: 31, sentiment: 0.65 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
  { id: "a3", name: "Alex Chen",   email: "alex@acme.com",   initials: "AC", color: "#f5a623", status: "offline", role: "Overflow", calls: 19, sentiment: 0.58 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
  { id: "a4", name: "Priya Nair",  email: "priya@acme.com",  initials: "PN", color: "#3b8beb", status: "online",  role: "Primary",  calls: 55, sentiment: 0.81 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
  { id: "a5", name: "Marcus Webb", email: "marcus@acme.com", initials: "MW", color: "#f04e5e", status: "offline", role: "Backup",   calls: 22, sentiment: 0.61 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
  { id: "a6", name: "Li Zhang",    email: "li@acme.com",     initials: "LZ", color: "#29c6e0", status: "online",  role: "Primary",  calls: 67, sentiment: 0.88 }, // audit-ignore: prototype fixture data (source prototype's agent brand colors)
]

// ── NUMBERS ────────────────────────────────────────────────────────────

export const NUMBERS: PhoneNumberRecord[] = [
  { id: "n1", number: "+1 (402) 555-0171", label: "Main Service Line", type: "Local",     status: "active",    agents: ["a1", "a2", "a3"], dist: "Round Robin",     hil: true,  calls: 342, cost: 18.40, country: "🇺🇸", sentiment: "Neutral"  },
  { id: "n2", number: "+1 (800) 555-0192", label: "Support Toll-Free", type: "Toll-Free", status: "active",    agents: ["a4", "a5"],       dist: "First Available", hil: true,  calls: 891, cost: 41.20, country: "🇺🇸", sentiment: "Positive" },
  { id: "n3", number: "+1 (415) 555-0138", label: "Sales West",        type: "Local",     status: "active",    agents: ["a6"],             dist: "Least Load",      hil: false, calls: 128, cost:  7.80, country: "🇺🇸", sentiment: "Positive" },
  { id: "n4", number: "+1 (312) 555-0204", label: "",                  type: "Local",     status: "suspended", agents: [],                 dist: "Round Robin",     hil: false, calls:   0, cost:  3.50, country: "🇺🇸", sentiment: null       },
]

// ── CALLS ──────────────────────────────────────────────────────────────

export const CALLS: Call[] = [
  // c1 — Alejandro's Apr-14 billing-dispute call. AI Sammy took the call,
  // triaged the issue, then handed off to the service manager. Cross-linked
  // from UCP Activity → Apr 14 → View details.
  {
    id: "c1", numberId: "n2", direction: "inbound",
    caller: "+1 (305) 892-4710", agent: "sammy",
    duration: "2:44", sentiment: "neutral", hil: true, cost: 0.29,
    time: "3 days ago", ts: "3:15 PM",
    intel: {
      transcript: [
        { role: "agent",  text: "Thank you for calling AIMS Dealer Service Desk. How can I help you today?", t: "0:00" },
        { role: "caller", text: "Hi, I'm calling about repair order 4821. I think I was overcharged for labor.", t: "0:06" },
        { role: "agent",  text: "I'm sorry to hear that, Alejandro. Let me pull up your repair order.", t: "0:18" },
        { role: "caller", text: "It says 3.2 hours of labor but I was told the job was 2 hours.", t: "0:32" },
        { role: "agent",  text: "I see the discrepancy on RO #4821. I don't have authorization to adjust billing on my end — I'll transfer you to our service manager who can review this.", t: "0:47" }, // audit-ignore: "#4821" is a repair-order number, not a hex color
        { role: "caller", text: "Okay, thanks.", t: "1:05" },
        { role: "hil",    text: "Handoff to Priya Nair — Billing dispute + manager authorization required", t: "1:12", divider: true },
        { role: "agent",  text: "Hi Alejandro, this is Priya from the service team. I've reviewed RO #4821 and I can see the labor was quoted at 2 hours. I've opened a task for the billing team to issue a $145 credit — you should see it in 3-5 business days.", t: "1:15" }, // audit-ignore: "#4821" is a repair-order number, not a hex color
        { role: "caller", text: "That's great, thank you.", t: "2:12" },
        { role: "agent",  text: "Of course. You'll get an email confirmation shortly.", t: "2:22" },
      ],
      summary:       "Alejandro called about a billing discrepancy on repair order #4821, claiming he was overcharged for labor. Sammy triaged the issue but could not adjust billing without manager authorization. The call was transferred to service manager Priya Nair, who reviewed the RO, agreed on the discrepancy, and opened a billing-credit task.", // audit-ignore: "#4821" is a repair-order number, not a hex color
      topics:        ["Billing dispute", "Repair order", "Manager escalation"],
      actionItems:   ["Review billing dispute RO #4821 — assigned to billing team", "Issue $145 credit to customer within 3–5 business days"], // audit-ignore: "#4821" is a repair-order number, not a hex color
      aiTurns:       3,
      humanTurns:    2,
      timeToHandoff: "1 minute 12 seconds",
      handoffReason: "Billing authorization required",
      resolution:    "Task Created",
    },
  },
  // c2 — Alejandro's Apr-17 service-appointment call. Fully resolved by AI.
  // Cross-linked from UCP Activity → Apr 17 → View details.
  {
    id: "c2", numberId: "n1", direction: "inbound",
    caller: "+1 (305) 892-4710", agent: "sammy",
    duration: "4:12", sentiment: "positive", hil: false, cost: 0.34,
    time: "6 hours ago", ts: "10:42 AM",
    intel: {
      transcript: [
        { role: "agent",  text: "Thank you for calling AIMS Dealer Service Desk. How can I help you today?", t: "0:00" },
        { role: "caller", text: "Hi, I'd like to book a service appointment. My 2023 Explorer is making a clicking noise when I turn.", t: "0:05" },
        { role: "agent",  text: "Happy to help, Alejandro. Found your 2023 Ford Explorer on file. Checking available service slots now.", t: "0:18" },
        { role: "agent",  text: "I have Thursday April 20 at 9:00 AM or Friday April 21 at 2:30 PM. Which works better?", t: "0:41" },
        { role: "caller", text: "Thursday at 9 AM works.", t: "1:02" },
        { role: "agent",  text: "Booked. I'll send a confirmation SMS to the number ending in 4710. Anything else I can help you with today?", t: "1:12" },
        { role: "caller", text: "No, that's it. Thanks!", t: "3:38" },
        { role: "agent",  text: "You're welcome. See you Thursday.", t: "3:50" },
      ],
      summary:       "Alejandro called to schedule a service appointment for his 2023 Ford Explorer, reporting a clicking noise. Identity resolved automatically via phone number match. Sammy checked availability, booked Thursday Apr 20 at 9:00 AM, and sent a confirmation SMS. No escalation needed.",
      topics:        ["Service appointment", "Vehicle diagnostics", "Auto-scheduled"],
      actionItems:   ["Send appointment reminder SMS 24h before"],
      aiTurns:       4,
      humanTurns:    0,
      timeToHandoff: "—",
      handoffReason: "—",
      resolution:    "Resolved",
    },
  },
  { id: "c3", numberId: "n3", direction: "outbound", caller: "+1 (512) 334-9900", agent: "a6", duration: "6:55", sentiment: "positive", hil: false, cost: 0.57, time: "31 min ago", ts: "10:12 AM"  },
  { id: "c4", numberId: "n2", direction: "inbound",  caller: "+1 (646) 221-7732", agent: "a5", duration: "1:05", sentiment: "neutral",  hil: false, cost: 0.09, time: "1h ago",     ts: "9:43 AM"   },
  { id: "c5", numberId: "n1", direction: "inbound",  caller: "+1 (917) 558-4401", agent: "a2", duration: "8:17", sentiment: "negative", hil: true,  cost: 0.69, time: "2h ago",     ts: "8:55 AM"   },
  { id: "c6", numberId: "n3", direction: "outbound", caller: "+1 (214) 663-1120", agent: "a6", duration: "3:44", sentiment: "positive", hil: false, cost: 0.31, time: "3h ago",     ts: "7:44 AM"   },
  { id: "c7", numberId: "n2", direction: "inbound",  caller: "+1 (404) 772-9988", agent: "a4", duration: "0:45", sentiment: "neutral",  hil: false, cost: 0.06, time: "4h ago",     ts: "6:38 AM"   },
  { id: "c8", numberId: "n1", direction: "inbound",  caller: "+1 (702) 881-3355", agent: "a3", duration: "5:20", sentiment: "positive", hil: true,  cost: 0.44, time: "Yesterday",  ts: "Yesterday" },
]

// ── TRANSCRIPT (mock — used by any call opened in the detail panel) ────

export const TRANSCRIPT: TranscriptLine[] = [
  { role: "agent",  text: "Thank you for calling AIMS Support. How can I help you today?", t: "0:00" },
  { role: "caller", text: "Hi, I'm having trouble logging into my account. It keeps saying invalid credentials but I know my password is right.", t: "0:04" },
  { role: "agent",  text: "I'm sorry to hear that. Let me pull up your account. Can I get your email address?", t: "0:11" },
  { role: "caller", text: "Sure, it's maria.garcia@example.com", t: "0:16" },
  { role: "agent",  text: "Thank you Maria. I can see your account. It looks like there were multiple failed login attempts which triggered a temporary lock. I can reset that for you now.", t: "0:20" },
  { role: "caller", text: "Oh thank goodness. I've been locked out for an hour. This is really frustrating.", t: "0:29" },
  { role: "agent",  text: "I completely understand and I apologize for the inconvenience. I'm resetting the lock now and sending a password reset link to your email as well, just as a precaution.", t: "0:35" },
  { role: "caller", text: "Can I just talk to a real person? I need to sort this out quickly.", t: "0:48" },
  { role: "hil",    text: "[Handoff to Jordan Kim — Negative sentiment + customer request]", t: "0:51", divider: true },
  { role: "agent",  text: "Hi Maria, this is Jordan. I have full context from the AI. Your account is now unlocked and the reset email is on its way. Is there anything else I can help with?", t: "0:55" },
  { role: "caller", text: "Oh that was fast! Yes, just to confirm — my account should work now?", t: "1:08" },
  { role: "agent",  text: "Yes, absolutely. You can log in right now. And if you have any issues, don't hesitate to call back and ask for me directly.", t: "1:13" },
  { role: "caller", text: "Thank you so much Jordan, that's really helpful.", t: "1:22" },
]

// ── AVAILABLE NUMBERS (Acquire wizard) ─────────────────────────────────

export const AVAILABLE_NUMBERS: AvailableNumber[] = [
  { number: "+1 (718) 555-0141", region: "New York, NY",     country: "US", caps: ["Voice", "SMS", "MMS"], price: "$1.15/mo" },
  { number: "+1 (213) 555-0199", region: "Los Angeles, CA",  country: "US", caps: ["Voice", "SMS"],        price: "$1.15/mo" },
  { number: "+1 (312) 555-0177", region: "Chicago, IL",      country: "US", caps: ["Voice", "SMS", "MMS"], price: "$1.15/mo" },
  { number: "+1 (305) 555-0122", region: "Miami, FL",        country: "US", caps: ["Voice", "SMS"],        price: "$1.15/mo" },
  { number: "+1 (415) 555-0133", region: "San Francisco, CA",country: "US", caps: ["Voice", "SMS", "MMS"], price: "$1.15/mo" },
]

// ── COUNTRIES (Acquire wizard step 1) ──────────────────────────────────

export const COUNTRIES = [
  { label: "🇺🇸 United States",  code: "US" },
  { label: "🇨🇦 Canada",         code: "CA" },
  { label: "🇬🇧 United Kingdom", code: "GB" },
  { label: "🇲🇽 Mexico",         code: "MX" },
  { label: "🇨🇴 Colombia",       code: "CO" },
]

// ── TIMEZONES (used in multiple places) ────────────────────────────────

export const TIMEZONES = [
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "America/Chicago (CST)",
  "UTC",
  "Europe/London",
  "America/Bogota",
]

// ── LANGUAGES (per-number Overview tab) ────────────────────────────────

export const LANGUAGES = ["English", "Spanish", "French", "Portuguese"]

// ── AFTER-HOURS options ────────────────────────────────────────────────

export const AFTER_HOURS_OPTIONS = [
  "Send to voicemail",
  "Play custom message",
  "Route to HiL queue",
  "Forward to after-hours number",
]

// ── HiL trigger conditions (Agents & Routing → HiL section) ────────────

export const HIL_TRIGGERS = [
  { key: "negative-sentiment", label: "Negative sentiment",     default: true  },
  { key: "customer-request",   label: "Customer requests human",default: true  },
  { key: "low-confidence",     label: "Low AI confidence",      default: false },
  { key: "keyword",            label: "Keyword detected",       default: false },
]

// ── Distribution modes (radio card copy) ───────────────────────────────

export const DISTRIBUTION_MODES: { id: Distribution; desc: string }[] = [
  { id: "Round Robin",     desc: "Distribute calls evenly in rotation"                 },
  { id: "First Available", desc: "Route to first online, available agent"              },
  { id: "Least Load",      desc: "Route to agent with fewest active calls"             },
]
