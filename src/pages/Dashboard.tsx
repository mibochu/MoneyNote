import { useContext, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Savings,
  Receipt,
  Add as AddIcon
} from '@mui/icons-material';
import { ExpenseContext } from '../context/ExpenseContext';
import { useCategories } from '../hooks/useCategories';
import { useIncome } from '../hooks/useIncome';
import { PieChart, BarChart } from '../components/common/Charts';
import IncomeDialog from '../components/common/IncomeDialog';
import type { IncomeFormData } from '../types/income.types';

function Dashboard() {
  const expenseContext = useContext(ExpenseContext);
  const { state: categoryState } = useCategories();
  const { getMonthlyIncome, addIncome } = useIncome();
  
  // 수입 다이얼로그 상태
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  if (!expenseContext) {
    throw new Error('Dashboard must be used within ExpenseProvider');
  }

  const { state } = expenseContext;
  
  // 카테고리 ID 매핑 찾기 (이름으로 고유한 ID 찾기)
  const incomeCategory = categoryState.categories.find(cat => cat.name === '수입');
  const savingsCategory = categoryState.categories.find(cat => cat.name === '저축');

  // 현재 월의 통계 계산 (2025년 React 패턴: useMemo로 성능 최적화)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    // 수입은 Income Context에서 가져오기
    const monthlyIncome = getMonthlyIncome(now);

    const savings = currentMonthExpenses
      .filter(expense => expense.category === savingsCategory?.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpenses = currentMonthExpenses
      .filter(expense => expense.category !== incomeCategory?.id && expense.category !== savingsCategory?.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    // 예살 잔액 = 수입 - 지출 - 저축
    const budgetBalance = monthlyIncome - totalExpenses - savings;

    return {
      income: monthlyIncome,
      totalExpenses,
      savings,
      budgetBalance,
      currentMonthExpenses
    };
  }, [state.expenses, getMonthlyIncome, incomeCategory?.id, savingsCategory?.id]);

  // 최근 거래 내역 (최근 5개)
  const recentTransactions = useMemo(() => {
    return [...state.expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [state.expenses]);

  // 결제수단별 집계 (이번 달 기준)
  const paymentMethodStats = useMemo(() => {
    const paymentMethods: Record<string, number> = {};
    
    monthlyStats.currentMonthExpenses
      .filter(expense => expense.category !== incomeCategory?.id && expense.category !== savingsCategory?.id)
      .forEach(expense => {
        const method = expense.paymentMethod || '미지정';
        paymentMethods[method] = (paymentMethods[method] || 0) + expense.amount;
      });

    return Object.entries(paymentMethods)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4); // 상위 4개만 표시
  }, [monthlyStats.currentMonthExpenses, incomeCategory?.id, savingsCategory?.id]);

  // 수입 추가 처리
  const handleIncomeAdd = (incomeData: IncomeFormData) => {
    try {
      addIncome(incomeData);
      setNotification({
        open: true,
        message: '수입이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to add income:', error);
      setNotification({
        open: true,
        message: '수입 추가 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 금액 포맷 함수
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            💰 대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            가계부 현황을 한눈에 확인하세요
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsIncomeDialogOpen(true)}
          sx={{ px: 3 }}
        >
          수입 추가
        </Button>
      </Box>

      {/* 요약 카드들 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                이번 달 수입
              </Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {formatCurrency(monthlyStats.income)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt color="error" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                이번 달 지출
              </Typography>
            </Box>
            <Typography variant="h4" color="error">
              {formatCurrency(monthlyStats.totalExpenses)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Savings color="success" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                이번 달 저축
              </Typography>
            </Box>
            <Typography variant="h4" color="success">
              {formatCurrency(monthlyStats.savings)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance color={monthlyStats.budgetBalance >= 0 ? "info" : "error"} />
              <Typography variant="h6" sx={{ ml: 1 }}>
                예산 잔액
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color={monthlyStats.budgetBalance >= 0 ? "info" : "error"}
            >
              {formatCurrency(monthlyStats.budgetBalance)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 차트 및 거래 영역 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3
      }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            카테고리별 지출 비율
          </Typography>
          {monthlyStats.currentMonthExpenses.length > 0 ? (
            <Box sx={{ height: 320 }}>
              <PieChart 
                data={[
                  { label: '식비', value: 150000, color: '#FF6B6B' },
                  { label: '교통', value: 80000, color: '#4ECDC4' },
                  { label: '쇼핑', value: 120000, color: '#45B7D1' },
                  { label: '기타', value: 50000, color: '#96CEB4' }
                ]}
                height={280}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1
              }}
            >
              <Typography color="text.secondary">
                이번 달 지출 내역이 없습니다
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            월별 지출 추이
          </Typography>
          <Box sx={{ height: 320 }}>
            <BarChart 
              data={[
                { label: '1월', value: 250000 },
                { label: '2월', value: 180000 },
                { label: '3월', value: 320000 },
                { label: '4월', value: 210000 },
                { label: '5월', value: 290000 },
                { label: '6월', value: 340000 }
              ]}
              height={280}
              color="#FF6B6B"
            />
          </Box>
        </Paper>
      </Box>

      {/* 최근 거래 내역 */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            최근 거래 내역
          </Typography>
          {recentTransactions.length > 0 ? (
            <List sx={{ height: 300, overflow: 'auto', p: 0 }}>
              {recentTransactions.map((transaction, index) => (
                <ListItem key={transaction.id || index} sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {transaction.description || '설명 없음'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={
                            transaction.category === '수입' ? 'primary' :
                            transaction.category === '저축' ? 'success' : 'error'
                          }
                          fontWeight="bold"
                        >
                          {transaction.category === '수입' ? '+' : 
                           transaction.category === '저축' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={transaction.category} 
                          size="small" 
                          variant="outlined"
                          color={
                            transaction.category === '수입' ? 'primary' :
                            transaction.category === '저축' ? 'success' : 'default'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.date).toLocaleDateString('ko-KR')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1
              }}
            >
              <Typography color="text.secondary">
                거래 내역이 없습니다
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 결제수단별 집계 */}
      {paymentMethodStats.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            이번 달 결제수단별 지출
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2
          }}>
            {paymentMethodStats.map(([method, amount]) => (
              <Box 
                key={method}
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {method}
                </Typography>
                <Typography variant="h6" color="error" fontWeight="bold">
                  {formatCurrency(amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((amount / monthlyStats.totalExpenses) * 100).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* 수입 추가 다이얼로그 */}
      <IncomeDialog
        open={isIncomeDialogOpen}
        onClose={() => setIsIncomeDialogOpen(false)}
        onSave={handleIncomeAdd}
      />

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default Dashboard;