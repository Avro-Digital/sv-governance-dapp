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

/** Matches Splice `YourVoteStatus` / vote tab filter. */
export type YourVoteStatus = 'accepted' | 'rejected' | 'no-vote';

/** Tab filter for the votes list on the detail page. */
export type VoteTabFilter = YourVoteStatus | 'all';

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

/** Matches Splice `ProposalVotingInformation`. */
export interface ProposalVotingInformation {
  readonly requester: string;
  readonly requesterIsYou?: boolean;
  readonly votingThresholdDeadline: string;
  readonly voteTakesEffect: string;
  readonly status: ProposalListingStatus;
}

/** Matches Splice `ConfigChange`. */
export interface ConfigChange {
  readonly fieldName: string;
  readonly label: string;
  readonly currentValue: string;
  readonly newValue: string;
  readonly isId?: boolean;
}

export type SupportedActionTag =
  | 'SRARC_UpdateSvRewardWeight'
  | 'SRARC_GrantFeaturedAppRight'
  | 'SRARC_OffboardSv'
  | 'SRARC_RevokeFeaturedAppRight'
  | 'SRARC_CreateUnallocatedUnclaimedActivityRecord'
  | 'SRARC_SetConfig'
  | 'CRARC_SetConfig';

export interface UpdateSvRewardWeightProposal {
  readonly svToUpdate: string;
  readonly currentWeight: string;
  readonly weightChange: string;
}

export interface FeatureAppProposal {
  readonly provider: string;
}

/** Proposal fields for the detail view (simplified from Splice `ProposalDetails`). */
export type ProposalDetailsView = {
  readonly actionName: string;
  readonly summary: string;
  readonly url: string;
  readonly isVoteRequest?: boolean;
} & (
  | {
      readonly action: 'SRARC_UpdateSvRewardWeight';
      readonly proposal: UpdateSvRewardWeightProposal;
    }
  | {
      readonly action: 'SRARC_GrantFeaturedAppRight';
      readonly proposal: FeatureAppProposal;
    }
  | {
      readonly action:
        | 'SRARC_OffboardSv'
        | 'SRARC_RevokeFeaturedAppRight'
        | 'SRARC_SetConfig'
        | 'CRARC_SetConfig'
        | 'SRARC_CreateUnallocatedUnclaimedActivityRecord';
      readonly proposal?: undefined;
    }
  | {
      /** Action not yet mapped in the detail view — see `rawActionTag`. */
      readonly action: 'unsupported';
      readonly rawActionTag: string;
      readonly proposal?: undefined;
    }
);

/** Full detail payload for `ProposalDetailsContent`. */
export interface ProposalDetailView {
  readonly contractId: string;
  readonly proposalDetails: ProposalDetailsView;
  readonly votingInformation: ProposalVotingInformation;
  readonly votes: readonly ProposalVote[];
}

/** Matches Splice `ActionRequiredData`. */
export interface ActionRequiredItem {
  readonly contractId: string;
  readonly actionName: string;
  readonly description: string;
  readonly votingCloses: string;
  readonly createdAt: string;
  readonly requester: string;
  readonly isYou?: boolean;
}

/** Arguments for casting a vote via the VoteDelegation CIP-103 path. */
export interface CastVoteArgs {
  readonly voteRequestContractId: string;
  readonly accepted: boolean;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
  /** `VoteDelegation` contract id — required for prepareExecute. */
  readonly voteDelegationCid: string;
  /** Active `DsoRules` contract id. */
  readonly dsoRulesCid: string;
  /** Delegating SV party recorded on `Vote.sv`. */
  readonly svPartyId: string;
  /** Wallet party that controls `VoteDelegation_CastVote`. */
  readonly voterPartyId: string;
  /** Optional DSO party for `readAs` (authorization / visibility). */
  readonly dsoPartyId?: string;
}

/** Raw DAML action payload accepted by `DsoRules_RequestVote`. */
export interface GovernanceAction {
  readonly tag: 'ARC_DsoRules' | 'ARC_AmuletRules';
  readonly value: {
    readonly dsoAction?: {
      readonly tag: SupportedActionTag;
      readonly value: Record<string, unknown>;
    };
    readonly amuletRulesAction?: {
      readonly tag: SupportedActionTag;
      readonly value: Record<string, unknown>;
    };
  };
}

/** Arguments for creating a vote request through `VoteDelegation_RequestVote`. */
export interface RequestVoteArgs {
  readonly action: GovernanceAction;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
  /** Relative timeout in microseconds. */
  readonly voteRequestTimeoutMicroseconds: string;
  /** ISO timestamp, or undefined to become effective at threshold. */
  readonly targetEffectiveAt?: string;
  readonly voteDelegationCid: string;
  readonly dsoRulesCid: string;
  readonly svPartyId: string;
  readonly voterPartyId: string;
  readonly dsoPartyId?: string;
}

/** Prepared vote transaction awaiting external signature (CIP-103 / dApp SDK path). */
export interface PreparedVoteTransaction {
  readonly voteRequestContractId: string;
  readonly accepted: boolean;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
  readonly voteDelegationCid: string;
  readonly dsoRulesCid: string;
  readonly svPartyId: string;
  readonly voterPartyId: string;
  readonly dsoPartyId?: string;
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
  /** Carries prepareExecute params from preparation through submit. */
  readonly prepared: PreparedVoteTransaction;
}
