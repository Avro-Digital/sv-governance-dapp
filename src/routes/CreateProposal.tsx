// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/routes/createProposal.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'react-router-dom';

import { ProposalForm } from '@/components/forms/ProposalForm';
import { SelectAction } from '@/components/forms/SelectAction';
import { PageHeader } from '@/components/governance/PageHeader';
import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { createProposalActions } from '@/lib/proposal-actions';
import type { SupportedActionTag } from '@/types/governance';

function resolveAction(raw: string | null): SupportedActionTag | undefined {
  return createProposalActions.find((candidate) => candidate.value === raw)?.value;
}

export function CreateProposal() {
  const [searchParams] = useSearchParams();
  const action = resolveAction(searchParams.get('action'));
  const snapshotQuery = useGovernanceSnapshot();

  return (
    <Box data-testid="create-proposal-page">
      <PageHeader title="Initiate Proposal" data-testid="create-proposal" />

      {action === undefined ? (
        <SelectAction />
      ) : snapshotQuery.isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress aria-label="Loading network state" />
        </Box>
      ) : snapshotQuery.data === undefined ? (
        <Alert severity="error">
          Failed to load DSO information from Scan; cannot create a proposal.
        </Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {createProposalActions.find((candidate) => candidate.value === action)?.name}
          </Typography>
          <ProposalForm action={action} dsoInfo={snapshotQuery.data.dsoInfo} />
        </>
      )}
    </Box>
  );
}
