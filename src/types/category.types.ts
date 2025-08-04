// 카테고리 관련 타입 정의

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  subcategories: Subcategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
}

export interface SubcategoryFormData {
  name: string;
  color?: string;
  icon?: string;
  categoryId: string;
}

export type CategoryType = 
  | 'income'     // 수입
  | 'expense'    // 지출
  | 'savings';   // 저축

export interface CategoryWithUsage extends Category {
  usageCount: number;
  totalAmount: number;
  lastUsed?: Date;
}