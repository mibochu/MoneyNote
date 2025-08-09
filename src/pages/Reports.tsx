import React, { useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  CalendarToday
} from '@mui/icons-material';

import { PieChart, BarChart } from '../components/common/Charts';
import { ExpenseContext } from '../context/ExpenseContext';
import { useCategories } from '../hooks/useCategories';
import { formatResponsiveCurrency, getResponsiveCurrencyStyle } from '../utils/formatters/currency';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const expenseContext = useContext(ExpenseContext);
  const { state: categoryState } = useCategories();
  
  if (!expenseContext) {
    throw new Error('Reports must be used within ExpenseProvider');
  }
  
  const { state } = expenseContext;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 리포트 데이터 계산
  const reportData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 이번 달 지출
    const currentMonthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    // 지난 달 지출
    const lastMonthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return expenseDate.getMonth() === lastMonth && 
             expenseDate.getFullYear() === lastYear;
    });
    
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // 카테고리별 데이터
    const categoryData = new Map<string, { amount: number; color: string }>();
    const categoryColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#FD79A8', '#74B9FF'
    ];
    
    currentMonthExpenses.forEach(expense => {
      const category = categoryState.categories.find(cat => cat.id === expense.category);
      const categoryName = category?.name || '기타';
      
      if (!categoryData.has(categoryName)) {
        const colorIndex = categoryData.size % categoryColors.length;
        categoryData.set(categoryName, { 
          amount: 0, 
          color: categoryColors[colorIndex] 
        });
      }
      
      const current = categoryData.get(categoryName)!;
      categoryData.set(categoryName, {
        ...current,
        amount: current.amount + expense.amount
      });
    });
    
    // 월별 추이 (6개월)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthStr = targetDate.getMonth() + 1;
      const yearStr = targetDate.getFullYear();
      
      const monthExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === targetDate.getFullYear() && 
               expenseDate.getMonth() === targetDate.getMonth();
      });
      
      const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrend.push({
        label: yearStr === currentYear ? `${monthStr}월` : `${yearStr}.${monthStr}`,
        value: totalAmount
      });
    }
    
    // 일 평균 지출
    const currentDay = now.getDate();
    const dailyAverage = currentMonthTotal > 0 ? Math.round(currentMonthTotal / currentDay) : 0;
    
    // 전월 대비 비율
    const monthlyChangePercentage = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;
    
    return {
      currentMonthTotal,
      lastMonthTotal,
      dailyAverage,
      monthlyChangePercentage,
      categoryData: Array.from(categoryData.entries()).map(([label, data]) => ({
        label,
        value: data.amount,
        color: data.color
      })),
      monthlyTrend
    };
  }, [state.expenses, categoryState.categories]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
          📈 리포트
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
          지출 패턴을 분석하고 인사이트를 얻으세요
        </Typography>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 3 }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="리포트 탭"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                minHeight: { xs: 48, sm: 56 },
                px: { xs: 2, sm: 3 }
              }
            }}
          >
            <Tab label="월별 분석" />
            <Tab label="카테고리별" />
            <Tab label="트렌드 분석" />
            <Tab label="비교 분석" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 2 }}>
              <Paper sx={{ p: { xs: 4, sm: 5, md: 6 }, height: { xs: 450, sm: 550, md: 600 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <BarChartIcon color="primary" sx={{ fontSize: '2rem' }} />
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                    월별 지출 현황
                  </Typography>
                </Box>
                {reportData.monthlyTrend.some(item => item.value > 0) ? (
                  <BarChart 
                    data={reportData.monthlyTrend}
                    height={400}
                    color="#1976d2"
                  />
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary" variant="h6">
                      지출 내역이 없습니다
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 3, height: { xs: 240, sm: 260, md: 280 } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    이번 달 총 지출
                  </Typography>
                  <Typography 
                    variant="h2" 
                    color="error"
                    sx={{
                      ...getResponsiveCurrencyStyle(reportData.currentMonthTotal),
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      mb: 2
                    }}
                  >
                    {formatResponsiveCurrency(reportData.currentMonthTotal)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    전월 대비 {reportData.monthlyChangePercentage >= 0 ? '+' : ''}{reportData.monthlyChangePercentage.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ height: { xs: 240, sm: 260, md: 280 } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    일 평균 지출
                  </Typography>
                  <Typography 
                    variant="h2" 
                    color="primary"
                    sx={{
                      ...getResponsiveCurrencyStyle(reportData.dailyAverage),
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      mb: 2
                    }}
                  >
                    {formatResponsiveCurrency(reportData.dailyAverage)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    이번 달 현재 평균
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, height: { xs: 500, sm: 550, md: 600 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PieChartIcon color="primary" sx={{ fontSize: '2rem' }} />
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                    카테고리별 지출 비율
                  </Typography>
                </Box>
                {reportData.categoryData.length > 0 ? (
                  <PieChart 
                    data={reportData.categoryData}
                    height={400}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary" variant="h6">
                      카테고리별 지출 데이터가 없습니다
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, height: { xs: 500, sm: 550, md: 600 }, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  카테고리별 상세 분석
                </Typography>
                {reportData.categoryData.length > 0 ? (
                  <Box sx={{ height: { xs: 380, sm: 430, md: 480 }, overflow: 'auto' }}>
                    {reportData.categoryData.map((category, index) => {
                      const percentage = reportData.currentMonthTotal > 0 
                        ? ((category.value / reportData.currentMonthTotal) * 100).toFixed(1) 
                        : '0.0';
                      
                      return (
                        <Box 
                          key={category.label} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: { xs: 2.5, sm: 3 }, 
                            mb: 1.5,
                            bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: category.color
                              }}
                            />
                            <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                              {category.label}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                              {formatResponsiveCurrency(category.value)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              {percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: { xs: 380, sm: 430, md: 480 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary" variant="h6">
                      카테고리별 분석 데이터가 없습니다
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, minHeight: 500 }}>
            <Box sx={{ flex: 2 }}>
              <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, height: { xs: 500, sm: 550, md: 600 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TrendingUp color="primary" sx={{ fontSize: '2rem' }} />
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                    지출 트렌드 분석
                  </Typography>
                </Box>
                {reportData.monthlyTrend.some(item => item.value > 0) ? (
                  <BarChart 
                    data={reportData.monthlyTrend}
                    height={400}
                    color="#9C27B0"
                  />
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary" variant="h6">
                      트렌드 데이터가 충분하지 않습니다
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 3, height: { xs: 240, sm: 260, md: 280 } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    트렌드 요약
                  </Typography>
                  <Typography variant="h2" color={reportData.monthlyChangePercentage >= 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                    {reportData.monthlyChangePercentage >= 0 ? '상승세' : '하락세'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    지난달 대비 {reportData.monthlyChangePercentage >= 0 ? '+' : ''}{reportData.monthlyChangePercentage.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ height: { xs: 240, sm: 260, md: 280 } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    평균 지출
                  </Typography>
                  <Typography 
                    variant="h2" 
                    color="primary"
                    sx={{
                      ...getResponsiveCurrencyStyle(reportData.monthlyTrend.reduce((sum, item) => sum + item.value, 0) / reportData.monthlyTrend.length),
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      mb: 2
                    }}
                  >
                    {formatResponsiveCurrency(reportData.monthlyTrend.reduce((sum, item) => sum + item.value, 0) / reportData.monthlyTrend.length)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    최근 6개월 평균
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, minHeight: 500 }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, height: { xs: 500, sm: 550, md: 600 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CalendarToday color="primary" sx={{ fontSize: '2rem' }} />
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                    이번달 vs 지난달
                  </Typography>
                </Box>
                {reportData.currentMonthTotal > 0 || reportData.lastMonthTotal > 0 ? (
                  <BarChart 
                    data={[
                      { label: '이번달', value: reportData.currentMonthTotal },
                      { label: '지난달', value: reportData.lastMonthTotal }
                    ]}
                    height={400}
                    color="#FF6B6B"
                  />
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary" variant="h6">
                      비교할 데이터가 없습니다
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, height: { xs: 500, sm: 550, md: 600 }, overflow: 'hidden', borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  비교 분석 결과
                </Typography>
                
                <Box sx={{ height: { xs: 380, sm: 430, md: 480 }, overflow: 'auto', pr: 1 }}>
                  {reportData.categoryData.length > 0 ? (
                    <Box>
                      {/* 전체 지출 비교 */}
                      <Box sx={{ mb: 3, p: { xs: 2.5, sm: 3 }, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.25rem' }}>
                          전체 지출
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', mb: 0.5 }}>
                              이번달: {formatResponsiveCurrency(reportData.currentMonthTotal)}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                              지난달: {formatResponsiveCurrency(reportData.lastMonthTotal)}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h6" 
                            color={reportData.monthlyChangePercentage >= 0 ? 'error.main' : 'success.main'}
                            fontWeight="bold"
                            sx={{ fontSize: '1.1rem' }}
                          >
                            {reportData.monthlyChangePercentage >= 0 ? '+' : ''}{reportData.monthlyChangePercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* 카테고리별 비교 */}
                      {reportData.categoryData.slice(0, 6).map((category) => {
                        // 지난달 동일 카테고리 지출 계산
                        const now = new Date();
                        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                        const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                        
                        const lastMonthCategoryAmount = state.expenses
                          .filter(expense => {
                            const expenseDate = new Date(expense.date);
                            const expenseCategory = categoryState.categories.find(cat => cat.id === expense.category);
                            return expenseDate.getMonth() === lastMonth && 
                                   expenseDate.getFullYear() === lastYear &&
                                   expenseCategory?.name === category.label;
                          })
                          .reduce((sum, expense) => sum + expense.amount, 0);
                        
                        const diff = category.value - lastMonthCategoryAmount;
                        const diffPercentage = lastMonthCategoryAmount > 0 
                          ? ((diff / lastMonthCategoryAmount) * 100).toFixed(1) 
                          : category.value > 0 ? '신규' : '0.0';
                        
                        return (
                          <Box key={category.label} sx={{ mb: 3, p: { xs: 2.5, sm: 3 }, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.1rem' }}>
                              {category.label}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                                  이번달: {formatResponsiveCurrency(category.value)}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                  지난달: {formatResponsiveCurrency(lastMonthCategoryAmount)}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body1" 
                                color={diff >= 0 ? 'error.main' : 'success.main'}
                                fontWeight="bold"
                                sx={{ fontSize: '1rem' }}
                              >
                                {diffPercentage === '신규' ? '신규' : `${diff >= 0 ? '+' : ''}${diffPercentage}%`}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.50',
                        borderRadius: 2
                      }}
                    >
                      <Typography color="text.secondary" variant="h6">
                        비교할 카테고리 데이터가 없습니다
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;