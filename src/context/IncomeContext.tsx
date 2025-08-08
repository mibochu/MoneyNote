// 수입 관리 Context

import React, { createContext, useReducer, useEffect } from 'react';
import type { Income, IncomeFormData, IncomeFilter } from '../types/income.types';
import { LocalStorage } from '../utils/storage/localStorage';

// State 타입 정의
interface IncomeState {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  filter: IncomeFilter;
}

// Action 타입 정의
type IncomeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INCOMES'; payload: Income[] }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'SET_FILTER'; payload: IncomeFilter };

// Context 타입 정의
interface IncomeContextType {
  state: IncomeState;
  addIncome: (incomeData: IncomeFormData) => void;
  updateIncome: (id: string, incomeData: IncomeFormData) => void;
  deleteIncome: (id: string) => void;
  setFilter: (filter: IncomeFilter) => void;
  getFilteredIncomes: () => Income[];
  getMonthlyIncome: (date?: Date) => number;
}

// 초기 상태
const createInitialState = (): IncomeState => ({
  incomes: [],
  loading: false,
  error: null,
  filter: {}
});

const initialState: IncomeState = createInitialState();

// Reducer 함수
const incomeReducer = (state: IncomeState, action: IncomeAction): IncomeState => {
  if (!action || typeof action.type !== 'string') {
    console.error('Invalid action received:', action);
    return state;
  }
  
  switch (action.type) {
    case 'SET_LOADING':
      if (state.loading === action.payload) return state;
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      if (state.error === action.payload) return state;
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_INCOMES':
      return { 
        ...state, 
        incomes: action.payload, 
        error: null,
        loading: false 
      };
    
    case 'ADD_INCOME':
      if (state.incomes.some(income => income.id === action.payload.id)) {
        console.warn('Income with this ID already exists:', action.payload.id);
        return state;
      }
      return { ...state, incomes: [...state.incomes, action.payload], error: null };
    
    case 'UPDATE_INCOME':
      const incomeExists = state.incomes.some(income => income.id === action.payload.id);
      if (!incomeExists) {
        console.warn('Cannot update income: ID not found:', action.payload.id);
        return state;
      }
      return {
        ...state,
        incomes: state.incomes.map(income =>
          income.id === action.payload.id ? action.payload : income
        ),
        error: null
      };
    
    case 'DELETE_INCOME':
      const incomesToDelete = state.incomes.filter(income => income.id !== action.payload);
      if (incomesToDelete.length === state.incomes.length) {
        console.warn('Cannot delete income: ID not found:', action.payload);
        return state;
      }
      return { ...state, incomes: incomesToDelete, error: null };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      const exhaustiveCheck: never = action;
      console.error('Unhandled action type:', exhaustiveCheck);
      return state;
  }
};

// Context 생성
const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

// Provider 컴포넌트
export const IncomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(incomeReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    let isCancelled = false;

    const loadIncomes = async () => {
      if (isCancelled) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedIncomes = LocalStorage.get('INCOMES', []);
        
        if (isCancelled) return;
        
        // Date 객체로 변환
        const incomes = savedIncomes.map((income: Income) => ({
          ...income,
          date: new Date(income.date),
          createdAt: new Date(income.createdAt),
          updatedAt: new Date(income.updatedAt)
        }));
        
        if (!isCancelled) {
          dispatch({ type: 'SET_INCOMES', payload: incomes });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load incomes:', error);
          dispatch({ type: 'SET_ERROR', payload: '수입 데이터를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadIncomes();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // 수입 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.loading) return;
    
    try {
      LocalStorage.set('INCOMES', state.incomes);
    } catch (error) {
      console.error('Failed to save incomes to localStorage:', error);
    }
  }, [state.incomes, state.loading]);

  // 수입 추가
  const addIncome = (incomeData: IncomeFormData) => {
    try {
      if (!incomeData.source || incomeData.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 수입 데이터입니다.' });
        return;
      }
      
      const now = new Date();
      
      let incomeDate: Date;
      if (incomeData.date instanceof Date) {
        incomeDate = new Date(incomeData.date);
      } else {
        incomeDate = new Date(incomeData.date);
      }
      
      incomeDate.setHours(0, 0, 0, 0);
      
      if (isNaN(incomeDate.getTime())) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 날짜입니다.' });
        return;
      }
      
      const newIncome: Income = {
        id: `inc-${now.getTime()}`,
        ...incomeData,
        date: incomeDate,
        createdAt: now,
        updatedAt: now
      };
      
      console.log('Adding new income:', newIncome);
      dispatch({ type: 'ADD_INCOME', payload: newIncome });
    } catch (error) {
      console.error('Failed to add income:', error);
      dispatch({ type: 'SET_ERROR', payload: '수입 추가 중 오류가 발생했습니다.' });
    }
  };

  // 수입 수정
  const updateIncome = (id: string, incomeData: IncomeFormData) => {
    try {
      const existingIncome = state.incomes.find(income => income.id === id);
      if (!existingIncome) {
        dispatch({ type: 'SET_ERROR', payload: '수정할 수입을 찾을 수 없습니다.' });
        return;
      }
      
      if (!incomeData.source || incomeData.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 수입 데이터입니다.' });
        return;
      }

      const updatedIncome: Income = {
        ...existingIncome,
        ...incomeData,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_INCOME', payload: updatedIncome });
    } catch (error) {
      console.error('Failed to update income:', error);
      dispatch({ type: 'SET_ERROR', payload: '수입 수정 중 오류가 발생했습니다.' });
    }
  };

  // 수입 삭제
  const deleteIncome = (id: string) => {
    try {
      if (!id) {
        dispatch({ type: 'SET_ERROR', payload: '삭제할 수입 ID가 유효하지 않습니다.' });
        return;
      }
      
      dispatch({ type: 'DELETE_INCOME', payload: id });
    } catch (error) {
      console.error('Failed to delete income:', error);
      dispatch({ type: 'SET_ERROR', payload: '수입 삭제 중 오류가 발생했습니다.' });
    }
  };

  // 필터 설정
  const setFilter = (filter: IncomeFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // 필터링된 수입 목록 반환
  const getFilteredIncomes = (): Income[] => {
    let filtered = [...state.incomes];

    const { startDate, endDate, source, category } = state.filter;

    if (startDate) {
      filtered = filtered.filter(income => income.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(income => income.date <= endDate);
    }

    if (source) {
      filtered = filtered.filter(income => income.source === source);
    }

    if (category) {
      filtered = filtered.filter(income => income.category === category);
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // 월별 수입 계산
  const getMonthlyIncome = (date: Date = new Date()): number => {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    return state.incomes
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === targetMonth && 
               incomeDate.getFullYear() === targetYear;
      })
      .reduce((sum, income) => sum + income.amount, 0);
  };

  const value: IncomeContextType = {
    state,
    addIncome,
    updateIncome,
    deleteIncome,
    setFilter,
    getFilteredIncomes,
    getMonthlyIncome
  };

  return (
    <IncomeContext.Provider value={value}>
      {children}
    </IncomeContext.Provider>
  );
};

// Context export
export { IncomeContext };