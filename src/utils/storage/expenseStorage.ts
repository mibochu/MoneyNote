import { LocalStorage } from './localStorage';
import type { Expense, ExpenseFormData } from '../../types/expense.types';

export class ExpenseStorage {
  /**
   * 모든 지출 데이터 조회
   */
  static getAllExpenses(): Expense[] {
    return LocalStorage.get('EXPENSES', []);
  }

  /**
   * 특정 지출 데이터 조회
   */
  static getExpenseById(id: string): Expense | null {
    const expenses = this.getAllExpenses();
    return expenses.find(expense => expense.id === id) || null;
  }

  /**
   * 새로운 지출 데이터 추가
   */
  static addExpense(formData: ExpenseFormData): Expense {
    const expenses = this.getAllExpenses();
    
    const newExpense: Expense = {
      id: this.generateId(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expenses.push(newExpense);
    LocalStorage.set('EXPENSES', expenses);
    
    return newExpense;
  }

  /**
   * 지출 데이터 수정
   */
  static updateExpense(id: string, formData: ExpenseFormData): Expense | null {
    const expenses = this.getAllExpenses();
    const index = expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      ...formData,
      updatedAt: new Date()
    };

    expenses[index] = updatedExpense;
    LocalStorage.set('EXPENSES', expenses);
    
    return updatedExpense;
  }

  /**
   * 지출 데이터 삭제
   */
  static deleteExpense(id: string): boolean {
    const expenses = this.getAllExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    
    if (filteredExpenses.length === expenses.length) {
      return false; // 삭제할 항목이 없음
    }

    LocalStorage.set('EXPENSES', filteredExpenses);
    return true;
  }

  /**
   * 여러 지출 데이터 삭제
   */
  static deleteMultipleExpenses(ids: string[]): number {
    const expenses = this.getAllExpenses();
    const filteredExpenses = expenses.filter(expense => !ids.includes(expense.id));
    const deletedCount = expenses.length - filteredExpenses.length;
    
    LocalStorage.set('EXPENSES', filteredExpenses);
    return deletedCount;
  }

  /**
   * 날짜 범위로 지출 데이터 조회
   */
  static getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
    const expenses = this.getAllExpenses();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  /**
   * 카테고리별 지출 데이터 조회
   */
  static getExpensesByCategory(categoryId: string): Expense[] {
    const expenses = this.getAllExpenses();
    return expenses.filter(expense => 
      expense.category === categoryId || expense.subcategory === categoryId
    );
  }

  /**
   * 결제수단별 지출 데이터 조회
   */
  static getExpensesByPaymentMethod(paymentMethod: string): Expense[] {
    const expenses = this.getAllExpenses();
    return expenses.filter(expense => expense.paymentMethod === paymentMethod);
  }

  /**
   * 고정지출/비고정지출 조회
   */
  static getExpensesByType(isFixed: boolean): Expense[] {
    const expenses = this.getAllExpenses();
    return expenses.filter(expense => expense.isFixed === isFixed);
  }

  /**
   * 태그로 지출 데이터 조회
   */
  static getExpensesByTag(tag: string): Expense[] {
    const expenses = this.getAllExpenses();
    return expenses.filter(expense => expense.tags.includes(tag));
  }

  /**
   * 지출 데이터 통계 계산
   */
  static getExpenseStats(expenses?: Expense[]) {
    const data = expenses || this.getAllExpenses();
    
    if (data.length === 0) {
      return {
        totalAmount: 0,
        count: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0
      };
    }

    const amounts = data.map(expense => expense.amount);
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

    return {
      totalAmount,
      count: data.length,
      averageAmount: totalAmount / data.length,
      maxAmount: Math.max(...amounts),
      minAmount: Math.min(...amounts)
    };
  }

  /**
   * 월별 지출 통계
   */
  static getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const monthlyExpenses = this.getExpensesByDateRange(startDate, endDate);
    
    return this.getExpenseStats(monthlyExpenses);
  }

  /**
   * 모든 지출 데이터 삭제
   */
  static clearAllExpenses(): void {
    LocalStorage.set('EXPENSES', []);
  }

  /**
   * 지출 데이터 백업 (JSON 형태로 반환)
   */
  static exportExpenses(): string {
    const expenses = this.getAllExpenses();
    return JSON.stringify(expenses, null, 2);
  }

  /**
   * 지출 데이터 복원
   */
  static importExpenses(jsonData: string): boolean {
    try {
      const expenses = JSON.parse(jsonData) as Expense[];
      
      // 데이터 유효성 검증
      if (!Array.isArray(expenses)) {
        throw new Error('Invalid data format');
      }

      // 각 항목이 Expense 형태인지 확인
      const isValidData = expenses.every(expense => 
        expense.id && 
        expense.amount && 
        expense.category && 
        expense.description && 
        expense.paymentMethod &&
        expense.date &&
        expense.createdAt
      );

      if (!isValidData) {
        throw new Error('Invalid expense data structure');
      }

      LocalStorage.set('EXPENSES', expenses);
      return true;
    } catch (error) {
      console.error('Failed to import expenses:', error);
      return false;
    }
  }

  /**
   * ID 생성 유틸리티
   */
  private static generateId(): string {
    return `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 데이터 무결성 검사
   */
  static validateData(): { isValid: boolean; errors: string[] } {
    const expenses = this.getAllExpenses();
    const errors: string[] = [];

    expenses.forEach((expense, index) => {
      if (!expense.id) {
        errors.push(`Expense at index ${index} is missing ID`);
      }
      if (!expense.amount || expense.amount <= 0) {
        errors.push(`Expense ${expense.id} has invalid amount`);
      }
      if (!expense.category) {
        errors.push(`Expense ${expense.id} is missing category`);
      }
      if (!expense.description) {
        errors.push(`Expense ${expense.id} is missing description`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}