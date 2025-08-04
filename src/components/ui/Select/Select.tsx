import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText
} from '@mui/material';
import type { SelectProps as MuiSelectProps, FormControlProps } from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  variant?: 'filled' | 'outlined' | 'standard';
  fullWidth?: boolean;
  FormControlProps?: FormControlProps;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error = false,
  required = false,
  variant = 'outlined',
  fullWidth = true,
  FormControlProps,
  ...selectProps
}) => {
  const labelId = React.useMemo(() => 
    label ? `select-label-${Math.random().toString(36).substr(2, 9)}` : undefined, 
    [label]
  );

  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      error={error}
      required={required}
      {...FormControlProps}
    >
      {label && (
        <InputLabel id={labelId} shrink={selectProps.value !== ''}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        {...selectProps}
        labelId={labelId}
        label={label}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300
            }
          },
          ...selectProps.MenuProps
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Select;