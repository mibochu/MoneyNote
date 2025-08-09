import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  InputAdornment,
  Typography,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

import { Button } from '../../ui/Button';
import { useCategories } from '../../../hooks/useCategories';
import { PAYMENT_METHODS } from '../../../utils/constants/paymentMethods';
import type { ExpectedExpenseFormData, PaymentMethod } from '../../../types';

export interface ExpectedExpenseFormProps {
  initialData?: Partial<ExpectedExpenseFormData>;
  onSubmit: (data: ExpectedExpenseFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const ExpectedExpenseForm: React.FC<ExpectedExpenseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  error = null
}) => {
  const { state: categoryState } = useCategories();
  
  const [formData, setFormData] = useState<ExpectedExpenseFormData>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    expectedDate: initialData?.expectedDate || new Date(),
    isRecurring: initialData?.isRecurring || false,
    tags: initialData?.tags || [],
    paymentMethod: initialData?.paymentMethod || 'card'
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categoryState.categories.find(cat => cat.id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }

    if (formData.amount <= 0) {
      newErrors.amount = '올바른 금액을 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ExpectedExpenseFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    }));

    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '' // 카테고리 변경 시 서브카테고리 초기화
    }));
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* 기본 정보 */}
        <TextField
          fullWidth
          label="설명"
          value={formData.description}
          onChange={handleInputChange('description')}
          error={!!errors.description}
          helperText={errors.description}
          placeholder="예: 교통비, 통신비 등"
        />

        <TextField
          fullWidth
          label="예상 금액"
          type="number"
          value={formData.amount || ''}
          onChange={handleInputChange('amount')}
          error={!!errors.amount}
          helperText={errors.amount}
          InputProps={{
            startAdornment: <InputAdornment position="start">₩</InputAdornment>
          }}
        />

        {/* 카테고리 선택 */}
        <TextField
          fullWidth
          select
          label="카테고리"
          value={formData.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          error={!!errors.category}
          helperText={errors.category}
        >
          <MenuItem value="">카테고리 선택</MenuItem>
          {categoryState.categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        {/* 서브카테고리 선택 */}
        {subcategories.length > 0 && (
          <TextField
            fullWidth
            select
            label="서브카테고리 (선택사항)"
            value={formData.subcategory}
            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
          >
            <MenuItem value="">서브카테고리 선택</MenuItem>
            {subcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* 예상 날짜 */}
        <DatePicker
          label="예상 날짜"
          value={dayjs(formData.expectedDate)}
          onChange={(date) => setFormData(prev => ({ 
            ...prev, 
            expectedDate: date ? date.toDate() : new Date() 
          }))}
          format="YYYY년 MM월 DD일"
          slotProps={{ textField: { fullWidth: true } }}
        />

        {/* 결제수단 */}
        <TextField
          fullWidth
          select
          label="결제수단"
          value={formData.paymentMethod}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            paymentMethod: e.target.value as PaymentMethod 
          }))}
        >
          {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
            <MenuItem key={key} value={key}>
              {method.icon} {method.label}
            </MenuItem>
          ))}
        </TextField>

        {/* 매월 반복 스위치 */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                isRecurring: e.target.checked 
              }))}
            />
          }
          label={
            <Box>
              <Typography variant="body1">매월 반복</Typography>
              <Typography variant="caption" color="text.secondary">
                매달 동일한 항목이 자동으로 등록됩니다
              </Typography>
            </Box>
          }
        />

        {/* 태그 */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            태그 (선택사항)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              placeholder="태그 입력"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Box>

          {formData.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  deleteIcon={<RemoveIcon fontSize="small" />}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* 버튼 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            loading={loading}
          >
            {initialData ? '수정' : '등록'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ExpectedExpenseForm;