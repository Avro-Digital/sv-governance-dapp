// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/votes/VoteRequestFilterTable.tsx @ canton-network/splice 80488155

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef, type GridEventListener, type GridRowParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { CopyableTypography } from '@/components/votes/CopyableTypography';
import { DateDisplay } from '@/components/votes/DateDisplay';
import type { VoteRequestModalState } from '@/components/votes/types';
import { getRawActionTag } from '@/lib/governance-transform';
import { getVoteRequestRouteId } from '@/lib/scan-client';
import type { ScanVoteRequestContract } from '@/lib/scan-types';

interface VoteRequestsFilterTableProps {
  readonly voteRequests: readonly ScanVoteRequestContract[];
  readonly openModalWithVoteRequest: (state: VoteRequestModalState) => void;
  readonly tableBodyId: string;
}

export function VoteRequestsFilterTable({
  voteRequests,
  openModalWithVoteRequest,
  tableBodyId,
}: VoteRequestsFilterTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'action',
      headerName: 'Action',
      width: 350,
      renderCell: (params) => (
        <Chip
          label={String(params.value)}
          color="primary"
          size="small"
          className="vote-row-action"
        />
      ),
    },
    {
      field: 'trackingCid',
      headerName: 'Tracking Id',
      width: 250,
      renderCell: (params) => (
        <CopyableTypography text={String(params.value)} maxWidth="150px" className="vote-row-tracking-id" />
      ),
    },
    {
      field: 'requester',
      headerName: 'Requester',
      width: 200,
      renderCell: (params) => (
        <CopyableTypography text={String(params.value)} maxWidth="150px" className="vote-row-requester" />
      ),
    },
    {
      field: 'expiresAt',
      headerName: 'Expires At',
      type: 'date',
      width: 250,
      renderCell: (params) => {
        const expiresAt = params.value as Date;
        return dayjs(expiresAt).isBefore(dayjs()) ? (
          <Typography variant="body2" data-testid="vote-row-expiry-date">
            Expired
          </Typography>
        ) : (
          <DateDisplay datetime={expiresAt} id="vote-row-expiry-date" />
        );
      },
    },
    {
      field: 'effectiveAt',
      headerName: 'Effective At',
      width: 250,
      renderCell: (params) => {
        const effectiveAt = params.value as Date | undefined;
        return effectiveAt !== undefined ? (
          <DateDisplay datetime={effectiveAt} id="vote-row-effective-at" />
        ) : (
          'threshold'
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      type: 'date',
      width: 250,
      renderCell: (params) => <DateDisplay datetime={params.value as Date} />,
    },
  ];

  const rows = voteRequests.map((request) => ({
    id: getVoteRequestRouteId(request),
    trackingCid: getVoteRequestRouteId(request),
    action: getRawActionTag(request.payload.action),
    requester: request.payload.requester,
    expiresAt: new Date(request.payload.voteBefore),
    effectiveAt:
      request.payload.targetEffectiveAt !== undefined
        ? new Date(request.payload.targetEffectiveAt)
        : undefined,
    createdAt: new Date(request.created_at),
  }));

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams) => {
    openModalWithVoteRequest({
      open: true,
      routeId: String(params.row.trackingCid),
      expiresAt: params.row.expiresAt as Date,
      effectiveAt: params.row.effectiveAt as Date | undefined,
    });
  };

  return (
    <div style={{ height: 450, width: '100%' }} id={tableBodyId} data-testid={tableBodyId}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          columns: { columnVisibilityModel: { createdAt: false } },
        }}
        pageSizeOptions={[5, 10, 25]}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        sx={{ cursor: 'pointer' }}
      />
    </div>
  );
}
