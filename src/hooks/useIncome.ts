// 수입 관리 Hook
import { useContext } from 'react';
import { IncomeContext } from '../context/IncomeContext';

export const useIncome = () => {
  const context = useContext(IncomeContext);
  
  if (!context) {
    throw new Error('useIncome must be used within IncomeProvider');
  }
  
  return context;
};