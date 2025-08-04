import React from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning
} from '@mui/icons-material';

const Budget: React.FC = () => {
  const mockBudgets = [
    {
      category: '식비',
      budgetAmount: 300000,
      spentAmount: 145000,
      percentage: 48.3,
      status: 'good'
    },
    {
      category: '교통비',
      budgetAmount: 100000,
      spentAmount: 65000,
      percentage: 65,
      status: 'warning'
    },
    {
      category: '쇼핑',
      budgetAmount: 200000,
      spentAmount: 180000,
      percentage: 90,
      status: 'danger'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'error';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'danger': return <TrendingUp color="error" />;
      default: return <TrendingDown />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        📊 예산 관리
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        예산을 설정하고 지출을 추적하세요
      </Typography>

      {/* 예산 요약 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              총 예산
            </Typography>
            <Typography variant="h4" color="primary">
              ₩600,000
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              사용 금액
            </Typography>
            <Typography variant="h4" color="error">
              ₩390,000
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              남은 예산
            </Typography>
            <Typography variant="h4" color="success">
              ₩210,000
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 카테고리별 예산 현황 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          카테고리별 예산 현황
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3
        }}>
          {mockBudgets.map((budget) => (
            <Box key={budget.category} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStatusIcon(budget.status)}
                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                  {budget.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {budget.percentage.toFixed(1)}%
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={Math.min(budget.percentage, 100)}
                color={getStatusColor(budget.status) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  사용: ₩{budget.spentAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  예산: ₩{budget.budgetAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {mockBudgets.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              아직 설정된 예산이 없습니다
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Budget;