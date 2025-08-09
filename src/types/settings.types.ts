// 설정 관련 타입 정의

export interface AppSettings {
  showBudgetManagement: boolean; // 예산관리 표시 여부
  autoBackup: boolean; // 자동백업 활성화 여부
  theme: 'light' | 'dark'; // 테마 설정 (향후 확장용)
  language: 'ko' | 'en'; // 언어 설정 (향후 확장용)
  currency: 'KRW'; // 통화 설정 (향후 확장용)
}

export interface SettingsFormData {
  showBudgetManagement: boolean;
  autoBackup: boolean;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  currency: 'KRW';
}

// 기본 설정값
export const DEFAULT_SETTINGS: AppSettings = {
  showBudgetManagement: false, // 디폴트로 예산관리 숨김
  autoBackup: true, // 디폴트로 자동백업 활성화
  theme: 'light',
  language: 'ko',
  currency: 'KRW'
};