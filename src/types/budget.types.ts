// 예산 관련 타입 정의

export interface Budget {
  id: string;
  month: string; // YYYY-MM 형식
  income: number;
  totalExpenseBudget: number;
  savingsBudget: number;
  categoryBudgets: CategoryBudget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface BudgetFormData {
  month: string;
  income: number;
  totalExpenseBudget: number;
  savingsBudget: number;
  categoryBudgets: Omit<CategoryBudget, 'spentAmount' | 'remainingAmount'>[];
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  isOverBudget: boolean;
  daysLeft: number;
}

export interface MonthlyTarget {
  id: string;
  month: string;
  incomeTarget: number;
  expenseTarget: number;
  savingsTarget: number;
  actualIncome: number;
  actualExpense: number;
  actualSavings: number;
  achievementRate: {
    income: number;
    expense: number;
    savings: number;
  };
}