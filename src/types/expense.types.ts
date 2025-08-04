// 지출 관련 타입 정의

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  subcategory: string;
  description: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  isFixed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = 
  | 'cash'        // 현금
  | 'card'        // 카드
  | 'bank'        // 계좌이체
  | 'digital'     // 디지털결제 (페이페이 등)
  | 'other';      // 기타

export interface ExpenseFormData {
  amount: number;
  category: string;
  subcategory: string;
  description: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  isFixed: boolean;
  date: Date;
}

export interface ExpenseFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  subcategory?: string;
  paymentMethod?: PaymentMethod;
  tags?: string[];
  isFixed?: boolean;
}

export interface ExpenseSummary {
  totalAmount: number;
  count: number;
  averageAmount: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<PaymentMethod, number>;
}