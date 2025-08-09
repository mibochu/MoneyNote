// 자동 반복 입력 관련 타입 정의

export type RecurringFrequency = 
  | 'daily'     // 매일
  | 'weekly'    // 매주  
  | 'monthly'   // 매월
  | 'yearly';   // 매년

export type RecurringTransactionType = 'income' | 'expense';

export interface RecurringTransaction {
  id: string;
  type: RecurringTransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod?: string; // expense만 해당
  tags: string[];
  frequency: RecurringFrequency;
  startDate: Date;
  nextDate: Date; // 다음 실행 예정일
  endDate?: Date; // 종료일 (옵션)
  isActive: boolean;
  
  // 메타 정보
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date; // 마지막 실행일
  executionCount: number; // 실행된 횟수
}

export interface RecurringFormData {
  type: RecurringTransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod?: string;
  tags: string[];
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
}

export interface RecurringFilter {
  type?: RecurringTransactionType;
  frequency?: RecurringFrequency;
  category?: string;
  isActive?: boolean;
}

// 반복 주기 옵션
export const RECURRING_FREQUENCY_OPTIONS = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' }
] as const;

// 자동 실행 결과
export interface RecurringExecutionResult {
  recurringId: string;
  transactionId: string; // 생성된 거래의 ID
  executedAt: Date;
  amount: number;
  success: boolean;
  error?: string;
}

// 예정된 반복 거래 정보
export interface UpcomingRecurring {
  recurringTransaction: RecurringTransaction;
  nextExecutionDate: Date;
  daysUntilExecution: number;
}