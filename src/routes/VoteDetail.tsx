// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { useCastVote } from '@/hooks/useCastVote';
import { useIdentityStore } from '@/stores/identity';

export function VoteDetail() {
  const { id } = useParams<{ id: string }>();
  const identity = useIdentityStore((state) => state.identity);
  const contractId = id ?? '';
  const castVote = useCastVote(contractId);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Vote detail
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          VoteRequest contract ID: {contractId || 'unknown'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Voting as: {identity.displayName} ({identity.svName})
        </Typography>
        <Typography paragraph>
          Detail view will mirror Splice `ProposalDetailsContent.tsx` after UI extraction.
          Casting uses `useCastVote` → `ExternalSigner` (replacing Splice `SvAdminClient.castVote`).
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="contained" disabled={castVote.isPending || contractId.length === 0}>
            Cast Vote (not yet implemented)
          </Button>
          <Button component={RouterLink} to="/votes" variant="outlined">
            Back to list
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
