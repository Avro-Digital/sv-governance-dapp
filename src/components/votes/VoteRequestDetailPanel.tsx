// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ProposalDetailsContent } from '@/components/governance/ProposalDetailsContent';
import { ProposalVoteForm } from '@/components/governance/ProposalVoteForm';
import { toProposalDetailView } from '@/lib/governance-transform';
import { resolveVoteRequest } from '@/lib/scan-client';
import type { ScanDsoInfoResponse, ScanVoteRequestContract } from '@/lib/scan-types';
import { useIdentityStore } from '@/stores/identity';

import type { VoteRequestModalState } from './types';

interface VoteRequestDetailPanelProps {
  readonly modalState: Extract<VoteRequestModalState, { open: true }>;
  readonly dsoInfo: ScanDsoInfoResponse;
  readonly knownRequests: readonly ScanVoteRequestContract[];
}

export function VoteRequestDetailPanel({
  modalState,
  dsoInfo,
  knownRequests,
}: VoteRequestDetailPanelProps) {
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const [contract, setContract] = useState<Awaited<ReturnType<typeof resolveVoteRequest>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void resolveVoteRequest(modalState.routeId, knownRequests)
      .then((result) => {
        if (!cancelled) {
          setContract(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load vote request');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [modalState.routeId, knownRequests]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading vote request" />
      </Box>
    );
  }

  if (error !== null) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (contract === null) {
    return <Alert severity="warning">Vote request not found.</Alert>;
  }

  const detail = toProposalDetailView(contract, dsoInfo, partyId);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
      <ProposalDetailsContent
        contractId={detail.contractId}
        proposalDetails={detail.proposalDetails}
        votingInformation={detail.votingInformation}
        votes={detail.votes}
        currentSvPartyId={partyId}
      />
      <Box sx={{ mt: 3 }}>
        <ProposalVoteForm
          voteRequestContractId={detail.contractId}
          currentSvPartyId={partyId}
          votes={detail.votes}
        />
      </Box>
    </Box>
  );
}
