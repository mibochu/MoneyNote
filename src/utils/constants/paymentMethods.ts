// 결제수단 상수 정의

import type { PaymentMethod, SelectOption } from '../../types';

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  cash: {
    label: '현금',
    icon: '💵',
    color: '#4CAF50'
  },
  card: {
    label: '카드',
    icon: '💳',
    color: '#2196F3'
  },
  bank: {
    label: '계좌이체',
    icon: '🏦',
    color: '#FF9800'
  },
  digital: {
    label: '디지털결제',
    icon: '📱',
    color: '#9C27B0'
  },
  other: {
    label: '기타',
    icon: '❓',
    color: '#607D8B'
  }
};

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = Object.entries(PAYMENT_METHODS).map(
  ([value, { label }]) => ({
    value,
    label: `${PAYMENT_METHODS[value as PaymentMethod].icon} ${label}`
  })
);

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card';

// 결제수단별 통계 색상
export const PAYMENT_METHOD_CHART_COLORS = {
  cash: '#4CAF50',
  card: '#2196F3', 
  bank: '#FF9800',
  digital: '#9C27B0',
  other: '#607D8B'
};