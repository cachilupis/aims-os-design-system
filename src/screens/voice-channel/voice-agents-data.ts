// ────────────────────────────────────────────────────────────────────────
// Voice AI Agents — mock data for the Agents view.
// 1:1 port of voice-channel-ux.html (Agentic-knowledge prototype).
// These are AI voice agents (Sammy, Alex, etc.) — distinct from the
// human call reps modelled in data.ts (Agent interface).
// ────────────────────────────────────────────────────────────────────────

export type AIAgentStatus = "Published" | "Draft" | "Paused"

// ── Channel configuration ──────────────────────────────────────────────

export type ChannelKind = "voice" | "email" | "sms" | "webchat"

export type VoiceModel = "ElevenLabs" | "Deepgram" | "OpenAI TTS"
export type VoiceName  = "Rachel" | "Samantha" | "Daniel" | "Aria"

export interface VoiceHoursConfig {
  mode:          "TCPA" | "Business" | "Custom"   // 8am–9pm local / 9–6 / custom
  outOfHoursMsg: string
}

export interface VoiceInboundConfig {
  enabled:        boolean
  greeting:       string
  businessHours:  boolean
  schedule:       string
  outOfHoursMsg:  string
  dropVmMessage:  boolean
}

export interface VoiceOutboundConfig {
  enabled:      boolean
  callingHours: string
  dncEnforce:   boolean
  voicemailDrop: boolean
  maxRetries:   number   // 0..5 (0 = disabled)
}

export interface VoiceConfig {
  numberId:              string           // maps to PhoneNumberRecord.id
  configurationName:     string           // e.g. "Service Desk Voice"
  numberLabel:           string           // e.g. "Main IVR line"
  voiceModel:            VoiceModel
  voiceName:             VoiceName
  recordingConsentText:  string
  callRecording:         boolean
  voicemailTranscription: boolean
  inbound:               VoiceInboundConfig
  outbound:              VoiceOutboundConfig
}

// ── SMS channel config ─────────────────────────────────────────────────

export interface SmsInboundConfig {
  enabled:            boolean
  autoReply:          string
  businessHoursOnly:  boolean
}

export interface SmsOutboundConfig {
  enabled:      boolean
  sendingHours: string
  dncEnforce:   boolean
  maxRetries:   number
}

export interface SmsConfig {
  numberId:          string
  configurationName: string
  numberLabel:       string
  tcpaOptOut:        boolean
  messageLogging:    boolean
  inbound:           SmsInboundConfig
  outbound:          SmsOutboundConfig
}

// ── Email channel config ───────────────────────────────────────────────

export interface EmailInboundConfig {
  enabled:            boolean
  autoReply:          string
  businessHoursOnly:  boolean
  spamFilter:         boolean
}

export interface EmailOutboundConfig {
  enabled:      boolean
  sendingHours: string
  replyTo:      string
  templates:    boolean
}

export interface EmailAddress {
  id:     string     // "service"
  email:  string     // "service@aimsos.ai"
  label:  string     // "Service Desk"
}

export interface EmailConfig {
  addressId:         string
  configurationName: string
  addressLabel:      string
  displayName:       string
  emailLogging:      boolean
  unsubscribeEnforce: boolean
  inbound:           EmailInboundConfig
  outbound:          EmailOutboundConfig
}

export interface AIChannel {
  kind:    ChannelKind
  active:  boolean
  summary: string             // "Service Desk · 2 numbers assigned · Inbound + Outbound"
  // Non-number chips only — number chips are derived from numberIds so
  // Add Phone Number and Configure both edit ONE source of truth.
  pills:   string[]           // e.g. ["Rachel (ElevenLabs)", "Recording on"]
  // Numbers currently assigned to this channel. The Configure Voice
  // slide-out's top dropdown reads from this; Add Phone Number appends
  // to it; Detach removes from it.
  numberIds?: string[]
  voice?:  VoiceConfig        // present when kind === "voice"
  sms?:    SmsConfig          // present when kind === "sms"
  email?:  EmailConfig        // present when kind === "email"
}

// ── AI Voice Agent ─────────────────────────────────────────────────────

export interface AgentRuntimeConfig {
  model:        string     // "GPT-4o" | "GPT-5" | "Claude Sonnet 5" | "Claude Opus 5"
  temperature:  "focused" | "balanced" | "creative"  // preset shorthand for a slider
  maxTokens:    number     // per-response cap
  timeoutSec:   number     // hard wall-clock cap per turn
  guardrails:   boolean    // content filter + safe topics
  piiBlocking:  boolean    // scrub PII from tool inputs
  fallback:     "retry" | "hil-handoff" | "silent"
}

export interface AgentInstructions {
  systemPrompt: string     // main behavioural prompt
  persona:      string     // voice/tone description
  dos:          string[]   // do-this bullets
  donts:        string[]   // don't-do bullets
  examples:     { user: string; agent: string }[]  // 3-column "few-shot" panel
}

export interface VoiceAIAgent {
  id:          string
  name:        string        // "Sammy"
  purpose:     string        // "Service Desk"
  description: string        // longer copy for the list view
  status:      AIAgentStatus
  iconColor:   string        // avatar tint (uses --primary etc. tokens where possible)
  iconLetter:  string        // "S"
  channels:    AIChannel[]
  runtime:     AgentRuntimeConfig
  instructions: AgentInstructions
  // Read-only agent-wide stats surfaced in the list card
  numbersAssigned: number
  callsHandled30d: number
}

// ── Mock data ──────────────────────────────────────────────────────────

// Numbers referenced by the voice channel come from data.ts (n1..n4).
// We reuse them here so number-select dropdowns in ConfigureVoiceSlideOut
// show real numbers that already exist elsewhere in the prototype.

export // ── Runtime + Instructions defaults ────────────────────────────────────

const SAMMY_RUNTIME: AgentRuntimeConfig = {
  model:       "Claude Sonnet 5",
  temperature: "balanced",
  maxTokens:   1024,
  timeoutSec:  30,
  guardrails:  true,
  piiBlocking: true,
  fallback:    "hil-handoff",
}

const SAMMY_INSTRUCTIONS: AgentInstructions = {
  systemPrompt:
    "You are Sammy, an AI service-desk assistant for AIMS Motors. Book service appointments, answer routine vehicle-service questions and hand off to a human when the customer asks or when sentiment turns negative. Always confirm the customer's contact information before ending the call.",
  persona:
    "Warm, calm and efficient. Speak like a senior service advisor — never robotic. Use short sentences. Confirm what you heard before acting.",
  dos: [
    "Confirm vehicle year/make/model before booking.",
    "Read back the appointment slot in local time.",
    "Ask clarifying questions when the concern is vague.",
    "Escalate to a human when the customer requests one.",
  ],
  donts: [
    "Never quote parts or labour prices without a repair order.",
    "Never promise loaner vehicles — offer to check availability.",
    "Never share other customers' data.",
    "Never argue back if sentiment turns negative — hand off.",
  ],
  examples: [
    {
      user:  "My 2023 Explorer is making a clicking noise when I turn left.",
      agent: "Thanks for calling. That sounds like a front-axle CV joint or a brake caliper — both need a hands-on look. Do you want me to book the next available service appointment?",
    },
    {
      user:  "Can I speak to a real person?",
      agent: "Absolutely — I'll connect you now. One moment while I brief the service advisor with what you've shared so far.",
    },
  ],
}

export const DEFAULT_SMS_CONFIG: SmsConfig = {
  numberId:          "n1",
  configurationName: "Service Desk SMS",
  numberLabel:       "Service Desk SMS",
  tcpaOptOut:        true,
  messageLogging:    true,
  inbound: {
    enabled:            true,
    autoReply:          "Thanks for reaching out! I'm Sammy. How can I help you today?",
    businessHoursOnly:  false,
  },
  outbound: {
    enabled:      true,
    sendingHours: "8am–9pm local (TCPA default)",
    dncEnforce:   true,
    maxRetries:   3,
  },
}

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  addressId:          "service",
  configurationName:  "Service Desk Email",
  addressLabel:       "Service Desk",
  displayName:        "AIMS Service Desk",
  emailLogging:       true,
  unsubscribeEnforce: true,
  inbound: {
    enabled:            true,
    autoReply:          "Thank you for your email. I'm Sammy. I'll review your message and get back to you shortly.",
    businessHoursOnly:  false,
    spamFilter:         true,
  },
  outbound: {
    enabled:      true,
    sendingHours: "Any time",
    replyTo:      "",
    templates:    true,
  },
}

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  numberId:              "n1",
  configurationName:     "Service Desk Voice",
  numberLabel:           "Main IVR line",
  voiceModel:            "ElevenLabs",
  voiceName:             "Rachel",
  recordingConsentText:  "This call may be recorded for quality and training purposes.",
  callRecording:         true,
  voicemailTranscription: true,
  inbound: {
    enabled:       true,
    greeting:      "Thank you for calling AIMS Service. I'm Sammy, your AI assistant. How can I help you today?",
    businessHours: false,
    schedule:      "Monday–Friday 9am–6pm (local)",
    outOfHoursMsg: "We're currently closed. Our hours are Monday–Friday 9am–6pm. Please call back during business hours.",
    dropVmMessage: true,
  },
  outbound: {
    enabled:      true,
    callingHours: "8am–9pm local (TCPA default)",
    dncEnforce:   true,
    voicemailDrop: false,
    maxRetries:   3,
  },
}

export const VOICE_AI_AGENTS: VoiceAIAgent[] = [
  {
    id:          "va1",
    name:        "Sammy",
    purpose:     "Service Desk",
    description: "Books service appointments, answers vehicle questions and hands off to a human when the customer asks.",
    status:      "Published",
    iconColor:   "var(--color-surface-primary-more-subtle)",
    iconLetter:  "S",
    numbersAssigned: 2,
    callsHandled30d: 342,
    runtime:      SAMMY_RUNTIME,
    instructions: SAMMY_INSTRUCTIONS,
    channels: [
      {
        kind:    "voice",
        active:  true,
        summary: "Service Desk · 2 numbers assigned · Inbound + Outbound",
        // Numbers are stored as ids so they cross-reference data.ts;
        // the rest of the row (voice model + recording flag) still
        // renders as free-form pills.
        numberIds: ["n1", "n3"],
        pills:     ["Rachel (ElevenLabs)", "Recording on"],
        voice:     DEFAULT_VOICE_CONFIG,
      },
      {
        kind:    "email",
        active:  true,
        summary: "service@aimsos.ai · Inbound + Outbound",
        pills:   ["Inbound", "Outbound", "Templates on"],
        email:   DEFAULT_EMAIL_CONFIG,
      },
      {
        kind:    "sms",
        active:  false,
        summary: "Assign a phone number with SMS capability to enable this channel.",
        pills:   [],
        sms:     DEFAULT_SMS_CONFIG,
      },
      {
        kind:    "webchat",
        active:  false,
        summary: "Connect a Chat Widget to embed this agent on your website.",
        pills:   [],
      },
    ],
  },
  {
    id:          "va2",
    name:        "Alex",
    purpose:     "Sales BDC",
    description: "Qualifies inbound leads, books test drives and follows up on internet inquiries.",
    status:      "Published",
    iconColor:   "var(--color-surface-success-more-subtle)",
    iconLetter:  "A",
    numbersAssigned: 1,
    callsHandled30d: 289,
    runtime: {
      ...SAMMY_RUNTIME,
      model:       "GPT-5",
      temperature: "creative",
      fallback:    "retry",
    },
    instructions: {
      systemPrompt:
        "You are Alex, a sales BDC assistant for AIMS Motors. Qualify inbound web leads, gauge intent, and book test drives with the sales team. Never quote final pricing; always route final-price and finance questions to a human sales advisor.",
      persona: "Confident, enthusiastic, courteous. Move the conversation forward with clear next steps.",
      dos: [
        "Ask about model interest, budget range and timeline.",
        "Confirm the customer's email before booking a test drive.",
        "Log the lead source and vehicle interest in the CRM.",
      ],
      donts: [
        "Never state final OTD prices — hand off to a human.",
        "Never promise trade-in valuations.",
        "Never send finance rate quotes.",
      ],
      examples: [
        {
          user:  "I'm interested in the new Bronco Sport.",
          agent: "Great choice — the 2026 Bronco Sport is one of our most-requested. When would you like to come in for a test drive? I have slots this week from Tuesday afternoon onwards.",
        },
      ],
    },
    channels: [
      {
        kind:    "voice",
        active:  true,
        summary: "Sales BDC · 1 number assigned · Inbound",
        numberIds: ["n2"],
        pills:     ["Aria (ElevenLabs)", "Recording on"],
        voice:     { ...DEFAULT_VOICE_CONFIG, numberId: "n2", configurationName: "Sales BDC Voice", numberLabel: "Sales BDC Line", voiceName: "Aria" },
      },
      { kind: "email",   active: false, summary: "No email address connected.",  pills: [] },
      { kind: "sms",     active: false, summary: "No number with SMS capability.", pills: [] },
      { kind: "webchat", active: false, summary: "Not connected.",                pills: [] },
    ],
  },
  {
    id:          "va3",
    name:        "Notify Bot",
    purpose:     "Appt Reminders & Follow-ups",
    description: "Outbound reminder and follow-up bot for confirmed appointments and CSAT surveys.",
    status:      "Draft",
    iconColor:   "var(--color-surface-alert-more-subtle)",
    iconLetter:  "N",
    numbersAssigned: 3,
    callsHandled30d: 178,
    runtime: {
      ...SAMMY_RUNTIME,
      model:       "Haiku 4.5",
      temperature: "focused",
      maxTokens:   512,
      timeoutSec:  20,
      fallback:    "silent",
    },
    instructions: {
      systemPrompt:
        "You are the Notify Bot. Place outbound reminder calls for confirmed appointments and outbound CSAT surveys after service visits. Keep every call under 90 seconds. If the recipient asks a question you cannot answer, offer to have a human call back.",
      persona: "Brief, friendly, respectful of the caller's time.",
      dos: [
        "Read the appointment slot back once, in local time.",
        "Confirm or offer to reschedule in the same call.",
        "Ask 1 CSAT question after service, no more.",
      ],
      donts: [
        "Never call outside the recipient's local calling hours.",
        "Never leave voicemails longer than 15 seconds.",
        "Never call the same recipient more than 3 times.",
      ],
      examples: [],
    },
    channels: [
      // Numbers below reference n1/n3/n4 in data.ts — everything the
      // workspace actually has.
      { kind: "voice",   active: false, summary: "3 numbers assigned but channel paused.", numberIds: ["n1","n3","n4"], pills: [] },
      { kind: "email",   active: false, summary: "No email address connected.",             pills: [] },
      { kind: "sms",     active: false, summary: "No number with SMS capability.",          pills: [] },
      { kind: "webchat", active: false, summary: "Not connected.",                          pills: [] },
    ],
  },
]

// ── Static options used by ConfigureVoiceSlideOut ──────────────────────

export const VOICE_MODEL_OPTIONS: VoiceModel[] = ["ElevenLabs", "Deepgram", "OpenAI TTS"]
export const VOICE_NAME_OPTIONS:  VoiceName[]  = ["Rachel", "Samantha", "Daniel", "Aria"]

export const SCHEDULE_OPTIONS = [
  "Monday–Friday 9am–6pm (local)",
  "Monday–Saturday 8am–8pm (local)",
  "Custom schedule",
]

export const CALLING_HOURS_OPTIONS = [
  "8am–9pm local (TCPA default)",
  "Business hours (9am–6pm)",
  "Custom",
]

// Email sending hours has a distinct "Any time" default option per source.
export const EMAIL_SENDING_HOURS_OPTIONS = [
  "Any time",
  "Business hours (9am–6pm)",
  "Custom",
]

// Available email addresses surfaced in the Configure Email address picker.
export const AVAILABLE_EMAIL_ADDRESSES: EmailAddress[] = [
  { id: "service", email: "service@aimsos.ai", label: "Service Desk"    },
  { id: "support", email: "support@aimsos.ai", label: "Support alias"   },
]

// Max retry cap surfaced in the "attempts · max 5" hint on the slide-out.
export const MAX_RETRY_CAP = 5

// ── Configuration + Instructions tab options ───────────────────────────

export const MODEL_OPTIONS = [
  "Claude Opus 5",
  "Claude Sonnet 5",
  "GPT-5",
  "GPT-4o",
  "Haiku 4.5",
]

export const TEMPERATURE_OPTIONS: { id: AgentRuntimeConfig["temperature"]; label: string; desc: string }[] = [
  { id: "focused",   label: "Focused",   desc: "Deterministic. Best for high-stakes, compliance-heavy tasks." },
  { id: "balanced",  label: "Balanced",  desc: "Default. Good for customer-facing conversation." },
  { id: "creative",  label: "Creative",  desc: "More variety. Best for outbound writing / brainstorming." },
]

export const FALLBACK_OPTIONS: { id: AgentRuntimeConfig["fallback"]; label: string; desc: string }[] = [
  { id: "retry",       label: "Retry",         desc: "Retry once with a lower temperature before giving up." },
  { id: "hil-handoff", label: "Human handoff", desc: "Escalate to a live operator via the HiL queue." },
  { id: "silent",      label: "Silent fail",   desc: "Log the failure and continue — no user-facing error." },
]

export const AGENT_STATUS_OPTIONS: AIAgentStatus[] = ["Published", "Draft", "Paused"]
