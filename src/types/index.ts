// 모든 타입을 한 곳에서 export
// 중앙집중식 타입 관리 시스템

export * from './expense.types';
export * from './category.types';
export * from './budget.types';

// === EXPENSE FEATURE 타입들 (features/expenses/types에서 이관) ===
export interface ExpenseFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  tags?: string[];
  isFixed?: boolean;
}

export interface ExpenseStats {
  total: number;
  count: number;
  fixedTotal: number;
  variableTotal: number;
  average: number;
}

// === UI 관련 공통 타입들 ===
export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category';

// 공통 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}