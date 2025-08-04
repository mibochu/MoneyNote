import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  Checkbox,
  ListItemText
} from '@mui/material';
import type { SelectProps as MuiSelectProps, FormControlProps } from '@mui/material';
import type { SelectOption } from './Select';

export interface MultiSelectProps extends Omit<MuiSelectProps<string[]>, 'variant' | 'multiple'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  variant?: 'filled' | 'outlined' | 'standard';
  fullWidth?: boolean;
  renderChips?: boolean;
  FormControlProps?: FormControlProps;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  helperText,
  error = false,
  required = false,
  variant = 'outlined',
  fullWidth = true,
  renderChips = true,
  FormControlProps,
  value = [],
  ...selectProps
}) => {
  const labelId = React.useMemo(() => 
    label ? `multi-select-label-${Math.random().toString(36).substr(2, 9)}` : undefined, 
    [label]
  );

  const getSelectedLabels = (selectedValues: string[]) => {
    return options
      .filter(option => selectedValues.includes(String(option.value)))
      .map(option => option.label);
  };

  const renderValue = (selected: string[]) => {
    if (!renderChips) {
      return getSelectedLabels(selected).join(', ');
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value) => {
          const option = options.find(opt => String(opt.value) === value);
          return (
            <Chip
              key={value}
              label={option?.label || value}
              size="small"
              sx={{ height: 24 }}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      error={error}
      required={required}
      {...FormControlProps}
    >
      {label && (
        <InputLabel id={labelId}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        {...selectProps}
        labelId={labelId}
        label={label}
        multiple
        value={value}
        renderValue={renderValue}
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
            <Checkbox 
              checked={value.includes(String(option.value))} 
              size="small"
            />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default MultiSelect;