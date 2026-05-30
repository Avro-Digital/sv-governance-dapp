// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { buildVoteHistoryListing } from '@/lib/governance-transform';
import { fetchVoteRequestResults } from '@/lib/mock-vote-results';
import type { ScanDsoInfoResponse, ScanListVoteResultsRequest } from '@/lib/scan-types';

const DEFAULT_LIMIT = 500;

export function useVoteRequestResults(query: Omit<ScanListVoteResultsRequest, 'limit' | 'pageToken'>) {
  return useQuery({
    queryKey: ['voteRequestResults', query],
    queryFn: () => fetchVoteRequestResults({ ...query, limit: DEFAULT_LIMIT }),
  });
}

export function useInfiniteVoteRequestResults(pageSize = 25) {
  return useInfiniteQuery({
    queryKey: ['voteRequestResults', 'infinite', pageSize],
    queryFn: ({ pageParam }) => {
      const request: ScanListVoteResultsRequest = {
        limit: pageSize,
        ...(pageParam !== undefined ? { pageToken: pageParam as number } : {}),
      };
      return fetchVoteRequestResults(request);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,
  });
}

export function useVoteHistoryListing(dsoInfo: ScanDsoInfoResponse | undefined, svPartyId: string) {
  const infiniteQuery = useInfiniteVoteRequestResults(25);

  const voteHistory =
    dsoInfo !== undefined && infiniteQuery.data !== undefined
      ? buildVoteHistoryListing(
          infiniteQuery.data.pages.flatMap((page) => page.dso_rules_vote_results),
          dsoInfo,
          svPartyId,
        )
      : [];

  return {
    voteHistory,
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
  };
}
