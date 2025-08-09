import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Box,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import type { 
  RecurringFormData, 
  RecurringTransactionType, 
  RecurringFrequency 
} from '../../types/recurring.types';
import { RECURRING_FREQUENCY_OPTIONS } from '../../types/recurring.types';
import type { Category } from '../../types/category.types';

interface RecurringDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RecurringFormData) => void;
  categories: Category[];
  initialData?: Partial<RecurringFormData>;
  editMode?: boolean;
}

const RecurringDialog: React.FC<RecurringDialogProps> = ({
  open,
  onClose,
  onSave,
  categories,
  initialData,
  editMode = false
}) => {
  const [formData, setFormData] = useState<RecurringFormData>({
    type: initialData?.type || 'expense',
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || 'card',
    tags: initialData?.tags || [],
    frequency: initialData?.frequency || 'monthly',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate
  });

  const [startDateValue, setStartDateValue] = useState<Dayjs>(
    dayjs(initialData?.startDate || new Date())
  );
  const [endDateValue, setEndDateValue] = useState<Dayjs | null>(
    initialData?.endDate ? dayjs(initialData.endDate) : null
  );
  const [hasEndDate, setHasEndDate] = useState(!!initialData?.endDate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 카테고리별 서브카테고리 필터링
  const selectedCategory = categories.find(cat => cat.id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  // 수입/지출에 따른 카테고리 필터링
  const filteredCategories = categories.filter(cat => {
    if (formData.type === 'income') {
      return cat.name === '수입';
    } else {
      return cat.name !== '수입' && cat.name !== '저축';
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '금액을 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }

    if (formData.type === 'expense' && !formData.paymentMethod) {
      newErrors.paymentMethod = '결제수단을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const submitData: RecurringFormData = {
      ...formData,
      endDate: hasEndDate && endDateValue ? endDateValue.toDate() : undefined
    };

    onSave(submitData);
    handleClose();
  };

  const handleClose = () => {
    const now = new Date();
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      subcategory: '',
      description: '',
      paymentMethod: 'card',
      tags: [],
      frequency: 'monthly',
      startDate: now,
      endDate: undefined
    });
    setStartDateValue(dayjs(now));
    setEndDateValue(null);
    setHasEndDate(false);
    setErrors({});
    onClose();
  };

  const getFrequencyDescription = (frequency: RecurringFrequency): string => {
    const descriptions = {
      daily: '매일 같은 시간에 자동으로 기록됩니다',
      weekly: '매주 같은 요일에 자동으로 기록됩니다',
      monthly: '매월 같은 날짜에 자동으로 기록됩니다',
      yearly: '매년 같은 날짜에 자동으로 기록됩니다'
    };
    return descriptions[frequency];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? '🔄 반복 거래 수정' : '🔄 반복 거래 추가'}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            한 번 설정하면 자동으로 반복되는 수입/지출을 등록하세요!<br/>
            예: 월급, 통신비, 구독료, 보험료 등
          </Alert>

          {/* 거래 유형 선택 */}
          <TextField
            label="거래 유형"
            select
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value as RecurringTransactionType;
              setFormData(prev => ({ 
                ...prev, 
                type: newType,
                category: '', // 카테고리 초기화
                subcategory: ''
              }));
            }}
            fullWidth
            required
          >
            <MenuItem value="income">💰 수입</MenuItem>
            <MenuItem value="expense">💸 지출</MenuItem>
          </TextField>

          {/* 금액 입력 */}
          <TextField
            label="금액"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              amount: parseInt(e.target.value) || 0 
            }))}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: '₩'
            }}
            fullWidth
            required
          />

          {/* 카테고리 선택 */}
          <TextField
            label="카테고리"
            select
            value={formData.category}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                category: e.target.value,
                subcategory: '' // 서브카테고리 초기화
              }));
            }}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
            required
          >
            {filteredCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 서브카테고리 선택 */}
          {subcategories.length > 0 && (
            <TextField
              label="세부 카테고리"
              select
              value={formData.subcategory || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                subcategory: e.target.value 
              }))}
              fullWidth
            >
              <MenuItem value="">선택 안함</MenuItem>
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.icon} {subcategory.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* 결제수단 (지출인 경우만) */}
          {formData.type === 'expense' && (
            <TextField
              label="결제수단"
              select
              value={formData.paymentMethod || 'card'}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                paymentMethod: e.target.value 
              }))}
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod}
              fullWidth
              required
            >
              <MenuItem value="card">💳 카드</MenuItem>
              <MenuItem value="cash">💵 현금</MenuItem>
              <MenuItem value="bank">🏦 계좌이체</MenuItem>
              <MenuItem value="digital">📱 디지털결제</MenuItem>
              <MenuItem value="other">🔄 기타</MenuItem>
            </TextField>
          )}

          {/* 반복 주기 */}
          <Box>
            <TextField
              label="반복 주기"
              select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                frequency: e.target.value as RecurringFrequency 
              }))}
              fullWidth
              required
            >
              {RECURRING_FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info" sx={{ mt: 1, fontSize: '0.875rem' }}>
              {getFrequencyDescription(formData.frequency)}
            </Alert>
          </Box>

          {/* 시작 날짜 */}
          <DatePicker
            label="시작 날짜"
            value={startDateValue}
            onChange={(newDate) => {
              if (newDate) {
                setStartDateValue(newDate);
                setFormData(prev => ({ ...prev, startDate: newDate.toDate() }));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.startDate,
                helperText: errors.startDate || '첫 번째 실행일을 설정하세요'
              }
            }}
          />

          {/* 종료 날짜 (옵션) */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked) {
                      setEndDateValue(null);
                      setFormData(prev => ({ ...prev, endDate: undefined }));
                    }
                  }}
                />
              }
              label="종료 날짜 설정"
            />
            
            {hasEndDate && (
              <DatePicker
                label="종료 날짜"
                value={endDateValue}
                onChange={(newDate) => {
                  setEndDateValue(newDate);
                  setFormData(prev => ({ 
                    ...prev, 
                    endDate: newDate ? newDate.toDate() : undefined 
                  }));
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mt: 2 },
                    helperText: '설정하지 않으면 계속 반복됩니다'
                  }
                }}
              />
            )}
          </Box>

          {/* 설명 입력 */}
          <TextField
            label="설명"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: e.target.value 
            }))}
            error={!!errors.description}
            helperText={errors.description || '예) 월급, 휴대폰 요금, 넷플릭스 구독료 등'}
            fullWidth
            required
          />

          {/* 미리보기 */}
          {formData.frequency && formData.amount > 0 && (
            <Alert severity="success">
              <Box>
                <strong>📋 미리보기:</strong><br/>
                <Chip 
                  label={formData.type === 'income' ? '💰 수입' : '💸 지출'} 
                  size="small" 
                  color={formData.type === 'income' ? 'primary' : 'error'} 
                  sx={{ mr: 1 }} 
                />
                <strong>₩{formData.amount.toLocaleString()}</strong> - {formData.description}<br/>
                {RECURRING_FREQUENCY_OPTIONS.find(opt => opt.value === formData.frequency)?.label}로 자동 반복
              </Box>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          취소
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!formData.amount || !formData.category || !formData.description}
        >
          {editMode ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringDialog;