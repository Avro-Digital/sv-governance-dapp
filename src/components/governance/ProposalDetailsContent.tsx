// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ProposalDetailsContent.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type SyntheticEvent,
} from 'react';

import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Edit from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link as RouterLink } from 'react-router-dom';

import { ConfigValuesChanges } from '@/components/governance/ConfigValuesChanges';
import { CopyableIdentifier } from '@/components/governance/CopyableIdentifier';
import { CopyableUrl } from '@/components/governance/CopyableUrl';
import { DetailItem } from '@/components/governance/DetailItem';
import { JsonDiffAccordion } from '@/components/governance/JsonDiffAccordion';
import { MemberIdentifier } from '@/components/governance/MemberIdentifier';
import { PrettyJsonDiff } from '@/components/governance/PrettyJsonDiff';
import { ProposalVoteForm } from '@/components/governance/ProposalVoteForm';
import { VoteStats } from '@/components/governance/VoteStats';
import type {
  ConfigRulesProposal,
  ProposalDetailsView,
  ProposalVote,
  ProposalVotingInformation,
  VoteTabFilter,
} from '@/types/governance';

dayjs.extend(relativeTime);

export interface ProposalDetailsContentProps {
  readonly currentSvPartyId: string;
  readonly contractId: string;
  readonly proposalDetails: ProposalDetailsView;
  readonly votingInformation: ProposalVotingInformation;
  readonly votes: readonly ProposalVote[];
}

export function ProposalDetailsContent({
  contractId,
  proposalDetails,
  votingInformation,
  votes,
  currentSvPartyId,
}: ProposalDetailsContentProps) {
  const isEffective =
    votingInformation.voteTakesEffect !== 'Threshold' &&
    dayjs(votingInformation.voteTakesEffect).isBefore(dayjs());
  const isClosed =
    proposalDetails.isVoteRequest !== true ||
    isEffective ||
    votingInformation.status === 'Rejected';

  const [voteTabValue, setVoteTabValue] = useState<VoteTabFilter>('all');
  const [editFormKey, setEditFormKey] = useState(0);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const yourVoteSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editFormKey > 0) {
      yourVoteSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editFormKey]);

  const yourVote = votes.find((vote) => vote.sv === currentSvPartyId);
  const hasVoted = yourVote?.vote === 'accepted' || yourVote?.vote === 'rejected';
  const isEditingVote = editFormKey > 0;
  const showVoteForm =
    proposalDetails.isVoteRequest === true &&
    !isClosed &&
    (!hasVoted || isEditingVote || voteSubmitted);

  const acceptedVotes = votes.filter((v) => v.vote === 'accepted');
  const rejectedVotes = votes.filter((v) => v.vote === 'rejected');
  const awaitingVotes = votes.filter((v) => v.vote === 'no-vote');

  const filteredVotes = ((): readonly ProposalVote[] => {
    switch (voteTabValue) {
      case 'accepted':
        return acceptedVotes;
      case 'rejected':
        return rejectedVotes;
      case 'no-vote':
        return awaitingVotes;
      default:
        return votes;
    }
  })();

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb="14px">
        <Typography variant="h4" fontSize={20} fontWeight={700} data-testid="proposal-details-title">
          Proposal Details
        </Typography>
        <Button
          component={RouterLink}
          to="/governance/proposals"
          size="small"
          color="secondary"
          startIcon={<ChevronLeft fontSize="small" />}
        >
          Back to all votes
        </Button>
      </Stack>

      <Stack sx={{ bgcolor: 'colors.neutral.10', p: { xs: 2, md: 6 } }} alignItems="center" gap={8}>
        <VoteSection title="Proposal Details" testId="proposal-details-proposal-details">
          <DetailItem
            label="Action"
            value={proposalDetails.actionName}
            labelId="proposal-details-action-label"
            valueId="proposal-details-action-value"
          />

          <DetailItem
            label="Vote Proposal Contract ID"
            value={
              <CopyableIdentifier
                value={contractId}
                size="large"
                data-testid="proposal-details-contractid-id"
              />
            }
            labelId="proposal-details-contractid-label"
          />

          {proposalDetails.action === 'SRARC_OffboardSv' && (
            <Box
              id="proposal-details-offboard-member-section"
              data-testid="proposal-details-offboard-member-section"
              sx={{ display: 'contents' }}
            >
              <DetailItem
                label="Member"
                value={
                  <MemberIdentifier
                    partyId={proposalDetails.proposal.memberToOffboard}
                    isYou={false}
                    size="large"
                    data-testid="proposal-details-member-party-id"
                  />
                }
              />
            </Box>
          )}

          {proposalDetails.action === 'SRARC_GrantFeaturedAppRight' && (
            <Box
              id="proposal-details-feature-app-section"
              data-testid="proposal-details-feature-app-section"
              sx={{ display: 'contents' }}
            >
              <DetailItem
                label="Provider Party ID"
                value={
                  <CopyableIdentifier
                    value={proposalDetails.proposal.provider}
                    size="large"
                    data-testid="proposal-details-feature-app-value"
                  />
                }
                labelId="proposal-details-feature-app-label"
              />
              <DetailItem
                label="Activity Weight"
                value={proposalDetails.proposal.activityWeight}
                labelId="proposal-details-feature-app-activity-weight-label"
                valueId="proposal-details-feature-app-activity-weight-value"
              />
            </Box>
          )}

          {proposalDetails.action === 'SRARC_RevokeFeaturedAppRight' && (
            <Box
              id="proposal-details-unfeature-app-section"
              data-testid="proposal-details-unfeature-app-section"
              sx={{ display: 'contents' }}
            >
              <DetailItem
                label="Featured Application Contract ID"
                value={
                  <CopyableIdentifier
                    value={proposalDetails.proposal.rightContractId}
                    size="large"
                    data-testid="proposal-details-unfeature-app-value"
                  />
                }
                labelId="proposal-details-unfeature-app-label"
              />
            </Box>
          )}

          {proposalDetails.action === 'SRARC_UpdateSvRewardWeight' && (
            <>
              <Box
                id="proposal-details-update-sv-reward-weight-section"
                data-testid="proposal-details-update-sv-reward-weight-section"
              >
                <DetailItem
                  label="Member"
                  value={
                    <MemberIdentifier
                      partyId={proposalDetails.proposal.svToUpdate}
                      isYou={false}
                      size="large"
                      data-testid="proposal-details-member-party-id"
                    />
                  }
                />
              </Box>
              <DetailItem
                label="Proposed Changes"
                value={
                  <ConfigValuesChanges
                    changes={[
                      {
                        fieldName: 'svRewardWeight',
                        label: 'Weight',
                        currentValue: proposalDetails.proposal.currentWeight,
                        newValue: proposalDetails.proposal.weightChange,
                      },
                    ]}
                  />
                }
              />
            </>
          )}

          {proposalDetails.action === 'SRARC_CreateUnallocatedUnclaimedActivityRecord' && (
            <Box
              id="proposal-details-unallocated-unclaimed-activity-record-section"
              data-testid="proposal-details-unallocated-unclaimed-activity-record-section"
              sx={{ display: 'contents' }}
            >
              <DetailItem
                label="Beneficiary"
                value={
                  <CopyableIdentifier
                    value={proposalDetails.proposal.beneficiary}
                    size="large"
                    data-testid="proposal-details-beneficiary-value"
                  />
                }
                labelId="proposal-details-beneficiary-label"
              />
              <DetailItem
                label="Amount"
                value={proposalDetails.proposal.amount}
                labelId="proposal-details-amount-label"
                valueId="proposal-details-amount-value"
              />
              <DetailItem
                label="Must Mint Before"
                value={proposalDetails.proposal.mintBefore}
                labelId="proposal-details-mint-before-label"
                valueId="proposal-details-mint-before-value"
              />
            </Box>
          )}

          {(proposalDetails.action === 'SRARC_SetConfig' ||
            proposalDetails.action === 'CRARC_SetConfig') && (
            <ConfigChangesSection proposal={proposalDetails.proposal} />
          )}

          <DetailItem
            label="Summary"
            value={proposalDetails.summary}
            labelId="proposal-details-summary-label"
            valueId="proposal-details-summary-value"
          />

          <DetailItem
            label="URL"
            value={
              <CopyableUrl url={proposalDetails.url} size="large" data-testid="proposal-details-url" />
            }
            labelId="proposal-details-url-label"
          />
        </VoteSection>

        <VoteSection title="Voting Information" testId="proposal-details-voting-information">
          <DetailItem
            label="Requester"
            value={
              <MemberIdentifier
                partyId={votingInformation.requester}
                isYou={votingInformation.requesterIsYou === true}
                size="large"
                data-testid="proposal-details-requester-party-id"
              />
            }
          />

          <DetailItem
            label="Threshold Deadline"
            value={
              <Stack gap={1}>
                <Box data-testid="proposal-details-voting-closes-duration">
                  {dayjs(votingInformation.votingThresholdDeadline).fromNow()}
                </Box>
                <Box data-testid="proposal-details-voting-closes-value">
                  {votingInformation.votingThresholdDeadline}
                </Box>
              </Stack>
            }
          />

          <DetailItem
            label="Voting Takes Effect On"
            value={
              <Stack gap={1}>
                <Box data-testid="proposal-details-vote-takes-effect-duration">
                  {votingInformation.voteTakesEffect === 'Threshold'
                    ? 'Threshold'
                    : dayjs(votingInformation.voteTakesEffect).fromNow()}
                </Box>
                {votingInformation.voteTakesEffect !== 'Threshold' && (
                  <Box data-testid="proposal-details-vote-takes-effect-value">
                    {votingInformation.voteTakesEffect}
                  </Box>
                )}
              </Stack>
            }
          />

          <DetailItem
            label="Status"
            value={votingInformation.status}
            labelId="proposal-details-status-label"
            valueId="proposal-details-status-value"
          />
        </VoteSection>

        <VoteSection title="Votes" testId="proposal-details-votes">
          <Tabs
            value={voteTabValue}
            onChange={(_event: SyntheticEvent, newValue: VoteTabFilter) => {
              setVoteTabValue(newValue);
            }}
            aria-label="vote tabs"
            data-testid="votes-tabs"
            sx={{
              boxShadow: 'inset 0 -2px 0 0 rgba(255, 255, 255, 0.12)',
              '& .MuiTabs-indicator': {
                backgroundColor: 'colors.tertiary',
                height: '2px',
              },
            }}
          >
            <Tab label={`All (${String(votes.length)})`} value="all" data-testid="all-votes-tab" />
            <Tab
              label={`Accepted (${String(acceptedVotes.length)})`}
              value="accepted"
              data-testid="accepted-votes-tab"
            />
            <Tab
              label={`Rejected (${String(rejectedVotes.length)})`}
              value="rejected"
              data-testid="rejected-votes-tab"
            />
            <Tab
              label={`${isClosed ? 'Did not Vote' : 'Awaiting Response'} (${String(awaitingVotes.length)})`}
              value="no-vote"
              data-testid="no-vote-votes-tab"
            />
          </Tabs>

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            data-testid="proposal-details-votes-list"
          >
            {filteredVotes.map((vote, index) => (
              <VoteItem
                key={`${vote.sv}-${String(index)}`}
                vote={vote}
                isClosed={isClosed}
                onEdit={
                  vote.isYou === true && hasVoted && !isClosed
                    ? () => {
                        setEditFormKey((key) => key + 1);
                      }
                    : undefined
                }
              />
            ))}
            {filteredVotes.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No votes found for this category.
                </Typography>
              </Box>
            )}
          </Box>
        </VoteSection>

        {showVoteForm && (
          <VoteSection
            title="Your Vote"
            testId="proposal-details-your-vote"
            bordered
            centered
            ref={yourVoteSectionRef}
          >
            <ProposalVoteForm
              key={editFormKey}
              voteRequestContractId={contractId}
              currentSvPartyId={currentSvPartyId}
              votes={votes}
              onSubmissionStart={() => {
                setVoteSubmitted(true);
              }}
            />
          </VoteSection>
        )}
      </Stack>
    </Box>
  );
}

function ConfigChangesSection({ proposal }: { readonly proposal: ConfigRulesProposal }) {
  const actualConfig = proposal.actualConfig ?? proposal.baseConfig;

  return (
    <>
      <DetailItem
        label="Proposed Changes"
        value={<ConfigValuesChanges changes={proposal.configChanges} />}
      />
      <JsonDiffAccordion variant="review">
        {actualConfig !== undefined ? (
          <PrettyJsonDiff
            changes={{
              newConfig: proposal.newConfig,
              actualConfig,
              ...(proposal.baseConfig !== undefined ? { baseConfig: proposal.baseConfig } : {}),
            }}
          />
        ) : null}
      </JsonDiffAccordion>
    </>
  );
}

interface VoteSectionProps extends PropsWithChildren {
  readonly title: string;
  readonly testId: string;
  readonly bordered?: boolean | undefined;
  readonly centered?: boolean | undefined;
}

const VoteSection = forwardRef<HTMLDivElement, VoteSectionProps>(function VoteSection(
  { title, children, testId, bordered = false, centered = false },
  ref,
) {
  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }} data-testid={testId} ref={ref}>
      <Typography component="h2" fontSize={18} fontWeight={700} mb={3}>
        {title}
      </Typography>
      <Box
        sx={{
          ...(bordered === true && {
            border: 2,
            borderColor: 'divider',
            borderRadius: 2,
            py: 5,
            px: { xs: 2, md: 12 },
          }),
        }}
      >
        <Stack gap={3} alignItems={centered === true ? 'center' : undefined}>
          {children}
        </Stack>
      </Box>
    </Box>
  );
});

function VoteItem({
  vote,
  isClosed,
  onEdit,
}: {
  readonly vote: ProposalVote;
  readonly isClosed: boolean;
  readonly onEdit?: (() => void) | undefined;
}) {
  return (
    <>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
        data-testid="proposal-details-vote"
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <MemberIdentifier
              partyId={vote.sv}
              isYou={vote.isYou === true}
              size="large"
              data-testid="proposal-details-voter-party-id"
            />
          </Box>
          {vote.vote !== 'no-vote' && vote.reason.body.length > 0 && (
            <Typography fontSize={16} color="text.secondary">
              {vote.reason.body}
            </Typography>
          )}
          {vote.vote !== 'no-vote' && vote.reason.url.length > 0 && (
            <CopyableUrl url={vote.reason.url} size="small" data-testid="proposal-details-vote-url" />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <VoteStats
            vote={vote.vote}
            noVoteMessage={isClosed ? 'No Vote' : 'Awaiting Response'}
            data-testid="proposal-details-vote-status"
          />
          {onEdit !== undefined && (
            <Button
              color="secondary"
              startIcon={<Edit fontSize="small" />}
              onClick={onEdit}
              data-testid="your-vote-edit-button"
              sx={{ fontSize: 16 }}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
      <Divider sx={{ borderBottomWidth: 2 }} />
    </>
  );
}
