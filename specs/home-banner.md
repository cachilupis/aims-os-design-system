# Untitled


Personalized greeting banner displayed at the top of the Home page. Combines a time-of-day greeting, daily progress counter, a featured action carousel (user's most urgent pending item), and quick navigation shortcuts. Uses CardContainer variant="primary" to stand out from the default canvas surface without using raw gradients.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| userName | — | — | — | — |
| timeOfDay | — | — | — | — |
| resolvedToday | — | — | — | — |
| remaining | — | — | — | — |
| featuredItems | — | — | — | — |
| quickLinks | — | — | — | — |
| onAskPA | — | — | — | — |

## Variants / token groups

### With carousel

One or more featured action items displayed with carousel navigation (dots + prev/next arrows). Shows when featuredItems.length > 0.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Banner surface | --card-primary-bg |  | #f6f9ff | rgba(43,127,255,0.08) |
| Banner border | --card-primary-hover-bd |  | #2173ff | #2b7fff |
| Banner glow shadow | --card-primary-hover-shadow |  | 0 8px 24px rgba(33,115,255,0.20) | 8px 8px 16px 0 rgba(0,0,0,0.08), 0 0 4px 1px rgba(33,115,255,0.4), 0 0 14px 0 rgba(33,115,255,0.15) |
| Inner card surface | --card-purple-bg |  | #f3e9fd | #120520 |
| Inner card border | --card-purple-hover-bd |  | #7b27ed | #a855f7 |
| Primary text | --foreground |  | #1a1a2e | #f0f4ff |
| Secondary text | --field-supporting |  | #6b7280 | #8899aa |

### Empty

No featured items or quick links. Shows greeting + counter only. Useful for first-time users or when no pending actions exist.

| Role | Token / Variable | Figma variable | Light | Dark |
| --- | --- | --- | --- | --- |
| Banner surface | --card-primary-bg |  | #f6f9ff | rgba(43,127,255,0.08) |
| Banner border | --card-primary-hover-bd |  | #2173ff | #2b7fff |

## States / token groups

### Morning

"Good morning, Name." — shown 05:00–11:59. Greeting adapts to local time.

### Afternoon

"Good afternoon, Name." — shown 12:00–17:59.

### Evening

"Good evening, Name." — shown 18:00–04:59.

### 1 item

Single featured item — no carousel dots or prev/next arrows shown.

### N items

Multiple items — carousel with pagination dots, prev/next arrows, and "See all →" link.

### Empty

No items — featured action section hidden entirely. Quick links may still show.

## Additional data

Fields present in the source `_SPEC` object not covered by the sections above:

```json
{
  "componentName": "Home Banner",
  "nodeId": "TBD — pending Figma design"
}
```

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
