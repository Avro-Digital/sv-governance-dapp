/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEDGER_URL: string;
  readonly VITE_PARTICIPANT_ID: string;
  readonly VITE_WALLET_GATEWAY_URL?: string;
  readonly VITE_USE_MOCK_VOTES?: string;
  readonly VITE_SCAN_URL?: string;
  readonly VITE_SV_PARTY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
