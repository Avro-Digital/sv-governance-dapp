// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/PageSectionHeader.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageSectionHeaderProps {
  readonly title: string;
  readonly badgeCount?: number;
  readonly 'data-testid': string;
}

export function PageSectionHeader({
  title,
  badgeCount,
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
          color="error"
          sx={{ ml: 2 }}
          id={`${testId}-badge-count`}
          data-testid={`${testId}-badge-count`}
        />
      )}
    </Box>
  );
}
