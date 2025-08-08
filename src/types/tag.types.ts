// 태그 관련 타입 정의

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagFormData {
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface TagSummary {
  tag: Tag;
  totalAmount: number;
  expenseCount: number;
  avgAmount: number;
}

export interface TagFilter {
  name?: string;
  isDefault?: boolean;
  minUsage?: number;
}