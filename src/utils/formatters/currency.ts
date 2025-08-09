// 통화 및 숫자 포맷팅 유틸리티

export interface CurrencyFormatOptions {
  compact?: boolean; // 축약 표시 (1억 → 1.0억)
  showSymbol?: boolean; // 통화 기호 표시
  precision?: number; // 소수점 자리수
}

/**
 * 금액을 한국 통화 형식으로 포맷팅
 */
export const formatCurrency = (
  amount: number, 
  options: CurrencyFormatOptions = {}
): string => {
  const {
    compact = false,
    showSymbol = true,
    precision = 0
  } = options;

  // 축약 표시 모드 (사실상 사용 안함)
  if (compact) {
    return formatCompactCurrency(amount, showSymbol);
  }

  // 일반 표시 모드 - 항상 천단위 쉼표로만 표시
  const formatter = new Intl.NumberFormat('ko-KR', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'KRW',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });

  return formatter.format(amount);
};

/**
 * 금액을 천단위 쉼표로만 표시 (UI에서 폰트 크기 조정으로 레이아웃 처리)
 */
const formatCompactCurrency = (amount: number, showSymbol: boolean = true): string => {
  const symbol = showSymbol ? '₩' : '';
  const sign = amount < 0 ? '-' : '';
  
  return `${sign}${symbol}${Math.abs(amount).toLocaleString('ko-KR')}`;
};

/**
 * 숫자를 천 단위 구분자로 포맷팅 (1,000,000)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

/**
 * 백분율 포맷팅 (0.15 → 15.0%)
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  return `${(value * 100).toFixed(precision)}%`;
};

/**
 * 반응형 금액 표시 - 항상 천단위 쉼표로만 표시하되 UI에서 폰트 크기로 조정
 */
export const formatResponsiveCurrency = (amount: number): string => {
  // 모든 경우에 천단위 쉼표로만 표시
  return formatCurrency(amount);
};

/**
 * 큰 금액용 반응형 스타일 속성 반환
 */
export const getResponsiveCurrencyStyle = (amount: number) => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000) { // 10억 이상
    return {
      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
      fontWeight: 600,
      letterSpacing: '-0.02em'
    };
  } else if (absAmount >= 100000000) { // 1억 이상
    return {
      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
      fontWeight: 600,
      letterSpacing: '-0.01em'
    };
  } else if (absAmount >= 10000000) { // 1천만 이상
    return {
      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.75rem' },
      fontWeight: 600
    };
  } else {
    return {
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
      fontWeight: 700
    };
  }
};

/**
 * 입력 필드용 숫자 포맷팅 (쉼표 추가/제거)
 */
export const formatInputNumber = (value: string): string => {
  // 숫자가 아닌 문자 제거
  const numbers = value.replace(/[^\d]/g, '');
  
  if (!numbers) return '';
  
  // 천 단위 구분자 추가
  return parseInt(numbers).toLocaleString('ko-KR');
};

/**
 * 입력 필드에서 숫자로 변환
 */
export const parseInputNumber = (value: string): number => {
  const numbers = value.replace(/[^\d]/g, '');
  return parseInt(numbers) || 0;
};

/**
 * 컨테이너 너비에 맞는 폰트 크기 계산 (금액 길이에 따라)
 */
export const getAdaptiveFontSize = (amount: number, containerWidth: number = 200) => {
  const digitCount = Math.abs(amount).toString().length;
  const baseSize = Math.min(containerWidth / (digitCount * 0.6), 24); // 최대 24px
  
  return {
    fontSize: `${Math.max(baseSize, 12)}px`, // 최소 12px
    lineHeight: 1.2
  };
};