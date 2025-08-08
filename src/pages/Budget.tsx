import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Button,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Warning,
  Add as AddIcon
} from '@mui/icons-material';

import { useBudget } from '../hooks/useBudget';
import { useCategories } from '../hooks/useCategories';
import SimpleBudgetDialog from '../components/common/SimpleBudgetDialog';

const Budget: React.FC = () => {
  const { state, getCurrentMonthBudget, calculateBudgetProgress, addBudget } = useBudget();
  const { getCategoryById, state: categoryState } = useCategories();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = React.useState(false);
  
  // 현재 월 예산 데이터
  const currentBudget = getCurrentMonthBudget();
  const budgetProgress = useMemo(() => {
    return calculateBudgetProgress();
  }, [calculateBudgetProgress]);
  
  // 카테고리 이름 매핑이 포함된 진행률 데이터
  const categoryProgresses = useMemo(() => {
    return budgetProgress.categoryProgresses.map((progress: any) => {
      const category = getCategoryById(progress.categoryId);
      return {
        ...progress,
        categoryName: category?.name || progress.categoryName || '알 수 없는 카테고리'
      };
    });
  }, [budgetProgress.categoryProgresses, getCategoryById]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <TrendingUp color="error" />;
    if (percentage >= 80) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };
  
  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        📊 예산 관리
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        예산을 설정하고 지출을 추적하세요
      </Typography>

      {!currentBudget && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              이번 달 예산이 설정되지 않았습니다. 예산을 설정하여 지출을 관리해보세요.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              size="small"
              onClick={() => setIsBudgetDialogOpen(true)}
            >
              예산 설정
            </Button>
          </Box>
        </Alert>
      )}
      
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
              {formatCurrency(budgetProgress.totalBudget)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              사용 금액
            </Typography>
            <Typography 
              variant="h4" 
              color={budgetProgress.progressPercentage >= 100 ? "error" : "warning"}
            >
              {formatCurrency(budgetProgress.totalSpent)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              남은 예산
            </Typography>
            <Typography 
              variant="h4" 
              color={budgetProgress.remainingBudget >= 0 ? "success" : "error"}
            >
              {formatCurrency(budgetProgress.remainingBudget)}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* 전체 예산 진행률 */}
      {currentBudget && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              전체 예산 사용률
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(budgetProgress.progressPercentage, 100)}
              color={getStatusColor(budgetProgress.progressPercentage)}
              sx={{ height: 12, borderRadius: 6, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {budgetProgress.progressPercentage.toFixed(1)}% 사용됨
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 카테고리별 예산 현황 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            카테고리별 예산 현황
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          p: 3,
          pt: 0
        }}>
          {categoryProgresses.map((progress: any) => (
            <Box key={progress.categoryId} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStatusIcon(progress.progressPercentage)}
                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                  {progress.categoryName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress.progressPercentage.toFixed(1)}%
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={Math.min(progress.progressPercentage, 100)}
                color={getStatusColor(progress.progressPercentage) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  사용: {formatCurrency(progress.spentAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  예산: {formatCurrency(progress.budgetAmount)}
                </Typography>
              </Box>
              
              {progress.isOverBudget && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  예산을 {formatCurrency(progress.spentAmount - progress.budgetAmount)} 초과했습니다!
                </Alert>
              )}
            </Box>
          ))}
        </Box>

        {categoryProgresses.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {currentBudget ? '설정된 카테고리 예산이 없습니다' : '아직 설정된 예산이 없습니다'}
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              startIcon={<AddIcon />}
              onClick={() => setIsBudgetDialogOpen(true)}
            >
              {currentBudget ? '카테고리 예산 추가' : '예산 설정하기'}
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* 월별 목표 현황 (추가 기능) */}
      {state.loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          예산 데이터를 불러오는 중입니다...
        </Alert>
      )}
      
      {state.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {state.error}
        </Alert>
      )}
      
      {/* 예산 설정 다이얼로그 */}
      <SimpleBudgetDialog 
        open={isBudgetDialogOpen}
        onClose={() => setIsBudgetDialogOpen(false)}
        onSave={(budgetData) => {
          addBudget(budgetData);
          setIsBudgetDialogOpen(false);
        }}
        categories={categoryState.categories}
      />
    </Box>
  );
};

export default Budget;