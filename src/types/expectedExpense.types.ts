// 예상 지출 관련 타입 정의

import type { PaymentMethod } from './expense.types';

export interface ExpectedExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  expectedDate: Date;
  isRecurring: boolean; // 매월 반복 여부
  isActivated: boolean; // 실제 지출로 전환됨
  tags: string[];
  paymentMethod: PaymentMethod;
  actualExpenseId?: string; // 전환된 실제 지출 ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpectedExpenseFormData {
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  expectedDate: Date;
  isRecurring: boolean;
  tags: string[];
  paymentMethod: PaymentMethod;
}

export interface ExpectedExpenseFilter {
  category?: string;
  subcategory?: string;
  isActivated?: boolean;
  isRecurring?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ExpectedExpenseStats {
  total: number;
  count: number;
  activatedTotal: number;
  activatedCount: number;
  recurringTotal: number;
  recurringCount: number;
}