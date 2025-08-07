# MoneyNote 개발 개념 총정리 📚

> **출근길 복습용** - MoneyNote 프로젝트에서 실제 사용된 React/TypeScript 핵심 개념들

## 🎯 이 앱이 필요로 하는 개념들

MoneyNote는 **가계부 관리 앱**으로, 다음과 같은 기능들이 필요합니다:
- 📝 지출 입력 (복잡한 폼 처리)
- 📂 카테고리 관리 (계층형 데이터)
- 📊 통계 및 차트 (데이터 계산 및 시각화)
- 💾 데이터 저장 (로컬스토리지)
- 🔄 상태 관리 (여러 컴포넌트 간 데이터 공유)

이를 위해 필요한 **핵심 개념들**:

---

## 📖 단원 1: React 기초 개념

### 1.1 함수형 컴포넌트와 JSX
```typescript
// 기본 함수형 컴포넌트
const ExpenseItem: React.FC = () => {
  return (
    <div>
      <h3>지출 항목</h3>
    </div>
  );
};
```
**MoneyNote 적용**: 모든 컴포넌트가 함수형으로 구현됨

### 1.2 Props를 통한 데이터 전달
```typescript
interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete }) => {
  return (
    <div>
      <span>{expense.description}</span>
      <button onClick={() => onEdit(expense)}>수정</button>
      <button onClick={() => onDelete(expense.id)}>삭제</button>
    </div>
  );
};
```
**MoneyNote 적용**: CategoryManager → CategoryForm 데이터 전달

### 1.3 useState로 컴포넌트 상태 관리
```typescript
const [isFormOpen, setIsFormOpen] = useState(false);
const [categories, setCategories] = useState<Category[]>([]);
const [formData, setFormData] = useState<CategoryFormData>({
  name: '',
  color: CATEGORY_COLORS[0],
  icon: CATEGORY_ICONS[0]
});
```
**MoneyNote 적용**: 폼 열기/닫기, 카테고리 목록, 폼 입력값 관리

---

## 📖 단원 2: 이벤트 처리와 폼 관리

### 2.1 이벤트 핸들러 패턴
```typescript
const handleSubmit = (event: React.FormEvent) => {
  event.preventDefault(); // 기본 폼 제출 방지
  if (validateForm()) {
    onSubmit(formData);
  }
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```
**MoneyNote 적용**: ExpenseForm, CategoryForm에서 입력값 처리

### 2.2 폼 유효성 검증
```typescript
const validateForm = (): boolean => {
  const newErrors: { name?: string } = {};
  
  if (!formData.name.trim()) {
    newErrors.name = '이름을 입력해주세요';
  } else if (formData.name.length < 2) {
    newErrors.name = '이름은 2자 이상이어야 합니다';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```
**MoneyNote 적용**: 카테고리명 중복 체크, 필수값 검증

---

## 📖 단원 3: useEffect와 생명주기

### 3.1 컴포넌트 마운트 시 데이터 로드
```typescript
useEffect(() => {
  // localStorage에서 데이터 불러오기
  const savedCategories = localStorage.getItem('moneyNote_categories');
  if (savedCategories) {
    setCategories(JSON.parse(savedCategories));
  }
}, []); // 빈 배열 = 마운트 시 한 번만 실행
```
**MoneyNote 적용**: CategoryManager에서 저장된 카테고리 불러오기

### 3.2 상태 변화 감지 및 자동 저장
```typescript
useEffect(() => {
  // categories가 변경될 때마다 localStorage에 저장
  localStorage.setItem('moneyNote_categories', JSON.stringify(categories));
}, [categories]); // categories 의존성 배열
```
**MoneyNote 적용**: 카테고리 변경 시 자동으로 브라우저에 저장

### 3.3 모달/다이얼로그 상태 초기화
```typescript
useEffect(() => {
  if (open) {
    // 모달이 열릴 때 폼 초기화
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', color: '', icon: '' });
    }
  }
}, [open, mode, initialData]);
```
**MoneyNote 적용**: CategoryForm 열 때마다 적절한 초기값 설정

---

## 📖 단원 4: TypeScript 타입 시스템

### 4.1 기본 인터페이스 정의
```typescript
interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  date: Date;
  paymentMethod: string;
  isFixed: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  subcategories: Subcategory[];
  createdAt: Date;
  updatedAt: Date;
}
```
**MoneyNote 적용**: 모든 데이터 구조를 타입으로 정의

### 4.2 컴포넌트 Props 타입
```typescript
interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category;
  mode?: 'add' | 'edit';
}
```
**MoneyNote 적용**: 모든 컴포넌트의 Props를 명확히 정의

### 4.3 Union Types와 Optional 필드
```typescript
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';
type ExpenseType = 'fixed' | 'variable';

interface ExpenseFormData {
  amount: number;
  description: string;
  categoryId: string;
  subcategoryId?: string; // 선택적 필드
  paymentMethod: PaymentMethod;
  isFixed: boolean;
  tags?: string[]; // 선택적 배열
}
```
**MoneyNote 적용**: 결제수단 선택, 지출 유형 분류

---

## 📖 단원 5: Context API와 전역 상태 관리

### 5.1 Context 생성과 Provider 설정
```typescript
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  
  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...expenseData,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  return (
    <ExpenseContext.Provider value={{ state, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};
```
**MoneyNote 적용**: 지출 데이터를 앱 전체에서 공유

### 5.2 Custom Hook으로 Context 사용
```typescript
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

// 컴포넌트에서 사용
const ExpenseList: React.FC = () => {
  const { state, addExpense, deleteExpense } = useExpenses();
  const expenses = state.expenses;
  // ...
};
```
**MoneyNote 적용**: useExpenses, useCategories 훅으로 상태 접근

---

## 📖 단원 6: 불변성과 배열/객체 업데이트

### 6.1 배열에 항목 추가
```typescript
// ❌ 원본 배열 변경 (잘못된 방법)
categories.push(newCategory);

// ✅ 새 배열 생성 (올바른 방법)
setCategories(prev => [...prev, newCategory]);
```

### 6.2 배열의 특정 항목 수정
```typescript
setCategories(prev =>
  prev.map(category =>
    category.id === editingCategory.id
      ? { ...category, ...updatedData, updatedAt: new Date() }
      : category
  )
);
```
**MoneyNote 적용**: 카테고리 수정 시 해당 카테고리만 업데이트

### 6.3 중첩된 배열 업데이트 (소분류 수정)
```typescript
setCategories(prev =>
  prev.map(category =>
    category.id === targetCategoryId
      ? {
          ...category,
          subcategories: category.subcategories.map(sub =>
            sub.id === subcategoryId
              ? { ...sub, ...updatedSubcategory }
              : sub
          )
        }
      : category
  )
);
```
**MoneyNote 적용**: 특정 대분류의 소분류 수정

---

## 📖 단원 7: Material-UI와 스타일링

### 7.1 기본 컴포넌트 사용
```tsx
import { 
  Button, TextField, Paper, Stack, Box, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';

<Paper sx={{ p: 3, borderRadius: 2 }}>
  <Stack spacing={2}>
    <TextField 
      label="카테고리명" 
      value={name}
      onChange={handleNameChange}
      error={!!errors.name}
      helperText={errors.name}
    />
    <Button variant="contained" onClick={handleSubmit}>
      저장
    </Button>
  </Stack>
</Paper>
```

### 7.2 sx prop을 활용한 스타일링
```tsx
<Box
  sx={{
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: category.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: 2
    }
  }}
>
```
**MoneyNote 적용**: 카테고리 색상 선택기, 아이콘 버튼

### 7.3 Stack vs Grid 레이아웃
```tsx
// ✅ Stack 사용 (권장)
<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
  {items.map(item => <Item key={item.id} />)}
</Stack>

// ❌ Grid 사용 (호환성 문제 발생)
<Grid container spacing={2}>
  <Grid item xs={6}>
    <Item />
  </Grid>
</Grid>
```
**MoneyNote 적용**: Day 7에서 Grid 문제 해결 후 Stack 일관 사용

---

## 📖 단원 8: 고급 패턴과 최적화

### 8.1 Container/Presentational 패턴
```typescript
// Container 컴포넌트 (로직 담당)
const CategoryManagerContainer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  
  const handleAddCategory = (data: CategoryFormData) => {
    // 비즈니스 로직
  };
  
  return (
    <CategoryManagerPresentation 
      categories={categories}
      formOpen={formOpen}
      onAddCategory={handleAddCategory}
      onOpenForm={() => setFormOpen(true)}
    />
  );
};

// Presentation 컴포넌트 (UI 담당)
const CategoryManagerPresentation: React.FC<Props> = ({
  categories, formOpen, onAddCategory, onOpenForm
}) => {
  return (
    <div>
      <button onClick={onOpenForm}>추가</button>
      {/* UI 렌더링 */}
    </div>
  );
};
```

### 8.2 상태 끌어올리기 (Lifting State Up)
```typescript
// 상위 컴포넌트에서 상태 관리
const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  return (
    <div>
      <CategoryList 
        categories={categories}
        onEditCategory={setEditingCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <CategoryForm 
        categories={categories}
        onSubmit={handleCategorySubmit}
      />
    </div>
  );
};
```
**MoneyNote 적용**: CategoryManager가 모든 하위 컴포넌트 상태 관리

### 8.3 조건부 렌더링과 빈 상태 처리
```tsx
{loading ? (
  <CircularProgress />
) : categories.length === 0 ? (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">
      카테고리가 없습니다
    </Typography>
    <Button startIcon={<AddIcon />} onClick={onAddCategory}>
      첫 카테고리 추가하기
    </Button>
  </Paper>
) : (
  <CategoryList categories={categories} />
)}
```
**MoneyNote 적용**: 빈 상태, 로딩 상태, 에러 상태 처리

---

## 📖 단원 9: 실전 적용 사례

### 9.1 실시간 미리보기 구현
```typescript
const CategoryForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
    icon: ICONS[0]
  });

  return (
    <div>
      {/* 실시간 미리보기 */}
      <Paper sx={{ 
        background: `linear-gradient(135deg, ${alpha(formData.color, 0.1)}, ${alpha(formData.color, 0.05)})`,
        border: `2px solid ${alpha(formData.color, 0.2)}`
      }}>
        <Box sx={{ backgroundColor: formData.color }}>
          {formData.icon}
        </Box>
        <Typography color={formData.color}>
          {formData.name || '카테고리명'}
        </Typography>
      </Paper>
      
      {/* 입력 폼 */}
      <TextField 
        value={formData.name}
        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
      />
    </div>
  );
};
```
**MoneyNote 적용**: 사용자가 입력하는 즉시 결과 확인 가능

### 9.2 계층형 데이터 렌더링
```tsx
const CategoryList: React.FC = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          {/* 대분류 */}
          <div onClick={() => toggleExpanded(category.id)}>
            <CategoryIcon color={category.color} />
            <span>{category.name}</span>
            {expanded.includes(category.id) ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          {/* 소분류 (접을 수 있음) */}
          <Collapse in={expanded.includes(category.id)}>
            {category.subcategories.map(sub => (
              <div key={sub.id} style={{ paddingLeft: 48 }}>
                <SubcategoryIcon color={sub.color || category.color} />
                <span>{sub.name}</span>
              </div>
            ))}
          </Collapse>
        </div>
      ))}
    </div>
  );
};
```
**MoneyNote 적용**: 대분류-소분류 계층 구조 시각화

---

## 🎓 핵심 정리

### React 핵심 개념
1. **함수형 컴포넌트** - 모든 UI를 함수로 표현
2. **Props** - 컴포넌트 간 데이터 전달
3. **useState** - 컴포넌트 내부 상태 관리
4. **useEffect** - 사이드 이펙트 처리 (API 호출, 구독 등)

### 상태 관리 패턴
1. **지역 상태** - useState로 컴포넌트 내부 관리
2. **전역 상태** - Context API로 앱 전체 공유
3. **상태 끌어올리기** - 공통 부모에서 상태 관리
4. **불변성** - 기존 객체/배열을 변경하지 않고 새로 생성

### TypeScript 활용
1. **타입 정의** - 데이터 구조를 명확히 정의
2. **인터페이스** - 컴포넌트 Props 타입 지정
3. **Union Types** - 여러 가능한 값들 중 하나
4. **Optional** - 선택적 필드 (?)

### 실전 개발 팁
1. **컴포넌트 분리** - 작고 집중된 역할로 나누기
2. **에러 처리** - 로딩, 에러, 빈 상태 고려
3. **사용자 경험** - 실시간 피드백, 직관적 UI
4. **성능 최적화** - 불필요한 리렌더링 방지

---

## 🚀 다음 학습 로드맵

MoneyNote를 완성하기 위해 추가로 학습할 개념들:

### 고급 React 패턴
- **React.memo** - 컴포넌트 메모이제이션
- **useMemo/useCallback** - 계산 결과/함수 메모이제이션
- **useReducer** - 복잡한 상태 로직 관리
- **Custom Hooks** - 로직 재사용

### 데이터 관리
- **React Query** - 서버 상태 관리
- **Zustand/Redux** - 클라이언트 상태 관리
- **Form Libraries** - React Hook Form
- **Validation** - Yup, Zod 라이브러리

### 고급 UI/UX
- **Animation** - Framer Motion
- **Drag & Drop** - react-beautiful-dnd
- **Charts** - Chart.js, Recharts
- **Mobile** - PWA, Responsive Design

---

**출근길 파이팅! 🚀** 
이 개념들이 MoneyNote에서 어떻게 실제 사용되었는지 코드로 확인해보세요!