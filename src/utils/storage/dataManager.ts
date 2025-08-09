// 데이터 백업/복원/초기화 관리

import { autoBackupManager } from './autoBackup';

export interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    appName: string;
  };
  data: {
    expenses: any[];
    incomes: any[];
    categories: any[];
    tags: any[];
    settings: any;
    budgets: any[];
    monthlyTargets: any[];
    recurringTransactions: any[];
  };
}

class DataManager {
  
  // JSON 파일로 데이터 내보내기
  async exportToJSON(): Promise<void> {
    try {
      const exportData: ExportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          appName: 'MoneyNote'
        },
        data: {
          expenses: JSON.parse(localStorage.getItem('moneyNote_expenses') || '[]'),
          incomes: JSON.parse(localStorage.getItem('moneyNote_incomes') || '[]'),
          categories: JSON.parse(localStorage.getItem('moneyNote_categories') || '[]'),
          tags: JSON.parse(localStorage.getItem('moneyNote_tags') || '[]'),
          settings: JSON.parse(localStorage.getItem('moneyNote_appSettings') || 'null'),
          budgets: JSON.parse(localStorage.getItem('moneyNote_budgets') || '[]'),
          monthlyTargets: JSON.parse(localStorage.getItem('moneyNote_monthlyTargets') || '[]'),
          recurringTransactions: JSON.parse(localStorage.getItem('moneyNote_recurringTransactions') || '[]')
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoneyNote_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // JSON 파일에서 데이터 가져오기
  async importFromJSON(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData: ExportData = JSON.parse(content);
          
          // 데이터 유효성 검사
          if (!this.validateImportData(importData)) {
            reject(new Error('잘못된 파일 형식입니다.'));
            return;
          }

          // 현재 데이터 백업 (복원용)
          autoBackupManager.createAutoBackup();

          // 새 데이터로 복원
          Object.entries(importData.data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              localStorage.setItem(`moneyNote_${key}`, JSON.stringify(value));
            }
          });

          console.log('Data imported successfully');
          resolve(true);
        } catch (error) {
          console.error('Failed to parse import file:', error);
          reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('파일을 읽을 수 없습니다.'));
      };

      reader.readAsText(file);
    });
  }

  // 가져올 데이터 유효성 검사
  private validateImportData(data: any): data is ExportData {
    if (!data || typeof data !== 'object') return false;
    if (!data.metadata || !data.data) return false;
    if (!data.metadata.appName || data.metadata.appName !== 'MoneyNote') return false;
    
    // 필수 데이터 필드 체크
    const requiredFields = ['expenses', 'incomes', 'categories'];
    for (const field of requiredFields) {
      if (!Array.isArray(data.data[field])) {
        console.warn(`Missing or invalid field: ${field}`);
        return false;
      }
    }
    
    return true;
  }

  // 모든 데이터 초기화
  async clearAllData(): Promise<void> {
    try {
      // 백업 먼저 생성
      await autoBackupManager.createAutoBackup();
      
      // localStorage 데이터 삭제
      const keysToRemove = [
        'moneyNote_expenses',
        'moneyNote_incomes', 
        'moneyNote_categories',
        'moneyNote_tags',
        'moneyNote_appSettings',
        'moneyNote_budgets',
        'moneyNote_monthlyTargets',
        'moneyNote_recurringTransactions'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  // 테스트용 더미 데이터 생성 (실제 앱 구조와 호환)
  async generateTestData(): Promise<void> {
    try {
      // 먼저 현재 데이터 백업 (간단한 localStorage 백업)
      console.log('=== 현재 데이터 백업 시작 ===');
      const backupKey = `moneyNote_backup_${Date.now()}`;
      const currentData = {
        expenses: localStorage.getItem('moneyNote_expenses'),
        incomes: localStorage.getItem('moneyNote_incomes'), 
        categories: localStorage.getItem('moneyNote_categories'),
        tags: localStorage.getItem('moneyNote_tags'),
        appSettings: localStorage.getItem('moneyNote_appSettings'),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(backupKey, JSON.stringify(currentData));
      console.log('현재 데이터 백업 완료:', backupKey);
      
      const now = new Date();
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      
      // 실제 앱에서 사용하는 기본 카테고리 구조 (default-0, default-1, default-2, default-3)
      const testData = {
        categories: [
          {
            id: 'default-0',
            name: '수입',
            color: '#4CAF50',
            icon: '💰',
            isDefault: true,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'default-1', 
            name: '저축',
            color: '#2196F3',
            icon: '🏦',
            isDefault: true,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'default-2',
            name: '식비',
            color: '#FF9800', 
            icon: '🍽️',
            isDefault: true,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'default-3',
            name: '교통비',
            color: '#9C27B0',
            icon: '🚌', 
            isDefault: true,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'test-cat-1',
            name: '쇼핑',
            color: '#E91E63',
            icon: '🛒', 
            isDefault: false,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'test-cat-2',
            name: '문화생활',
            color: '#673AB7',
            icon: '🎬', 
            isDefault: false,
            subcategories: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          }
        ],
        expenses: [
          {
            id: 'test-exp-1',
            date: today,
            amount: 15000,
            category: 'default-2', // 식비
            subcategory: '',
            description: '회사 근처 점심',
            paymentMethod: 'card',
            tags: ['식사', '회사'],
            isFixed: false,
            createdAt: today,
            updatedAt: today
          },
          {
            id: 'test-exp-2',
            date: yesterday,
            amount: 3200,
            category: 'default-3', // 교통비
            subcategory: '',
            description: '지하철 통근',
            paymentMethod: 'card',
            tags: ['교통', '필수'],
            isFixed: true,
            createdAt: yesterday,
            updatedAt: yesterday
          },
          {
            id: 'test-exp-3',
            date: twoDaysAgo,
            amount: 45000,
            category: 'test-cat-1', // 쇼핑
            subcategory: '',
            description: '옷 구매',
            paymentMethod: 'cash',
            tags: ['쇼핑'],
            isFixed: false,
            createdAt: twoDaysAgo,
            updatedAt: twoDaysAgo
          },
          {
            id: 'test-exp-4',
            date: today,
            amount: 12000,
            category: 'test-cat-2', // 문화생활
            subcategory: '',
            description: '영화관람',
            paymentMethod: 'mobile',
            tags: ['여가'],
            isFixed: false,
            createdAt: today,
            updatedAt: today
          },
          {
            id: 'test-exp-5',
            date: today,
            amount: 500000,
            category: 'default-1', // 저축
            subcategory: '',
            description: '적금 납입',
            paymentMethod: 'transfer',
            tags: ['저축', '투자'],
            isFixed: true,
            createdAt: today,
            updatedAt: today
          }
        ],
        incomes: [
          {
            id: 'test-inc-1',
            date: today,
            amount: 3500000,
            source: 'salary',
            description: '12월 급여',
            category: 'default-0', // 수입
            createdAt: today,
            updatedAt: today
          },
          {
            id: 'test-inc-2', 
            date: new Date(Date.now() - 7 * 86400000).toISOString(),
            amount: 150000,
            source: 'other',
            description: '프리랜싱 수입 (출처: 웹사이트 개발)',
            category: 'default-0', // 수입
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 86400000).toISOString()
          }
        ],
        tags: [
          { id: 'test-tag-1', name: '식사', color: '#FF6B6B' },
          { id: 'test-tag-2', name: '교통', color: '#4ECDC4' },
          { id: 'test-tag-3', name: '필수', color: '#45B7D1' },
          { id: 'test-tag-4', name: '회사', color: '#96CEB4' },
          { id: 'test-tag-5', name: '쇼핑', color: '#FFEAA7' },
          { id: 'test-tag-6', name: '여가', color: '#DDA0DD' },
          { id: 'test-tag-7', name: '저축', color: '#74B9FF' },
          { id: 'test-tag-8', name: '투자', color: '#00B894' }
        ],
        appSettings: {
          showBudgetManagement: false
        },
        budgets: [],
        monthlyTargets: [],
        recurringTransactions: []
      };

      // IndexedDB 백업 실패할 수 있으므로 localStorage로도 백업
      try {
        await autoBackupManager.createAutoBackup();
        console.log('IndexedDB 백업 성공');
      } catch (error) {
        console.warn('IndexedDB 백업 실패, localStorage만 사용:', error);
      }

      // 테스트 데이터 저장
      Object.entries(testData).forEach(([key, value]) => {
        const storageKey = `moneyNote_${key}`;
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(storageKey, jsonValue);
        console.log(`저장된 ${key}:`, {
          key: storageKey,
          items: Array.isArray(value) ? value.length : typeof value,
          preview: Array.isArray(value) ? value.slice(0, 2) : value
        });
      });

      console.log('Test data generated successfully');
      
      // 저장 후 verification
      console.log('=== 저장 후 localStorage 확인 ===');
      Object.keys(testData).forEach(key => {
        const storageKey = `moneyNote_${key}`;
        const stored = localStorage.getItem(storageKey);
        console.log(`${key} 저장 확인:`, stored ? 'OK' : 'MISSING');
      });
    } catch (error) {
      console.error('Failed to generate test data:', error);
      throw error;
    }
  }

  // 데이터 통계 정보
  getDataStats() {
    try {
      const expenses = JSON.parse(localStorage.getItem('moneyNote_expenses') || '[]');
      const incomes = JSON.parse(localStorage.getItem('moneyNote_incomes') || '[]');
      const categories = JSON.parse(localStorage.getItem('moneyNote_categories') || '[]');
      const tags = JSON.parse(localStorage.getItem('moneyNote_tags') || '[]');

      return {
        expenses: expenses.length,
        incomes: incomes.length,
        categories: categories.length,
        tags: tags.length,
        totalDataSize: this.calculateDataSize()
      };
    } catch (error) {
      console.error('Failed to get data stats:', error);
      return null;
    }
  }

  // localStorage 사용량 계산
  private calculateDataSize(): string {
    let totalSize = 0;
    for (const key in localStorage) {
      if (key.startsWith('moneyNote_')) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }
    
    if (totalSize < 1024) return `${totalSize} bytes`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  // localStorage 백업 목록 가져오기
  getLocalStorageBackups(): Array<{key: string, timestamp: string}> {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('moneyNote_backup_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp) {
            backups.push({
              key,
              timestamp: data.timestamp
            });
          }
        } catch (error) {
          console.warn('Invalid backup data:', key);
        }
      }
    }
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // localStorage 백업에서 복원
  async restoreFromLocalStorageBackup(): Promise<boolean> {
    try {
      const backups = this.getLocalStorageBackups();
      if (backups.length === 0) {
        console.log('사용 가능한 localStorage 백업이 없습니다.');
        return false;
      }

      const latestBackup = backups[0];
      console.log('복원할 백업:', latestBackup);
      
      const backupData = JSON.parse(localStorage.getItem(latestBackup.key) || '{}');
      
      // 백업된 데이터로 복원
      Object.entries(backupData).forEach(([key, value]) => {
        if (key !== 'timestamp' && value !== null) {
          localStorage.setItem(`moneyNote_${key}`, value as string);
          console.log(`복원됨: moneyNote_${key}`);
        }
      });

      console.log('localStorage 백업에서 복원 완료');
      return true;
    } catch (error) {
      console.error('localStorage 백업 복원 실패:', error);
      return false;
    }
  }
}

export const dataManager = new DataManager();