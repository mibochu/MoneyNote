// 기본 카테고리 상수 정의

import type { Category } from '../../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // 수입 카테고리
  {
    name: '수입',
    color: '#4CAF50',
    icon: '💰',
    isDefault: true,
    subcategories: [
      {
        id: 'salary',
        name: '급여',
        color: '#4CAF50',
        icon: '💼',
        isDefault: true,
        categoryId: 'income',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'side-income',
        name: '부수입',
        color: '#66BB6A',
        icon: '📈',
        isDefault: true,
        categoryId: 'income',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  
  // 저축 카테고리
  {
    name: '저축',
    color: '#2196F3',
    icon: '🏦',
    isDefault: true,
    subcategories: [
      {
        id: 'emergency-fund',
        name: '비상금',
        color: '#2196F3',
        icon: '🛡️',
        isDefault: true,
        categoryId: 'savings',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'investment',
        name: '투자',
        color: '#42A5F5',
        icon: '📊',
        isDefault: true,
        categoryId: 'savings',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },

  // 고정지출 카테고리
  {
    name: '고정지출',
    color: '#FF5722',
    icon: '🏠',
    isDefault: true,
    subcategories: [
      {
        id: 'rent',
        name: '월세/관리비',
        color: '#FF5722',
        icon: '🏠',
        isDefault: true,
        categoryId: 'fixed-expense',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'utilities',
        name: '공과금',
        color: '#FF7043',
        icon: '💡',
        isDefault: true,
        categoryId: 'fixed-expense',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'insurance',
        name: '보험료',
        color: '#FF8A65',
        icon: '🛡️',
        isDefault: true,
        categoryId: 'fixed-expense',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },

  // 생활비 카테고리
  {
    name: '생활비',
    color: '#FF9800',
    icon: '🛒',
    isDefault: false,
    subcategories: [
      {
        id: 'food',
        name: '식비',
        color: '#FF9800',
        icon: '🍽️',
        isDefault: false,
        categoryId: 'living',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'transportation',
        name: '교통비',
        color: '#FFB74D',
        icon: '🚗',
        isDefault: false,
        categoryId: 'living',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

export const CATEGORY_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
  '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4',
  '#009688', '#8BC34A', '#CDDC39', '#FFC107',
  '#FF5722', '#795548', '#607D8B', '#F44336'
];

export const CATEGORY_ICONS = [
  '💰', '🏦', '🛒', '🍽️', '🚗', '🏠', '💡', 
  '🛡️', '📱', '👕', '🎮', '📚', '💊', '✈️',
  '🎵', '🏋️', '🎨', '🐕', '🌟', '📈'
];