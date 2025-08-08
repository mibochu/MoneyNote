// 수입 관련 타입 정의

export interface Income {
  id: string;
  date: Date;
  amount: number;
  source: string; // 수입 출처 (급여, 부업, 이자 등)
  description: string;
  category: string; // 수입 카테고리 ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeFormData {
  amount: number;
  source: string;
  description: string;
  category: string;
  date: Date;
}

export interface IncomeFilter {
  startDate?: Date;
  endDate?: Date;
  source?: string;
  category?: string;
}

export interface IncomeSummary {
  totalAmount: number;
  count: number;
  averageAmount: number;
  bySource: Record<string, number>;
}

// 수입 출처 미리 정의
export const INCOME_SOURCES = [
  { value: 'salary', label: '급여' },
  { value: 'business', label: '사업소득' },
  { value: 'investment', label: '투자수익' },
  { value: 'interest', label: '이자소득' },
  { value: 'allowance', label: '용돈/지원금' },
  { value: 'other', label: '기타' }
] as const;

export type IncomeSource = typeof INCOME_SOURCES[number]['value'];