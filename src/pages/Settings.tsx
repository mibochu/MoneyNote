import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
  ListItemButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Collapse,
  Chip
} from '@mui/material';
import {
  Category,
  Payment,
  Notifications,
  Backup,
  ColorLens,
  Info,
  ChevronRight,
  LocalOffer as TagIcon,
  AccountBalance as BudgetIcon,
  CloudDownload,
  CloudUpload,
  DeleteForever,
  Science as TestDataIcon,
  Restore,
  DeveloperMode
} from '@mui/icons-material';

import TagManager from '../features/tags/components/TagManager';
import TagSummary from '../features/tags/components/TagSummary';
import { useSettings } from '../hooks/useSettings';
import { dataManager } from '../utils/storage/dataManager';
import { autoBackupManager } from '../utils/storage/autoBackup';
import { createTestData, clearAllTestData } from '../utils/testData';
import { LocalStorage } from '../utils/storage/localStorage';

const Settings: React.FC = () => {
  const { state: settingsState, updateSetting } = useSettings();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  // autoBackup은 설정에서 가져오도록 수정
  const [currentView, setCurrentView] = React.useState<'main' | 'tags' | 'tagSummary'>('main');
  const [showDeveloperMenu, setShowDeveloperMenu] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dataStats, setDataStats] = React.useState<any>(null);

  // 데이터 통계 로드 (주기적으로 업데이트)
  React.useEffect(() => {
    const updateStats = () => {
      const stats = dataManager.getDataStats();
      setDataStats(stats);
    };
    
    updateStats(); // 초기 로드
    
    // 2초마다 통계 업데이트
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // 개발자 메뉴 핸들러들
  const handleExportData = async () => {
    try {
      await dataManager.exportToJSON();
      setNotification({
        open: true,
        message: '데이터가 성공적으로 내보내졌습니다.',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: '데이터 내보내기 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await dataManager.importFromJSON(file);
      setNotification({
        open: true,
        message: '데이터가 성공적으로 가져와졌습니다. 페이지를 새로고침해주세요.',
        severity: 'success'
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || '데이터 가져오기 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestoreFromBackup = async () => {
    try {
      console.log('백업 복원 시작...');
      
      // 1. localStorage 백업 먼저 시도
      console.log('localStorage 백업 확인...');
      const localBackups = dataManager.getLocalStorageBackups();
      console.log('localStorage 백업:', localBackups.length, '개');
      
      if (localBackups.length > 0) {
        const success = await dataManager.restoreFromLocalStorageBackup();
        if (success) {
          setNotification({
            open: true,
            message: 'localStorage 백업에서 데이터가 복원되었습니다. 페이지를 새로고침해주세요.',
            severity: 'success'
          });
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
      }
      
      // 2. IndexedDB 백업 시도
      console.log('IndexedDB 백업 확인...');
      const backupList = await autoBackupManager.getBackupList();
      console.log('사용 가능한 IndexedDB 백업:', backupList.length, '개');
      
      if (backupList.length === 0) {
        setNotification({
          open: true,
          message: '사용 가능한 백업이 없습니다.',
          severity: 'info'
        });
        return;
      }
      
      const success = await autoBackupManager.restoreFromLatestBackup();
      console.log('IndexedDB 백업 복원 결과:', success);
      
      if (success) {
        setNotification({
          open: true,
          message: '자동 백업에서 데이터가 복원되었습니다. 페이지를 새로고침해주세요.',
          severity: 'success'
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setNotification({
          open: true,
          message: '백업 복원에 실패했습니다.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('백업 복원 오류:', error);
      setNotification({
        open: true,
        message: `백업 복원 중 오류가 발생했습니다: ${error}`,
        severity: 'error'
      });
    }
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      open: true,
      title: '모든 데이터 삭제',
      message: '모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?',
      onConfirm: async () => {
        try {
          const success = clearAllTestData();
          
          if (success) {
            setNotification({
              open: true,
              message: '모든 데이터가 삭제되었습니다. 페이지를 새로고침해주세요.',
              severity: 'success'
            });
            // 페이지 새로고침으로 Context들이 새로운 데이터를 로드하도록 함
            setTimeout(() => {
              console.log('페이지를 새로고침합니다...');
              window.location.reload();
            }, 2000);
          } else {
            throw new Error('데이터 삭제 실패');
          }
        } catch (error) {
          setNotification({
            open: true,
            message: '데이터 삭제 중 오류가 발생했습니다.',
            severity: 'error'
          });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleGenerateTestData = () => {
    setConfirmDialog({
      open: true,
      title: '테스트 데이터 생성',
      message: '기존 데이터는 자동으로 백업되고 테스트 데이터로 교체됩니다. 계속하시겠습니까?',
      onConfirm: async () => {
        try {
          console.log('테스트 데이터 생성 시작...');
          const success = createTestData();
          
          if (success) {
            console.log('테스트 데이터 생성 완료!');
            
            // LocalStorage 확인 (올바른 키 사용)
            const savedExpenses = LocalStorage.get('EXPENSES', []);
            const savedIncomes = LocalStorage.get('INCOMES', []);
            console.log('저장된 데이터 확인:', {
              expenses: savedExpenses.length,
              incomes: savedIncomes.length
            });
            
            setNotification({
              open: true,
              message: '테스트 데이터가 생성되었습니다. 페이지를 새로고침해주세요.',
              severity: 'success'
            });
            // 페이지 새로고침으로 Context들이 새로운 데이터를 로드하도록 함
            setTimeout(() => {
              console.log('페이지를 새로고침합니다...');
              window.location.reload();
            }, 2000);
          } else {
            throw new Error('테스트 데이터 생성 실패');
          }
        } catch (error) {
          console.error('테스트 데이터 생성 오류:', error);
          setNotification({
            open: true,
            message: `테스트 데이터 생성 중 오류가 발생했습니다: ${error}`,
            severity: 'error'
          });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // 뷰 렌더링
  if (currentView === 'tags') {
    return (
      <Box>
        <Button 
          onClick={() => setCurrentView('main')} 
          sx={{ mb: 2 }}
          startIcon={<ChevronRight sx={{ transform: 'rotate(180deg)' }} />}
        >
          설정으로 돌아가기
        </Button>
        <TagManager />
      </Box>
    );
  }

  if (currentView === 'tagSummary') {
    return (
      <Box>
        <Button 
          onClick={() => setCurrentView('main')} 
          sx={{ mb: 2 }}
          startIcon={<ChevronRight sx={{ transform: 'rotate(180deg)' }} />}
        >
          설정으로 돌아가기
        </Button>
        <TagSummary />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ⚙️ 설정
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        앱 설정을 관리하고 사용자 정의하세요
      </Typography>

      {/* 일반 설정 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            일반 설정
          </Typography>
        </Box>
        <Divider />
        
        <List>
          <ListItem>
            <ListItemIcon>
              <BudgetIcon />
            </ListItemIcon>
            <ListItemText
              primary="예산관리 표시"
              secondary="네비게이션에 예산관리 메뉴 표시"
            />
            <Switch
              checked={settingsState.settings.showBudgetManagement}
              onChange={(e) => updateSetting('showBudgetManagement', e.target.checked)}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <ColorLens />
            </ListItemIcon>
            <ListItemText
              primary="다크 모드"
              secondary="어두운 테마 사용"
            />
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText
              primary="알림"
              secondary="예산 초과 및 목표 달성 알림"
            />
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <Backup />
            </ListItemIcon>
            <ListItemText
              primary="자동 백업"
              secondary="데이터 자동 백업 활성화"
            />
            <Switch
              checked={settingsState.settings.autoBackup}
              onChange={(e) => updateSetting('autoBackup', e.target.checked)}
            />
          </ListItem>
        </List>
      </Paper>

      {/* 데이터 관리 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            데이터 관리
          </Typography>
        </Box>
        <Divider />
        
        <List>
          <ListItemButton>
            <ListItemIcon>
              <Category />
            </ListItemIcon>
            <ListItemText
              primary="카테고리 관리"
              secondary="수입/지출 카테고리 설정"
            />
            <ChevronRight />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton onClick={() => setCurrentView('tags')}>
            <ListItemIcon>
              <TagIcon />
            </ListItemIcon>
            <ListItemText
              primary="태그 관리"
              secondary="지출 분류용 태그 관리"
            />
            <ChevronRight />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton onClick={() => setCurrentView('tagSummary')}>
            <ListItemIcon>
              <TagIcon />
            </ListItemIcon>
            <ListItemText
              primary="태그별 통계"
              secondary="태그별 지출 현황 및 분석"
            />
            <ChevronRight />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton>
            <ListItemIcon>
              <Payment />
            </ListItemIcon>
            <ListItemText
              primary="결제수단 관리"
              secondary="신용카드, 계좌 등록"
            />
            <ChevronRight />
          </ListItemButton>
        </List>
      </Paper>

      {/* 개발자 도구 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              🔧 개발자 도구
            </Typography>
            <Button 
              size="small" 
              onClick={() => setShowDeveloperMenu(!showDeveloperMenu)}
              startIcon={<DeveloperMode />}
            >
              {showDeveloperMenu ? '숨기기' : '표시'}
            </Button>
          </Box>
        </Box>
        <Divider />
        
        <Collapse in={showDeveloperMenu}>
          <Box sx={{ p: 2 }}>
            {/* 데이터 통계 */}
            {dataStats && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 현재 데이터 현황
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`지출 ${dataStats.expenses}건`} size="small" />
                  <Chip label={`수입 ${dataStats.incomes}건`} size="small" />
                  <Chip label={`카테고리 ${dataStats.categories}개`} size="small" />
                  <Chip label={`태그 ${dataStats.tags}개`} size="small" />
                  <Chip label={`용량 ${dataStats.totalDataSize}`} size="small" color="info" />
                </Box>
              </Box>
            )}
            
            {/* 백업/복원 버튼들 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<CloudDownload />}
                onClick={handleExportData}
                color="primary"
              >
                데이터 내보내기
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CloudUpload />}
                onClick={handleImportData}
                color="primary"
              >
                데이터 가져오기
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Restore />}
                onClick={handleRestoreFromBackup}
                color="info"
                sx={{ 
                  textAlign: 'left',
                  '& .MuiButton-startIcon': { mr: 1.5 }
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    데이터 복원
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    실수로 삭제한 데이터 복구
                  </Typography>
                </Box>
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<TestDataIcon />}
                onClick={handleGenerateTestData}
                color="success"
              >
                테스트 데이터
              </Button>
            </Box>
            
            {/* 위험한 작업 */}
            <Divider sx={{ my: 2 }} />
            <Button 
              variant="outlined" 
              startIcon={<DeleteForever />}
              onClick={handleClearAllData}
              color="error"
              fullWidth
            >
              모든 데이터 삭제
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              ⚠️ 모든 작업은 자동으로 백업됩니다. IndexedDB에 최근 10개 백업이 저장됩니다.
            </Typography>
          </Box>
        </Collapse>
      </Paper>

      {/* 앱 정보 */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            앱 정보
          </Typography>
        </Box>
        <Divider />
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText
              primary="버전 정보"
              secondary="MoneyNote v1.0.0"
            />
          </ListItem>
        </List>
      </Paper>
      
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      {/* 확인 다이얼로그 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            취소
          </Button>
          <Button onClick={confirmDialog.onConfirm} color="error" variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;