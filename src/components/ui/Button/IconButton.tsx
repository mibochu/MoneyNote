import React from 'react';
import {
  IconButton as MuiIconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import type { IconButtonProps as MuiIconButtonProps } from '@mui/material';

export interface IconButtonProps extends MuiIconButtonProps {
  loading?: boolean;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  loading = false,
  disabled,
  tooltip,
  ...props
}) => {
  const button = (
    <MuiIconButton
      {...props}
      disabled={disabled || loading}
      sx={{
        position: 'relative',
        ...props.sx
      }}
    >
      {loading ? <CircularProgress size={20} /> : children}
    </MuiIconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default IconButton;