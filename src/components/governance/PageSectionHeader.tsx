// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/PageSectionHeader.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageSectionHeaderProps {
  readonly title: string;
  readonly badgeCount?: number;
  readonly badgeColor?: 'warning' | 'neutral';
  readonly 'data-testid': string;
}

export function PageSectionHeader({
  title,
  badgeCount,
  badgeColor = 'neutral',
  'data-testid': testId,
}: PageSectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" fontSize={18} data-testid={`${testId}-title`} id={`${testId}-title`}>
        {title}
      </Typography>
      {badgeCount !== undefined && (
        <Badge
          badgeContent={badgeCount}
          max={Number.MAX_SAFE_INTEGER}
          color={badgeColor}
          sx={{
            ml: 1,
            '& .MuiBadge-badge': {
              position: 'static',
              transform: 'none',
            },
            '& .MuiBadge-invisible': { display: 'none' },
          }}
          id={`${testId}-badge-count`}
          data-testid={`${testId}-badge-count`}
        />
      )}
    </Box>
  );
}
