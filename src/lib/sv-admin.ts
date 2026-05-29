// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

/**
 * Reference interface for the Splice SV Admin API voting path.
 *
 * Canonical source: `apps/sv/frontend/src/contexts/SvAdminServiceContext.tsx`
 * in https://github.com/canton-network/splice
 *
 * The upstream SV operator app calls `castVote` server-side (OIDC-authenticated).
 * This standalone dApp replaces that path with `@canton-network/dapp-sdk` external
 * signing — see `lib/signing.ts` and `lib/dapp-sdk.ts`.
 */

import type { CastVoteArgs } from '@/types/governance';

/** Subset of Splice `SvAdminClient` relevant to governance voting. */
export interface SvAdminClient {
  listDsoRulesVoteRequests(): Promise<{ readonly dso_rules_vote_requests: readonly unknown[] }>;
  lookupDsoRulesVoteRequest(
    voteRequestContractId: string,
  ): Promise<{ readonly dso_rules_vote_request: unknown }>;
  castVote(
    voteRequestContractId: string,
    isAccepted: boolean,
    reasonUrl: string,
    reasonDescription: string,
  ): Promise<void>;
}

/** Maps Splice cast-vote parameters to our shared args type. */
export function toCastVoteArgs(
  voteRequestContractId: string,
  accepted: boolean,
  reasonUrl: string,
  reasonDescription: string,
): CastVoteArgs {
  return {
    voteRequestContractId,
    accepted,
    reasonUrl,
    reasonDescription,
  };
}
