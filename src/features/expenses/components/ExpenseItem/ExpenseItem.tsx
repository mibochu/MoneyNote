import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  alpha,
  Collapse,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

import type { Expense } from '../../../../types';
import { PAYMENT_METHODS } from '../../../../utils/constants/paymentMethods';
import { useCategories } from '../../../../hooks/useCategories';

export interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onDuplicate?: (expense: Expense) => void;
  onClick?: (expense: Expense) => void;
  showDetails?: boolean;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (expense: Expense, selected: boolean) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
  showDetails = false,
  compact = false,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(showDetails);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const { getCategoryById, getSubcategoryById } = useCategories();

  const paymentMethodInfo = PAYMENT_METHODS[expense.paymentMethod as keyof typeof PAYMENT_METHODS];
  
  // 카테고리와 서브카테고리 이름 조회
  const category = getCategoryById(expense.category);
  const subcategory = expense.subcategory ? getSubcategoryById(expense.category, expense.subcategory) : null;
  
  const categoryName = category?.name || expense.category; // fallback to ID if not found
  const subcategoryName = subcategory?.name || expense.subcategory;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(expense);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(expense.id);
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate?.(expense);
  };

  const handleItemClick = () => {
    if (selectable && onSelect) {
      onSelect(expense, !selected);
    } else if (onClick) {
      onClick(expense);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays <= 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    // 카테고리별 색상 해시 생성
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'] as const;
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card
      sx={{
        cursor: selectable || onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: compact ? 'none' : 'translateY(-1px)'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
    >
      <CardContent sx={{ p: compact ? 1.5 : 2, '&:last-child': { pb: compact ? 1.5 : 2 } }}>
        {/* 메인 컨텐츠 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 첫 번째 줄: 설명과 금액 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="body1"
                fontWeight="medium"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mr: 1
                }}
              >
                {expense.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {expense.isFixed && (
                  <Chip
                    label="고정"
                    size="small"
                    color="warning"
                    variant="filled"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <Typography
                  variant="h6"
                  color={expense.isFixed ? "warning.dark" : "error.main"}
                  fontWeight="bold"
                  sx={{ flexShrink: 0 }}
                >
                  -₩{expense.amount.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* 두 번째 줄: 카테고리, 결제수단, 날짜 */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label={categoryName}
                size="small"
                color={getCategoryColor(expense.category)}
                variant="outlined"
                icon={<CategoryIcon fontSize="small" />}
              />
              
              <Tooltip title={paymentMethodInfo.label}>
                <Chip
                  label={paymentMethodInfo.icon}
                  size="small"
                  sx={{
                    bgcolor: alpha(paymentMethodInfo.color, 0.1),
                    color: paymentMethodInfo.color,
                    border: `1px solid ${alpha(paymentMethodInfo.color, 0.3)}`
                  }}
                />
              </Tooltip>

              <Typography variant="caption" color="text.secondary">
                {formatDate(expense.date)}
              </Typography>

              {expense.isFixed && (
                <Tooltip title="고정지출">
                  <Chip
                    label="고정"
                    size="small"
                    color="secondary"
                    variant="filled"
                    icon={<ScheduleIcon fontSize="small" />}
                  />
                </Tooltip>
              )}
            </Stack>

            {/* 세 번째 줄: 태그들 (있는 경우) */}
            {expense.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                {expense.tags.slice(0, compact ? 2 : 5).map((tag: string, index: number) => (
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
                {expense.tags.length > (compact ? 2 : 5) && (
                  <Chip
                    label={`+${expense.tags.length - (compact ? 2 : 5)}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Stack>
            )}
          </Box>

          {/* 액션 버튼들 */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            {!compact && expense.subcategory && (
              <Tooltip title={expanded ? '접기' : '자세히 보기'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                opacity: isHovered ? 1 : 0.7,
                transition: 'opacity 0.2s'
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 확장된 상세 정보 */}
        <Collapse in={expanded && !compact}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack spacing={1}>
              {expense.subcategory && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    소분류: {subcategoryName}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WalletIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {paymentMethodInfo.label}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {expense.date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </Typography>
              </Box>

              {expense.tags.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TagIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {expense.tags.map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.8rem' }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>수정</ListItemText>
        </MenuItem>
        
        {onDuplicate && (
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>복제</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ExpenseItem;