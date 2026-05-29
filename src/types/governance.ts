// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

// Shapes mirror Splice SV frontend `apps/sv/frontend/src/utils/types.ts` where noted.
// TODO: Revisit once CIP-103 is finalized and DAML.js types are wired in.
// https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md

/** Matches Splice `ProposalListingStatus`. */
export type ProposalListingStatus =
  | 'Accepted'
  | 'In Progress'
  | 'Implemented'
  | 'Rejected'
  | 'Expired'
  | 'Unknown';

/** Matches Splice `YourVoteStatus`. */
export type YourVoteStatus = 'accepted' | 'rejected' | 'no-vote';

/** Matches Splice `VoteReason`. */
export interface VoteReason {
  readonly url: string;
  readonly body: string;
}

/** Matches Splice `ProposalVote` (without DAML party types). */
export type ProposalVote = {
  readonly sv: string;
  readonly isYou?: boolean;
} & (
  | {
      readonly vote: 'no-vote';
      readonly reason?: undefined;
    }
  | {
      readonly vote: 'accepted' | 'rejected';
      readonly reason: VoteReason;
    }
);

/**
 * Listing row for governance proposals.
 * Mirrors Splice `ProposalListingData` (`utils/types.ts`).
 */
export interface ProposalListingItem {
  readonly contractId: string;
  readonly actionName: string;
  readonly description?: string;
  readonly votingThresholdDeadline: string;
  readonly voteTakesEffect: string;
  readonly yourVote: YourVoteStatus;
  readonly status: ProposalListingStatus;
  readonly voteStats: Record<YourVoteStatus, number>;
  readonly acceptanceThreshold: bigint;
}

/** Arguments for casting a vote — mirrors Splice `ProposalVoteForm` / `SvAdminClient.castVote`. */
export interface CastVoteArgs {
  readonly voteRequestContractId: string;
  readonly accepted: boolean;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
}

/** Prepared vote transaction awaiting external signature (CIP-103 / dApp SDK path). */
export interface PreparedVoteTransaction {
  readonly voteRequestContractId: string;
  readonly accepted: boolean;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
  readonly transactionHash: string;
  readonly preparedAt: string;
}

/** Externally signed transaction payload ready for ledger submission. */
export interface SignedVoteTransaction {
  readonly voteRequestContractId: string;
  readonly voterPartyId: string;
  readonly accepted: boolean;
  readonly preparedTransactionHash: string;
  readonly signature: string;
  readonly signedAt: string;
}
