// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/form-components/* (TextField, SelectField,
// ProposalTypeField, ProposalSummaryField, DateField, EffectiveDateField)
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset
//
// Controlled variants: the upstream fields bind to @tanstack/react-form contexts;
// these accept value/onChange directly so the wallet-signing form state stays local.

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MuiTextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  PROPOSAL_SUMMARY_SUBTITLE,
  PROPOSAL_SUMMARY_TITLE,
  DEFAULT_PROPOSAL_SUMMARY_MAX_LENGTH,
} from '@/utils/governance-constants';

interface FormTextFieldProps {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly subtitle?: string;
  readonly error?: string;
  readonly type?: string;
  readonly multiline?: boolean;
  readonly minRows?: number;
}

export function FormTextField({
  id,
  title,
  value,
  onChange,
  subtitle,
  error,
  type,
  multiline = false,
  minRows,
}: FormTextFieldProps) {
  return (
    <Box>
      <Typography variant="h6" id={`${id}-title`} data-testid={`${id}-title`} gutterBottom>
        {title}
      </Typography>

      <MuiTextField
        fullWidth
        variant="outlined"
        autoComplete="off"
        value={value}
        error={error !== undefined}
        helperText={error}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        inputProps={{ 'data-testid': id }}
        id={id}
        {...(type !== undefined ? { type } : {})}
        multiline={multiline}
        {...(minRows !== undefined ? { minRows } : {})}
        {...(type === 'datetime-local' ? { InputLabelProps: { shrink: true } } : {})}
      />
      {subtitle !== undefined && (
        <Typography variant="body2" color="text.secondary" data-testid={`${id}-subtitle`} mt={1}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export interface SelectFieldOption {
  readonly key: string;
  readonly value: string;
}

interface FormSelectFieldProps {
  readonly id: string;
  readonly title: string;
  readonly options: readonly SelectFieldOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly error?: string;
}

export function FormSelectField({
  id,
  title,
  options,
  value,
  onChange,
  placeholder,
  error,
}: FormSelectFieldProps) {
  const showPlaceholder = placeholder !== undefined && value.length === 0;

  return (
    <Box data-testid={`${id}-select-component`}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <FormControl variant="outlined" error={error !== undefined} fullWidth>
        <Select
          value={value}
          displayEmpty
          renderValue={(selected: string) => {
            if (selected.length === 0) {
              return showPlaceholder ? (
                <Typography component="span" color="text.secondary">
                  {placeholder}
                </Typography>
              ) : (
                ''
              );
            }
            return options.find((option) => option.value === selected)?.key ?? selected;
          }}
          onChange={(event: SelectChangeEvent) => {
            onChange(event.target.value);
          }}
          error={error !== undefined}
          id={`${id}-dropdown`}
          data-testid={id}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value} data-testid={`option-${option.key}`}>
              {option.key}
            </MenuItem>
          ))}
        </Select>
        {error !== undefined && (
          <FormHelperText data-testid={`${id}-error`}>{error}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
}

interface ProposalTypeFieldProps {
  readonly id: string;
  readonly value: string;
  readonly title?: string;
}

export function ProposalTypeField({ id, value, title = 'Proposal type' }: ProposalTypeFieldProps) {
  return (
    <Box>
      <Typography variant="h6" id={`${id}-title`} data-testid={`${id}-title`} gutterBottom>
        {title}
      </Typography>

      <Typography variant="h4" id={id} data-testid={id}>
        {value}
      </Typography>
    </Box>
  );
}

interface ProposalSummaryFieldProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly maxLength?: number;
}

export function ProposalSummaryField({
  id,
  value,
  onChange,
  error,
  maxLength = DEFAULT_PROPOSAL_SUMMARY_MAX_LENGTH,
}: ProposalSummaryFieldProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {PROPOSAL_SUMMARY_TITLE}
      </Typography>
      <MuiTextField
        fullWidth
        multiline
        rows={5}
        variant="outlined"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        error={error !== undefined}
        helperText={error}
        inputProps={{ 'data-testid': id, maxLength }}
        id={id}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
          gap: 2,
        }}
      >
        <Typography variant="body2" data-testid={`${id}-subtitle`}>
          {PROPOSAL_SUMMARY_SUBTITLE}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid={`${id}-character-counter`}
          sx={{ flexShrink: 0 }}
        >
          {value.length}/{maxLength}
        </Typography>
      </Box>
    </Box>
  );
}

interface DateTimeFieldProps {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly description?: string;
  readonly error?: string;
}

export function DateTimeField({
  id,
  title,
  value,
  onChange,
  description,
  error,
}: DateTimeFieldProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description !== undefined && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <MuiTextField
        fullWidth
        variant="outlined"
        type="datetime-local"
        value={value}
        error={error !== undefined}
        helperText={error}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        inputProps={{ 'data-testid': `${id}-field` }}
        id={`${id}-field`}
        className="effective-date-field"
      />
    </Box>
  );
}

export type EffectivityType = 'custom' | 'threshold';

export interface EffectivityValue {
  readonly type: EffectivityType;
  readonly effectiveDate?: string;
}

interface EffectiveDateFieldProps {
  readonly id: string;
  readonly value: EffectivityValue;
  readonly onChange: (value: EffectivityValue) => void;
  readonly initialEffectiveDate: string;
  readonly error?: string;
  readonly title?: string;
  readonly description?: string;
}

export function EffectiveDateField({
  id,
  value,
  onChange,
  initialEffectiveDate,
  error,
  title = 'Vote Proposal Effectivity',
  description = 'Select the date and time the proposal will take effect',
}: EffectiveDateFieldProps) {
  const handleTypeChange = (type: EffectivityType) => {
    if (type === 'custom') {
      onChange({ type: 'custom', effectiveDate: value.effectiveDate ?? initialEffectiveDate });
    } else {
      onChange({ type: 'threshold' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <RadioGroup
        value={value.type}
        onChange={(event) => {
          handleTypeChange(event.target.value as EffectivityType);
        }}
      >
        <FormControlLabel value="custom" control={<Radio />} label={<Typography>Date</Typography>} />

        {value.type === 'custom' && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {description}
            </Typography>

            <MuiTextField
              fullWidth
              variant="outlined"
              type="datetime-local"
              value={value.effectiveDate ?? ''}
              error={error !== undefined}
              helperText={error}
              onChange={(event) => {
                onChange({ type: 'custom', effectiveDate: event.target.value });
              }}
              inputProps={{ 'data-testid': `${id}-field` }}
              id={`${id}-field`}
              className="effective-date-field"
            />
          </>
        )}

        <FormControlLabel
          value="threshold"
          control={<Radio id="effective-at-threshold-radio" />}
          label={
            <Box>
              <Typography>Make effective at threshold</Typography>
              <Typography variant="body2" color="text.secondary">
                Allow the vote proposal to take effect immediately when 2/3 vote in favor
              </Typography>
            </Box>
          }
          sx={{ mt: 2 }}
        />
      </RadioGroup>
    </Box>
  );
}
