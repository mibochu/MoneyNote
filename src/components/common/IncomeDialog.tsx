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
  Typography,
  Box,
  Menu,
  Checkbox,
  FormControl,
  FormLabel,
  FormControlLabel
} from '@mui/material';
import {
  BookmarkAdd as TemplateIcon,
  BookmarkBorder as LoadTemplateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import type { IncomeFormData } from '../../types/income.types';
import { INCOME_SOURCES } from '../../types/income.types';
import { useTemplates } from '../../context/TemplateContext';

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
  const { state: templateState, addIncomeTemplate, deleteIncomeTemplate } = useTemplates();
  
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: 0,
    source: 'salary',
    description: '',
    category: 'income',
    date: new Date()
  });
  
  const [dateValue, setDateValue] = useState<Dayjs>(dayjs(new Date()));
  const [customSource, setCustomSource] = useState<string>(''); // 기타 출처 상세 입력용
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 템플릿 관련 상태
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [loadTemplateMenuAnchor, setLoadTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveAmount, setSaveAmount] = useState(false);
  
  // initialData가 변경될 때 폼 데이터 업데이트
  React.useEffect(() => {
    if (initialData && open) {
      setFormData({
        amount: initialData.amount || 0,
        source: initialData.source || 'salary',
        description: initialData.description || '',
        category: initialData.category || 'income',
        date: initialData.date || new Date()
      });
      setDateValue(dayjs(initialData.date || new Date()));
      
      // 기존 데이터에서 기타 출처 상세 내용 추출
      if (initialData.source === 'other' && initialData.description) {
        const match = (initialData.description || '').match(/\(출처: (.+)\)$/);
        if (match) {
          setCustomSource(match[1]);
          // 설명에서 출처 부분 제거
          setFormData(prev => ({
            ...prev,
            description: (initialData.description || '').replace(/\s*\(출처: .+\)$/, '')
          }));
        }
      } else {
        setCustomSource('');
      }
    } else if (!initialData && open) {
      // 새로 추가하는 경우 초기화
      const now = new Date();
      setFormData({
        amount: 0,
        source: 'salary',
        description: '',
        category: 'income',
        date: now
      });
      setDateValue(dayjs(now));
      setCustomSource('');
    }
  }, [initialData, open]);

  // 천단위 콤마 추가 함수
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  // 콤마가 포함된 문자열을 숫자로 변환
  const parseNumberFromCommas = (str: string): number => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '금액을 입력해주세요.';
    } else if (formData.amount > 100000000000) { // 100억원 제한
      newErrors.amount = '금액은 100억원 이하로 입력해주세요.';
    }

    if (!formData.source.trim()) {
      newErrors.source = '수입 출처를 선택해주세요.';
    }

    // 기타 출처 선택 시 상세 내용 검증
    if (formData.source === 'other' && !customSource.trim()) {
      newErrors.customSource = '기타 출처 상세를 입력해주세요.';
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

    // 기타 출처인 경우 customSource를 description에 추가
    const finalFormData = {
      ...formData,
      description: formData.source === 'other' 
        ? `${formData.description} (출처: ${customSource})`
        : formData.description
    };

    onSave(finalFormData);
    handleClose();
  };

  // 템플릿 관련 핸들러
  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      const templateData = {
        ...formData,
        description: formData.source === 'other' 
          ? `${formData.description} (출처: ${customSource})`
          : formData.description
      };
      addIncomeTemplate(templateName.trim(), templateData, saveAmount);
      setSaveTemplateDialog(false);
      setTemplateName('');
      setSaveAmount(false);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templateState.incomeTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        description: template.description,
        amount: template.amount || prev.amount,
        source: template.source
      }));
      
      // 기타 출처인 경우 customSource 파싱
      if (template.source === 'other') {
        const match = template.description.match(/\(출처: (.+)\)$/);
        if (match) {
          setCustomSource(match[1]);
          setFormData(prev => ({
            ...prev,
            description: template.description.replace(/\s*\(출처: .+\)$/, '')
          }));
        }
      } else {
        setCustomSource('');
      }
      
      setErrors({}); // 에러 초기화
    }
    setLoadTemplateMenuAnchor(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteIncomeTemplate(templateId);
  };

  const handleClose = () => {
    setErrors({});
    setSaveTemplateDialog(false);
    setTemplateName('');
    setSaveAmount(false);
    setTemplateMenuAnchor(null);
    setLoadTemplateMenuAnchor(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            💸 {initialData ? '수입 수정' : '수입 추가'}
            {initialData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'normal' }}>
                {initialData.description} • {formatNumberWithCommas(initialData.amount || 0)}원 • {new Date(initialData.date || new Date()).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}
              </Typography>
            )}
          </Box>
          
          {/* 템플릿 버튼들 */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LoadTemplateIcon />}
              onClick={(e) => setLoadTemplateMenuAnchor(e.currentTarget)}
              disabled={templateState.incomeTemplates.length === 0}
            >
              불러오기
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
              disabled={!formData.description || !formData.source}
            >
              저장
            </Button>
          </Stack>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {initialData ? '수입 정보를 수정해보세요!' : '이번 달 수입을 간단하게 추가해보세요!'}
          </Alert>

          {/* 금액 입력 */}
          <TextField
            label="수입 금액"
            value={formData.amount > 0 ? formatNumberWithCommas(formData.amount) : ''}
            onChange={(e) => {
              const numericValue = parseNumberFromCommas(e.target.value);
              // 100억원 제한 적용
              if (numericValue <= 100000000000) {
                setFormData(prev => ({ 
                  ...prev, 
                  amount: numericValue
                }));
              }
            }}
            error={!!errors.amount}
            helperText={errors.amount || '천단위로 콤마가 자동 추가됩니다 (최대 100억원)'}
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
            onChange={(e) => {
              const selectedSource = e.target.value;
              setFormData(prev => ({ 
                ...prev, 
                source: selectedSource
              }));
              // 기타가 아닌 경우 customSource 초기화
              if (selectedSource !== 'other') {
                setCustomSource('');
              }
            }}
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

          {/* 기타 출처 상세 입력 */}
          {formData.source === 'other' && (
            <TextField
              label="기타 출처 상세"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              error={!!errors.customSource}
              helperText={errors.customSource || '구체적인 수입 출처를 입력해주세요'}
              placeholder="예) 프리랜싱, 중고거래, 상금 등"
              fullWidth
              required
            />
          )}

          {/* 날짜 선택 */}
          <DatePicker
            label="날짜"
            format="YYYY/MM/DD"
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
          disabled={
            !formData.amount || 
            !formData.source || 
            !formData.description ||
            (formData.source === 'other' && !customSource.trim())
          }
        >
          {initialData ? '수정' : '추가'}
        </Button>
      </DialogActions>
      
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
        {templateState.incomeTemplates.map((template) => (
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
            placeholder="예: 월급, 부업 수입"
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
    </Dialog>
  );
};

export default IncomeDialog;