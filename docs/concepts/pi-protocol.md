# pi-protocol

Updated: 2026-05-25

## Purpose

pi-protocol is the shared Work Plane contract between independently owned pi-os providers and pi-works instances.

```text
many pi-os providers <-> pi-protocol <-> many pi-works instances
```

The protocol defines how an employer-side pi-works discovers, verifies, hires, uses, and monitors an agent provider without managing the provider internals.

Compatibility note: the external baseline string remains `pi-provider-agent-v0`, and v0 HTTP paths/service metadata still include `pi-api` compatibility names until a later protocol/version rename.

## Scope

In scope:

- provider profile/discovery
- protocol version and baseline
- health/readiness
- provider API authentication behavior
- standard error envelope
- runs/jobs
- sessions
- session messages
- session events
- conversations
- session-level SSE event stream
- cancellation/stop
- work artifacts

Out of scope:

- owner-side credential installation
- agent internal file editing
- model configuration
- skill/extension management
- owner audit by default
- billing/reputation/marketplace in the initial version
- WebSocket duplex protocol in v0

## Baseline principle

`pi-provider-agent-v0` does not use optional protocol endpoint capabilities.

If a provider declares compatibility with a protocol baseline, every communication interface in that baseline is mandatory.

Important rule:

> Protocol baseline interfaces are mandatory. Capabilities/profile data describe the work an agent can perform, not which baseline protocol endpoints it implements.

This keeps pi-works implementation simple and avoids per-provider endpoint branching.

## Proposed baseline: pi-provider-agent-v0

Required communication categories:

```text
provider profile / discovery
health / readiness
auth / standard errors
runs
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

Format:

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

- frontmatter is structured metadata
- markdown body is the human-facing summary
- owner manages this file through the Owner Plane
- pi-works reads it through the Work Plane profile endpoint

Installed skills are read from the agent skills folder, for example:

```text
~/.pi/agent/skills/
```

Skills are always public in v0. There is no `visibility`, `private`, or `public` skill flag. If an owner does not want a skill to appear in the provider profile, it should not be installed in the exposed provider runtime.

Profile endpoints:

```http
GET /.well-known/pi-api/provider
GET /provider/profile
```

v0 may return the same response from both endpoints.

Candidate response shape:

```json
{
  "protocol": {
    "name": "pi-provider",
    "version": "2026-05",
    "baseline": "pi-provider-agent-v0"
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

Candidate endpoint:

```http
GET /health
```

Health should include protocol metadata and operational readiness information.

Candidate response:

```json
{
  "ok": true,
  "service": "pi-api",
  "version": "0.4.0",
  "protocol": {
    "name": "pi-provider",
    "version": "2026-05",
    "baseline": "pi-provider-agent-v0"
  },
  "status": {
    "activeRuns": 1,
    "queuedRuns": 2,
    "maxConcurrentRuns": 3
  }
}
```

## Auth behavior

Initial provider auth may be bearer-token based:

```http
Authorization: Bearer <provider-access-token>
```

Provider access tokens authorize the pi-works to call provider Work Plane APIs. They are distinct from project work credentials installed by the agent owner.

Future versions may add scopes, signed requests, mTLS, or OAuth-style flows, but v0 should keep the baseline simple.

## Standard error envelope

All protocol endpoints should use a predictable error shape.

Candidate shape:

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

Candidate endpoints:

```http
POST /runs
GET /runs/:runId
POST /runs/:runId/cancel
```

A run request may include input, context references, project/repository metadata, constraints, and expected output hints. The provider decides how to execute the work internally.

## Sessions

Sessions are the standard work record and reporting surface.

Candidate endpoints:

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

## Conversations

Conversations allow follow-up instructions and ChatGPT-like interaction.

Candidate endpoints:

```http
GET /conversations/:sessionId
POST /conversations/:sessionId/messages
POST /conversations/:sessionId/stop
```

Conversation semantics should include ordered messages, provider/assistant replies, user/operator messages, queued turn behavior or explicit busy/error behavior, and stop/cancel semantics.

## Communication direction

`pi-provider-agent-v0` separates commands/queries from realtime reporting.

```text
pi-works -> Provider
  HTTP request/response

Provider -> pi-works
  HTTP read APIs
  SSE one-way event stream
```

WebSocket duplex channels are not part of the v0 baseline. They may be introduced later for terminal, interactive shell, voice, collaborative editing, or other low-latency bidirectional extensions.

## Session-level SSE event stream

Realtime event push uses one canonical session-level SSE stream:

```http
GET /sessions/:sessionId/events/stream
```

Conversation events are included in the session event stream. There is no separate conversation stream in v0.

Required semantics:

- ordered events
- stable sequence or cursor
- replay/resume by `afterSeq` or SSE `Last-Event-ID`
- terminal/completion events
- message/turn/run state events

LLM token streaming, if exposed, should be represented as session events such as `message.delta` and `message.completed`. The stream remains one-way provider-to-Control-Center.

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

The following are not baseline Work Plane endpoints:

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

Suggested states:

- `compatible`
- `unsupported`
- `unknown`
- `unreachable`

Compatibility should consider:

- protocol name
- protocol version
- baseline
- required endpoint behavior
- auth success/failure

## Provider protocol package

The protocol should move into a dedicated package before product/repo split:

```text
packages/pi-protocol
```

The package should provide:

- TypeScript types
- TypeBox runtime schemas
- profile/health/error/run/session/conversation/event schemas
- validation/compatibility helpers where useful

Legacy shared Work Plane and pi-works BFF type exports have been folded into `packages/pi-protocol` so the monorepo can split without a transitional shared protocol package.

## Initial implementation implications

Before splitting repositories/products, the current monorepo should harden the provider boundary:

- add `packages/pi-protocol`
- add provider profile file parsing and profile endpoints
- add protocol metadata to health/readiness
- add canonical session SSE stream
- migrate pi-works live relay from WebSocket to SSE
- remove pi-works imports from provider implementation internals
- standardize error envelopes
- classify provider compatibility in pi-works
- move pi-works Agent files out of Work Plane UI and into pi-os-web Owner Plane

## Related documents

- [pi-provider-agent-v0 Interface Definition](../specs/pi-provider-agent-v0.md)
- [Pi Provider Ecosystem](./pi-provider-ecosystem.md)
- [pi-os](./pi-os.md)
- [pi-works](./pi-works.md)
- [Agent Files Owner Plane and Split Readiness Checklist](../plans/agent-files-owner-plane-split-readiness.md)
