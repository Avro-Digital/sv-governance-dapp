// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { VoteRequestModalView } from '@/components/votes/VoteRequestModalView';
import { useVoteRequestDetail } from '@/hooks/useVoteRequestDetail';
import { useIdentityStore } from '@/stores/identity';

export function VoteDetail() {
  const { id } = useParams<{ id: string }>();
  const contractId = id ?? '';
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const { data: detail, isLoading, isError, error } = useVoteRequestDetail(contractId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading vote request" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load vote request'}
      </Alert>
    );
  }

  if (detail === null || detail === undefined) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/votes" size="small">
            Back to votes
          </Button>
        }
      >
        Vote request not found: {decodeURIComponent(contractId)}
      </Alert>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <IconButton component={RouterLink} to="/votes" aria-label="Back to votes">
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Card variant="elevation">
          <CardHeader title="Vote Request" />
          <VoteRequestModalView
            contract={detail.contract}
            dsoInfo={detail.dsoInfo}
            svPartyId={partyId}
          />
        </Card>
      </Stack>
    </Container>
  );
}
