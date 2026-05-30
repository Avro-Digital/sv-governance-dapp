// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

export type VoteRequestModalState =
  | { readonly open: false }
  | {
      readonly open: true;
      readonly routeId: string;
      readonly expiresAt: Date;
      readonly effectiveAt: Date | undefined;
    };
