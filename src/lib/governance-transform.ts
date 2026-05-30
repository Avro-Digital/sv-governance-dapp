// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/utils/governance.ts and routes/governance.tsx
// at canton-network/splice commit 80488155. Original: Apache 2.0 (c) Digital Asset

import dayjs from 'dayjs';

import { getVoteRequestRouteId } from '@/lib/scan-client';
import type {
  ScanActionRequiringConfirmation,
  ScanDsoInfoResponse,
  ScanSvInfo,
  ScanVote,
  ScanVoteRequestContract,
} from '@/lib/scan-types';
import type {
  ActionRequiredItem,
  ProposalDetailView,
  ProposalDetailsView,
  ProposalListingItem,
  ProposalVote,
  SupportedActionTag,
  YourVoteStatus,
} from '@/types/governance';

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';

export const DEFAULT_AMULET_NAME = 'Amulet';

export const actionTagToTitle = (
  amuletName: string = DEFAULT_AMULET_NAME,
): Record<SupportedActionTag, string> => ({
  CRARC_SetConfig: `Set ${amuletName} Rules Configuration`,
  SRARC_GrantFeaturedAppRight: 'Feature Application',
  SRARC_OffboardSv: 'Offboard Member',
  SRARC_RevokeFeaturedAppRight: 'Unfeature Application',
  SRARC_CreateUnallocatedUnclaimedActivityRecord: 'Create Unclaimed Activity Record',
  SRARC_SetConfig: 'Set Decentralized Synchronizer Operations (DSO) Rules Configuration',
  SRARC_UpdateSvRewardWeight: 'Update Super Validator Reward Weight',
});

export function getActionTag(
  action: ScanActionRequiringConfirmation,
): SupportedActionTag | undefined {
  if (action.tag === 'ARC_DsoRules' && action.value.dsoAction !== undefined) {
    const tag = action.value.dsoAction.tag;
    if (isSupportedActionTag(tag)) {
      return tag;
    }
  }

  if (action.tag === 'ARC_AmuletRules' && action.value.amuletRulesAction !== undefined) {
    const tag = action.value.amuletRulesAction.tag;
    if (isSupportedActionTag(tag)) {
      return tag;
    }
  }

  return undefined;
}

function isSupportedActionTag(tag: string): tag is SupportedActionTag {
  return tag in actionTagToTitle();
}

/** Raw DAML action tag for display when not in {@link SupportedActionTag}. */
export function getRawActionTag(action: ScanActionRequiringConfirmation): string {
  if (action.tag === 'ARC_DsoRules' && action.value.dsoAction !== undefined) {
    return action.value.dsoAction.tag;
  }
  if (action.tag === 'ARC_AmuletRules' && action.value.amuletRulesAction !== undefined) {
    return action.value.amuletRulesAction.tag;
  }
  return action.tag;
}

export function getActionName(
  action: ScanActionRequiringConfirmation,
  amuletName: string = DEFAULT_AMULET_NAME,
): string {
  const actionTag = getActionTag(action);
  return actionTag !== undefined ? actionTagToTitle(amuletName)[actionTag] : getRawActionTag(action);
}

export function formatBasisPoints(value: string): string {
  if (value.length === 0) {
    return '';
  }
  const padded = value.padStart(5, '0');
  const integerPart = padded.slice(0, -4);
  const decimalPart = padded.slice(-4);
  return `${integerPart}_${decimalPart}`;
}

function getSvRewardWeight(
  svs: ReadonlyArray<readonly [string, ScanSvInfo]>,
  svPartyId: string,
): string {
  const entry = svs.find(([partyId]) => partyId === svPartyId);
  return entry?.[1].svRewardWeight ?? '';
}

export function parseVoteEntries(
  votes: ReadonlyArray<readonly [string, ScanVote]>,
): readonly ScanVote[] {
  return votes.map(([, vote]) => vote);
}

export function computeVoteStats(votes: readonly ScanVote[]): Record<YourVoteStatus, number> {
  const accepted = votes.filter((vote) => vote.accept).length;
  const rejected = votes.filter((vote) => !vote.accept).length;
  return { accepted, rejected, 'no-vote': 0 };
}

export function computeYourVote(
  votes: readonly ScanVote[],
  svPartyId: string | undefined,
): YourVoteStatus {
  if (svPartyId === undefined || svPartyId.length === 0) {
    return 'no-vote';
  }

  const vote = votes.find((entry) => entry.sv === svPartyId);
  if (vote === undefined) {
    return 'no-vote';
  }
  return vote.accept ? 'accepted' : 'rejected';
}

export function hasSvVoted(votes: readonly ScanVote[], svPartyId: string): boolean {
  return votes.some((vote) => vote.sv === svPartyId);
}

export function getVoteRequestContractId(contract: ScanVoteRequestContract): string {
  return getVoteRequestRouteId(contract);
}

/** Splice convention: absent deadline/effective date displays as "Threshold". */
function formatDateTime(value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    return 'Threshold';
  }
  return dayjs(value).format(DATE_TIME_FORMAT);
}

function buildProposalDetails(
  contract: ScanVoteRequestContract,
  dsoInfo: ScanDsoInfoResponse,
  amuletName: string = DEFAULT_AMULET_NAME,
): ProposalDetailsView {
  const actionTag = getActionTag(contract.payload.action);
  const actionName = getActionName(contract.payload.action, amuletName);

  const base = {
    actionName,
    summary: contract.payload.reason.body,
    url: contract.payload.reason.url,
    isVoteRequest: true as const,
  };

  if (actionTag === 'SRARC_UpdateSvRewardWeight') {
    const dsoAction = contract.payload.action.value.dsoAction;
    const svParty = String(dsoAction?.value.svParty ?? '');
    const newRewardWeight = String(dsoAction?.value.newRewardWeight ?? '');
    const svs = dsoInfo.dso_rules.contract.payload.svs;

    return {
      ...base,
      action: 'SRARC_UpdateSvRewardWeight',
      proposal: {
        svToUpdate: svParty,
        currentWeight: formatBasisPoints(getSvRewardWeight(svs, svParty)),
        weightChange: formatBasisPoints(newRewardWeight),
      },
    };
  }

  if (actionTag === 'SRARC_GrantFeaturedAppRight') {
    const provider = String(contract.payload.action.value.dsoAction?.value.provider ?? '');
    return {
      ...base,
      action: 'SRARC_GrantFeaturedAppRight',
      proposal: { provider },
    };
  }

  if (actionTag !== undefined) {
    return {
      ...base,
      action: actionTag,
    };
  }

  if (import.meta.env.DEV) {
    console.warn(`Unsupported governance action tag: ${getRawActionTag(contract.payload.action)}`);
  }

  return {
    ...base,
    action: 'unsupported',
    rawActionTag: getRawActionTag(contract.payload.action),
  };
}

function toProposalVotes(
  contract: ScanVoteRequestContract,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
): readonly ProposalVote[] {
  const castVotes = parseVoteEntries(contract.payload.votes);
  const allSvPartyIds = dsoInfo.dso_rules.contract.payload.svs.map(([partyId]) => partyId);

  return allSvPartyIds.map((sv) => {
    const vote = castVotes.find((entry) => entry.sv === sv);
    const isYou = sv === svPartyId;

    if (vote === undefined) {
      return { sv, isYou, vote: 'no-vote' as const };
    }

    return {
      sv,
      isYou,
      vote: vote.accept ? ('accepted' as const) : ('rejected' as const),
      reason: {
        url: vote.reason.url,
        body: vote.reason.body,
      },
    };
  });
}

export function toProposalListingItem(
  contract: ScanVoteRequestContract,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): ProposalListingItem {
  const votes = parseVoteEntries(contract.payload.votes);

  return {
    contractId: getVoteRequestContractId(contract),
    actionName: getActionName(contract.payload.action, amuletName),
    description: contract.payload.reason.body,
    votingThresholdDeadline: formatDateTime(contract.payload.voteBefore),
    voteTakesEffect: formatDateTime(contract.payload.targetEffectiveAt),
    yourVote: computeYourVote(votes, svPartyId),
    status: 'In Progress',
    voteStats: computeVoteStats(votes),
    acceptanceThreshold: BigInt(dsoInfo.voting_threshold),
  };
}

export function toActionRequiredItem(
  contract: ScanVoteRequestContract,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): ActionRequiredItem {
  return {
    contractId: getVoteRequestContractId(contract),
    actionName: getActionName(contract.payload.action, amuletName),
    description: contract.payload.reason.body,
    votingCloses: formatDateTime(contract.payload.voteBefore),
    createdAt: formatDateTime(contract.created_at),
    requester: contract.payload.requester,
    isYou: contract.payload.requester === svPartyId,
  };
}

export function toProposalDetailView(
  contract: ScanVoteRequestContract,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): ProposalDetailView {
  return {
    contractId: getVoteRequestContractId(contract),
    proposalDetails: buildProposalDetails(contract, dsoInfo, amuletName),
    votingInformation: {
      requester: contract.payload.requester,
      requesterIsYou: contract.payload.requester === svPartyId,
      votingThresholdDeadline: formatDateTime(contract.payload.voteBefore),
      voteTakesEffect: formatDateTime(contract.payload.targetEffectiveAt),
      status: 'In Progress',
    },
    votes: toProposalVotes(contract, dsoInfo, svPartyId),
  };
}

export function splitVoteRequestsForSv(
  voteRequests: readonly ScanVoteRequestContract[],
  svPartyId: string,
): {
  readonly actionRequired: readonly ScanVoteRequestContract[];
  readonly inflight: readonly ScanVoteRequestContract[];
} {
  const actionRequired: ScanVoteRequestContract[] = [];
  const inflight: ScanVoteRequestContract[] = [];

  for (const contract of voteRequests) {
    const votes = parseVoteEntries(contract.payload.votes);
    if (hasSvVoted(votes, svPartyId)) {
      inflight.push(contract);
    } else {
      actionRequired.push(contract);
    }
  }

  return { actionRequired, inflight };
}
