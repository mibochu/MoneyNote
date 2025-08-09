// 입력 템플릿 관련 타입 정의

export interface ExpenseTemplate {
  id: string;
  name: string; // 템플릿 이름 (예: "일일 교통비", "점심식사")
  description: string;
  amount?: number; // 선택적 - 고정 금액이 있는 경우
  category: string;
  subcategory?: string;
  paymentMethod: string;
  tags: string[];
  isFixed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeTemplate {
  id: string;
  name: string; // 템플릿 이름 (예: "월급", "부업 수입")
  description: string;
  amount?: number; // 선택적 - 고정 금액이 있는 경우
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateFormData {
  name: string;
  saveAmount: boolean; // 금액도 저장할지 여부
}