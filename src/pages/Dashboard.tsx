import { useContext, useMemo, useState, useEffect } from 'react';
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
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Savings,
  Receipt,
  Add as AddIcon,
  Repeat as RepeatIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { ExpenseContext } from '../context/ExpenseContext';
import { useCategories } from '../hooks/useCategories';
import { useIncome } from '../hooks/useIncome';
import { useRecurring } from '../hooks/useRecurring';
import { PieChart, BarChart } from '../components/common/Charts';
import IncomeDialog from '../components/common/IncomeDialog';
import ExpenseDialog from '../components/common/ExpenseDialog';
import RecurringDialog from '../components/common/RecurringDialog';
import { formatResponsiveCurrency, getResponsiveCurrencyStyle } from '../utils/formatters/currency';
import type { IncomeFormData } from '../types/income.types';
import type { RecurringFormData } from '../types/recurring.types';

function Dashboard() {
  const expenseContext = useContext(ExpenseContext);
  const { state: categoryState } = useCategories();
  const { getMonthlyIncome, addIncome } = useIncome();
  const { 
    getUpcomingRecurringTransactions, 
    addRecurringTransaction,
    checkAndExecutePendingTransactions 
  } = useRecurring();
  
  // 다이얼로그 상태
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null);
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
  
  // 카테고리 ID 매핑 - 안전한 로직으로 변경
  // 기본 카테고리 ID 구조를 고려하여 매칭
  const incomeCategory = categoryState.categories.find(cat => 
    cat.name === '수입' || cat.name.includes('수입') || 
    cat.id === 'income' || cat.id === 'default-0' // 기본 카테고리 첫 번째는 수입
  );
  const savingsCategory = categoryState.categories.find(cat => 
    cat.name === '저축' || cat.name.includes('저축') || 
    cat.id === 'savings' || cat.id === 'default-1' // 기본 카테고리 두 번째는 저축
  );

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

    // 저축: 지출 중에서 저축 카테고리에 해당하는 것들을 계산
    // 저축 카테고리가 없으면 0으로 처리
    const savings = savingsCategory 
      ? currentMonthExpenses
          .filter(expense => expense.category === savingsCategory.id)
          .reduce((sum, expense) => sum + expense.amount, 0)
      : 0;

    // 실제 지출: 수입과 저축을 제외한 모든 거래
    const totalExpenses = currentMonthExpenses
      .filter(expense => {
        // 수입 카테고리 제외 (비정상적인 경우이지만 방어용)
        if (incomeCategory && expense.category === incomeCategory.id) return false;
        // 저축 카테고리 제외 (저축은 별도 계산)
        if (savingsCategory && expense.category === savingsCategory.id) return false;
        return true;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // 예산 잔액 = 수입 - (실제 지출 + 저축)
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
  
  // 지출 추가 처리
  const handleExpenseAdd = () => {
    try {
      // ExpenseFormContainer가 자체적으로 처리하므로 알림만 표시
      setNotification({
        open: true,
        message: '지출이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      setNotification({
        open: true,
        message: '지출 추가 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };
  
  // 반복 거래 추가 처리
  const handleRecurringAdd = (recurringData: RecurringFormData) => {
    try {
      addRecurringTransaction(recurringData);
      setNotification({
        open: true,
        message: '반복 거래가 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to add recurring transaction:', error);
      setNotification({
        open: true,
        message: '반복 거래 추가 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };
  
  // 버튼 메뉴 핸들링
  const handleAddButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddButtonAnchor(event.currentTarget);
  };
  
  const handleAddMenuClose = () => {
    setAddButtonAnchor(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // 대시보드 로드 시 반복 거래 자동 실행 체크
  useEffect(() => {
    const checkPendingTransactions = async () => {
      try {
        const results = await checkAndExecutePendingTransactions();
        if (results.length > 0) {
          const successCount = results.filter(r => r.success).length;
          setNotification({
            open: true,
            message: `반복 거래 ${successCount}건이 자동으로 실행되었습니다.`,
            severity: 'success'
          });
        }
      } catch (error) {
        console.error('Failed to check pending transactions:', error);
      }
    };
    
    checkPendingTransactions();
  }, [checkAndExecutePendingTransactions]);
  
  // 예정된 반복 거래 목록 (7일 이내)
  const upcomingRecurringTransactions = useMemo(() => {
    return getUpcomingRecurringTransactions(7);
  }, [getUpcomingRecurringTransactions]);
  
  // 실제 데이터 기반 차트 데이터 계산
  const chartData = useMemo(() => {
    // 카테고리별 지출 분석
    const categoryExpenses = new Map<string, { amount: number; color: string }>();
    const categoryColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#FD79A8', '#74B9FF'
    ];
    
    monthlyStats.currentMonthExpenses.forEach(expense => {
      const category = categoryState.categories.find(cat => cat.id === expense.category);
      const categoryName = category?.name || '기타';
      
      if (!categoryExpenses.has(categoryName)) {
        const colorIndex = categoryExpenses.size % categoryColors.length;
        categoryExpenses.set(categoryName, { 
          amount: 0, 
          color: categoryColors[colorIndex] 
        });
      }
      
      const current = categoryExpenses.get(categoryName)!;
      categoryExpenses.set(categoryName, {
        ...current,
        amount: current.amount + expense.amount
      });
    });
    
    // 차트용 데이터 변환
    const pieChartData = Array.from(categoryExpenses.entries()).map(([label, data]) => ({
      label,
      value: data.amount,
      color: data.color
    }));
    
    // 월별 지출 추이 (최근 6개월)
    const monthlyTrend = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = targetDate.getMonth() + 1;
      const monthExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        // 날짜 매칭
        const isTargetMonth = expenseDate.getFullYear() === targetDate.getFullYear() && 
                              expenseDate.getMonth() === targetDate.getMonth();
        if (!isTargetMonth) return false;
        
        // 수입과 저축 카테고리 제외 (대시보드 통계와 동일한 로직)
        if (incomeCategory && expense.category === incomeCategory.id) return false;
        if (savingsCategory && expense.category === savingsCategory.id) return false;
        return true;
      });
      
      const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrend.push({
        label: `${monthStr}월`,
        value: totalAmount
      });
    }
    
    return {
      pieChart: pieChartData,
      barChart: monthlyTrend
    };
  }, [monthlyStats.currentMonthExpenses, categoryState.categories, state.expenses]);

  // 금액 포맷 함수 (반응형)
  const formatCurrency = (amount: number): string => {
    return formatResponsiveCurrency(amount);
  };

  // 결제수단 이모지 매핑
  const getPaymentMethodEmoji = (method: string): string => {
    const emojiMap: Record<string, string> = {
      'card': '💳',
      'cash': '💵',
      'bank': '🏦',
      'mobile': '📱',
      'check': '📝',
      'transfer': '↔️',
      '미지정': '❓'
    };
    return emojiMap[method] || '💰';
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
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsExpenseDialogOpen(true)}
            sx={{ px: 3 }}
          >
            지출 추가
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsIncomeDialogOpen(true)}
            sx={{ px: 3 }}
          >
            수입 추가
          </Button>
          
          <Tooltip title="더 많은 옵션">
            <IconButton
              onClick={handleAddButtonClick}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={addButtonAnchor}
            open={Boolean(addButtonAnchor)}
            onClose={handleAddMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => {
                handleAddMenuClose();
                setIsRecurringDialogOpen(true);
              }}
            >
              <RepeatIcon sx={{ mr: 1 }} />
              반복 거래 추가
            </MenuItem>
          </Menu>
        </Box>
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
            <Typography 
              variant="h4" 
              color="primary"
              sx={getResponsiveCurrencyStyle(monthlyStats.income)}
            >
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
            <Typography 
              variant="h4" 
              color="error"
              sx={getResponsiveCurrencyStyle(monthlyStats.totalExpenses)}
            >
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
            <Typography 
              variant="h4" 
              color="success"
              sx={getResponsiveCurrencyStyle(monthlyStats.savings)}
            >
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
              sx={getResponsiveCurrencyStyle(monthlyStats.budgetBalance)}
            >
              {formatCurrency(monthlyStats.budgetBalance)}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* 예정된 반복 거래 */}
      {upcomingRecurringTransactions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon color="info" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                예정된 반복 거래 (7일 이내)
              </Typography>
            </Box>
            
            <List dense>
              {upcomingRecurringTransactions.slice(0, 5).map((upcoming) => {
                const rt = upcoming.recurringTransaction;
                const category = categoryState.categories.find(cat => cat.id === rt.category);
                
                return (
                  <ListItem key={rt.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={rt.type === 'income' ? '수입' : '지출'}
                            size="small"
                            color={rt.type === 'income' ? 'primary' : 'error'}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {rt.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({category?.name})
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="h6" color={rt.type === 'income' ? 'primary' : 'error'}>
                            {rt.type === 'income' ? '+' : '-'}{formatCurrency(rt.amount)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {upcoming.nextExecutionDate.toLocaleDateString('ko-KR')}
                            </Typography>
                            <Chip 
                              label={`${upcoming.daysUntilExecution}일 후`}
                              size="small"
                              variant="outlined"
                              color={upcoming.daysUntilExecution <= 1 ? 'error' : 'default'}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            
            {upcomingRecurringTransactions.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  총 {upcomingRecurringTransactions.length}건 중 5건 표시
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

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
          {chartData.pieChart.length > 0 ? (
            <Box sx={{ height: 320 }}>
              <PieChart 
                data={chartData.pieChart}
                height={280}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
                p: 3
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📈 아직 지출 내역이 없어요
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                '지출 추가' 버튼을 눌러 이번 달 첫 번째 지출을 기록해보세요!
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            월별 지출 추이
          </Typography>
          <Box sx={{ height: 320 }}>
            {chartData.barChart.some(item => item.value > 0) ? (
              <BarChart 
                data={chartData.barChart}
                height={280}
                color="#FF6B6B"
              />
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  p: 3
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  📉 지출 패턴을 분석하려면
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  몇 개월간 지출 데이터가 필요해요. 지출을 계속 기록해주세요!
                </Typography>
              </Box>
            )}
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
              {recentTransactions.map((transaction, index) => {
                // 카테고리 이름 찾기
                const category = categoryState.categories.find(cat => cat.id === transaction.category);
                const categoryName = category?.name || '기타';
                
                return (
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
                              categoryName === '수입' ? 'primary' :
                              categoryName === '저축' ? 'success' : 'error'
                            }
                            fontWeight="bold"
                          >
                            {categoryName === '수입' ? '+' : 
                             categoryName === '저축' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Chip 
                            label={categoryName} 
                            size="small" 
                            variant="outlined"
                            color={
                              categoryName === '수입' ? 'primary' :
                              categoryName === '저축' ? 'success' : 'default'
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString('ko-KR')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
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
                  {getPaymentMethodEmoji(method)} {method}
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

      {/* 지출 추가 다이얼로그 */}
      <ExpenseDialog
        open={isExpenseDialogOpen}
        onClose={() => setIsExpenseDialogOpen(false)}
        onSave={handleExpenseAdd}
      />
      
      {/* 수입 추가 다이얼로그 */}
      <IncomeDialog
        open={isIncomeDialogOpen}
        onClose={() => setIsIncomeDialogOpen(false)}
        onSave={handleIncomeAdd}
      />
      
      {/* 반복 거래 추가 다이얼로그 */}
      <RecurringDialog
        open={isRecurringDialogOpen}
        onClose={() => setIsRecurringDialogOpen(false)}
        onSave={handleRecurringAdd}
        categories={categoryState.categories}
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