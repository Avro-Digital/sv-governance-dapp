// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type {
  GovernanceSnapshot,
  ScanDsoInfoResponse,
  ScanListVoteRequestsResponse,
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

export async function listDsoRulesVoteRequests(): Promise<readonly ScanVoteRequestContract[]> {
  const response = await scanFetch<ScanListVoteRequestsResponse>('/v0/admin/sv/voterequests');
  return response.dso_rules_vote_requests;
}

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

export async function fetchGovernanceSnapshot(): Promise<GovernanceSnapshot> {
  const [dsoInfo, voteRequests] = await Promise.all([getDsoInfo(), listDsoRulesVoteRequests()]);
  return { dsoInfo, voteRequests };
}
