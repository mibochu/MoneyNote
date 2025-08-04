// 지출 관리 Context

import React, { createContext, useReducer, useEffect } from 'react';
import type { Expense, ExpenseFormData, ExpenseFilter } from '../types';
import { LocalStorage } from '../utils/storage/localStorage';

// State 타입 정의
interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  filter: ExpenseFilter;
}

// Action 타입 정의
type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: ExpenseFilter };

// Context 타입 정의
interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (expenseData: ExpenseFormData) => void;
  updateExpense: (id: string, expenseData: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  setFilter: (filter: ExpenseFilter) => void;
  getFilteredExpenses: () => Expense[];
}

// 초기 상태
const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  filter: {}
};

// Reducer 함수
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      return state;
  }
};

// Context 생성
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Provider 컴포넌트
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const loadExpenses = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedExpenses = LocalStorage.get('EXPENSES', []);
        
        // Date 객체로 변환
        const expenses = savedExpenses.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt)
        }));
        
        dispatch({ type: 'SET_EXPENSES', payload: expenses });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: '지출 데이터를 불러오는 중 오류가 발생했습니다.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadExpenses();
  }, []);

  // 지출 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    LocalStorage.set('EXPENSES', state.expenses);
  }, [state.expenses]);

  // 지출 추가
  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expenseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  // 지출 수정
  const updateExpense = (id: string, expenseData: ExpenseFormData) => {
    const existingExpense = state.expenses.find(e => e.id === id);
    if (!existingExpense) return;

    const updatedExpense: Expense = {
      ...existingExpense,
      ...expenseData,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
  };

  // 지출 삭제
  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  // 필터 설정
  const setFilter = (filter: ExpenseFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // 필터링된 지출 목록 반환
  const getFilteredExpenses = (): Expense[] => {
    let filtered = [...state.expenses];

    const { startDate, endDate, category, subcategory, paymentMethod, tags, isFixed } = state.filter;

    if (startDate) {
      filtered = filtered.filter(expense => expense.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(expense => expense.date <= endDate);
    }

    if (category) {
      filtered = filtered.filter(expense => expense.category === category);
    }

    if (subcategory) {
      filtered = filtered.filter(expense => expense.subcategory === subcategory);
    }

    if (paymentMethod) {
      filtered = filtered.filter(expense => expense.paymentMethod === paymentMethod);
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter(expense => 
        tags.some(tag => expense.tags.includes(tag))
      );
    }

    if (isFixed !== undefined) {
      filtered = filtered.filter(expense => expense.isFixed === isFixed);
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const value: ExpenseContextType = {
    state,
    addExpense,
    updateExpense,
    deleteExpense,
    setFilter,
    getFilteredExpenses
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Context export
export { ExpenseContext };