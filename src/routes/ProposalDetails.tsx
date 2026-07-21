// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/routes/voteRequestDetails.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { ProposalDetailsContent } from '@/components/governance/ProposalDetailsContent';
import { useProposalDetails } from '@/hooks/useProposalDetails';

export function ProposalDetails() {
  const { contractId } = useParams<{ contractId: string }>();
  const routeId = contractId ?? '';
  const { data: detail, isLoading, isError, error, svPartyId } = useProposalDetails(routeId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading proposal details" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load proposal details'}
      </Alert>
    );
  }

  if (detail === null || detail === undefined) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/governance/proposals" size="small">
            Back to proposals
          </Button>
        }
      >
        Unable to find the proposal with Contract ID {decodeURIComponent(routeId)}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <ProposalDetailsContent
        currentSvPartyId={svPartyId}
        contractId={detail.contractId}
        proposalDetails={detail.proposalDetails}
        votingInformation={detail.votingInformation}
        votes={detail.votes}
      />
    </Box>
  );
}
