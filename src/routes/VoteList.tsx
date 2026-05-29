// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ActionRequiredSection } from '@/components/governance/ActionRequiredSection';
import { ProposalListingSection } from '@/components/governance/ProposalListingSection';
import { useActionRequired } from '@/hooks/useActionRequired';
import { useVotes } from '@/hooks/useVotes';

export function VoteList() {
  const { data: votes, isLoading: votesLoading, isError: votesError, error: votesErr } = useVotes();
  const {
    data: actionRequired,
    isLoading: actionLoading,
    isError: actionError,
    error: actionErr,
  } = useActionRequired();

  if (votesLoading || actionLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading votes" />
      </Box>
    );
  }

  if (votesError || actionError) {
    const message =
      (votesErr instanceof Error ? votesErr.message : null) ??
      (actionErr instanceof Error ? actionErr.message : null) ??
      'Failed to load governance data';
    return <Alert severity="error">{message}</Alert>;
  }

  return (
    <Box>
      <ActionRequiredSection actionRequiredRequests={actionRequired ?? []} />
      <ProposalListingSection
        sectionTitle="Inflight Votes"
        data={votes ?? []}
        noDataMessage="No inflight votes"
        uniqueId="inflight-votes"
        showThresholdDeadline
        showVoteStats
        showStatus
        sortOrder="effectiveAtAsc"
      />
    </Box>
  );
}
