import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { Fab } from '../components/ui/Button';
import { ExpenseFormContainer } from '../components/forms/ExpenseForm';
import ExpenseList from '../features/expenses/components/ExpenseList';
import ExpenseEditDialog from '../features/expenses/components/ExpenseEditDialog';
import ExpenseDeleteConfirmDialog from '../features/expenses/components/ExpenseDeleteConfirmDialog';
import { useExpenses } from '../hooks/useExpenses';

import type { Expense, ExpenseFilter } from '../features/expenses/types';

const Expenses: React.FC = () => {
  const { state, deleteExpense, updateExpense } = useExpenses();
  
  // 상태 관리
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const expenses = state.expenses || [];

  // 이번 달 통계 계산
  const currentMonth = new Date();
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === currentMonth.getFullYear() &&
           expenseDate.getMonth() === currentMonth.getMonth();
  });

  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyFixed = monthlyExpenses
    .filter(expense => expense.isFixed)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // 이벤트 핸들러들
  const handleExpenseEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleExpenseDelete = (expenseId: string) => {
    // 삭제할 지출을 찾아서 확인 다이얼로그 열기
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
      setDeletingExpense(expense);
    }
  };

  const handleDeleteConfirm = (expenseId: string) => {
    try {
      deleteExpense(expenseId);
      showNotification('지출이 삭제되었습니다.', 'success');
      setDeletingExpense(null);
    } catch (error) {
      showNotification('지출 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleExpenseSave = async (expenseId: string, formData: any) => {
    try {
      updateExpense(expenseId, formData);
      showNotification('지출이 수정되었습니다.', 'success');
      setEditingExpense(null);
    } catch (error) {
      showNotification('지출 수정 중 오류가 발생했습니다.', 'error');
      throw error; // ExpenseEditDialog에서 처리하도록
    }
  };

  const showNotification = (message: string, severity: typeof notification.severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        💳 지출 관리
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        지출 내역을 관리하고 분석하세요
      </Typography>

      {/* 월별 요약 카드 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            이번 달 지출 현황 ({currentMonth.getMonth() + 1}월)
          </Typography>
          
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap" useFlexGap>
            <Box>
              <Typography variant="h4" color="error" fontWeight="bold">
                ₩{monthlyTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 지출
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h5" color="warning.main" fontWeight="medium">
                ₩{monthlyFixed.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                고정 지출
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h5" color="info.main" fontWeight="medium">
                ₩{(monthlyTotal - monthlyFixed).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                변동 지출
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="text.primary">
                {monthlyExpenses.length}건
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 거래
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* 지출 목록 */}
      <ExpenseList
        expenses={expenses}
        loading={state.loading}
        error={state.error}
        onExpenseEdit={handleExpenseEdit}
        onExpenseDelete={handleExpenseDelete}
        filter={filter}
        onFilterChange={setFilter}
        showHeader={true}
        emptyMessage="아직 지출 내역이 없습니다"
      />

      {/* 지출 추가 플로팅 버튼 */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        tooltip="지출 추가"
        onClick={() => setIsFormOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 지출 추가 다이얼로그 */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          지출 추가
          <IconButton
            onClick={() => setIsFormOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <ExpenseFormContainer
            onSuccess={() => {
              setIsFormOpen(false);
              showNotification('지출이 추가되었습니다.', 'success');
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 지출 수정 다이얼로그 */}
      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleExpenseSave}
        loading={state.loading}
        error={state.error}
      />

      {/* 지출 삭제 확인 다이얼로그 */}
      <ExpenseDeleteConfirmDialog
        open={!!deletingExpense}
        expense={deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteConfirm}
        loading={state.loading}
      />

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Expenses;