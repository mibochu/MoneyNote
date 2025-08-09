// localStorage 디버깅 유틸리티

export const debugLocalStorage = () => {
  console.log('=== LocalStorage 디버깅 정보 ===');
  
  const keys = [
    'moneyNote_expenses',
    'moneyNote_expectedExpenses', 
    'moneyNote_incomes',
    'moneyNote_categories',
    'moneyNote_budgets',
    'moneyNote_settings',
    'moneyNote_tags',
    'moneyNote_monthlyTargets',
    'moneyNote_recurringTransactions',
    'moneyNote_appSettings'
  ];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`${key}:`, parsed);
        console.log(`  - 타입: ${typeof parsed}`);
        console.log(`  - 길이: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
      } catch (error) {
        console.log(`${key}: 파싱 오류`, data);
      }
    } else {
      console.log(`${key}: 저장된 데이터 없음`);
    }
  });
  
  console.log('=== 전체 localStorage 크기 ===');
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  console.log(`총 크기: ${totalSize} bytes`);
  console.log('================================');
};

// 전역에서 접근 가능하도록 설정
(window as any).debugLocalStorage = debugLocalStorage;