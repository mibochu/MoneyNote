import React, { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import ExpenseForm from './ExpenseForm';
import { useExpenses } from '../../../hooks/useExpenses';
import { useCategories } from '../../../hooks/useCategories';
import type { ExpenseFormData } from '../../../types/expense.types';

export interface ExpenseFormContainerProps {
  initialData?: Partial<ExpenseFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  expenseId?: string;
}

const ExpenseFormContainer: React.FC<ExpenseFormContainerProps> = ({
  initialData,
  onSuccess,
  onCancel,
  editMode = false,
  expenseId
}) => {
  const { addExpense, updateExpense } = useExpenses();
  const { state: categoryState } = useCategories();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (formData: ExpenseFormData) => {
    // 이미 제출 중이면 리턴
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editMode && expenseId) {
        // 수정 모드
        updateExpense(expenseId, formData);
        setNotification({
          open: true,
          message: '지출이 성공적으로 수정되었습니다.',
          severity: 'success'
        });
      } else {
        // 추가 모드
        addExpense(formData);
        setNotification({
          open: true,
          message: '지출이 성공적으로 저장되었습니다.',
          severity: 'success'
        });
      }
      
      // 성공 콜백 실행
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save expense:', error);
      setNotification({
        open: true,
        message: '지출 저장 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      // 약간의 지연 후 비활성화 해제
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 카테고리 데이터를 ExpenseForm에 맞는 형태로 변환
  const formattedCategories = categoryState.categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    subcategories: category.subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
      color: sub.color
    }))
  }));

  return (
    <>
      <ExpenseForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isSubmitting}
        categories={formattedCategories}
      />
      
      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExpenseFormContainer;