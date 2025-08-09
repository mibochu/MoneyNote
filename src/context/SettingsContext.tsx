// 앱 설정 관리 Context

import React, { createContext, useReducer, useEffect } from 'react';
import type { AppSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';
import { LocalStorage } from '../utils/storage/localStorage';

// State 타입 정의
interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

// Action 타입 정의
type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTING'; payload: { key: keyof AppSettings; value: any } };

// Context 타입 정의
interface SettingsContextType {
  state: SettingsState;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

// 초기 상태
const createInitialState = (): SettingsState => ({
  settings: { ...DEFAULT_SETTINGS },
  loading: false,
  error: null
});

const initialState: SettingsState = createInitialState();

// Reducer 함수
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
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
    
    case 'SET_SETTINGS':
      return { 
        ...state, 
        settings: action.payload, 
        error: null,
        loading: false 
      };
    
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value
        },
        error: null
      };
    
    default:
      const exhaustiveCheck: never = action;
      console.error('Unhandled action type:', exhaustiveCheck);
      return state;
  }
};

// Context 생성
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider 컴포넌트
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 설정 로드
  useEffect(() => {
    let isCancelled = false;

    const loadSettings = async () => {
      if (isCancelled) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedSettings = LocalStorage.get('APP_SETTINGS', DEFAULT_SETTINGS);
        
        if (isCancelled) return;
        
        // 기본 설정과 병합 (새로운 설정 항목 추가 시 대비)
        const mergedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...savedSettings
        };
        
        if (!isCancelled) {
          dispatch({ type: 'SET_SETTINGS', payload: mergedSettings });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load settings:', error);
          dispatch({ type: 'SET_ERROR', payload: '설정을 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        if (!isCancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadSettings();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.loading) return;
    
    try {
      LocalStorage.set('APP_SETTINGS', state.settings);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [state.settings, state.loading]);

  // 개별 설정 업데이트
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    try {
      dispatch({ 
        type: 'UPDATE_SETTING', 
        payload: { key, value } 
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      dispatch({ type: 'SET_ERROR', payload: '설정 업데이트 중 오류가 발생했습니다.' });
    }
  };

  // 다중 설정 업데이트
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings: AppSettings = {
        ...state.settings,
        ...newSettings
      };
      
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      dispatch({ type: 'SET_ERROR', payload: '설정 업데이트 중 오류가 발생했습니다.' });
    }
  };

  // 설정 초기화
  const resetSettings = () => {
    try {
      dispatch({ type: 'SET_SETTINGS', payload: { ...DEFAULT_SETTINGS } });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      dispatch({ type: 'SET_ERROR', payload: '설정 초기화 중 오류가 발생했습니다.' });
    }
  };

  const value: SettingsContextType = {
    state,
    updateSetting,
    updateSettings,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Context export
export { SettingsContext };