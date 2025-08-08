import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  LocalOffer as TagIcon
} from '@mui/icons-material';

import { useTags } from '../../../../hooks/useTags';
import { useExpenses } from '../../../../hooks/useExpenses';
import type { TagSummary as TagSummaryType } from '../../../../types/tag.types';

const TagSummary: React.FC = () => {
  const { state: tagState } = useTags();
  const { state: expenseState } = useExpenses();

  // 태그별 통계 계산
  const tagSummaries = useMemo((): TagSummaryType[] => {
    const summaries: TagSummaryType[] = [];
    
    tagState.tags.forEach(tag => {
      // 해당 태그를 사용한 지출들 찾기
      const tagExpenses = expenseState.expenses.filter(expense => 
        expense.tags.includes(tag.name)
      );
      
      const totalAmount = tagExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const expenseCount = tagExpenses.length;
      const avgAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;
      
      if (expenseCount > 0) {
        summaries.push({
          tag,
          totalAmount,
          expenseCount,
          avgAmount
        });
      }
    });
    
    // 총 금액 기준으로 정렬
    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [tagState.tags, expenseState.expenses]);

  // 전체 지출 금액 계산
  const totalExpenseAmount = useMemo(() => {
    return expenseState.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseState.expenses]);

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (tagSummaries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              태그별 지출 데이터가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              지출에 태그를 추가하면 여기서 통계를 확인할 수 있습니다
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        태그별 지출 현황
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        지출 데이터를 태그별로 분석한 결과입니다
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {tagSummaries.map((summary) => {
          const percentage = totalExpenseAmount > 0 ? (summary.totalAmount / totalExpenseAmount) * 100 : 0;
          
          return (
            <Box key={summary.tag.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={`${summary.tag.icon} ${summary.tag.name}`}
                      sx={{
                        bgcolor: summary.tag.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        {formatCurrency(summary.totalAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        총 지출 금액
                      </Typography>
                    </Box>

                    <Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(percentage, 100)}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: summary.tag.color
                          }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        전체 지출의 {percentage.toFixed(1)}%
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" color="text.primary">
                          {summary.expenseCount}건
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          거래 횟수
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="text.primary">
                          {formatCurrency(summary.avgAmount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          평균 금액
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* 요약 정보 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            태그 사용 현황 요약
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h4" color="primary">
                {tagState.tags.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                전체 태그
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h4" color="success.main">
                {tagSummaries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                사용 중인 태그
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h4" color="warning.main">
                {tagState.tags.length - tagSummaries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                미사용 태그
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h4" color="info.main">
                {formatCurrency(totalExpenseAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                전체 지출 금액
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TagSummary;