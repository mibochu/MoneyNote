import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import type { DialogProps } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface ModalProps extends Omit<DialogProps, 'title'> {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  fullScreenOnMobile?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  children,
  actions,
  onClose,
  showCloseButton = true,
  fullScreenOnMobile = true,
  ...dialogProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog
      {...dialogProps}
      onClose={handleClose}
      fullScreen={fullScreenOnMobile && isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile && fullScreenOnMobile ? 0 : 2,
          ...dialogProps.PaperProps?.sx
        },
        ...dialogProps.PaperProps
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}
        >
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {showCloseButton && onClose && (
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                color: theme.palette.grey[500]
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent
        sx={{
          pb: actions ? 1 : 3
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;