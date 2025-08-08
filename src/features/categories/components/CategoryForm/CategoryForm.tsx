import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  Box,
  alpha,
  IconButton,
  Slide
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';

import type { Category, CategoryFormData } from '../../../../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../../utils/constants/categories';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category;
  mode?: 'add' | 'edit';
}

/**
 * CategoryForm 컴포넌트
 * 
 * 대분류 카테고리 추가/수정을 위한 모달 다이얼로그입니다.
 * 16가지 색상 팔레트와 20가지 이모지 아이콘 선택을 제공하며,
 * 실시간 미리보기 기능을 통해 사용자가 선택한 결과를 즉시 확인할 수 있습니다.
 */
const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add'
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0]
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // 폼 데이터 초기화 (2025 React 패턴: 의존성 최적화)
  useEffect(() => {
    if (!open) return; // 조기 리턴으로 성능 최적화
    
    const resetForm = () => {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          color: initialData.color,
          icon: initialData.icon ?? CATEGORY_ICONS[0] // nullish coalescing 사용
        });
      } else {
        setFormData({
          name: '',
          color: CATEGORY_COLORS[0],
          icon: CATEGORY_ICONS[0]
        });
      }
      setErrors({});
    };
    
    resetForm();
  }, [open, mode, initialData?.name, initialData?.color, initialData?.icon]); // 필요한 필드만 의존성에 추가

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '카테고리 이름을 입력해주세요';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '카테고리 이름은 2자 이상이어야 합니다';
    } else if (formData.name.trim().length > 20) {
      newErrors.name = '카테고리 이름은 20자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0]
    });
    setErrors({});
    onClose();
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: event.target.value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {mode === 'add' ? '새 대분류 추가' : '대분류 수정'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 미리보기 */}
          <Paper 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(formData.color, 0.1)}, ${alpha(formData.color, 0.05)})`,
              border: `2px solid ${alpha(formData.color, 0.2)}`,
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              미리보기
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={1}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: formData.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: 2
                }}
              >
                {formData.icon}
              </Box>
              <Typography variant="h5" fontWeight={600} color={formData.color}>
                {formData.name || '카테고리명'}
              </Typography>
            </Stack>
          </Paper>

          {/* 카테고리명 입력 */}
          <TextField
            label="카테고리 이름"
            value={formData.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 식비, 교통비, 엔터테인먼트"
            fullWidth
            autoFocus
          />

          {/* 색상 선택 */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <PaletteIcon color="action" />
              <Typography variant="subtitle1" fontWeight={600}>
                색상 선택
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {CATEGORY_COLORS.map((color) => (
                <Paper
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? 3 : 1,
                    borderColor: formData.color === color ? 'primary.main' : alpha(color, 0.3),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </Stack>
          </Box>

          {/* 아이콘 선택 */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              아이콘 선택
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {CATEGORY_ICONS.map((icon) => (
                <Paper
                  key={icon}
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    border: formData.icon === icon ? 2 : 1,
                    borderColor: formData.icon === icon ? 'primary.main' : 'divider',
                    backgroundColor: formData.icon === icon 
                      ? alpha(formData.color, 0.1) 
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(formData.color, 0.1),
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={() => handleIconSelect(icon)}
                >
                  {icon}
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name.trim()}
        >
          {mode === 'add' ? '추가' : '수정'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryForm;