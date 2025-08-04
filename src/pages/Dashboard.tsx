import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Savings,
  Receipt
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
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
              ₩0
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
              ₩0
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
              ₩0
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance color="info" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                예산 잔액
              </Typography>
            </Box>
            <Typography variant="h4" color="info">
              ₩0
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
            지출 트렌드
          </Typography>
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
              차트가 여기에 표시됩니다
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            최근 거래
          </Typography>
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
              거래 내역이 여기에 표시됩니다
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;