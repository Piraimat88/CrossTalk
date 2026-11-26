# UI ↔ Database Mapping

How each Analyst Interface screen gets its data from the CrossTalk database (`src/crosstalk/storage/schema.sql`).

Related issue: #52 · Parent: #11

> **Status: draft.** Values marked *proposed* need to be confirmed by the database and detection owners. See [Open questions](#open-questions).

---

## Terms

| UI term | Database |
|---|---|
| Alert | a row in `detections` |
| Case | a row in `cases` |
| Evidence file | a row in `evidence` |
| Agent | a row in `agents` |
| File (in an alert) | `shared_resources.path`, or `access_events.path_at_event` at the time of the event |

---

## System Overview

| UI element | Source |
|---|---|
| Open alerts | `COUNT(*)` from `detections` where `allowlisted_by IS NULL` and the linked case is not `dismissed` |
| Critical alerts | same, joined to `cases.severity = 'critical'` |
| Open cases | `COUNT(*)` from `cases` where `status IN ('open', 'in_review')` |
| Resolved today | `COUNT(*)` from `cases` where `status IN ('confirmed', 'dismissed')` and `resolved_at` is today |
| Agents monitored | `COUNT(*)` from `agents` |
| Agents with alerts | distinct `access_events.agent_id` linked through `detection_events` to open detections |
| Evidence files | `COUNT(*)` from `evidence` |
| Latest alerts (5 rows) | `detections` ordered by `detected_at DESC`, limit 5 (fields: see Live Alerts) |
| Open cases list | `cases` where `status IN ('open', 'in_review')`, ordered by `created_at DESC` |
| Agents list | `agents.name`, `agents.description` (shown as role), `agents.status`, `agents.last_seen_at` + open alert count per agent |

---

## Live Alerts

### Alert list

| UI column | Source |
|---|---|
| Alert ID | `detections.detection_id` (shown as `AL-<id>`) |
| Event (title) | built from `detections.method` + file name, e.g. "Cross-agent read of notes.txt" |
| Agent(s) | `agents.name` via `detection_events` → `access_events.agent_id` |
| File | `access_events.path_at_event` of the triggering event |
| Time | `detections.detected_at` |
| Severity | `cases.severity` of the linked case (`detections.case_id`) — *see open question 1* |
| Method badge | `detections.method` |

Search: event title, agent name, file path.
Filters: severity, method.

### Alert details

| UI field | Source |
|---|---|
| Method | `detections.method` |
| Score | `detections.score` |
| Agents and roles | `case_agents` of the linked case, or the agents of the triggering `access_events` |
| File | `access_events.path_at_event` |
| Detected | `detections.detected_at` |
| Related case | `detections.case_id` → `cases.case_id`, `cases.status` |
| Why it was flagged | `detections.details` (JSON) — *see open question 2* |
| Allowlisted | `detections.allowlisted_by IS NOT NULL` |

---

## Cases

### Case list

| UI field | Source |
|---|---|
| Case ID | `cases.case_id` (shown as `CT-<id>`) |
| Title | `cases.title` |
| Severity | `cases.severity` |
| Status | `cases.status` |
| Time | `cases.created_at` |

Filters: All / Open (`open`, `in_review`) / Closed (`confirmed`, `dismissed`).

### Case details

| UI field | Source |
|---|---|
| Involved agents + role | `case_agents` → `agents.name`, `case_agents.role` |
| Related file | file of the first triggering event (`access_events.path_at_event`) |
| Opened | `cases.created_at` |
| Assigned to | `cases.assigned_to` → `users.username` |
| Detection reason | `detections.details` of the case's detections + `detections.method` |
| Timeline (max 4 events) | `access_events` linked to the case's detections through `detection_events`, ordered by `occurred_at` |
| Resolution | `cases.resolution`, `cases.resolved_by`, `cases.resolved_at` |
| Evidence count | `COUNT(*)` from `evidence` where `case_id` = this case |

---

## Evidence

### Evidence list

| UI field | Source |
|---|---|
| File name | last part of `evidence.path` |
| Type tag | `evidence.kind` |
| Case | `evidence.case_id` |
| Time | `evidence.captured_at` |

### Evidence viewer

| UI field | Source |
|---|---|
| Path | `evidence.path` |
| Agent | `evidence.source_event_id` → `access_events.agent_id` → `agents.name` |
| Case link | `evidence.case_id` |
| Captured | `evidence.captured_at` |
| Size | `evidence.size_bytes` |
| Integrity | recompute SHA-256 of the file and compare with `evidence.sha256` |
| Content preview | file content read from `evidence.path` by the API (read-only) |
| Highlighted lines | *see open question 4* |

---

## Shared values (proposed)

These values are used by detection, the database and the UI. They must match exactly.

### `detections.method`
| Value | UI label | Meaning |
|---|---|---|
| `provenance` | Cross-agent read | Agent A wrote a file and a different agent B read it |
| `decoy_access` | Decoy touched | An agent read or changed a planted decoy file |
| `message_filename` | Hidden message | A file name looks like a sentence |

### `cases.status`
| Value | UI label |
|---|---|
| `open` | Open |
| `in_review` | In review |
| `confirmed` | Confirmed |
| `dismissed` | Dismissed |

Allowed changes: `open → in_review → confirmed / dismissed`.

### `cases.severity`
`critical`, `high`, `low` → UI labels Critical, High, Low.

### `case_agents.role`
| Value | UI label | Meaning |
|---|---|---|
| `writer` | Wrote | Agent that created or changed the file |
| `reader` | Read | Agent that read the file |
| `accessor` | Accessed | Agent that touched a decoy |

### `evidence.kind`
| Value | UI tag |
|---|---|
| `event_log` | LOG |
| `file_copy` | FILE |
| `diff` | DIFF |
| `manifest` | JSON |

### `access_events.action`
`read`, `write`, `create`, `rename`, `delete`

### `agents.status`
`active`, `blocked`

---

## Open questions

1. **Severity of an alert.** `detections` has no severity column. Should the UI show the severity of the linked case, or should detection set a severity (e.g. from `score`)?
2. **"Why it was flagged" text.** Which keys will `detections.details` contain? Proposal: `{"summary": "<one sentence>", "writer_event_id": .., "reader_event_id": ..}` so the UI can show `summary` directly.
3. **Evidence storage.** The schema stores one `evidence` row per file, while the evidence store issue (#21) describes one folder per case with a manifest hash. Which one does the UI read?
4. **Highlighted lines in evidence.** Should evidence record which lines are linked to the alert, or should the UI skip highlighting for now?
5. **Users and allowlist.** The schema has `users` and `allowlist_rules`, but #20 says permissions and the allowlist live in config. Which is final?
6. **Case-to-event link.** #19 mentions setting `case_id` on events, but `access_events` in the diagram has no `case_id`. Should the UI find a case's events through `detections` → `detection_events` only?
