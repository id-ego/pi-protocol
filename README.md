# @anakonn/pi-protocol

`pi-protocol` is the required compatibility contract between **pi-os** and **pi-works**.

- `pi-os` implements the provider side of the contract.
- `pi-works` consumes the contract to discover providers, validate compatibility, and call Work Plane surfaces.
- `pi-works` must communicate through this package's protocol contracts, not by importing pi-os app code or runtime internals.

This repo publishes the private GitLab Package Registry package `@anakonn/pi-protocol`.

## What belongs here

This repository should contain only shared interface material required for pi-os ↔ pi-works compatibility:

- provider discovery constants
- protocol metadata schemas/types
- health/profile/error/run/session/conversation/event schemas and types
- compatibility helpers that do not depend on pi-os or pi-works app code
- canonical protocol/spec documentation

## What does not belong here

The package should not become a dumping ground for implementation-local types.

Do **not** add:

- pi-os runtime-only implementation details
- pi-os owner-plane-only types
- pi-works browser/UI-only view models
- pi-works BFF implementation internals unless they are part of the pi-os ↔ pi-works contract
- imports from app repositories

The current `1.0.0` split bootstrap still includes some transitional exports that came from the old monorepo shared typing package. Those exports exist to keep the split working, but they should be reviewed and either promoted to stable protocol schemas or moved back into the owning repo.

## Install

```bash
bun add @anakonn/pi-protocol@1.0.0
```

Use `.npmrc.example` as the local/CI registry template. CI should use `CI_JOB_TOKEN`; local development should use a read-package-registry Deploy Token.

## Core constants

```ts
import {
  PI_PROTOCOL_NAME,
  PI_PROTOCOL_VERSION,
  PI_PROVIDER_DISCOVERY_PATH,
} from '@anakonn/pi-protocol';
```

Current values:

```ts
PI_PROTOCOL_NAME = 'pi-protocol';
PI_PROTOCOL_VERSION = '1.0.0';
PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider';
```

Provider metadata uses `name + version` only. The old v0 `baseline` field and `/.well-known/pi-api/provider` discovery path are not part of v1.

## Development

```bash
bun install
bun run typecheck
bun run build
bun run smoke:boundary
bun run pack:check
```

## Release

Releases are tag-based. A `vX.Y.Z` tag publishes `@anakonn/pi-protocol@X.Y.Z` to GitLab Package Registry.

Consumers should pin exact versions, for example:

```json
{
  "dependencies": {
    "@anakonn/pi-protocol": "1.0.0"
  }
}
```

## Spec

- [pi-provider v1](./docs/specs/pi-provider-v1.md)

## Immediate post-split work

The next stabilization step is to grill and decide the public protocol surface:

- Which current exports are truly pi-os ↔ pi-works contract?
- Which exports are pi-os-only and should move to `anakonn/pi-os`?
- Which exports are pi-works-only and should move to `anakonn/pi-works`?
- Which externally observable shapes need TypeBox schemas and drift guards?
