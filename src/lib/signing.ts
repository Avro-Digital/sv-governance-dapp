// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { CastVoteArgs, PreparedVoteTransaction, SignedVoteTransaction } from '@/types/governance';

/**
 * External wallet signer for governance vote casting.
 *
 * Replaces Splice `SvAdminClient.castVote` (`ProposalVoteForm.tsx`) with a
 * CIP-103 path via `@canton-network/dapp-sdk`:
 *   prepare → sign (wallet gateway) → submit
 */
export interface ExternalSigner {
  prepareVoteTransaction(args: CastVoteArgs): Promise<PreparedVoteTransaction>;
  requestSignature(prepared: PreparedVoteTransaction): Promise<SignedVoteTransaction>;
  submitSignedTransaction(signed: SignedVoteTransaction): Promise<string>;
}

/** Stub implementation — throws until Milestone 2 signing flow is wired. */
export const externalSigner: ExternalSigner = {
  async prepareVoteTransaction(_args: CastVoteArgs): Promise<PreparedVoteTransaction> {
    throw new Error('not implemented');
  },
  async requestSignature(_prepared: PreparedVoteTransaction): Promise<SignedVoteTransaction> {
    throw new Error('not implemented');
  },
  async submitSignedTransaction(_signed: SignedVoteTransaction): Promise<string> {
    throw new Error('not implemented');
  },
};
