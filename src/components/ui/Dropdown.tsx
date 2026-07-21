// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/ui/Dropdown.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export type DropdownState = 'default' | 'disabled' | 'error';

export interface DropdownOption {
  readonly value: string;
  readonly label: string;
  /** Optional per-option test id (defaults to value). */
  readonly testId?: string;
}

export interface DropdownProps {
  readonly options: readonly DropdownOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly label?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly state?: DropdownState;
  readonly id?: string;
  readonly labelId?: string;
  readonly testId?: string;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly fullWidth?: boolean;
  readonly sx?: SxProps<Theme>;
}

/** Figma Dev Mode `background: var(--grey54, #363636)`. */
const FIELD_BG = 'var(--grey54, #363636)';

/** Figma "Body M": Inter 14px/400/22px. */
const valueTextSx = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '22px',
  color: '#E2E2E2',
  fontFeatureSettings: "'liga' off, 'clig' off",
};

const placeholderTextSx = {
  ...valueTextSx,
  color: '#696969',
};

/** Figma "FIELD H": Inter Semi Bold 12px uppercase. */
const labelSx = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: '22px',
  textTransform: 'uppercase' as const,
  color: '#E2E2E2',
  mb: '8px',
};

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dropdown({
  options,
  value,
  onChange,
  onBlur,
  label,
  required = false,
  placeholder,
  helperText,
  state = 'default',
  id,
  labelId: labelIdProp,
  testId,
  disabled: disabledProp,
  error: errorProp,
  fullWidth = true,
  sx,
}: DropdownProps) {
  const isDisabled = disabledProp ?? state === 'disabled';
  const isError = errorProp ?? state === 'error';
  const resolvedId = id ?? testId ?? 'dropdown';
  const resolvedLabelId =
    labelIdProp ?? (label !== undefined ? `${resolvedId}-label` : undefined);

  const renderValue = (selected: string): ReactNode => {
    if (selected.length === 0) {
      return placeholder !== undefined ? (
        <Box component="span" sx={placeholderTextSx}>
          {placeholder}
        </Box>
      ) : null;
    }
    const option = options.find((candidate) => candidate.value === selected);
    return (
      <Box component="span" sx={valueTextSx}>
        {option?.label ?? selected}
      </Box>
    );
  };

  return (
    <FormControl fullWidth={fullWidth} error={isError} {...(sx !== undefined ? { sx } : {})}>
      {label !== undefined && (
        <Typography component="label" id={resolvedLabelId} htmlFor={resolvedId} sx={labelSx}>
          {label}
          {required && (
            <Box component="span" sx={{ color: '#E2E2E2', ml: '2px' }} aria-hidden="true">
              *
            </Box>
          )}
        </Typography>
      )}

      <Select
        {...(resolvedLabelId !== undefined ? { labelId: resolvedLabelId } : {})}
        id={resolvedId}
        data-testid={testId ?? resolvedId}
        displayEmpty={placeholder !== undefined}
        value={value}
        disabled={isDisabled}
        onChange={(event: SelectChangeEvent) => {
          onChange(event.target.value);
        }}
        {...(onBlur !== undefined ? { onBlur } : {})}
        IconComponent={ChevronDownIcon}
        renderValue={(selected) => renderValue(selected)}
        sx={(theme) => ({
          bgcolor: FIELD_BG,
          borderRadius: `${String(theme.shape.borderRadius)}px`,
          // Global MuiInputBase override paints the inner select with neutral[10];
          // repeat FIELD_BG on the inner element so the Figma background shows.
          '& .MuiSelect-select': {
            bgcolor: FIELD_BG,
            paddingBlock: '13px',
            paddingLeft: '16px',
          },
          '& .MuiSelect-icon': { color: '#E2E2E2' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
        })}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            data-testid={option.testId ?? option.value}
            sx={valueTextSx}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {helperText !== undefined && (
        <FormHelperText data-testid={`${resolvedId}-helper`}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
