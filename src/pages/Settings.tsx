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
  ListItemButton
} from '@mui/material';
import {
  Category,
  Payment,
  Notifications,
  Backup,
  ColorLens,
  Info,
  ChevronRight,
  LocalOffer as TagIcon
} from '@mui/icons-material';

import TagManager from '../features/tags/components/TagManager';
import TagSummary from '../features/tags/components/TagSummary';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [autoBackup, setAutoBackup] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'main' | 'tags' | 'tagSummary'>('main');

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
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
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

      {/* 데이터 백업/복원 */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            백업 및 복원
          </Typography>
        </Box>
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary">
              데이터 백업
            </Button>
            <Button variant="outlined">
              데이터 복원
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            마지막 백업: 아직 백업하지 않음
          </Typography>
        </Box>
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
    </Box>
  );
};

export default Settings;