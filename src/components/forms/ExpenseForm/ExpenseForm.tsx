import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

import { CurrencyInput, DateInput } from '../../ui/Input';
import { CategorySelect } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

import type { ExpenseFormData, PaymentMethod } from '../../../types/expense.types';
import { PAYMENT_METHOD_OPTIONS, DEFAULT_PAYMENT_METHOD } from '../../../utils/constants/paymentMethods';
import { validateExpenseForm, validateField } from '../../../utils/validators/expenseValidators';

export interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  categories?: Array<{ 
    id: string; 
    name: string; 
    icon?: string;
    color?: string;
    subcategories: Array<{ 
      id: string; 
      name: string; 
      icon?: string;
      color?: string;
    }> 
  }>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  categories = []
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || DEFAULT_PAYMENT_METHOD,
    tags: initialData?.tags || [],
    isFixed: initialData?.isFixed || false,
    date: initialData?.date || new Date()
  });

  // 에러 상태 관리
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  // 태그 입력 상태
  const [tagInput, setTagInput] = useState('');

  // 폼 유효성 검증
  const validateForm = (): boolean => {
    const validation = validateExpenseForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // 입력 핸들러들
  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    
    // 실시간 검증
    const error = validateField('amount', amount);
    setErrors(prev => ({ ...prev, amount: error || undefined }));
  };

  const handleCategoryChange = (event: any) => {
    const selectedValue = event.target.value as string;
    
    // 선택된 값이 대분류인지 소분류인지 판단
    const isMainCategory = categories.some(cat => cat.id === selectedValue);
    const selectedSubcategory = categories
      .flatMap(cat => cat.subcategories)
      .find(sub => sub.id === selectedValue);
    
    if (isMainCategory) {
      // 대분류 선택된 경우
      setFormData(prev => ({ 
        ...prev, 
        category: selectedValue,
        subcategory: ''
      }));
    } else if (selectedSubcategory) {
      // 소분류 선택된 경우 - 부모 카테고리도 설정
      const parentCategory = categories.find(cat => 
        cat.subcategories.some(sub => sub.id === selectedValue)
      );
      
      setFormData(prev => ({ 
        ...prev, 
        category: parentCategory?.id || '',
        subcategory: selectedValue
      }));
    }
    
    // 실시간 검증
    const categoryToValidate = isMainCategory ? selectedValue : 
      (selectedSubcategory ? categories.find(cat => 
        cat.subcategories.some(sub => sub.id === selectedValue)
      )?.id || '' : '');
    
    const error = validateField('category', categoryToValidate);
    setErrors(prev => ({ ...prev, category: error || undefined }));
  };


  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const description = event.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    // 실시간 검증
    const error = validateField('description', description);
    setErrors(prev => ({ ...prev, description: error || undefined }));
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const paymentMethod = event.target.value as PaymentMethod;
    setFormData(prev => ({ ...prev, paymentMethod }));
    
    // 실시간 검증
    const error = validateField('paymentMethod', paymentMethod);
    setErrors(prev => ({ ...prev, paymentMethod: error || undefined }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setFormData(prev => ({ ...prev, date }));
    
    // 실시간 검증
    const error = validateField('date', date);
    setErrors(prev => ({ ...prev, date: error || undefined }));
  };

  const handleFixedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isFixed: event.target.checked }));
  };

  // 태그 관련 핸들러
  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ 
          ...prev, 
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 폼 제출
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };


  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {initialData ? '지출 수정' : '지출 입력'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* 금액 입력 */}
            <CurrencyInput
              label="금액"
              value={formData.amount > 0 ? formData.amount.toLocaleString('ko-KR') : ''}
              onAmountChange={handleAmountChange}
              error={!!errors.amount}
              helperText={errors.amount}
              required
              fullWidth
            />

            {/* 날짜 선택 */}
            <Box>
              <DateInput
                label="날짜"
                value={formData.date.toISOString().split('T')[0]}
                onChange={handleDateChange}
                error={!!errors.date}
                helperText={errors.date}
                fullWidth
                maxDate={new Date().toISOString().split('T')[0]} // 오늘까지만 선택 가능
              />
              
              {/* 빠른 날짜 선택 버튼들 */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const today = new Date();
                    setFormData(prev => ({ ...prev, date: today }));
                    setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                >
                  오늘
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setFormData(prev => ({ ...prev, date: yesterday }));
                    setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                >
                  어제
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    setFormData(prev => ({ ...prev, date: weekAgo }));
                    setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                >
                  일주일 전
                </Button>
              </Stack>
            </Box>

            {/* 카테고리 선택 */}
            <CategorySelect
              label="카테고리"
              categories={categories.map(cat => ({
                id: cat.id,
                name: `${cat.icon || ''} ${cat.name}`.trim(),
                subcategories: cat.subcategories.map(sub => ({
                  id: sub.id,
                  name: `${sub.icon || ''} ${sub.name}`.trim(),
                  parentId: cat.id
                }))
              }))}
              value={formData.subcategory || formData.category}
              onChange={handleCategoryChange}
              error={!!errors.category}
              helperText={errors.category || '대분류 또는 소분류를 선택하세요'}
              required
              fullWidth
              includeSubcategories={true}
            />

            {/* 지출 내용 */}
            <Input
              label="지출 내용"
              value={formData.description}
              onChange={handleDescriptionChange}
              error={!!errors.description}
              helperText={errors.description}
              required
              fullWidth
              multiline
              rows={2}
            />

            {/* 결제수단 */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                결제수단 {errors.paymentMethod && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              
              {/* 결제수단 버튼 그룹 */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {PAYMENT_METHOD_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={formData.paymentMethod === option.value ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      const event = {
                        target: { value: option.value }
                      } as React.ChangeEvent<{ value: unknown }>;
                      handlePaymentMethodChange(event);
                    }}
                    sx={{
                      minWidth: '80px',
                      mb: 1,
                      textTransform: 'none'
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              
              {errors.paymentMethod && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.paymentMethod}
                </Typography>
              )}
            </Box>

            {/* 태그 입력 */}
            <Box>
              <Input
                label="태그"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagAdd}
                helperText="태그를 입력하고 Enter를 누르세요"
                fullWidth
                placeholder="예: 외식, 생필품, 교통..."
              />
              
              {formData.tags.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleTagRemove(tag)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* 고정지출 스위치 */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFixed}
                  onChange={handleFixedToggle}
                  color="primary"
                />
              }
              label="고정지출"
            />

            {formData.isFixed && (
              <Alert severity="info" sx={{ mt: 1 }}>
                고정지출로 설정하면 매월 반복되는 지출로 분류됩니다.
              </Alert>
            )}

            {/* 버튼 영역 */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isLoading}
                fullWidth={!onCancel}
                sx={{ flex: onCancel ? 1 : undefined }}
              >
                {isLoading ? '저장 중...' : (initialData ? '수정' : '저장')}
              </Button>
              
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  sx={{ flex: 1 }}
                >
                  취소
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;