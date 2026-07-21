// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/MemberIdentifier.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import {
  CopyableIdentifier,
  type CopyableIdentifierSize,
} from '@/components/governance/CopyableIdentifier';

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
    <CopyableIdentifier
      value={partyId}
      copyValue={partyId}
      {...(isYou ? { badge: 'You' } : {})}
      size={size}
      data-testid={testId}
    />
  );
}
