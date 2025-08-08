// 예산 관리 Context

import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { Budget, BudgetFormData, MonthlyTarget } from '../types/budget.types';
import { LocalStorage } from '../utils/storage/localStorage';
import { ExpenseContext } from './ExpenseContext';
import { CategoryContext } from './CategoryContext';

// State 타입 정의
interface BudgetState {
  budgets: Budget[];
  monthlyTargets: MonthlyTarget[];
  currentMonth: string;
  loading: boolean;
  error: string | null;
}

// Action 타입 정의
type BudgetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_MONTHLY_TARGETS'; payload: MonthlyTarget[] }
  | { type: 'UPDATE_MONTHLY_TARGET'; payload: MonthlyTarget }
  | { type: 'SET_CURRENT_MONTH'; payload: string };

// Context 타입 정의
interface BudgetContextType {
  state: BudgetState;
  addBudget: (budgetData: BudgetFormData) => void;
  updateBudget: (id: string, budgetData: BudgetFormData) => void;
  deleteBudget: (id: string) => void;
  getBudgetForMonth: (month: string) => Budget | undefined;
  getCurrentMonthBudget: () => Budget | undefined;
  calculateBudgetProgress: (month?: string) => any;
  updateMonthlyTarget: (target: Omit<MonthlyTarget, 'id'>) => void;
}

// 초기 상태 생성 함수
const createInitialState = (): BudgetState => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    budgets: [],
    monthlyTargets: [],
    currentMonth,
    loading: false,
    error: null
  };
};

// Reducer 함수
const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        )
      };
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload)
      };
    
    case 'SET_MONTHLY_TARGETS':
      return { ...state, monthlyTargets: action.payload };
    
    case 'UPDATE_MONTHLY_TARGET':
      return {
        ...state,
        monthlyTargets: state.monthlyTargets.map(target =>
          target.month === action.payload.month ? action.payload : target
        ).concat(
          state.monthlyTargets.find(t => t.month === action.payload.month) 
            ? [] 
            : [action.payload]
        )
      };
    
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };
    
    default:
      return state;
  }
};

// Context 생성
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Provider 컴포넌트
export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, undefined, createInitialState);
  const expenseContext = useContext(ExpenseContext);
  const categoryContext = useContext(CategoryContext);

  // localStorage에서 데이터 로드
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const savedBudgets = LocalStorage.get('BUDGETS', []);
        const savedTargets = LocalStorage.get('MONTHLY_TARGETS', []);
        
        // Date 객체로 변환
        const budgets = savedBudgets.map((budget: Budget) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt)
        }));
        
        const targets = savedTargets.map((target: MonthlyTarget) => target);
        
        dispatch({ type: 'SET_BUDGETS', payload: budgets });
        dispatch({ type: 'SET_MONTHLY_TARGETS', payload: targets });
      } catch (error) {
        console.error('Failed to load budgets:', error);
        dispatch({ type: 'SET_ERROR', payload: '예산 데이터를 불러오는 중 오류가 발생했습니다.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadBudgets();
  }, []);

  // 예산 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.budgets.length > 0) {
      LocalStorage.set('BUDGETS', state.budgets);
    }
  }, [state.budgets]);

  useEffect(() => {
    if (state.monthlyTargets.length > 0) {
      LocalStorage.set('MONTHLY_TARGETS', state.monthlyTargets);
    }
  }, [state.monthlyTargets]);

  // 예산 추가
  const addBudget = (budgetData: BudgetFormData) => {
    try {
      const now = new Date();
      
      // 카테고리별 실제 지출 계산
      const categoryBudgets = budgetData.categoryBudgets.map(catBudget => {
        const actualSpent = calculateCategorySpent(catBudget.categoryId, budgetData.month);
        return {
          ...catBudget,
          spentAmount: actualSpent,
          remainingAmount: catBudget.budgetAmount - actualSpent
        };
      });

      const newBudget: Budget = {
        id: `budget-${Date.now()}`,
        ...budgetData,
        categoryBudgets,
        createdAt: now,
        updatedAt: now
      };
      
      dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    } catch (error) {
      console.error('Failed to add budget:', error);
      dispatch({ type: 'SET_ERROR', payload: '예산 추가 중 오류가 발생했습니다.' });
    }
  };

  // 예산 수정
  const updateBudget = (id: string, budgetData: BudgetFormData) => {
    try {
      const existingBudget = state.budgets.find(b => b.id === id);
      if (!existingBudget) {
        dispatch({ type: 'SET_ERROR', payload: '수정할 예산을 찾을 수 없습니다.' });
        return;
      }

      // 카테고리별 실제 지출 재계산
      const categoryBudgets = budgetData.categoryBudgets.map(catBudget => {
        const actualSpent = calculateCategorySpent(catBudget.categoryId, budgetData.month);
        return {
          ...catBudget,
          spentAmount: actualSpent,
          remainingAmount: catBudget.budgetAmount - actualSpent
        };
      });

      const updatedBudget: Budget = {
        ...existingBudget,
        ...budgetData,
        categoryBudgets,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
    } catch (error) {
      console.error('Failed to update budget:', error);
      dispatch({ type: 'SET_ERROR', payload: '예산 수정 중 오류가 발생했습니다.' });
    }
  };

  // 예산 삭제
  const deleteBudget = (id: string) => {
    try {
      dispatch({ type: 'DELETE_BUDGET', payload: id });
    } catch (error) {
      console.error('Failed to delete budget:', error);
      dispatch({ type: 'SET_ERROR', payload: '예산 삭제 중 오류가 발생했습니다.' });
    }
  };

  // 특정 월 예산 조회
  const getBudgetForMonth = (month: string): Budget | undefined => {
    return state.budgets.find(budget => budget.month === month);
  };

  // 현재 월 예산 조회
  const getCurrentMonthBudget = (): Budget | undefined => {
    return getBudgetForMonth(state.currentMonth);
  };

  // 카테고리별 실제 지출 계산 (ExpenseContext 연동)
  const calculateCategorySpent = (categoryId: string, month: string): number => {
    if (!expenseContext) return 0;
    
    const [year, monthNum] = month.split('-').map(Number);
    
    return expenseContext.state.expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.category === categoryId &&
               expenseDate.getFullYear() === year &&
               expenseDate.getMonth() === monthNum - 1;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // 예산 진행률 계산
  const calculateBudgetProgress = (month: string = state.currentMonth) => {
    const budget = getBudgetForMonth(month);
    if (!budget || !expenseContext) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        remainingBudget: 0,
        progressPercentage: 0,
        categoryProgresses: []
      };
    }

    // 실제 지출 재계산
    const categoryProgresses = budget.categoryBudgets.map(catBudget => {
      const actualSpent = calculateCategorySpent(catBudget.categoryId, month);
      const percentage = catBudget.budgetAmount > 0 ? (actualSpent / catBudget.budgetAmount) * 100 : 0;
      
      return {
        ...catBudget,
        spentAmount: actualSpent,
        remainingAmount: catBudget.budgetAmount - actualSpent,
        progressPercentage: percentage,
        isOverBudget: actualSpent > catBudget.budgetAmount
      };
    });

    const totalBudget = budget.totalExpenseBudget;
    const totalSpent = categoryProgresses.reduce((sum, cat) => sum + cat.spentAmount, 0);
    const remainingBudget = totalBudget - totalSpent;
    const progressPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      progressPercentage,
      categoryProgresses
    };
  };

  // 월별 목표 업데이트
  const updateMonthlyTarget = (targetData: Omit<MonthlyTarget, 'id'>) => {
    try {
      // 실제 데이터 계산 (ExpenseContext에서)
      const actualData = calculateActualData(targetData.month);
      
      const target: MonthlyTarget = {
        id: `target-${targetData.month}`,
        ...targetData,
        ...actualData,
        achievementRate: {
          income: targetData.incomeTarget > 0 ? (actualData.actualIncome / targetData.incomeTarget) * 100 : 0,
          expense: targetData.expenseTarget > 0 ? (actualData.actualExpense / targetData.expenseTarget) * 100 : 0,
          savings: targetData.savingsTarget > 0 ? (actualData.actualSavings / targetData.savingsTarget) * 100 : 0
        }
      };
      
      dispatch({ type: 'UPDATE_MONTHLY_TARGET', payload: target });
    } catch (error) {
      console.error('Failed to update monthly target:', error);
      dispatch({ type: 'SET_ERROR', payload: '월별 목표 업데이트 중 오류가 발생했습니다.' });
    }
  };

  // 실제 수입/지출/저축 계산
  const calculateActualData = (month: string) => {
    if (!expenseContext || !categoryContext) {
      return { actualIncome: 0, actualExpense: 0, actualSavings: 0 };
    }

    const [year, monthNum] = month.split('-').map(Number);
    
    // 카테고리 ID 찾기
    const incomeCategory = categoryContext.state.categories.find(cat => cat.name === '수입');
    const savingsCategory = categoryContext.state.categories.find(cat => cat.name === '저축');
    
    const monthlyExpenses = expenseContext.state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === monthNum - 1;
    });

    const actualIncome = monthlyExpenses
      .filter(expense => expense.category === incomeCategory?.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const actualSavings = monthlyExpenses
      .filter(expense => expense.category === savingsCategory?.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const actualExpense = monthlyExpenses
      .filter(expense => expense.category !== incomeCategory?.id && expense.category !== savingsCategory?.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return { actualIncome, actualExpense, actualSavings };
  };

  const value: BudgetContextType = {
    state,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetForMonth,
    getCurrentMonthBudget,
    calculateBudgetProgress,
    updateMonthlyTarget
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Context export
export { BudgetContext };