# Agent Instructions

## Project workflow

For non-trivial work, run the 3R Gate first and follow any required rules/refs/research evidence workflow.

Current recurring project constraints:

- `pi-protocol` owns the `@anakonn/pi-protocol` package, TypeBox schemas, inferred types, protocol constants, and canonical provider discovery/spec docs.
- Keep the package free of app imports and repo-local app code.
- `PI_PROTOCOL_NAME`, `PI_PROTOCOL_VERSION`, and `PI_PROVIDER_DISCOVERY_PATH` are protocol constants, not environment configuration.
- Current v1 discovery path is `/.well-known/pi-provider`; do not reintroduce `/.well-known/pi-api/provider` unless explicitly requested as a versioned compatibility decision.
- Current v1 metadata uses `name + version`; do not reintroduce the old `baseline` field unless explicitly requested as a protocol versioning decision.
- Publish `@anakonn/pi-protocol` through GitLab Package Registry using tag-based releases.
- Keep package consumers on exact versions; breaking/contract changes require explicit versioning decisions.
- Prefer small vertical slices with validation (`bun run typecheck`, `bun run build`, package smoke/boundary checks) before opening or merging MRs.
