// 자동 반복 입력 관리 Context

import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { 
  RecurringTransaction, 
  RecurringFormData, 
  RecurringFilter, 
  RecurringExecutionResult,
  UpcomingRecurring
} from '../types/recurring.types';
import { LocalStorage } from '../utils/storage/localStorage';

// State 타입 정의
interface RecurringState {
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  filter: RecurringFilter;
}

// Action 타입 정의
type RecurringAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RECURRING_TRANSACTIONS'; payload: RecurringTransaction[] }
  | { type: 'ADD_RECURRING_TRANSACTION'; payload: RecurringTransaction }
  | { type: 'UPDATE_RECURRING_TRANSACTION'; payload: RecurringTransaction }
  | { type: 'DELETE_RECURRING_TRANSACTION'; payload: string }
  | { type: 'SET_FILTER'; payload: RecurringFilter }
  | { type: 'UPDATE_LAST_EXECUTED'; payload: { id: string; lastExecuted: Date; executionCount: number } };

// Context 타입 정의
interface RecurringContextType {
  state: RecurringState;
  addRecurringTransaction: (data: RecurringFormData) => void;
  updateRecurringTransaction: (id: string, data: RecurringFormData) => void;
  deleteRecurringTransaction: (id: string) => void;
  toggleRecurringTransaction: (id: string) => void;
  setFilter: (filter: RecurringFilter) => void;
  getFilteredRecurringTransactions: () => RecurringTransaction[];
  getUpcomingRecurringTransactions: (days?: number) => UpcomingRecurring[];
  executeRecurringTransaction: (id: string) => Promise<RecurringExecutionResult | null>;
  checkAndExecutePendingTransactions: () => Promise<RecurringExecutionResult[]>;
}

// 초기 상태
const createInitialState = (): RecurringState => ({
  recurringTransactions: [],
  loading: false,
  error: null,
  filter: {}
});

const initialState: RecurringState = createInitialState();

// 다음 실행 날짜 계산
const calculateNextDate = (startDate: Date, frequency: string, executionCount: number = 0): Date => {
  const nextDate = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + executionCount + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (executionCount + 1) * 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + executionCount + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + executionCount + 1);
      break;
  }
  
  return nextDate;
};

// Reducer 함수
const recurringReducer = (state: RecurringState, action: RecurringAction): RecurringState => {
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
    
    case 'SET_RECURRING_TRANSACTIONS':
      return { 
        ...state, 
        recurringTransactions: action.payload, 
        error: null,
        loading: false 
      };
    
    case 'ADD_RECURRING_TRANSACTION':
      if (state.recurringTransactions.some(rt => rt.id === action.payload.id)) {
        console.warn('Recurring transaction with this ID already exists:', action.payload.id);
        return state;
      }
      return { 
        ...state, 
        recurringTransactions: [...state.recurringTransactions, action.payload], 
        error: null 
      };
    
    case 'UPDATE_RECURRING_TRANSACTION':
      const rtExists = state.recurringTransactions.some(rt => rt.id === action.payload.id);
      if (!rtExists) {
        console.warn('Cannot update recurring transaction: ID not found:', action.payload.id);
        return state;
      }
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(rt =>
          rt.id === action.payload.id ? action.payload : rt
        ),
        error: null
      };
    
    case 'DELETE_RECURRING_TRANSACTION':
      const filteredRts = state.recurringTransactions.filter(rt => rt.id !== action.payload);
      if (filteredRts.length === state.recurringTransactions.length) {
        console.warn('Cannot delete recurring transaction: ID not found:', action.payload);
        return state;
      }
      return { ...state, recurringTransactions: filteredRts, error: null };
    
    case 'UPDATE_LAST_EXECUTED':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(rt =>
          rt.id === action.payload.id 
            ? { 
                ...rt, 
                lastExecuted: action.payload.lastExecuted,
                executionCount: action.payload.executionCount,
                nextDate: calculateNextDate(rt.startDate, rt.frequency, action.payload.executionCount)
              }
            : rt
        ),
        error: null
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      const exhaustiveCheck: never = action;
      console.error('Unhandled action type:', exhaustiveCheck);
      return state;
  }
};

// Context 생성
const RecurringContext = createContext<RecurringContextType | undefined>(undefined);

// Provider 컴포넌트
export const RecurringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(recurringReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    let isCancelled = false;

    const loadRecurringTransactions = async () => {
      if (isCancelled) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedTransactions = LocalStorage.get('RECURRING_TRANSACTIONS', []);
        
        if (isCancelled) return;
        
        // Date 객체로 변환
        const transactions = savedTransactions.map((rt: RecurringTransaction) => ({
          ...rt,
          startDate: new Date(rt.startDate),
          nextDate: new Date(rt.nextDate),
          endDate: rt.endDate ? new Date(rt.endDate) : undefined,
          createdAt: new Date(rt.createdAt),
          updatedAt: new Date(rt.updatedAt),
          lastExecuted: rt.lastExecuted ? new Date(rt.lastExecuted) : undefined
        }));
        
        if (!isCancelled) {
          dispatch({ type: 'SET_RECURRING_TRANSACTIONS', payload: transactions });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load recurring transactions:', error);
          dispatch({ type: 'SET_ERROR', payload: '반복 거래 데이터를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadRecurringTransactions();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // 반복 거래 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.loading) return;
    
    try {
      LocalStorage.set('RECURRING_TRANSACTIONS', state.recurringTransactions);
    } catch (error) {
      console.error('Failed to save recurring transactions to localStorage:', error);
    }
  }, [state.recurringTransactions, state.loading]);

  // 반복 거래 추가
  const addRecurringTransaction = (data: RecurringFormData) => {
    try {
      if (!data.description || data.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 반복 거래 데이터입니다.' });
        return;
      }
      
      const now = new Date();
      const startDate = new Date(data.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (isNaN(startDate.getTime())) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 시작 날짜입니다.' });
        return;
      }
      
      const newRecurringTransaction: RecurringTransaction = {
        id: `recurring-${now.getTime()}`,
        ...data,
        startDate,
        nextDate: calculateNextDate(startDate, data.frequency, 0),
        isActive: true,
        createdAt: now,
        updatedAt: now,
        executionCount: 0
      };
      
      console.log('Adding new recurring transaction:', newRecurringTransaction);
      dispatch({ type: 'ADD_RECURRING_TRANSACTION', payload: newRecurringTransaction });
    } catch (error) {
      console.error('Failed to add recurring transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 추가 중 오류가 발생했습니다.' });
    }
  };

  // 반복 거래 수정
  const updateRecurringTransaction = (id: string, data: RecurringFormData) => {
    try {
      const existingTransaction = state.recurringTransactions.find(rt => rt.id === id);
      if (!existingTransaction) {
        dispatch({ type: 'SET_ERROR', payload: '수정할 반복 거래를 찾을 수 없습니다.' });
        return;
      }
      
      if (!data.description || data.amount <= 0) {
        dispatch({ type: 'SET_ERROR', payload: '유효하지 않은 반복 거래 데이터입니다.' });
        return;
      }

      const updatedTransaction: RecurringTransaction = {
        ...existingTransaction,
        ...data,
        nextDate: calculateNextDate(new Date(data.startDate), data.frequency, existingTransaction.executionCount),
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_RECURRING_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
      console.error('Failed to update recurring transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 수정 중 오류가 발생했습니다.' });
    }
  };

  // 반복 거래 삭제
  const deleteRecurringTransaction = (id: string) => {
    try {
      if (!id) {
        dispatch({ type: 'SET_ERROR', payload: '삭제할 반복 거래 ID가 유효하지 않습니다.' });
        return;
      }
      
      dispatch({ type: 'DELETE_RECURRING_TRANSACTION', payload: id });
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 삭제 중 오류가 발생했습니다.' });
    }
  };

  // 반복 거래 활성화/비활성화 토글
  const toggleRecurringTransaction = (id: string) => {
    try {
      const transaction = state.recurringTransactions.find(rt => rt.id === id);
      if (!transaction) {
        dispatch({ type: 'SET_ERROR', payload: '반복 거래를 찾을 수 없습니다.' });
        return;
      }

      const updatedTransaction: RecurringTransaction = {
        ...transaction,
        isActive: !transaction.isActive,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_RECURRING_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
      console.error('Failed to toggle recurring transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 상태 변경 중 오류가 발생했습니다.' });
    }
  };

  // 필터 설정
  const setFilter = (filter: RecurringFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // 필터링된 반복 거래 목록 반환
  const getFilteredRecurringTransactions = (): RecurringTransaction[] => {
    let filtered = [...state.recurringTransactions];

    const { type, frequency, category, isActive } = state.filter;

    if (type) {
      filtered = filtered.filter(rt => rt.type === type);
    }

    if (frequency) {
      filtered = filtered.filter(rt => rt.frequency === frequency);
    }

    if (category) {
      filtered = filtered.filter(rt => rt.category === category);
    }

    if (isActive !== undefined) {
      filtered = filtered.filter(rt => rt.isActive === isActive);
    }

    return filtered.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  };

  // 예정된 반복 거래 목록 (며칠 이내)
  const getUpcomingRecurringTransactions = (days: number = 7): UpcomingRecurring[] => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return state.recurringTransactions
      .filter(rt => rt.isActive && rt.nextDate <= futureDate && rt.nextDate >= now)
      .map(rt => ({
        recurringTransaction: rt,
        nextExecutionDate: rt.nextDate,
        daysUntilExecution: Math.ceil((rt.nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.nextExecutionDate.getTime() - b.nextExecutionDate.getTime());
  };

  // 반복 거래 실행 (실제 수입/지출 생성)
  const executeRecurringTransaction = useCallback(async (id: string): Promise<RecurringExecutionResult | null> => {
    try {
      const rt = state.recurringTransactions.find(transaction => transaction.id === id);
      if (!rt || !rt.isActive) {
        return null;
      }

      // TODO: 실제 Income/Expense Context에 데이터 추가하는 로직
      // 현재는 시뮬레이션만 수행
      const executedAt = new Date();
      const transactionId = `${rt.type}-${executedAt.getTime()}`;

      // 실행 횟수 업데이트
      dispatch({
        type: 'UPDATE_LAST_EXECUTED',
        payload: {
          id,
          lastExecuted: executedAt,
          executionCount: rt.executionCount + 1
        }
      });

      return {
        recurringId: id,
        transactionId,
        executedAt,
        amount: rt.amount,
        success: true
      };
    } catch (error) {
      console.error('Failed to execute recurring transaction:', error);
      return {
        recurringId: id,
        transactionId: '',
        executedAt: new Date(),
        amount: 0,
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }, [state.recurringTransactions]);

  // 실행이 필요한 반복 거래들 확인 및 실행
  const checkAndExecutePendingTransactions = useCallback(async (): Promise<RecurringExecutionResult[]> => {
    const now = new Date();
    const pendingTransactions = state.recurringTransactions.filter(rt => 
      rt.isActive && rt.nextDate <= now
    );

    const results: RecurringExecutionResult[] = [];
    
    for (const rt of pendingTransactions) {
      const result = await executeRecurringTransaction(rt.id);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [state.recurringTransactions, executeRecurringTransaction]);

  const value: RecurringContextType = {
    state,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    setFilter,
    getFilteredRecurringTransactions,
    getUpcomingRecurringTransactions,
    executeRecurringTransaction,
    checkAndExecutePendingTransactions
  };

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
};

// Context export
export { RecurringContext };