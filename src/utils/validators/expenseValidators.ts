import type { ExpenseFormData } from '../../types/expense.types';

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ExpenseFormData, string>>;
}

export interface ValidationRules {
  amount?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  description?: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  category?: {
    required?: boolean;
  };
  paymentMethod?: {
    required?: boolean;
  };
  date?: {
    minDate?: Date;
    maxDate?: Date;
    required?: boolean;
  };
}

// 기본 검증 규칙
export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  amount: {
    min: 0.01,
    max: 10000000, // 천만원
    required: true
  },
  description: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  category: {
    required: true
  },
  paymentMethod: {
    required: true
  },
  date: {
    minDate: new Date('2000-01-01'),
    maxDate: new Date(),
    required: true
  }
};

// 개별 필드 검증 함수들
export const validateAmount = (amount: number, rules: ValidationRules['amount'] = {}): string | null => {
  const { min = 0.01, max = 10000000, required = true } = rules;

  if (required && (amount === null || amount === undefined)) {
    return '금액을 입력해주세요.';
  }

  if (amount <= 0) {
    return '금액은 0보다 큰 값이어야 합니다.';
  }

  if (amount < min) {
    return `금액은 최소 ${min.toLocaleString('ko-KR')}원 이상이어야 합니다.`;
  }

  if (amount > max) {
    return `금액은 최대 ${max.toLocaleString('ko-KR')}원 이하여야 합니다.`;
  }

  return null;
};

export const validateDescription = (description: string, rules: ValidationRules['description'] = {}): string | null => {
  const { minLength = 1, maxLength = 200, required = true } = rules;

  if (required && !description?.trim()) {
    return '지출 내용을 입력해주세요.';
  }

  if (description && description.trim().length < minLength) {
    return `지출 내용은 최소 ${minLength}자 이상 입력해주세요.`;
  }

  if (description && description.length > maxLength) {
    return `지출 내용은 최대 ${maxLength}자까지 입력 가능합니다.`;
  }

  return null;
};

export const validateCategory = (category: string, rules: ValidationRules['category'] = {}): string | null => {
  const { required = true } = rules;

  if (required && !category?.trim()) {
    return '카테고리를 선택해주세요.';
  }

  return null;
};

export const validatePaymentMethod = (paymentMethod: string, rules: ValidationRules['paymentMethod'] = {}): string | null => {
  const { required = true } = rules;

  if (required && !paymentMethod) {
    return '결제수단을 선택해주세요.';
  }

  return null;
};

export const validateDate = (date: Date, rules: ValidationRules['date'] = {}): string | null => {
  const { minDate, maxDate = new Date(), required = true } = rules;

  if (required && !date) {
    return '날짜를 선택해주세요.';
  }

  if (!date || isNaN(date.getTime())) {
    return '올바른 날짜를 입력해주세요.';
  }

  if (minDate && date < minDate) {
    return `날짜는 ${minDate.toLocaleDateString('ko-KR')} 이후여야 합니다.`;
  }

  if (maxDate && date > maxDate) {
    return `날짜는 ${maxDate.toLocaleDateString('ko-KR')} 이전이어야 합니다.`;
  }

  return null;
};

// 전체 폼 검증 함수
export const validateExpenseForm = (
  formData: ExpenseFormData, 
  customRules: ValidationRules = {}
): ValidationResult => {
  const rules = { ...DEFAULT_VALIDATION_RULES, ...customRules };
  const errors: Partial<Record<keyof ExpenseFormData, string>> = {};

  // 각 필드 검증
  const amountError = validateAmount(formData.amount, rules.amount);
  if (amountError) errors.amount = amountError;

  const descriptionError = validateDescription(formData.description, rules.description);
  if (descriptionError) errors.description = descriptionError;

  const categoryError = validateCategory(formData.category, rules.category);
  if (categoryError) errors.category = categoryError;

  const paymentMethodError = validatePaymentMethod(formData.paymentMethod, rules.paymentMethod);
  if (paymentMethodError) errors.paymentMethod = paymentMethodError;

  const dateError = validateDate(formData.date, rules.date);
  if (dateError) errors.date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 실시간 검증을 위한 개별 필드 검증 함수
export const validateField = (
  fieldName: keyof ExpenseFormData,
  value: any,
  customRules: ValidationRules = {}
): string | null => {
  const rules = { ...DEFAULT_VALIDATION_RULES, ...customRules };

  switch (fieldName) {
    case 'amount':
      return validateAmount(value, rules.amount);
    case 'description':
      return validateDescription(value, rules.description);
    case 'category':
      return validateCategory(value, rules.category);
    case 'paymentMethod':
      return validatePaymentMethod(value, rules.paymentMethod);
    case 'date':
      return validateDate(value, rules.date);
    default:
      return null;
  }
};

// 특별한 검증 케이스들
export const validateBusinessExpense = (formData: ExpenseFormData): ValidationResult => {
  const customRules: ValidationRules = {
    description: {
      minLength: 5, // 사업비는 더 자세한 설명 필요
      maxLength: 300,
      required: true
    },
    amount: {
      min: 1000, // 사업비 최소 금액
      max: 50000000, // 5천만원
      required: true
    }
  };

  return validateExpenseForm(formData, customRules);
};

export const validatePersonalExpense = (formData: ExpenseFormData): ValidationResult => {
  const customRules: ValidationRules = {
    amount: {
      min: 100, // 개인비용 최소 금액
      max: 5000000, // 500만원
      required: true
    }
  };

  return validateExpenseForm(formData, customRules);
};