// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CreateVoteRequestForm } from '@/components/votes/CreateVoteRequestForm';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';

const mutate = vi.fn();

vi.mock('@/hooks/useCreateVoteRequest', () => ({
  useCreateVoteRequest: () => ({
    mutate,
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

const DSO_INFO: ScanDsoInfoResponse = {
  sv_user: 'sv-user',
  sv_party_id: 'sv::1',
  dso_party_id: 'dso::1',
  voting_threshold: 2,
  dso_rules: {
    contract: {
      contract_id: 'dso-rules',
      payload: {
        svs: [
          ['sv::1', { name: 'SV One', svRewardWeight: '10000', participantId: 'participant::1' }],
          ['sv::2', { name: 'SV Two', svRewardWeight: '10000', participantId: 'participant::2' }],
        ],
        config: { voteRequestTimeout: { microseconds: '86400000000' } },
      },
    },
  },
};

describe('CreateVoteRequestForm', () => {
  it('builds an original-GUI offboard proposal for delegated signing', async () => {
    const user = userEvent.setup();
    render(<CreateVoteRequestForm dsoInfo={DSO_INFO} />);

    await user.click(screen.getByRole('button', { name: 'Create proposal' }));
    await user.click(screen.getByLabelText('Super Validator'));
    await user.click(screen.getByRole('option', { name: /SV Two/ }));
    await user.type(screen.getByLabelText('Summary'), 'Inactive operator');
    await user.type(screen.getByLabelText('URL'), 'https://example.com/proposals/2');
    await user.click(screen.getByTestId('create-voterequest-submit-button'));
    expect(screen.getByRole('heading', { name: 'Confirm Your Vote Request' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm and sign' }));

    expect(mutate).toHaveBeenCalledOnce();
    expect(mutate.mock.calls[0]?.[0]).toMatchObject({
      action: {
        tag: 'ARC_DsoRules',
        value: {
          dsoAction: {
            tag: 'SRARC_OffboardSv',
            value: { sv: 'sv::2' },
          },
        },
      },
      reasonUrl: 'https://example.com/proposals/2',
      reasonDescription: 'Inactive operator',
    });
  });
});
