import React from 'react';
import Modal from './Modal';
import type { ModalProps } from './Modal';
import { Button } from '../../ui/Button';

export interface FormModalProps extends Omit<ModalProps, 'children' | 'actions'> {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  showCancelButton?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  children,
  onSubmit,
  onCancel,
  onClose,
  submitText = '저장',
  cancelText = '취소',
  submitDisabled = false,
  loading = false,
  showCancelButton = true,
  ...modalProps
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const actions = (
    <>
      {showCancelButton && (
        <Button
          onClick={handleCancel}
          variant="outlined"
          disabled={loading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        form="form-modal-form"
        variant="contained"
        disabled={submitDisabled}
        loading={loading}
      >
        {submitText}
      </Button>
    </>
  );

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      actions={actions}
    >
      <form id="form-modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export default FormModal;