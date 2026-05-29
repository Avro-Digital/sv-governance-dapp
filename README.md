# SV Governance dApp

[![Lint](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml/badge.svg)](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml)
[![Tests](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml/badge.svg)](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml)
[![Release](https://img.shields.io/github/v/release/Avro-Digital/sv-governance-dapp?label=release)](https://github.com/Avro-Digital/sv-governance-dapp/releases)
[![License](https://img.shields.io/github/license/Avro-Digital/sv-governance-dapp)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](#development)

Standalone application for Canton Super Validators to cast governance votes via externally-signed wallet flows.

## Status

**Work in progress** — funded by the [Canton Foundation Development Fund](https://github.com/canton-foundation/canton-dev-fund) under [grant proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223). Current focus: [Milestone 2 — External Signing Proof of Concept](https://github.com/canton-foundation/canton-dev-fund/issues/287).

## About

This dApp lets Super Validators (SVs) review pending governance proposals and cast votes without relying on the full SV operator application. It is designed for wallet-gateway-backed external signing, enabling SV operators to approve governance actions through their preferred Canton wallet rather than in-app credentials alone.

The UI will be extracted and adapted from the governance views in the [Splice SV operator app](https://github.com/canton-network/splice) (`apps/sv/frontend/`), keeping visual and interaction parity while running as a standalone frontend.

## Grant context

| Link | Description |
| --- | --- |
| [PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) | Grant proposal — SV Governance dApp with external signing |
| [Issue #287](https://github.com/canton-foundation/canton-dev-fund/issues/287) | Milestone 2 — External Signing Proof of Concept |

Milestone 2 will demonstrate an end-to-end externally signed non-operational governance vote recorded on-chain, integrated with `@canton-network/dapp-sdk` and a wallet-gateway signing path.

## Attribution

UI components in this repository are extracted and adapted from the [Splice project](https://github.com/canton-network/splice) (Apache 2.0, © Digital Asset). See [NOTICE](./NOTICE) and per-file headers for details.

## Development

Requires **Node 20+** and **pnpm**.

```bash
pnpm install
pnpm dev        # start dev server (http://localhost:5173)
pnpm test       # run Vitest
pnpm build      # production build → dist/
pnpm lint       # ESLint (zero warnings)
pnpm typecheck  # TypeScript strict check
```

Copy `.env.example` to `.env` and set ledger connection values before connecting to a participant.

## Roadmap

Grant milestones under [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223):

- [x] **Milestone 1** — Repository scaffold and project setup
- [ ] **Milestone 2** — External signing proof of concept (in progress)
- [ ] **Milestone 3** — Splice UI extraction and integration
- [ ] **Milestone 4** — End-to-end demo with wallet gateway
- [ ] **Milestone 5** — Partner-compatible CIP-103 integration notes

## License

Apache 2.0 — see [LICENSE](./LICENSE).
