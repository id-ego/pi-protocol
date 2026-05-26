# @anakonn/pi-protocol

`pi-protocol` is the required compatibility contract between **pi-os** and **pi-works**.

- `pi-os` implements the provider side of the contract.
- `pi-works` consumes the contract to discover providers, validate compatibility, and call Work Plane surfaces.
- `pi-works` must communicate through this package's protocol contracts, not by importing pi-os app code or runtime internals.

The package is published publicly to npm as `@anakonn/pi-protocol`. Canonical development happens in Anakonn GitLab; GitHub is the public mirror and public feedback channel.

## What belongs here

This repository should contain only shared interface material required for pi-os ↔ pi-works compatibility:

- provider discovery constants
- protocol metadata schemas/types
- health/profile/error/run/repository/session/conversation/event schemas and types
- creator helpers for pi-os provider responses/events/errors
- consumer helpers for pi-works discovery, compatibility, and parsing
- framework-neutral CLI contract tools
- canonical protocol/spec documentation

## What does not belong here

The package should not become a dumping ground for implementation-local types.

Do **not** add:

- pi-os runtime-only implementation details
- pi-os owner-plane-only types
- pi-works browser/UI-only view models
- pi-works BFF implementation internals unless they are part of the pi-os ↔ pi-works contract
- imports from app repositories

Transitional exports from the old monorepo shared typing package are not part of the stable public surface. App-local pi-os runtime types and pi-works BFF/UI view models belong in their owning repos.

## Install

```bash
bun add @anakonn/pi-protocol@1.2.0
# or
npm install @anakonn/pi-protocol@1.2.0
```

Consumers should pin exact versions.

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
PI_PROTOCOL_VERSION = '1.1.0';
PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider';
```

Provider metadata uses `name + version` only. The old v0 `baseline` field and `/.well-known/pi-api/provider` discovery path are not part of v1.

## SDK usage

```ts
import {
  createProviderHealth,
  parseProviderProfile,
  providerDiscoveryUrl,
} from '@anakonn/pi-protocol';
```

- Creator helpers such as `createProviderHealth` help pi-os build schema-valid provider responses.
- Consumer helpers such as `parseProviderProfile` help pi-works validate provider responses before use.
- URL helpers such as `providerDiscoveryUrl` keep endpoint construction aligned with the spec.

## CLI

```bash
pi-protocol init-provider ./fixtures
pi-protocol validate ./fixtures
pi-protocol inspect-provider http://localhost:3000
pi-protocol inspect-provider http://localhost:3000 --create-run --token "$PI_PROVIDER_TOKEN" --json
pi-protocol inspect-provider http://localhost:3000 --create-run --git-url git@gitlab.anakonn.com:anakonn/pi-os.git --token "$PI_PROVIDER_TOKEN"
```

`inspect-provider` read-only mode checks discovery/profile/health. Full contract mode uses `--create-run` because it calls side-effect endpoints.

## Development

```bash
bun install
bun run typecheck
bun run build
bun run pack:check
```

## Release

Releases are tag-based. A protected `vX.Y.Z` tag publishes `@anakonn/pi-protocol@X.Y.Z` to public npm from GitLab CI.

Required release setup:

- npm `@anakonn` scope/package publish permission
- `NPM_TOKEN` as a masked/protected GitLab CI variable
- package `version` must match the release tag without the leading `v`

Consumers should pin exact versions, for example:

```json
{
  "dependencies": {
    "@anakonn/pi-protocol": "1.2.0"
  }
}
```

## Spec

- [pi-protocol v1 provider interface](./docs/specs/pi-provider-v1.md)

## Rules

- [pi-protocol SDK boundary and contract ownership](./docs/rules/pi-protocol-sdk-boundary.md)
