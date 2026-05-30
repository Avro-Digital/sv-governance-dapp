// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from splice-common-frontend PartyId (layout parity for vote modal tables)

import { CopyableTypography } from '@/components/votes/CopyableTypography';

interface PartyIdProps {
  readonly partyId: string;
  readonly id?: string;
  readonly className?: string;
}

export function PartyId({ partyId, id, className }: PartyIdProps) {
  return (
    <CopyableTypography
      variant="body2"
      text={partyId}
      {...(id !== undefined ? { id } : {})}
      {...(className !== undefined ? { className } : {})}
      maxWidth="280px"
    />
  );
}
