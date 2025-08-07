# TypeScript 고급 타입 활용법

## 🎯 학습 목표
TypeScript의 Union Types, keyof 연산자, 타입 캐스팅을 실전에서 활용하여 타입 안전성을 높이고 런타임 에러를 방지하는 방법을 배우자.

## 🤔 이걸 왜 했는가?

### 25개 TypeScript 에러 발생!
```typescript
// ❌ 이런 에러들이 계속 발생
error TS7053: Element implicitly has an 'any' type
error TS7006: Parameter 'tag' implicitly has an 'any' type  
error TS2307: Cannot find module '../../types'
```

런타임에서 터지기 전에 컴파일 타임에 잡고 싶었다!

## 🛠️ 해결 과정

### 1. Union Types로 제한된 선택지 만들기
```typescript
// ✅ SortOption 타입 정의
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category';

// 이제 잘못된 값을 넣으면 컴파일 에러!
const [sortBy, setSortBy] = useState<SortOption>('date-desc');
setSortBy('wrong-value'); // ❌ 에러 발생!
```

### 2. keyof 연산자로 안전한 객체 접근
```typescript
// ❌ 문제가 있던 코드
PAYMENT_METHODS[expense.paymentMethod] // any 타입 에러

// ✅ 해결된 코드  
PAYMENT_METHODS[expense.paymentMethod as keyof typeof PAYMENT_METHODS]
```

### 3. 명시적 타입 지정으로 any 제거
```typescript
// ❌ any 타입으로 추론됨
expense.tags.map((tag, index) => (
  <Chip key={index} label={tag} />
))

// ✅ 명시적 타입 지정
expense.tags.map((tag: string, index: number) => (
  <Chip key={index} label={tag} />
))
```

## 💡 핵심 정리
- Union Types: 제한된 선택지 만들기
- keyof typeof: 객체 키 안전하게 접근하기  
- 명시적 타입: any 제거하고 안전성 확보하기

25개 에러를 모두 해결하여 100% 타입 안전한 코드 완성! 🎉