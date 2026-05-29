// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ProposalListingSection } from '@/components/governance/ProposalListingSection';
import { useVotes } from '@/hooks/useVotes';

export function VoteList() {
  const { data: votes, isLoading, isError, error } = useVotes();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading votes" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load votes'}
      </Alert>
    );
  }

  return (
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
  );
}
