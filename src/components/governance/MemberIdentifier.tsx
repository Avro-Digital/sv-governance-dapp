// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/MemberIdentifier.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { CopyableIdentifier, type CopyableIdentifierSize } from '@/components/governance/CopyableIdentifier';

interface MemberIdentifierProps {
  readonly partyId: string;
  readonly isYou: boolean;
  readonly size: CopyableIdentifierSize;
  readonly 'data-testid': string;
}

export function MemberIdentifier({
  partyId,
  isYou,
  size,
  'data-testid': testId,
}: MemberIdentifierProps) {
  return (
    <Stack direction="row" alignItems="center" gap={1} data-testid={testId}>
      <CopyableIdentifier value={partyId} size={size} data-testid={`${testId}-party`} />
      {isYou && <Chip label="You" size="small" color="primary" data-testid={`${testId}-you`} />}
    </Stack>
  );
}
