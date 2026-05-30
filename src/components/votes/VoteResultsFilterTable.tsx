// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/votes/VoteResultsFilterTable.tsx @ canton-network/splice 80488155

import { useMemo } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef, type GridEventListener, type GridRowParams } from '@mui/x-data-grid';

import { CopyableTypography } from '@/components/votes/CopyableTypography';
import { DateDisplay } from '@/components/votes/DateDisplay';
import type { VoteRequestResultTableType, VoteResultModalState } from '@/components/votes/types';
import { useVoteRequestResults } from '@/hooks/useVoteRequestResults';
import { filterVoteResultsForTable, getRawActionTag } from '@/lib/governance-transform';
import { getClosedVoteResultRowId } from '@/lib/scan-client';
import type { ScanCloseVoteRequestResult } from '@/lib/scan-types';

interface VoteResultsFilterTableProps {
  readonly tableBodyId: string;
  readonly tableType: VoteRequestResultTableType;
  readonly openModalWithVoteResult: (state: VoteResultModalState) => void;
}

export function VoteResultsFilterTable({
  tableBodyId,
  tableType,
  openModalWithVoteResult,
}: VoteResultsFilterTableProps) {
  const accepted = tableType === 'Executed';
  const voteResultsQuery = useVoteRequestResults({ accepted });

  const filteredResults = useMemo(() => {
    if (voteResultsQuery.data === undefined) {
      return [];
    }
    return filterVoteResultsForTable(voteResultsQuery.data.dso_rules_vote_results, tableType);
  }, [voteResultsQuery.data, tableType]);

  const rows = filteredResults.map((result) => ({
    id: getClosedVoteResultRowId(result),
    actionName: getRawActionTag(result.request.action),
    requester: result.request.requester,
    expiresAt: new Date(result.request.voteBefore),
    effectiveAt: new Date(
      result.outcome.tag === 'VRO_Accepted' && typeof result.outcome.value?.effectiveAt === 'string'
        ? result.outcome.value.effectiveAt
        : result.completedAt,
    ),
    expired: result.outcome.tag === 'VRO_Expired',
    voteResult: result,
    acceptedVotes: result.request.votes.filter(([, vote]) => vote.accept).length,
    rejectedVotes: result.request.votes.filter(([, vote]) => !vote.accept).length,
  }));

  const columns: GridColDef[] = [
    {
      field: 'actionName',
      headerName: 'Action Name',
      width: 300,
      renderCell: (params) => (
        <Chip label={String(params.value)} color="secondary" size="small" className="vote-row-action" />
      ),
    },
    {
      field: 'requester',
      headerName: 'Requester',
      width: 250,
      renderCell: (params) => (
        <CopyableTypography text={String(params.value)} maxWidth="150px" className="vote-row-requester" />
      ),
    },
    {
      field: 'effectiveAt',
      headerName: tableType === 'Rejected' ? 'Rejected At' : 'Executed At',
      width: 200,
      renderCell: (params) => <DateDisplay datetime={params.value as Date} />,
    },
    {
      field: 'expiresAt',
      headerName: 'Expired At',
      width: 200,
      renderCell: (params) => <DateDisplay datetime={params.value as Date} />,
    },
    {
      field: 'acceptedVotes',
      headerName: 'Vote Status',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Stack spacing={2} direction="row">
          <Typography variant="h6">
            <ClearIcon color="error" fontSize="inherit" /> {params.row.rejectedVotes as number}
          </Typography>
          <Typography variant="h6">
            <CheckIcon color="success" fontSize="inherit" /> {params.row.acceptedVotes as number}
          </Typography>
        </Stack>
      ),
    },
  ];

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams) => {
    const voteResult = (params.row as { voteResult: ScanCloseVoteRequestResult }).voteResult;
    const effectiveAtRaw =
      voteResult.outcome.tag === 'VRO_Accepted' ? voteResult.outcome.value?.effectiveAt : undefined;

    openModalWithVoteResult({
      open: true,
      voteResult,
      tableType,
      effectiveAt:
        typeof effectiveAtRaw === 'string' ? new Date(effectiveAtRaw) : new Date(voteResult.completedAt),
    });
  };

  if (voteResultsQuery.isLoading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress aria-label="Loading vote results" />
      </Stack>
    );
  }

  if (voteResultsQuery.isError) {
    return <Typography color="error">Failed to load vote results.</Typography>;
  }

  return (
    <div style={{ height: 450, width: '100%' }} id={tableBodyId} data-testid={tableBodyId}>
      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        sx={{ cursor: 'pointer' }}
      />
    </div>
  );
}
