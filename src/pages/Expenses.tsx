import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  Snackbar,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Receipt,
  AccountBalance,
  TrendingUp,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

import { ExpenseFormContainer } from '../components/forms/ExpenseForm';
import { ExpectedExpenseForm } from '../components/forms/ExpectedExpenseForm';
import { ExpectedExpenseList } from '../components/common/ExpectedExpenseList';
import ExpenseList from '../features/expenses/components/ExpenseList';
import ExpenseEditDialog from '../features/expenses/components/ExpenseEditDialog';
import ExpenseDeleteConfirmDialog from '../features/expenses/components/ExpenseDeleteConfirmDialog';
import { useExpenses } from '../hooks/useExpenses';
import { useExpectedExpenses } from '../context/ExpectedExpenseContext';
import { formatResponsiveCurrency } from '../utils/formatters/currency';

import type { Expense, ExpenseFilter, ExpectedExpense, ExpectedExpenseFormData } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`expense-tabpanel-${index}`}
      aria-labelledby={`expense-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Expenses: React.FC = () => {
  const { state, deleteExpense, updateExpense, addExpense } = useExpenses();
  const { 
    state: expectedState, 
    addExpectedExpense, 
    updateExpectedExpense, 
    deleteExpectedExpense, 
    activateExpectedExpense,
    getFilteredExpectedExpenses
    // getExpectedExpenseStats // 미사용으로 주석 처리
  } = useExpectedExpenses();
  
  // 상태 관리
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExpectedFormOpen, setIsExpectedFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingExpectedExpense, setEditingExpectedExpense] = useState<ExpectedExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const expenses = state.expenses || [];
  const expectedExpenses = getFilteredExpectedExpenses();
  // const expectedStats = getExpectedExpenseStats(); // 미사용으로 주석 처리

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
  
  // 예상 지출 통계 (이번 달 미완료)
  const monthlyExpectedTotal = expectedExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.expectedDate);
      return !expense.isActivated &&
             expenseDate.getFullYear() === currentMonth.getFullYear() &&
             expenseDate.getMonth() === currentMonth.getMonth();
    })
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

  // 예상 지출 핸들러들
  const handleExpectedExpenseAdd = (data: ExpectedExpenseFormData) => {
    try {
      addExpectedExpense(data);
      showNotification('예상 지출이 등록되었습니다.', 'success');
      setIsExpectedFormOpen(false);
    } catch (error) {
      showNotification('예상 지출 등록 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleExpectedExpenseEdit = (expense: ExpectedExpense) => {
    setEditingExpectedExpense(expense);
    setIsExpectedFormOpen(true);
  };

  const handleExpectedExpenseUpdate = (data: ExpectedExpenseFormData) => {
    if (!editingExpectedExpense) return;
    
    try {
      updateExpectedExpense(editingExpectedExpense.id, data);
      showNotification('예상 지출이 수정되었습니다.', 'success');
      setEditingExpectedExpense(null);
      setIsExpectedFormOpen(false);
    } catch (error) {
      showNotification('예상 지출 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleExpectedExpenseDelete = (expenseId: string) => {
    try {
      deleteExpectedExpense(expenseId);
      showNotification('예상 지출이 삭제되었습니다.', 'success');
    } catch (error) {
      showNotification('예상 지출 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleExpectedExpenseActivate = (expectedExpense: ExpectedExpense) => {
    try {
      // 실제 지출로 전환
      const expenseData = {
        amount: expectedExpense.amount,
        category: expectedExpense.category,
        subcategory: expectedExpense.subcategory || '',
        description: expectedExpense.description,
        paymentMethod: expectedExpense.paymentMethod,
        tags: expectedExpense.tags,
        isFixed: false,
        date: new Date() // 현재 날짜로 설정
      };
      
      const expenseId = addExpense(expenseData);
      
      if (expenseId) {
        // 예상 지출을 활성화 상태로 변경
        activateExpectedExpense(expectedExpense.id, expenseId);
      } else {
        throw new Error('지출 추가에 실패했습니다.');
      }
      
      showNotification('예상 지출이 실제 지출로 전환되었습니다.', 'success');
    } catch (error) {
      showNotification('지출 전환 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseExpectedForm = () => {
    setIsExpectedFormOpen(false);
    setEditingExpectedExpense(null);
  };

  // 2025 React 패턴: 함수형 상태 업데이트 사용
  const showNotification = (message: string, severity: typeof notification.severity) => {
    setNotification(prev => ({
      ...prev,
      open: true,
      message,
      severity
    }));
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            💳 지출 관리
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            지출 내역을 관리하고 분석하세요
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{ px: 3, height: 'fit-content' }}
          >
            지출 추가
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setIsExpectedFormOpen(true)}
            sx={{ px: 3, height: 'fit-content' }}
          >
            예상 지출 등록
          </Button>
        </Box>
      </Box>

      {/* 요약 카드 - 수입관리와 동일한 스타일 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 3,
        mb: 3
      }}>        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt color="error" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                이번 달 총 지출
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="error"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                fontWeight: 700
              }}
            >
              {formatResponsiveCurrency(monthlyTotal)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance color="warning" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                고정 지출
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="warning.main"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 600
              }}
            >
              {formatResponsiveCurrency(monthlyFixed)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="info" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                변동 지출
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="info.main"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 600
              }}
            >
              {formatResponsiveCurrency(monthlyTotal - monthlyFixed)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon color="warning" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                예상 지출
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="warning.main"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 600
              }}
            >
              {formatResponsiveCurrency(monthlyExpectedTotal)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="지출 관리 탭"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 2, sm: 3 }
            }
          }}
        >
          <Tab label="실제 지출" />
          <Tab 
            label={`예상 지출 ${expectedExpenses.filter(e => !e.isActivated).length ? `(${expectedExpenses.filter(e => !e.isActivated).length})` : ''}`} 
          />
        </Tabs>
      </Paper>

      {/* 탭 콘텐츠 */}
      <TabPanel value={tabValue} index={0}>
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ExpectedExpenseList
          expectedExpenses={expectedExpenses}
          onEdit={handleExpectedExpenseEdit}
          onDelete={handleExpectedExpenseDelete}
          onActivate={handleExpectedExpenseActivate}
          loading={expectedState.loading}
          emptyMessage="예상 지출이 없습니다"
        />
      </TabPanel>


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

      {/* 예상 지출 등록/수정 다이얼로그 */}
      <Dialog
        open={isExpectedFormOpen}
        onClose={handleCloseExpectedForm}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingExpectedExpense ? '예상 지출 수정' : '예상 지출 등록'}
          <IconButton
            onClick={handleCloseExpectedForm}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <ExpectedExpenseForm
            initialData={editingExpectedExpense ? {
              description: editingExpectedExpense.description,
              amount: editingExpectedExpense.amount,
              category: editingExpectedExpense.category,
              subcategory: editingExpectedExpense.subcategory,
              expectedDate: editingExpectedExpense.expectedDate,
              isRecurring: editingExpectedExpense.isRecurring,
              tags: editingExpectedExpense.tags,
              paymentMethod: editingExpectedExpense.paymentMethod
            } : undefined}
            onSubmit={editingExpectedExpense ? handleExpectedExpenseUpdate : handleExpectedExpenseAdd}
            onCancel={handleCloseExpectedForm}
            loading={expectedState.loading}
            error={expectedState.error}
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