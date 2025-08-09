// localStorage 관리 유틸리티

const STORAGE_KEYS = {
  EXPENSES: 'moneyNote_expenses',
  EXPECTED_EXPENSES: 'moneyNote_expectedExpenses',
  EXPENSE_TEMPLATES: 'moneyNote_expenseTemplates',
  INCOMES: 'moneyNote_incomes',
  INCOME_TEMPLATES: 'moneyNote_incomeTemplates',
  CATEGORIES: 'moneyNote_categories',
  BUDGETS: 'moneyNote_budgets',
  SETTINGS: 'moneyNote_settings',
  TAGS: 'moneyNote_tags',
  MONTHLY_TARGETS: 'moneyNote_monthlyTargets',
  RECURRING_TRANSACTIONS: 'moneyNote_recurringTransactions',
  APP_SETTINGS: 'moneyNote_appSettings'
} as const;

export class LocalStorage {
  /**
   * 데이터 저장
   */
  static set<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS[key], jsonData);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  /**
   * 데이터 조회
   */
  static get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      if (!item) return defaultValue;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * 데이터 삭제
   */
  static remove(key: keyof typeof STORAGE_KEYS): void {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
    }
  }

  /**
   * 모든 데이터 삭제
   */
  static clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error(`Failed to clear localStorage:`, error);
    }
  }

  /**
   * 데이터 존재 여부 확인
   */
  static exists(key: keyof typeof STORAGE_KEYS): boolean {
    return localStorage.getItem(STORAGE_KEYS[key]) !== null;
  }

  /**
   * 저장소 크기 확인 (대략적)
   */
  static getSize(): number {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      return totalSize;
    } catch (error) {
      console.error(`Failed to calculate localStorage size:`, error);
      return 0;
    }
  }
}