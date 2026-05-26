# pi-protocol

Updated: 2026-05-26

## Purpose

`pi-protocol` is the shared Work Plane contract between independently owned `pi-os` providers and `pi-works` consumers/orchestrators.

```text
many pi-os providers <-> pi-protocol <-> many pi-works instances
```

The protocol defines how a `pi-works` instance discovers, verifies, hires, uses, and monitors an agent provider without managing provider internals.

## Scope

In scope:

- provider profile/discovery
- protocol metadata: `name + version`
- health/readiness
- provider API authentication behavior
- standard error envelope
- runs/jobs
- repositories
- sessions
- session messages
- session events
- conversations
- session-level SSE event stream
- cancellation/stop
- work artifacts
- SDK helpers and framework-neutral CLI contract checks

Out of scope:

- owner-side credential installation
- agent internal file editing
- model configuration
- skill/extension management
- owner audit by default
- billing/reputation/marketplace in the initial version
- WebSocket duplex protocol in v1
- pi-os runtime/server/router/session engine implementation
- pi-works UI/BFF view models

## v1 constants and metadata

Current v1 constants:

```ts
PI_PROTOCOL_NAME = 'pi-protocol';
PI_PROTOCOL_VERSION = '1.1.0';
PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider';
```

Current v1 provider metadata uses `name + version` only:

```json
{
  "name": "pi-protocol",
  "version": "1.1.0"
}
```

The old `baseline` field and old `/.well-known/pi-api/provider` discovery path are not part of v1.

## Mandatory interface principle

`pi-protocol` v1 does not use optional protocol endpoint capabilities.

If a provider declares compatibility with `pi-protocol@1.1.0`, every communication interface in that version is mandatory.

Important rule:

> Protocol version interfaces are mandatory. Capabilities/profile data describe the work an agent can perform, not which version protocol endpoints it implements.

This keeps pi-works implementation simple and avoids per-provider endpoint branching.

Required communication categories:

```text
provider profile / discovery
health / readiness
auth / standard errors
runs
repositories
sessions
session messages
session events
conversations
session-level SSE event stream
cancellation / stop
```

## Provider Profile

Provider Profile is the agent's LinkedIn-style profile plus installed skills list.

The profile is owner-managed and file-based:

```text
~/.pi/agent/PROFILE.md
```

Installed skills are read from the agent skills folder, for example:

```text
~/.pi/agent/skills/
```

Skills are always public in v1. There is no `visibility`, `private`, or `public` skill flag. If an owner does not want a skill to appear in the provider profile, it should not be installed in the exposed provider runtime.

Profile endpoints:

```http
GET /.well-known/pi-provider
GET /provider/profile
```

Both endpoints may return the same response.

Response shape:

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

## Health and readiness

Health tells pi-works whether the provider is alive and ready for work.

```http
GET /health
```

Health includes protocol metadata and operational readiness information.

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

## Auth behavior

Initial provider auth is bearer-token based:

```http
Authorization: Bearer <provider-access-token>
```

Provider access tokens authorize pi-works to call provider Work Plane APIs. They are distinct from project work credentials installed by the agent owner.

Future versions may add scopes, signed requests, mTLS, or OAuth-style flows, but v1 keeps the protocol simple.

## Standard error envelope

All protocol endpoints should use a predictable error shape.

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

Required fields:

- `code`
- `message`
- `retryable`
- `details`

## Runs/jobs

Runs are the basic unit of assigned work.

```http
POST /runs
GET /runs/:runId
POST /runs/:runId/cancel
```

A run request includes required `input` and may include optional top-level `gitUrl`, context references, constraints, and expected output hints. `gitUrl` must use scp-like SSH syntax, for example `git@gitlab.anakonn.com:anakonn/pi-works.git`. When present, the provider may associate the run/session with a first-class repository record and return `repositoryId` in the run response.

## Repositories

Repositories are first-class records for repository-oriented work.

```http
GET /repositories?gitUrl=git@gitlab.anakonn.com%3Aanakonn%2Fpi-works.git
GET /repositories/:repositoryId/sessions
```

`GET /repositories` returns `{ repositories, nextCursor }`. `GET /repositories/:repositoryId/sessions` returns the same session list shape as `GET /sessions`.

## Sessions

Sessions are the standard work record and reporting surface.

```http
GET /sessions
GET /sessions/:sessionId
GET /sessions/:sessionId/messages
GET /sessions/:sessionId/events
```

pi-works should be able to reconstruct progress, transcript, and state from session data without reading provider internals.

## Status queries vs AI conversation

Intermediate status queries are not answered by AI.

Status/query endpoints are:

- read-only
- deterministic
- side-effect free
- backed by DB/runtime state/event log

Examples:

```http
GET /runs/:runId
GET /sessions/:sessionId
GET /sessions/:sessionId/messages
GET /sessions/:sessionId/events
GET /conversations/:sessionId
```

Conversation commands are different. They may create a new turn and trigger AI/agent work.

```http
POST /conversations/:sessionId/messages
POST /conversations/:sessionId/stop
```

## Communication direction

`pi-protocol` v1 separates commands/queries from realtime reporting.

```text
pi-works -> Provider
  HTTP request/response

Provider -> pi-works
  HTTP read APIs
  SSE one-way event stream
```

WebSocket duplex channels are not part of v1. They may be introduced later for terminal, interactive shell, voice, collaborative editing, or other low-latency bidirectional extensions.

## Session-level SSE event stream

Realtime event push uses one canonical session-level SSE stream:

```http
GET /sessions/:sessionId/events/stream
```

Conversation events are included in the session event stream. There is no separate conversation stream in v1.

Required semantics:

- ordered events
- stable sequence or cursor
- replay/resume by `afterSeq` or SSE `Last-Event-ID`
- terminal/completion events
- message/turn/run state events

LLM token streaming, if exposed, should be represented as session events such as `message.delta` and `message.completed`. The stream remains one-way provider-to-pi-works.

## Work artifacts

Work artifacts are employer-visible outputs created as part of assigned work.

Examples:

- transcript
- result summary
- patch or diff summary
- merge request URL
- generated report
- explicit output files

Work artifacts are distinct from provider internal files.

## Owner management is not protocol work surface

The following are not v1 Work Plane endpoints:

- edit agent files
- install credentials
- configure models
- configure skills/extensions
- change provider filesystem allowlist
- modify provider policy
- read owner audit by default

Those belong to pi-os Owner Plane. A provider may expose owner APIs locally or through an owner console, but pi-works should not rely on them for ordinary employer operation.

## Compatibility states

pi-works should classify providers after discovery/health checks.

States:

- `compatible`
- `unsupported`
- `unknown`
- `unreachable`

Compatibility should consider:

- protocol name
- protocol version
- required endpoint behavior
- auth success/failure

## Provider protocol package

The package provides:

- TypeScript types
- TypeBox runtime schemas
- profile/health/error/run/session/conversation/event schemas
- creator helpers for pi-os provider responses
- consumer helpers for pi-works discovery, compatibility, and parsing
- framework-neutral CLI tools for fixture generation, validation, and live provider contract checks

Transitional Work Plane and pi-works BFF type exports are not part of the stable public package surface. App-local types belong in the owning repo.

## Related documents

- [pi-protocol v1 Provider Interface Definition](../specs/pi-provider-v1.md)
- [pi-protocol SDK boundary and contract ownership](../rules/pi-protocol-sdk-boundary.md)
