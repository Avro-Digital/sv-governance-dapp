/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEDGER_URL: string;
  readonly VITE_PARTICIPANT_ID: string;
  readonly VITE_WALLET_GATEWAY_URL?: string;
  readonly VITE_USE_MOCK_VOTES?: string;
  readonly VITE_SCAN_URL?: string;
  /** Delegating SV party (`Vote.sv`) for highlighting and cast. */
  readonly VITE_SV_PARTY_ID?: string;
  /** `VoteDelegation` contract id for CIP-103 cast (demo / until ACS discovery). */
  readonly VITE_VOTE_DELEGATION_CID?: string;
  /** Optional override for active `DsoRules` contract id. */
  readonly VITE_DSO_RULES_CID?: string;
  /** Package name for VoteDelegation template id (default splice-dso-governance). */
  readonly VITE_DSO_GOVERNANCE_PACKAGE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
