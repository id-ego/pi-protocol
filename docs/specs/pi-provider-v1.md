# pi-protocol v1 Provider Interface Definition

Updated: 2026-05-26

## Status

Current v1 specification for the **pi-protocol Foundation** milestone.

This document is the canonical Markdown source of truth for the `pi-protocol` v1 Work Plane interface. The companion light-mode HTML rendering is [`pi-provider-v1.html`](./pi-provider-v1.html).

## Core rules

1. **Protocol version interfaces are mandatory.** A provider that declares `pi-protocol@1.1.0` compatibility must implement every interface in this document.
2. **Capabilities are not endpoint toggles.** Provider profile and installed skills describe what work the agent can perform; they do not describe which version endpoints exist.
3. **pi-works does not manage provider internals.** Agent files, credential installation, model config, skills/extensions management, and owner audit belong to the pi-os Owner Plane.
4. **Commands and queries use HTTP.** pi-works sends work commands and read queries through HTTP request/response.
5. **Realtime reporting uses SSE.** Provider-to-pi-works realtime events use one canonical session-level SSE stream.
6. **Status queries are not AI conversations.** Status endpoints are read-only, deterministic, side-effect free, and backed by DB/runtime state/event log.

## Protocol constants

| Field | Value |
|---|---|
| Protocol name | `pi-protocol` |
| Protocol version | `1.1.0` |
| Discovery path | `/.well-known/pi-provider` |
| Metadata shape | `name + version` |
| Realtime transport | Server-Sent Events (SSE) |
| Duplex WebSocket | Not part of v1 |

The old `baseline` field and old `/.well-known/pi-api/provider` discovery path are not part of v1.

## Required interfaces

| Area | Method/path | Purpose |
|---|---|---|
| Provider Profile | `GET /.well-known/pi-provider` | Discovery endpoint for registering/verifying providers. |
| Provider Profile | `GET /provider/profile` | Explicit profile API endpoint. May return the same response as well-known discovery. |
| Health | `GET /health` | Provider liveness/readiness and protocol metadata. |
| Runs | `POST /runs` | Create a new assigned work run. |
| Runs | `GET /runs/:runId` | Read run status. |
| Runs | `POST /runs/:runId/cancel` | Request cancellation of a run. |
| Repositories | `GET /repositories` | List or lookup known repositories by `gitUrl`. |
| Repositories | `GET /repositories/:repositoryId/sessions` | List sessions associated with a repository. |
| Sessions | `GET /sessions` | List sessions. |
| Sessions | `GET /sessions/:sessionId` | Read session status and metadata. |
| Messages | `GET /sessions/:sessionId/messages` | Read session messages/transcript. |
| Events | `GET /sessions/:sessionId/events` | Read ordered session events, optionally by cursor. |
| Conversation | `GET /conversations/:sessionId` | Read conversation projection/state. |
| Conversation | `POST /conversations/:sessionId/messages` | Send a user/operator message and create/queue agent work. |
| Conversation | `POST /conversations/:sessionId/stop` | Stop current conversation generation/work for the session. |
| Realtime | `GET /sessions/:sessionId/events/stream` | Canonical one-way SSE stream for session events. |

## Authentication

Initial v1 authentication is bearer token based.

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

Installed skills source:

```text
~/.pi/agent/skills/
```

Installed skills are always public in v1. There is no `visibility`, `private`, or `public` skill flag.

### Response

```json
{
  "protocol": {
    "name": "pi-protocol",
    "version": "1.1.0"
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
  "service": "pi-os-provider",
  "version": "0.4.0",
  "protocol": {
    "name": "pi-protocol",
    "version": "1.1.0"
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
  "gitUrl": "git@gitlab.anakonn.com:anakonn/pi-works.git",
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
  "repositoryId": "repository_123",
  "createdAt": "2026-05-25T00:00:00.000Z"
}
```

`gitUrl` is optional. When present, it must use scp-like SSH syntax:

```text
git@gitlab.anakonn.com:anakonn/pi-works.git
```

Providers must reject `https://...`, `ssh://...`, and other non scp-like SSH forms for `gitUrl` in v1. `input` remains required. A provider that accepts `gitUrl` should prepare the run in the cloned repository working tree before invoking the agent.

### Read run

```http
GET /runs/:runId
```

### Cancel run

```http
POST /runs/:runId/cancel
```

Cancellation is a request. Providers should return the resulting run state or a standard error if cancellation is impossible.

## Repositories

Repositories are first-class records for repository-oriented work. They identify git remotes used by runs and provide a stable lookup point for repository-associated sessions.

### Repository shape

```json
{
  "id": "repository_123",
  "gitUrl": "git@gitlab.anakonn.com:anakonn/pi-works.git",
  "host": "gitlab.anakonn.com",
  "path": "anakonn/pi-works",
  "name": "pi-works",
  "createdAt": "2026-05-25T00:00:00.000Z",
  "updatedAt": "2026-05-25T00:00:00.000Z"
}
```

`gitUrl` is unique and must use scp-like SSH syntax. `host`, `path`, and `name` are parsed from `gitUrl`.

### List or lookup repositories

```http
GET /repositories?gitUrl=git@gitlab.anakonn.com%3Aanakonn%2Fpi-works.git
```

Example response:

```json
{
  "repositories": [],
  "nextCursor": null
}
```

When `gitUrl` is provided, the result contains zero or one repository because `gitUrl` is unique.

### List repository sessions

```http
GET /repositories/:repositoryId/sessions?limit=25&cursor=<cursor>
```

Response shape is the same as `GET /sessions`.

## Sessions

Sessions are the canonical work record.

### List sessions

```http
GET /sessions?limit=25&cursor=<cursor>
```

Example response:

```json
{
  "sessions": [],
  "nextCursor": null
}
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
  "createdAt": "2026-05-25T00:00:00.000Z",
  "updatedAt": "2026-05-25T00:01:00.000Z"
}
```

Session reads are status queries. They must not call AI or create new turns.

## Session messages

```http
GET /sessions/:sessionId/messages?limit=100&cursor=<cursor>
```

Messages are transcript records. They are distinct from lower-level events.

Example response:

```json
{
  "messages": [
    {
      "id": "message_123",
      "sessionId": "session_123",
      "role": "assistant",
      "content": "I found the failing test and will update the implementation.",
      "createdAt": "2026-05-25T00:01:00.000Z"
    }
  ],
  "nextCursor": null
}
```

## Session events

```http
GET /sessions/:sessionId/events?afterSeq=42&limit=100
```

Events are ordered records of state changes and progress.

Example response:

```json
{
  "events": [
    {
      "seq": 43,
      "sessionId": "session_123",
      "type": "turn.started",
      "payload": {
        "turnId": "turn_123"
      },
      "createdAt": "2026-05-25T00:01:00.000Z"
    }
  ],
  "nextSeq": null
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

Example response:

```json
{
  "sessionId": "session_123",
  "status": "idle",
  "messages": [],
  "lastEventSeq": 42
}
```

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

Example response:

```json
{
  "ok": true,
  "stoppedCurrent": true,
  "cancelledQueued": 0
}
```

Stop requests the provider to stop the current conversation generation/work for the session.

## Session SSE event stream

```http
GET /sessions/:sessionId/events/stream?afterSeq=42
Accept: text/event-stream
```

The SSE stream is the canonical realtime provider-to-pi-works event stream. It is one-way. pi-works commands still use HTTP.

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
data: {"seq":43,"sessionId":"session_123","type":"turn.started","payload":{"turnId":"turn_123"},"createdAt":"2026-05-25T00:01:00.000Z"}
```

A provider should send a replay/live boundary event after initial replay completes.

```text
event: session.replay_complete
id: 45
data: {"seq":45,"sessionId":"session_123","type":"session.replay_complete","createdAt":"2026-05-25T00:01:01.000Z"}
```

## Event taxonomy

The exact event taxonomy may grow, but v1 should support at least these categories:

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

## Explicitly not Work Plane v1

The following are Owner Plane responsibilities and are excluded from `pi-protocol` v1 Work Plane:

- Agent files editing
- credential installation
- model config
- skills/extensions management
- provider filesystem allowlist
- owner audit
- provider runtime policy changes

Current pi-works Agent files UI is transitional owner-plane functionality and should eventually move to pi-os Owner Console.
