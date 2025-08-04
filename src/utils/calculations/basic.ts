// 기본 계산 유틸리티 함수

import type { Expense, ExpenseSummary, PaymentMethod } from '../../types';

/**
 * 지출 목록의 총합 계산
 */
export const calculateTotalAmount = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * 지출 요약 통계 계산
 */
export const calculateExpenseSummary = (expenses: Expense[]): ExpenseSummary => {
  const totalAmount = calculateTotalAmount(expenses);
  const count = expenses.length;
  const averageAmount = count > 0 ? totalAmount / count : 0;

  // 카테고리별 집계
  const byCategory = expenses.reduce((acc, expense) => {
    const key = expense.category;
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // 결제수단별 집계
  const byPaymentMethod = expenses.reduce((acc, expense) => {
    const key = expense.paymentMethod;
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  return {
    totalAmount,
    count,
    averageAmount,
    byCategory,
    byPaymentMethod
  };
};

/**
 * 기간별 지출 필터링
 */
export const filterExpensesByDateRange = (
  expenses: Expense[], 
  startDate: Date, 
  endDate: Date
): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * 카테고리별 지출 필터링
 */
export const filterExpensesByCategory = (
  expenses: Expense[], 
  category: string, 
  subcategory?: string
): Expense[] => {
  return expenses.filter(expense => {
    if (subcategory) {
      return expense.category === category && expense.subcategory === subcategory;
    }
    return expense.category === category;
  });
};

/**
 * 고정비/비고정비 분리
 */
export const separateFixedExpenses = (expenses: Expense[]) => {
  const fixed = expenses.filter(expense => expense.isFixed);
  const variable = expenses.filter(expense => !expense.isFixed);
  
  return {
    fixed: {
      expenses: fixed,
      total: calculateTotalAmount(fixed)
    },
    variable: {
      expenses: variable,
      total: calculateTotalAmount(variable)
    }
  };
};

/**
 * 월별 지출 집계
 */
export const calculateMonthlyExpenses = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    const monthKey = expense.date.toISOString().slice(0, 7); // YYYY-MM
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * 일별 지출 집계
 */
export const calculateDailyExpenses = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    const dateKey = expense.date.toISOString().slice(0, 10); // YYYY-MM-DD
    acc[dateKey] = (acc[dateKey] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * 평균 일일 지출 계산
 */
export const calculateAverageDailyExpense = (
  expenses: Expense[], 
  startDate: Date, 
  endDate: Date
): number => {
  const filteredExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
  const totalAmount = calculateTotalAmount(filteredExpenses);
  
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return totalAmount / daysDiff;
};

/**
 * 숫자를 한국 원화 형식으로 포맷
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

/**
 * 퍼센트 계산
 */
export const calculatePercentage = (part: number, total: number): number => {
  return total > 0 ? Math.round((part / total) * 100) : 0;
};