import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'standard';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  variant = 'outlined',
  startAdornment,
  endAdornment,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getEndAdornment = () => {
    if (type === 'password' && showPasswordToggle) {
      return (
        <InputAdornment position="end">
          <IconButton
            onClick={handleTogglePassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
          {endAdornment}
        </InputAdornment>
      );
    }
    
    if (endAdornment) {
      return <InputAdornment position="end">{endAdornment}</InputAdornment>;
    }
    
    return undefined;
  };

  const getStartAdornment = () => {
    if (startAdornment) {
      return <InputAdornment position="start">{startAdornment}</InputAdornment>;
    }
    return undefined;
  };

  return (
    <TextField
      {...props}
      type={getInputType()}
      variant={variant}
      InputProps={{
        startAdornment: getStartAdornment(),
        endAdornment: getEndAdornment(),
        ...props.InputProps
      }}
    />
  );
};

export default Input;