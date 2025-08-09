import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { ExpenseFormContainer } from '../forms/ExpenseForm';
import type { ExpenseFormData } from '../../types/expense.types';

export interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (expenseData: ExpenseFormData) => void;
  initialData?: Partial<ExpenseFormData>;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleSuccess = () => {
    if (onSave) {
      // ExpenseFormContainer가 자체적으로 저장을 처리하므로
      // 성공 콜백만 실행
      onSave({} as ExpenseFormData); // 실제로는 컨테이너에서 처리됨
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="expense-dialog-title"
    >
      <DialogTitle
        id="expense-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            💸 {initialData ? '지출 수정' : '지출 추가'}
          </Typography>
          {initialData && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {initialData.description} • ₩{(initialData.amount || 0).toLocaleString()}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{ ml: 2 }}
          aria-label="닫기"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <ExpenseFormContainer
          initialData={initialData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          editMode={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;