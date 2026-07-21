// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type {
  GovernanceSnapshot,
  ScanCountVoteResultsRequest,
  ScanCountVoteResultsResponse,
  ScanDsoInfoResponse,
  ScanListVoteRequestsResponse,
  ScanListVoteResultsRequest,
  ScanListVoteResultsResponse,
  ScanLookupVoteRequestResponse,
  ScanVoteRequestContract,
} from '@/lib/scan-types';

export class ScanApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ScanApiError';
  }
}

export function getScanApiBaseUrl(): string {
  const url = import.meta.env.VITE_SCAN_URL?.trim();
  if (url === undefined || url.length === 0) {
    throw new Error('VITE_SCAN_URL is not configured');
  }
  return url.replace(/\/$/, '');
}

async function scanFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getScanApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ScanApiError(
      `Scan API ${path} failed (${String(response.status)})`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function getDsoInfo(): Promise<ScanDsoInfoResponse> {
  return scanFetch<ScanDsoInfoResponse>('/v0/dso');
}

/**
 * Lists inflight DSO vote requests.
 *
 * Uses `GET /v0/admin/sv/voterequests` — the same path as Splice Scan/SV frontends
 * (`scan.yaml` operationId `listDsoRulesVoteRequests`). Verified on localnet: returns
 * 200 without auth via `scan.localhost` nginx (no `/admin` gate on read path).
 */
export async function listDsoRulesVoteRequests(): Promise<readonly ScanVoteRequestContract[]> {
  const response = await scanFetch<ScanListVoteRequestsResponse>('/v0/admin/sv/voterequests');
  return response.dso_rules_vote_requests;
}

/**
 * Lookup by ledger `VoteRequest` contract ID (`scan.yaml`: `/v0/voterequests/{id}`).
 * Does not accept tracking CIDs — use {@link resolveVoteRequest} for route IDs.
 */
export async function lookupDsoRulesVoteRequest(
  contractId: string,
): Promise<ScanVoteRequestContract | null> {
  try {
    const response = await scanFetch<ScanLookupVoteRequestResponse>(
      `/v0/voterequests/${encodeURIComponent(contractId)}`,
    );
    return response.dso_rules_vote_request;
  } catch (error) {
    if (error instanceof ScanApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function findVoteRequestInSnapshot(
  routeId: string,
  voteRequests: readonly ScanVoteRequestContract[],
): ScanVoteRequestContract | undefined {
  return voteRequests.find(
    (contract) =>
      contract.contract_id === routeId ||
      contract.payload.trackingCid === routeId ||
      getVoteRequestRouteId(contract) === routeId,
  );
}

/**
 * Resolves a vote request from a URL/list route id (tracking CID or contract ID).
 * Lookup endpoint only accepts contract IDs; when `trackingCid` is set we fall back
 * to the snapshot match and re-fetch by `contract_id`.
 */
export async function resolveVoteRequest(
  routeId: string,
  knownRequests: readonly ScanVoteRequestContract[] = [],
): Promise<ScanVoteRequestContract | null> {
  const direct = await lookupDsoRulesVoteRequest(routeId);
  if (direct !== null) {
    return direct;
  }

  const known = findVoteRequestInSnapshot(routeId, knownRequests);
  if (known === undefined) {
    return null;
  }

  if (known.contract_id !== routeId) {
    const byContractId = await lookupDsoRulesVoteRequest(known.contract_id);
    return byContractId ?? known;
  }

  return null;
}

/** Route/list id — mirrors Splice `trackingCid || contractId`. */
export function getVoteRequestRouteId(contract: ScanVoteRequestContract): string {
  return contract.payload.trackingCid ?? contract.contract_id;
}

/** Display/route id for closed vote results — never fall back to DSO party id. */
export function getClosedVoteRequestRouteId(
  request: ScanVoteRequestContract['payload'],
): string | undefined {
  return request.trackingCid ?? undefined;
}

/** Stable DataGrid row id when {@link getClosedVoteRequestRouteId} is absent. */
export function getClosedVoteResultRowId(result: {
  readonly request: ScanVoteRequestContract['payload'];
  readonly completedAt: string;
  readonly outcome: { readonly tag: string };
}): string {
  return (
    getClosedVoteRequestRouteId(result.request) ??
    `${result.completedAt}:${result.outcome.tag}:${result.request.requester}`
  );
}

export async function fetchGovernanceSnapshot(): Promise<GovernanceSnapshot> {
  const [dsoInfo, voteRequests] = await Promise.all([getDsoInfo(), listDsoRulesVoteRequests()]);
  return { dsoInfo, voteRequests };
}

/**
 * Lists closed vote request results (`scan.yaml`: POST `/v0/admin/sv/voteresults`).
 */
export async function listVoteRequestResults(
  request: ScanListVoteResultsRequest,
): Promise<ScanListVoteResultsResponse> {
  return scanFetch<ScanListVoteResultsResponse>('/v0/admin/sv/voteresults', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/**
 * Counts closed vote results (`scan.yaml`: POST `/v0/admin/sv/voteresults/count`).
 * Returns `null` when the Scan instance predates the endpoint (July 2026 redesign)
 * so callers can fall back to counting loaded pages.
 */
export async function countVoteRequestResults(
  request: ScanCountVoteResultsRequest,
): Promise<number | null> {
  try {
    const response = await scanFetch<ScanCountVoteResultsResponse>(
      '/v0/admin/sv/voteresults/count',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    );
    return response.count;
  } catch (error) {
    if (error instanceof ScanApiError && [404, 405, 501].includes(error.status)) {
      return null;
    }
    throw error;
  }
}
