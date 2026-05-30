// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/votes/VoteResultModalContent.tsx @ canton-network/splice 80488155

import { VoteModalContent } from '@/components/votes/VoteModalContent';
import { getSvMemberName, parseVoteEntries } from '@/lib/governance-transform';
import { getClosedVoteRequestRouteId } from '@/lib/scan-client';
import type { ScanCloseVoteRequestResult, ScanDsoInfoResponse } from '@/lib/scan-types';

interface VoteResultModalViewProps {
  readonly voteResult: ScanCloseVoteRequestResult;
  readonly dsoInfo: ScanDsoInfoResponse;
  readonly effectiveAt?: Date | undefined;
}

export function VoteResultModalView({ voteResult, dsoInfo, effectiveAt }: VoteResultModalViewProps) {
  const votes = parseVoteEntries(voteResult.request.votes);
  const acceptedVotes = votes.filter((vote) => vote.accept);
  const rejectedVotes = votes.filter((vote) => !vote.accept);
  const routeId = getClosedVoteRequestRouteId(voteResult.request) ?? '';

  return (
    <VoteModalContent
      voteRequestContractId={routeId}
      action={voteResult.request.action}
      requester={voteResult.request.requester}
      getMemberName={(partyId) => getSvMemberName(dsoInfo, partyId)}
      reason={voteResult.request.reason}
      voteBefore={new Date(voteResult.request.voteBefore)}
      effectiveAt={effectiveAt}
      acceptedVotes={acceptedVotes}
      rejectedVotes={rejectedVotes}
      dsoConfig={dsoInfo.dso_rules.contract.payload.config}
      expiryContext="closed"
      expiredWithoutResolution={voteResult.outcome.tag === 'VRO_Expired'}
    />
  );
}
