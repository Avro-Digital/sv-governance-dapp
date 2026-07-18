// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

/** Raw OpenAPI shapes from Scan `getDsoInfo` / vote request endpoints. */

export interface ScanVoteReason {
  readonly url: string;
  readonly body: string;
}

export interface ScanVote {
  readonly sv: string;
  readonly accept: boolean;
  readonly reason: ScanVoteReason;
  readonly optCastAt?: string;
}

export interface ScanActionRequiringConfirmation {
  readonly tag: string;
  readonly value: {
    readonly dsoAction?: {
      readonly tag: string;
      readonly value: Record<string, unknown>;
    };
    readonly amuletRulesAction?: {
      readonly tag: string;
      readonly value: Record<string, unknown>;
    };
  };
}

export interface ScanVoteRequestPayload {
  readonly dso: string;
  readonly votes: ReadonlyArray<readonly [string, ScanVote]>;
  readonly voteBefore: string;
  readonly requester: string;
  readonly reason: ScanVoteReason;
  readonly trackingCid: string | null;
  readonly targetEffectiveAt?: string;
  readonly action: ScanActionRequiringConfirmation;
}

export interface ScanVoteRequestContract {
  readonly template_id: string;
  readonly contract_id: string;
  readonly payload: ScanVoteRequestPayload;
  readonly created_at: string;
  /** Base64 blob for explicit disclosure in interactive submissions. */
  readonly created_event_blob?: string;
}

export interface ScanListVoteRequestsResponse {
  readonly dso_rules_vote_requests: readonly ScanVoteRequestContract[];
}

export interface ScanLookupVoteRequestResponse {
  readonly dso_rules_vote_request: ScanVoteRequestContract;
}

export interface ScanSvInfo {
  readonly name: string;
  readonly svRewardWeight: string;
  readonly participantId: string;
}

export interface ScanDsoInfoResponse {
  readonly sv_user: string;
  readonly sv_party_id: string;
  readonly dso_party_id: string;
  readonly voting_threshold: number;
  readonly dso_rules: {
    readonly contract: {
      /** Present on live Scan responses; optional in mock fixtures. */
      readonly contract_id?: string;
      readonly template_id?: string;
      /** Base64 blob for explicit disclosure in interactive submissions. */
      readonly created_event_blob?: string;
      readonly payload: {
        readonly svs: ReadonlyArray<readonly [string, ScanSvInfo]>;
        readonly config?: Record<string, unknown>;
      };
    };
  };
  readonly amulet_rules?: {
    readonly contract: {
      readonly contract_id?: string;
      readonly payload: {
        readonly configSchedule?: {
          readonly initialValue: Record<string, unknown>;
          readonly futureValues?: readonly unknown[];
        };
      };
    };
  };
}

export interface ScanVoteRequestOutcome {
  readonly tag: string;
  readonly value?: Record<string, unknown>;
}

/** Closed vote request result from Scan `listVoteRequestResults`. */
export interface ScanCloseVoteRequestResult {
  readonly request: ScanVoteRequestPayload;
  readonly completedAt: string;
  readonly outcome: ScanVoteRequestOutcome;
  readonly offboardedVoters?: readonly string[];
  readonly abstainingSvs?: readonly string[];
}

export interface ScanListVoteResultsRequest {
  readonly limit: number;
  readonly accepted?: boolean;
  readonly actionName?: string;
  readonly requester?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly pageToken?: number;
}

export interface ScanListVoteResultsResponse {
  readonly dso_rules_vote_results: readonly ScanCloseVoteRequestResult[];
  readonly next_page_token?: number | null;
}

export interface GovernanceSnapshot {
  readonly dsoInfo: ScanDsoInfoResponse;
  readonly voteRequests: readonly ScanVoteRequestContract[];
}
