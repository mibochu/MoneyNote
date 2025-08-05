# 컨텍스트 API와 로컬스토리지 연동

## 🎯 학습 목표
React Context API와 localStorage를 효과적으로 연동하여 전역 상태와 데이터 영속성을 동시에 관리하는 방법을 익힌다.

## 🤔 왜 Context API + localStorage인가?

### 각각의 한계
**Context API만 사용할 때:**
```typescript
// 새로고침하면 데이터가 사라짐
const ExpenseContext = createContext();

const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]); // 메모리에만 존재
  
  return (
    <ExpenseContext.Provider value={{ expenses, setExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};
```

**localStorage만 사용할 때:**
```typescript
// 컴포넌트마다 직접 localStorage 조작
const ExpenseForm = () => {
  const handleSubmit = (data) => {
    const existing = JSON.parse(localStorage.getItem('expenses') || '[]');
    existing.push(data);
    localStorage.setItem('expenses', JSON.stringify(existing));
    
    // 다른 컴포넌트들이 변경사항을 모름!
  };
};
```

**문제점들:**
- Context만 쓰면 새로고침 시 데이터 손실
- localStorage만 쓰면 컴포넌트 간 동기화 어려움
- 데이터 일관성 문제
- 복잡한 상태 관리 로직 중복

## 🏗️ 통합 솔루션 설계

### 1단계: 상태 구조 설계
먼저 관리할 상태의 구조를 명확히 정의합니다:

```typescript
// 전역 상태 타입 정의
interface ExpenseState {
  expenses: Expense[];        // 실제 지출 데이터
  loading: boolean;          // 로딩 상태
  error: string | null;      // 에러 상태
  filter: ExpenseFilter;     // 필터 상태 (영속화 안함)
}

// Context 타입 정의
interface ExpenseContextType {
  state: ExpenseState;
  // Actions
  addExpense: (expenseData: ExpenseFormData) => void;
  updateExpense: (id: string, expenseData: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  setFilter: (filter: ExpenseFilter) => void;
  getFilteredExpenses: () => Expense[];
}
```

### 2단계: useReducer로 복잡한 상태 관리
useState 대신 useReducer를 사용하여 체계적으로 상태를 관리합니다:

```typescript
// Action 타입 정의
type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: ExpenseFilter };

// Reducer 함수
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [...state.expenses, action.payload] 
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      return state;
  }
};
```

### 3단계: localStorage 유틸리티 클래스
타입 안전한 localStorage 관리 클래스를 만듭니다:

```typescript
// localStorage 관리 클래스
export class LocalStorage {
  private static STORAGE_KEYS = {
    EXPENSES: 'moneyNote_expenses',
    CATEGORIES: 'moneyNote_categories',
    BUDGETS: 'moneyNote_budgets',
    SETTINGS: 'moneyNote_settings'
  } as const;

  // 타입 안전한 데이터 저장
  static set<T>(key: keyof typeof LocalStorage.STORAGE_KEYS, data: T): void {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(LocalStorage.STORAGE_KEYS[key], jsonData);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  // 타입 안전한 데이터 조회
  static get<T>(key: keyof typeof LocalStorage.STORAGE_KEYS, defaultValue: T): T {
    try {
      const item = localStorage.getItem(LocalStorage.STORAGE_KEYS[key]);
      if (!item) return defaultValue;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error);
      return defaultValue;
    }
  }

  // 데이터 삭제
  static remove(key: keyof typeof LocalStorage.STORAGE_KEYS): void {
    try {
      localStorage.removeItem(LocalStorage.STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
    }
  }
}
```

### 4단계: Context Provider 구현
Context와 localStorage를 연동하는 Provider를 구현합니다:

```typescript
const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    loading: false,
    error: null,
    filter: {}
  });

  // 1. 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // localStorage에서 데이터 로드
        const savedExpenses = LocalStorage.get('EXPENSES', []);
        
        // Date 객체 복원 (JSON.parse는 Date를 문자열로 변환하므로)
        const expenses = savedExpenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt)
        }));
        
        dispatch({ type: 'SET_EXPENSES', payload: expenses });
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '지출 데이터를 불러오는 중 오류가 발생했습니다.' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadExpenses();
  }, []);

  // 2. 지출 데이터 변경 시 localStorage에 자동 저장
  useEffect(() => {
    // 초기 로딩 중이 아닐 때만 저장 (무한 루프 방지)
    if (!state.loading && state.expenses.length >= 0) {
      LocalStorage.set('EXPENSES', state.expenses);
    }
  }, [state.expenses, state.loading]);

  // 3. 비즈니스 로직 함수들
  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...expenseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (id: string, expenseData: ExpenseFormData) => {
    const existingExpense = state.expenses.find(e => e.id === id);
    if (!existingExpense) return;

    const updatedExpense: Expense = {
      ...existingExpense,
      ...expenseData,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const setFilter = (filter: ExpenseFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // 4. 계산된 값들 (메모이제이션 적용)
  const getFilteredExpenses = useCallback((): Expense[] => {
    let filtered = [...state.expenses];
    const { startDate, endDate, category, subcategory, paymentMethod, tags, isFixed } = state.filter;

    if (startDate) {
      filtered = filtered.filter(expense => expense.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(expense => expense.date <= endDate);
    }

    if (category) {
      filtered = filtered.filter(expense => expense.category === category);
    }

    if (subcategory) {
      filtered = filtered.filter(expense => expense.subcategory === subcategory);
    }

    if (paymentMethod) {
      filtered = filtered.filter(expense => expense.paymentMethod === paymentMethod);
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter(expense => 
        tags.some(tag => expense.tags.includes(tag))
      );
    }

    if (isFixed !== undefined) {
      filtered = filtered.filter(expense => expense.isFixed === isFixed);
    }

    // 최신 순으로 정렬
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [state.expenses, state.filter]);

  // 5. Context 값 구성
  const value: ExpenseContextType = {
    state,
    addExpense,
    updateExpense,
    deleteExpense,
    setFilter,
    getFilteredExpenses
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
```

## 🔧 고급 패턴과 최적화

### 1. 지연 로딩 (Lazy Loading)
큰 데이터셋의 경우 필요할 때만 로드:

```typescript
const useExpenseLazyLoading = () => {
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  
  const loadExpensesForMonth = useCallback(async (year: number, month: number) => {
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    if (loadedMonths.has(monthKey)) {
      return; // 이미 로드됨
    }
    
    try {
      const monthlyExpenses = LocalStorage.get(`EXPENSES_${monthKey}`, []);
      dispatch({ type: 'ADD_MONTHLY_EXPENSES', payload: monthlyExpenses });
      setLoadedMonths(prev => new Set([...prev, monthKey]));
    } catch (error) {
      console.error(`Failed to load expenses for ${monthKey}:`, error);
    }
  }, [loadedMonths]);
  
  return { loadExpensesForMonth };
};
```

### 2. 낙관적 업데이트 (Optimistic Updates)
사용자 경험 향상을 위한 즉시 UI 업데이트:

```typescript
const addExpenseOptimistically = async (expenseData: ExpenseFormData) => {
  const tempId = `temp_${Date.now()}`;
  const optimisticExpense: Expense = {
    id: tempId,
    ...expenseData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // 1. 즉시 UI 업데이트
  dispatch({ type: 'ADD_EXPENSE', payload: optimisticExpense });
  
  try {
    // 2. 실제 저장 (API 호출이나 복잡한 처리)
    const finalExpense = await saveExpense(expenseData);
    
    // 3. 실제 데이터로 교체
    dispatch({ type: 'UPDATE_EXPENSE', payload: finalExpense });
  } catch (error) {
    // 4. 실패 시 롤백
    dispatch({ type: 'DELETE_EXPENSE', payload: tempId });
    dispatch({ type: 'SET_ERROR', payload: '지출 저장에 실패했습니다.' });
  }
};
```

### 3. 데이터 동기화 상태 관리
여러 탭이나 창 간의 데이터 동기화:

```typescript
const useCrossTabSync = () => {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'moneyNote_expenses' && event.newValue) {
        try {
          const newExpenses = JSON.parse(event.newValue);
          dispatch({ type: 'SET_EXPENSES', payload: newExpenses });
        } catch (error) {
          console.error('Failed to sync data from other tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};
```

### 4. 데이터 백업 및 복원
중요한 데이터의 백업과 복원 기능:

```typescript
const useDataBackup = () => {
  const exportData = useCallback(() => {
    const expenses = LocalStorage.get('EXPENSES', []);
    const categories = LocalStorage.get('CATEGORIES', []);
    const budgets = LocalStorage.get('BUDGETS', []);
    
    const backupData = {
      expenses,
      categories,
      budgets,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneynote_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, []);
  
  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        
        // 데이터 유효성 검증
        if (backupData.version && backupData.expenses) {
          LocalStorage.set('EXPENSES', backupData.expenses);
          LocalStorage.set('CATEGORIES', backupData.categories || []);
          LocalStorage.set('BUDGETS', backupData.budgets || []);
          
          // Context 상태 업데이트
          dispatch({ type: 'SET_EXPENSES', payload: backupData.expenses });
          
          alert('데이터가 성공적으로 복원되었습니다.');
        } else {
          throw new Error('Invalid backup file format');
        }
      } catch (error) {
        alert('백업 파일을 읽는 중 오류가 발생했습니다.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
  }, []);
  
  return { exportData, importData };
};
```

## 🎯 실제 컴포넌트에서의 활용

### Context 사용하는 컴포넌트
```typescript
const ExpenseList: React.FC = () => {
  const { state, deleteExpense, setFilter, getFilteredExpenses } = useExpenses();
  const filteredExpenses = getFilteredExpenses();
  
  if (state.loading) {
    return <CircularProgress />;
  }
  
  if (state.error) {
    return <Alert severity="error">{state.error}</Alert>;
  }
  
  return (
    <List>
      {filteredExpenses.map(expense => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={() => deleteExpense(expense.id)}
        />
      ))}
    </List>
  );
};
```

### Custom Hook으로 로직 재사용
```typescript
const useExpenseStats = () => {
  const { state } = useExpenses();
  
  return useMemo(() => {
    const expenses = state.expenses;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyAverage = totalAmount / 12; // 간단한 예시
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAmount,
      monthlyAverage,
      categoryBreakdown,
      count: expenses.length
    };
  }, [state.expenses]);
};
```

## 📊 성능 최적화 포인트

### 1. 메모이제이션 활용
```typescript
// 컴포넌트 리렌더링 최소화
const ExpenseItem = React.memo<ExpenseItemProps>(({ expense, onDelete }) => {
  return (
    <ListItem>
      <ListItemText primary={expense.description} />
      <IconButton onClick={() => onDelete(expense.id)}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
});

// 계산 결과 캐싱
const getFilteredExpenses = useMemo(() => {
  // 필터링 로직
}, [expenses, filter]);
```

### 2. 배치 업데이트
```typescript
const addMultipleExpenses = (expensesData: ExpenseFormData[]) => {
  const newExpenses = expensesData.map(data => ({
    id: generateId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  // 한 번에 모든 지출 추가
  dispatch({ type: 'ADD_MULTIPLE_EXPENSES', payload: newExpenses });
};
```

## 🎉 주요 장점과 효과

### 개발자 경험
1. **타입 안전성**: TypeScript로 컴파일 타임 에러 방지
2. **중앙집중식 상태 관리**: 모든 지출 관련 로직이 한 곳에
3. **재사용성**: Custom Hook으로 로직 재사용

### 사용자 경험
1. **데이터 영속성**: 새로고침해도 데이터 유지
2. **실시간 동기화**: 모든 컴포넌트가 최신 데이터 반영
3. **오프라인 지원**: 네트워크 없이도 동작

### 시스템 안정성
1. **에러 처리**: 체계적인 에러 상태 관리
2. **데이터 무결성**: 중앙에서 데이터 일관성 보장
3. **백업/복원**: 데이터 손실 방지

## 🎯 핵심 배운 점

1. **상태와 영속성 분리**: Context는 상태 관리, localStorage는 영속성
2. **useReducer 활용**: 복잡한 상태 변화를 체계적으로 관리
3. **Date 객체 주의사항**: JSON 직렬화/역직렬화 시 타입 복원 필요
4. **성능 고려사항**: 메모이제이션과 배치 업데이트로 최적화

Context API와 localStorage를 적절히 조합하면, 견고하고 사용자 친화적인 상태 관리 시스템을 구축할 수 있습니다! 🚀