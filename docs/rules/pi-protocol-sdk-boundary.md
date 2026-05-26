---
title: pi-protocol SDK boundary and contract ownership
status: active
summary: pi-protocol owns only the stable pi-os provider to pi-works consumer wire contract, SDK helpers, CLI contract checks, and canonical specs; app/runtime/BFF internals must stay in owning repos.
updated_at: 2026-05-26
---

# pi-protocol SDK boundary and contract ownership

## Decision

`pi-protocol` is the required compatibility contract between independently maintained `pi-os` providers and `pi-works` consumers/orchestrators.

The package may provide:

- protocol constants
- endpoint/path constants
- TypeBox schemas
- inferred TypeScript types
- validators and assertions
- creator helpers for `pi-os` provider implementations
- consumer helpers for `pi-works` discovery, compatibility, and parsing
- framework-neutral CLI tools for skeleton/fixture generation and provider contract checks
- canonical protocol/spec documentation

The package must not include:

- `pi-os` runtime/server/router/session engine implementation
- `pi-os` owner-plane-only implementation details
- `pi-works` browser/UI-only view models
- `pi-works` BFF implementation internals unless they are part of the pi-os ↔ pi-works wire contract
- DB models, queue/runtime policies, credential storage/rotation policy, or app-specific auth storage
- imports from `pi-os`, `pi-works`, or other app repositories

## Stable public contract

Stable public contract means externally observable wire/API material that a `pi-os` provider exposes and a `pi-works` consumer must understand.

Stable contract includes HTTP/SSE request and response shapes, protocol metadata, standard error envelope, run/session/conversation/event shapes, and compatibility classification needed for provider discovery and use.

Transitional shared types from the old monorepo split are not stable by default. Each such export must be either:

1. promoted to stable protocol schema/type if it is part of the cross-repo wire contract;
2. moved to `anakonn/pi-os` if it is provider/runtime/owner-plane implementation detail;
3. moved to `anakonn/pi-works` if it is consumer/BFF/UI implementation detail; or
4. removed.

Do not create a long-lived `compat` area for transitional exports unless a future explicit versioning decision approves it.

## Current v1 constants and metadata

The current v1 constants are protocol constants, not environment configuration:

- `PI_PROTOCOL_NAME = 'pi-protocol'`
- `PI_PROTOCOL_VERSION = '1.1.0'`
- `PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider'`

Current v1 provider metadata uses `name + version` only.

Do not reintroduce the old `baseline` field or the old `/.well-known/pi-api/provider` discovery path unless an explicit future protocol versioning decision approves a compatibility mode.

## SDK and CLI shape

The SDK should be organized around these responsibilities:

- `core`: stable schemas, types, constants, endpoint/path constants, validators, assertions
- `creator`: provider-side builders/helpers for `pi-os` implementations
- `consumer`: consumer-side discovery, compatibility, and parse helpers for `pi-works`
- `cli`: framework-neutral tooling for generation and contract checks

The CLI may generate framework-neutral TypeScript skeletons/fixtures and validate provider compatibility. It must not become a provider server/runtime.

`inspect-provider` style full contract checks may call side-effect endpoints only through explicit opt-in flags such as `--create-run`, and must avoid leaking bearer tokens or other secrets in logs/JSON output.

## Validation expectations

Before merging protocol package changes, run the project validation set where applicable:

```bash
bun run typecheck
bun run build
bun run pack:check
```

Breaking contract changes require explicit versioning decisions and exact-version consumer migration planning.
