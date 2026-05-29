// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/CopyableUrl.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import OpenInNew from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export type CopyableUrlSize = 'small' | 'large';

interface CopyableUrlProps {
  readonly url: string;
  readonly size: CopyableUrlSize;
  readonly 'data-testid': string;
}

export function CopyableUrl({ url, size, 'data-testid': testId }: CopyableUrlProps) {
  if (url.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" data-testid={testId}>
        —
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }} data-testid={testId}>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        fontSize={size === 'small' ? 14 : 16}
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        data-testid={`${testId}-link`}
      >
        {url}
      </Link>
      <OpenInNew sx={{ fontSize: size === 'small' ? 14 : 18 }} color="action" />
    </Box>
  );
}
