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
  pills:   string[]           // ["+1 (305) 892-4710", "Rachel (ElevenLabs)", "Recording on"]
  voice?:  VoiceConfig        // present when kind === "voice"
  sms?:    SmsConfig          // present when kind === "sms"
  email?:  EmailConfig        // present when kind === "email"
}

// ── AI Voice Agent ─────────────────────────────────────────────────────

export interface VoiceAIAgent {
  id:          string
  name:        string        // "Sammy"
  purpose:     string        // "Service Desk"
  description: string        // longer copy for the list view
  status:      AIAgentStatus
  iconColor:   string        // avatar tint (uses --primary etc. tokens where possible)
  iconLetter:  string        // "S"
  channels:    AIChannel[]
  // Read-only agent-wide stats surfaced in the list card
  numbersAssigned: number
  callsHandled30d: number
}

// ── Mock data ──────────────────────────────────────────────────────────

// Numbers referenced by the voice channel come from data.ts (n1..n4).
// We reuse them here so number-select dropdowns in ConfigureVoiceSlideOut
// show real numbers that already exist elsewhere in the prototype.

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
    channels: [
      {
        kind:    "voice",
        active:  true,
        summary: "Service Desk · 2 numbers assigned · Inbound + Outbound",
        pills:   ["+1 (305) 892-4710", "+1 (786) 558-1102", "Rachel (ElevenLabs)", "Recording on"],
        voice:   DEFAULT_VOICE_CONFIG,
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
    channels: [
      {
        kind:    "voice",
        active:  true,
        summary: "Sales BDC · 1 number assigned · Inbound",
        pills:   ["+1 (786) 237-9153", "Aria (ElevenLabs)", "Recording on"],
        voice:   { ...DEFAULT_VOICE_CONFIG, numberId: "n2", configurationName: "Sales BDC Voice", numberLabel: "Sales BDC Line", voiceName: "Aria" },
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
    channels: [
      { kind: "voice",   active: false, summary: "3 numbers assigned but channel paused.", pills: ["+1 (407) 311-4991", "+1 (305) 755-0019", "+1 (321) 348-2910"] },
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
