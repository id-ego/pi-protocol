# @anakonn/pi-protocol

Private GitLab Package Registry package for the pi-protocol v1 contract.

`pi-protocol` is the required compatibility contract for communication between `pi-os` providers and `pi-works` consumers/orchestrators. `pi-os` implements the provider side of the contract; `pi-works` uses the contract to discover providers, validate compatibility, and call Work Plane surfaces without importing pi-os app internals.

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

## Stability

The core protocol constants and externally observable schemas define pi-protocol v1. Some transitional Work Plane/BFF helper types remain exported for split bootstrap and may be consolidated in follow-up schema work before wider publication.

## Spec

- [pi-provider v1](./docs/specs/pi-provider-v1.md)
