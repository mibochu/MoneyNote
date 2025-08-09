import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useSettings } from '../hooks/useSettings';
import { Layout } from './common/Layout';
import { Navigation, SideNavigation } from './common/Navigation';
import type { NavigationItem } from './common/Navigation';
import {
  Dashboard as DashboardIcon,
  AccountBalance as ExpenseIcon,
  Paid as IncomeIcon,
  TrendingUp as BudgetIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const getNavigationItems = (showBudgetManagement: boolean): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      label: '대시보드',
      value: 'dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      label: '지출관리',
      value: 'expenses',
      icon: <ExpenseIcon />,
      path: '/expenses'
    },
    {
      label: '수입관리',
      value: 'income',
      icon: <IncomeIcon />,
      path: '/income'
    }
  ];
  
  // 예산관리 옵션이 활성화된 경우만 추가
  if (showBudgetManagement) {
    baseItems.push({
      label: '예산관리',
      value: 'budget',
      icon: <BudgetIcon />,
      path: '/budget'
    });
  }
  
  baseItems.push(
    {
      label: '리포트',
      value: 'reports',
      icon: <ReportIcon />,
      path: '/reports'
    },
    {
      label: '설정',
      value: 'settings',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  );
  
  return baseItems;
};

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { state: settingsState } = useSettings();
  
  const [sideNavOpen, setSideNavOpen] = React.useState(!isMobile);
  
  // 설정에 따라 네비게이션 메뉴 생성
  const navigationItems = React.useMemo(() => 
    getNavigationItems(settingsState.settings.showBudgetManagement),
    [settingsState.settings.showBudgetManagement]
  );

  // 현재 경로에 따라 활성 네비게이션 값 결정
  const getCurrentNavValue = () => {
    const path = location.pathname;
    const item = navigationItems.find(item => item.path === path);
    return item?.value || 'dashboard';
  };

  const handleNavigationChange = (_event: React.SyntheticEvent, newValue: string) => {
    const item = navigationItems.find(item => item.value === newValue);
    if (item) {
      navigate(item.path);
    }
  };

  const handleSideNavToggle = () => {
    setSideNavOpen(!sideNavOpen);
  };

  React.useEffect(() => {
    setSideNavOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 데스크톱 사이드 네비게이션 */}
      {!isMobile && (
        <SideNavigation
          open={sideNavOpen}
          onClose={handleSideNavToggle}
          value={getCurrentNavValue()}
          onChange={handleNavigationChange}
          items={navigationItems}
          appName="💰 MoneyNote"
        />
      )}

      {/* 메인 콘텐츠 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${sideNavOpen ? 240 : 0}px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pb: isMobile ? 8 : 0, // 모바일에서 하단 네비게이션 공간 확보
        }}
      >
        <Layout>
          <Outlet />
        </Layout>
      </Box>

      {/* 모바일 하단 네비게이션 */}
      <Navigation
        value={getCurrentNavValue()}
        onChange={handleNavigationChange}
        items={navigationItems}
      />
    </Box>
  );
};