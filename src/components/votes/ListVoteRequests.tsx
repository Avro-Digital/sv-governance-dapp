// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/votes/ListVoteRequests.tsx @ canton-network/splice 80488155

import { useState, type ReactNode, type SyntheticEvent } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { ProposalListingSection } from '@/components/governance/ProposalListingSection';
import { useGovernanceVoteRequests } from '@/hooks/useGovernanceVoteRequests';
import { useVoteHistoryListing } from '@/hooks/useVoteRequestResults';

import { CreateVoteRequestForm } from './CreateVoteRequestForm';
import type { VoteRequestModalState, VoteResultModalState } from './types';
import { VoteRequestDetailPanel } from './VoteRequestDetailPanel';
import { VoteRequestsFilterTable } from './VoteRequestsFilterTable';
import { VoteResultModalView } from './VoteResultModalView';
import { VoteResultsFilterTable } from './VoteResultsFilterTable';

function tabProps(id: string) {
  return {
    id: `vote-tab-${id}`,
    'aria-controls': `vote-panel-${id}`,
  };
}

interface TabPanelProps {
  readonly children?: ReactNode;
  readonly index: number;
  readonly value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) {
    return null;
  }
  return (
    <Box role="tabpanel" id={`vote-panel-${String(index)}`} sx={{ pt: 3 }}>
      {children}
    </Box>
  );
}

export function ListVoteRequests() {
  const { isLoading, isError, error, dsoInfo, voteRequests, actionNeeded, inProgress, svPartyId } =
    useGovernanceVoteRequests();
  const voteHistoryQuery = useVoteHistoryListing(dsoInfo, svPartyId);
  const [tabIndex, setTabIndex] = useState(0);
  const [modalState, setModalState] = useState<VoteRequestModalState>({ open: false });
  const [resultModalState, setResultModalState] = useState<VoteResultModalState>({ open: false });

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const openModalWithVoteRequest = (state: VoteRequestModalState) => {
    setModalState(state);
  };

  const openModalWithVoteResult = (state: VoteResultModalState) => {
    setResultModalState(state);
  };

  const handleClose = () => {
    setModalState({ open: false });
    setResultModalState({ open: false });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading vote requests" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load vote requests'}
      </Alert>
    );
  }

  if (dsoInfo === undefined) {
    return <Alert severity="warning">Governance data is unavailable.</Alert>;
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4" component="h1">
        Vote Requests
      </Typography>

      <CreateVoteRequestForm dsoInfo={dsoInfo} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Vote request tabs">
          <Tab
            label="Action Needed"
            {...tabProps('action-needed')}
            icon={<Badge badgeContent={actionNeeded.length} color="error" sx={{ mx: 1 }} />}
            iconPosition="end"
          />
          <Tab
            label="In Progress"
            {...tabProps('in-progress')}
            data-testid="tab-panel-in-progress"
          />
          <Tab label="Executed" {...tabProps('executed')} />
          <Tab label="Rejected" {...tabProps('rejected')} />
        </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        <VoteRequestsFilterTable
          voteRequests={actionNeeded}
          openModalWithVoteRequest={openModalWithVoteRequest}
          tableBodyId="sv-voting-action-needed-table-body"
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <VoteRequestsFilterTable
          voteRequests={inProgress}
          openModalWithVoteRequest={openModalWithVoteRequest}
          tableBodyId="sv-voting-in-progress-table-body"
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <VoteResultsFilterTable
          tableType="Executed"
          openModalWithVoteResult={openModalWithVoteResult}
          tableBodyId="sv-vote-results-executed-table-body"
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        <VoteResultsFilterTable
          tableType="Rejected"
          openModalWithVoteResult={openModalWithVoteResult}
          tableBodyId="sv-vote-results-rejected-table-body"
        />
      </TabPanel>

      <ProposalListingSection
        sectionTitle="Vote History"
        data={voteHistoryQuery.voteHistory}
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

      <Modal
        open={modalState.open}
        onClose={handleClose}
        aria-labelledby="vote-request-modal-title"
        slotProps={{ root: { id: 'vote-request-modal-root' } }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
          <ClickAwayListener onClickAway={handleClose}>
            <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
              <Card variant="elevation">
                <CardHeader
                  title="Vote Request"
                  id="vote-request-modal-title"
                  action={
                    <IconButton
                      id="vote-request-modal-close-button"
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                />
                {modalState.open && (
                  <VoteRequestDetailPanel
                    modalState={modalState}
                    dsoInfo={dsoInfo}
                    knownRequests={voteRequests}
                  />
                )}
              </Card>
            </Container>
          </ClickAwayListener>
        </Box>
      </Modal>

      <Modal
        open={resultModalState.open}
        onClose={handleClose}
        aria-labelledby="vote-result-modal-title"
        slotProps={{ root: { id: 'vote-result-modal-root' } }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
          <ClickAwayListener onClickAway={handleClose}>
            <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
              <Card variant="elevation">
                <CardHeader
                  title="Vote Result"
                  id="vote-result-modal-title"
                  action={
                    <IconButton
                      id="vote-result-modal-close-button"
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                />
                {resultModalState.open && (
                  <VoteResultModalView
                    voteResult={resultModalState.voteResult}
                    dsoInfo={dsoInfo}
                    effectiveAt={resultModalState.effectiveAt}
                  />
                )}
              </Card>
            </Container>
          </ClickAwayListener>
        </Box>
      </Modal>
    </Stack>
  );
}
