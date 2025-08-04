import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as ExpenseIcon,
  TrendingUp as BudgetIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export interface NavigationItem {
  label: string;
  value: string;
  icon: React.ReactElement;
  path: string;
}

export interface NavigationProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  items?: NavigationItem[];
}

const defaultItems: NavigationItem[] = [
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
    label: '예산관리',
    value: 'budget',
    icon: <BudgetIcon />,
    path: '/budget'
  },
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
];

const Navigation: React.FC<NavigationProps> = ({
  value,
  onChange,
  items = defaultItems
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        display: isMobile ? 'block' : 'none'
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={onChange}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            px: 1
          }
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;