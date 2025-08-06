import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  Alert,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

import type { Expense } from '../../../../types';
import { PAYMENT_METHODS } from '../../../../utils/constants/paymentMethods';

export interface ExpenseDeleteConfirmDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (expenseId: string) => void;
  loading?: boolean;
  multiple?: boolean;
  selectedCount?: number;
}

const ExpenseDeleteConfirmDialog: React.FC<ExpenseDeleteConfirmDialogProps> = ({
  open,
  expense,
  onClose,
  onConfirm,
  loading = false,
  multiple = false,
  selectedCount = 0
}) => {
  const theme = useTheme();

  const handleConfirm = () => {
    if (expense) {
      onConfirm(expense.id);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!expense && !multiple) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'error.main',
          pb: 1
        }}
      >
        <WarningIcon color="error" />
        {multiple ? '지출 일괄 삭제' : '지출 삭제'}
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {multiple 
              ? `선택한 ${selectedCount}개의 지출을 삭제하시겠습니까?`
              : '이 지출을 삭제하시겠습니까?'
            }
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            삭제된 지출은 복구할 수 없습니다.
          </Typography>
        </Alert>

        {/* 단일 지출 상세 정보 */}
        {!multiple && expense && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: 1,
              borderColor: alpha(theme.palette.error.main, 0.2)
            }}
          >
            <Stack spacing={2}>
              {/* 기본 정보 */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  {expense.description}
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  ₩{expense.amount.toLocaleString()}
                </Typography>
              </Box>

              <Divider />

              {/* 상세 정보 */}
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(expense.date)}
                  </Typography>
                  {expense.isFixed && (
                    <Chip
                      label="고정지출"
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {expense.category}
                    {expense.subcategory && ` > ${expense.subcategory}`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WalletIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {PAYMENT_METHODS[expense.paymentMethod as keyof typeof PAYMENT_METHODS].icon} {PAYMENT_METHODS[expense.paymentMethod as keyof typeof PAYMENT_METHODS].label}
                  </Typography>
                </Box>

                {expense.tags.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 'fit-content', mt: 0.5 }}>
                      태그:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {expense.tags.map((tag: string, index: number) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Box>
        )}

        {/* 다중 선택 요약 */}
        {multiple && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: 1,
              borderColor: alpha(theme.palette.error.main, 0.2),
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="error.main" gutterBottom>
              {selectedCount}개 지출 선택됨
            </Typography>
            <Typography variant="body2" color="text.secondary">
              선택한 모든 지출이 영구적으로 삭제됩니다.
            </Typography>
          </Box>
        )}

        {/* 고정지출 경고 */}
        {expense?.isFixed && !multiple && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>고정지출</strong>을 삭제합니다. 다음 달에도 자동으로 추가되지 않습니다.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          취소
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? undefined : <DeleteIcon />}
          sx={{ minWidth: 100 }}
        >
          {loading ? '삭제 중...' : '삭제'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDeleteConfirmDialog;