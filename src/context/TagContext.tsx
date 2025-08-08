// 태그 관리 Context

import React, { createContext, useReducer, useEffect } from 'react';
import type { Tag, TagFormData } from '../types/tag.types';
import { LocalStorage } from '../utils/storage/localStorage';

// State 타입 정의
interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

// Action 타입 정의
type TagAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'UPDATE_USAGE_COUNTS'; payload: Record<string, number> };

// Context 타입 정의
interface TagContextType {
  state: TagState;
  addTag: (tagData: TagFormData) => void;
  updateTag: (id: string, tagData: TagFormData) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getPopularTags: (limit?: number) => Tag[];
  updateUsageCounts: (tagCounts: Record<string, number>) => void;
}

// 기본 태그들
const DEFAULT_TAGS = [
  { name: '외식', color: '#FF6B6B', icon: '🍽️' },
  { name: '교통', color: '#4ECDC4', icon: '🚗' },
  { name: '쇼핑', color: '#45B7D1', icon: '🛒' },
  { name: '카페', color: '#96CEB4', icon: '☕' },
  { name: '의료', color: '#FFEAA7', icon: '🏥' },
  { name: '문화', color: '#DDA0DD', icon: '🎭' },
];

// 초기 상태
const initialState: TagState = {
  tags: [],
  loading: false,
  error: null
};

// Reducer 함수
const tagReducer = (state: TagState, action: TagAction): TagState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? action.payload : tag
        )
      };
    
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
      };
    
    case 'UPDATE_USAGE_COUNTS':
      return {
        ...state,
        tags: state.tags.map(tag => ({
          ...tag,
          usageCount: action.payload[tag.name] || 0
        }))
      };
    
    default:
      return state;
  }
};

// Context 생성
const TagContext = createContext<TagContextType | undefined>(undefined);

// Provider 컴포넌트
export const TagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const loadTags = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedTags = LocalStorage.get('TAGS', []);
        
        // 저장된 데이터가 없으면 기본 태그 생성
        if (savedTags.length === 0) {
          const defaultTags: Tag[] = DEFAULT_TAGS.map((tag, index) => ({
            ...tag,
            id: `default-tag-${index}`,
            isDefault: true,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          dispatch({ type: 'SET_TAGS', payload: defaultTags });
        } else {
          // Date 객체로 변환
          const tags = savedTags.map((tag: Tag) => ({
            ...tag,
            createdAt: new Date(tag.createdAt),
            updatedAt: new Date(tag.updatedAt)
          }));
          
          dispatch({ type: 'SET_TAGS', payload: tags });
        }
      } catch {
        dispatch({ type: 'SET_ERROR', payload: '태그 데이터를 불러오는 중 오류가 발생했습니다.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadTags();
  }, []);

  // 태그 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.tags.length > 0) {
      LocalStorage.set('TAGS', state.tags);
    }
  }, [state.tags]);

  // 태그 추가
  const addTag = (tagData: TagFormData) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      ...tagData,
      isDefault: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_TAG', payload: newTag });
  };

  // 태그 수정
  const updateTag = (id: string, tagData: TagFormData) => {
    const existingTag = state.tags.find(t => t.id === id);
    if (!existingTag) return;

    const updatedTag: Tag = {
      ...existingTag,
      ...tagData,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_TAG', payload: updatedTag });
  };

  // 태그 삭제
  const deleteTag = (id: string) => {
    const tag = state.tags.find(t => t.id === id);
    if (tag && tag.isDefault) {
      dispatch({ type: 'SET_ERROR', payload: '기본 태그는 삭제할 수 없습니다.' });
      return;
    }
    
    dispatch({ type: 'DELETE_TAG', payload: id });
  };

  // 태그 조회
  const getTagById = (id: string): Tag | undefined => {
    return state.tags.find(tag => tag.id === id);
  };

  // 인기 태그 조회
  const getPopularTags = (limit = 10): Tag[] => {
    return [...state.tags]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  };

  // 사용량 업데이트
  const updateUsageCounts = (tagCounts: Record<string, number>) => {
    dispatch({ type: 'UPDATE_USAGE_COUNTS', payload: tagCounts });
  };

  const value: TagContextType = {
    state,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getPopularTags,
    updateUsageCounts
  };

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};

// Context export
export { TagContext };