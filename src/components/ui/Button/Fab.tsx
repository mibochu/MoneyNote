import React from 'react';
import {
  Fab as MuiFab,
  CircularProgress,
  Tooltip
} from '@mui/material';
import type { FabProps as MuiFabProps } from '@mui/material';

export interface FabProps extends MuiFabProps {
  loading?: boolean;
  tooltip?: string;
}

const Fab: React.FC<FabProps> = ({
  children,
  loading = false,
  disabled,
  tooltip,
  ...props
}) => {
  const fab = (
    <MuiFab
      {...props}
      disabled={disabled || loading}
      sx={{
        position: 'relative',
        ...props.sx
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiFab>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="left">
        {fab}
      </Tooltip>
    );
  }

  return fab;
};

export default Fab;