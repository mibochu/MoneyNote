import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Alert,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';

import type { Expense, ExpenseFormData } from '../../../../types';
import { ExpenseFormContainer } from '../../../../components/forms/ExpenseForm';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface ExpenseEditDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: (expenseId: string, data: ExpenseFormData) => void;
  loading?: boolean;
  error?: string | null;
}

const ExpenseEditDialog: React.FC<ExpenseEditDialogProps> = ({
  open,
  expense,
  onClose,
  onSave: _onSave,
  loading: _loading = false,
  error = null
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isSaving, setIsSaving] = useState(false);

  // 다이얼로그가 열릴 때마다 저장 상태 리셋
  useEffect(() => {
    if (open) {
      setIsSaving(false);
    }
  }, [open]);

  const handleFormSuccess = async () => {
    // ExpenseFormContainer가 자체적으로 저장을 처리하므로
    // 성공 시에는 단순히 다이얼로그를 닫기만 하면 됨
    onClose();
  };

  const handleCancel = () => {
    if (!isSaving) {
      onClose();
    }
  };

  // 초기 데이터 변환
  const getInitialData = (): Partial<ExpenseFormData> | undefined => {
    if (!expense) return undefined;

    return {
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
      tags: expense.tags,
      isFixed: expense.isFixed,
      date: expense.date
    };
  };

  if (!expense) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      disableEscapeKeyDown={isSaving}
      aria-labelledby="expense-edit-dialog-title"
      aria-describedby="expense-edit-dialog-description"
    >
      <DialogTitle
        id="expense-edit-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            지출 수정
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expense.description} (₩{expense.amount.toLocaleString()})
          </Typography>
        </Box>

        <IconButton
          onClick={handleCancel}
          disabled={isSaving}
          size="small"
          sx={{ ml: 2 }}
          aria-label="닫기"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <Box id="expense-edit-dialog-description">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <ExpenseFormContainer
            initialData={getInitialData()}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
            editMode={true}
            expenseId={expense.id}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseEditDialog;