import React, { useContext, useMemo } from 'react';
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
  Stack
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Savings,
  Receipt
} from '@mui/icons-material';
import { ExpenseContext } from '../context/ExpenseContext';

function Dashboard() {
  const expenseContext = useContext(ExpenseContext);
  
  if (!expenseContext) {
    throw new Error('Dashboard must be used within ExpenseProvider');
  }

  const { state } = expenseContext;

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

    // 카테고리별 분류 계산
    const income = currentMonthExpenses
      .filter(expense => expense.category === '수입')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const savings = currentMonthExpenses
      .filter(expense => expense.category === '저축')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpenses = currentMonthExpenses
      .filter(expense => expense.category !== '수입' && expense.category !== '저축')
      .reduce((sum, expense) => sum + expense.amount, 0);

    // 예산 잔액 = 수입 - 지출 - 저축
    const budgetBalance = income - totalExpenses - savings;

    return {
      income,
      totalExpenses,
      savings,
      budgetBalance,
      currentMonthExpenses
    };
  }, [state.expenses]);

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
      .filter(expense => expense.category !== '수입' && expense.category !== '저축')
      .forEach(expense => {
        const method = expense.paymentMethod || '미지정';
        paymentMethods[method] = (paymentMethods[method] || 0) + expense.amount;
      });

    return Object.entries(paymentMethods)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4); // 상위 4개만 표시
  }, [monthlyStats.currentMonthExpenses]);

  // 금액 포맷 함수
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        💰 대시보드
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        가계부 현황을 한눈에 확인하세요
      </Typography>

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
            이번 달 지출 현황
          </Typography>
          {monthlyStats.currentMonthExpenses.length > 0 ? (
            <Box sx={{ height: 300, overflow: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                총 {monthlyStats.currentMonthExpenses.length}건의 거래
              </Typography>
              <Stack spacing={1}>
                {monthlyStats.currentMonthExpenses
                  .filter(expense => expense.category !== '수입' && expense.category !== '저축')
                  .slice(0, 10)
                  .map((expense, index) => (
                    <Box 
                      key={expense.id || index}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {expense.description || '설명 없음'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {expense.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="error" fontWeight="bold">
                        -{formatCurrency(expense.amount)}
                      </Typography>
                    </Box>
                  ))
                }
              </Stack>
            </Box>
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
                이번 달 지출 내역이 없습니다
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            최근 거래
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
        </Paper>
      </Box>

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
    </Box>
  );
};

export default Dashboard;