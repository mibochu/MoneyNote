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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import type { IncomeFormData } from '../../types/income.types';
import { INCOME_SOURCES } from '../../types/income.types';

interface IncomeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (incomeData: IncomeFormData) => void;
  initialData?: Partial<IncomeFormData>;
}

const IncomeDialog: React.FC<IncomeDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: initialData?.amount || 0,
    source: initialData?.source || 'salary',
    description: initialData?.description || '',
    category: initialData?.category || 'income',
    date: initialData?.date || new Date()
  });
  
  const [dateValue, setDateValue] = useState<Dayjs>(dayjs(initialData?.date || new Date()));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '금액을 입력해주세요.';
    }

    if (!formData.source.trim()) {
      newErrors.source = '수입 출처를 선택해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    const now = new Date();
    setFormData({
      amount: 0,
      source: 'salary',
      description: '',
      category: 'income',
      date: now
    });
    setDateValue(dayjs(now));
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>💸 수입 추가</DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            이번 달 수입을 간단하게 추가해보세요!
          </Alert>

          {/* 금액 입력 */}
          <TextField
            label="수입 금액"
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

          {/* 수입 출처 선택 */}
          <TextField
            label="수입 출처"
            select
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              source: e.target.value 
            }))}
            error={!!errors.source}
            helperText={errors.source}
            fullWidth
            required
          >
            {INCOME_SOURCES.map((source) => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </TextField>

          {/* 날짜 선택 */}
          <DatePicker
            label="날짜"
            value={dateValue}
            onChange={(newDate) => {
              if (newDate) {
                setDateValue(newDate);
                setFormData(prev => ({ ...prev, date: newDate.toDate() }));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.date,
                helperText: errors.date
              }
            }}
          />

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
            helperText={errors.description || '예) 12월 급여, 프리랜싱 대금 등'}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          취소
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!formData.amount || !formData.source || !formData.description}
        >
          추가
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncomeDialog;