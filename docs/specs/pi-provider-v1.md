# pi-provider-v1 Interface Definition

Updated: 1.0.0-23

## Status

Draft version specification for the **pi-protocol Foundation** milestone.

This document is the canonical Markdown source of truth for the `pi-provider-v1` Work Plane interface. The companion light-mode HTML rendering is [`pi-provider-v1.html`](./pi-provider-v1.html).

## Core rules

1. **Baseline interfaces are mandatory.** A provider that declares `pi-provider-v1` compatibility must implement every interface in this document.
2. **Capabilities are not endpoint toggles.** Provider profile and installed skills describe what work the agent can perform; they do not describe which version endpoints exist.
3. **pi-works does not manage provider internals.** Agent files, credential installation, model config, skills/extensions management, and owner audit belong to the pi-os Owner Plane.
4. **Commands and queries use HTTP.** pi-works sends work commands and read queries through HTTP request/response.
5. **Realtime reporting uses SSE.** Provider-to-pi-works realtime events use one canonical session-level SSE stream.
6. **Status queries are not AI conversations.** Status endpoints are read-only, deterministic, side-effect free, and backed by DB/runtime state/event log.

## Protocol constants

| Field | Value |
|---|---|
| Protocol name | `pi-provider` |
| Baseline | `pi-provider-v1` |
| Version format | date-like string, e.g. `1.0.0` |
| Realtime transport | Server-Sent Events (SSE) |
| Duplex WebSocket | Not part of v0 version |

## Required interfaces

| Area | Method/path | Purpose |
|---|---|---|
| Provider Profile | `GET /.well-known/pi-provider` | Discovery endpoint for registering/verifying providers. |
| Provider Profile | `GET /provider/profile` | Explicit profile API endpoint. May return the same response as well-known in v0. |
| Health | `GET /health` | Provider liveness/readiness and protocol metadata. |
| Runs | `POST /runs` | Create a new assigned work run. |
| Runs | `GET /runs/:runId` | Read run status. |
| Runs | `POST /runs/:runId/cancel` | Request cancellation of a run. |
| Sessions | `GET /sessions` | List sessions. |
| Sessions | `GET /sessions/:sessionId` | Read session status and metadata. |
| Messages | `GET /sessions/:sessionId/messages` | Read session messages/transcript. |
| Events | `GET /sessions/:sessionId/events` | Read ordered session events, optionally by cursor. |
| Conversation | `GET /conversations/:sessionId` | Read conversation projection/state. |
| Conversation | `POST /conversations/:sessionId/messages` | Send a user/operator message and create/queue agent work. |
| Conversation | `POST /conversations/:sessionId/stop` | Stop current conversation generation/work for the session. |
| Realtime | `GET /sessions/:sessionId/events/stream` | Canonical one-way SSE stream for session events. |

## Authentication

Initial v0 authentication is bearer token based.

```http
Authorization: Bearer <provider-access-token>
```

Provider access tokens authorize a pi-works to call the provider Work Plane API. They are distinct from project work credentials installed by the agent owner.

All endpoints except explicitly public discovery/health endpoints may require provider authentication. Whether profile/health require auth is a provider deployment decision, but authenticated access must be supported for all Work Plane operations.

## Standard error envelope

All protocol endpoints should return the same error envelope for non-2xx failures.

```json
{
  "error": {
    "code": "provider.unavailable",
    "message": "Provider is temporarily unavailable",
    "retryable": true,
    "details": {}
  }
}
```

| Field | Type | Required | Notes |
|---|---|---:|---|
| `error.code` | string | yes | Stable machine-readable code. |
| `error.message` | string | yes | Human-readable summary. |
| `error.retryable` | boolean | yes | Whether retrying may succeed. |
| `error.details` | object | yes | Structured details. Must not contain token plaintext/encrypted material. |

## Provider Profile

Provider Profile is the agent's LinkedIn-style profile plus installed skills list.

Profile source:

```text
~/.pi/agent/PROFILE.md
```

Profile format:

```md
---
id: ego-agent
displayName: Ego Coding Agent
headline: General coding and operations agent
operator:
  name: ego
  contact: mrego@anakonn.com
links:
  - label: Homepage
    url: https://example.com
---

I help implement GitLab issues, debug TypeScript/SvelteKit apps, and maintain Docker/Postgres services.
```

Skills source:

```text
~/.pi/agent/skills/
```

Installed skills are always public in v0. There is no `visibility`, `private`, or `public` skill flag.

### Response

```json
{
  "protocol": {
    "name": "pi-provider",
    "version": "1.0.0",
    "version": "pi-provider-v1"
  },
  "profile": {
    "id": "ego-agent",
    "displayName": "Ego Coding Agent",
    "headline": "General coding and operations agent",
    "summary": "I help implement GitLab issues and maintain SvelteKit apps.",
    "operator": {
      "name": "ego",
      "contact": "mrego@anakonn.com"
    },
    "links": []
  },
  "skills": [
    {
      "name": "architecture-review",
      "description": "Reviews module boundaries and architecture friction."
    }
  ]
}
```

## Health / Readiness

```http
GET /health
```

### Response

```json
{
  "ok": true,
  "service": "pi-api",
  "version": "0.4.0",
  "protocol": {
    "name": "pi-provider",
    "version": "1.0.0",
    "version": "pi-provider-v1"
  },
  "status": {
    "readiness": "ready",
    "activeRuns": 1,
    "queuedRuns": 2,
    "maxConcurrentRuns": 3
  }
}
```

`ok: true` means the provider service is alive. `status.readiness` tells whether it is ready to accept work.

## Runs

Runs are assigned units of work.

### Create run

```http
POST /runs
Content-Type: application/json
```

Example request:

```json
{
  "input": "Implement the selected issue.",
  "context": {
    "source": "gitlab.issue",
    "url": "https://gitlab.example.com/group/project/-/issues/123"
  },
  "constraints": {
    "canCreateMergeRequest": true
  }
}
```

Example response:

```json
{
  "id": "run_123",
  "status": "queued",
  "sessionId": "session_123",
  "createdAt": "1.0.0-23T00:00:00.000Z"
}
```

### Read run

```http
GET /runs/:runId
```

### Cancel run

```http
POST /runs/:runId/cancel
```

Cancellation is a request. Providers should return the resulting run state or a standard error if cancellation is impossible.

## Sessions

Sessions are the canonical work record.

### List sessions

```http
GET /sessions?limit=25&cursor=<cursor>
```

### Read session

```http
GET /sessions/:sessionId
```

Example response:

```json
{
  "id": "session_123",
  "runId": "run_123",
  "status": "running",
  "activity": "active",
  "lastEventSeq": 42,
  "createdAt": "1.0.0-23T00:00:00.000Z",
  "updatedAt": "1.0.0-23T00:01:00.000Z"
}
```

Session reads are status queries. They must not call AI or create new turns.

## Session messages

```http
GET /sessions/:sessionId/messages?limit=100&cursor=<cursor>
```

Messages are transcript records. They are distinct from lower-level events.

Example message:

```json
{
  "id": "message_123",
  "sessionId": "session_123",
  "role": "assistant",
  "content": "I found the failing test and will update the implementation.",
  "createdAt": "1.0.0-23T00:01:00.000Z"
}
```

## Session events

```http
GET /sessions/:sessionId/events?afterSeq=42&limit=100
```

Events are ordered records of state changes and progress.

Example event:

```json
{
  "seq": 43,
  "sessionId": "session_123",
  "type": "turn.started",
  "payload": {
    "turnId": "turn_123"
  },
  "createdAt": "1.0.0-23T00:01:00.000Z"
}
```

Required semantics:

- `seq` is stable and monotonically increasing within a session.
- `afterSeq` returns events with `seq > afterSeq`.
- Event payloads must not contain token plaintext/encrypted credential material.

## Conversation

Conversation endpoints are the ChatGPT-like interaction surface.

### Read conversation

```http
GET /conversations/:sessionId
```

This is a read-only projection. It must not call AI.

### Send message

```http
POST /conversations/:sessionId/messages
Content-Type: application/json
```

Example request:

```json
{
  "content": "Please add tests before opening the merge request."
}
```

Example response:

```json
{
  "accepted": true,
  "sessionId": "session_123",
  "messageId": "message_456",
  "turnId": "turn_456",
  "status": "queued"
}
```

This endpoint may create or queue a new turn and trigger AI/agent work.

### Stop conversation work

```http
POST /conversations/:sessionId/stop
```

Stop requests the provider to stop the current conversation generation/work for the session.

## Session SSE event stream

```http
GET /sessions/:sessionId/events/stream?afterSeq=42
Accept: text/event-stream
```

The SSE stream is the canonical realtime provider-to-Control-Center event stream. It is one-way. pi-works commands still use HTTP.

### Resume

A client may resume using either query parameter or SSE header:

```http
GET /sessions/:sessionId/events/stream?afterSeq=42
```

or:

```http
Last-Event-ID: 42
```

The provider sends events with `seq > 42`.

### Event format

```text
event: session.event
id: 43
data: {"seq":43,"type":"turn.started","payload":{"turnId":"turn_123"},"createdAt":"1.0.0-23T00:01:00.000Z"}
```

A provider should send a replay/live boundary event after initial replay completes.

```text
event: session.replay_complete
id: 45
data: {"seq":45,"type":"session.replay_complete"}
```

## Event taxonomy

The exact event taxonomy may grow, but v0 should support at least these categories:

| Category | Examples |
|---|---|
| Run | `run.started`, `run.completed`, `run.failed`, `run.cancelled` |
| Turn | `turn.started`, `turn.completed`, `turn.failed`, `turn.stopped` |
| Message | `message.created`, `message.delta`, `message.completed` |
| Tool/progress | `tool.started`, `tool.completed`, `tool.failed` |
| Session | `session.updated`, `session.replay_complete` |

## Work artifacts

Work artifacts are employer-visible outputs created as part of assigned work, such as transcript, result summary, patch/diff summary, merge request URL, generated report, or explicit output files.

Provider internal files are not work artifacts by default.

## Explicitly not Work Plane version

The following are Owner Plane responsibilities and are excluded from `pi-provider-v1` Work Plane version:

- Agent files editing
- credential installation
- model config
- skills/extensions management
- provider filesystem allowlist
- owner audit
- provider runtime policy changes

Current pi-works Agent files UI is transitional owner-plane functionality and should eventually move to pi-os Owner Console.
