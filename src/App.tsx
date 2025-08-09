import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ExpenseProvider } from './context/ExpenseContext';
import { ExpectedExpenseProvider } from './context/ExpectedExpenseContext';
import { IncomeProvider } from './context/IncomeContext';
import { CategoryProvider } from './context/CategoryContext';
import { TagProvider } from './context/TagContext';
import { BudgetProvider } from './context/BudgetContext';
import { RecurringProvider } from './context/RecurringContext';
import { SettingsProvider } from './context/SettingsContext';
import { TemplateProvider } from './context/TemplateContext';
import { AppLayout } from './components/AppLayout';
import { Dashboard, Expenses, IncomeManagement, Categories, Budget, Reports, Settings, NotFound } from './pages';
import { autoBackupManager } from './utils/storage/autoBackup';
import { debugLocalStorage } from './utils/storage/debug';
import './styles/App.css';

// Material-UI 테마 설정
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // Paper 컴포넌트 기본 스타일
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Card 컴포넌트 기본 스타일
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    // Button 컴포넌트 기본 스타일
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  // 앱 시작 시 초기 백업 생성
  React.useEffect(() => {
    const createInitialBackup = async () => {
      try {
        console.log('🚀 앱 시작 - 초기 백업 생성 중...');
        const success = await autoBackupManager.createAutoBackup();
        if (success) {
          console.log('✅ 초기 백업 생성 완료');
        } else {
          console.log('❌ 초기 백업 생성 실패');
        }
      } catch (error) {
        console.warn('⚠️ 초기 백업 생성 오류:', error);
      }
    };
    
    // 2초 후 초기 백업 생성 (Context들이 로드된 후)
    setTimeout(createInitialBackup, 2000);
    
    // 개발 환경에서 localStorage 디버깅 정보 출력
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        debugLocalStorage();
      }, 3000);
    }
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SettingsProvider>
          <CategoryProvider>
          <TagProvider>
            <TemplateProvider>
              <ExpenseProvider>
                <ExpectedExpenseProvider>
                  <IncomeProvider>
                  <RecurringProvider>
                    <BudgetProvider>
              <Router>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="income" element={<IncomeManagement />} />
                <Route path="categories" element={<Categories />} />
                <Route path="budget" element={<Budget />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
              </Router>
                    </BudgetProvider>
                  </RecurringProvider>
                </IncomeProvider>
                </ExpectedExpenseProvider>
              </ExpenseProvider>
            </TemplateProvider>
          </TagProvider>
          </CategoryProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;