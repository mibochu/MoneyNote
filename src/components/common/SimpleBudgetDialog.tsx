import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import type { BudgetFormData, CategoryBudget } from '../../types/budget.types';
import type { Category } from '../../types/category.types';

interface SimpleBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (budgetData: BudgetFormData) => void;
  categories: Category[];
}

const SimpleBudgetDialog: React.FC<SimpleBudgetDialogProps> = ({
  open,
  onClose,
  onSave,
  categories
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const [formData, setFormData] = useState({
    month: currentMonth,
    income: 0,
    totalExpenseBudget: 0,
    savingsBudget: 0
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});

  const handleSave = () => {
    // 선택된 카테고리들의 예산 생성
    const categoryBudgetList: Omit<CategoryBudget, 'spentAmount' | 'remainingAmount'>[] = 
      selectedCategories.map(categoryId => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || '알 수 없음',
          budgetAmount: categoryBudgets[categoryId] || 0
        };
      });

    const budgetData: BudgetFormData = {
      ...formData,
      categoryBudgets: categoryBudgetList
    };

    onSave(budgetData);
    handleClose();
  };

  const handleClose = () => {
    // 폼 리셋
    setFormData({
      month: currentMonth,
      income: 0,
      totalExpenseBudget: 0,
      savingsBudget: 0
    });
    setSelectedCategories([]);
    setCategoryBudgets({});
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryBudgetChange = (categoryId: string, amount: string) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: parseInt(amount) || 0
    }));
  };

  // 지출용 카테고리만 필터링 (수입, 저축 제외)
  const expenseCategories = categories.filter(cat => 
    cat.name !== '수입' && cat.name !== '저축'
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>이번 달 예산 설정</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            간단한 예산을 설정해보세요. 카테고리별 세부 예산은 선택사항입니다.
          </Alert>

          {/* 기본 예산 설정 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="월 수입"
              type="number"
              value={formData.income}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                income: parseInt(e.target.value) || 0 
              }))}
              InputProps={{
                startAdornment: '₩'
              }}
            />
            <TextField
              label="지출 예산"
              type="number"
              value={formData.totalExpenseBudget}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                totalExpenseBudget: parseInt(e.target.value) || 0 
              }))}
              InputProps={{
                startAdornment: '₩'
              }}
            />
            <TextField
              label="저축 목표"
              type="number"
              value={formData.savingsBudget}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                savingsBudget: parseInt(e.target.value) || 0 
              }))}
              InputProps={{
                startAdornment: '₩'
              }}
            />
          </Box>

          {/* 카테고리별 예산 (선택사항) */}
          <Box>
            <Typography variant="h6" gutterBottom>
              카테고리별 세부 예산 (선택사항)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              관리하고 싶은 카테고리를 선택하세요
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {expenseCategories.map(category => (
                <Chip
                  key={category.id}
                  label={`${category.icon} ${category.name}`}
                  onClick={() => toggleCategory(category.id)}
                  color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                  variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            {/* 선택된 카테고리들의 예산 입력 */}
            {selectedCategories.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return (
                    <TextField
                      key={categoryId}
                      label={`${category?.name} 예산`}
                      type="number"
                      value={categoryBudgets[categoryId] || ''}
                      onChange={(e) => handleCategoryBudgetChange(categoryId, e.target.value)}
                      InputProps={{
                        startAdornment: '₩'
                      }}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={formData.totalExpenseBudget <= 0}
        >
          예산 설정
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleBudgetDialog;