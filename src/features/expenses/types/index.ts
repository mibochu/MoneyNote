// Re-export types from main types folder
export * from '../../../types/expense.types';
export * from '../../../types/category.types';

// Additional expense-specific types can be added here if needed
export interface ExpenseFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
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