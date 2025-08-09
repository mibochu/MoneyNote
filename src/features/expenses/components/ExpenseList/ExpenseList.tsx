import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  TextField,
  Autocomplete
} from '@mui/material';
import { 
  FilterList as FilterIcon,
  Sort as SortIcon 
} from '@mui/icons-material';

import type { Expense, ExpenseFilter, SortOption } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import ExpenseItem from '../ExpenseItem';

export interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
  error?: string | null;
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (expenseId: string) => void;
  onExpenseSelect?: (expense: Expense) => void;
  filter?: ExpenseFilter;
  onFilterChange?: (filter: ExpenseFilter) => void;
  pageSize?: number;
  showHeader?: boolean;
  emptyMessage?: string;
}


const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  loading = false,
  error = null,
  onExpenseEdit,
  onExpenseDelete,
  onExpenseSelect,
  filter = {},
  onFilterChange,
  pageSize = 10,
  showHeader = true,
  emptyMessage = '지출 내역이 없습니다'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // 사용 가능한 카테고리 목록 생성
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    expenses.forEach(expense => {
      categorySet.add(expense.category);
      if (expense.subcategory) {
        categorySet.add(expense.subcategory);
      }
    });
    return Array.from(categorySet).sort();
  }, [expenses]);

  // 사용 가능한 태그 목록 생성
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    expenses.forEach(expense => {
      expense.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [expenses]);

  // 필터링된 지출 목록
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // 날짜 필터
    if (filter.startDate) {
      filtered = filtered.filter(expense => expense.date >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(expense => expense.date <= filter.endDate!);
    }

    // 카테고리 필터
    if (filter.category) {
      filtered = filtered.filter(expense => 
        expense.category === filter.category || expense.subcategory === filter.category
      );
    }

    // 결제수단 필터
    if (filter.paymentMethod) {
      filtered = filtered.filter(expense => expense.paymentMethod === filter.paymentMethod);
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(expense =>
        filter.tags!.some((tag: string) => expense.tags.includes(tag))
      );
    }

    // 고정지출 필터
    if (filter.isFixed !== undefined) {
      filtered = filtered.filter(expense => expense.isFixed === filter.isFixed);
    }

    return filtered;
  }, [expenses, filter]);

  // 정렬된 지출 목록
  const sortedExpenses = useMemo(() => {
    const sorted = [...filteredExpenses];

    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'date-asc':
        return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'amount-desc':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sorted;
    }
  }, [filteredExpenses, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedExpenses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + pageSize);

  // 통계 계산
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const fixedTotal = filteredExpenses
      .filter(expense => expense.isFixed)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const variableTotal = total - fixedTotal;

    return {
      total,
      count: filteredExpenses.length,
      fixedTotal,
      variableTotal,
      average: filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    };
  }, [filteredExpenses]);

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value as SortOption);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 헤더 영역 */}
      {showHeader && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              지출 목록
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterIcon />}
                onClick={toggleFilters}
                color={showFilters ? 'primary' : 'inherit'}
              >
                필터
              </Button>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>정렬</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  startAdornment={<SortIcon fontSize="small" />}
                >
                  <MenuItem value="date-desc">최신순</MenuItem>
                  <MenuItem value="date-asc">오래된순</MenuItem>
                  <MenuItem value="amount-desc">금액 높은순</MenuItem>
                  <MenuItem value="amount-asc">금액 낮은순</MenuItem>
                  <MenuItem value="category">카테고리순</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* 통계 정보 */}
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip
              label={`총 ${stats.count}건`}
              color="primary"
              variant="outlined"
              size="medium"
              sx={{ fontSize: '0.875rem', height: 36 }}
            />
            <Chip
              label={`₩${stats.total.toLocaleString()}`}
              color="secondary"
              variant="outlined"
              size="medium"
              sx={{ fontSize: '0.875rem', height: 36 }}
            />
            <Chip
              label={`고정비 ₩${stats.fixedTotal.toLocaleString()}`}
              color="error"
              size="medium"
              sx={{ fontSize: '0.875rem', height: 36 }}
            />
            <Chip
              label={`변동비 ₩${stats.variableTotal.toLocaleString()}`}
              color="info"
              size="small"
            />
          </Stack>
        </Paper>
      )}

      {/* 필터 영역 */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
            필터 옵션
          </Typography>
          
          <Stack spacing={3}>
            {/* 날짜 필터 */}
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="시작 날짜"
                type="date"
                size="small"
                sx={{ minWidth: 200 }}
                value={filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  onFilterChange?.({ ...filter, startDate: date });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="종료 날짜"
                type="date"
                size="small"
                sx={{ minWidth: 200 }}
                value={filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  onFilterChange?.({ ...filter, endDate: date });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Stack>

            {/* 기타 필터들 */}
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {/* 카테고리 필터 */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={filter.category || ''}
                  onChange={(e) => onFilterChange?.({ 
                    ...filter, 
                    category: e.target.value || undefined 
                  })}
                >
                  <MenuItem value="">전체</MenuItem>
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 결제수단 필터 */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>결제수단</InputLabel>
                <Select
                  value={filter.paymentMethod || ''}
                  onChange={(e) => onFilterChange?.({ 
                    ...filter, 
                    paymentMethod: e.target.value as any 
                  })}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="cash">현금</MenuItem>
                  <MenuItem value="card">카드</MenuItem>
                  <MenuItem value="bank">계좌이체</MenuItem>
                  <MenuItem value="digital">디지털결제</MenuItem>
                </Select>
              </FormControl>

              {/* 지출 유형 필터 */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>지출 유형</InputLabel>
                <Select
                  value={filter.isFixed === undefined ? '' : filter.isFixed.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    onFilterChange?.({ 
                      ...filter, 
                      isFixed: value === '' ? undefined : value === 'true'
                    });
                  }}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="true">고정지출</MenuItem>
                  <MenuItem value="false">변동지출</MenuItem>
                </Select>
              </FormControl>

              {/* 태그 필터 */}
              <Autocomplete
                multiple
                size="small"
                options={availableTags}
                value={filter.tags || []}
                onChange={(_event, newValue) => {
                  onFilterChange?.({ 
                    ...filter, 
                    tags: newValue.length > 0 ? newValue : undefined 
                  });
                }}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="태그"
                    placeholder="태그 선택"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Stack>

            {/* 필터 초기화 버튼 */}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                onClick={() => onFilterChange?.({})}
              >
                필터 초기화
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowFilters(false)}
              >
                필터 닫기
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* 지출 목록 */}
      {paginatedExpenses.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography color="text.secondary" variant="h5" sx={{ mb: 2 }}>
            📋 {emptyMessage}
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
            {filter && Object.keys(filter).length > 0 
              ? '필터 조건을 조정하거나 새로운 지출을 추가해보세요.' 
              : '지출 추가 버튼을 눌러 첫 번째 지출을 기록해보세요!'
            }
          </Typography>
        </Paper>
      ) : (
        <Box>
          {/* 고정지출과 변동지출을 분리하여 표시하는 옵션 */}
          {filter.isFixed === undefined && paginatedExpenses.some(e => e.isFixed) && paginatedExpenses.some(e => !e.isFixed) ? (
            <Box>
              {/* 고정지출 섹션 */}
              {paginatedExpenses.some(e => e.isFixed) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label="고정지출"
                      color="warning"
                      size="small"
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({paginatedExpenses.filter(e => e.isFixed).length}건, 
                      ₩{paginatedExpenses.filter(e => e.isFixed).reduce((sum, e) => sum + e.amount, 0).toLocaleString()})
                    </Typography>
                  </Typography>
                  <Stack spacing={1}>
                    {paginatedExpenses
                      .filter(expense => expense.isFixed)
                      .map((expense) => (
                        <ExpenseItem
                          key={expense.id}
                          expense={expense}
                          onEdit={onExpenseEdit}
                          onDelete={onExpenseDelete}
                          onClick={onExpenseSelect}
                          showDetails={false}
                          compact={false}
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* 변동지출 섹션 */}
              {paginatedExpenses.some(e => !e.isFixed) && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label="변동지출"
                      color="info"
                      size="small"
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({paginatedExpenses.filter(e => !e.isFixed).length}건, 
                      ₩{paginatedExpenses.filter(e => !e.isFixed).reduce((sum, e) => sum + e.amount, 0).toLocaleString()})
                    </Typography>
                  </Typography>
                  <Stack spacing={1}>
                    {paginatedExpenses
                      .filter(expense => !expense.isFixed)
                      .map((expense) => (
                        <ExpenseItem
                          key={expense.id}
                          expense={expense}
                          onEdit={onExpenseEdit}
                          onDelete={onExpenseDelete}
                          onClick={onExpenseSelect}
                          showDetails={false}
                          compact={false}
                        />
                      ))}
                  </Stack>
                </Box>
              )}
            </Box>
          ) : (
            <Stack spacing={1}>
              {paginatedExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={onExpenseEdit}
                  onDelete={onExpenseDelete}
                  onClick={onExpenseSelect}
                  showDetails={false}
                  compact={false}
                />
              ))}
            </Stack>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ExpenseList;