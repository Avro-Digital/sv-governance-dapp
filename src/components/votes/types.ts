// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { VoteRequestResultTableType } from '@/lib/governance-transform';
import type { ScanCloseVoteRequestResult } from '@/lib/scan-types';

export type { VoteRequestResultTableType };

export type VoteRequestModalState =
  | { readonly open: false }
  | {
      readonly open: true;
      readonly routeId: string;
      readonly expiresAt: Date;
      readonly effectiveAt: Date | undefined;
    };

export type VoteResultModalState =
  | { readonly open: false }
  | {
      readonly open: true;
      readonly voteResult: ScanCloseVoteRequestResult;
      readonly tableType: VoteRequestResultTableType;
      readonly effectiveAt?: Date | undefined;
    };
