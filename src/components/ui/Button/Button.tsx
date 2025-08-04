import React from 'react';
import {
  Button as MuiButton,
  CircularProgress
} from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        position: 'relative',
        ...props.sx
      }}
    >
      {loading ? '처리 중...' : children}
    </MuiButton>
  );
};

export default Button;