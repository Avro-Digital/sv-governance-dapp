// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import {
  DappSDK,
  RemoteAdapter,
  type ConnectResult,
  type LedgerApiParams,
  type LedgerApiResult,
  type PrepareExecuteAndWaitResult,
  type PrepareExecuteParams,
} from '@canton-network/dapp-sdk';

/** Configuration read from Vite environment variables. */
export interface DappClientConfig {
  /** Participant Ledger API URL — for direct reads once wired (not used by CIP-103 wallet RPC). */
  readonly ledgerUrl: string;
  /** Local participant identifier — reserved for direct Ledger API routing. */
  readonly participantId: string;
  /** Optional wallet gateway URL (CIP-103 remote adapter). */
  readonly walletGatewayUrl: string | undefined;
}

/** Typed facade over `@canton-network/dapp-sdk` for governance operations. */
export interface GovernanceDappClient {
  readonly config: DappClientConfig;
  init(): Promise<void>;
  connect(): Promise<ConnectResult>;
  disconnect(): Promise<void>;
  listAccounts(): ReturnType<DappSDK['listAccounts']>;
  prepareExecute(params: PrepareExecuteParams): Promise<null>;
  prepareExecuteAndWait(params: PrepareExecuteParams): Promise<PrepareExecuteAndWaitResult>;
  ledgerApi(params: LedgerApiParams): Promise<LedgerApiResult>;
}

function readEnvConfig(): DappClientConfig {
  const ledgerUrl = import.meta.env.VITE_LEDGER_URL ?? '';
  const participantId = import.meta.env.VITE_PARTICIPANT_ID ?? '';
  const walletGatewayUrl = import.meta.env.VITE_WALLET_GATEWAY_URL?.trim();

  return {
    ledgerUrl,
    participantId,
    walletGatewayUrl: walletGatewayUrl && walletGatewayUrl.length > 0 ? walletGatewayUrl : undefined,
  };
}

let sdk: DappSDK | null = null;
let initialized = false;

function getSdk(): DappSDK {
  if (sdk === null) {
    sdk = new DappSDK();
  }
  return sdk;
}

function buildInitOptions(config: DappClientConfig) {
  if (config.walletGatewayUrl === undefined) {
    return undefined;
  }

  return {
    additionalAdapters: [
      new RemoteAdapter({
        rpcUrl: config.walletGatewayUrl,
        name: 'Wallet Gateway',
        description: 'Configured via VITE_WALLET_GATEWAY_URL',
      }),
    ],
  };
}

/**
 * Governance-scoped wrapper around `@canton-network/dapp-sdk`.
 *
 * Splice upstream does **not** use this SDK — it signs via `SvAdminClient.castVote`
 * (see `lib/sv-admin.ts`). Milestone 2 replaces that server path with CIP-103
 * `prepareExecute` / wallet-gateway signing.
 */
export function createGovernanceDappClient(config: DappClientConfig = readEnvConfig()): GovernanceDappClient {
  return {
    config,
    async init(): Promise<void> {
      if (initialized) {
        return;
      }
      await getSdk().init(buildInitOptions(config));
      initialized = true;
    },
    async connect(): Promise<ConnectResult> {
      await this.init();
      return getSdk().connect();
    },
    async disconnect(): Promise<void> {
      await getSdk().disconnect();
    },
    async listAccounts() {
      await this.init();
      return getSdk().listAccounts();
    },
    async prepareExecute(params: PrepareExecuteParams): Promise<null> {
      await this.init();
      return getSdk().prepareExecute(params);
    },
    async prepareExecuteAndWait(params: PrepareExecuteParams): Promise<PrepareExecuteAndWaitResult> {
      await this.init();
      return getSdk().prepareExecuteAndWait(params);
    },
    async ledgerApi(params: LedgerApiParams): Promise<LedgerApiResult> {
      await this.init();
      // Ledger routing is handled by the connected wallet provider (CIP-103).
      // config.ledgerUrl / config.participantId are reserved for direct participant API use.
      return getSdk().ledgerApi(params);
    },
  };
}

/** Singleton client for app-wide use. */
export const governanceDappClient: GovernanceDappClient = createGovernanceDappClient();
