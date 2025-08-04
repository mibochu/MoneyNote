// 카테고리 관리 Context

import React, { createContext, useReducer, useEffect } from 'react';
import type { Category, CategoryFormData, Subcategory, SubcategoryFormData } from '../types';
import { LocalStorage } from '../utils/storage/localStorage';
import { DEFAULT_CATEGORIES } from '../utils/constants/categories';

// State 타입 정의
interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

// Action 타입 정의
type CategoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_SUBCATEGORY'; payload: { categoryId: string; subcategory: Subcategory } }
  | { type: 'UPDATE_SUBCATEGORY'; payload: { categoryId: string; subcategory: Subcategory } }
  | { type: 'DELETE_SUBCATEGORY'; payload: { categoryId: string; subcategoryId: string } };

// Context 타입 정의
interface CategoryContextType {
  state: CategoryState;
  addCategory: (categoryData: CategoryFormData) => void;
  updateCategory: (id: string, categoryData: CategoryFormData) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, subcategoryData: SubcategoryFormData) => void;
  updateSubcategory: (categoryId: string, subcategoryId: string, subcategoryData: SubcategoryFormData) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoryById: (categoryId: string, subcategoryId: string) => Subcategory | undefined;
}

// 초기 상태
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null
};

// Reducer 함수
const categoryReducer = (state: CategoryState, action: CategoryAction): CategoryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };
    
    case 'ADD_SUBCATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? { ...category, subcategories: [...category.subcategories, action.payload.subcategory] }
            : category
        )
      };
    
    case 'UPDATE_SUBCATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
                ...category,
                subcategories: category.subcategories.map(sub =>
                  sub.id === action.payload.subcategory.id ? action.payload.subcategory : sub
                )
              }
            : category
        )
      };
    
    case 'DELETE_SUBCATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
                ...category,
                subcategories: category.subcategories.filter(sub => sub.id !== action.payload.subcategoryId)
              }
            : category
        )
      };
    
    default:
      return state;
  }
};

// Context 생성
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider 컴포넌트
export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const loadCategories = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedCategories = LocalStorage.get('CATEGORIES', []);
        
        // 저장된 데이터가 없으면 기본 카테고리 사용
        if (savedCategories.length === 0) {
          const defaultCategories: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: `default-${index}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          dispatch({ type: 'SET_CATEGORIES', payload: defaultCategories });
        } else {
          // Date 객체로 변환
          const categories = savedCategories.map((category: Category) => ({
            ...category,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
            subcategories: category.subcategories.map((sub: Subcategory) => ({
              ...sub,
              createdAt: new Date(sub.createdAt),
              updatedAt: new Date(sub.updatedAt)
            }))
          }));
          
          dispatch({ type: 'SET_CATEGORIES', payload: categories });
        }
      } catch {
        dispatch({ type: 'SET_ERROR', payload: '카테고리 데이터를 불러오는 중 오류가 발생했습니다.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCategories();
  }, []);

  // 카테고리 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.categories.length > 0) {
      LocalStorage.set('CATEGORIES', state.categories);
    }
  }, [state.categories]);

  // 카테고리 추가
  const addCategory = (categoryData: CategoryFormData) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      ...categoryData,
      isDefault: false,
      subcategories: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  // 카테고리 수정
  const updateCategory = (id: string, categoryData: CategoryFormData) => {
    const existingCategory = state.categories.find(c => c.id === id);
    if (!existingCategory) return;

    const updatedCategory: Category = {
      ...existingCategory,
      ...categoryData,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
  };

  // 카테고리 삭제
  const deleteCategory = (id: string) => {
    const category = state.categories.find(c => c.id === id);
    if (category && category.isDefault) {
      dispatch({ type: 'SET_ERROR', payload: '기본 카테고리는 삭제할 수 없습니다.' });
      return;
    }
    
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  // 서브카테고리 추가
  const addSubcategory = (categoryId: string, subcategoryData: SubcategoryFormData) => {
    const newSubcategory: Subcategory = {
      id: Date.now().toString(),
      ...subcategoryData,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_SUBCATEGORY', payload: { categoryId, subcategory: newSubcategory } });
  };

  // 서브카테고리 수정
  const updateSubcategory = (categoryId: string, subcategoryId: string, subcategoryData: SubcategoryFormData) => {
    const category = state.categories.find(c => c.id === categoryId);
    const existingSubcategory = category?.subcategories.find(s => s.id === subcategoryId);
    if (!existingSubcategory) return;

    const updatedSubcategory: Subcategory = {
      ...existingSubcategory,
      ...subcategoryData,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_SUBCATEGORY', payload: { categoryId, subcategory: updatedSubcategory } });
  };

  // 서브카테고리 삭제
  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
    
    if (subcategory && subcategory.isDefault) {
      dispatch({ type: 'SET_ERROR', payload: '기본 서브카테고리는 삭제할 수 없습니다.' });
      return;
    }
    
    dispatch({ type: 'DELETE_SUBCATEGORY', payload: { categoryId, subcategoryId } });
  };

  // 카테고리 조회
  const getCategoryById = (id: string): Category | undefined => {
    return state.categories.find(category => category.id === id);
  };

  // 서브카테고리 조회
  const getSubcategoryById = (categoryId: string, subcategoryId: string): Subcategory | undefined => {
    const category = getCategoryById(categoryId);
    return category?.subcategories.find(sub => sub.id === subcategoryId);
  };

  const value: CategoryContextType = {
    state,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getCategoryById,
    getSubcategoryById
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Context export
export { CategoryContext };