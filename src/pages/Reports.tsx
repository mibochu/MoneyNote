import React from 'react';
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        📈 리포트
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        지출 패턴을 분석하고 인사이트를 얻으세요
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="리포트 탭"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="월별 분석" />
          <Tab label="카테고리별" />
          <Tab label="트렌드 분석" />
          <Tab label="비교 분석" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 2 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BarChartIcon color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    월별 지출 현황
                  </Typography>
                </Box>
                <BarChart 
                  data={[
                    { label: '1월', value: 250000 },
                    { label: '2월', value: 180000 },
                    { label: '3월', value: 320000 },
                    { label: '4월', value: 210000 },
                    { label: '5월', value: 290000 },
                    { label: '6월', value: 340000 }
                  ]}
                  height={300}
                  color="#1976d2"
                />
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    이번 달 총 지출
                  </Typography>
                  <Typography variant="h4" color="error">
                    ₩390,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    전월 대비 +12%
                  </Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    일 평균 지출
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ₩13,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    전월 대비 -5%
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChartIcon color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    카테고리별 지출 비율
                  </Typography>
                </Box>
                <PieChart 
                  data={[
                    { label: '식비', value: 350000, color: '#FF6B6B' },
                    { label: '교통', value: 150000, color: '#4ECDC4' },
                    { label: '쇼핑', value: 200000, color: '#45B7D1' },
                    { label: '문화', value: 80000, color: '#96CEB4' },
                    { label: '의료', value: 120000, color: '#FFEAA7' }
                  ]}
                  height={300}
                />
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  카테고리별 상세 분석
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
                    상세 분석 테이블이 여기에 표시됩니다
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, minHeight: 400 }}>
            <Box sx={{ flex: 2 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    지출 트렌드 분석
                  </Typography>
                </Box>
                <BarChart 
                  data={[
                    { label: '6개월 전', value: 280000 },
                    { label: '5개월 전', value: 320000 },
                    { label: '4개월 전', value: 210000 },
                    { label: '3개월 전', value: 290000 },
                    { label: '2개월 전', value: 180000 },
                    { label: '지난달', value: 340000 }
                  ]}
                  height={300}
                  color="#9C27B0"
                />
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    트렌드 요약
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    하락세
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    지난달 대비 -15%
                  </Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    평균 지출
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ₩268,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    최근 6개월 평균
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, minHeight: 400 }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    이번달 vs 지난달
                  </Typography>
                </Box>
                <BarChart 
                  data={[
                    { label: '이번달', value: 340000 },
                    { label: '지난달', value: 280000 }
                  ]}
                  height={300}
                  color="#FF6B6B"
                />
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  비교 분석 결과
                </Typography>
                
                {[
                  { item: '전체 지출', thisMonth: 340000, lastMonth: 280000 },
                  { item: '식비', thisMonth: 150000, lastMonth: 120000 },
                  { item: '교통비', thisMonth: 80000, lastMonth: 90000 },
                  { item: '쇼핑', thisMonth: 70000, lastMonth: 40000 },
                  { item: '문화', thisMonth: 40000, lastMonth: 30000 }
                ].map((comparison) => {
                  const diff = comparison.thisMonth - comparison.lastMonth;
                  const diffPercentage = ((diff / comparison.lastMonth) * 100).toFixed(1);
                  
                  return (
                    <Box key={comparison.item} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {comparison.item}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            이번달: ₩{comparison.thisMonth.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            지난달: ₩{comparison.lastMonth.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color={diff >= 0 ? 'error.main' : 'success.main'}
                          fontWeight="bold"
                        >
                          {diff >= 0 ? '+' : ''}{diffPercentage}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;