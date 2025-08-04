import React from 'react';
import {
  DialogContentText,
  Alert,
  AlertTitle
} from '@mui/material';
import Modal from './Modal';
import type { ModalProps } from './Modal';
import { Button } from '../../ui/Button';

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'actions'> {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  severity?: 'info' | 'warning' | 'error' | 'success';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  onClose,
  severity = 'info',
  loading = false,
  ...modalProps
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const actions = (
    <>
      <Button
        onClick={handleCancel}
        variant="outlined"
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        onClick={handleConfirm}
        variant="contained"
        color={severity === 'error' ? 'error' : 'primary'}
        loading={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      actions={actions}
      maxWidth="sm"
      fullWidth
    >
      <Alert severity={severity} sx={{ mb: 2 }}>
        <AlertTitle>{message}</AlertTitle>
        {description && (
          <DialogContentText>
            {description}
          </DialogContentText>
        )}
      </Alert>
    </Modal>
  );
};

export default ConfirmModal;