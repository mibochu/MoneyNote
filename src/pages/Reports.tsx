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
  BarChart,
  PieChart,
  TrendingUp,
  CalendarToday
} from '@mui/icons-material';

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
                  <BarChart color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    월별 지출 현황
                  </Typography>
                </Box>
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
                    월별 지출 차트가 여기에 표시됩니다
                  </Typography>
                </Box>
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
                  <PieChart color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    카테고리별 지출 비율
                  </Typography>
                </Box>
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
                    원형 차트가 여기에 표시됩니다
                  </Typography>
                </Box>
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
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                지출 트렌드 분석
              </Typography>
            </Box>
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
                트렌드 분석 차트가 여기에 표시됩니다
              </Typography>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday color="primary" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                기간별 비교 분석
              </Typography>
            </Box>
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
                비교 분석 차트가 여기에 표시됩니다
              </Typography>
            </Box>
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;