// 자동 반복 입력 관리 Hook
import { useContext } from 'react';
import { RecurringContext } from '../context/RecurringContext';

export const useRecurring = () => {
  const context = useContext(RecurringContext);
  
  if (!context) {
    throw new Error('useRecurring must be used within RecurringProvider');
  }
  
  return context;
};