import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

import { useTags } from '../../../../hooks/useTags';
import type { TagFormData } from '../../../../types/tag.types';

// 사전 정의된 색상들
const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FD79A8', '#74B9FF', '#00B894', '#FDCB6E', '#6C5CE7', '#A29BFE',
  '#FF7675', '#00CEC9', '#0984E3', '#00B894', '#FFEAA7', '#D63031'
];

// 사전 정의된 이모지들
const PRESET_ICONS = [
  '🍽️', '🚗', '🛒', '☕', '🏥', '🎭', '💊', '📚', '🎮', '👕',
  '✈️', '🏋️', '🎵', '🍺', '🎬', '📱', '⛽', '🚌', '🏠', '💡'
];

const TagManager: React.FC = () => {
  const { state, addTag, updateTag, deleteTag } = useTags();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
    description: ''
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      icon: PRESET_ICONS[0],
      description: ''
    });
    setEditingTag(null);
  };

  // 새 태그 추가
  const handleAddTag = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // 태그 수정
  const handleEditTag = (tagId: string) => {
    const tag = state.tags.find(t => t.id === tagId);
    if (tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
        icon: tag.icon || PRESET_ICONS[0],
        description: tag.description || ''
      });
      setEditingTag(tagId);
      setIsFormOpen(true);
    }
  };

  // 태그 저장
  const handleSaveTag = () => {
    if (!formData.name.trim()) {
      showNotification('태그 이름을 입력해주세요.', 'error');
      return;
    }

    // 중복 이름 체크
    const isDuplicate = state.tags.some(tag => 
      tag.name.toLowerCase() === formData.name.toLowerCase() && 
      tag.id !== editingTag
    );

    if (isDuplicate) {
      showNotification('이미 존재하는 태그 이름입니다.', 'error');
      return;
    }

    try {
      if (editingTag) {
        updateTag(editingTag, formData);
        showNotification('태그가 수정되었습니다.', 'success');
      } else {
        addTag(formData);
        showNotification('새 태그가 추가되었습니다.', 'success');
      }
      
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      showNotification('태그 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 태그 삭제
  const handleDeleteTag = (tagId: string) => {
    const tag = state.tags.find(t => t.id === tagId);
    if (!tag) return;

    if (tag.isDefault) {
      showNotification('기본 태그는 삭제할 수 없습니다.', 'error');
      return;
    }

    if (tag.usageCount > 0) {
      if (!window.confirm(`"${tag.name}" 태그는 ${tag.usageCount}개의 지출에서 사용 중입니다. 정말 삭제하시겠습니까?`)) {
        return;
      }
    }

    try {
      deleteTag(tagId);
      showNotification('태그가 삭제되었습니다.', 'success');
    } catch (error) {
      showNotification('태그 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 알림 표시
  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  // 인기 태그와 일반 태그 분리
  const popularTags = state.tags.filter(tag => tag.usageCount > 0).sort((a, b) => b.usageCount - a.usageCount);
  // const unusedTags = state.tags.filter(tag => tag.usageCount === 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏷️ 태그 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            지출을 더 세밀하게 분류할 수 있는 태그를 관리하세요
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTag}
        >
          새 태그 추가
        </Button>
      </Box>

      {/* 인기 태그 섹션 */}
      {popularTags.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              인기 태그 (사용중인 태그)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              {popularTags.map((tag) => (
                <Box key={tag.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip
                          label={`${tag.icon} ${tag.name}`}
                          sx={{
                            bgcolor: tag.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Box>
                          <Tooltip title="수정">
                            <IconButton size="small" onClick={() => handleEditTag(tag.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="삭제">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={tag.isDefault}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {tag.description || '설명이 없습니다.'}
                      </Typography>
                      
                      <Typography variant="caption" color="primary">
                        {tag.usageCount}번 사용됨 {tag.isDefault && '(기본 태그)'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 사용되지 않는 태그 섹션 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            전체 태그 ({state.tags.length}개)
          </Typography>
          
          {state.tags.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                아직 생성된 태그가 없습니다. 첫 번째 태그를 만들어보세요!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
              {state.tags.map((tag) => (
                <Box key={tag.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip
                          size="small"
                          label={`${tag.icon} ${tag.name}`}
                          sx={{
                            bgcolor: tag.color,
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                        <Box>
                          <IconButton size="small" onClick={() => handleEditTag(tag.id)}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={tag.isDefault}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        {tag.usageCount}번 사용 {tag.isDefault && '• 기본'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 태그 추가/수정 다이얼로그 */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTag ? '태그 수정' : '새 태그 추가'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="태그 이름"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>아이콘 선택</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PRESET_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    variant={formData.icon === icon ? 'contained' : 'outlined'}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    sx={{ minWidth: 40, height: 40 }}
                  >
                    {icon}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>색상 선택</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PRESET_COLORS.map((color) => (
                  <Button
                    key={color}
                    variant={formData.color === color ? 'contained' : 'outlined'}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    sx={{
                      minWidth: 40,
                      height: 40,
                      bgcolor: color,
                      borderColor: color,
                      '&:hover': { bgcolor: color, opacity: 0.8 }
                    }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="설명 (선택사항)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />

            {/* 미리보기 */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>미리보기</Typography>
              <Chip
                label={`${formData.icon} ${formData.name || '태그 이름'}`}
                sx={{
                  bgcolor: formData.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveTag}>
            {editingTag ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TagManager;