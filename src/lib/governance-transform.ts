// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/utils/governance.ts and routes/governance.tsx
// at canton-network/splice commit 80488155. Original: Apache 2.0 (c) Digital Asset

import dayjs from 'dayjs';

import { getClosedVoteResultRowId, getVoteRequestRouteId } from '@/lib/scan-client';
import type {
  ScanActionRequiringConfirmation,
  ScanCloseVoteRequestResult,
  ScanDsoInfoResponse,
  ScanSvInfo,
  ScanVote,
  ScanVoteRequestContract,
  ScanVoteRequestOutcome,
} from '@/lib/scan-types';
import type {
  ActionRequiredItem,
  ConfigChange,
  ProposalDetailView,
  ProposalDetailsView,
  ProposalListingItem,
  ProposalListingStatus,
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

export function getSvMemberName(dsoInfo: ScanDsoInfoResponse, partyId: string): string {
  const entry = dsoInfo.dso_rules.contract.payload.svs.find(([id]) => id === partyId);
  return entry?.[1].name ?? '';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatConfigLeaf(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function humanizeConfigPath(path: string): string {
  return path
    .split('.')
    .map((segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase())
    .join(' → ')
    .replace(/^./, (char) => char.toUpperCase());
}

/**
 * Generic leaf-level diff between two JSON configs. The Splice SV UI uses
 * hand-labelled per-field builders backed by DAML codegen types; without
 * codegen we derive labels from the JSON path, which shows the same change data.
 */
export function buildConfigChanges(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
): readonly ConfigChange[] {
  const changes: ConfigChange[] = [];

  const walk = (base: unknown, next: unknown, path: string): void => {
    if (isRecord(base) && isRecord(next)) {
      const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
      for (const key of keys) {
        walk(base[key], next[key], path.length > 0 ? `${path}.${key}` : key);
      }
      return;
    }

    const currentValue = formatConfigLeaf(base);
    const newValue = formatConfigLeaf(next);
    if (currentValue !== newValue) {
      changes.push({
        fieldName: path,
        label: humanizeConfigPath(path),
        currentValue,
        newValue,
      });
    }
  };

  walk(before ?? {}, after ?? {}, '');
  return changes;
}

function toConfigRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function buildProposalDetails(
  payload: ScanVoteRequestContract['payload'],
  dsoInfo: ScanDsoInfoResponse,
  amuletName: string = DEFAULT_AMULET_NAME,
  isVoteRequest = true,
): ProposalDetailsView {
  const actionTag = getActionTag(payload.action);
  const actionName = getActionName(payload.action, amuletName);

  const base = {
    actionName,
    summary: payload.reason.body,
    url: payload.reason.url,
    isVoteRequest,
  };

  const dsoAction = payload.action.value.dsoAction;
  const amuletRulesAction = payload.action.value.amuletRulesAction;

  if (actionTag === 'SRARC_UpdateSvRewardWeight') {
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
    const provider = String(dsoAction?.value.provider ?? '');
    const rawActivityWeight = dsoAction?.value.activityWeight;
    const activityWeight =
      rawActivityWeight === null || rawActivityWeight === undefined
        ? ''
        : String(rawActivityWeight);
    return {
      ...base,
      action: 'SRARC_GrantFeaturedAppRight',
      proposal: { provider, activityWeight },
    };
  }

  if (actionTag === 'SRARC_OffboardSv') {
    return {
      ...base,
      action: 'SRARC_OffboardSv',
      proposal: { memberToOffboard: String(dsoAction?.value.sv ?? '') },
    };
  }

  if (actionTag === 'SRARC_RevokeFeaturedAppRight') {
    return {
      ...base,
      action: 'SRARC_RevokeFeaturedAppRight',
      proposal: { rightContractId: String(dsoAction?.value.rightCid ?? '') },
    };
  }

  if (actionTag === 'SRARC_CreateUnallocatedUnclaimedActivityRecord') {
    return {
      ...base,
      action: 'SRARC_CreateUnallocatedUnclaimedActivityRecord',
      proposal: {
        beneficiary: String(dsoAction?.value.beneficiary ?? ''),
        amount: String(dsoAction?.value.amount ?? ''),
        mintBefore: formatDateTime(
          typeof dsoAction?.value.expiresAt === 'string' ? dsoAction.value.expiresAt : undefined,
        ),
      },
    };
  }

  if (actionTag === 'SRARC_SetConfig') {
    const newConfig = toConfigRecord(dsoAction?.value.newConfig) ?? {};
    const baseConfig = toConfigRecord(dsoAction?.value.baseConfig);
    const actualConfig = toConfigRecord(dsoInfo.dso_rules.contract.payload.config);

    return {
      ...base,
      action: 'SRARC_SetConfig',
      proposal: {
        configChanges: buildConfigChanges(baseConfig ?? actualConfig, newConfig),
        newConfig,
        ...(baseConfig !== undefined ? { baseConfig } : {}),
        ...(actualConfig !== undefined ? { actualConfig } : {}),
      },
    };
  }

  if (actionTag === 'CRARC_SetConfig') {
    const newConfig = toConfigRecord(amuletRulesAction?.value.newConfig) ?? {};
    const baseConfig = toConfigRecord(amuletRulesAction?.value.baseConfig);
    const actualConfig = toConfigRecord(
      dsoInfo.amulet_rules?.contract.payload.configSchedule?.initialValue,
    );

    return {
      ...base,
      action: 'CRARC_SetConfig',
      proposal: {
        configChanges: buildConfigChanges(baseConfig ?? actualConfig, newConfig),
        newConfig,
        ...(baseConfig !== undefined ? { baseConfig } : {}),
        ...(actualConfig !== undefined ? { actualConfig } : {}),
      },
    };
  }

  if (import.meta.env.DEV) {
    console.warn(`Unsupported governance action tag: ${getRawActionTag(payload.action)}`);
  }

  return {
    ...base,
    action: 'unsupported',
    rawActionTag: getRawActionTag(payload.action),
  };
}

function toProposalVotes(
  payload: ScanVoteRequestContract['payload'],
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
): readonly ProposalVote[] {
  const castVotes = parseVoteEntries(payload.votes);
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
    proposalDetails: buildProposalDetails(contract.payload, dsoInfo, amuletName),
    votingInformation: {
      requester: contract.payload.requester,
      requesterIsYou: contract.payload.requester === svPartyId,
      votingThresholdDeadline: formatDateTime(contract.payload.voteBefore),
      voteTakesEffect: formatDateTime(contract.payload.targetEffectiveAt),
      status: 'In Progress',
    },
    votes: toProposalVotes(contract.payload, dsoInfo, svPartyId),
  };
}

/** Detail view for a closed vote result (Vote History rows). */
export function toClosedProposalDetailView(
  result: ScanCloseVoteRequestResult,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): ProposalDetailView {
  const effectiveAt =
    result.outcome.tag === 'VRO_Accepted' && typeof result.outcome.value?.effectiveAt === 'string'
      ? result.outcome.value.effectiveAt
      : undefined;

  return {
    contractId: getClosedVoteResultRowId(result),
    proposalDetails: buildProposalDetails(result.request, dsoInfo, amuletName, false),
    votingInformation: {
      requester: result.request.requester,
      requesterIsYou: result.request.requester === svPartyId,
      votingThresholdDeadline: formatDateTime(result.request.voteBefore),
      voteTakesEffect: formatDateTime(effectiveAt ?? result.completedAt),
      status: getVoteResultStatus(result.outcome),
    },
    votes: toProposalVotes(result.request, dsoInfo, svPartyId),
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

export type VoteRequestResultTableType = 'Executed' | 'Rejected';

/** `Accepted` is filtered out of vote history before status is shown; only closed outcomes reach the UI. */
export function getVoteResultStatus(outcome: ScanVoteRequestOutcome | undefined): ProposalListingStatus {
  if (outcome === undefined) {
    return 'Unknown';
  }

  switch (outcome.tag) {
    case 'VRO_Accepted': {
      const effectiveAt = outcome.value?.effectiveAt;
      if (typeof effectiveAt === 'string' && dayjs(effectiveAt).isBefore(dayjs())) {
        return 'Implemented';
      }
      return 'Accepted';
    }
    case 'VRO_Expired':
      return 'Expired';
    case 'VRO_Rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

function getVoteResultEffectiveAt(result: ScanCloseVoteRequestResult): string {
  if (result.outcome.tag === 'VRO_Accepted') {
    const effectiveAt = result.outcome.value?.effectiveAt;
    if (typeof effectiveAt === 'string') {
      return formatDateTime(effectiveAt);
    }
  }
  return formatDateTime(result.completedAt);
}

export function toVoteHistoryListingItem(
  result: ScanCloseVoteRequestResult,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): ProposalListingItem {
  const votes = parseVoteEntries(result.request.votes);
  const routeId = getClosedVoteResultRowId(result);

  return {
    contractId: routeId,
    actionName: getActionName(result.request.action, amuletName),
    description: result.request.reason.body,
    votingThresholdDeadline: formatDateTime(result.request.voteBefore),
    voteTakesEffect: getVoteResultEffectiveAt(result),
    yourVote: computeYourVote(votes, svPartyId),
    status: getVoteResultStatus(result.outcome),
    voteStats: computeVoteStats(votes),
    acceptanceThreshold: BigInt(dsoInfo.voting_threshold),
  };
}

export function buildVoteHistoryListing(
  results: readonly ScanCloseVoteRequestResult[],
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
  amuletName: string = DEFAULT_AMULET_NAME,
): readonly ProposalListingItem[] {
  const now = dayjs();

  return results
    .filter((result) => {
      if (result.outcome.tag === 'VRO_Accepted') {
        const effectiveAt = result.outcome.value?.effectiveAt;
        return typeof effectiveAt === 'string' && dayjs(effectiveAt).isBefore(now);
      }
      return result.outcome.tag === 'VRO_Expired' || result.outcome.tag === 'VRO_Rejected';
    })
    .map((result) => toVoteHistoryListingItem(result, dsoInfo, svPartyId, amuletName));
}

export function filterVoteResultsForTable(
  results: readonly ScanCloseVoteRequestResult[],
  tableType: VoteRequestResultTableType,
): readonly ScanCloseVoteRequestResult[] {
  const now = dayjs();

  return results.filter((result) => {
    if (tableType === 'Executed') {
      return (
        result.outcome.tag === 'VRO_Accepted' &&
        typeof result.outcome.value?.effectiveAt === 'string' &&
        dayjs(result.outcome.value.effectiveAt).isBefore(now)
      );
    }
    return result.outcome.tag === 'VRO_Rejected' || result.outcome.tag === 'VRO_Expired';
  });
}
