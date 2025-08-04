import React from 'react';
import Input from './Input';
import type { InputProps } from './Input';
import { CalendarToday } from '@mui/icons-material';

export interface DateInputProps extends Omit<InputProps, 'type'> {
  minDate?: string;
  maxDate?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  minDate,
  maxDate,
  ...props
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <Input
      {...props}
      type="date"
      startAdornment={<CalendarToday fontSize="small" />}
      inputProps={{
        min: minDate,
        max: maxDate || today,
        ...props.inputProps
      }}
      InputLabelProps={{
        shrink: true,
        ...props.InputLabelProps
      }}
    />
  );
};

export default DateInput;