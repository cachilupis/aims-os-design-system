// ────────────────────────────────────────────────────────────────────────
// UCP (Universal Contact Profile) — data seed for the Alejandro contact.
// 1:1 port of voice-channel-ux.html's #screen-ucp Activity timeline: the
// only tab the source prototype actually fleshes out. The other six tabs
// (Overview / Snapshot / Garage / Appointments / Repair Orders / Tasks)
// exist as labels in the source too, so we ship them here as honest
// placeholders — see UcpAlejandroPage.tsx.
// ────────────────────────────────────────────────────────────────────────

export type ActivityKind = "call" | "email" | "sms" | "task"

/** Coarse direction/status label shown as the right-side pill on the item.
 *  Matches the source's `badge badge-*` classes so tags map cleanly. */
export type ActivityBadge =
  | "resolved"      // green — completed successfully
  | "escalated"     // amber — human handoff
  | "delivered"     // neutral — SMS delivered
  | "read"          // neutral — SMS read
  | "replied"       // green — email replied
  | "open"          // amber — task open
  | "no-answer"     // neutral — call not picked up

export type Sentiment = "positive" | "neutral" | "negative"

/** Icon accent for the leading circular badge on each row. Colors are
 *  DS-token references, resolved in the component. */
export type ActivityAccent = "primary" | "success" | "alert" | "neutral"

export interface ActivityItem {
  id:          string
  kind:        ActivityKind
  /** Header line — e.g. "Inbound Call · +1 (305) 892-4710". */
  title:       string
  /** Secondary line under the title — agent · duration · time. */
  meta:        string
  accent:      ActivityAccent
  badge:       { label: string; variant: ActivityBadge }
  sentiment?:  Sentiment
  /** AI Summary body (calls / emails). */
  summary?:    string
  /** Verbatim SMS content, rendered as a quoted block. */
  smsBody?:    string
  /** Bottom row meta chips — e.g. "4:12", "Sammy", "2 tools used". */
  metaChips?:  string[]
  /** Whether the row deep-links into a Call Detail page. */
  callDetailId?: string
  /** Agent name for the agent filter dropdown. */
  agent?:      string
}

export interface ActivityGroup {
  /** ISO-ish date label — "April 17, 2026". */
  label: string
  /** Group key used by the sort control and filter memoization. */
  key:   string
  items: ActivityItem[]
}

export interface UcpContact {
  id:              string
  initials:        string
  displayName:     string
  email:           string
  phone:           string
  lastInteraction: string
}

// ── Seed: Alejandro Gomez ──────────────────────────────────────────────

export const UCP_ALEJANDRO: UcpContact = {
  id:              "ucp-alejandro",
  initials:        "A",
  displayName:     "alejandro@dealerlakes.com",
  email:           "alejandro@dealerlakes.com",
  phone:           "+13908965463",
  lastInteraction: "3 days ago",
}

export const UCP_ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    key:   "apr17",
    label: "April 17, 2026",
    items: [
      {
        id:           "act-apr17-call",
        kind:         "call",
        title:        "Inbound Call · +1 (305) 892-4710",
        meta:         "Sammy — Service Desk · 4:12 · 10:42 AM",
        accent:       "primary",
        badge:        { label: "Resolved", variant: "resolved" },
        sentiment:    "positive",
        summary:      "Alejandro called to schedule a service appointment for his 2023 Explorer (clicking noise). Sammy booked Thursday Apr 20 at 9 AM and sent a confirmation SMS.",
        metaChips:    ["4:12", "Sammy", "2 tools used"],
        callDetailId: "call1",
        agent:        "Sammy",
      },
      {
        id:      "act-apr17-sms",
        kind:    "sms",
        title:   "Outbound SMS · +1 (305) 892-4710",
        meta:    "Sammy · 10:47 AM · Auto-sent after call",
        accent:  "neutral",
        badge:   { label: "Delivered", variant: "delivered" },
        smsBody: "Hi Alejandro! Your service appointment is confirmed for Thursday, April 20 at 9:00 AM. Reply STOP to opt out.",
        agent:   "Sammy",
      },
    ],
  },
  {
    key:   "apr14",
    label: "April 14, 2026",
    items: [
      {
        id:           "act-apr14-call",
        kind:         "call",
        title:        "Inbound Call · +1 (305) 892-4710",
        meta:         "Sammy — Service Desk · 2:44 · 3:15 PM",
        accent:       "alert",
        badge:        { label: "Escalated", variant: "escalated" },
        sentiment:    "neutral",
        summary:      "Alejandro called about a billing discrepancy on RO #4821. Sammy transferred to service manager. Task created for billing team.", // audit-ignore: "#4821" is a repair order number, not a hex color
        metaChips:    ["2:44", "Sammy → Human", "Task created"],
        callDetailId: "call2",
        agent:        "Sammy",
      },
      {
        id:     "act-apr14-task",
        kind:   "task",
        title:  "Task Created — Billing Review · RO #4821", // audit-ignore: "#4821" is a repair order number, not a hex color
        meta:   "Auto-created by Sammy · 3:17 PM · Assigned to billing team",
        accent: "alert",
        badge:  { label: "Open", variant: "open" },
        agent:  "Sammy",
      },
    ],
  },
  {
    key:   "apr10",
    label: "April 10, 2026",
    items: [
      {
        id:      "act-apr10-email",
        kind:    "email",
        title:   "Inbound Email · service@aimsos.ai",
        meta:    "Sammy · 9:14 AM · Subject: Follow-up on service visit",
        accent:  "success",
        badge:   { label: "Replied", variant: "replied" },
        summary: "Alejandro emailed asking about the status of parts for his Explorer. Sammy replied with an estimated delivery date of April 15.",
        agent:   "Sammy",
      },
    ],
  },
  {
    key:   "apr3",
    label: "April 3, 2026",
    items: [
      {
        id:        "act-apr3-call",
        kind:      "call",
        title:     "Outbound Call · +1 (800) 555-0103",
        meta:      "Sammy — Appt Reminders · 0:28 · 2:00 PM",
        accent:    "neutral",
        badge:     { label: "No Answer", variant: "no-answer" },
        metaChips: ["0:28", "Voicemail left · Retry scheduled Apr 4"],
        agent:     "Sammy",
      },
      {
        id:      "act-apr3-sms",
        kind:    "sms",
        title:   "Outbound SMS · +1 (305) 892-4710",
        meta:    "Sammy · 2:01 PM · Appt reminder",
        accent:  "neutral",
        badge:   { label: "Read", variant: "read" },
        smsBody: "Reminder: Your vehicle is ready for pickup at AIMS Dealer. Reply YES to confirm or call +1 (305) 892-4710.",
        agent:   "Sammy",
      },
    ],
  },
]

/** Distinct agent names for the Activity filter dropdown. */
export const UCP_AGENTS: string[] = Array.from(
  new Set(
    UCP_ACTIVITY_GROUPS.flatMap(g => g.items.map(i => i.agent).filter((s): s is string => !!s))
  )
).sort()

/** Total activity items — shown in the tab header count. */
export const UCP_ACTIVITY_TOTAL = UCP_ACTIVITY_GROUPS.reduce((n, g) => n + g.items.length, 0)
