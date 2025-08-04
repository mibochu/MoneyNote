# CSS-in-JS-반응형-디자인

## 🎯 학습 목표
- sx prop을 제대로 활용하는 방법을 배우자
- 테마 기반 스타일링 시스템을 이해하자
- 성능과 가독성의 균형을 맞추는 비법을 익히자

## 🤔 이걸 왜 했는가?
MoneyNote에서 여러 페이지와 컴포넌트를 만들면서 스타일링 문제가 발생했어:
1. **일관성 부족**: 각 컴포넌트마다 다른 방식으로 스타일링해서 디자인이 통일되지 않음
2. **반응형 어려움**: 모바일/데스크톱에서 다른 레이아웃을 적용하기 복잡함
3. **코드 가독성**: 복잡한 CSS 코드가 컴포넌트를 어수선하게 만듦

Material-UI를 제대로 활용해서 일관된 디자인 시스템을 만들 필요가 있었어.

## 🛠️ 어떻게 했는가?
1. **sx prop 체계화**: 테마 값 기반으로 일관된 스타일링 적용
2. **반응형 브레이크포인트**: { xs, sm, md, lg } 객체로 화면 크기별 대응
3. **CSS Grid 마스터**: MUI Grid 대신 sx prop으로 CSS Grid 직접 활용
4. **테마 시스템 구축**: 색상, 간격, 타이포그래피를 테마로 중앙화 관리
5. **성능 최적화**: 복잡한 스타일은 styled 컴포넌트로, 간단한 건 sx prop으로 분리

## 🎨 sx prop 완전 정복

### sx prop이란?
sx는 "system"의 줄임말이야. Material-UI에서 인라인 스타일을 쓰는 특별한 방법!

```typescript
// 일반 CSS
<div style={{ color: 'red', fontSize: '16px' }}>

// sx prop (더 강력해!)
<Box sx={{ color: 'error.main', fontSize: 'h6.fontSize' }}>
```

### 기본 스타일링
```typescript
<Box sx={{
  // 색상
  color: 'primary.main',        // 테마의 primary 색상
  backgroundColor: 'grey.100',   // 테마의 grey 계열
  
  // 크기
  width: '100%',
  height: 400,                  // 숫자는 자동으로 px
  
  // 간격
  padding: 2,                   // theme.spacing(2) = 16px
  margin: { top: 1, bottom: 2 }, // 방향별로 다르게
  
  // 테두리
  border: 1,                    // 1px solid
  borderColor: 'divider',       // 테마의 divider 색상
  borderRadius: 2,              // theme.shape.borderRadius * 2
}}>
```

### 반응형 스타일링
sx의 진짜 힘은 여기서 나와! 브레이크포인트별로 다른 스타일을 쉽게 적용할 수 있어.

```typescript
<Box sx={{
  // 기본값 (xs)
  fontSize: '14px',
  padding: 1,
  
  // sm 이상에서
  sm: {
    fontSize: '16px',
    padding: 2,
  },
  
  // md 이상에서
  md: {
    fontSize: '18px',
    padding: 3,
  }
}}>

// 더 간단한 방법
<Box sx={{
  fontSize: { xs: '14px', sm: '16px', md: '18px' },
  padding: { xs: 1, sm: 2, md: 3 },
}}>
```

### CSS Grid와 Flexbox 활용
```typescript
// CSS Grid 레이아웃
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',                    // 모바일: 1열
    sm: '1fr 1fr',               // 태블릿: 2열
    md: '1fr 1fr 1fr',           // 데스크톱: 3열
    lg: '1fr 1fr 1fr 1fr'        // 큰 화면: 4열
  },
  gap: { xs: 2, md: 3 },         // 간격도 반응형
  
  // 특정 그리드 아이템 설정
  '& > :first-of-type': {
    gridColumn: { xs: '1', md: '1 / 3' }  // md에서 2칸 차지
  }
}}>

// Flexbox 레이아웃
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },  // 모바일: 세로, 데스크톱: 가로
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', md: 'center' },
  gap: 2
}}>
```

## 🏗️ 실제 프로젝트 적용 사례

### AppLayout 반응형 구현
```typescript
const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',          // 전체 화면 높이
      
      // 사이드바 여백 (데스크톱만)
      '& > main': {
        marginLeft: { xs: 0, md: '240px' },
        paddingBottom: { xs: 8, md: 0 }, // 모바일에서 하단 네비 공간
        transition: 'margin-left 0.3s ease', // 부드러운 전환
      }
    }}>
      
      {/* 사이드 네비게이션 */}
      <Box sx={{
        width: 240,
        position: 'fixed',
        height: '100vh',
        display: { xs: 'none', md: 'block' }, // 모바일에서 숨김
        borderRight: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <SideNavigation />
      </Box>
      
      {/* 메인 콘텐츠 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      
      {/* 하단 네비게이션 */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' }, // 데스크톱에서 숨김
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Navigation />
      </Box>
    </Box>
  );
};
```

### Dashboard 카드 레이아웃
```typescript
// 4개 요약 카드를 반응형으로 배치
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',                    // 모바일: 세로로 쌓기
    sm: 'repeat(2, 1fr)',        // 태블릿: 2x2 격자
    md: 'repeat(4, 1fr)'         // 데스크톱: 가로로 나열
  },
  gap: 3,
  mb: 3,
  
  // 카드 애니메이션
  '& > *': {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  }
}}>
  <SummaryCard title="수입" amount={0} color="primary" />
  <SummaryCard title="지출" amount={0} color="error" />
  <SummaryCard title="저축" amount={0} color="success" />
  <SummaryCard title="예산잔액" amount={0} color="info" />
</Box>
```

### 차트와 사이드바 2:1 레이아웃
```typescript
<Box sx={{
  display: 'grid',
  gridTemplateColumns: { 
    xs: '1fr',        // 모바일: 세로로 쌓기
    md: '2fr 1fr'     // 데스크톱: 2:1 비율
  },
  gap: 3,
  
  // 모바일에서는 순서 바꾸기
  '& > :first-child': {
    order: { xs: 2, md: 1 }  // 모바일에서 차트를 아래로
  },
  '& > :last-child': {
    order: { xs: 1, md: 2 }  // 모바일에서 사이드바를 위로
  }
}}>
  <Paper sx={{ p: 3, height: 400 }}>
    {/* 차트 영역 */}
  </Paper>
  
  <Paper sx={{ p: 3, height: { xs: 200, md: 400 } }}>
    {/* 사이드바 영역 - 모바일에서는 높이 줄이기 */}
  </Paper>
</Box>
```

## 🎭 테마 기반 스타일링 시스템

### 테마 색상 활용
```typescript
// 테마에서 제공하는 색상들
<Box sx={{
  // Primary 계열
  backgroundColor: 'primary.main',      // 기본 primary 색상
  color: 'primary.contrastText',        // primary와 대비되는 텍스트 색상
  borderColor: 'primary.light',         // 밝은 primary 색상
  
  // 상태별 색상
  '&.success': { color: 'success.main' },
  '&.warning': { color: 'warning.main' },
  '&.error': { color: 'error.main' },
  
  // 그레이 계열
  backgroundColor: 'grey.50',           // 아주 밝은 회색
  borderColor: 'grey.300',              // 중간 회색
  color: 'text.secondary',              // 보조 텍스트 색상
}}>
```

### 테마 spacing 시스템
```typescript
// theme.spacing() 함수 활용
<Box sx={{
  padding: 2,        // theme.spacing(2) = 16px
  margin: 1,         // theme.spacing(1) = 8px
  marginTop: 0.5,    // theme.spacing(0.5) = 4px
  
  // 방향별 설정
  paddingX: 3,       // 좌우 padding
  paddingY: 2,       // 상하 padding
  marginLeft: 'auto', // 자동 여백
  
  // 음수값도 가능
  marginTop: -1,     // theme.spacing(-1) = -8px
}}>
```

### 커스텀 테마 값 사용
```typescript
// 테마에서 정의한 커스텀 값들
<Box sx={{
  fontSize: 'h4.fontSize',              // 테마의 h4 폰트 크기
  fontWeight: 'fontWeightBold',         // 테마의 굵은 글씨
  borderRadius: 'shape.borderRadius',   // 테마의 기본 둥근 모서리
  
  // 브레이크포인트 직접 사용
  width: { xs: '100%', [`${theme.breakpoints.up('md')}`]: '50%' }
}}>
```

## ⚡ 성능과 가독성 균형 맞추기

### 성능 최적화 팁

**1. sx prop vs styled 컴포넌트**
```typescript
// 간단한 스타일: sx prop 사용 (좋음)
<Box sx={{ p: 2, color: 'primary.main' }}>

// 복잡하거나 재사용할 스타일: styled 컴포넌트 (더 좋음)
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));
```

**2. 조건부 스타일링**
```typescript
// 좋지 않은 방법: 매번 새 객체
<Box sx={{ 
  color: isActive ? 'primary.main' : 'text.secondary' 
}}>

// 더 나은 방법: 클래스 사용
<Box 
  className={isActive ? 'active' : ''}
  sx={{ 
    color: 'text.secondary',
    '&.active': { color: 'primary.main' }
  }}
>
```

### 가독성 향상 방법

**1. 스타일 객체 분리**
```typescript
// 복잡한 스타일은 별도 변수로
const cardStyles = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: 3,
  p: 3,
  borderRadius: 2,
  boxShadow: 2
};

<Box sx={cardStyles}>
  {/* 컨텐츠 */}
</Box>
```

**2. 스타일 함수화**
```typescript
// 재사용 가능한 스타일 함수
const createCardStyle = (elevation: number) => ({
  p: 3,
  borderRadius: 2,
  boxShadow: elevation,
  transition: 'box-shadow 0.3s ease'
});

<Box sx={createCardStyle(2)}>
<Box sx={createCardStyle(4)}>
```

## 🔍 고급 sx prop 기법

### 선택자 활용
```typescript
<Box sx={{
  // 자식 요소 스타일링
  '& > *': {
    marginBottom: 2
  },
  
  // 마지막 자식은 여백 없음
  '& > *:last-child': {
    marginBottom: 0
  },
  
  // 호버 상태의 자식들
  '&:hover > *': {
    opacity: 0.8
  },
  
  // 특정 클래스 가진 자식
  '& .highlight': {
    backgroundColor: 'warning.light'
  }
}}>
```

### 미디어 쿼리 직접 사용
```typescript
<Box sx={{
  // 테마 브레이크포인트 사용
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px'
  },
  
  // 커스텀 미디어 쿼리
  '@media (max-width: 480px)': {
    padding: 1
  },
  
  // 다크모드 대응
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: 'grey.900'
  }
}}>
```

## 💡 실제 코드에서의 모범 사례

### Budget 페이지 LinearProgress 스타일링
```typescript
<LinearProgress
  variant="determinate"
  value={Math.min(budget.percentage, 100)}
  color={getStatusColor(budget.status) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
  sx={{ 
    height: 8, 
    borderRadius: 4, 
    mb: 1,
    
    // 진행률에 따른 애니메이션
    '& .MuiLinearProgress-bar': {
      transition: 'transform 0.4s ease'
    }
  }}
/>
```

### Reports 탭 컨테이너
```typescript
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' }, 
  gap: 3,
  
  // 모바일에서 스크롤 가능하게
  overflowX: { xs: 'auto', md: 'visible' },
  
  // 탭 패널들의 최소 높이 보장
  '& > *': {
    minHeight: 400
  }
}}>
```

## 🎓 핵심 정리

### 1. sx prop 활용법
- **기본 스타일**: 테마 값 활용 (`color: 'primary.main'`)
- **반응형**: 브레이크포인트 객체 (`{ xs: 값, md: 값 }`)
- **선택자**: CSS 선택자로 자식 요소 스타일링

### 2. 성능 최적화
- **간단한 스타일**: sx prop 사용
- **복잡한 스타일**: styled 컴포넌트 사용
- **조건부 스타일**: 클래스 기반 접근

### 3. 가독성 향상
- **스타일 분리**: 복잡한 스타일은 변수로
- **함수화**: 재사용 가능한 스타일 함수
- **일관성**: 테마 시스템 적극 활용

## 🚀 다음 단계
- emotion/styled 라이브러리 심화 활용
- 커스텀 테마 시스템 구축
- CSS-in-JS 성능 최적화 고급 기법