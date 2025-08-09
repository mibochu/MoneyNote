import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ExpenseTemplate, IncomeTemplate } from '../types';
import { LocalStorage } from '../utils/storage/localStorage';

interface TemplateState {
  expenseTemplates: ExpenseTemplate[];
  incomeTemplates: IncomeTemplate[];
  loading: boolean;
  error: string | null;
}

type TemplateAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPENSE_TEMPLATES'; payload: ExpenseTemplate[] }
  | { type: 'SET_INCOME_TEMPLATES'; payload: IncomeTemplate[] }
  | { type: 'ADD_EXPENSE_TEMPLATE'; payload: ExpenseTemplate }
  | { type: 'ADD_INCOME_TEMPLATE'; payload: IncomeTemplate }
  | { type: 'DELETE_EXPENSE_TEMPLATE'; payload: string }
  | { type: 'DELETE_INCOME_TEMPLATE'; payload: string };

const initialState: TemplateState = {
  expenseTemplates: [],
  incomeTemplates: [],
  loading: false,
  error: null
};

function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_EXPENSE_TEMPLATES':
      return { ...state, expenseTemplates: action.payload };
      
    case 'SET_INCOME_TEMPLATES':
      return { ...state, incomeTemplates: action.payload };
      
    case 'ADD_EXPENSE_TEMPLATE':
      return { 
        ...state, 
        expenseTemplates: [...state.expenseTemplates, action.payload] 
      };
      
    case 'ADD_INCOME_TEMPLATE':
      return { 
        ...state, 
        incomeTemplates: [...state.incomeTemplates, action.payload] 
      };
      
    case 'DELETE_EXPENSE_TEMPLATE':
      return {
        ...state,
        expenseTemplates: state.expenseTemplates.filter(t => t.id !== action.payload)
      };
      
    case 'DELETE_INCOME_TEMPLATE':
      return {
        ...state,
        incomeTemplates: state.incomeTemplates.filter(t => t.id !== action.payload)
      };
      
    default:
      return state;
  }
}

interface TemplateContextType {
  state: TemplateState;
  
  // Helper functions
  addExpenseTemplate: (name: string, expenseData: any, saveAmount: boolean) => string;
  addIncomeTemplate: (name: string, incomeData: any, saveAmount: boolean) => string;
  deleteExpenseTemplate: (id: string) => void;
  deleteIncomeTemplate: (id: string) => void;
  getExpenseTemplateById: (id: string) => ExpenseTemplate | undefined;
  getIncomeTemplateById: (id: string) => IncomeTemplate | undefined;
}

const TemplateContext = createContext<TemplateContextType | null>(null);

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 템플릿 로드
  useEffect(() => {
    let isCancelled = false;
    
    const loadTemplates = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const savedExpenseTemplates = LocalStorage.get<ExpenseTemplate[]>('EXPENSE_TEMPLATES', []);
        const savedIncomeTemplates = LocalStorage.get<IncomeTemplate[]>('INCOME_TEMPLATES', []);
        
        // Date 객체로 변환
        const expenseTemplates = savedExpenseTemplates.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }));
        
        const incomeTemplates = savedIncomeTemplates.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }));
        
        if (!isCancelled) {
          dispatch({ type: 'SET_EXPENSE_TEMPLATES', payload: expenseTemplates });
          dispatch({ type: 'SET_INCOME_TEMPLATES', payload: incomeTemplates });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load templates:', error);
          dispatch({ type: 'SET_ERROR', payload: '템플릿 데이터를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadTemplates();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // 템플릿 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.loading) return;
    
    try {
      LocalStorage.set('EXPENSE_TEMPLATES', state.expenseTemplates);
      LocalStorage.set('INCOME_TEMPLATES', state.incomeTemplates);
    } catch (error) {
      console.error('Failed to save templates to localStorage:', error);
    }
  }, [state.expenseTemplates, state.incomeTemplates, state.loading]);

  const generateId = () => `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addExpenseTemplate = (name: string, expenseData: any, saveAmount: boolean): string => {
    const id = generateId();
    const now = new Date();
    
    const template: ExpenseTemplate = {
      id,
      name,
      description: expenseData.description,
      amount: saveAmount ? expenseData.amount : undefined,
      category: expenseData.category,
      subcategory: expenseData.subcategory,
      paymentMethod: expenseData.paymentMethod,
      tags: expenseData.tags || [],
      isFixed: expenseData.isFixed || false,
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: 'ADD_EXPENSE_TEMPLATE', payload: template });
    return id;
  };

  const addIncomeTemplate = (name: string, incomeData: any, saveAmount: boolean): string => {
    const id = generateId();
    const now = new Date();
    
    const template: IncomeTemplate = {
      id,
      name,
      description: incomeData.description,
      amount: saveAmount ? incomeData.amount : undefined,
      source: incomeData.source,
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: 'ADD_INCOME_TEMPLATE', payload: template });
    return id;
  };

  const deleteExpenseTemplate = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE_TEMPLATE', payload: id });
  };

  const deleteIncomeTemplate = (id: string) => {
    dispatch({ type: 'DELETE_INCOME_TEMPLATE', payload: id });
  };

  const getExpenseTemplateById = (id: string): ExpenseTemplate | undefined => {
    return state.expenseTemplates.find(template => template.id === id);
  };

  const getIncomeTemplateById = (id: string): IncomeTemplate | undefined => {
    return state.incomeTemplates.find(template => template.id === id);
  };

  const contextValue: TemplateContextType = {
    state,
    addExpenseTemplate,
    addIncomeTemplate,
    deleteExpenseTemplate,
    deleteIncomeTemplate,
    getExpenseTemplateById,
    getIncomeTemplateById
  };

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within TemplateProvider');
  }
  return context;
};