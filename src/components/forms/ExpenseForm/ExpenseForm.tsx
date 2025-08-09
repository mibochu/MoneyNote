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
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  Checkbox
} from '@mui/material';
import { 
  Save as SaveIcon, 
  BookmarkAdd as TemplateIcon,
  BookmarkBorder as LoadTemplateIcon
} from '@mui/icons-material';

import { CurrencyInput, DateInput } from '../../ui/Input';
import { CategorySelect } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

import type { ExpenseFormData, PaymentMethod } from '../../../types/expense.types';
import { PAYMENT_METHOD_OPTIONS, DEFAULT_PAYMENT_METHOD } from '../../../utils/constants/paymentMethods';
import { validateExpenseForm, validateField } from '../../../utils/validators/expenseValidators';
import { useTemplates } from '../../../context/TemplateContext';

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
  const { state: templateState, addExpenseTemplate, deleteExpenseTemplate } = useTemplates();
  
  // 폼 상태 관리 (2025 React 패턴: 지연 초기화)
  const [formData, setFormData] = useState<ExpenseFormData>(() => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 정규화
    
    return {
      amount: initialData?.amount ?? 0,
      category: initialData?.category ?? '',
      subcategory: initialData?.subcategory ?? '',
      description: initialData?.description ?? '',
      paymentMethod: initialData?.paymentMethod ?? DEFAULT_PAYMENT_METHOD,
      tags: initialData?.tags ?? [],
      isFixed: initialData?.isFixed ?? false,
      date: initialData?.date ?? defaultDate
    };
  });

  // 에러 상태 관리
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>(() => ({}));

  // 태그 입력 상태
  const [tagInput, setTagInput] = useState('');

  // 템플릿 관련 상태
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [loadTemplateMenuAnchor, setLoadTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveAmount, setSaveAmount] = useState(false);

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
    const dateValue = event.target.value;
    
    // 빈 값인 경우 현재 날짜로 설정
    if (!dateValue) {
      const today = new Date();
      // 시간을 00:00:00으로 설정하여 날짜만 비교하도록
      today.setHours(0, 0, 0, 0);
      setFormData(prev => ({ ...prev, date: today }));
      setErrors(prev => ({ ...prev, date: undefined }));
      return;
    }
    
    // 날짜 문자열을 Date 객체로 변환 (시간은 00:00:00으로 설정)
    const date = new Date(dateValue + 'T00:00:00');
    
    // 유효하지 않은 날짜인지 확인
    if (isNaN(date.getTime())) {
      setErrors(prev => ({ ...prev, date: '유효하지 않은 날짜입니다.' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, date }));
    
    // 실시간 검증 (수정된 validator 사용)
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

  // 템플릿 관련 핸들러
  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      addExpenseTemplate(templateName.trim(), formData, saveAmount);
      setSaveTemplateDialog(false);
      setTemplateName('');
      setSaveAmount(false);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templateState.expenseTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        description: template.description,
        amount: template.amount || prev.amount,
        category: template.category,
        subcategory: template.subcategory || '',
        paymentMethod: template.paymentMethod as PaymentMethod,
        tags: [...template.tags],
        isFixed: template.isFixed
      }));
      setErrors({}); // 에러 초기화
    }
    setLoadTemplateMenuAnchor(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteExpenseTemplate(templateId);
  };

  // 폼 제출
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      // 제출 전 데이터 검증 및 정제
      const submissionData: ExpenseFormData = {
        ...formData,
        date: formData.date instanceof Date ? formData.date : new Date(formData.date),
        amount: Number(formData.amount) || 0,
        description: formData.description.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory?.trim() || '',
        tags: formData.tags.filter(tag => tag.trim().length > 0)
      };
      
      console.log('Submitting expense data:', submissionData); // 디버깅용
      onSubmit(submissionData);
    }
  };


  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {initialData ? '지출 수정' : '지출 입력'}
          </Typography>
          
          {/* 템플릿 버튼들 */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LoadTemplateIcon />}
              onClick={(e) => setLoadTemplateMenuAnchor(e.currentTarget)}
              disabled={templateState.expenseTemplates.length === 0}
            >
              불러오기
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
              disabled={!formData.description || !formData.category}
            >
              저장
            </Button>
          </Stack>
        </Box>

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
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={isLoading}
                fullWidth={!onCancel}
                sx={{ 
                  flex: onCancel ? 1 : undefined,
                  minHeight: '48px' // 로딩 애니메이션 안정성을 위한 최소 높이
                }}
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
        
        {/* 템플릿 저장 메뉴 */}
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => setTemplateMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            setSaveTemplateDialog(true);
            setTemplateMenuAnchor(null);
          }}>
            <TemplateIcon sx={{ mr: 1 }} />
            템플릿으로 저장
          </MenuItem>
        </Menu>

        {/* 템플릿 불러오기 메뉴 */}
        <Menu
          anchorEl={loadTemplateMenuAnchor}
          open={Boolean(loadTemplateMenuAnchor)}
          onClose={() => setLoadTemplateMenuAnchor(null)}
          PaperProps={{
            style: {
              maxHeight: 300,
              width: '280px'
            }
          }}
        >
          {templateState.expenseTemplates.map((template) => (
            <MenuItem key={template.id}>
              <Box sx={{ width: '100%' }}>
                <Box 
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.description} • {template.amount ? `${template.amount.toLocaleString()}원` : '금액 없음'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                  >
                    삭제
                  </Button>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* 템플릿 저장 다이얼로그 */}
        <Dialog open={saveTemplateDialog} onClose={() => setSaveTemplateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>템플릿 저장</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="템플릿 이름"
              fullWidth
              variant="outlined"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="예: 일일 교통비, 점심식사"
              sx={{ mb: 2 }}
            />
            <FormControl component="fieldset">
              <FormLabel component="legend">저장 옵션</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveAmount}
                    onChange={(e) => setSaveAmount(e.target.checked)}
                  />
                }
                label={`금액도 저장 (${formData.amount.toLocaleString()}원)`}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveTemplateDialog(false)}>취소</Button>
            <Button onClick={handleSaveTemplate} variant="contained" disabled={!templateName.trim()}>
              저장
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;