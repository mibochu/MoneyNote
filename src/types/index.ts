// 모든 타입을 한 곳에서 export

export * from './expense.types';
export * from './category.types';
export * from './budget.types';

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