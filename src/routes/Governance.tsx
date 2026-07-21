// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/routes/governance.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import InfoOutlined from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { ActionRequiredSection } from '@/components/governance/ActionRequiredSection';
import { PageHeader } from '@/components/governance/PageHeader';
import { ProposalListingSection } from '@/components/governance/ProposalListingSection';
import { useGovernanceVoteRequests } from '@/hooks/useGovernanceVoteRequests';
import { useVoteHistoryListing } from '@/hooks/useVoteRequestResults';
import { useVoteRequestResultsCount } from '@/hooks/useVoteRequestResultsCount';
import { toActionRequiredItem, toProposalListingItem } from '@/lib/governance-transform';

export function Governance() {
  const { isLoading, isError, dsoInfo, actionNeeded, inProgress, svPartyId } =
    useGovernanceVoteRequests();
  const voteHistoryQuery = useVoteHistoryListing(dsoInfo, svPartyId);
  const voteResultsCountQuery = useVoteRequestResultsCount();

  if (isLoading || (voteHistoryQuery.isLoading && voteHistoryQuery.voteHistory.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading governance data" />
      </Box>
    );
  }

  if (isError || voteHistoryQuery.isError || dsoInfo === undefined) {
    return <ErrorStateSection />;
  }

  const actionRequiredRequests = actionNeeded.map((contract) =>
    toActionRequiredItem(contract, svPartyId),
  );
  const inflightRequests = inProgress.map((contract) =>
    toProposalListingItem(contract, dsoInfo, svPartyId),
  );
  const voteHistory = voteHistoryQuery.voteHistory;
  const voteHistoryCount = voteResultsCountQuery.data ?? voteHistory.length;

  const isEmpty =
    actionRequiredRequests.length === 0 &&
    inflightRequests.length === 0 &&
    voteHistory.length === 0 &&
    !voteHistoryQuery.hasNextPage;

  return (
    <Box sx={{ p: 4 }}>
      <PageHeader
        title="Governance"
        actionElement={
          <Button
            id="initiate-proposal-button"
            variant="pill"
            component={RouterLink}
            to="/governance/proposals/create"
          >
            Initiate Proposal
          </Button>
        }
        data-testid="governance-page-header"
      />

      {isEmpty ? (
        <EmptyStateSection />
      ) : (
        <>
          <ActionRequiredSection actionRequiredRequests={actionRequiredRequests} />

          <ProposalListingSection
            sectionTitle="Inflight Votes"
            badgeCount={inflightRequests.length}
            data={inflightRequests}
            noDataMessage="No proposals are currently in flight. Proposals you have voted on will appear here while awaiting the voting threshold or deadline."
            uniqueId="inflight-proposals"
            showVoteStats
            showThresholdDeadline
            sortOrder="effectiveAtAsc"
          />

          <ProposalListingSection
            sectionTitle="Vote History"
            badgeCount={voteHistoryCount}
            data={voteHistory}
            noDataMessage="No data to show. You can see your vote history here after proposals meet their threshold deadline."
            uniqueId="vote-history"
            showStatus
            showVoteStats
            fetchNextPage={() => {
              void voteHistoryQuery.fetchNextPage();
            }}
            hasNextPage={voteHistoryQuery.hasNextPage}
            isFetchingNextPage={voteHistoryQuery.isFetchingNextPage}
          />
        </>
      )}
    </Box>
  );
}

function EmptyStateSection() {
  return (
    <Stack mt={11} alignItems="center" gap="14px">
      <InfoOutlined color="secondary" fontSize="large" />
      <Typography fontSize={20} fontWeight="bold" mt={1}>
        No data to show
      </Typography>
      <Typography fontSize={16}>
        This page will automatically update once there are in-flight proposals
      </Typography>
    </Stack>
  );
}

function ErrorStateSection() {
  return (
    <Stack mt={11} alignItems="center" gap="14px">
      <WarningAmberOutlined color="warning" fontSize="large" />
      <Typography fontSize={20} fontWeight="bold" mt={1}>
        Something went wrong
      </Typography>
      <Typography fontSize={16}>Please try to reload this page or contact support</Typography>
    </Stack>
  );
}
