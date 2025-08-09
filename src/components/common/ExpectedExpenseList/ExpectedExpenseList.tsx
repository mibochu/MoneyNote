import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Repeat as RepeatIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ActivateIcon
} from '@mui/icons-material';

import type { ExpectedExpense } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';
import { PAYMENT_METHODS } from '../../../utils/constants/paymentMethods';
import { formatResponsiveCurrency } from '../../../utils/formatters/currency';

export interface ExpectedExpenseListProps {
  expectedExpenses: ExpectedExpense[];
  onEdit: (expense: ExpectedExpense) => void;
  onDelete: (expenseId: string) => void;
  onActivate: (expense: ExpectedExpense) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const ExpectedExpenseList: React.FC<ExpectedExpenseListProps> = ({
  expectedExpenses,
  onEdit,
  onDelete,
  onActivate,
  loading: _loading = false, // 미사용 매개변수는 _로 표시
  emptyMessage = '예상 지출이 없습니다'
}) => {
  const theme = useTheme();
  const { getCategoryById, getSubcategoryById } = useCategories();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpectedExpense | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expense: ExpectedExpense) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleEdit = () => {
    if (selectedExpense) {
      onEdit(selectedExpense);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedExpense) {
      onDelete(selectedExpense.id);
      handleMenuClose();
    }
  };

  const handleActivate = () => {
    if (selectedExpense) {
      onActivate(selectedExpense);
      handleMenuClose();
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays === -1) return '어제';
    if (diffDays > 0) return `${diffDays}일 후`;
    if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (expense: ExpectedExpense) => {
    if (expense.isActivated) return 'success';
    
    const today = new Date();
    const diffDays = Math.ceil((expense.expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error'; // 지난 날짜
    if (diffDays <= 3) return 'warning'; // 3일 이내
    return 'info'; // 여유 있음
  };

  if (expectedExpenses.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          color: 'text.secondary'
        }}
      >
        <Typography variant="h6" gutterBottom>
          📋 {emptyMessage}
        </Typography>
        <Typography variant="body2">
          예상되는 지출을 미리 등록해보세요!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {expectedExpenses.map((expense) => {
          const category = getCategoryById(expense.category);
          const subcategory = expense.subcategory ? getSubcategoryById(expense.category, expense.subcategory) : null;
          const paymentMethod = PAYMENT_METHODS[expense.paymentMethod as keyof typeof PAYMENT_METHODS];
          const statusColor = getStatusColor(expense);

          return (
            <Card
              key={expense.id}
              sx={{
                opacity: expense.isActivated ? 0.7 : 1,
                border: expense.isActivated ? `2px solid ${theme.palette.success.main}` : '1px solid',
                borderColor: expense.isActivated ? 'success.main' : 'divider',
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* 첫 번째 줄: 설명과 금액 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mr: 1,
                          textDecoration: expense.isActivated ? 'line-through' : 'none'
                        }}
                      >
                        {expense.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {expense.isActivated && (
                          <Chip
                            label="완료"
                            size="small"
                            color="success"
                            icon={<CheckIcon fontSize="small" />}
                            variant="filled"
                            sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold' }}
                          />
                        )}
                        <Typography
                          variant="h5"
                          color={expense.isActivated ? "success.main" : "primary.main"}
                          fontWeight="bold"
                          sx={{ flexShrink: 0 }}
                        >
                          {formatResponsiveCurrency(expense.amount)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 두 번째 줄: 카테고리, 결제수단, 날짜 */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <Chip
                        label={category?.name || expense.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      
                      {subcategory && (
                        <Chip
                          label={subcategory.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                      
                      <Tooltip title={paymentMethod.label}>
                        <Chip
                          label={paymentMethod.icon}
                          size="small"
                          sx={{
                            bgcolor: alpha(paymentMethod.color, 0.1),
                            color: paymentMethod.color,
                            border: `1px solid ${alpha(paymentMethod.color, 0.3)}`
                          }}
                        />
                      </Tooltip>

                      <Chip
                        label={formatDate(expense.expectedDate)}
                        size="small"
                        color={statusColor}
                        icon={<ScheduleIcon fontSize="small" />}
                        variant="filled"
                      />

                      {expense.isRecurring && (
                        <Tooltip title="매월 반복">
                          <Chip
                            label="반복"
                            size="small"
                            color="info"
                            icon={<RepeatIcon fontSize="small" />}
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Stack>

                    {/* 세 번째 줄: 태그들 */}
                    {expense.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {expense.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* 액션 버튼 */}
                  <Box sx={{ ml: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, expense)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {selectedExpense && !selectedExpense.isActivated && (
          <MenuItem onClick={handleActivate} sx={{ color: 'success.main' }}>
            <ListItemIcon>
              <ActivateIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>실제 지출로 전환</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>수정</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExpectedExpenseList;