// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223


import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { ProposalDetailsContent } from '@/components/governance/ProposalDetailsContent';
import { useProposalDetail } from '@/hooks/useProposalDetail';
import { useIdentityStore } from '@/stores/identity';

export function VoteDetail() {
  const { id } = useParams<{ id: string }>();
  const contractId = id ?? '';
  const identity = useIdentityStore((state) => state.identity);
  const { data: detail, isLoading, isError, error } = useProposalDetail(contractId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading proposal" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load proposal'}
      </Alert>
    );
  }

  if (detail === null || detail === undefined) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/votes" size="small">
            Back to votes
          </Button>
        }
      >
        Proposal not found: {decodeURIComponent(contractId)}
      </Alert>
    );
  }

  return (
    <ProposalDetailsContent
      contractId={detail.contractId}
      proposalDetails={detail.proposalDetails}
      votingInformation={detail.votingInformation}
      votes={detail.votes}
      currentSvPartyId={identity.partyId}
    />
  );
}
