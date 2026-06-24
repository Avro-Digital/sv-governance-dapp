// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { truncatePartyId } from '@/lib/wallet-identity';
import { useWalletSessionStore } from '@/stores/wallet-session';

export function WalletConnectToolbar() {
  const status = useWalletSessionStore((state) => state.status);
  const connectedPartyId = useWalletSessionStore((state) => state.connectedPartyId);
  const errorMessage = useWalletSessionStore((state) => state.errorMessage);
  const connect = useWalletSessionStore((state) => state.connect);
  const disconnect = useWalletSessionStore((state) => state.disconnect);

  const isBusy = status === 'initializing' || status === 'idle';
  const isConnected = status === 'connected' && connectedPartyId !== null;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" data-testid="wallet-connect-toolbar">
      {status === 'wallet_connection_failed' && errorMessage !== null ? (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            py: 0,
            px: 1,
            alignItems: 'center',
            bgcolor: 'rgba(211, 47, 47, 0.08)',
            color: 'error.light',
            borderColor: 'error.dark',
            '& .MuiAlert-message': { py: 0.5 },
          }}
          data-testid="wallet-connection-failed"
        >
          {errorMessage}
        </Alert>
      ) : null}

      {isConnected ? (
        <Tooltip title={connectedPartyId}>
          <Typography
            variant="body2"
            color="inherit"
            sx={{ maxWidth: 220, opacity: 0.9 }}
            data-testid="wallet-connected-party"
          >
            {truncatePartyId(connectedPartyId)}
          </Typography>
        </Tooltip>
      ) : null}

      <Box>
        {isConnected ? (
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => {
              void disconnect();
            }}
            data-testid="wallet-disconnect-button"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            color="inherit"
            size="small"
            variant="contained"
            startIcon={
              isBusy ? (
                <CircularProgress size={16} color="inherit" data-testid="wallet-connect-spinner" />
              ) : (
                <AccountBalanceWalletOutlinedIcon fontSize="small" />
              )
            }
            disabled={isBusy}
            onClick={() => {
              void connect();
            }}
            data-testid="wallet-connect-button"
          >
            Connect wallet
          </Button>
        )}
      </Box>
    </Stack>
  );
}
