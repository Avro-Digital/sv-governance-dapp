# SV Governance dApp

[![Lint](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml/badge.svg)](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml)
[![Tests](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml/badge.svg)](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml)
[![Release](https://img.shields.io/github/v/release/Avro-Digital/sv-governance-dapp?label=release)](https://github.com/Avro-Digital/sv-governance-dapp/releases)
[![License](https://img.shields.io/github/license/Avro-Digital/sv-governance-dapp)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](#development)

Standalone application for Canton Super Validators to cast governance votes via externally-signed wallet flows.

## Status

**Work in progress** — funded by the [Canton Foundation Development Fund](https://github.com/canton-foundation/canton-dev-fund) under [grant proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) (amended via [PR #414](https://github.com/canton-foundation/canton-dev-fund/pull/414)). Current focus: [Milestone 2 — External Signing Proof of Concept](https://github.com/canton-foundation/canton-dev-fund/issues/287) — Scan reads and Vote Requests UI parity are on `develop`; wallet connect and governance-voter cast path are next.

Project tracking: [Linear — SV Governance dApp Implementation](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b) · M2 epic: [AVR-2471](https://linear.app/avro-digital/issue/AVR-2471)

## About

This dApp lets Super Validators (SVs) review pending governance proposals and cast votes without relying on the full SV operator application. It is designed for wallet-gateway-backed external signing, enabling SV operators to approve governance actions through their preferred Canton wallet rather than in-app credentials alone.

The UI is extracted and adapted from the governance views in the [Splice SV operator app](https://github.com/canton-network/splice) (`apps/sv/frontend/`), keeping visual and interaction parity while running as a standalone frontend.

## Grant context

| Link | Description |
| --- | --- |
| [PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) | Grant proposal — SV Governance dApp with external signing |
| [PR #414](https://github.com/canton-foundation/canton-dev-fund/pull/414) | Approved scope amendment — M1 field classification + Phase 1 status-quo preserving infrastructure |
| [Issue #287](https://github.com/canton-foundation/canton-dev-fund/issues/287) | Milestone 2 — External Signing Proof of Concept |

Milestone 2 will demonstrate an end-to-end externally signed **governance-voter** vote recorded on-chain (confirming participant ≠ SV node), integrated with `@canton-network/dapp-sdk` and a wallet-gateway signing path. On-chain infrastructure for the governance-voter path lands in Milestone 1 ([`splice-sv-voting-dapp`](https://github.com/canton-network/splice-sv-voting-dapp)).

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

Contributing: [`CONTRIBUTING.md`](./CONTRIBUTING.md) · SDLC: [`docs/sdlc.md`](./docs/sdlc.md) (PR-only `develop`/`main`, Linear-linked branches)

## Roadmap

Grant milestones under [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) (see [amendment #414](https://github.com/canton-foundation/canton-dev-fund/pull/414)):

| Milestone | Focus | Repo / status |
| --- | --- | --- |
| **M1** | Governance-voting identity, CIP, DSO/Amulet **field classification** (operational / governance / fixed), Phase 1 infrastructure without vote-split activation | [`splice-sv-voting-dapp`](https://github.com/canton-network/splice-sv-voting-dapp) — in progress upstream |
| **M2** | External signing PoC — this dApp + wallet gateway + on-ledger governance-voter cast | **This repo** — UI/read path done; signing stack next |
| **M3** | Deployment packaging, operator governance-voter/key binding, staging validation | Planned |
| **M4** | UX hardening, audit/diff views, rollout docs | Planned |

Linear: [SV Governance dApp Implementation](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b).

## License

Apache 2.0 — see [LICENSE](./LICENSE).
