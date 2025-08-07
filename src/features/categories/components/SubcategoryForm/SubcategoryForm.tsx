import React, { useState, useEffect, useMemo } from 'react';
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
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';

import type { Category, Subcategory, SubcategoryFormData } from '../../../../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../../utils/constants/categories';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SubcategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubcategoryFormData) => void;
  categories: Category[];
  initialData?: Subcategory;
  preselectedCategoryId?: string;
  mode?: 'add' | 'edit';
}

/**
 * SubcategoryForm 컴포넌트
 * 
 * 소분류 카테고리 추가/수정을 위한 모달 다이얼로그입니다.
 * 대분류 선택과 연동되어 색상이 자동으로 설정되며,
 * 같은 대분류 내에서 이름 중복을 방지합니다.
 */
const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  categories,
  initialData,
  preselectedCategoryId,
  mode = 'add'
}) => {
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    categoryId: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0]
  });

  const [errors, setErrors] = useState<{
    name?: string;
    categoryId?: string;
  }>({});

  // 선택된 카테고리 정보
  const selectedCategory = useMemo(() => 
    categories.find(cat => cat.id === formData.categoryId),
    [categories, formData.categoryId]
  );

  // 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        const selectedCat = categories.find(cat => cat.id === initialData.categoryId);
        setFormData({
          name: initialData.name,
          categoryId: initialData.categoryId,
          color: initialData.color || selectedCat?.color || CATEGORY_COLORS[0],
          icon: initialData.icon || CATEGORY_ICONS[0]
        });
      } else {
        setFormData({
          name: '',
          categoryId: preselectedCategoryId || '',
          color: CATEGORY_COLORS[0],
          icon: CATEGORY_ICONS[0]
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData, preselectedCategoryId, selectedCategory?.color, categories]);

  // 대분류 변경시 색상 자동 설정
  useEffect(() => {
    if (selectedCategory && mode === 'add') {
      setFormData(prev => ({
        ...prev,
        color: selectedCategory.color
      }));
    }
  }, [selectedCategory, mode]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; categoryId?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '소분류 이름을 입력해주세요';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '소분류 이름은 2자 이상이어야 합니다';
    } else if (formData.name.trim().length > 20) {
      newErrors.name = '소분류 이름은 20자 이하여야 합니다';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '대분류를 선택해주세요';
    }

    // 같은 대분류 내 중복 이름 체크
    if (formData.name.trim() && formData.categoryId) {
      const targetCategory = categories.find(cat => cat.id === formData.categoryId);
      if (targetCategory) {
        const isDuplicate = targetCategory.subcategories.some(sub => 
          sub.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          sub.id !== initialData?.id
        );
        if (isDuplicate) {
          newErrors.name = `이미 "${targetCategory.name}" 대분류에 같은 이름의 소분류가 있습니다`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        color: formData.color,
        icon: formData.icon
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      categoryId: '',
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

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: undefined }));
    }
  };

  const useParentColor = () => {
    if (selectedCategory) {
      setFormData(prev => ({ ...prev, color: selectedCategory.color }));
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
          minHeight: 700
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {mode === 'add' ? '새 소분류 추가' : '소분류 수정'}
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
              background: `linear-gradient(135deg, ${alpha(formData.color || CATEGORY_COLORS[0], 0.1)}, ${alpha(formData.color || CATEGORY_COLORS[0], 0.05)})`,
              border: `2px solid ${alpha(formData.color || CATEGORY_COLORS[0], 0.2)}`,
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              미리보기
            </Typography>
            
            {/* 대분류 표시 */}
            {selectedCategory && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: selectedCategory.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  {selectedCategory.icon}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedCategory.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
              </Stack>
            )}
            
            {/* 소분류 표시 */}
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: formData.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: 1
                }}
              >
                {formData.icon}
              </Box>
              <Typography variant="h6" fontWeight={600} color={formData.color}>
                {formData.name || '소분류명'}
              </Typography>
            </Stack>
          </Paper>

          {/* 대분류 선택 */}
          <FormControl fullWidth error={!!errors.categoryId}>
            <InputLabel>대분류 선택</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              label="대분류 선택"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography>{category.name}</Typography>
                    <Chip 
                      size="small" 
                      label={`${category.subcategories.length}개`}
                      variant="outlined"
                    />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                {errors.categoryId}
              </Typography>
            )}
          </FormControl>

          {/* 소분류명 입력 */}
          <TextField
            label="소분류 이름"
            value={formData.name}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 외식, 지하철, 영화"
            fullWidth
            autoFocus
          />

          {/* 색상 선택 */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PaletteIcon color="action" />
                <Typography variant="subtitle1" fontWeight={600}>
                  색상 선택
                </Typography>
              </Stack>
              {selectedCategory && (
                <Button
                  size="small"
                  startIcon={<CategoryIcon />}
                  onClick={useParentColor}
                  variant="outlined"
                >
                  대분류 색상 사용
                </Button>
              )}
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
                      ? alpha(formData.color || CATEGORY_COLORS[0], 0.1) 
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(formData.color || CATEGORY_COLORS[0], 0.1),
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

          {/* 기존 소분류 목록 (참고용) */}
          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                "{selectedCategory.name}" 의 기존 소분류
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {selectedCategory.subcategories.map((sub) => (
                  <Chip
                    key={sub.id}
                    size="small"
                    label={sub.name}
                    sx={{
                      backgroundColor: alpha(sub.color || selectedCategory?.color || CATEGORY_COLORS[0], 0.1),
                      color: sub.color || selectedCategory?.color || CATEGORY_COLORS[0]
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name.trim() || !formData.categoryId}
        >
          {mode === 'add' ? '추가' : '수정'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubcategoryForm;