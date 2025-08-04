import React from 'react';
import Input from './Input';
import type { InputProps } from './Input';

export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'startAdornment'> {
  currency?: string;
  onAmountChange?: (amount: number) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currency = '₩',
  value,
  onChange,
  onAmountChange,
  ...props
}) => {
  const formatNumber = (num: string) => {
    const cleanNum = num.replace(/[^\d]/g, '');
    if (!cleanNum) return '';
    return parseInt(cleanNum).toLocaleString('ko-KR');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const cleanValue = inputValue.replace(/[^\d]/g, '');
    const numericValue = cleanValue ? parseInt(cleanValue) : 0;
    
    const formattedValue = formatNumber(inputValue);
    
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        value: formattedValue
      }
    };
    
    onChange?.(newEvent);
    onAmountChange?.(numericValue);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      startAdornment={currency}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9,]*',
        ...props.inputProps
      }}
      placeholder="0"
    />
  );
};

export default CurrencyInput;