// 테스트용 더미 데이터 생성
import { LocalStorage } from './storage/localStorage';

export const generateSimpleTestData = () => {
  const now = new Date();
  
  // 간단한 테스트 지출 데이터
  const testExpenses = [
    {
      id: `exp-${now.getTime()}-1`,
      description: "점심식사",
      amount: 12000,
      category: "default-0", // 식비
      subcategory: "",
      paymentMethod: "card",
      tags: ["외식"],
      isFixed: false,
      date: new Date(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: `exp-${now.getTime()}-2`,
      description: "지하철 교통비",
      amount: 2500,
      category: "default-1", // 교통비
      subcategory: "",
      paymentMethod: "card",
      tags: ["교통"],
      isFixed: false,
      date: new Date(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: `exp-${now.getTime()}-3`,
      description: "커피",
      amount: 4500,
      category: "default-0", // 식비
      subcategory: "",
      paymentMethod: "cash",
      tags: ["음료"],
      isFixed: false,
      date: new Date(),
      createdAt: now,
      updatedAt: now
    }
  ];

  // 간단한 테스트 수입 데이터
  const testIncomes = [
    {
      id: `inc-${now.getTime()}-1`,
      description: "월급",
      amount: 3000000,
      source: "salary",
      date: new Date(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: `inc-${now.getTime()}-2`,
      description: "용돈",
      amount: 100000,
      source: "other",
      date: new Date(),
      createdAt: now,
      updatedAt: now
    }
  ];

  return { testExpenses, testIncomes };
};

export const createTestData = (): boolean => {
  try {
    const { testExpenses, testIncomes } = generateSimpleTestData();
    
    console.log('테스트 데이터 생성 중...');
    
    // LocalStorage 클래스 사용 (Context와 동일한 방식)
    LocalStorage.set('EXPENSES', testExpenses);
    LocalStorage.set('INCOMES', testIncomes);
    
    console.log('테스트 데이터 저장 완료:', {
      expenses: testExpenses.length,
      incomes: testIncomes.length
    });
    
    // window 객체에 함수 노출 (디버깅용)
    (window as any).createTestData = createTestData;
    (window as any).clearAllTestData = clearAllTestData;
    
    return true;
  } catch (error) {
    console.error('테스트 데이터 생성 실패:', error);
    return false;
  }
};

export const clearAllTestData = (): boolean => {
  try {
    console.log('모든 데이터 삭제 중...');
    
    // LocalStorage 클래스 사용 (Context와 동일한 방식)
    LocalStorage.clear();
    
    console.log('모든 데이터 삭제 완료');
    return true;
  } catch (error) {
    console.error('데이터 삭제 실패:', error);
    return false;
  }
};