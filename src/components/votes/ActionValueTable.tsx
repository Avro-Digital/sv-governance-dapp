// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from ActionValueTable in apps/common/frontend/src/components/votes/ActionView.tsx @ canton-network/splice 80488155

import type { ReactElement } from 'react';

import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

interface ActionValueTableProps {
  readonly actionType: string;
  readonly actionName: string;
  readonly valuesMap?: Readonly<Record<string, ReactElement>>;
}

export function ActionValueTable({ actionType, actionName, valuesMap }: ActionValueTableProps) {
  return (
    <TableContainer>
      <Table style={{ tableLayout: 'auto' }} className="sv-voting-table">
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="h6">Action Type</Typography>
            </TableCell>
            <TableCell>
              <Chip id="vote-request-modal-action-type" label={actionType} color="primary" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="h6">Action Name</Typography>
            </TableCell>
            <TableCell>
              <Chip id="vote-request-modal-action-name" label={actionName} color="primary" />
            </TableCell>
          </TableRow>
          {valuesMap !== undefined &&
            Object.entries(valuesMap).map(([key, value]) => (
              <TableRow key={key} id={key}>
                <TableCell>
                  <Typography variant="h6">{key}</Typography>
                </TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
