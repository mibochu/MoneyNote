import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { 
  ExpectedExpense, 
  ExpectedExpenseFormData, 
  ExpectedExpenseFilter,
  ExpectedExpenseStats 
} from '../types';
import { LocalStorage } from '../utils/storage/localStorage';
import { autoBackupManager } from '../utils/storage/autoBackup';

interface ExpectedExpenseState {
  expectedExpenses: ExpectedExpense[];
  loading: boolean;
  error: string | null;
  filter: ExpectedExpenseFilter;
}

type ExpectedExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPECTED_EXPENSES'; payload: ExpectedExpense[] }
  | { type: 'ADD_EXPECTED_EXPENSE'; payload: ExpectedExpense }
  | { type: 'UPDATE_EXPECTED_EXPENSE'; payload: { id: string; data: Partial<ExpectedExpense> } }
  | { type: 'DELETE_EXPECTED_EXPENSE'; payload: string }
  | { type: 'ACTIVATE_EXPECTED_EXPENSE'; payload: { id: string; actualExpenseId: string } }
  | { type: 'SET_FILTER'; payload: ExpectedExpenseFilter };

const initialState: ExpectedExpenseState = {
  expectedExpenses: [],
  loading: false,
  error: null,
  filter: {}
};

function expectedExpenseReducer(
  state: ExpectedExpenseState, 
  action: ExpectedExpenseAction
): ExpectedExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_EXPECTED_EXPENSES':
      return { ...state, expectedExpenses: action.payload };
      
    case 'ADD_EXPECTED_EXPENSE':
      return { 
        ...state, 
        expectedExpenses: [...state.expectedExpenses, action.payload] 
      };
      
    case 'UPDATE_EXPECTED_EXPENSE':
      return {
        ...state,
        expectedExpenses: state.expectedExpenses.map(expense =>
          expense.id === action.payload.id 
            ? { ...expense, ...action.payload.data, updatedAt: new Date() }
            : expense
        )
      };
      
    case 'DELETE_EXPECTED_EXPENSE':
      return {
        ...state,
        expectedExpenses: state.expectedExpenses.filter(
          expense => expense.id !== action.payload
        )
      };
      
    case 'ACTIVATE_EXPECTED_EXPENSE':
      return {
        ...state,
        expectedExpenses: state.expectedExpenses.map(expense =>
          expense.id === action.payload.id 
            ? { 
                ...expense, 
                isActivated: true, 
                actualExpenseId: action.payload.actualExpenseId,
                updatedAt: new Date() 
              }
            : expense
        )
      };
      
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
      
    default:
      return state;
  }
}

interface ExpectedExpenseContextType {
  state: ExpectedExpenseState;
  dispatch: React.Dispatch<ExpectedExpenseAction>;
  
  // Helper functions
  addExpectedExpense: (data: ExpectedExpenseFormData) => string;
  updateExpectedExpense: (id: string, data: Partial<ExpectedExpense>) => void;
  deleteExpectedExpense: (id: string) => void;
  activateExpectedExpense: (id: string, actualExpenseId: string) => void;
  setFilter: (filter: ExpectedExpenseFilter) => void;
  getFilteredExpectedExpenses: () => ExpectedExpense[];
  getExpectedExpenseStats: () => ExpectedExpenseStats;
}

const ExpectedExpenseContext = createContext<ExpectedExpenseContextType | null>(null);

interface ExpectedExpenseProviderProps {
  children: ReactNode;
}

export const ExpectedExpenseProvider: React.FC<ExpectedExpenseProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(expectedExpenseReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    let isCancelled = false;
    
    const loadExpectedExpenses = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const savedExpenses = LocalStorage.get<ExpectedExpense[]>('EXPECTED_EXPENSES', []);
        
        // Date 객체로 변환
        const expenses = savedExpenses.map((expense: any) => ({
          ...expense,
          expectedDate: new Date(expense.expectedDate),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt)
        }));
        
        if (!isCancelled) {
          dispatch({ type: 'SET_EXPECTED_EXPENSES', payload: expenses });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load expected expenses:', error);
          dispatch({ type: 'SET_ERROR', payload: '예상 지출 데이터를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadExpectedExpenses();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // 예상 지출 데이터 변경 시 localStorage에 저장 및 백업
  useEffect(() => {
    if (state.loading) return;
    
    try {
      LocalStorage.set('EXPECTED_EXPENSES', state.expectedExpenses);
      
      // 데이터 변경 시 백업
      if (state.expectedExpenses.length > 0) {
        const timeoutId = setTimeout(async () => {
          try {
            console.log('💾 예상 지출 데이터 변경됨 - 백업 생성 중...');
            const success = await autoBackupManager.createAutoBackup();
            if (success) {
              console.log('✅ 예상 지출 데이터 백업 완료');
            } else {
              console.log('❌ 예상 지출 데이터 백업 실패');
            }
          } catch (error) {
            console.warn('⚠️ 예상 지출 데이터 백업 오류:', error);
          }
        }, 3000);
        
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Failed to save expected expenses to localStorage:', error);
    }
  }, [state.expectedExpenses, state.loading]);

  const generateId = () => `expected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addExpectedExpense = (data: ExpectedExpenseFormData): string => {
    const id = generateId();
    const now = new Date();
    
    const expectedExpense: ExpectedExpense = {
      id,
      ...data,
      subcategory: data.subcategory || '',
      isActivated: false,
      actualExpenseId: undefined,
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: 'ADD_EXPECTED_EXPENSE', payload: expectedExpense });
    return id;
  };

  const updateExpectedExpense = (id: string, data: Partial<ExpectedExpense>) => {
    dispatch({ type: 'UPDATE_EXPECTED_EXPENSE', payload: { id, data } });
  };

  const deleteExpectedExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPECTED_EXPENSE', payload: id });
  };

  const activateExpectedExpense = (id: string, actualExpenseId: string) => {
    dispatch({ type: 'ACTIVATE_EXPECTED_EXPENSE', payload: { id, actualExpenseId } });
  };

  const setFilter = (filter: ExpectedExpenseFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const getFilteredExpectedExpenses = (): ExpectedExpense[] => {
    let filtered = [...state.expectedExpenses];

    if (state.filter.category) {
      filtered = filtered.filter(expense => expense.category === state.filter.category);
    }

    if (state.filter.subcategory) {
      filtered = filtered.filter(expense => expense.subcategory === state.filter.subcategory);
    }

    if (state.filter.isActivated !== undefined) {
      filtered = filtered.filter(expense => expense.isActivated === state.filter.isActivated);
    }

    if (state.filter.isRecurring !== undefined) {
      filtered = filtered.filter(expense => expense.isRecurring === state.filter.isRecurring);
    }

    if (state.filter.startDate) {
      filtered = filtered.filter(expense => 
        expense.expectedDate >= state.filter.startDate!
      );
    }

    if (state.filter.endDate) {
      filtered = filtered.filter(expense => 
        expense.expectedDate <= state.filter.endDate!
      );
    }

    return filtered.sort((a, b) => a.expectedDate.getTime() - b.expectedDate.getTime());
  };

  const getExpectedExpenseStats = (): ExpectedExpenseStats => {
    const filtered = getFilteredExpectedExpenses();
    
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    const count = filtered.length;
    
    const activated = filtered.filter(expense => expense.isActivated);
    const activatedTotal = activated.reduce((sum, expense) => sum + expense.amount, 0);
    const activatedCount = activated.length;
    
    const recurring = filtered.filter(expense => expense.isRecurring);
    const recurringTotal = recurring.reduce((sum, expense) => sum + expense.amount, 0);
    const recurringCount = recurring.length;

    return {
      total,
      count,
      activatedTotal,
      activatedCount,
      recurringTotal,
      recurringCount
    };
  };

  const contextValue: ExpectedExpenseContextType = {
    state,
    dispatch,
    addExpectedExpense,
    updateExpectedExpense,
    deleteExpectedExpense,
    activateExpectedExpense,
    setFilter,
    getFilteredExpectedExpenses,
    getExpectedExpenseStats
  };

  return (
    <ExpectedExpenseContext.Provider value={contextValue}>
      {children}
    </ExpectedExpenseContext.Provider>
  );
};

export const useExpectedExpenses = (): ExpectedExpenseContextType => {
  const context = useContext(ExpectedExpenseContext);
  if (!context) {
    throw new Error('useExpectedExpenses must be used within ExpectedExpenseProvider');
  }
  return context;
};