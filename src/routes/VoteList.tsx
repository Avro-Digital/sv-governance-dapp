// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223


import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { useVotes } from '@/hooks/useVotes';

export function VoteList() {
  const { data: votes, isLoading, isError, error } = useVotes();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading votes" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load votes'}
      </Alert>
    );
  }

  if (votes === undefined || votes.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Governance votes
          </Typography>
          <Typography color="text.secondary">No votes loaded</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pending votes
        </Typography>
        <List>
          {votes.map((vote) => (
            <ListItem key={vote.contractId} disablePadding>
              <ListItemButton component={RouterLink} to={`/votes/${vote.contractId}`}>
                <ListItemText
                  primary={vote.actionName}
                  secondary={vote.description ?? vote.status}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Button component={RouterLink} to="/votes" variant="text" size="small">
          Refresh list
        </Button>
      </CardContent>
    </Card>
  );
}
