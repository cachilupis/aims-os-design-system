# Process Item

**Figma node:** [`13501:28579`](https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=13501-28579)

One step of a process or workflow, with its state. Use it wherever the current state of a running process needs to be visible — SlideOut and SidePanel content, workflow views, threads. Each item can expand in place to reveal its detail. Not a Stepper: Stepper shows where the user is in a flow they advance themselves; Process Item shows what the system is doing.

## Properties

| Name | Type | Values | Default | Note |
| --- | --- | --- | --- | --- |
| title | string | any string | — | Required. |
| description | string | any string | undefined |  |
| timestamp | string | any string | undefined |  |
| tag | string | any string | undefined | Renders an informative Tag when set. |
| status | Variant | done,loading,error,pending,warning | pending | Drives the icon and its colour. |
| state | Variant | default,selected | default |  |
| number | number | string | 1,2,3 | undefined | Shows a HighlightNumber badge instead of the status icon, for numbered sequences. |
| showLine | Boolean | true,false | false | Vertical connector to the next item. On for every item except the last. |
| showExpand | Boolean | true,false | false | Shows the expand chevron. |
| expanded | Boolean | true,false | false | Expanded state — reveals children in place. |
| onExpand | function | () => void | undefined |  |
| children | node | — | undefined | Slot shown when expanded — logs, payloads, per-step detail. |

## Sizes / scale

| Element | Padding | Gap | Radius | Note |
| --- | --- | --- | --- | --- |
| Status icon | — | 8px | 50% | 16×16 inside a 32×32 slot |
| Number badge | — | 8px | 50% | 28×28 HighlightNumber, replaces the status icon |
| Text block | — | 2px | — | title · description · timestamp stacked |

## Typography

| Element | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Title | Inter | 13px | SemiBold (600) | 1.4 |
| Description | Inter | 12px | Regular (400) | 1.5 |
| Timestamp | Inter | 11px | Regular (400) | 1.4 |

## Variants / token groups

### done

Step finished. Check icon.

CSS prefix: `process`

### loading

Step running now. Animated indicator.

CSS prefix: `process`

### error

Step failed and needs attention.

CSS prefix: `process`

### pending

Step not started yet.

CSS prefix: `process`

### warning

Step completed with something worth flagging.

CSS prefix: `process`

---

_Generated from `src/App.tsx` by `scripts/generate-specs.cjs`. This mirrors the same data the in-app SpecModal renders — edit the `_SPEC` object in `src/App.tsx`, not this file, then re-run the script._
