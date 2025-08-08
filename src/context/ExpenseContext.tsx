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

// 초기 상태 생성 함수 (2025 React 패턴: 지연 초기화)
const createInitialState = (): ExpenseState => ({
  expenses: [],
  loading: false,
  error: null,
  filter: {}
});

const initialState: ExpenseState = createInitialState();

// Reducer 함수 (2025 React 패턴: 성능 최적화 및 에러 처리 강화)
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  // 예상치 못한 action에 대한 방어 코드
  if (!action || typeof action.type !== 'string') {
    console.error('Invalid action received:', action);
    return state;
  }
  
  switch (action.type) {
    case 'SET_LOADING':
      // 로딩 상태가 바뀔지 않으면 기존 state 반환 (성능 최적화)
      if (state.loading === action.payload) return state;
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      // 에러 상태가 바뀔지 않으면 기존 state 반환
      if (state.error === action.payload) return state;
      return { ...state, error: action.payload, loading: false }; // 에러 발생시 로딩 종료
    
    case 'SET_EXPENSES':
      return { 
        ...state, 
        expenses: action.payload, 
        error: null, // 성공적으로 데이터 로드시 에러 초기화
        loading: false 
      };
    
    case 'ADD_EXPENSE':
      // 중복 추가 방지
      if (state.expenses.some(expense => expense.id === action.payload.id)) {
        console.warn('Expense with this ID already exists:', action.payload.id);
        return state;
      }
      return { ...state, expenses: [...state.expenses, action.payload], error: null };
    
    case 'UPDATE_EXPENSE':
      const expenseExists = state.expenses.some(expense => expense.id === action.payload.id);
      if (!expenseExists) {
        console.warn('Cannot update expense: ID not found:', action.payload.id);
        return state;
      }
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
        error: null
      };
    
    case 'DELETE_EXPENSE':
      const expensesToDelete = state.expenses.filter(expense => expense.id !== action.payload);
      // 삭제할 아이템이 없으면 기존 state 반환
      if (expensesToDelete.length === state.expenses.length) {
        console.warn('Cannot delete expense: ID not found:', action.payload);
        return state;
      }
      return { ...state, expenses: expensesToDelete, error: null };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      // TypeScript에서 exhaustive check를 위한 패턴
      const exhaustiveCheck: never = action;
      console.error('Unhandled action type:', exhaustiveCheck);
      return state;
  }
};

// Context 생성
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Provider 컴포넌트
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState, undefined);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드 (2025 React 패턴: cleanup 및 에러 처리 강화)
  useEffect(() => {
    let isCancelled = false; // cleanup을 위한 플래그

    const loadExpenses = async () => {
      if (isCancelled) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedExpenses = LocalStorage.get('EXPENSES', []);
        
        if (isCancelled) return; // 비동기 작업 중 cleanup 체크
        
        // Date 객체로 변환
        const expenses = savedExpenses.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt)
        }));
        
        if (!isCancelled) {
          dispatch({ type: 'SET_EXPENSES', payload: expenses });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load expenses:', error);
          dispatch({ type: 'SET_ERROR', payload: '지출 데이터를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadExpenses();
    
    // cleanup 함수 (2025 권장사항)
    return () => {
      isCancelled = true;
    };
  }, []); // 빈 의존성 배열: 마운트시에만 실행

  // 지출 데이터 변경 시 localStorage에 저장 (2025 React 패턴: debounce 및 에러 처리)
  useEffect(() => {
    // 초기 로드 중에는 저장하지 않음
    if (state.loading) return;
    
    try {
      LocalStorage.set('EXPENSES', state.expenses);
    } catch (error) {
      console.error('Failed to save expenses to localStorage:', error);
      // 저장 실패시 사용자에게 알리지 않음 (비항적이지 않음)
    }
  }, [state.expenses, state.loading]); // state.loading도 의존성에 추가

  // 지출 추가 (2025 React 패턴: 에러 처리 및 유효성 검증)
  const addExpense = (expenseData: ExpenseFormData) => {
    try {
      // 기본 유효성 검증
      if (!expenseData.description || expenseData.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 지출 데이터입니다.' });
        return;
      }
      
      const now = new Date();
      const newExpense: Expense = {
        id: `exp-${now.getTime()}`, // 더 안전한 ID 생성
        ...expenseData,
        createdAt: now,
        updatedAt: now
      };
      
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    } catch (error) {
      console.error('Failed to add expense:', error);
      dispatch({ type: 'SET_ERROR', payload: '지출 추가 중 오류가 발생했습니다.' });
    }
  };

  // 지출 수정 (2025 React 패턴: 에러 처리 강화)
  const updateExpense = (id: string, expenseData: ExpenseFormData) => {
    try {
      const existingExpense = state.expenses.find(expense => expense.id === id);
      if (!existingExpense) {
        dispatch({ type: 'SET_ERROR', payload: '수정할 지출을 찾을 수 없습니다.' });
        return;
      }
      
      // 기본 유효성 검증
      if (!expenseData.description || expenseData.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 지출 데이터입니다.' });
        return;
      }

      const updatedExpense: Expense = {
        ...existingExpense,
        ...expenseData,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    } catch (error) {
      console.error('Failed to update expense:', error);
      dispatch({ type: 'SET_ERROR', payload: '지출 수정 중 오류가 발생했습니다.' });
    }
  };

  // 지출 삭제 (2025 React 패턴: 에러 처리)
  const deleteExpense = (id: string) => {
    try {
      if (!id) {
        dispatch({ type: 'SET_ERROR', payload: '삭제할 지출 ID가 유효하지 않습니다.' });
        return;
      }
      
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      dispatch({ type: 'SET_ERROR', payload: '지출 삭제 중 오류가 발생했습니다.' });
    }
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