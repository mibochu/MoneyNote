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
  return (
    <Input
      {...props}
      type="date"
      startAdornment={<CalendarToday fontSize="small" />}
      inputProps={{
        min: minDate,
        max: maxDate, // today 제한 제거 - 미래 날짜도 선택 가능
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