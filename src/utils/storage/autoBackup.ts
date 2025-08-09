// 자동 백업을 위한 IndexedDB 유틸리티
import type { Expense, ExpectedExpense } from '../../types';
import type { Income } from '../../types/income.types';
import type { Tag } from '../../types/tag.types';
import type { AppSettings } from '../../types/settings.types';

interface BackupData {
  id: string;
  timestamp: number;
  data: {
    expenses: Expense[];
    expectedExpenses: ExpectedExpense[];
    incomes: Income[];
    categories: unknown[]; // 카테고리 타입이 정의되면 수정
    tags: Tag[];
    settings: AppSettings | null;
    budgets: unknown[]; // 예산 타입이 정의되면 수정
    monthlyTargets: unknown[]; // 월별 목표 타입이 정의되면 수정
    recurringTransactions: unknown[]; // 정기 거래 타입이 정의되면 수정
  };
  version: string;
}

class AutoBackupManager {
  private dbName = 'MoneyNoteAutoBackup';
  private dbVersion = 1;
  private storeName = 'backups';
  private maxBackups = 10; // 최대 10개 백업 유지

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // localStorage의 모든 데이터를 가져와서 백업 데이터 생성
  private getAllLocalStorageData() {
    return {
      expenses: JSON.parse(localStorage.getItem('moneyNote_expenses') || '[]'),
      expectedExpenses: JSON.parse(localStorage.getItem('moneyNote_expectedExpenses') || '[]'),
      incomes: JSON.parse(localStorage.getItem('moneyNote_incomes') || '[]'),
      categories: JSON.parse(localStorage.getItem('moneyNote_categories') || '[]'),
      tags: JSON.parse(localStorage.getItem('moneyNote_tags') || '[]'),
      settings: JSON.parse(localStorage.getItem('moneyNote_appSettings') || 'null'),
      budgets: JSON.parse(localStorage.getItem('moneyNote_budgets') || '[]'),
      monthlyTargets: JSON.parse(localStorage.getItem('moneyNote_monthlyTargets') || '[]'),
      recurringTransactions: JSON.parse(localStorage.getItem('moneyNote_recurringTransactions') || '[]')
    };
  }

  // 자동 백업 실행
  async createAutoBackup(): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const backupData: BackupData = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        data: this.getAllLocalStorageData(),
        version: '1.0.0'
      };

      // 새 백업 저장 (중복 방지)
      await new Promise<void>((resolve, reject) => {
        const request = store.add(backupData);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          // 중복 키 에러인 경우 다른 키로 재시도
          if (request.error && request.error.name === 'ConstraintError') {
            const retryData = {
              ...backupData,
              id: `backup-${Date.now()}-retry-${Math.random().toString(36).substr(2, 9)}`
            };
            const retryRequest = store.add(retryData);
            retryRequest.onsuccess = () => {
              console.log('백업 재시도 성공:', retryData.id);
              resolve();
            };
            retryRequest.onerror = () => reject(retryRequest.error);
          } else {
            reject(request.error);
          }
        };
      });

      // 오래된 백업 삭제 (최대 개수 유지)
      await this.cleanupOldBackups(store);

      console.log('Auto backup created:', backupData.id);
      return true;
    } catch (error) {
      console.error('Failed to create auto backup:', error);
      return false;
    }
  }

  // 오래된 백업 정리
  private async cleanupOldBackups(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // 최신순으로 정렬
      const backupsToKeep: string[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < this.maxBackups) {
          backupsToKeep.push(cursor.value.id);
          count++;
          cursor.continue();
        } else {
          // 유지할 백업 이외는 모두 삭제
          this.deleteBackupsExcept(store, backupsToKeep).then(resolve).catch(reject);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 특정 백업들을 제외하고 모두 삭제
  private async deleteBackupsExcept(store: IDBObjectStore, keepIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (!keepIds.includes(cursor.value.id)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 모든 백업 목록 가져오기
  async getBackupList(): Promise<BackupData[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      return new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => {
          const backups = request.result.sort((a, b) => b.timestamp - a.timestamp);
          resolve(backups);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get backup list:', error);
      return [];
    }
  }

  // 특정 백업으로 복원
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const backup = await new Promise<BackupData | null>((resolve, reject) => {
        const request = store.get(backupId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (!backup) {
        console.error('Backup not found:', backupId);
        return false;
      }

      // localStorage로 복원
      Object.entries(backup.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          localStorage.setItem(`moneyNote_${key}`, JSON.stringify(value));
        }
      });

      console.log('Data restored from backup:', backupId);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  // 최신 백업으로 복원
  async restoreFromLatestBackup(): Promise<boolean> {
    const backups = await this.getBackupList();
    if (backups.length === 0) {
      console.log('No backups available');
      return false;
    }

    return this.restoreFromBackup(backups[0].id);
  }

  // 데이터가 변경되었는지 체크
  private lastDataHash: string = '';

  async hasDataChanged(): Promise<boolean> {
    const currentData = this.getAllLocalStorageData();
    const currentHash = JSON.stringify(currentData);
    
    if (this.lastDataHash !== currentHash) {
      this.lastDataHash = currentHash;
      return true;
    }
    return false;
  }

  // 자동 백업 서비스 시작
  startAutoBackup(): void {
    // 5분마다 데이터 변경 체크하고 백업
    setInterval(async () => {
      if (await this.hasDataChanged()) {
        await this.createAutoBackup();
      }
    }, 5 * 60 * 1000); // 5분

    console.log('Auto backup service started');
  }
}

export const autoBackupManager = new AutoBackupManager();