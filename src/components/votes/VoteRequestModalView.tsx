// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { VoteForm } from '@/components/votes/VoteForm';
import { VoteModalContent } from '@/components/votes/VoteModalContent';
import { getSvMemberName, parseVoteEntries } from '@/lib/governance-transform';
import { getVoteRequestRouteId } from '@/lib/scan-client';
import type { ScanDsoInfoResponse, ScanVoteRequestContract } from '@/lib/scan-types';

interface VoteRequestModalViewProps {
  readonly contract: ScanVoteRequestContract;
  readonly dsoInfo: ScanDsoInfoResponse;
  readonly svPartyId: string;
}

export function VoteRequestModalView({ contract, dsoInfo, svPartyId }: VoteRequestModalViewProps) {
  const votes = parseVoteEntries(contract.payload.votes);
  const acceptedVotes = votes.filter((vote) => vote.accept);
  const rejectedVotes = votes.filter((vote) => !vote.accept);
  const curSvVote = votes.find((vote) => vote.sv === svPartyId);
  const voteRequestContractId = getVoteRequestRouteId(contract);

  return (
    <VoteModalContent
      voteRequestContractId={voteRequestContractId}
      action={contract.payload.action}
      requester={contract.payload.requester}
      getMemberName={(partyId) => getSvMemberName(dsoInfo, partyId)}
      reason={contract.payload.reason}
      voteBefore={new Date(contract.payload.voteBefore)}
      effectiveAt={
        contract.payload.targetEffectiveAt !== undefined
          ? new Date(contract.payload.targetEffectiveAt)
          : undefined
      }
      acceptedVotes={acceptedVotes}
      rejectedVotes={rejectedVotes}
      curSvVote={curSvVote}
      voteForm={(cid, vote) => <VoteForm voteRequestCid={cid} vote={vote} />}
    />
  );
}
