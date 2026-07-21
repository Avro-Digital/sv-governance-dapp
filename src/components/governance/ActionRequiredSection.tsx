// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ActionRequiredSection.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import type { ReactNode } from 'react';


import East from '@mui/icons-material/East';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link as RouterLink } from 'react-router-dom';

import { CopyableIdentifier } from '@/components/governance/CopyableIdentifier';
import { MemberIdentifier } from '@/components/governance/MemberIdentifier';
import { PageSectionHeader } from '@/components/governance/PageSectionHeader';
import type { ActionRequiredItem } from '@/types/governance';

dayjs.extend(relativeTime);

interface ActionRequiredSectionProps {
  readonly actionRequiredRequests: readonly ActionRequiredItem[];
}

export function ActionRequiredSection({ actionRequiredRequests }: ActionRequiredSectionProps) {
  const sortedRequests = [...actionRequiredRequests].sort((a, b) =>
    dayjs(a.votingCloses).diff(dayjs(b.votingCloses)),
  );

  return (
    <Box sx={{ mb: 4 }} data-testid="action-required-section">
      <PageSectionHeader
        title="Action Required"
        badgeCount={sortedRequests.length}
        badgeColor="warning"
        data-testid="action-required"
      />

      <Stack gap={2}>
        {sortedRequests.length === 0 ? (
          <Alert severity="info" data-testid="action-required-section-no-items">
            No Action Required items available
          </Alert>
        ) : (
          sortedRequests.map((item) => (
            <ActionCard key={item.contractId} item={item} />
          ))
        )}
      </Stack>
    </Box>
  );
}

function ActionCard({ item }: { readonly item: ActionRequiredItem }) {
  const remainingTime = dayjs(item.votingCloses).fromNow(true);

  return (
    <RouterLink
      to={`/governance/proposals/${encodeURIComponent(item.contractId)}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      data-testid="action-required-card-link"
    >
      <Box
        sx={{
          bgcolor: 'colors.neutral.10',
          p: 2,
          borderRadius: '4px',
          '&:hover': { backgroundColor: '#363636' },
        }}
        data-testid="action-required-card"
      >
        <Stack direction="row" gap={5} alignItems="flex-start">
          <Box sx={{ flexShrink: 0 }}>
            <ActionCardSegment title="ACTION" content={item.actionName} testId="action-required-action" />
          </Box>
          <Box sx={{ flexShrink: 1, minWidth: 0, maxWidth: 200 }}>
            <ActionCardSegment
              title="DESCRIPTION"
              content={
                <Typography
                  variant="body1"
                  color="text.light"
                  fontWeight="medium"
                  fontSize={14}
                  lineHeight={1.4}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  data-testid="action-required-description-content"
                >
                  {item.description}
                </Typography>
              }
              testId="action-required-description"
            />
          </Box>
          <Box sx={{ flexShrink: 1, minWidth: 0, maxWidth: 300 }}>
            <ActionCardSegment
              title="CONTRACT ID"
              content={
                <CopyableIdentifier
                  value={item.contractId}
                  size="small"
                  data-testid="action-required-contract-id"
                />
              }
              testId="action-required-contract-id-segment"
            />
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <ActionCardSegment
              title="CREATED AT"
              content={item.createdAt}
              testId="action-required-created-at"
            />
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <ActionCardSegment
              title="REMAINING TIME"
              content={remainingTime}
              testId="action-required-voting-closes"
            />
          </Box>
          <Box sx={{ flexShrink: 1, minWidth: 0, maxWidth: 300 }}>
            <ActionCardSegment
              title="REQUESTER"
              content={
                <MemberIdentifier
                  partyId={item.requester}
                  isYou={item.isYou === true}
                  size="small"
                  data-testid="action-required-requester-identifier"
                />
              }
              testId="action-required-requester"
            />
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ ml: 'auto', flexShrink: 0, alignSelf: 'center' }}
            data-testid="action-required-view-details"
          >
            <Typography fontWeight={500} color="text.light">
              View Details
            </Typography>
            <East fontSize="small" color="secondary" />
          </Stack>
        </Stack>
      </Box>
    </RouterLink>
  );
}

function ActionCardSegment({
  title,
  content,
  testId,
}: {
  readonly title: string;
  readonly content: ReactNode;
  readonly testId: string;
}) {
  return (
    <Stack height="100%" justifyContent="space-between" data-testid={testId}>
      <Typography
        fontSize={12}
        lineHeight={2}
        fontWeight={700}
        variant="subtitle2"
        color="text.light"
        gutterBottom
        data-testid={`${testId}-title`}
      >
        {title}
      </Typography>
      {typeof content === 'string' ? (
        <Typography
          variant="body1"
          color="text.light"
          fontWeight="medium"
          fontSize={14}
          lineHeight={2}
          data-testid={`${testId}-content`}
        >
          {content}
        </Typography>
      ) : (
        content
      )}
    </Stack>
  );
}
